from uuid import UUID
from sqlalchemy import func, insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session
from app.models import ContentEvent, ViewSession


class EventTrackingRepository:
    """Write-optimized persistence for the content event tracking pipeline.

    The hot path is two bulk operations inside a single transaction:
      1. One multi-row INSERT into ``content_events`` (append-only raw log).
      2. One INSERT .. ON CONFLICT DO UPDATE per view session touched by the
         batch (aggregate watch time / percentage / completion).
    """

    def __init__(self, db: Session):
        self.db = db

    def get_existing_client_ids(self, client_event_ids: list[str]) -> set[str]:
        """Return the subset of client ids already persisted (for dedup)."""
        if not client_event_ids:
            return set()
        rows = self.db.execute(
            select(ContentEvent.client_event_id).where(
                ContentEvent.client_event_id.in_(client_event_ids)
            )
        ).all()
        return {r[0] for r in rows}

    def insert_events(self, rows: list[dict]) -> None:
        """Bulk insert raw events in a single statement."""
        if not rows:
            return
        self.db.execute(insert(ContentEvent), rows)

    def upsert_view_session(self, payload: dict) -> None:
        """Upsert one view session, accumulating counters in place."""
        stmt = pg_insert(ViewSession).values(**payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=[ViewSession.id],
            set_={
                "watch_time_seconds": ViewSession.watch_time_seconds
                + stmt.excluded.watch_time_seconds,
                "view_percentage": func.greatest(
                    ViewSession.view_percentage, stmt.excluded.view_percentage
                ),
                "views_count": ViewSession.views_count + stmt.excluded.views_count,
                "replays_count": ViewSession.replays_count + stmt.excluded.replays_count,
                "completed": ViewSession.completed | stmt.excluded.completed,
                "skipped": ViewSession.skipped | stmt.excluded.skipped,
                "last_activity_at": stmt.excluded.last_activity_at,
            },
        )
        self.db.execute(stmt)
