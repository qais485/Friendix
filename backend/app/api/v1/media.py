from uuid import UUID
import hashlib
import os
import uuid
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.models import Media, Friendship, BlockedUser
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
from app.services.media_service import MediaService

router = APIRouter()


def get_media_service(db: Session = Depends(get_db)) -> MediaService:
    return MediaService(db)


UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=MediaResponse)
def upload_media(
    data: MediaUpload,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.upload_media(user_id, data)


@router.post("/upload-file", response_model=MediaResponse)
async def upload_file(
    file: UploadFile = File(...),
    media_type: str = "image",
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{unique_name}"
    file_size = len(content)
    mime_type = file.content_type

    data = MediaUpload(
        media_type=media_type,
        file_url=file_url,
        original_name=file.filename,
        mime_type=mime_type,
        file_size=file_size,
    )
    return service.upload_media(user_id, data)


@router.get("/media/{media_id}", response_model=MediaResponse)
def get_media(
    media_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_media(UUID(media_id), user_id)


@router.get("/user/{target_user_id}", response_model=list[MediaResponse])
def get_user_media(
    target_user_id: str,
    media_type: str | None = None,
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_user_media(UUID(target_user_id), media_type, limit, offset, user_id)


@router.get("/user/{target_user_id}/count")
def get_user_media_count(
    target_user_id: str,
    media_type: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return {"count": service.get_user_media_count(UUID(target_user_id), media_type)}


@router.get("/user/{target_user_id}/stats")
def get_user_media_stats(
    target_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_user_media_stats(UUID(target_user_id))


@router.put("/media/{media_id}", response_model=MediaResponse)
def update_media(
    media_id: str,
    data: MediaUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.update_media(user_id, UUID(media_id), data)


@router.delete("/media/{media_id}")
def delete_media(
    media_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_media(user_id, UUID(media_id))
    return {"message": "Media deleted"}


@router.post("/albums", response_model=PhotoAlbumResponse)
def create_album(
    data: PhotoAlbumCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.create_album(user_id, data)


@router.get("/albums", response_model=list[PhotoAlbumResponse])
def get_user_albums(
    target_user_id: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    uid = UUID(target_user_id) if target_user_id else user_id
    return service.get_user_albums(uid)


@router.get("/albums/{album_id}", response_model=PhotoAlbumResponse)
def get_album(
    album_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_album(UUID(album_id), user_id)


@router.put("/albums/{album_id}", response_model=PhotoAlbumResponse)
def update_album(
    album_id: str,
    data: PhotoAlbumUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.update_album(user_id, UUID(album_id), data)


@router.delete("/albums/{album_id}")
def delete_album(
    album_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_album(user_id, UUID(album_id))
    return {"message": "Album deleted"}


@router.post("/albums/{album_id}/photos", response_model=AlbumPhotoResponse)
def add_photo_to_album(
    album_id: str,
    data: AlbumPhotoAdd,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.add_photo_to_album(user_id, UUID(album_id), data)


@router.delete("/albums/{album_id}/photos/{media_id}")
def remove_photo_from_album(
    album_id: str,
    media_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.remove_photo_from_album(user_id, UUID(album_id), UUID(media_id))
    return {"message": "Photo removed from album"}


@router.get("/albums/{album_id}/photos", response_model=list[AlbumPhotoResponse])
def get_album_photos(
    album_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_album_photos(UUID(album_id), user_id)


@router.post("/stories", response_model=StoryResponse)
def create_story(
    data: StoryCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.create_story(user_id, data)


@router.get("/stories", response_model=list[StoryResponse])
def get_active_stories(
    user_ids: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    ids = [UUID(uid.strip()) for uid in user_ids.split(",")]
    return service.get_active_stories(ids, user_id)


@router.get("/stories/user/{target_user_id}", response_model=list[StoryResponse])
def get_user_stories(
    target_user_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_user_stories(UUID(target_user_id), user_id)


@router.post("/stories/{story_id}/view", response_model=StoryViewResponse)
def view_story(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.view_story(UUID(story_id), user_id)


@router.get("/stories/{story_id}/viewers", response_model=list[StoryViewResponse])
def get_story_viewers(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_story_viewers(UUID(story_id), user_id)


@router.delete("/stories/{story_id}")
def delete_story(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_story(user_id, UUID(story_id))
    return {"message": "Story deleted"}


@router.post("/reels", response_model=ReelResponse)
def create_reel(
    data: ReelCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.create_reel(user_id, data)


@router.get("/reels/feed", response_model=list[ReelResponse])
def get_feed_reels(
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_feed_reels(user_id, limit, offset)


@router.get("/reels/trending", response_model=list[ReelResponse])
def get_trending_reels(
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    service: MediaService = Depends(get_media_service),
):
    return service.get_trending_reels(limit, offset)


@router.get("/reels/user/{target_user_id}", response_model=list[ReelResponse])
def get_user_reels(
    target_user_id: str,
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_user_reels(UUID(target_user_id), limit, offset, user_id)


@router.get("/reels/{reel_id}", response_model=ReelResponse)
def get_reel(
    reel_id: str,
    user_id: UUID | None = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_reel(UUID(reel_id), user_id)


@router.put("/reels/{reel_id}", response_model=ReelResponse)
def update_reel(
    reel_id: str,
    data: ReelUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.update_reel(user_id, UUID(reel_id), data)


@router.delete("/reels/{reel_id}")
def delete_reel(
    reel_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_reel(user_id, UUID(reel_id))
    return {"message": "Reel deleted"}


@router.get("/cloudinary/sign", response_model=CloudinarySignResponse)
def get_cloudinary_signature(
    folder: str = Query(default="friendix"),
    resource_type: str = Query(default="image"),
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_cloudinary_signature(folder, resource_type)


@router.post("/stories/{story_id}/archive", response_model=StoryResponse)
def archive_story(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.archive_story(user_id, UUID(story_id))


@router.get("/stories/archived", response_model=list[StoryResponse])
def get_archived_stories(
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_archived_stories(user_id)


@router.post("/stories/{story_id}/unarchive", response_model=StoryResponse)
def unarchive_story(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.unarchive_story(user_id, UUID(story_id))


@router.get("/stories/close-friends", response_model=list[StoryResponse])
def get_close_friends_stories(
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_close_friends_stories(user_id)


@router.post("/stories/{story_id}/reactions", response_model=StoryReactionResponse)
def add_reaction(
    story_id: str,
    data: StoryReactionCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.add_reaction(UUID(story_id), user_id, data)


@router.delete("/stories/{story_id}/reactions")
def remove_reaction(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.remove_reaction(UUID(story_id), user_id)
    return {"message": "Reaction removed"}


@router.get("/stories/{story_id}/reactions", response_model=list[StoryReactionResponse])
def get_story_reactions(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_story_reactions(UUID(story_id), user_id)


@router.get("/stories/{story_id}/reactions/counts")
def get_story_reaction_counts(
    story_id: str,
    service: MediaService = Depends(get_media_service),
):
    return service.get_story_reaction_counts(UUID(story_id))


@router.post("/stories/{story_id}/replies", response_model=StoryReplyResponse)
def add_reply(
    story_id: str,
    data: StoryReplyCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.add_reply(UUID(story_id), user_id, data)


@router.get("/stories/{story_id}/replies", response_model=list[StoryReplyResponse])
def get_story_replies(
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_story_replies(UUID(story_id), user_id)


@router.delete("/stories/{story_id}/replies/{reply_id}")
def delete_reply(
    story_id: str,
    reply_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_reply(user_id, UUID(story_id), UUID(reply_id))
    return {"message": "Reply deleted"}


@router.post("/highlights", response_model=StoryHighlightResponse)
def create_highlight(
    data: StoryHighlightCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.create_highlight(user_id, data)


@router.get("/highlights", response_model=list[StoryHighlightResponse])
def get_user_highlights(
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.get_user_highlights(user_id)


@router.get("/highlights/{highlight_id}", response_model=StoryHighlightWithItemsResponse)
def get_highlight(
    highlight_id: str,
    service: MediaService = Depends(get_media_service),
):
    return service.get_highlight(UUID(highlight_id))


@router.put("/highlights/{highlight_id}", response_model=StoryHighlightResponse)
def update_highlight(
    highlight_id: str,
    data: StoryHighlightUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.update_highlight(user_id, UUID(highlight_id), data)


@router.delete("/highlights/{highlight_id}")
def delete_highlight(
    highlight_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.delete_highlight(user_id, UUID(highlight_id))
    return {"message": "Highlight deleted"}


@router.post("/highlights/{highlight_id}/stories/{story_id}", response_model=StoryHighlightItemResponse)
def add_story_to_highlight(
    highlight_id: str,
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    return service.add_story_to_highlight(user_id, UUID(highlight_id), UUID(story_id))


@router.delete("/highlights/{highlight_id}/stories/{story_id}")
def remove_story_from_highlight(
    highlight_id: str,
    story_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: MediaService = Depends(get_media_service),
):
    service.remove_story_from_highlight(user_id, UUID(highlight_id), UUID(story_id))
    return {"message": "Story removed from highlight"}


@router.get("/proxy/{media_id}")
def proxy_media(
    media_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    import httpx

    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    if media.user_id != user_id:
        is_blocked = (
            db.query(BlockedUser)
            .filter(
                or_(
                    and_(BlockedUser.user_id == media.user_id, BlockedUser.blocked_user_id == user_id),
                    and_(BlockedUser.user_id == user_id, BlockedUser.blocked_user_id == media.user_id),
                )
            )
            .first()
        )
        if is_blocked:
            raise HTTPException(status_code=403, detail="Access denied")

        if media.privacy == "only_me":
            raise HTTPException(status_code=403, detail="Access denied")
        if media.privacy == "friends":
            are_friends = (
                db.query(Friendship)
                .filter(
                    and_(
                        or_(
                            Friendship.requester_id == user_id,
                            Friendship.addressee_id == user_id,
                        ),
                        or_(
                            Friendship.requester_id == media.user_id,
                            Friendship.addressee_id == media.user_id,
                        ),
                        Friendship.status == "accepted",
                    )
                )
                .first()
            )
            if not are_friends:
                raise HTTPException(status_code=403, detail="Access denied")

    updated_ts = media.updated_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    etag_input = f"{media.id}:{updated_ts}"
    etag = f'"{hashlib.md5(etag_input.encode()).hexdigest()}"'

    if_none_match = request.headers.get("if-none-match")
    if if_none_match and if_none_match.strip() == etag:
        return Response(status_code=304)

    try:
        response = httpx.get(media.file_url, follow_redirects=True, timeout=30)
        response.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch media")

    content_type = media.mime_type or "application/octet-stream"
    content_length = media.file_size or len(response.content)

    cache_headers = {
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "ETag": etag,
        "Content-Disposition": f'inline; filename="{media.original_name or "file"}"',
        "Content-Length": str(content_length),
        "X-Content-Type-Options": "nosniff",
    }

    return StreamingResponse(
        iter([response.content]),
        media_type=content_type,
        headers=cache_headers,
    )
