"""The recommendation rules pipeline (Phase 4.5).

Runs AFTER the Ranking Engine and BEFORE Feed Generation. It takes the ranked
candidate list plus per-user context and returns the surviving candidates in
final order, recording every decision as a RuleEvent for transparency.

Pipeline (fixed phase order):
  1. SUPPRESS   — rules that filter (dedupe, recently viewed).
  2. SCORE      — rules that adjust scores (boosts / penalties).
  3. CONSTRAIN  — per-bucket hard limits (creator / category caps).
  4. DIVERSIFY  — final re-order to break monotone runs.
"""

from dataclasses import dataclass, field

from app.core.rules_config import RulesConfig, get_rules_config

from .base import (
    CONSTRAIN,
    DIVERSIFY,
    SCORE,
    SUPPRESS,
    Candidate,
    RecommendationRule,
    RuleContext,
    RuleEvent,
)
from .registry import build_rules


@dataclass
class RuleRun:
    kept: list[Candidate] = field(default_factory=list)
    excluded: list[Candidate] = field(default_factory=list)
    events: list[RuleEvent] = field(default_factory=list)
    active_rules: list[str] = field(default_factory=list)


class RecommendationRulesEngine:
    """Stateless pipeline over a ranked candidate list."""

    def __init__(self, config: RulesConfig | None = None):
        self.config = config or get_rules_config()
        self.rules: list[RecommendationRule] = build_rules(self.config)

    @property
    def active_rule_names(self) -> list[str]:
        return [r.name for r in self.rules]

    # ── pipeline ───────────────────────────────────────────

    def apply(self, candidates: list[Candidate], ctx: RuleContext | None = None) -> RuleRun:
        ctx = ctx or RuleContext()
        run = RuleRun(active_rules=self.active_rule_names)

        # Phase 1: suppression.
        for rule in self.rules:
            if rule.phase != SUPPRESS:
                continue
            rule.run(ctx, candidates)

        # Phase 2: score adjustments.
        for rule in self.rules:
            if rule.phase != SCORE:
                continue
            for item in candidates:
                if item.excluded:
                    continue
                before = item.score
                rule.run(ctx, [item])
                if abs(item.score - before) > 1e-9:
                    ctx.events.append(
                        RuleEvent(
                            rule=rule.name,
                            action="boost" if item.score > before else "penalty",
                            content_id=item.content_id,
                            amount=round(item.score - before, 4),
                            reason=item.exclude_reason,
                        )
                    )

        # Drop suppressed / excluded so far.
        survivors = [i for i in candidates if not i.excluded]
        run.excluded = [i for i in candidates if i.excluded]

        # Order by working score before applying limits.
        survivors.sort(key=lambda i: i.score, reverse=True)

        # Phase 3: hard limits (creator / category caps).
        limit_rules = [r for r in self.rules if r.phase == CONSTRAIN]
        if limit_rules:
            final: list[Candidate] = []
            for item in survivors:
                blocked = next(
                    (r for r in limit_rules if not r.allowed(item, ctx)),
                    None,
                )
                if blocked is not None:
                    item.excluded = True
                    item.exclude_reason = f"{blocked.name} limit"
                    run.excluded.append(item)
                    continue
                for r in limit_rules:
                    r.commit(item, ctx)
                final.append(item)
            survivors = final

        # Phase 4: diversity re-order (final order is whatever it returns).
        for rule in self.rules:
            if rule.phase == DIVERSIFY:
                survivors = rule.run(ctx, survivors) or survivors

        run.kept = survivors
        run.events = ctx.events
        return run
