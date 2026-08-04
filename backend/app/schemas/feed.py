from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class PollOptionCreate(BaseModel):
    text: str = Field(..., max_length=500)


class PollCreate(BaseModel):
    question: str = Field(..., max_length=500)
    options: list[PollOptionCreate] = Field(..., min_length=2, max_length=10)
    ends_at: Optional[datetime] = None
    is_anonymous: bool = False


class PollOptionResponse(BaseModel):
    id: UUID
    text: str
    votes_count: int
    percentage: float = 0.0
    has_voted: bool = False

    model_config = {"from_attributes": True}


class PollResponse(BaseModel):
    id: UUID
    question: str
    ends_at: Optional[datetime]
    is_anonymous: bool
    total_votes: int
    options: list[PollOptionResponse]
    has_voted: bool = False
    is_expired: bool = False

    model_config = {"from_attributes": True}


class PostCreate(BaseModel):
    content: Optional[str] = None
    image_urls: Optional[list[str]] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    gif_url: Optional[str] = None
    document_url: Optional[str] = None
    document_name: Optional[str] = None
    location_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    feeling_type: Optional[str] = None
    feeling_text: Optional[str] = None
    background_style: Optional[str] = None
    background_image_url: Optional[str] = None
    aspect_ratio: Optional[str] = None
    post_type: str = Field(default="text", pattern=r"^(text|image|video|audio|gif|poll|document|shared|quote)$")
    privacy: Optional[str] = Field(default=None, pattern=r"^(everyone|friends|only_me)$")
    is_draft: bool = False
    is_scheduled: bool = False
    scheduled_at: Optional[datetime] = None
    shared_post_id: Optional[str] = None
    quote_text: Optional[str] = None
    cross_posted_from: Optional[str] = None
    poll: Optional[PollCreate] = None
    hashtags: Optional[list[str]] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_urls: Optional[list[str]] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    gif_url: Optional[str] = None
    document_url: Optional[str] = None
    document_name: Optional[str] = None
    location_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    feeling_type: Optional[str] = None
    feeling_text: Optional[str] = None
    background_style: Optional[str] = None
    background_image_url: Optional[str] = None
    aspect_ratio: Optional[str] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")
    is_archived: Optional[bool] = None
    is_draft: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    quote_text: Optional[str] = None


class PostAuthor(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: Optional[str]
    image_urls: Optional[list[str]] = None
    video_url: Optional[str]
    audio_url: Optional[str]
    gif_url: Optional[str]
    document_url: Optional[str]
    document_name: Optional[str]
    location_name: Optional[str]
    location_lat: Optional[float]
    location_lng: Optional[float]
    feeling_type: Optional[str]
    feeling_text: Optional[str]
    background_style: Optional[str] = None
    background_image_url: Optional[str] = None
    aspect_ratio: Optional[str] = None
    post_type: str
    privacy: str
    is_pinned: bool
    is_hidden: bool
    is_archived: bool
    is_draft: bool
    is_scheduled: bool
    scheduled_at: Optional[datetime]
    shared_post_id: Optional[UUID]
    quote_text: Optional[str]
    cross_posted_from: Optional[str]
    repost_count: int
    likes_count: int
    comments_count: int
    shares_count: int
    trending_score: float
    author: Optional[PostAuthor] = None
    shared_post: Optional["PostResponse"] = None
    poll: Optional[PollResponse] = None
    is_liked: bool = False
    is_saved: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    posts: list[PostResponse]
    next_cursor: Optional[str] = None
    has_more: bool


class FeedPositionResponse(BaseModel):
    user_id: UUID
    feed_type: str
    last_post_id: Optional[UUID]
    scroll_position: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class FeedPositionUpdate(BaseModel):
    feed_type: str = "home"
    last_post_id: Optional[str] = None
    scroll_position: int = 0


class FeedFilterOptions(BaseModel):
    feed_type: str = "home"
    privacy_filter: Optional[str] = None
    sort_by: str = "latest"


class RepostCreate(BaseModel):
    content: Optional[str] = None


class QuoteCreate(BaseModel):
    quote_text: str = Field(..., max_length=500)
    content: Optional[str] = None
