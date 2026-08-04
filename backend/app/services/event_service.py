from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.event_repository import EventRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.events import (
    EventCreate, EventUpdate, EventResponse, EventDetailResponse,
    EventRSVPResponse, EventRSVPListResponse,
    EventInviteResponse, EventInvitesResponse,
    EventChatMessageResponse, EventChatMessagesResponse,
    EventListResponse,
)


class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _enrich_event(self, event, user_id: UUID | None = None) -> EventResponse:
        creator = self.profile_repo.get_by_ids([event.creator_id]).get(event.creator_id)
        is_creator = user_id == event.creator_id if user_id else False
        rsvp_status = None
        if user_id:
            rsvp = self.event_repo.get_rsvp(event.id, user_id)
            if rsvp:
                rsvp_status = rsvp.status
        return EventResponse(
            id=event.id,
            creator_id=event.creator_id,
            username=creator.username if creator else None,
            user_avatar=creator.avatar_url if creator else None,
            title=event.title,
            description=event.description,
            cover_url=event.cover_url,
            event_type=event.event_type,
            location=event.location,
            online_link=event.online_link,
            start_time=event.start_time,
            end_time=event.end_time,
            attendees_count=event.attendees_count or 0,
            invited_count=event.invited_count or 0,
            is_cancelled=event.is_cancelled,
            is_creator=is_creator,
            rsvp_status=rsvp_status,
            reminder_minutes=event.reminder_minutes or 60,
            created_at=event.created_at,
        )

    def _enrich_rsvp(self, rsvp) -> EventRSVPResponse:
        user = self.profile_repo.get_by_ids([rsvp.user_id]).get(rsvp.user_id)
        return EventRSVPResponse(
            id=rsvp.id,
            user_id=rsvp.user_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            status=rsvp.status,
            created_at=rsvp.created_at,
        )

    def _enrich_invite(self, invite) -> EventInviteResponse:
        user = self.profile_repo.get_by_ids([invite.user_id]).get(invite.user_id)
        inviter = self.profile_repo.get_by_ids([invite.inviter_id]).get(invite.inviter_id)
        return EventInviteResponse(
            id=invite.id,
            user_id=invite.user_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            inviter_id=invite.inviter_id,
            inviter_username=inviter.username if inviter else None,
            status=invite.status,
            created_at=invite.created_at,
        )

    def _enrich_chat_message(self, msg) -> EventChatMessageResponse:
        user = self.profile_repo.get_by_ids([msg.user_id]).get(msg.user_id)
        return EventChatMessageResponse(
            id=msg.id,
            user_id=msg.user_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            content=msg.content,
            created_at=msg.created_at,
        )

    def create_event(self, user_id: UUID, data: EventCreate) -> EventResponse:
        event = self.event_repo.create(
            user_id,
            title=data.title,
            description=data.description,
            event_type=data.event_type,
            location=data.location,
            online_link=data.online_link,
            start_time=data.start_time,
            end_time=data.end_time,
            reminder_minutes=data.reminder_minutes,
        )
        return self._enrich_event(event, user_id)

    def get_event(self, event_id: UUID, user_id: UUID | None = None) -> EventDetailResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        creator = self.profile_repo.get_by_ids([event.creator_id]).get(event.creator_id)
        is_creator = user_id == event.creator_id if user_id else False
        rsvp_status = None
        if user_id:
            rsvp = self.event_repo.get_rsvp(event.id, user_id)
            if rsvp:
                rsvp_status = rsvp.status
        return EventDetailResponse(
            id=event.id,
            creator_id=event.creator_id,
            username=creator.username if creator else None,
            user_avatar=creator.avatar_url if creator else None,
            title=event.title,
            description=event.description,
            cover_url=event.cover_url,
            event_type=event.event_type,
            location=event.location,
            online_link=event.online_link,
            start_time=event.start_time,
            end_time=event.end_time,
            attendees_count=event.attendees_count or 0,
            invited_count=event.invited_count or 0,
            is_cancelled=event.is_cancelled,
            is_creator=is_creator,
            rsvp_status=rsvp_status,
            reminder_minutes=event.reminder_minutes or 60,
            created_at=event.created_at,
        )

    def list_events(self, user_id: UUID | None = None, limit: int = 20, offset: int = 0) -> list[EventResponse]:
        events = self.event_repo.list_upcoming(limit, offset)
        return [self._enrich_event(e, user_id) for e in events]

    def list_my_events(self, user_id: UUID) -> list[EventResponse]:
        events = self.event_repo.list_user_events(user_id)
        return [self._enrich_event(e, user_id) for e in events]

    def list_created_events(self, user_id: UUID) -> list[EventResponse]:
        events = self.event_repo.list_created_events(user_id)
        return [self._enrich_event(e, user_id) for e in events]

    def search_events(self, query: str, user_id: UUID | None = None) -> list[EventResponse]:
        events = self.event_repo.search(query)
        return [self._enrich_event(e, user_id) for e in events]

    def update_event(self, event_id: UUID, user_id: UUID, data: EventUpdate) -> EventResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the creator can update this event")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.event_repo.update(event_id, **update_data)
        return self._enrich_event(updated, user_id)

    def cancel_event(self, event_id: UUID, user_id: UUID) -> dict:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the creator can cancel this event")
        self.event_repo.cancel(event_id)
        return {"message": "Event cancelled"}

    def delete_event(self, event_id: UUID, user_id: UUID) -> dict:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the creator can delete this event")
        self.event_repo.delete(event_id)
        return {"message": "Event deleted"}

    def rsvp_event(self, event_id: UUID, user_id: UUID, status: str = "going") -> dict:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.is_cancelled:
            raise HTTPException(status_code=400, detail="Event is cancelled")
        if status not in ("going", "maybe", "declined"):
            raise HTTPException(status_code=400, detail="Invalid status")
        self.event_repo.rsvp(event_id, user_id, status)
        return {"message": f"RSVP updated to {status}"}

    def get_attendees(self, event_id: UUID) -> list[EventRSVPResponse]:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        rsvps = self.event_repo.get_attendees(event_id)
        return [self._enrich_rsvp(r) for r in rsvps]

    def invite_users(self, event_id: UUID, user_id: UUID, data) -> dict:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the creator can send invites")
        self.event_repo.create_invites(event_id, user_id, data.user_ids)
        return {"message": f"Invited {len(data.user_ids)} users"}

    def get_invites(self, event_id: UUID) -> list[EventInviteResponse]:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        invites = self.event_repo.get_invites(event_id)
        return [self._enrich_invite(i) for i in invites]

    def get_my_invites(self, user_id: UUID) -> list[EventInviteResponse]:
        invites = self.event_repo.get_user_invites(user_id)
        return [self._enrich_invite(i) for i in invites]

    def handle_invite(self, invite_id: UUID, user_id: UUID, status: str) -> dict:
        invite = self.event_repo.handle_invite(invite_id, status)
        if not invite:
            raise HTTPException(status_code=404, detail="Invite not found")
        if invite.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your invite")
        return {"message": f"Invite {status}"}

    # Chat
    def send_chat_message(self, event_id: UUID, user_id: UUID, content: str) -> EventChatMessageResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        rsvp = self.event_repo.get_rsvp(event_id, user_id)
        if not rsvp or rsvp.status != "going":
            raise HTTPException(status_code=403, detail="Must be attending to chat")
        msg = self.event_repo.create_chat_message(event_id, user_id, content)
        return self._enrich_chat_message(msg)

    def get_chat_messages(self, event_id: UUID, limit: int = 50, offset: int = 0) -> list[EventChatMessageResponse]:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        messages = self.event_repo.get_chat_messages(event_id, limit, offset)
        return [self._enrich_chat_message(m) for m in messages]

    def delete_chat_message(self, event_id: UUID, user_id: UUID, message_id: UUID) -> dict:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only creator can delete messages")
        self.event_repo.delete_chat_message(message_id)
        return {"message": "Message deleted"}
