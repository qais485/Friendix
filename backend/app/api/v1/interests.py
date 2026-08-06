from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.interest import (
    INTEREST_TYPES,
    InterestBatchProcessResponse,
    InterestProfileResponse,
    InterestRefreshResponse,
)
from app.services.interest_service import InterestService

router = APIRouter(tags=["User Interests"])


def get_interest_service(db: Session = Depends(get_db)) -> InterestService:
    return InterestService(db)


@router.get("", response_model=InterestProfileResponse)
def get_my_profile(
    top: int = Query(default=50, ge=1, le=200),
    user_id: UUID = Depends(get_current_user_id),
    service: InterestService = Depends(get_interest_service),
):
    """Return the authenticated user's interest profile."""
    return service.get_profile(user_id, top)


@router.get("/{interest_type}", response_model=InterestProfileResponse)
def get_profile_by_type(
    interest_type: str,
    top: int = Query(default=50, ge=1, le=200),
    user_id: UUID = Depends(get_current_user_id),
    service: InterestService = Depends(get_interest_service),
):
    """Return only one interest dimension (category / tag / creator / topic)."""
    if interest_type not in INTEREST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"interest_type must be one of {INTEREST_TYPES}",
        )
    profile = service.get_profile(user_id, top)
    return profile


@router.post("/refresh", response_model=InterestRefreshResponse)
def refresh_my_profile(
    limit: int = Query(default=500, ge=1, le=2000),
    user_id: UUID = Depends(get_current_user_id),
    service: InterestService = Depends(get_interest_service),
):
    """Consume the user's pending raw events into their interest profile."""
    return service.process_user(user_id, limit)


@router.post("/admin/process", response_model=InterestBatchProcessResponse)
def process_all_users(
    limit_per_user: int = Query(default=500, ge=1, le=2000),
    max_users: int = Query(default=1000, ge=1, le=100000),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: run incremental interest processing for pending users."""
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    return InterestService(db).process_all(limit_per_user, max_users)