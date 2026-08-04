from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.events import (
    EventCreate, EventUpdate, EventResponse, EventDetailResponse,
    EventListResponse, EventRSVPListResponse,
    EventInviteCreate, EventInvitesResponse,
    EventChatMessageCreate, EventChatMessagesResponse,
)
from app.services.event_service import EventService

router = APIRouter()


def get_event_service(db: Session = Depends(get_db)) -> EventService:
    return EventService(db)


@router.get("", response_model=EventListResponse)
def list_events(
    q: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str | None = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    uid = user_id if user_id else None
    if q:
        return {"events": service.search_events(q, uid)}
    return {"events": service.list_events(uid, limit, offset)}


@router.get("/my", response_model=EventListResponse)
def list_my_events(
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return {"events": service.list_my_events(user_id)}


@router.get("/created", response_model=EventListResponse)
def list_created_events(
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return {"events": service.list_created_events(user_id)}


@router.get("/invites", response_model=EventInvitesResponse)
def get_my_invites(
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return {"invites": service.get_my_invites(user_id)}


@router.post("", response_model=EventResponse)
def create_event(
    data: EventCreate,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.create_event(user_id, data)


@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(
    event_id: str,
    user_id: str | None = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    uid = user_id if user_id else None
    return service.get_event(event_id, uid)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    data: EventUpdate,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.update_event(event_id, user_id, data)


@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.delete_event(event_id, user_id)


@router.post("/{event_id}/cancel")
def cancel_event(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.cancel_event(event_id, user_id)


@router.post("/{event_id}/rsvp")
def rsvp_event(
    event_id: str,
    status: str = "going",
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.rsvp_event(event_id, user_id, status)


@router.get("/{event_id}/attendees", response_model=EventRSVPListResponse)
def get_attendees(
    event_id: str,
    service: EventService = Depends(get_event_service),
):
    return {"attendees": service.get_attendees(event_id)}


@router.post("/{event_id}/invite")
def invite_users(
    event_id: str,
    data: EventInviteCreate,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.invite_users(event_id, user_id, data)


@router.get("/{event_id}/invites", response_model=EventInvitesResponse)
def get_event_invites(
    event_id: str,
    service: EventService = Depends(get_event_service),
):
    return {"invites": service.get_invites(event_id)}


@router.put("/invites/{invite_id}")
def handle_invite(
    invite_id: str,
    status: str,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.handle_invite(invite_id, user_id, status)


@router.post("/{event_id}/chat", response_model=EventChatMessagesResponse)
def send_chat_message(
    event_id: str,
    data: EventChatMessageCreate,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    msg = service.send_chat_message(event_id, user_id, data.content)
    return {"messages": [msg]}


@router.get("/{event_id}/chat", response_model=EventChatMessagesResponse)
def get_chat_messages(
    event_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: EventService = Depends(get_event_service),
):
    return {"messages": service.get_chat_messages(event_id, limit, offset)}


@router.delete("/{event_id}/chat/{message_id}")
def delete_chat_message(
    event_id: str,
    message_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EventService = Depends(get_event_service),
):
    return service.delete_chat_message(event_id, user_id, message_id)
