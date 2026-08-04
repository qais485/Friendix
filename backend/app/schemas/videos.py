from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ── Category ──────────────────────────────────────────────

class VideoCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    videos_count: int = 0
    model_config = {"from_attributes": True}


# ── Video ─────────────────────────────────────────────────

class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    category_id: Optional[UUID] = None
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    privacy: str = Field(default="everyone", pattern=r"^(everyone|friends|only_me)$")


class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category_id: Optional[UUID] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")


class VideoUserResponse(BaseModel):
    id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    model_config = {"from_attributes": True}


class VideoCategoryBrief(BaseModel):
    id: UUID
    name: str
    slug: str
    model_config = {"from_attributes": True}


class VideoResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: str
    duration: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    privacy: str = "everyone"
    status: str = "ready"
    views_count: int = 0
    likes_count: int = 0
    comments_count: int = 0
    is_archived: bool = False
    is_liked: bool = False
    is_watch_later: bool = False
    user: Optional[VideoUserResponse] = None
    category: Optional[VideoCategoryBrief] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class VideoListResponse(BaseModel):
    videos: list[VideoResponse]
    next_cursor: Optional[str] = None
    has_more: bool = False


# ── Comments ──────────────────────────────────────────────

class VideoCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[UUID] = None


class VideoCommentResponse(BaseModel):
    id: UUID
    user_id: UUID
    video_id: UUID
    parent_id: Optional[UUID] = None
    content: str
    likes_count: int = 0
    user: Optional[VideoUserResponse] = None
    replies_count: int = 0
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class VideoCommentListResponse(BaseModel):
    comments: list[VideoCommentResponse]
    total_count: int = 0


# ── Playlist ──────────────────────────────────────────────

class PlaylistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    privacy: str = Field(default="everyone", pattern=r"^(everyone|friends|only_me)$")


class PlaylistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")


class PlaylistResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    privacy: str = "everyone"
    videos_count: int = 0
    is_system: bool = False
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class PlaylistDetailResponse(PlaylistResponse):
    videos: list[VideoResponse] = []
    user: Optional[VideoUserResponse] = None


class PlaylistListResponse(BaseModel):
    playlists: list[PlaylistResponse]


# ── Watch History ─────────────────────────────────────────

class WatchHistoryResponse(BaseModel):
    id: UUID
    video: Optional[VideoResponse] = None
    progress: float = 0.0
    completed: bool = False
    watched_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class WatchHistoryListResponse(BaseModel):
    items: list[WatchHistoryResponse]


# ── Watch Later ───────────────────────────────────────────

class WatchLaterResponse(BaseModel):
    video: Optional[VideoResponse] = None
    added_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class WatchLaterListResponse(BaseModel):
    items: list[WatchLaterResponse]


# ── Recommendations ───────────────────────────────────────

class RecommendationListResponse(BaseModel):
    videos: list[VideoResponse]
