from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models import Event, EventRSVP, EventInvite, EventChatMessage, User


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, creator_id: UUID, **kwargs) -> Event:
        event = Event(creator_id=creator_id, **kwargs)
        self.db.add(event)
        self.db.flush()
        rsvp = EventRSVP(user_id=creator_id, event_id=event.id, status="going")
        self.db.add(rsvp)
        event.attendees_count = 1
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: UUID) -> Event | None:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def list_upcoming(self, limit: int = 20, offset: int = 0) -> list[Event]:
        return (
            self.db.query(Event)
            .filter(and_(Event.is_cancelled == False))
            .order_by(Event.start_time)
            .offset(offset)
            .limit(limit)
            .all()
        )

    def list_user_events(self, user_id: UUID) -> list[Event]:
        return (
            self.db.query(Event)
            .join(EventRSVP, and_(EventRSVP.event_id == Event.id, EventRSVP.user_id == user_id))
            .filter(Event.is_cancelled == False)
            .order_by(Event.start_time)
            .all()
        )

    def list_created_events(self, user_id: UUID) -> list[Event]:
        return (
            self.db.query(Event)
            .filter(and_(Event.creator_id == user_id, Event.is_cancelled == False))
            .order_by(Event.start_time)
            .all()
        )

    def search(self, query: str, limit: int = 20) -> list[Event]:
        search = f"%{query}%"
        return (
            self.db.query(Event)
            .filter(and_(Event.is_cancelled == False, Event.title.ilike(search)))
            .order_by(Event.start_time)
            .limit(limit)
            .all()
        )

    def update(self, event_id: UUID, **kwargs) -> Event | None:
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(event, key, value)
        self.db.commit()
        self.db.refresh(event)
        return event

    def cancel(self, event_id: UUID) -> bool:
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if event:
            event.is_cancelled = True
            self.db.commit()
            return True
        return False

    def delete(self, event_id: UUID) -> bool:
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if event:
            self.db.delete(event)
            self.db.commit()
            return True
        return False

    # RSVP
    def rsvp(self, event_id: UUID, user_id: UUID, status: str = "going") -> EventRSVP:
        existing = (
            self.db.query(EventRSVP)
            .filter(and_(EventRSVP.event_id == event_id, EventRSVP.user_id == user_id))
            .first()
        )
        if existing:
            old_status = existing.status
            existing.status = status
            event = self.db.query(Event).filter(Event.id == event_id).first()
            if event:
                if old_status != "going" and status == "going":
                    event.attendees_count = (event.attendees_count or 0) + 1
                elif old_status == "going" and status != "going":
                    event.attendees_count = max(0, (event.attendees_count or 0) - 1)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        rsvp = EventRSVP(user_id=user_id, event_id=event_id, status=status)
        self.db.add(rsvp)
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if event and status == "going":
            event.attendees_count = (event.attendees_count or 0) + 1
        self.db.commit()
        self.db.refresh(rsvp)
        return rsvp

    def get_rsvp(self, event_id: UUID, user_id: UUID) -> EventRSVP | None:
        return (
            self.db.query(EventRSVP)
            .filter(and_(EventRSVP.event_id == event_id, EventRSVP.user_id == user_id))
            .first()
        )

    def get_attendees(self, event_id: UUID) -> list[EventRSVP]:
        return (
            self.db.query(EventRSVP)
            .filter(and_(EventRSVP.event_id == event_id, EventRSVP.status == "going"))
            .order_by(EventRSVP.created_at)
            .all()
        )

    # Invites
    def create_invites(self, event_id: UUID, inviter_id: UUID, user_ids: list[UUID]) -> list[EventInvite]:
        invites = []
        for uid in user_ids:
            existing = (
                self.db.query(EventInvite)
                .filter(and_(EventInvite.event_id == event_id, EventInvite.user_id == uid))
                .first()
            )
            if existing:
                continue
            invite = EventInvite(user_id=uid, event_id=event_id, inviter_id=inviter_id, status="pending")
            self.db.add(invite)
            invites.append(invite)
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if event:
            event.invited_count = (event.invited_count or 0) + len(invites)
        self.db.commit()
        return invites

    def get_invites(self, event_id: UUID) -> list[EventInvite]:
        return (
            self.db.query(EventInvite)
            .filter(EventInvite.event_id == event_id)
            .order_by(desc(EventInvite.created_at))
            .all()
        )

    def get_user_invites(self, user_id: UUID) -> list[EventInvite]:
        return (
            self.db.query(EventInvite)
            .filter(and_(EventInvite.user_id == user_id, EventInvite.status == "pending"))
            .order_by(desc(EventInvite.created_at))
            .all()
        )

    def handle_invite(self, invite_id: UUID, status: str) -> EventInvite | None:
        invite = self.db.query(EventInvite).filter(EventInvite.id == invite_id).first()
        if not invite:
            return None
        invite.status = status
        if status == "accepted":
            self.rsvp(invite.event_id, invite.user_id, "going")
        self.db.commit()
        self.db.refresh(invite)
        return invite

    # Chat
    def create_chat_message(self, event_id: UUID, user_id: UUID, content: str) -> EventChatMessage:
        msg = EventChatMessage(event_id=event_id, user_id=user_id, content=content)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def get_chat_messages(self, event_id: UUID, limit: int = 50, offset: int = 0) -> list[EventChatMessage]:
        return (
            self.db.query(EventChatMessage)
            .filter(EventChatMessage.event_id == event_id)
            .order_by(desc(EventChatMessage.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def delete_chat_message(self, message_id: UUID) -> bool:
        msg = self.db.query(EventChatMessage).filter(EventChatMessage.id == message_id).first()
        if msg:
            self.db.delete(msg)
            self.db.commit()
            return True
        return False
