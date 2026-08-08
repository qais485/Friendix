import time
import hashlib
import hmac
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.repositories.media_repository import MediaRepository
from app.repositories.feed_repository import FeedRepository
from app.services.content_profile_sync import drop_content_profile, sync_content_profile
from app.schemas.media import (
    MediaUpload,
    MediaUpdate,
    MediaResponse,
    PhotoAlbumCreate,
    PhotoAlbumUpdate,
    PhotoAlbumResponse,
    AlbumPhotoAdd,
    AlbumPhotoResponse,
    StoryCreate,
    StoryResponse,
    StoryViewResponse,
    StoryReactionCreate,
    StoryReactionResponse,
    StoryReplyCreate,
    StoryReplyResponse,
    StoryHighlightCreate,
    StoryHighlightUpdate,
    StoryHighlightResponse,
    StoryHighlightItemResponse,
    StoryHighlightWithItemsResponse,
    ReelCreate,
    ReelUpdate,
    ReelResponse,
    CloudinarySignResponse,
)

settings = get_settings()

STORY_DURATION_HOURS = 24


class MediaService:
    def __init__(self, db: Session):
        self.db = db
        self.media_repo = MediaRepository(db)
        self.feed_repo = FeedRepository(db)

    def _media_to_response(self, media) -> MediaResponse:
        return MediaResponse.model_validate(media)

    def _album_to_response(self, album) -> PhotoAlbumResponse:
        return PhotoAlbumResponse.model_validate(album)

    def _story_to_response(self, story) -> StoryResponse:
        return StoryResponse.model_validate(story)

    def _reel_to_response(self, reel) -> ReelResponse:
        return ReelResponse.model_validate(reel)

    def upload_media(self, user_id: UUID, data: MediaUpload) -> MediaResponse:
        media = self.media_repo.create_media(
            user_id=user_id,
            media_type=data.media_type,
            file_url=data.file_url,
            thumbnail_url=data.thumbnail_url,
            original_name=data.original_name,
            mime_type=data.mime_type,
            file_size=data.file_size,
            width=data.width,
            height=data.height,
            duration=data.duration,
            alt_text=data.alt_text,
            caption=data.caption,
            cloudinary_public_id=data.cloudinary_public_id,
            is_processed=data.is_processed,
            metadata_json=data.metadata_json,
        )
        return self._media_to_response(media)

    def get_media(self, media_id: UUID, viewer_id: UUID | None = None) -> MediaResponse:
        media = self.media_repo.get_media_by_id(media_id, viewer_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        return self._media_to_response(media)

    def get_user_media(self, user_id: UUID, media_type: str | None = None, limit: int = 20, offset: int = 0, viewer_id: UUID | None = None) -> list[MediaResponse]:
        media_list = self.media_repo.get_user_media(user_id, media_type, limit, offset, viewer_id)
        return [self._media_to_response(m) for m in media_list]

    def get_user_media_count(self, user_id: UUID, media_type: str | None = None) -> int:
        return self.media_repo.get_user_media_count(user_id, media_type)

    def update_media(self, user_id: UUID, media_id: UUID, data: MediaUpdate) -> MediaResponse:
        media = self.media_repo.get_media_by_id(media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        if media.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.media_repo.update_media(media, **update_data)
        return self._media_to_response(updated)

    def delete_media(self, user_id: UUID, media_id: UUID) -> bool:
        media = self.media_repo.get_media_by_id(media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        if media.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.media_repo.delete_media(media)
        return True

    def create_album(self, user_id: UUID, data: PhotoAlbumCreate) -> PhotoAlbumResponse:
        cover_media_id = UUID(data.cover_media_id) if data.cover_media_id else None
        album = self.media_repo.create_album(
            user_id=user_id,
            name=data.name,
            description=data.description,
            cover_media_id=cover_media_id,
            privacy=data.privacy,
        )
        return self._album_to_response(album)

    def get_album(self, album_id: UUID, viewer_id: UUID | None = None) -> PhotoAlbumResponse:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if viewer_id and album.user_id != viewer_id:
            if album.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if album.privacy == "friends":
                from app.repositories.feed_repository import FeedRepository
                feed_repo = FeedRepository(self.db)
                if not feed_repo._are_friends(album.user_id, viewer_id):
                    raise HTTPException(status_code=403, detail="Access denied")
        return self._album_to_response(album)

    def get_user_albums(self, user_id: UUID) -> list[PhotoAlbumResponse]:
        albums = self.media_repo.get_user_albums(user_id)
        return [self._album_to_response(a) for a in albums]

    def update_album(self, user_id: UUID, album_id: UUID, data: PhotoAlbumUpdate) -> PhotoAlbumResponse:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if album.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        if "cover_media_id" in update_data and update_data["cover_media_id"]:
            update_data["cover_media_id"] = UUID(update_data["cover_media_id"])
        updated = self.media_repo.update_album(album, **update_data)
        return self._album_to_response(updated)

    def delete_album(self, user_id: UUID, album_id: UUID) -> bool:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if album.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.media_repo.delete_album(album)
        return True

    def add_photo_to_album(self, user_id: UUID, album_id: UUID, data: AlbumPhotoAdd) -> AlbumPhotoResponse:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if album.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        media = self.media_repo.get_media_by_id(UUID(data.media_id))
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        photo = self.media_repo.add_photo_to_album(
            album_id=album_id,
            media_id=media.id,
            caption=data.caption,
            position=data.position or 0,
        )
        return AlbumPhotoResponse.model_validate(photo)

    def remove_photo_from_album(self, user_id: UUID, album_id: UUID, media_id: UUID) -> bool:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if album.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return self.media_repo.remove_photo_from_album(album_id, media_id)

    def get_album_photos(self, album_id: UUID, viewer_id: UUID | None = None) -> list[AlbumPhotoResponse]:
        album = self.media_repo.get_album_by_id(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album not found")
        if viewer_id and album.user_id != viewer_id:
            if album.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if album.privacy == "friends":
                from app.repositories.feed_repository import FeedRepository
                feed_repo = FeedRepository(self.db)
                if not feed_repo._are_friends(album.user_id, viewer_id):
                    raise HTTPException(status_code=403, detail="Access denied")
        photos = self.media_repo.get_album_photos(album_id)
        return [AlbumPhotoResponse.model_validate(p) for p in photos]

    def create_story(self, user_id: UUID, data: StoryCreate) -> StoryResponse:
        media_id = UUID(data.media_id) if data.media_id else None
        if media_id:
            media = self.media_repo.get_media_by_id(media_id)
            if not media:
                raise HTTPException(status_code=404, detail="Media not found")
        expires_at = datetime.now(timezone.utc) + timedelta(hours=STORY_DURATION_HOURS)
        story = self.media_repo.create_story(
            user_id=user_id,
            expires_at=expires_at,
            media_id=media_id,
            content=data.content,
            background_color=data.background_color,
            story_type=data.story_type,
        )
        sync_content_profile(self.db, "story", story.id)
        return self._story_to_response(story)

    def get_active_stories(self, user_ids: list[UUID], viewer_id: UUID | None = None) -> list[StoryResponse]:
        stories = self.media_repo.get_active_stories(user_ids, viewer_id)
        responses = [self._story_to_response(s) for s in stories]
        if viewer_id:
            viewed_ids = self.media_repo.get_viewed_story_ids([s.id for s in stories], viewer_id)
            for r in responses:
                r.viewed = r.id in viewed_ids
        return responses

    def get_user_stories(self, user_id: UUID, viewer_id: UUID | None = None) -> list[StoryResponse]:
        stories = self.media_repo.get_user_stories(user_id, viewer_id)
        responses = [self._story_to_response(s) for s in stories]
        if viewer_id:
            viewed_ids = self.media_repo.get_viewed_story_ids([s.id for s in stories], viewer_id)
            for r in responses:
                r.viewed = r.id in viewed_ids
        return responses

    def view_story(self, story_id: UUID, viewer_id: UUID) -> StoryViewResponse:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        now = datetime.now(timezone.utc)
        if story.expires_at <= now:
            raise HTTPException(status_code=400, detail="Story has expired")
        view = self.media_repo.view_story(story_id, viewer_id)
        return StoryViewResponse.model_validate(view)

    def get_story_viewers(self, story_id: UUID, user_id: UUID) -> list[StoryViewResponse]:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        viewers = self.media_repo.get_story_viewers(story_id)
        return [StoryViewResponse.model_validate(v) for v in viewers]

    def delete_story(self, user_id: UUID, story_id: UUID) -> bool:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        drop_content_profile(self.db, "story", story_id)
        self.media_repo.delete_story(story)
        return True

    def create_reel(self, user_id: UUID, data: ReelCreate) -> ReelResponse:
        media = self.media_repo.get_media_by_id(UUID(data.media_id))
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        reel = self.media_repo.create_reel(
            user_id=user_id,
            media_id=media.id,
            caption=data.caption,
            audio_url=data.audio_url,
            audio_name=data.audio_name,
            thumbnail_url=media.thumbnail_url,
            duration=media.duration,
            width=media.width,
            height=media.height,
            privacy=data.privacy,
        )
        sync_content_profile(self.db, "reel", reel.id)
        return self._reel_to_response(reel)

    def get_reel(self, reel_id: UUID, viewer_id: UUID | None = None) -> ReelResponse:
        reel = self.media_repo.get_reel_by_id(reel_id)
        if not reel:
            raise HTTPException(status_code=404, detail="Reel not found")
        if viewer_id and reel.user_id != viewer_id:
            if reel.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if reel.privacy == "friends":
                if not self.feed_repo._are_friends(reel.user_id, viewer_id):
                    raise HTTPException(status_code=403, detail="Access denied")
        if viewer_id:
            self.media_repo.increment_reel_views(reel_id)
        return self._reel_to_response(reel)

    def get_user_reels(self, user_id: UUID, limit: int = 20, offset: int = 0, viewer_id: UUID | None = None) -> list[ReelResponse]:
        reels = self.media_repo.get_user_reels(user_id, viewer_id, limit, offset)
        return [self._reel_to_response(r) for r in reels]

    def get_feed_reels(self, user_id: UUID, limit: int = 20, offset: int = 0) -> list[ReelResponse]:
        following_ids = self.feed_repo._get_following_ids(user_id)
        reels = self.media_repo.get_feed_reels(user_id, following_ids, limit, offset)
        return [self._reel_to_response(r) for r in reels]

    def get_trending_reels(self, limit: int = 20, offset: int = 0) -> list[ReelResponse]:
        reels = self.media_repo.get_trending_reels(limit, offset)
        return [self._reel_to_response(r) for r in reels]

    def update_reel(self, user_id: UUID, reel_id: UUID, data: ReelUpdate) -> ReelResponse:
        reel = self.media_repo.get_reel_by_id(reel_id)
        if not reel:
            raise HTTPException(status_code=404, detail="Reel not found")
        if reel.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.media_repo.update_reel(reel, **update_data)
        sync_content_profile(self.db, "reel", reel_id)
        return self._reel_to_response(updated)

    def delete_reel(self, user_id: UUID, reel_id: UUID) -> bool:
        reel = self.media_repo.get_reel_by_id(reel_id)
        if not reel:
            raise HTTPException(status_code=404, detail="Reel not found")
        if reel.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        drop_content_profile(self.db, "reel", reel_id)
        self.media_repo.delete_reel(reel)
        return True

    def get_cloudinary_signature(self, folder: str = "friendix", resource_type: str = "image") -> CloudinarySignResponse:
        timestamp = int(time.time())
        api_key = settings.CLOUDINARY_API_KEY
        cloud_name = settings.CLOUDINARY_CLOUD_NAME
        string_to_sign = f"folder={folder}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
        signature = hashlib.sha1(string_to_sign.encode()).hexdigest()
        return CloudinarySignResponse(
            timestamp=timestamp,
            signature=signature,
            api_key=api_key,
            cloud_name=cloud_name,
            folder=folder,
            resource_type=resource_type,
        )

    def get_user_media_stats(self, user_id: UUID) -> dict:
        return {
            "total_media": self.media_repo.get_user_media_count(user_id),
            "images": self.media_repo.get_user_media_count(user_id, "image"),
            "videos": self.media_repo.get_user_media_count(user_id, "video"),
            "audio": self.media_repo.get_user_media_count(user_id, "audio"),
            "albums": len(self.media_repo.get_user_albums(user_id)),
            "reels": self.media_repo.get_user_reel_count(user_id),
            "stories": self.media_repo.get_user_story_count(user_id),
        }

    def archive_story(self, user_id: UUID, story_id: UUID) -> StoryResponse:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        archived = self.media_repo.archive_story(story)
        return self._story_to_response(archived)

    def get_archived_stories(self, user_id: UUID) -> list[StoryResponse]:
        stories = self.media_repo.get_archived_stories(user_id)
        return [self._story_to_response(s) for s in stories]

    def unarchive_story(self, user_id: UUID, story_id: UUID) -> StoryResponse:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        unarchived = self.media_repo.unarchive_story(story)
        return self._story_to_response(unarchived)

    def get_close_friends_stories(self, user_id: UUID) -> list[StoryResponse]:
        close_friend_ids = self.media_repo.get_close_friend_ids(user_id)
        stories = self.media_repo.get_close_friends_stories(user_id, close_friend_ids)
        return [self._story_to_response(s) for s in stories]

    def add_reaction(self, story_id: UUID, user_id: UUID, data: StoryReactionCreate) -> StoryReactionResponse:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        now = datetime.now(timezone.utc)
        if story.expires_at <= now:
            raise HTTPException(status_code=400, detail="Story has expired")
        reaction = self.media_repo.add_reaction(story_id, user_id, data.emoji)
        return StoryReactionResponse.model_validate(reaction)

    def remove_reaction(self, story_id: UUID, user_id: UUID) -> bool:
        return self.media_repo.remove_reaction(story_id, user_id)

    def get_story_reactions(self, story_id: UUID, user_id: UUID) -> list[StoryReactionResponse]:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        reactions = self.media_repo.get_story_reactions(story_id)
        return [StoryReactionResponse.model_validate(r) for r in reactions]

    def get_story_reaction_counts(self, story_id: UUID) -> dict[str, int]:
        return self.media_repo.get_story_reaction_counts(story_id)

    def add_reply(self, story_id: UUID, user_id: UUID, data: StoryReplyCreate) -> StoryReplyResponse:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot reply to your own story")
        now = datetime.now(timezone.utc)
        if story.expires_at <= now:
            raise HTTPException(status_code=400, detail="Story has expired")
        reply = self.media_repo.add_reply(story_id, user_id, data.content)
        return StoryReplyResponse.model_validate(reply)

    def get_story_replies(self, story_id: UUID, user_id: UUID) -> list[StoryReplyResponse]:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        replies = self.media_repo.get_story_replies(story_id)
        return [StoryReplyResponse.model_validate(r) for r in replies]

    def delete_reply(self, user_id: UUID, story_id: UUID, reply_id: UUID) -> bool:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        replies = self.media_repo.get_story_replies(story_id)
        reply = next((r for r in replies if r.id == reply_id), None)
        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")
        if reply.user_id != user_id and story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.media_repo.delete_reply(reply)
        return True

    def create_highlight(self, user_id: UUID, data: StoryHighlightCreate) -> StoryHighlightResponse:
        highlight = self.media_repo.create_highlight(user_id, data.title, data.cover_url)
        return StoryHighlightResponse.model_validate(highlight)

    def get_user_highlights(self, user_id: UUID) -> list[StoryHighlightResponse]:
        highlights = self.media_repo.get_user_highlights(user_id)
        return [StoryHighlightResponse.model_validate(h) for h in highlights]

    def get_highlight(self, highlight_id: UUID) -> StoryHighlightWithItemsResponse:
        highlight = self.media_repo.get_highlight_by_id(highlight_id)
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        items = self.media_repo.get_highlight_items(highlight_id)
        response = StoryHighlightWithItemsResponse.model_validate(highlight)
        response.items = [StoryHighlightItemResponse.model_validate(i) for i in items]
        return response

    def update_highlight(self, user_id: UUID, highlight_id: UUID, data: StoryHighlightUpdate) -> StoryHighlightResponse:
        highlight = self.media_repo.get_highlight_by_id(highlight_id)
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        if highlight.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.media_repo.update_highlight(highlight, **update_data)
        return StoryHighlightResponse.model_validate(updated)

    def delete_highlight(self, user_id: UUID, highlight_id: UUID) -> bool:
        highlight = self.media_repo.get_highlight_by_id(highlight_id)
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        if highlight.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.media_repo.delete_highlight(highlight)
        return True

    def add_story_to_highlight(self, user_id: UUID, highlight_id: UUID, story_id: UUID) -> StoryHighlightItemResponse:
        highlight = self.media_repo.get_highlight_by_id(highlight_id)
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        if highlight.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        if story.user_id != user_id:
            raise HTTPException(status_code=403, detail="Can only add your own stories")
        items = self.media_repo.get_highlight_items(highlight_id)
        position = max((i.position for i in items), default=-1) + 1
        item = self.media_repo.add_story_to_highlight(highlight_id, story_id, position)
        if not highlight.cover_url and story.media_id:
            media = self.media_repo.get_media_by_id(story.media_id)
            if media:
                self.media_repo.update_highlight(highlight, cover_url=media.thumbnail_url or media.file_url)
        return StoryHighlightItemResponse.model_validate(item)

    def remove_story_from_highlight(self, user_id: UUID, highlight_id: UUID, story_id: UUID) -> bool:
        highlight = self.media_repo.get_highlight_by_id(highlight_id)
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        if highlight.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return self.media_repo.remove_story_from_highlight(highlight_id, story_id)

    def get_story_replies_for_viewer(self, story_id: UUID, user_id: UUID) -> list[StoryReplyResponse]:
        story = self.media_repo.get_story_by_id(story_id)
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        replies = self.media_repo.get_story_replies(story_id)
        return [StoryReplyResponse.model_validate(r) for r in replies]
