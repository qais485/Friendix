from sqlalchemy.orm import Session

from app.core.learning_config import get_learning_config
from app.repositories.learning_loop_repository import LearningLoopRepository
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.services.content_metrics_service import ContentMetricsService
from app.services.content_profile_service import ContentProfileService
from app.services.interest_service import InterestService


class LearningLoopService:
    """Continuously reconciles events into interests + content scores.

    A single "cycle" runs three bounded, resumable passes in one session:
      1. Interest profile updates (Phase 2) — events -> decaying interests.
      2. Content metrics updates (Phase 3) - popularity/freshness on profiles.
      3. Bulk interest decay - fades stale interests between interactions.

    Each pass advances its own watermark inside the same transaction (the
    interest/metrics repositories use per-{user,event} watermarks), so work is
    never re-done and batches stay small — the loop scales by simply being
    called more often or by raising the configured batch bounds.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = LearningLoopRepository(db)
        self.config = get_learning_config()
        self.interests = InterestService(db)
        self.metrics = ContentMetricsService(db)

    def run_cycle(self) -> dict:
        """Executes one full learning cycle and records its telemetry."""
        cfg = self.config

        # 1) User interests from raw events (incremental per-user watermark).
        interest = self.interests.process_all(
            limit_per_user=cfg.INTEREST_EVENT_LIMIT,
            max_users=cfg.INTEREST_MAX_USERS,
        )
        self.repo.record_interests_run(
            processed_events=interest["total_events"],
            signals_written=interest["total_signals"],
        )

        # 2) Content metrics (popularity / freshness) from the event log.
        metrics = self.metrics.process_recent(cfg.METRICS_EVENT_LIMIT)
        self.repo.record_metrics_run(
            processed_events=metrics["processed_events"],
            profiles_updated=metrics["profiles_updated"],
        )

        # 3) Decay stale interests so old topics fade and new ones surface.
        rows_decayed, removed = self.repo.decay_stale_interests(
            stale_after_days=cfg.DECAY_STALE_AFTER_DAYS,
            half_life_days=cfg.DECAY_HALF_LIFE_DAYS,
            min_strength=cfg.DECAY_MIN_STRENGTH,
            max_strength=cfg.DECAY_MAX_STRENGTH,
            batch=cfg.DECAY_BATCH,
        )
        self.repo.record_decay_run(rows_decayed=rows_decayed, removed=removed)

        # 4) Profile sync safety net: reconcile the newest content of each type
        #    so profiles exist even if a create/update/delete hook was missed.
        profiles_synced = self._sync_recent_profiles(cfg.PROFILE_SYNC_RECENT)

        self.db.commit()

        return {
            "interests": interest,
            "metrics": metrics,
            "decay": {"rows_decayed": rows_decayed, "rows_removed": removed},
            "profiles_synced": profiles_synced,
        }

    def _sync_recent_profiles(self, limit: int) -> int:
        if not limit:
            return 0
        total = 0
        for content_type in CONTENT_PROFILE_TYPES:
            total += ContentProfileService(self.db).build_recent(content_type, limit)
        return total

    def run_decay_only(self) -> dict:
        """Run only the interest-decay pass (used for maintenance)."""
        cfg = self.config
        decayed, removed = self.repo.decay_stale_interests(
            stale_after_days=cfg.DECAY_STALE_AFTER_DAYS,
            half_life_days=cfg.DECAY_HALF_LIFE_DAYS,
            min_strength=cfg.DECAY_MIN_STRENGTH,
            max_strength=cfg.DECAY_MAX_STRENGTH,
            batch=cfg.DECAY_BATCH,
        )
        self.repo.record_decay_run(decayed, removed)
        self.db.commit()
        return {"rows_decayed": decayed, "rows_removed": removed}

    def get_status(self) -> dict:
        state = self.repo.get_state()
        if state is None:
            return {
                "initialized": False,
                "interests": None,
                "metrics": None,
                "decay": None,
            }
        return {
            "initialized": True,
            "interests": {
                "last_run_at": state.interests_last_run_at,
                "total_events": state.interests_total_events,
                "total_signals": state.interests_total_signals,
                "version": state.interests_version,
            },
            "metrics": {
                "last_run_at": state.metrics_last_run_at,
                "total_events": state.metrics_total_events,
                "profiles_updated": state.metrics_profiles_updated,
            },
            "decay": {
                "last_run_at": state.decay_last_run_at,
                "rows_decayed": state.decay_total_rows,
                "rows_removed": state.decay_removed,
            },
        }