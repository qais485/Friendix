from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.cache import cache_key, content_set_key, get_application_cache
from app.core.cache_config import get_cache_config
from app.models import ContentEvent, ContentProfile, Follow, Report

# View-ish event types that count as "the user has seen this".
_VIEW_EVENT_TYPES = ("view_start", "watch_time", "view_percentage", "completion")
# Report statuses that are still under review / active (not dismissed).
_ACTIVE_REPORT_STATUSES = ("pending", "reviewed")


class RulesRepository:
    """Context queries for the rules engine (follows, history, reports, features)."""

    def __init__(self, db: Session):
        self.db = db
        self._cache = get_application_cache()
        self._cache_cfg = get_cache_config()

    def get_followed_creator_ids(self, user_id: UUID) -> set[UUID]:
        rows = self.db.execute(
            select(Follow.following_id).where(Follow.follower_id == user_id)
        ).all()
        return {row[0] for row in rows}

    def get_recently_viewed(self, user_id: UUID, within_hours: float) -> dict[UUID, datetime]:
        since = datetime.now(timezone.utc) - timedelta(hours=within_hours)
        rows = self.db.execute(
            select(
                ContentEvent.content_id,
                func.max(ContentEvent.occurred_at).label("last_seen"),
            )
            .where(
                ContentEvent.user_id == user_id,
                ContentEvent.event_type.in_(_VIEW_EVENT_TYPES),
                ContentEvent.occurred_at >= since,
            )
            .group_by(ContentEvent.content_id)
        ).all()
        return {content_id: last_seen for content_id, last_seen in rows}

    def get_reported_counts(
        self,
        content_ids: list[UUID],
        content_types: list[str],
    ) -> dict[UUID, int]:
        if not content_ids:
            return {}
        key = cache_key("reported", content_set_key(content_ids), ",".join(sorted(content_types)))
        cached = self._cache.get(key)
        if cached is not None:
            return {UUID(k): v for k, v in cached.items()}
        rows = self.db.execute(
            select(Report.entity_id, func.count(Report.id).label("n"))
            .where(
                Report.entity_id.in_(content_ids),
                Report.entity_type.in_(content_types),
                Report.status.in_(_ACTIVE_REPORT_STATUSES),
            )
            .group_by(Report.entity_id)
        ).all()
        result = {entity_id: n for entity_id, n in rows}
        try:
            self._cache.set(
                key,
                {str(k): v for k, v in result.items()},
                ttl_seconds=self._cache_cfg.REPORTED_TTL_SECONDS,
            )
        except Exception:
            pass
        return result

    def get_profiles(self, keys: list[tuple[str, UUID]]) -> dict[tuple[str, UUID], ContentProfile]:
        """Load content profiles for a list of (content_type, content_id) keys."""
        if not keys:
            return {}
        ids = [content_id for _, content_id in keys]
        rows = self.db.execute(
            select(ContentProfile).where(ContentProfile.content_id.in_(ids))
        ).scalars().all()
        return {(r.content_type, r.content_id): r for r in rows}
