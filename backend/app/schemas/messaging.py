from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


# ============================================================
# Conversation Schemas
# ============================================================


class ConversationCreate(BaseModel):
    participant_ids: list[UUID]
    title: Optional[str] = Field(None, max_length=255)
    is_group: bool = False


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    group_photo_url: Optional[str] = None
    chat_theme: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None


class ConversationMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: str
    is_muted: bool
    is_notifications_paused: bool
    is_pinned: bool
    is_archived: bool
    last_read_at: Optional[datetime]
    joined_at: datetime
    is_left: bool
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_online: bool = False
    last_seen_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: UUID
    title: Optional[str]
    is_group: bool
    group_photo_url: Optional[str]
    created_by_id: Optional[UUID]
    last_message_id: Optional[UUID]
    last_message_at: Optional[datetime]
    is_archived: bool
    is_pinned: bool
    chat_theme: str
    created_at: datetime
    updated_at: datetime
    members: list[ConversationMemberResponse] = []
    unread_count: int = 0
    last_message_content: Optional[str] = None
    last_message_sender_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ============================================================
# Message Schemas
# ============================================================


class MessageCreate(BaseModel):
    content: Optional[str] = None
    message_type: str = Field(default="text", pattern=r"^(text|image|video|audio|file|voice|gif|sticker|system)$")
    media_url: Optional[str] = None
    media_id: Optional[UUID] = None
    thumbnail_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    duration: Optional[float] = None
    reply_to_id: Optional[UUID] = None
    metadata_json: Optional[str] = None


class MessageUpdate(BaseModel):
    content: Optional[str] = None
    is_edited: bool = True


class MessageReactionCreate(BaseModel):
    emoji: str = Field(..., max_length=10)


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: Optional[UUID]
    content: Optional[str]
    message_type: str
    media_url: Optional[str]
    media_id: Optional[UUID]
    thumbnail_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    mime_type: Optional[str]
    duration: Optional[float]
    reply_to_id: Optional[UUID]
    is_edited: bool
    is_deleted: bool
    is_unsent: bool
    reactions_count: int
    reply_count: int
    is_forwarded: bool
    forwarded_from_id: Optional[UUID]
    metadata_json: Optional[str]
    created_at: datetime
    updated_at: datetime
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    reactions: list["MessageReactionResponse"] = []
    read_by: list["MessageReadResponse"] = []
    reply_to_preview: Optional["MessageResponse"] = None

    model_config = {"from_attributes": True}


class MessageReactionResponse(BaseModel):
    id: UUID
    message_id: UUID
    user_id: UUID
    emoji: str
    created_at: datetime
    username: Optional[str] = None

    model_config = {"from_attributes": True}


class MessageReadResponse(BaseModel):
    id: UUID
    message_id: UUID
    user_id: UUID
    created_at: datetime
    username: Optional[str] = None

    model_config = {"from_attributes": True}


# ============================================================
# Typing / Online Status Schemas
# ============================================================


class TypingIndicatorCreate(BaseModel):
    is_typing: bool = True


class TypingIndicatorResponse(BaseModel):
    user_id: UUID
    conversation_id: UUID
    is_typing: bool
    username: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OnlineStatusResponse(BaseModel):
    user_id: UUID
    is_online: bool
    last_seen_at: Optional[datetime]
    status_text: Optional[str]

    model_config = {"from_attributes": True}


class OnlineStatusUpdate(BaseModel):
    is_online: bool
    status_text: Optional[str] = None


# ============================================================
# Chat Theme Schemas
# ============================================================


class ChatThemeResponse(BaseModel):
    theme: str
    primary_color: Optional[str] = None
    background_color: Optional[str] = None


# ============================================================
# Pinned / Archived Chat Schemas
# ============================================================


class ChatPinUpdate(BaseModel):
    is_pinned: bool


class ChatArchiveUpdate(BaseModel):
    is_archived: bool


class ChatMuteUpdate(BaseModel):
    is_muted: bool


# ============================================================
# Search Schemas
# ============================================================


class MessageSearchResult(BaseModel):
    messages: list[MessageResponse]
    total_count: int


# ============================================================
# Forward Schemas
# ============================================================


class MessageForward(BaseModel):
    conversation_ids: list[UUID]


# ============================================================
# Read Receipt Schemas
# ============================================================


class MarkAsRead(BaseModel):
    message_id: UUID
