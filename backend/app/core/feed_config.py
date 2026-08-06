"""Configurable Feed Generator (Phase 5).

The feed generator composes the already-built pipeline — candidate generation,
Ranking Engine, duplicate removal (dedupe rule) and the recommendation rules —
then applies cursor-based pagination over the final ordered list.

All knobs live here under the ``FRIENDIX_FEED_`` env prefix. Override via env:
``FRIENDIX_FEED_CANDIDATE_POOL_SIZE=1000`` or a whole block in ``.env``.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class FeedConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_FEED_",
        env_file=".env",
        extra="ignore",
    )

    # Max candidates pulled from content_profiles and run through Ranking +
    # Rules per feed request, BEFORE cursor pagination is applied. Keeping this
    # bounded avoids re-ranking the whole catalog on every page load.
    CANDIDATE_POOL_SIZE: int = 500

    # Default / maximum page size (per-request limit still bounded by these).
    DEFAULT_LIMIT: int = 20
    MAX_LIMIT: int = 50


@lru_cache()
def get_feed_config() -> FeedConfig:
    return FeedConfig()
