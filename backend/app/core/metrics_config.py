"""Configurable formulas for content profile metrics.

All weights and timescales are overridable through environment variables
prefixed with ``FRIENDIX_METRICS_`` (e.g. ``FRIENDIX_METRICS_FRESHNESS_TIMESCALE_HOURS=48``
or a JSON string for the weight dicts:
``FRIENDIX_METRICS_POPULARITY_WEIGHTS='{"like": 3.0, "share": 5.0}'``).

Scores are intentionally simple, explainable formulas so ranking logic can be
tuned later without code changes:

- ``popularity_score``: exponentially decayed weighted sum of raw engagement
  events (updated incrementally from the event log).
- ``quality_score``: 0..1 weighted blend of content attributes (title, media,
  category, tags, topics).
- ``freshness_score``: 0..1 exponential decay of age since publish.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_POPULARITY_WEIGHTS: dict[str, float] = {
    "impression": 0.05,
    "view_start": 1.0,
    # Continuous beacons are ignored by default so they cannot dominate.
    "watch_time": 0.0,
    "view_percentage": 0.0,
    "completion": 1.5,
    "skip": -0.5,
    "replay": 0.7,
    "like": 2.0,
    "comment": 3.0,
    "share": 4.0,
    "save": 3.0,
    "follow_after_view": 5.0,
    "not_interested": -1.0,
    "report": -2.0,
}

DEFAULT_QUALITY_WEIGHTS: dict[str, float] = {
    "title": 0.30,
    "media": 0.25,
    "category": 0.20,
    "tags": 0.15,
    "topics": 0.10,
}


class MetricsConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_METRICS_",
        env_file=".env",
        extra="ignore",
    )

    # Popularity: strength halves after this many days without activity.
    POPULARITY_HALF_LIFE_DAYS: float = 30.0
    POPULARITY_WEIGHTS: dict[str, float] = DEFAULT_POPULARITY_WEIGHTS

    # Quality: linear blend of normalized attribute sub-scores.
    QUALITY_WEIGHTS: dict[str, float] = DEFAULT_QUALITY_WEIGHTS
    # Attribute sub-scores (0..1) used by the quality formula.
    QUALITY_TITLE_MIN_LENGTH: int = 5
    QUALITY_TAGS_TARGET: float = 5.0
    QUALITY_TOPICS_TARGET: float = 5.0

    # Freshness: freshness = exp(-age_hours / timescale). 72h -> ~0.37 at 3 days.
    FRESHNESS_TIMESCALE_HOURS: float = 72.0


@lru_cache()
def get_metrics_config() -> MetricsConfig:
    return MetricsConfig()
