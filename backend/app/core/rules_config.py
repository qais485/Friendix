"""Configurable recommendation rules (Phase 4.5).

A business rules layer that runs AFTER the Ranking Engine and BEFORE Feed
Generation. It re-scores, filters, limits and diversifies the ranked candidate
list without touching ranking logic.

All rules live in ``RULES``; each entry is a named parameter dict. The engine
instantiates rules from a registry keyed by the same names, honoring both the
``RULES["<name>"]["enabled"]`` flag and the ``ENABLED_RULES`` allow-list.
Overriding the whole parameter set via env:
``FRIENDIX_RULES_RULES='{"creator_limit": {"enabled": true, "max_per_creator": 2}}'``
or individual scalars like ``FRIENDIX_RULES_ENABLED_RULES='["dedupe"]'``.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Default parameter set for every rule (each dict is merged with env overrides).
DEFAULT_RULES: dict[str, dict] = {
    # ── suppression (remove items) ─────────────────────────
    "dedupe": {
        "enabled": True,
        # Near-duplicate = same creator + overlapping topics >= threshold.
        "topic_similarity_min": 0.5,
        "same_creator_only": True,
    },
    "recently_viewed": {
        "enabled": True,
        "window_hours": 72,
        # "exclude" removes the item, "penalize" multiplies its score down.
        "mode": "exclude",
        "penalize_multiplier": 0.5,
    },
    # ── score adjustments (re-rank) ────────────────────────
    "reported": {
        "enabled": True,
        # "penalize" subtracts per_report_penalty per active report (capped),
        # "exclude" removes content with >= min_reports active reports.
        "mode": "penalize",
        "per_report_penalty": 0.04,
        "max_penalty": 0.4,
        "min_reports": 1,
    },
    "followed_creator_boost": {
        "enabled": True,
        "multiplier": 1.12,
        "cap_score": 1.0,
    },
    "freshness_boost": {
        "enabled": True,
        "fresh_hours": 6,
        "multiplier": 1.1,
        "cap_score": 1.0,
    },
    "generic_boost": {
        "enabled": False,
        # Ordered data-driven operations; the first match wins.
        # cond keys: all | followed_creator | fresh | reported | creator |
        #            category | content_type  (value only for the last three).
        "operations": [
            {"by": "followed_creator", "mul": 1.1, "add": 0.0},
            {"by": "category", "value": "Food", "add": 0.05},
        ],
    },
    "generic_penalty": {
        "enabled": False,
        "operations": [
            {"by": "content_type", "value": "story", "mul": 0.9},
        ],
    },
    # ── limits (hard caps per bucket) ──────────────────────
    "creator_limit": {
        "enabled": True,
        "max_per_creator": 3,
    },
    "category_limit": {
        "enabled": True,
        "max_per_category": 4,
    },
    # ── diversity (re-order) ───────────────────────────────
    "diversity": {
        "enabled": True,
        # Slide a window of this many committed items; a candidate is deferred
        # while the window already holds >= max_same_* of its creator/category.
        "window_size": 5,
        "max_same_creator_per_window": 2,
        "max_same_category_per_window": 2,
        "max_reorder_tries": 1000,
    },
}


class RulesConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FRIENDIX_RULES_",
        env_file=".env",
        extra="ignore",
    )

    RULES: dict[str, dict] = DEFAULT_RULES
    # Optional allow-list; when set only these rule names are instantiated.
    ENABLED_RULES: list[str] = []


@lru_cache()
def get_rules_config() -> RulesConfig:
    return RulesConfig()
