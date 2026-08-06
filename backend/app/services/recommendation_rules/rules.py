"""Concrete recommendation rules (Phase 4.5).

Every rule is small, self-contained and parameterized purely through its
``params`` dict (from RulesConfig). Rules never touch ranking logic; they only
filter, adjust scores, enforce limits or reorder the candidate list.
"""

from uuid import UUID

from .base import (
    CONSTRAIN,
    DIVERSIFY,
    SCORE,
    SUPPRESS,
    Candidate,
    RecommendationRule,
    RuleContext,
    RuleEvent,
    is_fresh,
)


def _cap(value: float, cap: float | None) -> float:
    return min(value, cap) if cap is not None else value


def _jaccard(a: list[str], b: list[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


# ── suppression ────────────────────────────────────────────

class DedupeRule(RecommendationRule):
    """Suppress the same item twice and near-duplicates (same creator + topic
    overlap above a configurable Jaccard threshold)."""

    name = "dedupe"
    phase = SUPPRESS

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        sim_min = float(self.params.get("topic_similarity_min", 0.5))
        same_creator = bool(self.params.get("same_creator_only", True))

        seen: set = set()
        for item in sorted(items, key=lambda i: i.score, reverse=True):
            if item.key in seen:
                item.excluded = True
                item.exclude_reason = "duplicate content"
                continue
            seen.add(item.key)

        kept = [i for i in items if not i.excluded and i.topics]
        for i, item in enumerate(kept):
            if item.excluded:
                continue
            for other in kept[i + 1:]:
                if other.excluded:
                    continue
                if same_creator and item.creator_id != other.creator_id:
                    continue
                if _jaccard(item.topics, other.topics) >= sim_min:
                    other.excluded = True
                    other.exclude_reason = "near-duplicate content"
                    break


class RecentlyViewedRule(RecommendationRule):
    """Suppress or down-rank content the user recently viewed."""

    name = "recently_viewed"
    phase = SUPPRESS

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        if not ctx.recently_viewed:
            return
        mode = self.params.get("mode", "exclude")
        multiplier = float(self.params.get("penalize_multiplier", 0.5))
        for item in items:
            if item.content_id in ctx.recently_viewed:
                if mode == "exclude":
                    item.excluded = True
                    item.exclude_reason = "recently viewed"
                else:
                    item.score *= multiplier


class ReportedRule(RecommendationRule):
    """Penalize (or exclude) content with active reports."""

    name = "reported"
    phase = SCORE

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        if not ctx.reported_counts:
            return
        mode = self.params.get("mode", "penalize")
        per = float(self.params.get("per_report_penalty", 0.04))
        cap_pen = float(self.params.get("max_penalty", 0.4))
        min_reports = int(self.params.get("min_reports", 1))
        for item in items:
            count = ctx.reported_counts.get(item.content_id, 0)
            if count < min_reports:
                continue
            if mode == "exclude":
                item.excluded = True
                item.exclude_reason = f"{count} active report(s)"
            else:
                item.score = max(0.0, item.score - min(count * per, cap_pen))


# ── score adjustments ──────────────────────────────────────

class FollowedCreatorBoostRule(RecommendationRule):
    """Multiply the score of content from creators the user follows."""

    name = "followed_creator_boost"
    phase = SCORE

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        if not ctx.followed_creator_ids:
            return
        multiplier = float(self.params.get("multiplier", 1.12))
        cap = self.params.get("cap_score")
        for item in items:
            if item.creator_id and item.creator_id in ctx.followed_creator_ids:
                item.followed_creator = True
                item.score = _cap(item.score * multiplier, cap)


class FreshnessBoostRule(RecommendationRule):
    """Give freshly published content a short-lived score multiplier."""

    name = "freshness_boost"
    phase = SCORE

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        hours = float(self.params.get("fresh_hours", ctx.fresh_window_hours))
        multiplier = float(self.params.get("multiplier", 1.1))
        cap = self.params.get("cap_score")
        for item in items:
            if is_fresh(item.published_at, hours):
                item.score = _cap(item.score * multiplier, cap)


def _match(item: Candidate, cond: dict, ctx: RuleContext) -> bool:
    by = cond.get("by")
    if by == "all":
        return True
    if by == "followed_creator":
        return bool(item.creator_id and item.creator_id in ctx.followed_creator_ids)
    if by == "fresh":
        return is_fresh(item.published_at, ctx.fresh_window_hours)
    if by == "reported":
        return ctx.reported_counts.get(item.content_id, 0) >= int(cond.get("min_reports", 1))
    if by == "creator":
        return str(item.creator_id) == str(cond.get("value"))
    if by == "category":
        value = cond.get("value")
        return str(item.category_id) == str(value) or item.category_name == value
    if by == "content_type":
        return item.content_type == cond.get("value")
    return False


class _GenericScoreRule(RecommendationRule):
    """Data-driven score adjustments from a config list of operations."""

    phase = SCORE
    op_name = "generic"

    def run(self, ctx: RuleContext, items: list[Candidate]) -> None:
        for item in items:
            for op in self.params.get("operations", []):
                if not _match(item, op, ctx):
                    continue
                item.score = _cap(
                    item.score * float(op.get("mul", 1.0)) + float(op.get("add", 0.0)),
                    op.get("cap"),
                )
                break


class GenericBoostRule(_GenericScoreRule):
    name = "generic_boost"
    op_name = "boost"


class GenericPenaltyRule(_GenericScoreRule):
    name = "generic_penalty"
    op_name = "penalty"


# ── limits ─────────────────────────────────────────────────

class CreatorLimitRule(RecommendationRule):
    """Cap how many items a single creator may have in the result."""

    name = "creator_limit"
    phase = CONSTRAIN

    def _max(self) -> int:
        return int(self.params.get("max_per_creator", 3))

    def allowed(self, item: Candidate, ctx: RuleContext) -> bool:
        if not item.creator_id:
            return True
        return ctx.counters.get(("creator", item.creator_id), 0) < self._max()

    def commit(self, item: Candidate, ctx: RuleContext) -> None:
        if item.creator_id:
            key = ("creator", item.creator_id)
            ctx.counters[key] = ctx.counters.get(key, 0) + 1


class CategoryLimitRule(RecommendationRule):
    """Cap how many items may come from a single category."""

    name = "category_limit"
    phase = CONSTRAIN

    def _max(self) -> int:
        return int(self.params.get("max_per_category", 4))

    def _key(self, item: Candidate):
        return item.category_id or (item.category_name.lower() if item.category_name else None)

    def allowed(self, item: Candidate, ctx: RuleContext) -> bool:
        key = self._key(item)
        if not key:
            return True
        return ctx.counters.get(("category", key), 0) < self._max()

    def commit(self, item: Candidate, ctx: RuleContext) -> None:
        key = self._key(item)
        if key:
            k = ("category", key)
            ctx.counters[k] = ctx.counters.get(k, 0) + 1


# ── diversity ──────────────────────────────────────────────

class DiversityRule(RecommendationRule):
    """Re-order survivors to avoid long runs of the same creator/category.

    A sliding window of ``window_size`` committed items; a candidate is
    deferred while the window already holds ``max_same_*`` of its creator or
    category. Falls back to the best-scoring item when nothing fits.
    """

    name = "diversity"
    phase = DIVERSIFY

    def run(self, ctx: RuleContext, items: list[Candidate]) -> list[Candidate]:
        window = int(self.params.get("window_size", 5))
        max_creator = int(self.params.get("max_same_creator_per_window", 2))
        max_category = int(self.params.get("max_same_category_per_window", 2))
        max_tries = int(self.params.get("max_reorder_tries", 1000))

        original_index = {i.key: idx for idx, i in enumerate(items)}
        remaining = list(items)
        placed: list[Candidate] = []
        creator_count: dict = {}
        category_count: dict = {}
        guard = 0

        def cat_key(item: Candidate):
            return item.category_id or (item.category_name.lower() if item.category_name else None)

        def slide() -> None:
            if len(placed) > window:
                old = placed[-(window + 1)]
                if old.creator_id:
                    creator_count[old.creator_id] = creator_count.get(old.creator_id, 0) - 1
                cat = cat_key(old)
                if cat:
                    category_count[cat] = category_count.get(cat, 0) - 1

        def fits(item: Candidate) -> bool:
            cat = cat_key(item)
            return (
                (not item.creator_id or creator_count.get(item.creator_id, 0) < max_creator)
                and (not cat or category_count.get(cat, 0) < max_category)
            )

        while remaining and guard < max_tries:
            guard += 1
            chosen = None
            for i, item in enumerate(remaining):
                if fits(item):
                    chosen = remaining.pop(i)
                    break
            if chosen is None:
                # Nothing fits the window. Fall back to the least-represented
                # candidate (fewest creator + category in window, highest score
                # on ties) so a forced placement still minimizes runs.
                idx = min(
                    range(len(remaining)),
                    key=lambda i: (
                        creator_count.get(remaining[i].creator_id, 0) if remaining[i].creator_id else 0,
                        category_count.get(cat_key(remaining[i]), 0),
                        -remaining[i].score,
                    ),
                )
                chosen = remaining.pop(idx)
            slide()
            placed.append(chosen)
            if chosen.creator_id:
                creator_count[chosen.creator_id] = creator_count.get(chosen.creator_id, 0) + 1
            cat = cat_key(chosen)
            if cat:
                category_count[cat] = category_count.get(cat, 0) + 1

        placed.extend(remaining)
        ctx.events.extend(
            RuleEvent(rule=self.name, action="reorder", content_id=item.content_id)
            for item in placed
            if original_index.get(item.key, -1) != next((i for i, x in enumerate(placed) if x.key == item.key), -1)
        )
        return placed
