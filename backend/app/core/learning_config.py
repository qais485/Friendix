"""Configurable Learning Loop (Phase 6).

The learning loop continuously closes the feedback cycle:
  events -> user interests + content scores -> feed -> more events.

Two incremental drivers already exist (Phase 2 interests, Phase 3 metrics);
this loop schedules them on a cadence and adds a bulk interest-decay pass so
recommendations keep improving over time. All knobs are overridable through
environment variables prefixed with ``FRIENDIX_LEARNING_``.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class LearningConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_LEARNING_",
        env_file=".env",
        extra="ignore",
    )

    # Master switch for the in-process background worker.
    ENABLED: bool = False

    # Cadence of the background worker (seconds between cycles).
    RUN_INTERVAL_SECONDS: float = 300.0

    # How many of the newest items of each content type to reconcile into a
    # content profile each cycle. Acts as a safety net on top of the automatic
    # create/update/delete hooks (0 disables this pass).
    PROFILE_SYNC_RECENT: int = 50

    # Batching bounds for one cycle (keeps each pass bounded and resumable).
    INTEREST_EVENT_LIMIT: int = 2000
    INTEREST_MAX_USERS: int = 1000
    METRICS_EVENT_LIMIT: int = 5000

    # Interest decay pass.
    # A user interest is "stale" if it has not been touched (interaction or a
    # decay run) for this many days; its stored strength then halves every
    # DECAY_HALF_LIFE_DAYS until it crosses DECAY_FLOOR and is pruned.
    DECAY_STALE_AFTER_DAYS: float = 7.0
    DECAY_HALF_LIFE_DAYS: float = 30.0
    DECAY_MIN_STRENGTH: float = 0.05
    # Only decay rows that are weaker than this cap so the pass stays bounded.
    DECAY_MAX_STRENGTH: float = 100.0
    DECAY_BATCH: int = 5000


@lru_cache()
def get_learning_config() -> LearningConfig:
    return LearningConfig()