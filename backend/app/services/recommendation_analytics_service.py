"""Service layer for the Phase 7 recommendation-performance analytics.

Thin composition over ``RecommendationAnalyticsRepository``: each method pulls
a windowed aggregate and returns a typed response. No AI — rule-based SQL.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.recommendation_analytics_repository import RecommendationAnalyticsRepository
from app.schemas.recommendation_analytics import (
    ContentPerformanceItem,
    CreatorDetailResponse,
    CreatorPerformanceItem,
    CreatorPerformanceResponse,
    EngagementSeriesResponse,
    RecommendationOverviewResponse,
    RecommendationSummaryResponse,
    TopPostsResponse,
    TrendingPostItem,
    TrendingPostsResponse,
    WatchTimeSeriesResponse,
)

DEFAULT_LIMIT = 20
MAX_LIMIT = 100


class RecommendationAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RecommendationAnalyticsRepository(db)

    def summary(
        self,
        days: int,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> RecommendationSummaryResponse:
        data = self.repo.get_summary(self.repo.since(days), content_type, creator_id)
        return RecommendationSummaryResponse(days=days, content_type=content_type, creator_id=creator_id, **data)

    def top_posts(
        self,
        days: int,
        limit: int = DEFAULT_LIMIT,
        content_type: str | None = None,
        offset: int = 0,
    ) -> TopPostsResponse:
        rows = self.repo.get_content_performances(
            self.repo.since(days), limit, content_type=content_type, offset=offset
        )
        return TopPostsResponse(items=[ContentPerformanceItem(**r) for r in rows])

    def trending_posts(
        self,
        days: int,
        limit: int = DEFAULT_LIMIT,
        content_type: str | None = None,
    ) -> TrendingPostsResponse:
        rows = self.repo.get_trending(self.repo.since(days), limit, content_type=content_type)
        return TrendingPostsResponse(items=[TrendingPostItem(**r) for r in rows])

    def watch_time(
        self,
        days: int,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> WatchTimeSeriesResponse:
        total, points = self.repo.get_watch_time_series(
            self.repo.since(days), content_type, creator_id
        )
        return WatchTimeSeriesResponse(days=days, total_watch_time_seconds=total, points=points)

    def engagement_series(
        self,
        days: int,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> EngagementSeriesResponse:
        points = self.repo.get_engagement_series(
            self.repo.since(days), content_type, creator_id
        )
        return EngagementSeriesResponse(days=days, points=points)

    def creators(
        self,
        days: int,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> CreatorPerformanceResponse:
        rows = self.repo.get_creator_performances(self.repo.since(days), limit, offset)
        return CreatorPerformanceResponse(items=[CreatorPerformanceItem(**r) for r in rows])

    def creator_detail(self, creator_id: UUID, days: int, limit: int = 10) -> CreatorDetailResponse | None:
        rows = self.repo.get_creator_performances(self.repo.since(days), limit=1, creator_id=creator_id)
        if not rows:
            return None
        match = rows[0]
        top = self.repo.get_content_performances(self.repo.since(days), limit, creator_id=creator_id)
        match["top_content"] = [ContentPerformanceItem(**r) for r in top]
        return CreatorDetailResponse(**match)

    def overview(
        self,
        days: int,
        content_type: str | None = None,
    ) -> RecommendationOverviewResponse:
        summary = self.summary(days, content_type)
        top_rows = self.repo.get_content_performances(self.repo.since(days), 5, content_type=content_type)
        trending_rows = self.repo.get_trending(self.repo.since(days), 5, content_type=content_type)
        creator_rows = self.repo.get_creator_performances(self.repo.since(days), 5)
        return RecommendationOverviewResponse(
            summary=summary,
            top_posts=[ContentPerformanceItem(**r) for r in top_rows],
            trending_posts=[TrendingPostItem(**r) for r in trending_rows],
            top_creators=[CreatorPerformanceItem(**r) for r in creator_rows],
        )