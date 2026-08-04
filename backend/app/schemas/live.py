from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class LiveStreamCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    privacy: str = Field(default="everyone", pattern=r"^(everyone|friends|only_me)$")
    allow_chat: bool = True
    allow_reactions: bool = True
    allow_donations: bool = True
    allow_guests: bool = True
    scheduled_at: Optional[datetime] = None


class LiveStreamUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")
    allow_chat: Optional[bool] = None
    allow_reactions: Optional[bool] = None
    allow_donations: Optional[bool] = None
    allow_guests: Optional[bool] = None


class LiveStreamAuthor(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool

    model_config = {"from_attributes": True}


class LiveStreamResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    stream_key: Optional[str] = None
    stream_url: Optional[str]
    playback_url: Optional[str]
    status: str
    privacy: str
    is_recording: bool
    replay_url: Optional[str]
    replay_duration: Optional[int]
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    viewers_count: int
    peak_viewers_count: int
    likes_count: int
    comments_count: int
    donations_count: int
    donations_total: float
    allow_chat: bool
    allow_reactions: bool
    allow_donations: bool
    allow_guests: bool
    author: Optional[LiveStreamAuthor] = None
    is_host: bool = False
    is_moderator: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LiveStreamListResponse(BaseModel):
    streams: list[LiveStreamResponse]
    next_cursor: Optional[str] = None
    has_more: bool


class LiveChatMessageCreate(BaseModel):
    content: str = Field(..., max_length=1000)


class LiveChatMessageResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    content: str
    is_pinned: bool
    is_deleted: bool
    author: Optional[LiveStreamAuthor] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LiveChatMessageListResponse(BaseModel):
    messages: list[LiveChatMessageResponse]
    next_cursor: Optional[str] = None
    has_more: bool


class LiveReactionCreate(BaseModel):
    emoji: str = Field(..., max_length=10)


class LiveReactionResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    emoji: str
    author: Optional[LiveStreamAuthor] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LiveDonationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=10)
    message: Optional[str] = Field(None, max_length=1000)
    is_anonymous: bool = False


class LiveDonationResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    amount: float
    currency: str
    message: Optional[str]
    is_anonymous: bool
    author: Optional[LiveStreamAuthor] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LiveDonationListResponse(BaseModel):
    donations: list[LiveDonationResponse]
    total_amount: float
    total_count: int


class LiveGuestCreate(BaseModel):
    user_id: str


class LiveGuestResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    status: str
    joined_at: Optional[datetime]
    left_at: Optional[datetime]
    author: Optional[LiveStreamAuthor] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LiveModeratorCreate(BaseModel):
    user_id: str


class LiveModeratorResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    author: Optional[LiveStreamAuthor] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LiveViewerResponse(BaseModel):
    id: UUID
    stream_id: UUID
    user_id: UUID
    last_seen_at: datetime
    author: Optional[LiveStreamAuthor] = None

    model_config = {"from_attributes": True}


class LiveScheduleRequest(BaseModel):
    scheduled_at: datetime
