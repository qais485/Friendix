from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
    AvatarUpdate,
    CoverPhotoUpdate,
    UsernameCheck,
    UsernameUpdate,
    UsernameResponse,
)
from app.services.profile_service import ProfileService

router = APIRouter()


def get_profile_service(db: Session = Depends(get_db)) -> ProfileService:
    return ProfileService(db)


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.get_profile(user_id)


@router.get("/user/{username}", response_model=ProfileResponse)
def get_public_profile(
    username: str,
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.get_public_profile(username, user_id)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    data: ProfileUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.update_profile(user_id, data)


@router.put("/me/avatar", response_model=ProfileResponse)
def update_avatar(
    data: AvatarUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.update_avatar(user_id, data)


@router.put("/me/cover", response_model=ProfileResponse)
def update_cover_photo(
    data: CoverPhotoUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.update_cover_photo(user_id, data)


@router.put("/me/username", response_model=ProfileResponse)
def update_my_username(
    data: UsernameUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.update_username(user_id, data)


@router.post("/check-username", response_model=UsernameResponse)
def check_username(
    data: UsernameCheck,
    user_id: UUID | None = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.check_username(data.username, user_id)


@router.get("/search", response_model=list[ProfileResponse])
def search_users(
    q: str,
    limit: int = Query(20, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.search_users(q, limit, user_id)


@router.get("/explore", response_model=list[ProfileResponse])
def get_explore_profiles(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: ProfileService = Depends(get_profile_service),
):
    return service.get_public_profiles(limit, offset, user_id)
