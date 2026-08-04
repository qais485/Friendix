from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SearchResultUser(BaseModel):
    id: UUID
    username: Optional[str]
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    bio: Optional[str]

    model_config = {"from_attributes": True}


class SearchResultPost(BaseModel):
    id: UUID
    content: Optional[str]
    user_id: UUID
    username: Optional[str]
    user_avatar: Optional[str]
    post_type: str
    image_urls: Optional[str]
    likes_count: int
    comments_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchResultReel(BaseModel):
    id: UUID
    description: Optional[str]
    video_url: Optional[str]
    user_id: UUID
    username: Optional[str]
    user_avatar: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchResultComment(BaseModel):
    id: UUID
    content: str
    post_id: UUID
    user_id: UUID
    username: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchResultLive(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    username: Optional[str]
    user_avatar: Optional[str]
    is_live: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UnifiedSearchResponse(BaseModel):
    users: list[SearchResultUser]
    posts: list[SearchResultPost]
    reels: list[SearchResultReel]
    comments: list[SearchResultComment]
    lives: list[SearchResultLive]
    total_count: int


class SearchHistoryResponse(BaseModel):
    id: UUID
    query: str
    search_type: str
    results_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchHistoryListResponse(BaseModel):
    history: list[SearchHistoryResponse]


class SavedSearchResponse(BaseModel):
    id: UUID
    query: str
    search_type: str
    filters_json: Optional[str]
    label: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedSearchCreate(BaseModel):
    query: str
    search_type: str = "all"
    filters_json: Optional[str] = None
    label: Optional[str] = None


class SavedSearchListResponse(BaseModel):
    saved_searches: list[SavedSearchResponse]
