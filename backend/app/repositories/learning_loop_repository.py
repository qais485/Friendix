from datetime import datetime, timedelta, timezone

from sqlalchemy import Numeric, and_, delete, func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models import LearningLoopState, UserInterest


class LearningLoopRepository:
    """Persistence for the Phase 6 learning loop.

    Owns the single-row ``learning_loop_state`` control/telemetry row and the
    bulk interest-decay pass. Decay is incremental: each row's decay anchor is
    the later of ``last_decayed_at`` / ``last_interaction_at``, so running the
    pass repeatedly can never double-decay an interest.
    """

    def __init__(self, db: Session):
        self.db = db

    # ── state ──────────────────────────────────────────────

    def get_or_create_state(self) -> LearningLoopState:
        stmt = pg_insert(LearningLoopState).values(id=1).on_conflict_do_nothing(
            index_elements=[LearningLoopState.id]
        )
        self.db.execute(stmt)
        self.db.flush()
        return self.db.execute(
            select(LearningLoopState)
            .where(LearningLoopState.id == 1)
            .with_for_update()
        ).scalar_one()

    def get_state(self) -> LearningLoopState | None:
        return self.db.execute(
            select(LearningLoopState).where(LearningLoopState.id == 1)
        ).scalar_one_or_none()

    def record_interests_run(self, processed_events: int, signals_written: int) -> None:
        state = self.get_or_create_state()
        state.interests_last_run_at = datetime.now(timezone.utc)
        state.interests_total_events += processed_events
        state.interests_total_signals += signals_written
        state.interests_version += 1

    def record_metrics_run(self, processed_events: int, profiles_updated: int) -> None:
        state = self.get_or_create_state()
        state.metrics_last_run_at = datetime.now(timezone.utc)
        state.metrics_total_events += processed_events
        state.metrics_profiles_updated += profiles_updated

    def record_decay_run(self, rows_decayed: int, removed: int) -> None:
        state = self.get_or_create_state()
        state.decay_last_run_at = datetime.now(timezone.utc)
        state.decay_total_rows += rows_decayed
        state.decay_removed += removed

    # ── bulk decay pass ────────────────────────────────────

    def decay_stale_interests(
        self,
        *,
        stale_after_days: float,
        half_life_days: float,
        min_strength: float,
        max_strength: float,
        batch: int,
    ) -> tuple[int, int]:
        """Decay stale interests in bulk, then prune noise.

        Returns ``(rows_decayed, rows_removed)``. A row is stale when its decay
        anchor (last decay or last interaction, whichever is later) is older
        than ``stale_after_days``; its strength is multiplied by a half-life
        decay factor and the anchor is advanced so the next pass is fresh work.
        """
        now = datetime.now(timezone.utc)
        anchor = func.coalesce(UserInterest.last_decayed_at, UserInterest.last_interaction_at)
        age_days = func.extract("epoch", func.now() - anchor) / 86400.0
        factor = func.power(0.5, age_days / half_life_days)

        # PostgreSQL does not support UPDATE ... LIMIT. Bound the batch with a
        # correlated id subquery (oldest-decayed first) instead of .limit().
        stale_pred = and_(
            anchor < now - timedelta(days=stale_after_days),
            UserInterest.strength != 0,
            UserInterest.strength < max_strength,
        )
        candidate_ids = (
            select(UserInterest.id)
            .where(stale_pred)
            .order_by(anchor.asc())
            .limit(batch)
        )
        decayed = self.db.execute(
            update(UserInterest)
            .where(UserInterest.id.in_(candidate_ids))
            .values(
                strength=func.round(
                    func.cast(UserInterest.strength * factor, Numeric), 4
                ),
                last_decayed_at=now,
                updated_at=now,
            )
        )
        rows_decayed = decayed.rowcount or 0

        removed = 0
        if min_strength > 0:
            removed_result = self.db.execute(
                delete(UserInterest).where(
                    and_(
                        UserInterest.strength != 0,
                        UserInterest.strength < min_strength,
                    )
                )
            )
            removed = removed_result.rowcount or 0

        return rows_decayed, removed
