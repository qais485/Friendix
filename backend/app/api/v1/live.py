from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.live import (
    LiveStreamCreate,
    LiveStreamUpdate,
    LiveStreamResponse,
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
from app.services.live_service import LiveService

router = APIRouter()


def get_live_service(db: Session = Depends(get_db)) -> LiveService:
    return LiveService(db)


@router.post("/", response_model=LiveStreamResponse)
def create_stream(
    data: LiveStreamCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.create_stream(user_id, data)


@router.get("/", response_model=LiveStreamListResponse)
def get_active_streams(
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_active_streams(cursor, user_id)


@router.get("/scheduled", response_model=LiveStreamListResponse)
def get_scheduled_streams(
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_scheduled_streams(cursor, user_id)


@router.get("/replays", response_model=LiveStreamListResponse)
def get_replays(
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_replays(cursor, user_id)


@router.get("/my", response_model=LiveStreamListResponse)
def get_my_streams(
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_user_streams(user_id, cursor)


@router.get("/{stream_id}", response_model=LiveStreamResponse)
def get_stream(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_stream(UUID(stream_id), user_id)


@router.put("/{stream_id}", response_model=LiveStreamResponse)
def update_stream(
    stream_id: str,
    data: LiveStreamUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.update_stream(user_id, UUID(stream_id), data)


@router.delete("/{stream_id}")
def delete_stream(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    service.delete_stream(user_id, UUID(stream_id))
    return {"message": "Stream deleted"}


@router.post("/{stream_id}/go-live", response_model=LiveStreamResponse)
def go_live(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.go_live(user_id, UUID(stream_id))


@router.post("/{stream_id}/end", response_model=LiveStreamResponse)
def end_stream(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.end_stream(user_id, UUID(stream_id))


@router.post("/{stream_id}/schedule", response_model=LiveStreamResponse)
def schedule_stream(
    stream_id: str,
    data: LiveScheduleRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.schedule_stream(user_id, UUID(stream_id), data)


@router.post("/{stream_id}/join", response_model=LiveStreamResponse)
def join_stream(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.join_stream(user_id, UUID(stream_id))


@router.post("/{stream_id}/leave", response_model=LiveStreamResponse)
def leave_stream(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.leave_stream(user_id, UUID(stream_id))


@router.get("/{stream_id}/chat", response_model=LiveChatMessageListResponse)
def get_chat_messages(
    stream_id: str,
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_chat_messages(UUID(stream_id), cursor)


@router.post("/{stream_id}/chat", response_model=LiveChatMessageResponse)
def send_chat_message(
    stream_id: str,
    data: LiveChatMessageCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.send_chat_message(user_id, UUID(stream_id), data)


@router.post("/{stream_id}/reactions", response_model=LiveReactionResponse)
def send_reaction(
    stream_id: str,
    data: LiveReactionCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.send_reaction(user_id, UUID(stream_id), data)


@router.post("/{stream_id}/donations", response_model=LiveDonationResponse)
def send_donation(
    stream_id: str,
    data: LiveDonationCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.send_donation(user_id, UUID(stream_id), data)


@router.get("/{stream_id}/donations", response_model=LiveDonationListResponse)
def get_donations(
    stream_id: str,
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_donations(UUID(stream_id), cursor)


@router.post("/{stream_id}/guests/invite", response_model=LiveGuestResponse)
def invite_guest(
    stream_id: str,
    data: LiveGuestCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.invite_guest(user_id, UUID(stream_id), data)


@router.post("/{stream_id}/guests/accept", response_model=LiveGuestResponse)
def accept_guest_invite(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.accept_guest_invite(user_id, UUID(stream_id))


@router.post("/{stream_id}/guests/reject", response_model=LiveGuestResponse)
def reject_guest_invite(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.reject_guest_invite(user_id, UUID(stream_id))


@router.delete("/{stream_id}/guests/{guest_user_id}", response_model=LiveGuestResponse)
def remove_guest(
    stream_id: str,
    guest_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.remove_guest(user_id, UUID(stream_id), UUID(guest_user_id))


@router.get("/{stream_id}/guests", response_model=list[LiveGuestResponse])
def get_guests(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_guests(UUID(stream_id))


@router.post("/{stream_id}/moderators", response_model=LiveModeratorResponse)
def add_moderator(
    stream_id: str,
    data: LiveModeratorCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.add_moderator(user_id, UUID(stream_id), data)


@router.delete("/{stream_id}/moderators/{moderator_user_id}")
def remove_moderator(
    stream_id: str,
    moderator_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    service.remove_moderator(user_id, UUID(stream_id), UUID(moderator_user_id))
    return {"message": "Moderator removed"}


@router.get("/{stream_id}/moderators", response_model=list[LiveModeratorResponse])
def get_moderators(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.get_moderators(UUID(stream_id))


@router.post("/{stream_id}/record", response_model=LiveStreamResponse)
def start_recording(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.start_recording(user_id, UUID(stream_id))


@router.post("/{stream_id}/stop-record", response_model=LiveStreamResponse)
def stop_recording(
    stream_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: LiveService = Depends(get_live_service),
):
    return service.stop_recording(user_id, UUID(stream_id))
