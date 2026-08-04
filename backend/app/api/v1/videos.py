from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.core.security import get_current_user_id
from app.schemas.videos import (
    VideoCreate, VideoUpdate, VideoListResponse, VideoResponse,
    VideoCommentCreate, VideoCommentListResponse, VideoCommentResponse,
    VideoCategoryResponse,
    PlaylistCreate, PlaylistUpdate, PlaylistResponse, PlaylistDetailResponse, PlaylistListResponse,
    WatchHistoryListResponse,
    WatchLaterListResponse,
    RecommendationListResponse,
)
from app.services.video_service import VideoService

router = APIRouter(tags=["videos"])


# ── Categories ─────────────────────────────────────────────

@router.get("/categories", response_model=list[VideoCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return VideoService(db).get_categories()


# ── Videos CRUD ────────────────────────────────────────────

@router.post("", response_model=VideoResponse, status_code=201)
def create_video(data: VideoCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).create_video(user_id, data)


@router.get("", response_model=VideoListResponse)
def list_videos(
    category_id: UUID | None = None,
    cursor: str | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return VideoService(db).list_videos(user_id, category_id, cursor, limit)


@router.get("/trending", response_model=VideoListResponse)
def get_trending(
    limit: int = Query(default=20, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return VideoService(db).get_trending(user_id, limit)


@router.get("/search", response_model=VideoListResponse)
def search_videos(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=20, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return VideoService(db).search_videos(q, user_id, limit)


@router.get("/user/{target_user_id}", response_model=VideoListResponse)
def get_user_videos(
    target_user_id: UUID,
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return VideoService(db).get_user_videos(user_id, target_user_id, limit, offset)


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).get_video(video_id, user_id)


@router.put("/{video_id}", response_model=VideoResponse)
def update_video(video_id: UUID, data: VideoUpdate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).update_video(user_id, video_id, data)


@router.delete("/{video_id}")
def delete_video(video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    VideoService(db).delete_video(user_id, video_id)
    return {"message": "Video deleted"}


# ── Likes ──────────────────────────────────────────────────

@router.post("/{video_id}/like")
def toggle_like(video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).toggle_like(user_id, video_id)


# ── Comments ───────────────────────────────────────────────

@router.post("/{video_id}/comments", response_model=VideoCommentResponse, status_code=201)
def create_comment(video_id: UUID, data: VideoCommentCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).create_comment(user_id, video_id, data)


@router.get("/{video_id}/comments", response_model=VideoCommentListResponse)
def get_comments(
    video_id: UUID,
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return VideoService(db).get_comments(video_id, limit, offset)


@router.get("/comments/{comment_id}/replies", response_model=list[VideoCommentResponse])
def get_comment_replies(
    comment_id: UUID,
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    return VideoService(db).get_comment_replies(comment_id, limit)


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    VideoService(db).delete_comment(user_id, comment_id)
    return {"message": "Comment deleted"}


# ── Watch Later ────────────────────────────────────────────

@router.post("/{video_id}/watch-later")
def toggle_watch_later(video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).toggle_watch_later(user_id, video_id)


@router.get("/watch-later/list", response_model=WatchLaterListResponse)
def get_watch_later(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).get_watch_later(user_id)


# ── Playlists ──────────────────────────────────────────────

@router.post("/playlists", response_model=PlaylistResponse, status_code=201)
def create_playlist(data: PlaylistCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).create_playlist(user_id, data)


@router.get("/playlists", response_model=PlaylistListResponse)
def get_playlists(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).get_user_playlists(user_id)


@router.get("/playlists/{playlist_id}", response_model=PlaylistDetailResponse)
def get_playlist(playlist_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).get_playlist_detail(playlist_id, user_id)


@router.put("/playlists/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(playlist_id: UUID, data: PlaylistUpdate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).update_playlist(user_id, playlist_id, data)


@router.delete("/playlists/{playlist_id}")
def delete_playlist(playlist_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    VideoService(db).delete_playlist(user_id, playlist_id)
    return {"message": "Playlist deleted"}


@router.post("/playlists/{playlist_id}/videos/{video_id}")
def add_video_to_playlist(playlist_id: UUID, video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).add_video_to_playlist(user_id, playlist_id, video_id)


@router.delete("/playlists/{playlist_id}/videos/{video_id}")
def remove_video_from_playlist(playlist_id: UUID, video_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    VideoService(db).remove_video_from_playlist(user_id, playlist_id, video_id)
    return {"message": "Video removed from playlist"}


# ── Watch History ──────────────────────────────────────────

@router.post("/{video_id}/history")
def record_watch(video_id: UUID, progress: float = Query(default=0.0, ge=0.0, le=1.0), user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).record_watch(user_id, video_id, progress)


@router.get("/history/list", response_model=WatchHistoryListResponse)
def get_watch_history(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return VideoService(db).get_watch_history(user_id)


@router.delete("/history")
def clear_watch_history(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    VideoService(db).clear_watch_history(user_id)
    return {"message": "Watch history cleared"}


# ── Recommendations ────────────────────────────────────────

@router.get("/recommendations/feed", response_model=RecommendationListResponse)
def get_recommendations(
    video_id: UUID | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return VideoService(db).get_recommendations(user_id, video_id, limit)
