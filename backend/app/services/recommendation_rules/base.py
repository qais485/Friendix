"""Base types and rule interface for the recommendation rules layer."""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

# Pipeline phases, in execution order. A rule declares which phase it belongs
# to; the engine runs every rule of a phase before moving to the next.
SUPPRESS = "suppress"
SCORE = "score"
CONSTRAIN = "constrain"
DIVERSIFY = "diversify"


@dataclass
class RuleEvent:
    """A single decision recorded by a rule for one candidate."""

    rule: str
    action: str          # boost | penalty | suppress | exclude | reorder
    content_id: UUID
    amount: float = 0.0
    reason: str | None = None


@dataclass
class Candidate:
    """A ranked content item being processed by the rules pipeline."""

    content_type: str
    content_id: UUID
    creator_id: UUID | None = None
    category_id: UUID | None = None
    category_name: str | None = None
    topics: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    published_at: datetime | None = None
    freshness: float = 0.0

    base_score: float = 0.0      # score coming out of the Ranking Engine.
    score: float = 0.0           # mutable working score during the pipeline.

    followed_creator: bool = False
    excluded: bool = False
    exclude_reason: str | None = None

    @property
    def key(self) -> tuple[str, UUID]:
        return (self.content_type, self.content_id)


@dataclass
class RuleContext:
    """Immutable-per-request context shared by all rules."""

    followed_creator_ids: frozenset = frozenset()
    recently_viewed: dict = field(default_factory=dict)       # content_id -> last seen
    reported_counts: dict = field(default_factory=dict)       # content_id -> count
    fresh_window_hours: float = 6.0
    events: list = field(default_factory=list)                # list[RuleEvent]

    # Running counters used by constrain (limits) rules, keyed like
    # ("creator", uuid) / ("category", str(category_id or category_name)).
    counters: dict = field(default_factory=dict)
    placed: list = field(default_factory=list)                # committed keys in order


class RecommendationRule:
    """Base class. Subclasses set `name` and `phase` and implement `run`.

    The engine calls rules by phase:
      - SUPPRESS:  may mark Candidate.excluded / exclude_reason.
      - SCORE:     may mutate Candidate.score; engine logs the delta.
      - CONSTRAIN: pure predicate via `allowed`; engine commits + bumps counters.
      - DIVERSIFY: may reorder the surviving list and return it.
    """

    name: str = "rule"
    phase: str = SCORE

    def __init__(self, params: dict | None = None):
        self.params = params or {}
        self.enabled = bool(self.params.get("enabled", True))

    def run(self, ctx: RuleContext, items: list[Candidate]) -> list[Candidate] | None:
        """Process the surviving items. Return value is only honored for the
        DIVERSIFY phase (a re-ordered list); otherwise it is ignored."""
        return None

    def allowed(self, item: Candidate, ctx: RuleContext) -> bool:
        """CONSTRAIN phase: is this item still allowed given the counters?"""
        return True

    def commit(self, item: Candidate, ctx: RuleContext) -> None:
        """CONSTRAIN phase: record this item in the counters it consumes."""
        raise NotImplementedError


def is_fresh(published_at: datetime | None, hours: float) -> bool:
    if not published_at:
        return False
    age = datetime.now(published_at.tzinfo or datetime.utcnow().astimezone()) - published_at
    return age.total_seconds() <= hours * 3600.0
