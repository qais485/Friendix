"""Caching knobs for the recommendation / feed read path.

All values are overridable through environment variables prefixed with
``FRIENDIX_CACHE_`` (e.g. ``FRIENDIX_CACHE_ENGAGEMENT_TTL_SECONDS=15``).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class CacheConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_CACHE_",
        env_file=".env",
        extra="ignore",
    )

    # "auto": use Redis when a URL is configured and the redis package is
    # installed, in-process store otherwise. "memory" forces the in-process
    # store; "redis" requires Redis (fails over to memory on connection error).
    BACKEND: str = "auto"

    # Connection string for Redis. Falls back to the shared FRIENDIX_REDIS_URL.
    REDIS_URL: str | None = None

    # How long derived read-model values stay fresh before re-aggregating.
    ENGAGEMENT_TTL_SECONDS: float = 30.0
    INTERESTS_TTL_SECONDS: float = 60.0
    REPORTED_TTL_SECONDS: float = 30.0

    # Bound on cached entries for the in-process store.
    MAX_ITEMS: int = 10_000


@lru_cache()
def get_cache_config() -> CacheConfig:
    return CacheConfig()
