from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class MediaUpload(BaseModel):
    media_type: str = Field(..., pattern=r"^(image|video|audio|document|live_photo)$")
    file_url: str = Field(..., max_length=500)
    thumbnail_url: Optional[str] = None
    original_name: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    is_processed: bool = False
    metadata_json: Optional[str] = None


class MediaUpdate(BaseModel):
    alt_text: Optional[str] = None
    caption: Optional[str] = None


class MediaUserResponse(BaseModel):
    id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = {"from_attributes": True}


class MediaResponse(BaseModel):
    id: UUID
    user_id: UUID
    media_type: str
    file_url: str
    thumbnail_url: Optional[str]
    original_name: Optional[str]
    mime_type: Optional[str]
    file_size: Optional[int]
    width: Optional[int]
    height: Optional[int]
    duration: Optional[float]
    alt_text: Optional[str]
    caption: Optional[str]
    cloudinary_public_id: Optional[str]
    is_processed: bool
    metadata_json: Optional[str]
    privacy: str
    created_at: datetime
    updated_at: datetime
    user: Optional[MediaUserResponse] = None

    model_config = {"from_attributes": True}


class PhotoAlbumCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    cover_media_id: Optional[str] = None
    privacy: str = Field(default="everyone", pattern=r"^(everyone|friends|only_me)$")


class PhotoAlbumUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    cover_media_id: Optional[str] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")


class PhotoAlbumResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    cover_media_id: Optional[UUID]
    privacy: str
    media_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlbumPhotoAdd(BaseModel):
    media_id: str
    caption: Optional[str] = None
    position: Optional[int] = None


class AlbumPhotoResponse(BaseModel):
    id: UUID
    album_id: UUID
    media_id: UUID
    position: int
    caption: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StoryCreate(BaseModel):
    media_id: Optional[str] = None
    content: Optional[str] = None
    background_color: Optional[str] = None
    story_type: str = Field(default="media", pattern=r"^(media|text|reel|music)$")
    music_url: Optional[str] = None
    music_name: Optional[str] = None
    music_artist: Optional[str] = None
    music_cover_url: Optional[str] = None
    is_close_friends_only: bool = False


class StoryMediaResponse(BaseModel):
    id: UUID
    media_type: str
    file_url: str
    thumbnail_url: Optional[str] = None
    original_name: Optional[str] = None
    mime_type: Optional[str] = None
    model_config = {"from_attributes": True}


class StoryUserResponse(BaseModel):
    id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    model_config = {"from_attributes": True}


class StoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    media_id: Optional[UUID]
    content: Optional[str]
    background_color: Optional[str]
    story_type: str
    music_url: Optional[str]
    music_name: Optional[str]
    music_artist: Optional[str]
    music_cover_url: Optional[str]
    is_close_friends_only: bool
    expires_at: datetime
    views_count: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    viewed: bool = False
    media: Optional[StoryMediaResponse] = None
    user: Optional[StoryUserResponse] = None

    model_config = {"from_attributes": True}


class StoryViewResponse(BaseModel):
    id: UUID
    story_id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class StoryReactionCreate(BaseModel):
    emoji: str = Field(..., max_length=10)


class StoryReactionResponse(BaseModel):
    id: UUID
    story_id: UUID
    user_id: UUID
    emoji: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StoryReplyCreate(BaseModel):
    content: str = Field(..., max_length=1000)


class StoryReplyResponse(BaseModel):
    id: UUID
    story_id: UUID
    user_id: UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StoryHighlightCreate(BaseModel):
    title: str = Field(..., max_length=100)
    cover_url: Optional[str] = None


class StoryHighlightUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    cover_url: Optional[str] = None


class StoryHighlightResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    cover_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StoryHighlightItemResponse(BaseModel):
    id: UUID
    highlight_id: UUID
    story_id: UUID
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}


class StoryHighlightWithItemsResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    cover_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: list[StoryHighlightItemResponse] = []

    model_config = {"from_attributes": True}


class ReelCreate(BaseModel):
    media_id: str
    caption: Optional[str] = None
    audio_url: Optional[str] = None
    audio_name: Optional[str] = None
    privacy: str = Field(default="everyone", pattern=r"^(everyone|friends|only_me)$")


class ReelUpdate(BaseModel):
    caption: Optional[str] = None
    audio_url: Optional[str] = None
    audio_name: Optional[str] = None
    privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me)$")


class ReelUserResponse(BaseModel):
    id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool = False
    model_config = {"from_attributes": True}


class ReelMediaResponse(BaseModel):
    id: UUID
    media_type: str
    file_url: str
    thumbnail_url: Optional[str] = None
    model_config = {"from_attributes": True}


class ReelResponse(BaseModel):
    id: UUID
    user_id: UUID
    media_id: UUID
    caption: Optional[str]
    audio_url: Optional[str]
    audio_name: Optional[str]
    thumbnail_url: Optional[str]
    duration: Optional[float]
    width: Optional[int]
    height: Optional[int]
    privacy: str
    views_count: int
    likes_count: int
    comments_count: int
    shares_count: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    media: Optional[ReelMediaResponse] = None
    user: Optional[ReelUserResponse] = None

    model_config = {"from_attributes": True}


class CloudinarySignRequest(BaseModel):
    folder: str = Field(default="friendix")
    resource_type: str = Field(default="image", pattern=r"^(image|video|audio|raw)$")


class CloudinarySignResponse(BaseModel):
    timestamp: int
    signature: str
    api_key: str
    cloud_name: str
    folder: str
    resource_type: str
