import json
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.orm import Session

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

    Collection is deliberately lightweight: events are validated, de-duplicated
    on the client id, bulk-inserted into the raw log, and view sessions are
    upserted. No recommendation or heavy join logic runs on this path.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = EventTrackingRepository(db)

    def track(self, user_id: UUID | None, items: list[EventTrackItem]) -> dict:
        """Persist a batch of events.

        Returns ``{"received": n, "duplicates": m}`` where duplicates are
        events skipped because their ``client_event_id`` was already seen.
        """
        client_ids = [i.client_event_id for i in items if i.client_event_id]
        existing = self.repo.get_existing_client_ids(client_ids) if client_ids else set()

        seen: set[str] = set()
        rows: list[dict] = []
        now = datetime.now(timezone.utc)

        for item in items:
            cid = item.client_event_id
            if cid:
                if cid in existing or cid in seen:
                    continue
                seen.add(cid)
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

        inserted = len(rows)
        if rows:
            self.repo.insert_events(rows)
            self._aggregate_view_sessions(rows)
            self.db.commit()

        return {"received": inserted, "duplicates": len(items) - inserted}

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