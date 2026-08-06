from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.interest_repository import InterestRepository
from app.schemas.interest import INTEREST_TYPES, InterestItem, InterestProfileResponse
from app.services.interest_resolver import InterestResolver

# Base weight per raw event type. Negative weights reduce interest strength.
EVENT_WEIGHTS = {
    "impression": 0.1,
    "view_start": 0.4,
    "completion": 1.0,
    "skip": -0.4,
    "replay": 0.6,
    "like": 1.2,
    "comment": 1.5,
    "share": 2.0,
    "save": 1.8,
    "follow_after_view": 2.6,
    "not_interested": -2.0,
    "report": -3.0,
}
# Seconds after which a sustained watch is fully credited (caps a single delta).
WATCH_CAP_SECONDS = 300.0


def weight_for(event: dict) -> float:
    """Map a raw event to a signed interaction-strength contribution."""
    event_type = event["event_type"]
    if event_type == "watch_time":
        seconds = max(0.0, float(event.get("value") or 0.0))
        return round(min(seconds, WATCH_CAP_SECONDS) / WATCH_CAP_SECONDS, 4)
    if event_type == "view_percentage":
        pct = max(0.0, min(float(event.get("value") or 0.0), 100.0))
        if pct >= 100.0:
            return 1.0
        if pct >= 75.0:
            return 0.7
        if pct >= 50.0:
            return 0.45
        if pct >= 25.0:
            return 0.2
        return 0.0
    return float(EVENT_WEIGHTS.get(event_type, 0.0))


class InterestService:
    """Builds and maintains a per-user interest profile from raw events.

    The profile stores interaction strength across four dimensions: category,
    tag, creator, and derived topic. Feed ranking is intentionally NOT part of
    this phase.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = InterestRepository(db)
        self.resolver = InterestResolver(db)

    # ── processing ─────────────────────────────────────────

    def process_user(self, user_id: UUID, limit: int = 500) -> dict:
        """Consume the next batch of a user's events into their profile."""
        profile = self.repo.get_or_create_profile(user_id)
        events = self.repo.get_pending_events(
            user_id, profile.last_occurred_at, profile.last_event_id, limit
        )
        if not events:
            self.db.commit()
            return {
                "processed_events": 0,
                "signals_written": 0,
                "interests_updated": 0,
                "is_complete": True,
            }

        self.resolver.load(events)

        signals: list[dict] = []
        for event in events:
            dimensions = self.resolver.resolve(event)
            if not dimensions:
                continue
            delta = weight_for(event)
            if delta == 0.0:
                continue
            for interest_type, interest_key, interest_name, entity_id in dimensions:
                signals.append(
                    {
                        "event_id": event["id"],
                        "user_id": user_id,
                        "interest_type": interest_type,
                        "interest_key": interest_key,
                        "interest_name": interest_name,
                        "entity_id": entity_id,
                        "delta": delta,
                        "base_event_type": event["event_type"],
                        "occurred_at": event["occurred_at"],
                    }
                )

        updates = _aggregate_signals(signals)
        self.repo.insert_signals(signals)
        updated = self.repo.apply_interests(user_id, updates)

        last = events[-1]
        self.repo.update_watermark(profile, last["occurred_at"], last["id"])
        profile.total_interests = self.repo.count_interests(user_id)
        self.db.commit()

        return {
            "user_id": user_id,
            "processed_events": len(events),
            "signals_written": len(signals),
            "interests_updated": updated,
            "is_complete": len(events) < limit,
        }

    def process_all(self, limit_per_user: int = 500, max_users: int = 1000) -> dict:
        """Process pending events for all eligible users (scheduled job)."""
        users = self.repo.list_users_with_pending()
        result = {
            "users_processed": 0,
            "total_events": 0,
            "total_signals": 0,
            "total_interests_updated": 0,
        }
        for user_id in users:
            r = self.process_user(user_id, limit_per_user)
            result["total_events"] += r["processed_events"]
            result["total_signals"] += r["signals_written"]
            result["total_interests_updated"] += r["interests_updated"]
            result["users_processed"] += 1
            if result["users_processed"] >= max_users:
                break
        self.db.commit()
        return result

    # ── reads ──────────────────────────────────────────────

    def get_profile(self, user_id: UUID, top: int = 50) -> InterestProfileResponse:
        profile = self.repo.get_profile_row(user_id)
        rows = self.repo.list_interests(user_id, None, top)

        buckets = {t: [InterestItem.model_validate(r) for r in rows if r.interest_type == t] for t in INTEREST_TYPES}

        return InterestProfileResponse(
            user_id=user_id,
            computed_at=profile.computed_at if profile else None,
            total_interests=profile.total_interests if profile else len(rows),
            version=profile.version if profile else 1,
            categories=buckets["category"],
            tags=buckets["tag"],
            creators=buckets["creator"],
            topics=buckets["topic"],
        )


def _aggregate_signals(signals: list[dict]) -> list[dict]:
    """Collapse per (type, key) signal rows into one update each."""
    agg: dict[tuple, dict] = {}
    for s in signals:
        key = (s["interest_type"], s["interest_key"])
        entry = agg.get(key)
        if entry is None:
            entry = {
                "interest_type": s["interest_type"],
                "interest_key": s["interest_key"],
                "interest_name": s["interest_name"],
                "entity_id": s["entity_id"],
                "delta_sum": 0.0,
                "positive_signals": 0,
                "negative_signals": 0,
                "total_signals": 0,
                "occurred_at": s["occurred_at"],
            }
            agg[key] = entry
        entry["delta_sum"] = round(entry["delta_sum"] + s["delta"], 4)
        entry["total_signals"] += 1
        if s["delta"] >= 0:
            entry["positive_signals"] += 1
        else:
            entry["negative_signals"] += 1
        if (s["occurred_at"] or entry["occurred_at"]) is not None and (
            s["occurred_at"] is None or s["occurred_at"] > entry["occurred_at"]
        ):
            entry["occurred_at"] = s["occurred_at"]
    return list(agg.values())