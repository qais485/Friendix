"""Security knobs for the event tracking ingest path.

All values are overridable through environment variables prefixed with
``FRIENDIX_TRACKING_`` (e.g. ``FRIENDIX_TRACKING_USER_RATE_LIMIT=300``).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class TrackingConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_TRACKING_",
        env_file=".env",
        extra="ignore",
    )

    # Master switch for validation/rate limiting on the tracking endpoint.
    ENABLED: bool = True

    # Per-authenticated-user event rate limits (events per sliding window).
    USER_RATE_LIMIT: int = 300
    USER_RATE_WINDOW_SECONDS: float = 60.0

    # Per-IP event rate limits (guests and anonymous abuse).
    IP_RATE_LIMIT: int = 120
    IP_RATE_WINDOW_SECONDS: float = 60.0

    # Batch / payload sanity.
    MAX_DISTINCT_SESSIONS_PER_BATCH: int = 50
    MAX_VIEW_STARTS_PER_SESSION: int = 20
    MAX_METADATA_BYTES: int = 2048

    # Watch-time / position sanity (seconds).
    MAX_WATCH_TIME_SECONDS: float = 21600.0  # 6h
    MAX_POSITION_SECONDS: float = 21600.0
    # watch_time may not exceed the reported position by more than this.
    WATCH_TIME_POSITION_TOLERANCE: float = 600.0

    # Reject client timestamps this far in the future (clock skew tolerance).
    MAX_FUTURE_SKEW_SECONDS: float = 300.0


@lru_cache()
def get_tracking_config() -> TrackingConfig:
    return TrackingConfig()
