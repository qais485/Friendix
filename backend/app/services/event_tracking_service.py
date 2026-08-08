import json
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.rate_limiter import get_rate_limiter
from app.core.tracking_config import get_tracking_config
from app.repositories.event_tracking_repository import EventTrackingRepository
from app.schemas.event_tracking import EventTrackItem

# Event types that mutate the denormalized view session aggregate.
VIEW_SESSION_EVENT_TYPES = {
    "view_start",
    "watch_time",
    "view_percentage",
    "completion",
    "skip",
    "replay",
}


class EventTrackingService:
    """Service that ingests batches of content engagement events.

    Collection is deliberately lightweight: events are validated (rate limited,
    existence checked, values sanity-checked), de-duplicated on the client id,
    bulk-inserted into the raw log, and view sessions are upserted.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = EventTrackingRepository(db)
        self.cfg = get_tracking_config()
        self.limiter = get_rate_limiter()

    def track(self, user_id: UUID | None, items: list[EventTrackItem], ip: str | None = None) -> dict:
        """Persist a batch of events.

        Returns ``{"received", "duplicates", "invalid"}`` where ``invalid``
        counts events rejected by rate limiting, existence or value-sanity
        checks (never persisted).
        """
        if not self.cfg.ENABLED or not items:
            return {"received": 0, "duplicates": 0, "invalid": len(items)}

        client_ids = [i.client_event_id for i in items if i.client_event_id]
        existing = self.repo.get_existing_client_ids(client_ids) if client_ids else set()

        seen: set[str] = set()
        rows: list[dict] = []
        invalid = 0
        now = datetime.now(timezone.utc)
        max_future = now.timestamp() + self.cfg.MAX_FUTURE_SKEW_SECONDS

        # Per-user + per-IP rate limits (sliding window, per event).
        if not self._within_rate_limits(user_id, ip, len(items)):
            return {"received": 0, "duplicates": 0, "invalid": len(items)}

        view_start_counts: dict[UUID, int] = {}
        session_ids: set[UUID] = set()

        for item in items:
            if not self._valid_event(item, now, max_future):
                invalid += 1
                continue

            cid = item.client_event_id
            if cid:
                if cid in existing or cid in seen:
                    continue
                seen.add(cid)

            # Content existence + creator spoofing check.
            rows.append(
                {
                    "client_event_id": cid,
                    "user_id": user_id,
                    "content_type": item.content_type.lower(),
                    "content_id": item.content_id,
                    "creator_id": item.creator_id,
                    "event_type": item.event_type,
                    "view_session_id": item.view_session_id,
                    "value": item.value,
                    "position_seconds": item.position_seconds,
                    "context": item.context,
                    "source": item.source,
                    "metadata_json": json.dumps(item.metadata) if item.metadata else None,
                    "occurred_at": item.occurred_at or now,
                }
            )

            if item.view_session_id:
                session_ids.add(item.view_session_id)
                if item.event_type == "view_start":
                    view_start_counts[item.view_session_id] = (
                        view_start_counts.get(item.view_session_id, 0) + 1
                    )

        # Reject batches referencing too many distinct view sessions.
        if len(session_ids) > self.cfg.MAX_DISTINCT_SESSIONS_PER_BATCH:
            return {"received": 0, "duplicates": 0, "invalid": len(items)}

        # Drop excess view_starts within a single session.
        rows, dropped = self._trim_session_view_starts(rows, view_start_counts)
        invalid += dropped

        # Drop events for content that does not exist; correct spoofed creators.
        rows, corrected_invalid = self._validate_content(rows)
        invalid += corrected_invalid

        inserted = len(rows)
        if rows:
            self.repo.insert_events(rows)
            self._aggregate_view_sessions(rows)
            self.db.commit()

        return {"received": inserted, "duplicates": len(items) - inserted - invalid, "invalid": invalid}

    def _within_rate_limits(self, user_id: UUID | None, ip: str | None, count: int) -> bool:
        cfg = self.cfg
        if user_id is not None:
            if not all(
                self.limiter.allow(f"u:{user_id}", cfg.USER_RATE_LIMIT, cfg.USER_RATE_WINDOW_SECONDS)
                for _ in range(count)
            ):
                return False
        if ip:
            if not all(
                self.limiter.allow(f"ip:{ip}", cfg.IP_RATE_LIMIT, cfg.IP_RATE_WINDOW_SECONDS)
                for _ in range(count)
            ):
                return False
        return True

    def _valid_event(self, item: EventTrackItem, now: datetime, max_future_ts: float) -> bool:
        cfg = self.cfg
        if item.occurred_at is not None:
            if item.occurred_at.timestamp() > max_future_ts:
                return False

        pos = item.position_seconds or 0.0
        if pos < 0 or pos > cfg.MAX_POSITION_SECONDS:
            return False

        value = item.value or 0.0
        event_type = item.event_type
        if event_type == "watch_time":
            if value < 0 or value > cfg.MAX_WATCH_TIME_SECONDS:
                return False
            if pos and value > pos + cfg.WATCH_TIME_POSITION_TOLERANCE:
                return False
        elif event_type == "view_percentage":
            if value < 0 or value > 100:
                return False

        if item.metadata is not None:
            try:
                size = len(json.dumps(item.metadata).encode("utf-8"))
            except (TypeError, ValueError):
                return False
            if size > cfg.MAX_METADATA_BYTES:
                return False
        return True

    def _trim_session_view_starts(self, rows: list[dict], view_start_counts: dict[UUID, int]) -> tuple[list[dict], int]:
        """Drop excess view_start events within one session (spam guard)."""
        cap = self.cfg.MAX_VIEW_STARTS_PER_SESSION
        kept: list[dict] = []
        dropped = 0
        per_session: dict[UUID, int] = {}
        for r in rows:
            sid = r["view_session_id"]
            if r["event_type"] == "view_start" and sid is not None:
                used = per_session.get(sid, 0)
                if used >= cap:
                    dropped += 1
                    continue
                per_session[sid] = used + 1
            kept.append(r)
        return kept, dropped

    def _validate_content(self, rows: list[dict]) -> tuple[list[dict], int]:
        """Drop events for non-existent content; correct spoofed creator ids."""
        by_type: dict[str, list[UUID]] = {}
        for r in rows:
            by_type.setdefault(r["content_type"], []).append(r["content_id"])

        owners: dict[tuple[str, UUID], UUID | None] = {}
        for content_type, ids in by_type.items():
            found = self.repo.get_existing_owners(content_type, list(set(ids)))
            for content_id, owner in found.items():
                owners[(content_type, content_id)] = owner

        kept: list[dict] = []
        invalid = 0
        for r in rows:
            owner = owners.get((r["content_type"], r["content_id"]))
            if owner is None:
                invalid += 1
                continue
            if r["creator_id"] is not None and r["creator_id"] != owner:
                r["creator_id"] = owner
            kept.append(r)
        return kept, invalid

    def _aggregate_view_sessions(self, rows: list[dict]) -> None:
        """Collapse view-related events in the batch into one upsert per session."""
        agg: dict[UUID, dict] = {}
        for r in rows:
            sid = r["view_session_id"]
            if sid is None or r["event_type"] not in VIEW_SESSION_EVENT_TYPES:
                continue
            session = agg.get(sid)
            if session is None:
                session = {
                    "id": sid,
                    "user_id": r["user_id"],
                    "content_type": r["content_type"],
                    "content_id": r["content_id"],
                    "creator_id": r["creator_id"],
                    "context": r["context"],
                    "source": r["source"],
                    "started_at": r["occurred_at"],
                    "last_activity_at": r["occurred_at"],
                    "watch_time_seconds": 0.0,
                    "view_percentage": 0.0,
                    "views_count": 0,
                    "replays_count": 0,
                    "completed": False,
                    "skipped": False,
                }
                agg[sid] = session

            occurred = r["occurred_at"]
            if occurred < session["started_at"]:
                session["started_at"] = occurred
            if occurred > session["last_activity_at"]:
                session["last_activity_at"] = occurred

            event_type = r["event_type"]
            value = r["value"] or 0.0
            if event_type == "view_start":
                session["views_count"] += 1
            elif event_type == "watch_time":
                session["watch_time_seconds"] += value
            elif event_type == "view_percentage":
                session["view_percentage"] = max(session["view_percentage"], value)
            elif event_type == "completion":
                session["completed"] = True
            elif event_type == "skip":
                session["skipped"] = True
            elif event_type == "replay":
                session["replays_count"] += 1

        for payload in agg.values():
            self.repo.upsert_view_session(payload)