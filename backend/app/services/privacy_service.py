from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.privacy_repository import PrivacyRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.privacy import (
    PrivacySettingResponse,
    PrivacySettingUpdate,
    BlockUserResponse,
    BlockedUserDetail,
)


class PrivacyService:
    def __init__(self, db: Session):
        self.db = db
        self.privacy_repo = PrivacyRepository(db)
        self.profile_repo = ProfileRepository(db)

    def get_privacy_settings(self, user_id: UUID) -> PrivacySettingResponse:
        setting = self.privacy_repo.get_or_create(user_id)
        return PrivacySettingResponse.model_validate(setting)

    def update_privacy_settings(self, user_id: UUID, data: PrivacySettingUpdate) -> PrivacySettingResponse:
        setting = self.privacy_repo.get_or_create(user_id)
        update_data = data.model_dump(exclude_unset=True)
        updated = self.privacy_repo.update(setting, **update_data)
        return PrivacySettingResponse.model_validate(updated)

    def block_user(self, user_id: UUID, blocked_user_id: UUID) -> BlockUserResponse:
        if user_id == blocked_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot block yourself",
            )

        target = self.profile_repo.get_by_id(blocked_user_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")

        self.privacy_repo.unblock_user(user_id, blocked_user_id)

        block = self.privacy_repo.block_user(user_id, blocked_user_id, "block")
        return BlockUserResponse.model_validate(block)

    def unblock_user(self, user_id: UUID, blocked_user_id: UUID) -> bool:
        return self.privacy_repo.unblock_user(user_id, blocked_user_id)

    def mute_user(self, user_id: UUID, muted_user_id: UUID) -> BlockUserResponse:
        if user_id == muted_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot mute yourself",
            )

        target = self.profile_repo.get_by_id(muted_user_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")

        block = self.privacy_repo.block_user(user_id, muted_user_id, "mute")
        return BlockUserResponse.model_validate(block)

    def unmute_user(self, user_id: UUID, muted_user_id: UUID) -> bool:
        return self.privacy_repo.unblock_user(user_id, muted_user_id)

    def restrict_user(self, user_id: UUID, restricted_user_id: UUID) -> BlockUserResponse:
        if user_id == restricted_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot restrict yourself",
            )

        target = self.profile_repo.get_by_id(restricted_user_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")

        block = self.privacy_repo.block_user(user_id, restricted_user_id, "restrict")
        return BlockUserResponse.model_validate(block)

    def unrestrict_user(self, user_id: UUID, restricted_user_id: UUID) -> bool:
        return self.privacy_repo.unblock_user(user_id, restricted_user_id)

    def get_blocked_users(self, user_id: UUID) -> list[BlockedUserDetail]:
        blocks = self.privacy_repo.get_blocked_users(user_id)
        result = []
        for block in blocks:
            user = self.profile_repo.get_by_id(block.blocked_user_id)
            if user:
                result.append(
                    BlockedUserDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                    )
                )
        return result

    def get_muted_users(self, user_id: UUID) -> list[BlockedUserDetail]:
        mutes = self.privacy_repo.get_muted_users(user_id)
        result = []
        for mute in mutes:
            user = self.profile_repo.get_by_id(mute.blocked_user_id)
            if user:
                result.append(
                    BlockedUserDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                    )
                )
        return result

    def get_restricted_users(self, user_id: UUID) -> list[BlockedUserDetail]:
        restrictions = self.privacy_repo.get_restricted_users(user_id)
        result = []
        for restriction in restrictions:
            user = self.profile_repo.get_by_id(restriction.blocked_user_id)
            if user:
                result.append(
                    BlockedUserDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                    )
                )
        return result
