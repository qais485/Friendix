import json
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import ContentProfile, ContentEvent, ViewSession, UserInterest

# Engagement events counted per content, weighted by the same events Phase 3
# uses for popularity (likes/comments/shares/saves are the platform's key ones).
_COUNTED_EVENT_TYPES = ("like", "comment", "share", "save")
# Raw event type -> signal key consumed by the engine.
_COUNT_TO_KEY = {
    "like": "likes",
    "comment": "comments",
    "share": "shares",
    "save": "saves",
}


class RankingRepository:
    """Read surfaces for the ranking engine.

    Candidates come from ``content_profiles`` (which already carries the Phase 3
    metrics), engagement signals are aggregated on the fly from ``view_sessions``
    + ``content_events``, and personalization uses ``user_interests``.
    """

    def __init__(self, db: Session):
        self.db = db

    # ── candidates ─────────────────────────────────────────

    def list_candidate_profiles(
        self,
        content_type: str | None,
        limit: int,
        offset: int,
    ) -> tuple[int, list[ContentProfile]]:
        base = select(func.count(ContentProfile.id))
        if content_type:
            base = base.where(ContentProfile.content_type == content_type)
        total = self.db.execute(base).scalar() or 0

        stmt = select(ContentProfile)
        if content_type:
            stmt = stmt.where(ContentProfile.content_type == content_type)
        stmt = stmt.order_by(ContentProfile.published_at.desc().nullslast(), ContentProfile.id.desc())
        stmt = stmt.offset(offset).limit(limit)
        return total, list(self.db.execute(stmt).scalars().all())

    def get_profile(self, content_type: str, content_id: UUID) -> ContentProfile | None:
        return self.db.execute(
            select(ContentProfile).where(
                ContentProfile.content_type == content_type,
                ContentProfile.content_id == content_id,
            )
        ).scalar_one_or_none()

    # ── engagement signals (from view sessions + raw events) ──

    def get_engagement(self, content_ids: list[UUID]) -> dict[UUID, dict]:
        """Aggregate view + engagement counters per content id (no N+1)."""
        if not content_ids:
            return {}
        result: dict[UUID, dict] = {
            cid: {
                "views": 0,
                "watch_time_avg": 0.0,
                "completion_rate": 0.0,
                "replay_rate": 0.0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "saves": 0,
            }
            for cid in content_ids
        }

        sessions = self.db.execute(
            select(
                ViewSession.content_id,
                func.sum(ViewSession.views_count).label("views"),
                func.avg(ViewSession.watch_time_seconds).label("watch_avg"),
                func.avg(case((ViewSession.completed, 1), else_=0)).label("completion"),
                func.sum(ViewSession.replays_count).label("replays"),
            )
            .where(ViewSession.content_id.in_(content_ids))
            .group_by(ViewSession.content_id)
        ).all()

        replays: dict[UUID, int] = {}
        for content_id, views, watch_avg, completion, replay_sum in sessions:
            views = views or 0
            entry = result[content_id]
            entry["views"] = views
            entry["watch_time_avg"] = round(float(watch_avg or 0.0), 2)
            entry["completion_rate"] = round(min(1.0, float(completion or 0.0)), 4)
            replays[content_id] = replay_sum or 0
            entry["replay_rate"] = round(min(1.0, (replay_sum or 0) / views) if views else 0.0, 4)

        counts = self.db.execute(
            select(
                ContentEvent.content_id,
                ContentEvent.event_type,
                func.count(ContentEvent.id).label("n"),
            )
            .where(
                ContentEvent.content_id.in_(content_ids),
                ContentEvent.event_type.in_(_COUNTED_EVENT_TYPES),
            )
            .group_by(ContentEvent.content_id, ContentEvent.event_type)
        ).all()
        for content_id, event_type, n in counts:
            result[content_id][_COUNT_TO_KEY[event_type]] = n
        return result

    # ── personalization ────────────────────────────────────

    def get_user_interests(self, user_id: UUID, top: int = 200) -> list[tuple[str, str, float]]:
        """Return (interest_type, interest_key, strength) for a user's interests."""
        rows = self.db.execute(
            select(UserInterest.interest_type, UserInterest.interest_key, UserInterest.strength)
            .where(UserInterest.user_id == user_id, UserInterest.strength != 0)
            .order_by(UserInterest.strength.desc())
            .limit(top)
        ).all()
        return [(t, k, s) for t, k, s in rows]


def profile_features(row: ContentProfile) -> dict:
    """Flatten a ContentProfile ORM row into the dict shape the engine expects."""
    return {
        "content_type": row.content_type,
        "content_id": row.content_id,
        "creator_id": row.creator_id,
        "category_id": row.category_id,
        "category_name": row.category_name,
        "tags": json.loads(row.tags_json) if row.tags_json else [],
        "topics": json.loads(row.topics_json) if row.topics_json else [],
        "published_at": row.published_at,
        "popularity_score": row.popularity_score or 0.0,
        "quality_score": row.quality_score or 0.0,
        "freshness_score": row.freshness_score or 0.0,
    }