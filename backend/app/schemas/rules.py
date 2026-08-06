from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.ranking import RankingBreakdown


class RuleEvent(BaseModel):
    """One decision made by a rule for a single candidate."""

    rule: str
    action: str  # boost | penalty | suppress | exclude | reorder
    reason: Optional[str] = None
    amount: float = 0.0


class RecommendedItem(BaseModel):
    """A candidate that survived the rules pipeline, ready for feed ordering."""

    content_type: str
    content_id: UUID
    creator_id: Optional[UUID] = None
    base_rank_score: float = 0.0
    final_score: float = 0.0
    followed_creator: bool = False
    breakdown: Optional[RankingBreakdown] = None
    events: list[RuleEvent] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    """Run Ranking Engine -> Rules Engine over a candidate pool.

    Personalized to the authenticated user by default; admin may pass a
    different ``user_id``. Does NOT generate the feed.
    """

    user_id: Optional[UUID] = None
    content_type: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)


class RecommendationResponse(BaseModel):
    user_id: Optional[UUID] = None
    personalized: bool = False
    total: int = 0
    kept: int = 0
    rules_applied: list[str] = Field(default_factory=list)
    items: list[RecommendedItem] = Field(default_factory=list)


class RulesInfoResponse(BaseModel):
    """Active rules + their parameter sets (transparency/ops endpoint)."""

    rules: dict[str, dict]
