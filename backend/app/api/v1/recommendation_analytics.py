from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.schemas.recommendation_analytics import (
    CreatorDetailResponse,
    CreatorPerformanceResponse,
    EngagementSeriesResponse,
    RecommendationOverviewResponse,
    RecommendationSummaryResponse,
    TopPostsResponse,
    TrendingPostsResponse,
    WatchTimeSeriesResponse,
)
from app.services.recommendation_analytics_service import RecommendationAnalyticsService

router = APIRouter(tags=["Recommendation Analytics"])


def get_service(db: Session = Depends(get_db)) -> RecommendationAnalyticsService:
    return RecommendationAnalyticsService(db)


def _check_type(content_type: str | None) -> None:
    if content_type and content_type not in CONTENT_PROFILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"content_type must be one of {CONTENT_PROFILE_TYPES}",
        )


def _require_admin(db: Session, user_id: UUID) -> None:
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")


def _bounded(limit: int, offset: int) -> tuple[int, int]:
    return min(max(limit, 1), 100), max(offset, 0)


@router.get("/overview", response_model=RecommendationOverviewResponse)
def overview(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Recommendation-performance overview: summary + top/trending/creators."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).overview(days, content_type)


@router.get("/summary", response_model=RecommendationSummaryResponse)
def summary(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    creator_id: UUID | None = Query(default=None),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Headline rates: watch time, completion, replay, skip, engagement."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).summary(days, content_type, creator_id)


@router.get("/top-posts", response_model=TopPostsResponse)
def top_posts(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Best-performing content by engagement score."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).top_posts(days, limit, content_type, offset)


@router.get("/trending-posts", response_model=TrendingPostsResponse)
def trending_posts(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Rising content ranked by recent activity velocity."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).trending_posts(days, limit, content_type)


@router.get("/watch-time", response_model=WatchTimeSeriesResponse)
def watch_time(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    creator_id: UUID | None = Query(default=None),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Total watch time plus a daily watch-time series."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).watch_time(days, content_type, creator_id)


@router.get("/engagement-series", response_model=EngagementSeriesResponse)
def engagement_series(
    days: int = Query(default=30, ge=1, le=365),
    content_type: str | None = Query(default=None),
    creator_id: UUID | None = Query(default=None),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Daily impressions / views / engagement counts and derived rates."""
    _require_admin(db, user_id)
    _check_type(content_type)
    return get_service(db).engagement_series(days, content_type, creator_id)


@router.get("/creators", response_model=CreatorPerformanceResponse)
def creators(
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Creator performance leaderboard."""
    _require_admin(db, user_id)
    return get_service(db).creators(days, limit, offset)


@router.get("/creators/{creator_id}", response_model=CreatorDetailResponse)
def creator_detail(
    creator_id: UUID,
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=10, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Per-creator performance with their top-performing content."""
    _require_admin(db, user_id)
    result = get_service(db).creator_detail(creator_id, days, limit)
    if result is None:
        raise HTTPException(status_code=404, detail="No performance data for this creator")
    return result