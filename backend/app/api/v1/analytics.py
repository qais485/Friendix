from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.core.security import get_current_user_id
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["analytics"])


@router.get("/overview")
def get_overview(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_overview(user_id)


@router.get("/profile-views")
def get_profile_views(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_profile_views(user_id, days)


@router.get("/posts")
def get_post_analytics(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_post_analytics(user_id, days)


@router.get("/engagement")
def get_engagement(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_engagement(user_id, days)


@router.get("/followers-growth")
def get_followers_growth(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_followers_growth(user_id, days)


@router.get("/stories")
def get_story_analytics(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_story_analytics(user_id, days)


@router.get("/reels")
def get_reel_analytics(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_reel_analytics(user_id, days)


@router.get("/videos")
def get_video_analytics(
    days: int = Query(30, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return AnalyticsService(db).get_video_analytics(user_id, days)
