from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

# Signals the rank score is built from (see core/ranking_config.py).
RANK_SIGNAL_KEYS: tuple[str, ...] = (
    "watch_time",
    "completion",
    "replay",
    "likes",
    "comments",
    "shares",
    "saves",
    "freshness",
    "popularity",
    "quality",
    "interest",
)


class RankingBreakdown(BaseModel):
    """Per-signal normalized values (0..1) and the weights used to blend them."""

    watch_time: float = 0.0
    completion: float = 0.0
    replay: float = 0.0
    likes: float = 0.0
    comments: float = 0.0
    shares: float = 0.0
    saves: float = 0.0
    freshness: float = 0.0
    popularity: float = 0.0
    quality: float = 0.0
    interest: float = 0.0
    rank_score: float = 0.0
    weights: dict[str, float] = Field(default_factory=dict)


class RankedItem(BaseModel):
    content_type: str
    content_id: UUID
    rank_score: float
    breakdown: RankingBreakdown


class RankingPreviewRequest(BaseModel):
    """Score a pool of content profiles and return them sorted by rank.

    ``user_id`` defaults to the authenticated user (personalized ranking). An
    admin may pass a different ``user_id`` to preview ranking for another user;
    leave it empty for a purely global (non-personalized) ranking.
    """

    user_id: Optional[UUID] = None
    content_type: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)


class RankingPreviewResponse(BaseModel):
    user_id: Optional[UUID] = None
    personalized: bool = False
    total: int
    items: list[RankedItem]


class RankingExplainResponse(BaseModel):
    content_type: str
    content_id: UUID
    rank_score: float
    breakdown: RankingBreakdown
