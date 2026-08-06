"""Modular ranking engine (Phase 4).

Each signal is an independent 0..1 scoring function. The engine blends them as
a weighted sum whose weights come from ``RankingConfig`` and are renormalized
so guest and personalized scores share the same scale.

Signals are deliberately rule-based and dependency-free, mirroring Phase 3's
explainable approach. Adding a signal = add a function + a key in the weights
config; no orchestration change is required.
"""

import math
from uuid import UUID

from app.core.ranking_config import RankingConfig, get_ranking_config
from app.schemas.ranking import RANK_SIGNAL_KEYS, RankingBreakdown


def _sat(rate: float, gain: float) -> float:
    """1 - exp(-rate*gain): saturating 0..1 normalization of a positive rate."""
    if rate <= 0:
        return 0.0
    return 1.0 - math.exp(-rate * gain)


def _rate(count: float, views: float) -> float:
    return (count / views) if views > 0 else 0.0


def interest_affinity(content: dict, interests: list[tuple[str, str, float]], scale: float) -> float:
    """Personalization signal in [-1, 1].

    Matches the content's category / tags / topics / creator against the user's
    interest profile. Each matched interest contributes a saturating score that
    preserves sign (a disliked matched interest lowers affinity); the sum is
    clamped to [-1, 1].
    """
    if not interests:
        return 0.0
    by_type: dict[str, dict[str, float]] = {}
    for interest_type, key, strength in interests:
        by_type.setdefault(interest_type, {})[key] = strength

    terms: list[float] = []

    def add(kind: str, keys: list[str]) -> None:
        bucket = by_type.get(kind)
        if not bucket:
            return
        for key in keys:
            strength = bucket.get(key)
            if strength is not None:
                terms.append(strength / (scale + abs(strength)))

    cat_id = content.get("category_id")
    if cat_id:
        add("category", [str(cat_id)])
    add("tag", content.get("tags") or [])
    add("topic", content.get("topics") or [])
    creator_id = content.get("creator_id")
    if creator_id:
        add("creator", [str(creator_id)])

    if not terms:
        return 0.0
    return max(-1.0, min(1.0, sum(terms)))


class RankingEngine:
    """Computes a rank score + component breakdown for a single content item."""

    def __init__(self, cfg: RankingConfig | None = None):
        self.cfg = cfg or get_ranking_config()

    # ── signals (each returns 0..1) ────────────────────────

    def signal_values(self, content: dict, engagement: dict) -> dict[str, float]:
        """Normalized per-signal values from content features + engagement dict."""
        cfg = self.cfg
        views = engagement.get("views") or 0
        return {
            # Engagement.
            "watch_time": round(_sat(engagement.get("watch_time_avg") or 0.0, 1.0 / cfg.WATCH_TIME_REF_SECONDS), 4),
            "completion": round(min(1.0, engagement.get("completion_rate") or 0.0), 4),
            "replay": round(min(1.0, (engagement.get("replay_rate") or 0.0) / cfg.REPLAY_REF), 4),
            "likes": round(_sat(_rate(engagement.get("likes") or 0, views), cfg.RATE_SATURATION), 4),
            "comments": round(_sat(_rate(engagement.get("comments") or 0, views), cfg.RATE_SATURATION), 4),
            "shares": round(_sat(_rate(engagement.get("shares") or 0, views), cfg.RATE_SATURATION), 4),
            "saves": round(_sat(_rate(engagement.get("saves") or 0, views), cfg.RATE_SATURATION), 4),
            # Content dynamics (Phase 3).
            "freshness": round(min(1.0, content.get("freshness_score") or 0.0), 4),
            "popularity": round(_sat(content.get("popularity_score") or 0.0, cfg.POPULARITY_SATURATION), 4),
            "quality": round(min(1.0, content.get("quality_score") or 0.0), 4),
            # Personalization (filled in score_item when interests are present).
            "interest": 0.0,
        }

    def score_item(
        self,
        content: dict,
        engagement: dict | None = None,
        interests: list[tuple[str, str, float]] | None = None,
    ) -> tuple[float, RankingBreakdown]:
        engagement = engagement or {}
        interests = interests or []

        values = self.signal_values(content, engagement)
        if interests:
            values["interest"] = round(
                interest_affinity(content, interests, self.cfg.AFFINITY_SCALE), 4
            )

        weights = dict(self.cfg.RANK_SIGNAL_WEIGHTS)
        # Drop signals that should not count in this context, then renormalize.
        if not interests:
            weights.pop("interest", None)
        weights = {k: round(v, 4) for k, v in weights.items()
                   if k in RANK_SIGNAL_KEYS and v != 0}
        denom = sum(weights.values()) or 1.0

        rank = sum(values[k] * w for k, w in weights.items()) / denom
        rank = round(max(0.0, min(1.0, rank)), 4)

        breakdown = RankingBreakdown(rank_score=rank, weights=weights)
        for k in RANK_SIGNAL_KEYS:
            if k not in ("rank_score", "weights"):
                setattr(breakdown, k, values[k])
        return rank, breakdown