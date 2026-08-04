from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.friends_repository import FriendsRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.notification_service import NotificationService
from app.schemas.friends import (
    FriendshipResponse,
    FriendDetail,
    FollowResponse,
    FollowUserDetail,
    FriendshipStatusResponse,
    CloseFriendResponse,
    CloseFriendDetail,
)


class FriendsService:
    def __init__(self, db: Session):
        self.db = db
        self.friends_repo = FriendsRepository(db)
        self.profile_repo = ProfileRepository(db)

    def send_friend_request(self, requester_id: UUID, addressee_id: UUID) -> FriendshipResponse:
        if requester_id == addressee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send friend request to yourself",
            )

        target = self.profile_repo.get_by_id(addressee_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")

        if self.friends_repo.are_blocked(requester_id, addressee_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot send friend request to this user",
            )

        existing = self.friends_repo.get_friendship(requester_id, addressee_id)
        if existing:
            if existing.status == "accepted":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Already friends",
                )
            if existing.status == "pending" and existing.requester_id == requester_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Friend request already sent",
                )
            if existing.status == "pending" and existing.addressee_id == requester_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This user already sent you a friend request",
                )

        if not self.friends_repo.can_re_request(requester_id, addressee_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before sending another friend request to this user",
            )

        friendship = self.friends_repo.create_friendship(requester_id, addressee_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=addressee_id,
                actor_id=requester_id,
                type="friend_request",
                entity_type="user",
                entity_id=friendship.id,
                entity_user_id=requester_id,
            )
        except Exception:
            pass
        return FriendshipResponse.model_validate(friendship)

    def accept_friend_request(self, user_id: UUID, friendship_id: UUID) -> FriendshipResponse:
        from app.models import Friendship
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found")

        if friendship.addressee_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to accept this request",
            )

        if friendship.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friend request is not pending",
            )

        updated = self.friends_repo.update_friendship_status(friendship, "accepted")
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=friendship.requester_id,
                actor_id=user_id,
                type="friend_accept",
                entity_type="user",
                entity_id=friendship.id,
                entity_user_id=user_id,
            )
        except Exception:
            pass
        return FriendshipResponse.model_validate(updated)

    def reject_friend_request(self, user_id: UUID, friendship_id: UUID) -> bool:
        from app.models import Friendship
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found")

        if friendship.addressee_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to reject this request",
            )

        self.friends_repo.update_friendship_status(friendship, "rejected")
        return True

    def cancel_friend_request(self, user_id: UUID, friendship_id: UUID) -> bool:
        from app.models import Friendship
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found")

        if friendship.requester_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this request",
            )

        self.friends_repo.delete_friendship(friendship)
        return True

    def remove_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        friendship = self.friends_repo.get_friendship(user_id, friend_id)
        if not friendship or friendship.status != "accepted":
            raise HTTPException(status_code=404, detail="Friend not found")

        self.friends_repo.remove_close_friend(user_id, friend_id)
        self.friends_repo.remove_close_friend(friend_id, user_id)
        self.friends_repo.delete_friendship(friendship)
        return True

    def get_friends(self, user_id: UUID, target_user_id: UUID | None = None) -> list[FriendDetail]:
        uid = target_user_id or user_id
        from app.repositories.privacy_repository import PrivacyRepository
        privacy_repo = PrivacyRepository(self.db)
        privacy = privacy_repo.get_by_user_id(uid)
        if privacy and privacy.hide_friends_list and uid != user_id:
            if not self.friends_repo.are_friends(uid, user_id):
                return []
        friendships = self.friends_repo.get_friends(uid)
        other_ids = [
            f.addressee_id if f.requester_id == uid else f.requester_id
            for f in friendships
        ]
        users_map = self.profile_repo.get_by_ids(other_ids)
        result = []
        for f, other_id in zip(friendships, other_ids):
            user = users_map.get(other_id)
            if user:
                mutual_count = self.friends_repo.get_mutual_friends_count(user_id, other_id)
                is_close = self.friends_repo.is_close_friend(uid, other_id)
                result.append(
                    FriendDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                        mutual_friends_count=mutual_count,
                        is_close_friend=is_close,
                    )
                )
        return result

    def get_pending_sent(self, user_id: UUID) -> list[FriendDetail]:
        friendships = self.friends_repo.get_pending_sent(user_id)
        user_ids = [f.addressee_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in friendships:
            user = users_map.get(f.addressee_id)
            if user:
                result.append(
                    FriendDetail(
                        id=str(user.id),
                        friendship_id=str(f.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                    )
                )
        return result

    def get_pending_received(self, user_id: UUID) -> list[FriendDetail]:
        friendships = self.friends_repo.get_pending_received(user_id)
        user_ids = [f.requester_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in friendships:
            user = users_map.get(f.requester_id)
            if user:
                result.append(
                    FriendDetail(
                        id=str(user.id),
                        friendship_id=str(f.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                    )
                )
        return result

    def get_friend_suggestions(self, user_id: UUID) -> list[FriendDetail]:
        users = self.friends_repo.get_friend_suggestions(user_id)
        result = []
        for user in users:
            mutual_count = self.friends_repo.get_mutual_friends_count(user_id, user.id)
            result.append(
                FriendDetail(
                    id=str(user.id),
                    full_name=user.full_name,
                    username=user.username,
                    avatar_url=user.avatar_url,
                    bio=user.bio,
                    is_verified=user.is_verified,
                    mutual_friends_count=mutual_count,
                )
            )
        return sorted(result, key=lambda x: x.mutual_friends_count, reverse=True)

    def get_mutual_friends(self, user_id: UUID, other_user_id: UUID) -> list[FriendDetail]:
        users = self.friends_repo.get_mutual_friends(user_id, other_user_id)
        result = []
        for user in users:
            result.append(
                FriendDetail(
                    id=str(user.id),
                    full_name=user.full_name,
                    username=user.username,
                    avatar_url=user.avatar_url,
                    bio=user.bio,
                    is_verified=user.is_verified,
                )
            )
        return result

    def get_friendship_status(self, user_id: UUID, other_user_id: UUID) -> FriendshipStatusResponse:
        friendship = self.friends_repo.get_friendship(user_id, other_user_id)
        if not friendship:
            return FriendshipStatusResponse(
                status=None,
                is_requester=False,
                is_favorite=False,
                is_close_friend=False,
                is_following=self.friends_repo.is_following(user_id, other_user_id),
                is_followed_by=self.friends_repo.is_following(other_user_id, user_id),
            )
        is_close = self.friends_repo.is_close_friend(user_id, other_user_id) if friendship.status == "accepted" else False
        return FriendshipStatusResponse(
            status=friendship.status,
            is_requester=friendship.requester_id == user_id,
            is_favorite=friendship.is_favorite,
            is_close_friend=is_close,
            is_following=self.friends_repo.is_following(user_id, other_user_id),
            is_followed_by=self.friends_repo.is_following(other_user_id, user_id),
        )

    def update_favorite(self, user_id: UUID, friend_id: UUID, is_favorite: bool) -> FriendshipResponse:
        friendship = self.friends_repo.get_friendship(user_id, friend_id)
        if not friendship or friendship.status != "accepted":
            raise HTTPException(status_code=404, detail="Friend not found")

        updated = self.friends_repo.update_friendship(friendship, is_favorite=is_favorite)
        return FriendshipResponse.model_validate(updated)

    def get_favorite_friends(self, user_id: UUID) -> list[FriendDetail]:
        friendships = self.friends_repo.get_favorite_friends(user_id)
        other_ids = [
            f.addressee_id if f.requester_id == user_id else f.requester_id
            for f in friendships
        ]
        users_map = self.profile_repo.get_by_ids(other_ids)
        result = []
        for f, other_id in zip(friendships, other_ids):
            user = users_map.get(other_id)
            if user:
                result.append(
                    FriendDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                    )
                )
        return result

    def add_close_friend(self, user_id: UUID, friend_id: UUID) -> CloseFriendResponse:
        friendship = self.friends_repo.get_friendship(user_id, friend_id)
        if not friendship or friendship.status != "accepted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only add accepted friends as close friends",
            )

        close_friend = self.friends_repo.add_close_friend(user_id, friend_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=friend_id,
                actor_id=user_id,
                type="close_friend_added",
                entity_type="user",
                entity_id=close_friend.id,
                entity_user_id=user_id,
            )
        except Exception:
            pass
        return CloseFriendResponse.model_validate(close_friend)

    def remove_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        removed = self.friends_repo.remove_close_friend(user_id, friend_id)
        if not removed:
            raise HTTPException(status_code=404, detail="Close friend not found")
        return True

    def get_close_friends(self, user_id: UUID) -> list[CloseFriendDetail]:
        close_friends = self.friends_repo.get_close_friends(user_id)
        friend_ids = [cf.friend_id for cf in close_friends]
        users_map = self.profile_repo.get_by_ids(friend_ids)
        result = []
        for cf in close_friends:
            user = users_map.get(cf.friend_id)
            if user:
                result.append(
                    CloseFriendDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                        added_at=cf.created_at,
                    )
                )
        return result

    def is_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        return self.friends_repo.is_close_friend(user_id, friend_id)

    def follow_user(self, follower_id: UUID, following_id: UUID) -> FollowResponse:
        if follower_id == following_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot follow yourself",
            )

        target = self.profile_repo.get_by_id(following_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")

        if self.friends_repo.are_blocked(follower_id, following_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot follow this user",
            )

        from app.repositories.privacy_repository import PrivacyRepository
        privacy_repo = PrivacyRepository(self.db)
        privacy = privacy_repo.get_by_user_id(following_id)
        if privacy and privacy.follow_permissions == "none":
            raise HTTPException(status_code=403, detail="This user does not allow follows")
        if privacy and privacy.follow_permissions == "friends":
            if not self.friends_repo.are_friends(follower_id, following_id):
                raise HTTPException(status_code=403, detail="This user only allows friends to follow them")

        follow = self.friends_repo.follow_user(follower_id, following_id)
        return FollowResponse.model_validate(follow)

    def unfollow_user(self, follower_id: UUID, following_id: UUID) -> bool:
        return self.friends_repo.unfollow_user(follower_id, following_id)

    def get_followers(self, user_id: UUID) -> list[FollowUserDetail]:
        follows = self.friends_repo.get_followers(user_id)
        user_ids = [f.follower_id for f in follows]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in follows:
            user = users_map.get(f.follower_id)
            if user:
                mutual_count = self.friends_repo.get_mutual_friends_count(user_id, f.follower_id)
                result.append(
                    FollowUserDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                        is_friend=self.friends_repo.are_friends(user_id, f.follower_id),
                        mutual_friends_count=mutual_count,
                    )
                )
        return result

    def get_following(self, user_id: UUID) -> list[FollowUserDetail]:
        follows = self.friends_repo.get_following(user_id)
        user_ids = [f.following_id for f in follows]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in follows:
            user = users_map.get(f.following_id)
            if user:
                mutual_count = self.friends_repo.get_mutual_friends_count(user_id, f.following_id)
                result.append(
                    FollowUserDetail(
                        id=str(user.id),
                        full_name=user.full_name,
                        username=user.username,
                        avatar_url=user.avatar_url,
                        bio=user.bio,
                        is_verified=user.is_verified,
                        is_friend=self.friends_repo.are_friends(user_id, f.following_id),
                        mutual_friends_count=mutual_count,
                    )
                )
        return result

    def get_friend_count(self, user_id: UUID) -> int:
        return self.friends_repo.get_friend_count(user_id)

    def get_follower_count(self, user_id: UUID) -> int:
        return self.friends_repo.get_follower_count(user_id)

    def get_following_count(self, user_id: UUID) -> int:
        return self.friends_repo.get_following_count(user_id)

    def get_close_friend_count(self, user_id: UUID) -> int:
        return self.friends_repo.get_close_friend_count(user_id)

    def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        return self.friends_repo.is_following(follower_id, following_id)
