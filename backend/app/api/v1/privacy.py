from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.privacy import (
    PrivacySettingResponse,
    PrivacySettingUpdate,
    BlockUserRequest,
    BlockUserResponse,
    BlockedUserDetail,
)
from app.services.privacy_service import PrivacyService

router = APIRouter()


def get_privacy_service(db: Session = Depends(get_db)) -> PrivacyService:
    return PrivacyService(db)


@router.get("/settings", response_model=PrivacySettingResponse)
def get_privacy_settings(
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.get_privacy_settings(user_id)


@router.put("/settings", response_model=PrivacySettingResponse)
def update_privacy_settings(
    data: PrivacySettingUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.update_privacy_settings(user_id, data)


@router.post("/block", response_model=BlockUserResponse)
def block_user(
    data: BlockUserRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.block_user(user_id, UUID(data.blocked_user_id))


@router.delete("/block/{blocked_user_id}")
def unblock_user(
    blocked_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    service.unblock_user(user_id, UUID(blocked_user_id))
    return {"message": "User unblocked"}


@router.get("/blocked", response_model=list[BlockedUserDetail])
def get_blocked_users(
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.get_blocked_users(user_id)


@router.post("/mute", response_model=BlockUserResponse)
def mute_user(
    data: BlockUserRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.mute_user(user_id, UUID(data.blocked_user_id))


@router.delete("/mute/{muted_user_id}")
def unmute_user(
    muted_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    service.unmute_user(user_id, UUID(muted_user_id))
    return {"message": "User unmuted"}


@router.get("/muted", response_model=list[BlockedUserDetail])
def get_muted_users(
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.get_muted_users(user_id)


@router.post("/restrict", response_model=BlockUserResponse)
def restrict_user(
    data: BlockUserRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.restrict_user(user_id, UUID(data.blocked_user_id))


@router.delete("/restrict/{restricted_user_id}")
def unrestrict_user(
    restricted_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    service.unrestrict_user(user_id, UUID(restricted_user_id))
    return {"message": "User unrestricted"}


@router.get("/restricted", response_model=list[BlockedUserDetail])
def get_restricted_users(
    user_id: UUID = Depends(get_current_user_id),
    service: PrivacyService = Depends(get_privacy_service),
):
    return service.get_restricted_users(user_id)
