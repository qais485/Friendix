from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
    AvatarUpdate,
    CoverPhotoUpdate,
    UsernameUpdate,
    UsernameResponse,
)


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)

    def get_profile(self, user_id: UUID) -> ProfileResponse:
        user = self.profile_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return ProfileResponse.model_validate(user)

    def get_public_profile(self, username: str, viewer_id: UUID | None = None) -> ProfileResponse:
        user = self.profile_repo.get_by_username(username)
        if not user or not user.is_active or user.is_deactivated:
            raise HTTPException(status_code=404, detail="User not found")
        # Check profile visibility
        if viewer_id and user.id != viewer_id:
            from app.repositories.privacy_repository import PrivacyRepository
            privacy_repo = PrivacyRepository(self.db)
            privacy = privacy_repo.get_by_user_id(user.id)
            if privacy:
                if privacy.profile_visibility == "private":
                    raise HTTPException(status_code=403, detail="This profile is private")
                if privacy.profile_visibility == "friends":
                    from app.repositories.feed_repository import FeedRepository
                    feed_repo = FeedRepository(self.db)
                    if not feed_repo._are_friends(user.id, viewer_id):
                        raise HTTPException(status_code=403, detail="This profile is only visible to friends")
        return ProfileResponse.model_validate(user)

    def update_profile(self, user_id: UUID, data: ProfileUpdate) -> ProfileResponse:
        user = self.profile_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = data.model_dump(exclude_unset=True)

        if "username" in update_data and update_data["username"] is not None:
            if not self.profile_repo.check_username_available(
                update_data["username"], exclude_user_id=user_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username is already taken",
                )

        updated_user = self.profile_repo.update(user, **update_data)
        return ProfileResponse.model_validate(updated_user)

    def update_avatar(self, user_id: UUID, data: AvatarUpdate) -> ProfileResponse:
        user = self.profile_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        updated_user = self.profile_repo.update(user, avatar_url=data.avatar_url)
        return ProfileResponse.model_validate(updated_user)

    def update_cover_photo(self, user_id: UUID, data: CoverPhotoUpdate) -> ProfileResponse:
        user = self.profile_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        updated_user = self.profile_repo.update(user, cover_photo_url=data.cover_photo_url)
        return ProfileResponse.model_validate(updated_user)

    def check_username(self, username: str, user_id: UUID = None) -> UsernameResponse:
        available = self.profile_repo.check_username_available(username, exclude_user_id=user_id)
        return UsernameResponse(available=available, username=username)

    def update_username(self, user_id: UUID, data: UsernameUpdate) -> ProfileResponse:
        user = self.profile_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not self.profile_repo.check_username_available(
            data.username, exclude_user_id=user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken",
            )
        updated_user = self.profile_repo.update(user, username=data.username)
        return ProfileResponse.model_validate(updated_user)

    def search_users(self, query: str, limit: int = 20, viewer_id: UUID | None = None) -> list[ProfileResponse]:
        users = self.profile_repo.search_users(query, limit)
        result = []
        for user in users:
            if viewer_id and user.id != viewer_id:
                from app.repositories.privacy_repository import PrivacyRepository
                privacy_repo = PrivacyRepository(self.db)
                privacy = privacy_repo.get_by_user_id(user.id)
                if privacy and privacy.profile_visibility == "private":
                    continue
                if privacy and privacy.profile_visibility == "friends":
                    from app.repositories.feed_repository import FeedRepository
                    feed_repo = FeedRepository(self.db)
                    if not feed_repo._are_friends(user.id, viewer_id):
                        continue
            result.append(ProfileResponse.model_validate(user))
        return result

    def get_public_profiles(self, limit: int = 20, offset: int = 0, viewer_id: UUID | None = None) -> list[ProfileResponse]:
        users = self.profile_repo.get_public_profiles(limit, offset)
        result = []
        for user in users:
            if viewer_id and user.id != viewer_id:
                from app.repositories.privacy_repository import PrivacyRepository
                privacy_repo = PrivacyRepository(self.db)
                privacy = privacy_repo.get_by_user_id(user.id)
                if privacy and privacy.profile_visibility == "private":
                    continue
            result.append(ProfileResponse.model_validate(user))
        return result
