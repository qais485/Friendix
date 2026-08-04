import uuid
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.live_repository import LiveRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.live import (
    LiveStreamCreate,
    LiveStreamUpdate,
    LiveStreamResponse,
    LiveStreamAuthor,
    LiveStreamListResponse,
    LiveChatMessageCreate,
    LiveChatMessageResponse,
    LiveChatMessageListResponse,
    LiveReactionCreate,
    LiveReactionResponse,
    LiveDonationCreate,
    LiveDonationResponse,
    LiveDonationListResponse,
    LiveGuestCreate,
    LiveGuestResponse,
    LiveModeratorCreate,
    LiveModeratorResponse,
    LiveViewerResponse,
    LiveScheduleRequest,
)


class LiveService:
    def __init__(self, db: Session):
        self.db = db
        self.live_repo = LiveRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _generate_stream_key(self) -> str:
        return f"live_{uuid.uuid4().hex}"

    def _enrich_author(self, user) -> LiveStreamAuthor | None:
        if not user:
            return None
        return LiveStreamAuthor(
            id=str(user.id),
            full_name=user.full_name,
            username=user.username,
            avatar_url=user.avatar_url,
            is_verified=user.is_verified,
        )

    def _enrich_stream(self, stream, viewer_id: UUID | None = None) -> LiveStreamResponse:
        author = self.profile_repo.get_by_id(stream.user_id)
        is_owner = viewer_id is not None and stream.user_id == viewer_id
        return LiveStreamResponse(
            id=stream.id,
            user_id=stream.user_id,
            title=stream.title,
            description=stream.description,
            thumbnail_url=stream.thumbnail_url,
            stream_key=stream.stream_key if is_owner else None,
            stream_url=stream.stream_url if is_owner else None,
            playback_url=stream.playback_url,
            status=stream.status,
            privacy=stream.privacy,
            is_recording=stream.is_recording,
            replay_url=stream.replay_url,
            replay_duration=stream.replay_duration,
            scheduled_at=stream.scheduled_at,
            started_at=stream.started_at,
            ended_at=stream.ended_at,
            viewers_count=stream.viewers_count,
            peak_viewers_count=stream.peak_viewers_count,
            likes_count=stream.likes_count,
            comments_count=stream.comments_count,
            donations_count=stream.donations_count,
            donations_total=stream.donations_total,
            allow_chat=stream.allow_chat,
            allow_reactions=stream.allow_reactions,
            allow_donations=stream.allow_donations,
            allow_guests=stream.allow_guests,
            author=self._enrich_author(author),
            is_host=is_owner,
            is_moderator=self.live_repo.is_moderator(stream.id, viewer_id) if viewer_id else False,
            created_at=stream.created_at,
            updated_at=stream.updated_at,
        )

    def _enrich_chat_message(self, message) -> LiveChatMessageResponse:
        author = self.profile_repo.get_by_id(message.user_id)
        return LiveChatMessageResponse(
            id=message.id,
            stream_id=message.stream_id,
            user_id=message.user_id,
            content=message.content,
            is_pinned=message.is_pinned,
            is_deleted=message.is_deleted,
            author=self._enrich_author(author),
            created_at=message.created_at,
        )

    def _enrich_reaction(self, reaction) -> LiveReactionResponse:
        author = self.profile_repo.get_by_id(reaction.user_id)
        return LiveReactionResponse(
            id=reaction.id,
            stream_id=reaction.stream_id,
            user_id=reaction.user_id,
            emoji=reaction.emoji,
            author=self._enrich_author(author),
            created_at=reaction.created_at,
        )

    def _enrich_donation(self, donation) -> LiveDonationResponse:
        author = self.profile_repo.get_by_id(donation.user_id)
        return LiveDonationResponse(
            id=donation.id,
            stream_id=donation.stream_id,
            user_id=donation.user_id,
            amount=donation.amount,
            currency=donation.currency,
            message=donation.message,
            is_anonymous=donation.is_anonymous,
            author=None if donation.is_anonymous else self._enrich_author(author),
            created_at=donation.created_at,
        )

    def _enrich_guest(self, guest) -> LiveGuestResponse:
        author = self.profile_repo.get_by_id(guest.user_id)
        return LiveGuestResponse(
            id=guest.id,
            stream_id=guest.stream_id,
            user_id=guest.user_id,
            status=guest.status,
            joined_at=guest.joined_at,
            left_at=guest.left_at,
            author=self._enrich_author(author),
            created_at=guest.created_at,
        )

    def _enrich_moderator(self, moderator) -> LiveModeratorResponse:
        author = self.profile_repo.get_by_id(moderator.user_id)
        return LiveModeratorResponse(
            id=moderator.id,
            stream_id=moderator.stream_id,
            user_id=moderator.user_id,
            author=self._enrich_author(author),
            created_at=moderator.created_at,
        )

    def create_stream(self, user_id: UUID, data: LiveStreamCreate) -> LiveStreamResponse:
        stream_key = self._generate_stream_key()
        kwargs = {"title": data.title}
        if data.description is not None:
            kwargs["description"] = data.description
        if data.thumbnail_url is not None:
            kwargs["thumbnail_url"] = data.thumbnail_url
        kwargs["privacy"] = data.privacy
        kwargs["allow_chat"] = data.allow_chat
        kwargs["allow_reactions"] = data.allow_reactions
        kwargs["allow_donations"] = data.allow_donations
        kwargs["allow_guests"] = data.allow_guests
        if data.scheduled_at is not None:
            kwargs["scheduled_at"] = data.scheduled_at
            kwargs["status"] = "scheduled"
        else:
            kwargs["status"] = "live"
            kwargs["started_at"] = datetime.now(timezone.utc)
        stream = self.live_repo.create_stream(user_id, stream_key, **kwargs)
        return self._enrich_stream(stream)

    def get_stream(self, stream_id: UUID, viewer_id: UUID | None = None) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.privacy == "only_me" and stream.user_id != viewer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        if stream.privacy == "friends" and stream.user_id != viewer_id:
            from app.models import Friendship
            are_friends = self.db.query(Friendship).filter(
                Friendship.status == "accepted",
                ((Friendship.requester_id == stream.user_id) & (Friendship.addressee_id == viewer_id)) |
                ((Friendship.requester_id == viewer_id) & (Friendship.addressee_id == stream.user_id)),
            ).first() is not None
            if not are_friends:
                raise HTTPException(status_code=403, detail="Access denied")
        return self._enrich_stream(stream, viewer_id)

    def update_stream(self, user_id: UUID, stream_id: UUID, data: LiveStreamUpdate) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.live_repo.update_stream(stream, **update_data)
        return self._enrich_stream(updated)

    def delete_stream(self, user_id: UUID, stream_id: UUID) -> bool:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.live_repo.delete_stream(stream)
        return True

    def go_live(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if stream.status not in ("scheduled", "live"):
            raise HTTPException(status_code=400, detail="Cannot start stream")
        updated = self.live_repo.update_stream(stream, status="live", started_at=datetime.now(timezone.utc))
        return self._enrich_stream(updated)

    def end_stream(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.live_repo.update_stream(stream, status="ended", ended_at=datetime.now(timezone.utc))
        return self._enrich_stream(updated)

    def schedule_stream(self, user_id: UUID, stream_id: UUID, data: LiveScheduleRequest) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.live_repo.update_stream(stream, scheduled_at=data.scheduled_at, status="scheduled")
        return self._enrich_stream(updated)

    def get_active_streams(self, cursor: str | None = None, viewer_id: UUID | None = None) -> LiveStreamListResponse:
        limit = 20
        cursor_uuid = UUID(cursor) if cursor else None
        streams = self.live_repo.get_active_streams(cursor_uuid, limit=limit, viewer_id=viewer_id)
        has_more = len(streams) > limit
        if has_more:
            streams = streams[:limit]
        next_cursor = str(streams[-1].id) if streams and has_more else None
        return LiveStreamListResponse(
            streams=[self._enrich_stream(s, viewer_id) for s in streams],
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def get_user_streams(self, user_id: UUID, cursor: str | None = None, limit: int = 20) -> LiveStreamListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        streams = self.live_repo.get_user_streams(user_id, cursor_uuid, limit)
        has_more = len(streams) > limit
        if has_more:
            streams = streams[:limit]
        next_cursor = str(streams[-1].id) if streams and has_more else None
        return LiveStreamListResponse(
            streams=[self._enrich_stream(s) for s in streams],
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def get_scheduled_streams(self, cursor: str | None = None, viewer_id: UUID | None = None) -> LiveStreamListResponse:
        limit = 20
        cursor_uuid = UUID(cursor) if cursor else None
        streams = self.live_repo.get_scheduled_streams(cursor_uuid, limit=limit, viewer_id=viewer_id)
        has_more = len(streams) > limit
        if has_more:
            streams = streams[:limit]
        next_cursor = str(streams[-1].id) if streams and has_more else None
        return LiveStreamListResponse(
            streams=[self._enrich_stream(s, viewer_id) for s in streams],
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def get_replays(self, cursor: str | None = None, viewer_id: UUID | None = None) -> LiveStreamListResponse:
        limit = 20
        cursor_uuid = UUID(cursor) if cursor else None
        streams = self.live_repo.get_ended_replays(cursor_uuid, limit=limit, viewer_id=viewer_id)
        has_more = len(streams) > limit
        if has_more:
            streams = streams[:limit]
        next_cursor = str(streams[-1].id) if streams and has_more else None
        return LiveStreamListResponse(
            streams=[self._enrich_stream(s, viewer_id) for s in streams],
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def join_stream(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.status != "live":
            raise HTTPException(status_code=400, detail="Stream is not live")
        # Privacy check
        if stream.privacy == "only_me" and stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        if stream.privacy == "friends" and stream.user_id != user_id:
            from app.models import Friendship
            are_friends = self.db.query(Friendship).filter(
                Friendship.status == "accepted",
                ((Friendship.requester_id == stream.user_id) & (Friendship.addressee_id == user_id)) |
                ((Friendship.requester_id == user_id) & (Friendship.addressee_id == stream.user_id)),
            ).first() is not None
            if not are_friends:
                raise HTTPException(status_code=403, detail="Access denied")
        self.live_repo.add_viewer(stream_id, user_id)
        updated = self.live_repo.increment_viewers(stream_id)
        return self._enrich_stream(updated, user_id)

    def leave_stream(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        self.live_repo.remove_viewer(stream_id, user_id)
        updated = self.live_repo.decrement_viewers(stream_id)
        return self._enrich_stream(updated)

    def send_chat_message(self, user_id: UUID, stream_id: UUID, data: LiveChatMessageCreate) -> LiveChatMessageResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if not stream.allow_chat:
            raise HTTPException(status_code=400, detail="Chat is disabled")
        if stream.user_id != user_id:
            is_mod = self.live_repo.is_moderator(stream_id, user_id)
            is_guest = self.live_repo.is_guest(stream_id, user_id)
            if stream.status == "live" and not (is_mod or (is_guest and is_guest.status == "accepted")):
                pass  # Allow anyone to chat in live streams
            elif stream.status != "live":
                raise HTTPException(status_code=400, detail="Stream is not live")
        message = self.live_repo.create_chat_message(stream_id, user_id, data.content)
        return self._enrich_chat_message(message)

    def get_chat_messages(self, stream_id: UUID, cursor: str | None = None, limit: int = 50) -> LiveChatMessageListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        messages = self.live_repo.get_chat_messages(stream_id, cursor_uuid, limit)
        has_more = len(messages) > limit
        if has_more:
            messages = messages[:limit]
        next_cursor = str(messages[-1].id) if messages and has_more else None
        return LiveChatMessageListResponse(
            messages=[self._enrich_chat_message(m) for m in messages],
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def send_reaction(self, user_id: UUID, stream_id: UUID, data: LiveReactionCreate) -> LiveReactionResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if not stream.allow_reactions:
            raise HTTPException(status_code=400, detail="Reactions are disabled")
        reaction = self.live_repo.create_reaction(stream_id, user_id, data.emoji)
        return self._enrich_reaction(reaction)

    def send_donation(self, user_id: UUID, stream_id: UUID, data: LiveDonationCreate) -> LiveDonationResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if not stream.allow_donations:
            raise HTTPException(status_code=400, detail="Donations are disabled")
        if user_id == stream.user_id:
            raise HTTPException(status_code=400, detail="Cannot donate to your own stream")
        donation = self.live_repo.create_donation(
            stream_id, user_id, data.amount, data.currency, data.message, data.is_anonymous
        )
        return self._enrich_donation(donation)

    def get_donations(self, stream_id: UUID, cursor: str | None = None) -> LiveDonationListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        donations = self.live_repo.get_donations(stream_id, cursor_uuid)
        total_amount, total_count = self.live_repo.get_donation_totals(stream_id)
        has_more = len(donations) > 50
        if has_more:
            donations = donations[:50]
        return LiveDonationListResponse(
            donations=[self._enrich_donation(d) for d in donations],
            total_amount=total_amount,
            total_count=total_count,
        )

    def invite_guest(self, user_id: UUID, stream_id: UUID, data: LiveGuestCreate) -> LiveGuestResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if not stream.allow_guests:
            raise HTTPException(status_code=400, detail="Guests are disabled")
        target_user_id = UUID(data.user_id)
        guest = self.live_repo.invite_guest(stream_id, target_user_id)
        return self._enrich_guest(guest)

    def accept_guest_invite(self, user_id: UUID, stream_id: UUID) -> LiveGuestResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        guest = self.live_repo.update_guest_status(stream_id, user_id, "accepted")
        if not guest:
            raise HTTPException(status_code=404, detail="Guest invitation not found")
        return self._enrich_guest(guest)

    def reject_guest_invite(self, user_id: UUID, stream_id: UUID) -> LiveGuestResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        guest = self.live_repo.update_guest_status(stream_id, user_id, "rejected")
        if not guest:
            raise HTTPException(status_code=404, detail="Guest invitation not found")
        return self._enrich_guest(guest)

    def remove_guest(self, owner_id: UUID, stream_id: UUID, guest_user_id: UUID) -> LiveGuestResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != owner_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        guest = self.live_repo.update_guest_status(stream_id, guest_user_id, "removed")
        if not guest:
            raise HTTPException(status_code=404, detail="Guest not found")
        return self._enrich_guest(guest)

    def get_guests(self, stream_id: UUID) -> list[LiveGuestResponse]:
        guests = self.live_repo.get_guests(stream_id)
        return [self._enrich_guest(g) for g in guests]

    def add_moderator(self, user_id: UUID, stream_id: UUID, data: LiveModeratorCreate) -> LiveModeratorResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        target_user_id = UUID(data.user_id)
        moderator = self.live_repo.add_moderator(stream_id, target_user_id)
        return self._enrich_moderator(moderator)

    def remove_moderator(self, user_id: UUID, stream_id: UUID, moderator_user_id: UUID) -> bool:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return self.live_repo.remove_moderator(stream_id, moderator_user_id)

    def get_moderators(self, stream_id: UUID) -> list[LiveModeratorResponse]:
        moderators = self.live_repo.get_moderators(stream_id)
        return [self._enrich_moderator(m) for m in moderators]

    def start_recording(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if stream.status != "live":
            raise HTTPException(status_code=400, detail="Stream is not live")
        updated = self.live_repo.update_stream(stream, is_recording=True)
        return self._enrich_stream(updated)

    def stop_recording(self, user_id: UUID, stream_id: UUID) -> LiveStreamResponse:
        stream = self.live_repo.get_stream_by_id(stream_id)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        if stream.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.live_repo.update_stream(stream, is_recording=False)
        return self._enrich_stream(updated)
