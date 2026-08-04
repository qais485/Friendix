from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models import Friendship, CloseFriend, Follow, User, BlockedUser


class FriendsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_friendship(self, user_id: UUID, other_user_id: UUID) -> Friendship | None:
        return (
            self.db.query(Friendship)
            .filter(
                or_(
                    and_(
                        Friendship.requester_id == user_id,
                        Friendship.addressee_id == other_user_id,
                    ),
                    and_(
                        Friendship.requester_id == other_user_id,
                        Friendship.addressee_id == user_id,
                    ),
                )
            )
            .first()
        )

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

    def update_friendship(self, friendship: Friendship, **kwargs) -> Friendship:
        for key, value in kwargs.items():
            setattr(friendship, key, value)
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def delete_friendship(self, friendship: Friendship) -> None:
        self.db.delete(friendship)
        self.db.commit()

    def get_friends(self, user_id: UUID) -> list[Friendship]:
        return (
            self.db.query(Friendship)
            .filter(
                or_(
                    and_(
                        Friendship.requester_id == user_id,
                        Friendship.status == "accepted",
                    ),
                    and_(
                        Friendship.addressee_id == user_id,
                        Friendship.status == "accepted",
                    ),
                )
            )
            .all()
        )

    def get_pending_sent(self, user_id: UUID) -> list[Friendship]:
        return (
            self.db.query(Friendship)
            .filter(
                and_(
                    Friendship.requester_id == user_id,
                    Friendship.status == "pending",
                )
            )
            .all()
        )

    def get_pending_received(self, user_id: UUID) -> list[Friendship]:
        return (
            self.db.query(Friendship)
            .filter(
                and_(
                    Friendship.addressee_id == user_id,
                    Friendship.status == "pending",
                )
            )
            .all()
        )

    def get_mutual_friends(self, user_id: UUID, other_user_id: UUID) -> list[User]:
        user_friends = self.get_friends(user_id)
        other_friends = self.get_friends(other_user_id)

        user_friend_ids = set()
        for f in user_friends:
            if f.requester_id == user_id:
                user_friend_ids.add(f.addressee_id)
            else:
                user_friend_ids.add(f.requester_id)

        other_friend_ids = set()
        for f in other_friends:
            if f.requester_id == other_user_id:
                other_friend_ids.add(f.addressee_id)
            else:
                other_friend_ids.add(f.requester_id)

        mutual_ids = user_friend_ids & other_friend_ids
        if not mutual_ids:
            return []

        return self.db.query(User).filter(User.id.in_(mutual_ids)).all()

    def get_mutual_friends_count(self, user_id: UUID, other_user_id: UUID) -> int:
        return len(self.get_mutual_friends(user_id, other_user_id))

    def get_friend_suggestions(self, user_id: UUID, limit: int = 20) -> list[User]:
        user_friends = self.get_friends(user_id)
        friend_ids = set()
        for f in user_friends:
            if f.requester_id == user_id:
                friend_ids.add(f.addressee_id)
            else:
                friend_ids.add(f.requester_id)

        friend_ids.add(user_id)

        pending_sent = self.get_pending_sent(user_id)
        for f in pending_sent:
            friend_ids.add(f.addressee_id)

        pending_received = self.get_pending_received(user_id)
        for f in pending_received:
            friend_ids.add(f.requester_id)

        blocked_ids = self._get_blocked_user_ids(user_id)
        friend_ids.update(blocked_ids)

        return self.db.query(User).filter(~User.id.in_(friend_ids)).limit(limit).all()

    def get_favorite_friends(self, user_id: UUID) -> list[Friendship]:
        return (
            self.db.query(Friendship)
            .filter(
                or_(
                    and_(
                        Friendship.requester_id == user_id,
                        Friendship.status == "accepted",
                        Friendship.is_favorite == True,
                    ),
                    and_(
                        Friendship.addressee_id == user_id,
                        Friendship.status == "accepted",
                        Friendship.is_favorite == True,
                    ),
                )
            )
            .all()
        )

    def are_friends(self, user_id: UUID, other_user_id: UUID) -> bool:
        return self.db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
                    and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id),
                ),
                Friendship.status == "accepted",
            )
        ).first() is not None

    def are_blocked(self, user_id: UUID, other_user_id: UUID) -> bool:
        blocked = self.db.query(BlockedUser).filter(
            or_(
                and_(BlockedUser.user_id == user_id, BlockedUser.blocked_user_id == other_user_id),
                and_(BlockedUser.user_id == other_user_id, BlockedUser.blocked_user_id == user_id),
            )
        ).first()
        return blocked is not None

    def _get_blocked_user_ids(self, user_id: UUID) -> list[UUID]:
        blocked_by = self.db.query(BlockedUser.blocked_user_id).filter(
            BlockedUser.user_id == user_id, BlockedUser.block_type == "block"
        ).all()
        blocking = self.db.query(BlockedUser.user_id).filter(
            BlockedUser.blocked_user_id == user_id, BlockedUser.block_type == "block"
        ).all()
        return list(set([b[0] for b in blocked_by] + [b[0] for b in blocking]))

    def can_re_request(self, user_id: UUID, other_user_id: UUID) -> bool:
        last_rejected = (
            self.db.query(Friendship)
            .filter(
                and_(
                    or_(
                        and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
                        and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id),
                    ),
                    Friendship.status == "rejected",
                )
            )
            .order_by(Friendship.rejected_at.desc())
            .first()
        )
        if not last_rejected or not last_rejected.rejected_at:
            return True
        cooldown = timedelta(days=7)
        return datetime.now(timezone.utc) - last_rejected.rejected_at > cooldown

    def get_close_friends(self, user_id: UUID) -> list[CloseFriend]:
        return (
            self.db.query(CloseFriend)
            .filter(CloseFriend.user_id == user_id)
            .all()
        )

    def get_close_friend_ids(self, user_id: UUID) -> list[UUID]:
        close_friends = self.db.query(CloseFriend.friend_id).filter(
            CloseFriend.user_id == user_id
        ).all()
        return [cf[0] for cf in close_friends]

    def is_close_friend(self, user_id: UUID, friend_id: UUID) -> bool:
        return (
            self.db.query(CloseFriend)
            .filter(
                and_(
                    CloseFriend.user_id == user_id,
                    CloseFriend.friend_id == friend_id,
                )
            )
            .first()
            is not None
        )

    def add_close_friend(self, user_id: UUID, friend_id: UUID) -> CloseFriend:
        existing = self.db.query(CloseFriend).filter(
            and_(
                CloseFriend.user_id == user_id,
                CloseFriend.friend_id == friend_id,
            )
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
            and_(
                CloseFriend.user_id == user_id,
                CloseFriend.friend_id == friend_id,
            )
        ).first()
        if close_friend:
            self.db.delete(close_friend)
            self.db.commit()
            return True
        return False

    def get_close_friend_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(CloseFriend.id)).filter(
            CloseFriend.user_id == user_id
        ).scalar() or 0

    def follow_user(self, follower_id: UUID, following_id: UUID) -> Follow | None:
        existing = (
            self.db.query(Follow)
            .filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id,
                )
            )
            .first()
        )
        if existing:
            return existing

        follow = Follow(follower_id=follower_id, following_id=following_id)
        self.db.add(follow)
        self.db.commit()
        self.db.refresh(follow)
        return follow

    def unfollow_user(self, follower_id: UUID, following_id: UUID) -> bool:
        follow = (
            self.db.query(Follow)
            .filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id,
                )
            )
            .first()
        )
        if follow:
            self.db.delete(follow)
            self.db.commit()
            return True
        return False

    def is_following(self, follower_id: UUID, following_id: UUID) -> bool:
        return (
            self.db.query(Follow)
            .filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id,
                )
            )
            .first()
            is not None
        )

    def get_followers(self, user_id: UUID) -> list[Follow]:
        return (
            self.db.query(Follow)
            .filter(Follow.following_id == user_id)
            .all()
        )

    def get_following(self, user_id: UUID) -> list[Follow]:
        return (
            self.db.query(Follow)
            .filter(Follow.follower_id == user_id)
            .all()
        )

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
