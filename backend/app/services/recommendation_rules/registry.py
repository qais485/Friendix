"""Rule registry: name -> class, plus pipeline assembly.

Adding a new rule = write a RecommendationRule subclass, register it here, and
give it a parameter block in RulesConfig. No engine changes required.
"""

from app.core.rules_config import RulesConfig

from .base import CONSTRAIN, DIVERSIFY, SCORE, SUPPRESS, RecommendationRule
from .rules import (
    CategoryLimitRule,
    CreatorLimitRule,
    DedupeRule,
    DiversityRule,
    FollowedCreatorBoostRule,
    FreshnessBoostRule,
    GenericBoostRule,
    GenericPenaltyRule,
    RecentlyViewedRule,
    ReportedRule,
)

# Ordered so that, within a phase, the sequence is deterministic.
REGISTRY: dict[str, type[RecommendationRule]] = {
    "dedupe": DedupeRule,
    "recently_viewed": RecentlyViewedRule,
    "reported": ReportedRule,
    "followed_creator_boost": FollowedCreatorBoostRule,
    "freshness_boost": FreshnessBoostRule,
    "generic_boost": GenericBoostRule,
    "generic_penalty": GenericPenaltyRule,
    "creator_limit": CreatorLimitRule,
    "category_limit": CategoryLimitRule,
    "diversity": DiversityRule,
}

_PHASE_ORDER = {SUPPRESS: 0, SCORE: 1, CONSTRAIN: 2, DIVERSIFY: 3}


def build_rules(config: RulesConfig) -> list[RecommendationRule]:
    """Instantiate the active rules in pipeline order (respecting config)."""
    allow = set(config.ENABLED_RULES) if config.ENABLED_RULES else None
    rules: list[RecommendationRule] = []
    for name, cls in REGISTRY.items():
        if allow is not None and name not in allow:
            continue
        rule = cls(config.RULES.get(name) or {})
        if not rule.enabled:
            continue
        rules.append(rule)
    rules.sort(key=lambda r: _PHASE_ORDER[r.phase])
    return rules
