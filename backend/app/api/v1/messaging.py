from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.messaging import (
    ConversationCreate,
    ConversationUpdate,
    MessageCreate,
    MessageUpdate,
    MessageReactionCreate,
    ChatPinUpdate,
    ChatArchiveUpdate,
    ChatMuteUpdate,
    OnlineStatusUpdate,
    MessageForward,
    MarkAsRead,
    TypingIndicatorResponse,
    OnlineStatusResponse,
)
from app.services.messaging_service import MessagingService

router = APIRouter()


def get_messaging_service(db: Session = Depends(get_db)) -> MessagingService:
    return MessagingService(db)


# ============================================================
# Conversation Endpoints
# ============================================================


@router.get("/conversations")
def get_conversations(
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_conversations(user_id)


@router.post("/conversations")
def create_conversation(
    data: ConversationCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.create_conversation(user_id, data)


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_conversation(conversation_id, user_id)


@router.put("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: UUID,
    data: ConversationUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.update_conversation(conversation_id, user_id, data)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.delete_conversation(conversation_id, user_id)
    return {"message": "Left conversation"}


@router.post("/conversations/{conversation_id}/members")
def add_members(
    conversation_id: UUID,
    user_ids: list[UUID],
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.add_members(conversation_id, user_id, user_ids)


@router.delete("/conversations/{conversation_id}/members/{target_user_id}")
def remove_member(
    conversation_id: UUID,
    target_user_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.remove_member(conversation_id, user_id, target_user_id)
    return {"message": "Member removed"}


@router.get("/conversations/pinned")
def get_pinned_conversations(
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_pinned_conversations(user_id)


@router.get("/conversations/archived")
def get_archived_conversations(
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_archived_conversations(user_id)


@router.put("/conversations/{conversation_id}/pin")
def toggle_pin(
    conversation_id: UUID,
    data: ChatPinUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.toggle_pin(conversation_id, user_id, data.is_pinned)
    return {"message": "Pin updated"}


@router.put("/conversations/{conversation_id}/archive")
def toggle_archive(
    conversation_id: UUID,
    data: ChatArchiveUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.toggle_archive(conversation_id, user_id, data.is_archived)
    return {"message": "Archive updated"}


@router.put("/conversations/{conversation_id}/mute")
def toggle_mute(
    conversation_id: UUID,
    data: ChatMuteUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.toggle_mute(conversation_id, user_id, data.is_muted)
    return {"message": "Mute updated"}


# ============================================================
# Message Endpoints
# ============================================================


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: UUID,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_messages(conversation_id, user_id, limit, offset)


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: UUID,
    data: MessageCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.send_message(conversation_id, user_id, data)


@router.put("/messages/{message_id}")
def update_message(
    message_id: UUID,
    data: MessageUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.update_message(message_id, user_id, data)


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.delete_message(message_id, user_id)
    return {"message": "Message deleted"}


@router.post("/messages/{message_id}/unsend")
def unsend_message(
    message_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.unsend_message(message_id, user_id)
    return {"message": "Message unsent"}


@router.post("/messages/{message_id}/forward")
def forward_message(
    message_id: UUID,
    data: MessageForward,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.forward_message(message_id, user_id, data.conversation_ids)


# ============================================================
# Message Reactions
# ============================================================


@router.post("/messages/{message_id}/reactions")
def add_reaction(
    message_id: UUID,
    data: MessageReactionCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.add_reaction(message_id, user_id, data.emoji)


@router.delete("/messages/{message_id}/reactions")
def remove_reaction(
    message_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.remove_reaction(message_id, user_id)
    return {"message": "Reaction removed"}


# ============================================================
# Read Receipts
# ============================================================


@router.post("/messages/{message_id}/read")
def mark_as_read(
    message_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.mark_as_read(message_id, user_id)
    return {"message": "Marked as read"}


@router.get("/messages/{message_id}/read-receipts")
def get_read_receipts(
    message_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_message_read_receipts(message_id, user_id)


# ============================================================
# Typing Indicator
# ============================================================


@router.post("/conversations/{conversation_id}/typing")
def set_typing(
    conversation_id: UUID,
    is_typing: bool = Query(default=True),
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.set_typing(conversation_id, user_id, is_typing)


@router.get("/conversations/{conversation_id}/typing")
def get_typing_users(
    conversation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_typing_users(conversation_id)


# ============================================================
# Online Status
# ============================================================


@router.put("/online-status")
def update_online_status(
    data: OnlineStatusUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    service.update_online_status(user_id, data)
    return {"message": "Status updated"}


@router.get("/online-status/{target_user_id}")
def get_online_status(
    target_user_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_online_status(target_user_id)


# ============================================================
# Search
# ============================================================


@router.get("/search")
def search_messages(
    q: str = Query(..., min_length=1),
    conversation_id: UUID | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.search_messages(q, user_id, conversation_id, limit, offset)
