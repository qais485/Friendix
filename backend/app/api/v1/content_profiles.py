from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id, get_optional_user_id
from app.database.base import get_db
from app.schemas.content_profile import (
    CONTENT_PROFILE_TYPES,
    ContentMetricsRefreshResponse,
    ContentProfileBackfillResponse,
    ContentProfileListResponse,
    ContentProfileRefreshResponse,
    ContentProfileResponse,
    ContentProfileUpdate,
)
from app.services.content_metrics_service import ContentMetricsService
from app.services.content_profile_service import ContentProfileService

router = APIRouter(tags=["Content Profiles"])


def get_content_profile_service(db: Session = Depends(get_db)) -> ContentProfileService:
    return ContentProfileService(db)


def _check_type(content_type: str) -> None:
    if content_type not in CONTENT_PROFILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"content_type must be one of {CONTENT_PROFILE_TYPES}",
        )


@router.get("", response_model=ContentProfileListResponse)
def list_profiles(
    content_type: str | None = Query(None),
    sort_by: str | None = Query(None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user_id: UUID | None = Depends(get_optional_user_id),
    service: ContentProfileService = Depends(get_content_profile_service),
):
    if content_type is not None:
        _check_type(content_type)
    if sort_by is not None and sort_by not in ("popularity", "quality", "freshness"):
        raise HTTPException(status_code=400, detail="sort_by must be popularity, quality, or freshness")
    return service.list_profiles(content_type, limit, offset, sort_by)


@router.get("/{content_type}/{content_id}", response_model=ContentProfileResponse)
def get_profile(
    content_type: str,
    content_id: UUID,
    user_id: UUID | None = Depends(get_optional_user_id),
    service: ContentProfileService = Depends(get_content_profile_service),
):
    _check_type(content_type)
    profile = service.get_profile(content_type, content_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Content profile not found")
    return profile


@router.put("/{content_type}/{content_id}", response_model=ContentProfileResponse)
def update_profile(
    content_type: str,
    content_id: UUID,
    data: ContentProfileUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    _check_type(content_type)
    service = ContentProfileService(db)
    existing = service.get_profile(content_type, content_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Content profile not found")
    if existing.creator_id != user_id and not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Only the creator or an admin can update this profile")
    return service.update_profile(content_type, content_id, data)


@router.post("/refresh/{content_type}", response_model=ContentProfileRefreshResponse)
def refresh_profiles(
    content_type: str,
    limit: int = Query(default=200, ge=1, le=1000),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: rebuild profiles for the newest content of one type."""
    _check_type(content_type)
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    built = ContentProfileService(db).build_recent(content_type, limit)
    return ContentProfileRefreshResponse(content_type=content_type, built=built)


@router.post("/refresh", response_model=ContentProfileRefreshResponse)
def refresh_all_types(
    limit_per_type: int = Query(default=200, ge=1, le=1000),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: rebuild profiles for the newest content of every type."""
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    total = 0
    for content_type in CONTENT_PROFILE_TYPES:
        total += ContentProfileService(db).build_recent(content_type, limit_per_type)
    return ContentProfileRefreshResponse(content_type="all", built=total)


@router.post("/backfill", response_model=ContentProfileBackfillResponse)
def backfill_profiles(
    content_type: str | None = Query(None),
    limit_per_type: int = Query(default=500, ge=1, le=20000),
    prune: bool = Query(default=True),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: full backfill of content profiles for all types (or one)."""
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    types = None
    if content_type is not None:
        _check_type(content_type)
        types = [content_type]
    return ContentProfileService(db).backfill(types, limit_per_type, prune)


@router.post("/metrics/refresh", response_model=ContentMetricsRefreshResponse)
def refresh_metrics(
    limit: int = Query(default=2000, ge=1, le=20000),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: incrementally update popularity/freshness from new events."""
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    return ContentMetricsService(db).process_recent(limit)