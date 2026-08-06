from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.orm import Session

from app.models import ContentEvent, ContentProfile, MetricsState

_RAW_EVENT_COLUMNS = (
    ContentEvent.id,
    ContentEvent.content_type,
    ContentEvent.content_id,
    ContentEvent.creator_id,
    ContentEvent.event_type,
    ContentEvent.occurred_at,
)


class ContentMetricsRepository:
    """Write-optimized persistence for the incremental content metrics pass."""

    def __init__(self, db: Session):
        self.db = db

    # ── watermark ──────────────────────────────────────────

    def get_or_create_state(self) -> MetricsState:
        state = self.db.execute(
            select(MetricsState).where(MetricsState.id == 1).with_for_update()
        ).scalar_one_or_none()
        if state is None:
            state = MetricsState(id=1, last_occurred_at=None, last_event_id=None)
            self.db.add(state)
            self.db.flush()
        return state

    def advance_state(self, state: MetricsState, occurred_at, event_id) -> None:
        state.last_occurred_at = occurred_at
        state.last_event_id = event_id
        state.updated_at = datetime.now(timezone.utc)

    def get_pending_events(self, last_occurred_at, last_event_id, limit: int) -> list[dict]:
        stmt = select(*_RAW_EVENT_COLUMNS)
        if last_occurred_at is not None and last_event_id is not None:
            stmt = stmt.where(
                or_(
                    ContentEvent.occurred_at > last_occurred_at,
                    and_(
                        ContentEvent.occurred_at == last_occurred_at,
                        ContentEvent.id > last_event_id,
                    ),
                )
            )
        elif last_occurred_at is not None:
            stmt = stmt.where(ContentEvent.occurred_at > last_occurred_at)
        stmt = stmt.order_by(ContentEvent.occurred_at.asc(), ContentEvent.id.asc()).limit(limit)
        rows = self.db.execute(stmt).mappings().all()
        return [dict(r) for r in rows]

    # ── profiles ───────────────────────────────────────────

    def get_profiles(self, keys: list[tuple[str, UUID]]) -> dict[tuple[str, UUID], ContentProfile]:
        if not keys:
            return {}
        expr = None
        for content_type, content_id in keys:
            cond = and_(
                ContentProfile.content_type == content_type,
                ContentProfile.content_id == content_id,
            )
            expr = cond if expr is None else or_(expr, cond)
        rows = self.db.execute(
            select(ContentProfile).where(expr).with_for_update()
        ).scalars().all()
        return {(r.content_type, r.content_id): r for r in rows}

    def refresh_freshness(self, scale_hours: float) -> int:
        """Bulk refresh freshness_score for every profile (single UPDATE)."""
        age_secs = func.extract("epoch", func.now() - ContentProfile.published_at)
        result = self.db.execute(
            update(ContentProfile).values(
                freshness_score=func.coalesce(
                    func.exp(-age_secs / 3600.0 / scale_hours),
                    0.0,
                )
            )
        )
        return result.rowcount or 0