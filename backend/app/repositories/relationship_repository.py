from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models import (
    Friendship, CloseFriend, Follow, FollowRequest, BlockedUser,
    Mute, Restrict, User, Notification
)


class RelationshipRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_friendship(self, user_id: UUID, other_user_id: UUID) -> Friendship | None:
        return self.db.query(Friendship).filter(
            or_(
                and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
                and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id),
            )
        ).first()

    def create_friendship(self, requester_id: UUID, addressee_id: UUID) -> Friendship:
        friendship = Friendship(
            requester_id=requester_id,
            addressee_id=addressee_id,
            status="pending",
        )
        self.db.add(friendship)
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def update_friendship_status(self, friendship: Friendship, status: str) -> Friendship:
        friendship.status = status
        if status == "rejected":
            friendship.rejected_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def delete_friendship(self, friendship: Friendship) -> None:
        self.db.delete(friendship)
        self.db.commit()

    def get_friends(self, user_id: UUID) -> list[Friendship]:
        return self.db.query(Friendship).filter(
            or_(
                and_(Friendship.requester_id == user_id, Friendship.status == "accepted"),
                and_(Friendship.addressee_id == user_id, Friendship.status == "accepted"),
            )
        ).all()

    def get_pending_sent(self, user_id: UUID) -> list[Friendship]:
        return self.db.query(Friendship).filter(
            and_(Friendship.requester_id == user_id, Friendship.status == "pending")
        ).all()

    def get_pending_received(self, user_id: UUID) -> list[Friendship]:
        return self.db.query(Friendship).filter(
            and_(Friendship.addressee_id == user_id, Friendship.status == "pending")
        ).all()

    def get_friend_ids(self, user_id: UUID) -> list[UUID]:
        friendships = self.get_friends(user_id)
        ids = set()
        for f in friendships:
            ids.add(f.addressee_id if f.requester_id == user_id else f.requester_id)
        return list(ids)

    def are_friends(self, user_a: UUID, user_b: UUID) -> bool:
        return self.db.query(Friendship).filter(
            Friendship.status == "accepted",
            or_(
                and_(Friendship.requester_id == user_a, Friendship.addressee_id == user_b),
                and_(Friendship.requester_id == user_b, Friendship.addressee_id == user_a),
            )
        ).first() is not None

    def get_mutual_friends(self, user_a: UUID, user_b: UUID) -> list[User]:
        a_friends = set(self.get_friend_ids(user_a))
        b_friends = set(self.get_friend_ids(user_b))
        mutual_ids = a_friends & b_friends
        if not mutual_ids:
            return []
        return self.db.query(User).filter(User.id.in_(mutual_ids)).all()

    def get_mutual_friends_count(self, user_a: UUID, user_b: UUID) -> int:
        return len(self.get_mutual_friends(user_a, user_b))

    def can_re_request(self, user_id: UUID, other_user_id: UUID) -> bool:
        last_rejected = self.db.query(Friendship).filter(
            or_(
                and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
                and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id),
            ),
            Friendship.status == "rejected",
        ).order_by(Friendship.rejected_at.desc()).first()
        if not last_rejected or not last_rejected.rejected_at:
            return True
        return datetime.now(timezone.utc) - last_rejected.rejected_at > timedelta(days=7)

    def are_blocked(self, user_a: UUID, user_b: UUID) -> bool:
        return self.db.query(BlockedUser).filter(
            or_(
                and_(BlockedUser.user_id == user_a, BlockedUser.blocked_user_id == user_b),
                and_(BlockedUser.user_id == user_b, BlockedUser.blocked_user_id == user_a),
            )
        ).first() is not None

    def block_user(self, user_id: UUID, blocked_user_id: UUID) -> BlockedUser:
        existing = self.db.query(BlockedUser).filter(
            and_(BlockedUser.user_id == user_id, BlockedUser.blocked_user_id == blocked_user_id)
        ).first()
        if existing:
            return existing
        block = BlockedUser(user_id=user_id, blocked_user_id=blocked_user_id, block_type="block")
        self.db.add(block)
        self.db.flush()
        self._cleanup_relationships_on_block(user_id, blocked_user_id)
        self.db.commit()
        self.db.refresh(block)
        return block

    def unblock_user(self, user_id: UUID, blocked_user_id: UUID) -> bool:
        block = self.db.query(BlockedUser).filter(
            and_(BlockedUser.user_id == user_id, BlockedUser.blocked_user_id == blocked_user_id)
        ).first()
        if block:
            self.db.delete(block)
            self.db.commit()
            return True
        return False

    def get_blocked_users(self, user_id: UUID) -> list[BlockedUser]:
        return self.db.query(BlockedUser).filter(BlockedUser.user_id == user_id).all()

    def _cleanup_relationships_on_block(self, blocker_id: UUID, blocked_id: UUID) -> None:
        friendship = self.get_friendship(blocker_id, blocked_id)
        if friendship:
            self.db.delete(friendship)
        follow = self.db.query(Follow).filter(
            or_(
                and_(Follow.follower_id == blocker_id, Follow.following_id == blocked_id),
                and_(Follow.follower_id == blocked_id, Follow.following_id == blocker_id),
            )
        ).all()
        for f in follow:
            self.db.delete(f)
        pending_requests = self.db.query(Friendship).filter(
            and_(
                Friendship.status == "pending",
                or_(
                    and_(Friendship.requester_id == blocker_id, Friendship.addressee_id == blocked_id),
                    and_(Friendship.requester_id == blocked_id, Friendship.addressee_id == blocker_id),
                ),
            )
        ).all()
        for r in pending_requests:
            self.db.delete(r)
        follow_requests = self.db.query(FollowRequest).filter(
            and_(
                FollowRequest.status == "pending",
                or_(
                    and_(FollowRequest.requester_id == blocker_id, FollowRequest.target_id == blocked_id),
                    and_(FollowRequest.requester_id == blocked_id, FollowRequest.target_id == blocker_id),
                ),
            )
        ).all()
        for r in follow_requests:
            self.db.delete(r)
        close_friends = self.db.query(CloseFriend).filter(
            or_(
                and_(CloseFriend.user_id == blocker_id, CloseFriend.friend_id == blocked_id),
                and_(CloseFriend.user_id == blocked_id, CloseFriend.friend_id == blocker_id),
            )
        ).all()
        for cf in close_friends:
            self.db.delete(cf)
        mutes = self.db.query(Mute).filter(
            or_(
                and_(Mute.user_id == blocker_id, Mute.muted_user_id == blocked_id),
                and_(Mute.user_id == blocked_id, Mute.muted_user_id == blocker_id),
            )
        ).all()
        for m in mutes:
            self.db.delete(m)
        restricts = self.db.query(Restrict).filter(
            or_(
                and_(Restrict.user_id == blocker_id, Restrict.restricted_user_id == blocked_id),
                and_(Restrict.user_id == blocked_id, Restrict.restricted_user_id == blocker_id),
            )
        ).all()
        for r in restricts:
            self.db.delete(r)

    def get_follow(self, follower_id: UUID, following_id: UUID) -> Follow | None:
        return self.db.query(Follow).filter(
            and_(Follow.follower_id == follower_id, Follow.following_id == following_id)
        ).first()

    def create_follow(self, follower_id: UUID, following_id: UUID) -> Follow:
        follow = Follow(follower_id=follower_id, following_id=following_id)
        self.db.add(follow)
        self.db.commit()
        self.db.refresh(follow)
        return follow

    def delete_follow(self, follower_id: UUID, following_id: UUID) -> bool:
        follow = self.get_follow(follower_id, following_id)
        if follow:
            self.db.delete(follow)
            self.db.commit()
            return True
        return False

    def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        return self.get_follow(follower_id, following_id) is not None

    def get_followers(self, user_id: UUID) -> list[Follow]:
        return self.db.query(Follow).filter(Follow.following_id == user_id).all()

    def get_following(self, user_id: UUID) -> list[Follow]:
        return self.db.query(Follow).filter(Follow.follower_id == user_id).all()

    def get_follower_ids(self, user_id: UUID) -> list[UUID]:
        follows = self.db.query(Follow.follower_id).filter(Follow.following_id == user_id).all()
        return [f[0] for f in follows]

    def get_following_ids(self, user_id: UUID) -> list[UUID]:
        follows = self.db.query(Follow.following_id).filter(Follow.follower_id == user_id).all()
        return [f[0] for f in follows]

    def get_follow_request(self, requester_id: UUID, target_id: UUID) -> FollowRequest | None:
        return self.db.query(FollowRequest).filter(
            and_(
                FollowRequest.requester_id == requester_id,
                FollowRequest.target_id == target_id,
                FollowRequest.status == "pending",
            )
        ).first()

    def create_follow_request(self, requester_id: UUID, target_id: UUID) -> FollowRequest:
        request = FollowRequest(
            requester_id=requester_id,
            target_id=target_id,
            status="pending",
        )
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def update_follow_request_status(self, request: FollowRequest, status: str) -> FollowRequest:
        request.status = status
        self.db.commit()
        self.db.refresh(request)
        return request

    def delete_follow_request(self, request: FollowRequest) -> None:
        self.db.delete(request)
        self.db.commit()

    def get_pending_follow_sent(self, user_id: UUID) -> list[FollowRequest]:
        return self.db.query(FollowRequest).filter(
            and_(FollowRequest.requester_id == user_id, FollowRequest.status == "pending")
        ).all()

    def get_pending_follow_received(self, user_id: UUID) -> list[FollowRequest]:
        return self.db.query(FollowRequest).filter(
            and_(FollowRequest.target_id == user_id, FollowRequest.status == "pending")
        ).all()

    def add_close_friend(self, user_id: UUID, friend_id: UUID) -> CloseFriend:
        existing = self.db.query(CloseFriend).filter(
            and_(CloseFriend.user_id == user_id, CloseFriend.friend_id == friend_id)
        ).first()
        if existing:
            return existing
        close_friend = CloseFriend(user_id=user_id, friend_id=friend_id)
        self.db.add(close_friend)
        self.db.commit()
        self.db.refresh(close_friend)
        return close_friend

    def remove_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        close_friend = self.db.query(CloseFriend).filter(
            and_(CloseFriend.user_id == user_id, CloseFriend.friend_id == friend_id)
        ).first()
        if close_friend:
            self.db.delete(close_friend)
            self.db.commit()
            return True
        return False

    def get_close_friends(self, user_id: UUID) -> list[CloseFriend]:
        return self.db.query(CloseFriend).filter(CloseFriend.user_id == user_id).all()

    def get_close_friend_ids(self, user_id: UUID) -> list[UUID]:
        close_friends = self.db.query(CloseFriend.friend_id).filter(
            CloseFriend.user_id == user_id
        ).all()
        return [cf[0] for cf in close_friends]

    def is_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        return self.db.query(CloseFriend).filter(
            and_(CloseFriend.user_id == user_id, CloseFriend.friend_id == friend_id)
        ).first() is not None

    def add_mute(self, user_id: UUID, muted_user_id: UUID, **kwargs) -> Mute:
        existing = self.db.query(Mute).filter(
            and_(Mute.user_id == user_id, Mute.muted_user_id == muted_user_id)
        ).first()
        if existing:
            for key, value in kwargs.items():
                setattr(existing, key, value)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        mute = Mute(user_id=user_id, muted_user_id=muted_user_id, **kwargs)
        self.db.add(mute)
        self.db.commit()
        self.db.refresh(mute)
        return mute

    def remove_mute(self, user_id: UUID, muted_user_id: UUID) -> bool:
        mute = self.db.query(Mute).filter(
            and_(Mute.user_id == user_id, Mute.muted_user_id == muted_user_id)
        ).first()
        if mute:
            self.db.delete(mute)
            self.db.commit()
            return True
        return False

    def get_mute(self, user_id: UUID, muted_user_id: UUID) -> Mute | None:
        return self.db.query(Mute).filter(
            and_(Mute.user_id == user_id, Mute.muted_user_id == muted_user_id)
        ).first()

    def get_muted_users(self, user_id: UUID) -> list[Mute]:
        return self.db.query(Mute).filter(Mute.user_id == user_id).all()

    def add_restrict(self, user_id: UUID, restricted_user_id: UUID) -> Restrict:
        existing = self.db.query(Restrict).filter(
            and_(Restrict.user_id == user_id, Restrict.restricted_user_id == restricted_user_id)
        ).first()
        if existing:
            return existing
        restrict = Restrict(user_id=user_id, restricted_user_id=restricted_user_id)
        self.db.add(restrict)
        self.db.commit()
        self.db.refresh(restrict)
        return restrict

    def remove_restrict(self, user_id: UUID, restricted_user_id: UUID) -> bool:
        restrict = self.db.query(Restrict).filter(
            and_(Restrict.user_id == user_id, Restrict.restricted_user_id == restricted_user_id)
        ).first()
        if restrict:
            self.db.delete(restrict)
            self.db.commit()
            return True
        return False

    def get_restrict(self, user_id: UUID, restricted_user_id: UUID) -> Restrict | None:
        return self.db.query(Restrict).filter(
            and_(Restrict.user_id == user_id, Restrict.restricted_user_id == restricted_user_id)
        ).first()

    def get_restricted_users(self, user_id: UUID) -> list[Restrict]:
        return self.db.query(Restrict).filter(Restrict.user_id == user_id).all()

    def get_friend_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Friendship.id)).filter(
            or_(
                and_(Friendship.requester_id == user_id, Friendship.status == "accepted"),
                and_(Friendship.addressee_id == user_id, Friendship.status == "accepted"),
            )
        ).scalar() or 0

    def get_follower_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Follow.id)).filter(Follow.following_id == user_id).scalar() or 0

    def get_following_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Follow.id)).filter(Follow.follower_id == user_id).scalar() or 0

    def get_close_friend_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(CloseFriend.id)).filter(CloseFriend.user_id == user_id).scalar() or 0

    def get_pending_friend_request_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Friendship.id)).filter(
            and_(Friendship.addressee_id == user_id, Friendship.status == "pending")
        ).scalar() or 0

    def get_pending_follow_request_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(FollowRequest.id)).filter(
            and_(FollowRequest.target_id == user_id, FollowRequest.status == "pending")
        ).scalar() or 0

    def get_muted_post_author_ids(self, user_id: UUID) -> list[UUID]:
        mutes = self.db.query(Mute.muted_user_id).filter(
            and_(Mute.user_id == user_id, Mute.mute_posts == True)
        ).all()
        return [m[0] for m in mutes]

    def get_muted_story_author_ids(self, user_id: UUID) -> list[UUID]:
        mutes = self.db.query(Mute.muted_user_id).filter(
            and_(Mute.user_id == user_id, Mute.mute_stories == True)
        ).all()
        return [m[0] for m in mutes]
