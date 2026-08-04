import uuid
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, case
from app.models import (
    LiveStream, LiveChatMessage, LiveReaction, LiveDonation, LiveGuest,
    LiveModerator, LiveViewer, User, Friendship,
)


class LiveRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_stream(self, user_id: UUID, stream_key: str, **kwargs) -> LiveStream:
        stream = LiveStream(user_id=user_id, stream_key=stream_key, **kwargs)
        self.db.add(stream)
        self.db.commit()
        self.db.refresh(stream)
        return stream

    def get_stream_by_id(self, stream_id: UUID) -> LiveStream | None:
        return self.db.query(LiveStream).filter(LiveStream.id == stream_id).first()

    def get_stream_by_key(self, stream_key: str) -> LiveStream | None:
        return self.db.query(LiveStream).filter(LiveStream.stream_key == stream_key).first()

    def update_stream(self, stream: LiveStream, **kwargs) -> LiveStream:
        for key, value in kwargs.items():
            setattr(stream, key, value)
        self.db.commit()
        self.db.refresh(stream)
        return stream

    def delete_stream(self, stream: LiveStream) -> None:
        self.db.delete(stream)
        self.db.commit()

    def get_active_streams(self, cursor: UUID | None = None, limit: int = 20, viewer_id: UUID | None = None) -> list[LiveStream]:
        base_filter = [LiveStream.status.in_(["live", "scheduled"])]
        if viewer_id:
            from app.models import BlockedUser
            blocked_ids_q = self.db.query(BlockedUser.blocked_user_id).filter(
                BlockedUser.user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            blocking_ids_q = self.db.query(BlockedUser.user_id).filter(
                BlockedUser.blocked_user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            base_filter.append(~LiveStream.user_id.in_(
                self.db.query(blocked_ids_q.c.blocked_user_id).union(self.db.query(blocking_ids_q.c.user_id))
            ))

            friend_ids_subq = self.db.query(
                case(
                    (Friendship.requester_id == viewer_id, Friendship.addressee_id),
                    else_=Friendship.requester_id,
                )
            ).filter(
                and_(
                    or_(Friendship.requester_id == viewer_id, Friendship.addressee_id == viewer_id),
                    Friendship.status == "accepted",
                )
            ).subquery()
            friend_ids = [r[0] for r in self.db.query(friend_ids_subq.c).all()]

            base_filter.append(
                or_(
                    LiveStream.privacy == "everyone",
                    LiveStream.user_id == viewer_id,
                    and_(LiveStream.privacy == "friends", LiveStream.user_id.in_(friend_ids)) if friend_ids else False,
                )
            )
        query = self.db.query(LiveStream).filter(and_(*base_filter))
        if cursor:
            cursor_stream = self.db.query(LiveStream).filter(LiveStream.id == cursor).first()
            if cursor_stream:
                query = query.filter(LiveStream.created_at < cursor_stream.created_at)
        return query.order_by(desc(LiveStream.created_at)).limit(limit + 1).all()

    def get_user_streams(self, user_id: UUID, cursor: UUID | None = None, limit: int = 20) -> list[LiveStream]:
        query = self.db.query(LiveStream).filter(LiveStream.user_id == user_id)
        if cursor:
            cursor_stream = self.db.query(LiveStream).filter(LiveStream.id == cursor).first()
            if cursor_stream:
                query = query.filter(LiveStream.created_at < cursor_stream.created_at)
        return query.order_by(desc(LiveStream.created_at)).limit(limit + 1).all()

    def get_scheduled_streams(self, cursor: UUID | None = None, limit: int = 20, viewer_id: UUID | None = None) -> list[LiveStream]:
        base_filter = [LiveStream.status == "scheduled"]
        if viewer_id:
            from app.models import BlockedUser
            blocked_ids_q = self.db.query(BlockedUser.blocked_user_id).filter(
                BlockedUser.user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            blocking_ids_q = self.db.query(BlockedUser.user_id).filter(
                BlockedUser.blocked_user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            base_filter.append(~LiveStream.user_id.in_(
                self.db.query(blocked_ids_q.c.blocked_user_id).union(self.db.query(blocking_ids_q.c.user_id))
            ))

            friend_ids_subq = self.db.query(
                case(
                    (Friendship.requester_id == viewer_id, Friendship.addressee_id),
                    else_=Friendship.requester_id,
                )
            ).filter(
                and_(
                    or_(Friendship.requester_id == viewer_id, Friendship.addressee_id == viewer_id),
                    Friendship.status == "accepted",
                )
            ).subquery()
            friend_ids = [r[0] for r in self.db.query(friend_ids_subq.c).all()]

            base_filter.append(
                or_(
                    LiveStream.privacy == "everyone",
                    LiveStream.user_id == viewer_id,
                    and_(LiveStream.privacy == "friends", LiveStream.user_id.in_(friend_ids)) if friend_ids else False,
                )
            )
        query = self.db.query(LiveStream).filter(and_(*base_filter))
        if cursor:
            cursor_stream = self.db.query(LiveStream).filter(LiveStream.id == cursor).first()
            if cursor_stream:
                query = query.filter(LiveStream.scheduled_at > cursor_stream.scheduled_at)
        return query.order_by(LiveStream.scheduled_at).limit(limit + 1).all()

    def get_ended_replays(self, cursor: UUID | None = None, limit: int = 20, viewer_id: UUID | None = None) -> list[LiveStream]:
        base_filter = [LiveStream.status == "ended", LiveStream.replay_url.isnot(None)]
        if viewer_id:
            from app.models import BlockedUser
            blocked_ids_q = self.db.query(BlockedUser.blocked_user_id).filter(
                BlockedUser.user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            blocking_ids_q = self.db.query(BlockedUser.user_id).filter(
                BlockedUser.blocked_user_id == viewer_id, BlockedUser.block_type == "block"
            ).subquery()
            base_filter.append(~LiveStream.user_id.in_(
                self.db.query(blocked_ids_q.c.blocked_user_id).union(self.db.query(blocking_ids_q.c.user_id))
            ))

            friend_ids_subq = self.db.query(
                case(
                    (Friendship.requester_id == viewer_id, Friendship.addressee_id),
                    else_=Friendship.requester_id,
                )
            ).filter(
                and_(
                    or_(Friendship.requester_id == viewer_id, Friendship.addressee_id == viewer_id),
                    Friendship.status == "accepted",
                )
            ).subquery()
            friend_ids = [r[0] for r in self.db.query(friend_ids_subq.c).all()]

            base_filter.append(
                or_(
                    LiveStream.privacy == "everyone",
                    LiveStream.user_id == viewer_id,
                    and_(LiveStream.privacy == "friends", LiveStream.user_id.in_(friend_ids)) if friend_ids else False,
                )
            )
        query = self.db.query(LiveStream).filter(and_(*base_filter))
        if cursor:
            cursor_stream = self.db.query(LiveStream).filter(LiveStream.id == cursor).first()
            if cursor_stream:
                query = query.filter(LiveStream.ended_at < cursor_stream.ended_at)
        return query.order_by(desc(LiveStream.ended_at)).limit(limit + 1).all()

    def increment_viewers(self, stream_id: UUID) -> LiveStream | None:
        stream = self.db.query(LiveStream).filter(LiveStream.id == stream_id).first()
        if stream:
            count = self.db.query(func.count(LiveViewer.id)).filter(LiveViewer.stream_id == stream_id).scalar() or 0
            stream.viewers_count = count
            if count > stream.peak_viewers_count:
                stream.peak_viewers_count = count
            self.db.commit()
            self.db.refresh(stream)
        return stream

    def decrement_viewers(self, stream_id: UUID) -> LiveStream | None:
        stream = self.db.query(LiveStream).filter(LiveStream.id == stream_id).first()
        if stream:
            count = self.db.query(func.count(LiveViewer.id)).filter(LiveViewer.stream_id == stream_id).scalar() or 0
            stream.viewers_count = count
            self.db.commit()
            self.db.refresh(stream)
        return stream

    def add_viewer(self, stream_id: UUID, user_id: UUID) -> LiveViewer:
        existing = self.db.query(LiveViewer).filter(
            and_(LiveViewer.stream_id == stream_id, LiveViewer.user_id == user_id)
        ).first()
        if existing:
            existing.last_seen_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        viewer = LiveViewer(stream_id=stream_id, user_id=user_id)
        self.db.add(viewer)
        self.db.commit()
        self.db.refresh(viewer)
        return viewer

    def remove_viewer(self, stream_id: UUID, user_id: UUID) -> bool:
        viewer = self.db.query(LiveViewer).filter(
            and_(LiveViewer.stream_id == stream_id, LiveViewer.user_id == user_id)
        ).first()
        if viewer:
            self.db.delete(viewer)
            self.db.commit()
            return True
        return False

    def get_stream_viewers(self, stream_id: UUID) -> list[LiveViewer]:
        return self.db.query(LiveViewer).filter(LiveViewer.stream_id == stream_id).all()

    def create_chat_message(self, stream_id: UUID, user_id: UUID, content: str) -> LiveChatMessage:
        message = LiveChatMessage(stream_id=stream_id, user_id=user_id, content=content)
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_chat_messages(self, stream_id: UUID, cursor: UUID | None = None, limit: int = 50) -> list[LiveChatMessage]:
        query = self.db.query(LiveChatMessage).filter(
            and_(LiveChatMessage.stream_id == stream_id, LiveChatMessage.is_deleted == False)
        )
        if cursor:
            cursor_msg = self.db.query(LiveChatMessage).filter(LiveChatMessage.id == cursor).first()
            if cursor_msg:
                query = query.filter(LiveChatMessage.created_at < cursor_msg.created_at)
        return query.order_by(desc(LiveChatMessage.created_at)).limit(limit + 1).all()

    def pin_chat_message(self, message_id: UUID) -> LiveChatMessage | None:
        message = self.db.query(LiveChatMessage).filter(LiveChatMessage.id == message_id).first()
        if message:
            message.is_pinned = True
            self.db.commit()
            self.db.refresh(message)
        return message

    def delete_chat_message(self, message_id: UUID) -> bool:
        message = self.db.query(LiveChatMessage).filter(LiveChatMessage.id == message_id).first()
        if message:
            message.is_deleted = True
            self.db.commit()
            return True
        return False

    def create_reaction(self, stream_id: UUID, user_id: UUID, emoji: str) -> LiveReaction:
        reaction = LiveReaction(stream_id=stream_id, user_id=user_id, emoji=emoji)
        self.db.add(reaction)
        self.db.commit()
        self.db.refresh(reaction)
        return reaction

    def create_donation(self, stream_id: UUID, user_id: UUID, amount: float, currency: str, message: str | None, is_anonymous: bool) -> LiveDonation:
        donation = LiveDonation(
            stream_id=stream_id,
            user_id=user_id,
            amount=amount,
            currency=currency,
            message=message,
            is_anonymous=is_anonymous,
        )
        self.db.add(donation)
        stream = self.db.query(LiveStream).filter(LiveStream.id == stream_id).first()
        if stream:
            stream.donations_count += 1
            stream.donations_total += amount
        self.db.commit()
        self.db.refresh(donation)
        return donation

    def get_donations(self, stream_id: UUID, cursor: UUID | None = None, limit: int = 50) -> list[LiveDonation]:
        query = self.db.query(LiveDonation).filter(LiveDonation.stream_id == stream_id)
        if cursor:
            cursor_donation = self.db.query(LiveDonation).filter(LiveDonation.id == cursor).first()
            if cursor_donation:
                query = query.filter(LiveDonation.created_at < cursor_donation.created_at)
        return query.order_by(desc(LiveDonation.created_at)).limit(limit + 1).all()

    def get_donation_totals(self, stream_id: UUID) -> tuple[float, int]:
        result = self.db.query(
            func.coalesce(func.sum(LiveDonation.amount), 0),
            func.count(LiveDonation.id),
        ).filter(LiveDonation.stream_id == stream_id).first()
        return (float(result[0]), result[1])

    def invite_guest(self, stream_id: UUID, user_id: UUID) -> LiveGuest:
        existing = self.db.query(LiveGuest).filter(
            and_(LiveGuest.stream_id == stream_id, LiveGuest.user_id == user_id)
        ).first()
        if existing:
            return existing
        guest = LiveGuest(stream_id=stream_id, user_id=user_id, status="pending")
        self.db.add(guest)
        self.db.commit()
        self.db.refresh(guest)
        return guest

    def update_guest_status(self, stream_id: UUID, user_id: UUID, status: str) -> LiveGuest | None:
        guest = self.db.query(LiveGuest).filter(
            and_(LiveGuest.stream_id == stream_id, LiveGuest.user_id == user_id)
        ).first()
        if guest:
            guest.status = status
            if status == "accepted":
                guest.joined_at = datetime.now(timezone.utc)
            elif status in ("rejected", "removed"):
                guest.left_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(guest)
        return guest

    def get_guests(self, stream_id: UUID) -> list[LiveGuest]:
        return self.db.query(LiveGuest).filter(LiveGuest.stream_id == stream_id).all()

    def add_moderator(self, stream_id: UUID, user_id: UUID) -> LiveModerator:
        existing = self.db.query(LiveModerator).filter(
            and_(LiveModerator.stream_id == stream_id, LiveModerator.user_id == user_id)
        ).first()
        if existing:
            return existing
        moderator = LiveModerator(stream_id=stream_id, user_id=user_id)
        self.db.add(moderator)
        self.db.commit()
        self.db.refresh(moderator)
        return moderator

    def remove_moderator(self, stream_id: UUID, user_id: UUID) -> bool:
        moderator = self.db.query(LiveModerator).filter(
            and_(LiveModerator.stream_id == stream_id, LiveModerator.user_id == user_id)
        ).first()
        if moderator:
            self.db.delete(moderator)
            self.db.commit()
            return True
        return False

    def get_moderators(self, stream_id: UUID) -> list[LiveModerator]:
        return self.db.query(LiveModerator).filter(LiveModerator.stream_id == stream_id).all()

    def is_moderator(self, stream_id: UUID, user_id: UUID) -> bool:
        return self.db.query(LiveModerator).filter(
            and_(LiveModerator.stream_id == stream_id, LiveModerator.user_id == user_id)
        ).first() is not None

    def is_guest(self, stream_id: UUID, user_id: UUID) -> LiveGuest | None:
        return self.db.query(LiveGuest).filter(
            and_(LiveGuest.stream_id == stream_id, LiveGuest.user_id == user_id)
        ).first()
