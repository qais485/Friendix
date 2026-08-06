"""Recommendation rules layer (Phase 4.5).

A modular business-rules pipeline that runs between the Ranking Engine and Feed
Generation: it filters, boosts/penalizes, limits and diversifies the ranked
candidate list without modifying ranking logic.
"""

from .base import (
    SUPPRESS,
    SCORE,
    CONSTRAIN,
    DIVERSIFY,
    Candidate,
    RecommendationRule,
    RuleContext,
    RuleEvent,
)
from .engine import RecommendationRulesEngine, RuleRun
from .registry import REGISTRY, build_rules

__all__ = [
    "SUPPRESS",
    "SCORE",
    "CONSTRAIN",
    "DIVERSIFY",
    "Candidate",
    "RecommendationRule",
    "RuleContext",
    "RuleEvent",
    "RecommendationRulesEngine",
    "RuleRun",
    "REGISTRY",
    "build_rules",
]
