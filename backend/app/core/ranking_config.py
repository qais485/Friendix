"""Configurable formulas for the ranking engine (Phase 4).

Every signal the rank score is built from is normalized to 0..1 and combined
as a weighted, renormalized sum. Override any weight through environment
variables prefixed with ``FRIENDIX_RANKING_`` (e.g.
``FRIENDIX_RANKING_RANK_SIGNAL_WEIGHTS='{"watch_time": 0.2}'`` or
``FRIENDIX_RANKING_WATCH_TIME_REF_SECONDS=90``).

Signals:

- Engagement (derived from the raw event log / view sessions): watch_time,
  completion, replay, likes, comments, shares, saves.
- Content dynamics (precomputed by Phase 3): popularity, quality, freshness.
- Personalization: interest (affinity between the user's interest profile and
  the content's category / tags / topics / creator).

The ``interest`` weight only applies when a user with interest data is passed;
otherwise it is dropped and the remaining weights are renormalized. That keeps
guest ranking and personalized ranking on the same 0..1 scale.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Default weight of each signal in the final rank score (renormalized by sum).
DEFAULT_RANK_SIGNAL_WEIGHTS: dict[str, float] = {
    # Engagement (per-content, event derived).
    "watch_time": 0.15,
    "completion": 0.18,
    "replay": 0.05,
    "likes": 0.08,
    "comments": 0.08,
    "shares": 0.09,
    "saves": 0.07,
    # Content dynamics (precomputed content-profile metrics).
    "freshness": 0.08,
    "popularity": 0.10,
    "quality": 0.10,
    # Personalization (only applied when user interest data is available).
    "interest": 0.02,
}


class RankingConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_RANKING_",
        env_file=".env",
        extra="ignore",
    )

    RANK_SIGNAL_WEIGHTS: dict[str, float] = DEFAULT_RANK_SIGNAL_WEIGHTS

    # watch_time = 1 - exp(-avg_seconds / WATCH_TIME_REF_SECONDS).
    WATCH_TIME_REF_SECONDS: float = 60.0
    # replay = min(1, replays_per_view / REPLAY_REF).
    REPLAY_REF: float = 0.5
    # rate signal (likes/comments/shares/saves) = 1 - exp(-rate * RATE_SATURATION)
    # where rate = count / views.
    RATE_SATURATION: float = 2.0
    # popularity = 1 - exp(-popularity_score * POPULARITY_SATURATION).
    POPULARITY_SATURATION: float = 0.15
    # Interest affinity: strength / (AFFINITY_SCALE + |strength|), summed across
    # matched dimensions and clamped to [-1, 1].
    AFFINITY_SCALE: float = 3.0


@lru_cache()
def get_ranking_config() -> RankingConfig:
    return RankingConfig()
