from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

# Content kinds that can have a profile.
CONTENT_PROFILE_TYPES = ("video", "post", "reel", "story", "live")


class ContentProfileResponse(BaseModel):
    content_type: str
    content_id: UUID
    creator_id: UUID | None = None
    title: str | None = None
    category_id: UUID | None = None
    category_name: str | None = None
    tags: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    language: str | None = None
    media_type: str | None = None
    mime_type: str | None = None
    duration_seconds: float | None = None
    published_at: datetime | None = None
    popularity_score: float = 0.0
    quality_score: float = 0.0
    freshness_score: float = 0.0
    version: int = 1


class ContentProfileListResponse(BaseModel):
    total: int
    profiles: list[ContentProfileResponse]


class ContentProfileUpdate(BaseModel):
    title: Optional[str] = None
    language: Optional[str] = Field(default=None, max_length=10, min_length=1)
    tags: Optional[list[str]] = None
    topics: Optional[list[str]] = None
    category_name: Optional[str] = None
    media_type: Optional[str] = None
    duration_seconds: Optional[float] = Field(default=None, ge=0)


class ContentProfileRefreshResponse(BaseModel):
    content_type: str
    built: int


class ContentMetricsRefreshResponse(BaseModel):
    processed_events: int
    profiles_updated: int
    freshness_updated: int