"""Response schemas for the Phase 7 recommendation-performance analytics.

All metrics are derived from the Phase 1 event log (``content_events``) and the
denormalized ``view_sessions`` aggregate, enriched with content profiles and
creator info. No AI — purely explainable, rule-based aggregation.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class RateMetrics(BaseModel):
    """The headline performance metrics shared by every dashboard view."""

    views: int = 0
    sessions: int = 0
    watch_time_seconds: float = 0.0
    completions: int = 0
    completion_rate: float = 0.0
    replays: int = 0
    replay_rate: float = 0.0
    skips: int = 0
    skip_rate: float = 0.0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    impressions: int = 0
    ctr: float = 0.0
    engagement_rate: float = 0.0


class RecommendationSummaryResponse(RateMetrics):
    content_type: Optional[str] = None
    creator_id: Optional[UUID] = None
    days: int = 30


class ContentPerformanceItem(BaseModel):
    content_type: str
    content_id: UUID
    title: Optional[str] = None
    category_name: Optional[str] = None
    creator_id: Optional[UUID] = None
    views: int = 0
    watch_time_seconds: float = 0.0
    completion_rate: float = 0.0
    replay_rate: float = 0.0
    skip_rate: float = 0.0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    impressions: int = 0
    ctr: float = 0.0
    engagement_rate: float = 0.0
    engagement_score: float = 0.0


class TopPostsResponse(BaseModel):
    items: list[ContentPerformanceItem] = Field(default_factory=list)


class TrendingPostItem(ContentPerformanceItem):
    trending_score: float = 0.0


class TrendingPostsResponse(BaseModel):
    items: list[TrendingPostItem] = Field(default_factory=list)


class WatchTimePoint(BaseModel):
    date: str
    views: int = 0
    watch_time_seconds: float = 0.0
    completions: int = 0


class WatchTimeSeriesResponse(BaseModel):
    days: int
    total_watch_time_seconds: float = 0.0
    points: list[WatchTimePoint] = Field(default_factory=list)


class EngagementSeriesPoint(BaseModel):
    date: str
    views: int = 0
    impressions: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    ctr: float = 0.0
    engagement_rate: float = 0.0


class EngagementSeriesResponse(BaseModel):
    days: int
    points: list[EngagementSeriesPoint] = Field(default_factory=list)


class CreatorPerformanceItem(BaseModel):
    creator_id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    content_count: int = 0
    total_views: int = 0
    total_watch_time_seconds: float = 0.0
    completion_rate: float = 0.0
    replay_rate: float = 0.0
    skip_rate: float = 0.0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    impressions: int = 0
    ctr: float = 0.0
    engagement_rate: float = 0.0
    engagement_score: float = 0.0


class CreatorPerformanceResponse(BaseModel):
    items: list[CreatorPerformanceItem] = Field(default_factory=list)


class CreatorDetailResponse(CreatorPerformanceItem):
    top_content: list[ContentPerformanceItem] = Field(default_factory=list)


class RecommendationOverviewResponse(BaseModel):
    summary: RecommendationSummaryResponse
    top_posts: list[ContentPerformanceItem] = Field(default_factory=list)
    trending_posts: list[TrendingPostItem] = Field(default_factory=list)
    top_creators: list[CreatorPerformanceItem] = Field(default_factory=list)
