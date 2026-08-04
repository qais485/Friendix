from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.relationship_repository import RelationshipRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.notification_service import NotificationService
from app.schemas.friends import (
    FriendshipResponse, FriendDetail, FollowResponse, FollowUserDetail,
    FriendshipStatusResponse, CloseFriendResponse, CloseFriendDetail,
    FollowRequestResponse, FollowRequestDetail, MuteResponse, MuteDetail,
    RestrictResponse, RestrictDetail, BlockResponse, BlockDetail,
    RelationshipSummary, UserCounts,
)


class RelationshipService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RelationshipRepository(db)
        self.profile_repo = ProfileRepository(db)

    def send_friend_request(self, requester_id: UUID, addressee_id: UUID) -> FriendshipResponse:
        if requester_id == addressee_id:
            raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        target = self.profile_repo.get_by_id(addressee_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if self.repo.are_blocked(requester_id, addressee_id):
            raise HTTPException(status_code=403, detail="Cannot send friend request to this user")
        existing = self.repo.get_friendship(requester_id, addressee_id)
        if existing:
            if existing.status == "accepted":
                raise HTTPException(status_code=400, detail="Already friends")
            if existing.status == "pending" and existing.requester_id == requester_id:
                raise HTTPException(status_code=400, detail="Friend request already sent")
            if existing.status == "pending" and existing.addressee_id == requester_id:
                raise HTTPException(status_code=400, detail="This user already sent you a friend request")
        if not self.repo.can_re_request(requester_id, addressee_id):
            raise HTTPException(status_code=429, detail="Please wait before sending another friend request")
        friendship = self.repo.create_friendship(requester_id, addressee_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=addressee_id, actor_id=requester_id,
                type="friend_request", entity_type="friendship",
                entity_id=friendship.id, entity_user_id=requester_id,
            )
        except Exception:
            pass
        return FriendshipResponse.model_validate(friendship)

    def accept_friend_request(self, user_id: UUID, friendship_id: UUID) -> FriendshipResponse:
        friendship = self.db.query(type(self.repo).model).filter_by(id=friendship_id).first() if hasattr(self.repo, 'model') else None
        from app.models import Friendship
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found")
        if friendship.addressee_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to accept this request")
        if friendship.status != "pending":
            raise HTTPException(status_code=400, detail="Friend request is not pending")
        updated = self.repo.update_friendship_status(friendship, "accepted")
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=friendship.requester_id, actor_id=user_id,
                type="friend_accept", entity_type="friendship",
                entity_id=friendship.id, entity_user_id=user_id,
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
            raise HTTPException(status_code=403, detail="Not authorized to reject this request")
        self.repo.update_friendship_status(friendship, "rejected")
        return True

    def cancel_friend_request(self, user_id: UUID, friendship_id: UUID) -> bool:
        from app.models import Friendship
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found")
        if friendship.requester_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
        self.repo.delete_friendship(friendship)
        return True

    def remove_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        friendship = self.repo.get_friendship(user_id, friend_id)
        if not friendship or friendship.status != "accepted":
            raise HTTPException(status_code=404, detail="Friend not found")
        self.repo.remove_close_friend(user_id, friend_id)
        self.repo.remove_close_friend(friend_id, user_id)
        self.repo.delete_friendship(friendship)
        return True

    def get_friends(self, user_id: UUID, target_user_id: UUID | None = None) -> list[FriendDetail]:
        uid = target_user_id or user_id
        from app.repositories.privacy_repository import PrivacyRepository
        privacy_repo = PrivacyRepository(self.db)
        privacy = privacy_repo.get_by_user_id(uid)
        if privacy and privacy.hide_friends_list and uid != user_id:
            if not self.repo.are_friends(uid, user_id):
                return []
        friendships = self.repo.get_friends(uid)
        other_ids = [f.addressee_id if f.requester_id == uid else f.requester_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(other_ids)
        result = []
        for f, other_id in zip(friendships, other_ids):
            user = users_map.get(other_id)
            if user:
                mutual_count = self.repo.get_mutual_friends_count(user_id, other_id)
                is_close = self.repo.is_close_friend(uid, other_id)
                result.append(FriendDetail(
                    id=str(user.id), full_name=user.full_name, username=user.username,
                    avatar_url=user.avatar_url, bio=user.bio, is_verified=user.is_verified,
                    mutual_friends_count=mutual_count, is_close_friend=is_close,
                ))
        return result

    def get_pending_sent(self, user_id: UUID) -> list[FriendDetail]:
        friendships = self.repo.get_pending_sent(user_id)
        user_ids = [f.addressee_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in friendships:
            user = users_map.get(f.addressee_id)
            if user:
                result.append(FriendDetail(
                    id=str(user.id), friendship_id=str(f.id), full_name=user.full_name,
                    username=user.username, avatar_url=user.avatar_url, bio=user.bio,
                    is_verified=user.is_verified,
                ))
        return result

    def get_pending_received(self, user_id: UUID) -> list[FriendDetail]:
        friendships = self.repo.get_pending_received(user_id)
        user_ids = [f.requester_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in friendships:
            user = users_map.get(f.requester_id)
            if user:
                result.append(FriendDetail(
                    id=str(user.id), friendship_id=str(f.id), full_name=user.full_name,
                    username=user.username, avatar_url=user.avatar_url, bio=user.bio,
                    is_verified=user.is_verified,
                ))
        return result

    def get_friend_suggestions(self, user_id: UUID) -> list[FriendDetail]:
        from app.models import User, BlockedUser
        friend_ids = set(self.repo.get_friend_ids(user_id))
        friend_ids.add(user_id)
        pending_sent = self.repo.get_pending_sent(user_id)
        for f in pending_sent:
            friend_ids.add(f.addressee_id)
        pending_received = self.repo.get_pending_received(user_id)
        for f in pending_received:
            friend_ids.add(f.requester_id)
        blocked_ids = [b.blocked_user_id for b in self.repo.get_blocked_users(user_id)]
        blocked_by_ids = self.db.query(BlockedUser.user_id).filter(
            BlockedUser.blocked_user_id == user_id
        ).all()
        friend_ids.update(blocked_ids)
        friend_ids.update([b[0] for b in blocked_by_ids])
        users = self.db.query(User).filter(~User.id.in_(friend_ids)).limit(20).all()
        result = []
        for user in users:
            mutual_count = self.repo.get_mutual_friends_count(user_id, user.id)
            result.append(FriendDetail(
                id=str(user.id), full_name=user.full_name, username=user.username,
                avatar_url=user.avatar_url, bio=user.bio, is_verified=user.is_verified,
                mutual_friends_count=mutual_count,
            ))
        return sorted(result, key=lambda x: x.mutual_friends_count, reverse=True)

    def get_mutual_friends(self, user_id: UUID, other_user_id: UUID) -> list[FriendDetail]:
        users = self.repo.get_mutual_friends(user_id, other_user_id)
        return [FriendDetail(
            id=str(u.id), full_name=u.full_name, username=u.username,
            avatar_url=u.avatar_url, bio=u.bio, is_verified=u.is_verified,
        ) for u in users]

    def get_friendship_status(self, user_id: UUID, other_user_id: UUID) -> FriendshipStatusResponse:
        friendship = self.repo.get_friendship(user_id, other_user_id)
        if not friendship:
            return FriendshipStatusResponse(
                status=None, is_requester=False, is_favorite=False,
                is_close_friend=False, is_following=self.repo.is_following(user_id, other_user_id),
                is_followed_by=self.repo.is_following(other_user_id, user_id),
            )
        is_close = self.repo.is_close_friend(user_id, other_user_id) if friendship.status == "accepted" else False
        return FriendshipStatusResponse(
            status=friendship.status, is_requester=friendship.requester_id == user_id,
            is_favorite=friendship.is_favorite, is_close_friend=is_close,
            is_following=self.repo.is_following(user_id, other_user_id),
            is_followed_by=self.repo.is_following(other_user_id, user_id),
        )

    def update_favorite(self, user_id: UUID, friend_id: UUID, is_favorite: bool) -> FriendshipResponse:
        friendship = self.repo.get_friendship(user_id, friend_id)
        if not friendship or friendship.status != "accepted":
            raise HTTPException(status_code=404, detail="Friend not found")
        updated = self.repo.update_friendship_status(friendship, friendship.status)
        updated.is_favorite = is_favorite
        self.db.commit()
        self.db.refresh(updated)
        return FriendshipResponse.model_validate(updated)

    def get_favorite_friends(self, user_id: UUID) -> list[FriendDetail]:
        friendships = [f for f in self.repo.get_friends(user_id) if f.is_favorite]
        other_ids = [f.addressee_id if f.requester_id == user_id else f.requester_id for f in friendships]
        users_map = self.profile_repo.get_by_ids(other_ids)
        return [FriendDetail(
            id=str(users_map[oid].id), full_name=users_map[oid].full_name,
            username=users_map[oid].username, avatar_url=users_map[oid].avatar_url,
            bio=users_map[oid].bio, is_verified=users_map[oid].is_verified,
        ) for oid in other_ids if oid in users_map]

    def add_close_friend(self, user_id: UUID, friend_id: UUID) -> CloseFriendResponse:
        if not self.repo.are_friends(user_id, friend_id):
            raise HTTPException(status_code=400, detail="Can only add accepted friends as close friends")
        close_friend = self.repo.add_close_friend(user_id, friend_id)
        return CloseFriendResponse.model_validate(close_friend)

    def remove_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        if not self.repo.remove_close_friend(user_id, friend_id):
            raise HTTPException(status_code=404, detail="Close friend not found")
        return True

    def get_close_friends(self, user_id: UUID) -> list[CloseFriendDetail]:
        close_friends = self.repo.get_close_friends(user_id)
        friend_ids = [cf.friend_id for cf in close_friends]
        users_map = self.profile_repo.get_by_ids(friend_ids)
        return [CloseFriendDetail(
            id=str(user.id), full_name=user.full_name, username=user.username,
            avatar_url=user.avatar_url, bio=user.bio, is_verified=user.is_verified,
            added_at=cf.created_at,
        ) for cf in close_friends if (user := users_map.get(cf.friend_id))]

    def follow_user(self, follower_id: UUID, following_id: UUID) -> FollowResponse:
        if follower_id == following_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        target = self.profile_repo.get_by_id(following_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if self.repo.are_blocked(follower_id, following_id):
            raise HTTPException(status_code=403, detail="Cannot follow this user")
        from app.repositories.privacy_repository import PrivacyRepository
        privacy_repo = PrivacyRepository(self.db)
        privacy = privacy_repo.get_by_user_id(following_id)
        if privacy and privacy.follow_permissions == "none":
            raise HTTPException(status_code=403, detail="This user does not allow follows")
        if privacy and privacy.follow_permissions == "friends":
            if not self.repo.are_friends(follower_id, following_id):
                raise HTTPException(status_code=403, detail="This user only allows friends to follow")
        follow = self.repo.create_follow(follower_id, following_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=following_id, actor_id=follower_id,
                type="new_follower", entity_type="follow",
                entity_id=follow.id, entity_user_id=follower_id,
            )
        except Exception:
            pass
        return FollowResponse.model_validate(follow)

    def unfollow_user(self, follower_id: UUID, following_id: UUID) -> bool:
        return self.repo.delete_follow(follower_id, following_id)

    def remove_follower(self, user_id: UUID, follower_id: UUID) -> bool:
        return self.repo.delete_follow(follower_id, user_id)

    def get_followers(self, user_id: UUID) -> list[FollowUserDetail]:
        follows = self.repo.get_followers(user_id)
        user_ids = [f.follower_id for f in follows]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in follows:
            user = users_map.get(f.follower_id)
            if user:
                mutual_count = self.repo.get_mutual_friends_count(user_id, f.follower_id)
                result.append(FollowUserDetail(
                    id=str(user.id), full_name=user.full_name, username=user.username,
                    avatar_url=user.avatar_url, bio=user.bio, is_verified=user.is_verified,
                    is_friend=self.repo.are_friends(user_id, f.follower_id),
                    mutual_friends_count=mutual_count,
                ))
        return result

    def get_following(self, user_id: UUID) -> list[FollowUserDetail]:
        follows = self.repo.get_following(user_id)
        user_ids = [f.following_id for f in follows]
        users_map = self.profile_repo.get_by_ids(user_ids)
        result = []
        for f in follows:
            user = users_map.get(f.following_id)
            if user:
                mutual_count = self.repo.get_mutual_friends_count(user_id, f.following_id)
                result.append(FollowUserDetail(
                    id=str(user.id), full_name=user.full_name, username=user.username,
                    avatar_url=user.avatar_url, bio=user.bio, is_verified=user.is_verified,
                    is_friend=self.repo.are_friends(user_id, f.following_id),
                    mutual_friends_count=mutual_count,
                ))
        return result

    def send_follow_request(self, requester_id: UUID, target_id: UUID) -> FollowRequestResponse:
        if requester_id == target_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        target = self.profile_repo.get_by_id(target_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if self.repo.are_blocked(requester_id, target_id):
            raise HTTPException(status_code=403, detail="Cannot follow this user")
        existing = self.repo.get_follow_request(requester_id, target_id)
        if existing:
            raise HTTPException(status_code=400, detail="Follow request already pending")
        if self.repo.is_following(requester_id, target_id):
            raise HTTPException(status_code=400, detail="Already following this user")
        request = self.repo.create_follow_request(requester_id, target_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=target_id, actor_id=requester_id,
                type="follow_request", entity_type="follow_request",
                entity_id=request.id, entity_user_id=requester_id,
            )
        except Exception:
            pass
        return FollowRequestResponse.model_validate(request)

    def accept_follow_request(self, user_id: UUID, request_id: UUID) -> FollowResponse:
        from app.models import FollowRequest
        request = self.db.query(FollowRequest).filter(FollowRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Follow request not found")
        if request.target_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to accept this request")
        if request.status != "pending":
            raise HTTPException(status_code=400, detail="Follow request is not pending")
        self.repo.update_follow_request_status(request, "accepted")
        follow = self.repo.create_follow(request.requester_id, request.target_id)
        try:
            svc = NotificationService(self.db)
            svc.create_notification(
                user_id=request.requester_id, actor_id=user_id,
                type="follow_approved", entity_type="follow",
                entity_id=follow.id, entity_user_id=user_id,
            )
        except Exception:
            pass
        return FollowResponse.model_validate(follow)

    def reject_follow_request(self, user_id: UUID, request_id: UUID) -> bool:
        from app.models import FollowRequest
        request = self.db.query(FollowRequest).filter(FollowRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Follow request not found")
        if request.target_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to reject this request")
        self.repo.update_follow_request_status(request, "rejected")
        return True

    def cancel_follow_request(self, user_id: UUID, request_id: UUID) -> bool:
        from app.models import FollowRequest
        request = self.db.query(FollowRequest).filter(FollowRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Follow request not found")
        if request.requester_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
        self.repo.delete_follow_request(request)
        return True

    def get_pending_follow_sent(self, user_id: UUID) -> list[FollowRequestDetail]:
        requests = self.repo.get_pending_follow_sent(user_id)
        user_ids = [r.target_id for r in requests]
        users_map = self.profile_repo.get_by_ids(user_ids)
        return [FollowRequestDetail(
            id=str(user.id), request_id=str(r.id), full_name=user.full_name,
            username=user.username, avatar_url=user.avatar_url, bio=user.bio,
            is_verified=user.is_verified,
        ) for r in requests if (user := users_map.get(r.target_id))]

    def get_pending_follow_received(self, user_id: UUID) -> list[FollowRequestDetail]:
        requests = self.repo.get_pending_follow_received(user_id)
        user_ids = [r.requester_id for r in requests]
        users_map = self.profile_repo.get_by_ids(user_ids)
        return [FollowRequestDetail(
            id=str(user.id), request_id=str(r.id), full_name=user.full_name,
            username=user.username, avatar_url=user.avatar_url, bio=user.bio,
            is_verified=user.is_verified,
        ) for r in requests if (user := users_map.get(r.requester_id))]

    def block_user(self, user_id: UUID, blocked_user_id: UUID) -> BlockResponse:
        if user_id == blocked_user_id:
            raise HTTPException(status_code=400, detail="Cannot block yourself")
        target = self.profile_repo.get_by_id(blocked_user_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        block = self.repo.block_user(user_id, blocked_user_id)
        return BlockResponse(
            id=str(block.id), blocked_user_id=str(block.blocked_user_id),
            blocked_at=block.created_at,
        )

    def unblock_user(self, user_id: UUID, blocked_user_id: UUID) -> bool:
        if not self.repo.unblock_user(user_id, blocked_user_id):
            raise HTTPException(status_code=404, detail="Block not found")
        return True

    def get_blocked_users(self, user_id: UUID) -> list[BlockDetail]:
        blocks = self.repo.get_blocked_users(user_id)
        user_ids = [b.blocked_user_id for b in blocks]
        users_map = self.profile_repo.get_by_ids(user_ids)
        return [BlockDetail(
            id=str(user.id), full_name=user.full_name, username=user.username,
            avatar_url=user.avatar_url, blocked_at=b.created_at,
        ) for b in blocks if (user := users_map.get(b.blocked_user_id))]

    def mute_user(self, user_id: UUID, muted_user_id: UUID, **kwargs) -> MuteResponse:
        if user_id == muted_user_id:
            raise HTTPException(status_code=400, detail="Cannot mute yourself")
        mute = self.repo.add_mute(user_id, muted_user_id, **kwargs)
        return MuteResponse.model_validate(mute)

    def unmute_user(self, user_id: UUID, muted_user_id: UUID) -> bool:
        if not self.repo.remove_mute(user_id, muted_user_id):
            raise HTTPException(status_code=404, detail="Mute not found")
        return True

    def get_muted_users(self, user_id: UUID) -> list[MuteDetail]:
        mutes = self.repo.get_muted_users(user_id)
        user_ids = [m.muted_user_id for m in mutes]
        users_map = self.profile_repo.get_by_ids(user_ids)
        return [MuteDetail(
            id=str(user.id), full_name=user.full_name, username=user.username,
            avatar_url=user.avatar_url, mute_posts=m.mute_posts, mute_stories=m.mute_stories,
            mute_notes=m.mute_notes, mute_notifications=m.mute_notifications,
        ) for m in mutes if (user := users_map.get(m.muted_user_id))]

    def restrict_user(self, user_id: UUID, restricted_user_id: UUID) -> RestrictResponse:
        if user_id == restricted_user_id:
            raise HTTPException(status_code=400, detail="Cannot restrict yourself")
        restrict = self.repo.add_restrict(user_id, restricted_user_id)
        return RestrictResponse.model_validate(restrict)

    def unrestrict_user(self, user_id: UUID, restricted_user_id: UUID) -> bool:
        if not self.repo.remove_restrict(user_id, restricted_user_id):
            raise HTTPException(status_code=404, detail="Restrict not found")
        return True

    def get_restricted_users(self, user_id: UUID) -> list[RestrictDetail]:
        restricts = self.repo.get_restricted_users(user_id)
        user_ids = [r.restricted_user_id for r in restricts]
        users_map = self.profile_repo.get_by_ids(user_ids)
        return [RestrictDetail(
            id=str(user.id), full_name=user.full_name, username=user.username,
            avatar_url=user.avatar_url, restricted_at=r.created_at,
        ) for r in restricts if (user := users_map.get(r.restricted_user_id))]

    def get_user_counts(self, user_id: UUID) -> UserCounts:
        return UserCounts(
            friends=self.repo.get_friend_count(user_id),
            followers=self.repo.get_follower_count(user_id),
            following=self.repo.get_following_count(user_id),
            close_friends=self.repo.get_close_friend_count(user_id),
            pending_friend_requests=self.repo.get_pending_friend_request_count(user_id),
            pending_follow_requests=self.repo.get_pending_follow_request_count(user_id),
        )

    def get_relationship_summary(self, user_a: UUID, user_b: UUID) -> RelationshipSummary:
        return RelationshipSummary(
            are_friends=self.repo.are_friends(user_a, user_b),
            is_close_friend=self.repo.is_close_friend(user_a, user_b),
            is_following=self.repo.is_following(user_a, user_b),
            is_followed_by=self.repo.is_following(user_b, user_a),
            are_blocked=self.repo.are_blocked(user_a, user_b),
            is_muted=self.repo.get_mute(user_a, user_b) is not None,
            is_restricted=self.repo.get_restrict(user_a, user_b) is not None,
            mutual_friends_count=self.repo.get_mutual_friends_count(user_a, user_b),
        )
