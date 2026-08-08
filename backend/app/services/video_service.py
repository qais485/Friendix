from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.video_repository import VideoRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.content_profile_sync import drop_content_profile, sync_content_profile
from app.schemas.videos import (
    VideoCreate, VideoUpdate, VideoResponse, VideoListResponse,
    VideoCommentCreate, VideoCommentResponse, VideoCommentListResponse,
    VideoUserResponse, VideoCategoryResponse, VideoCategoryBrief,
    PlaylistCreate, PlaylistUpdate, PlaylistResponse, PlaylistDetailResponse, PlaylistListResponse,
    WatchHistoryResponse, WatchHistoryListResponse,
    WatchLaterResponse, WatchLaterListResponse,
    RecommendationListResponse,
)


class VideoService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = VideoRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _enrich_user(self, user) -> VideoUserResponse | None:
        if not user:
            return None
        return VideoUserResponse(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            avatar_url=getattr(user, "avatar_url", None),
            is_verified=getattr(user, "is_verified", False),
        )

    def _enrich_video(self, video, user_id: UUID | None = None, liked_ids=None, watch_later_ids=None) -> VideoResponse:
        is_liked = False
        is_watch_later = False
        if user_id:
            if liked_ids is not None:
                is_liked = video.id in liked_ids
            else:
                is_liked = self.repo.is_liked(user_id, video.id)
            if watch_later_ids is not None:
                is_watch_later = video.id in watch_later_ids
            else:
                is_watch_later = self.repo.is_watch_later(user_id, video.id)
        cat_brief = None
        if video.category:
            cat_brief = VideoCategoryBrief(id=video.category.id, name=video.category.name, slug=video.category.slug)
        return VideoResponse(
            id=video.id,
            user_id=video.user_id,
            title=video.title,
            description=video.description,
            thumbnail_url=video.thumbnail_url,
            video_url=video.video_url,
            duration=video.duration,
            width=video.width,
            height=video.height,
            privacy=video.privacy,
            status=video.status,
            views_count=video.views_count or 0,
            likes_count=video.likes_count or 0,
            comments_count=video.comments_count or 0,
            is_archived=video.is_archived,
            is_liked=is_liked,
            is_watch_later=is_watch_later,
            user=self._enrich_user(video.user),
            category=cat_brief,
            created_at=video.created_at,
        )

    def _cursor_from_videos(self, videos: list) -> str | None:
        if len(videos) > 0:
            return str(videos[-1].id)
        return None

    def _enrich_videos_batch(self, videos: list, user_id: UUID | None = None) -> list[VideoResponse]:
        """Batch-enrich videos with one like + one watch-later query (no N+1)."""
        if not videos:
            return []
        liked_ids: set = set()
        watch_later_ids: set = set()
        if user_id:
            video_ids = [v.id for v in videos]
            liked_ids = set(self.repo.get_liked_video_ids(user_id, video_ids))
            watch_later_ids = set(self.repo.get_watch_later_video_ids(user_id, video_ids))
        return [
            self._enrich_video(v, user_id, liked_ids, watch_later_ids)
            for v in videos
        ]

    # ── Categories ─────────────────────────────────────────

    def get_categories(self) -> list[VideoCategoryResponse]:
        cats = self.repo.get_categories()
        return [VideoCategoryResponse.model_validate(c) for c in cats]

    # ── Videos ─────────────────────────────────────────────

    def create_video(self, user_id: UUID, data: VideoCreate) -> VideoResponse:
        kwargs = {
            "title": data.title,
            "video_url": data.video_url,
        }
        if data.description:
            kwargs["description"] = data.description
        if data.thumbnail_url:
            kwargs["thumbnail_url"] = data.thumbnail_url
        if data.category_id:
            kwargs["category_id"] = data.category_id
        if data.duration is not None:
            kwargs["duration"] = data.duration
        if data.width is not None:
            kwargs["width"] = data.width
        if data.height is not None:
            kwargs["height"] = data.height
        kwargs["privacy"] = data.privacy
        video = self.repo.create_video(user_id, **kwargs)
        sync_content_profile(self.db, "video", video.id)
        return self._enrich_video(video, user_id)

    def get_video(self, video_id: UUID, user_id: UUID | None = None) -> VideoResponse:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        if user_id:
            self.repo.increment_views(video_id)
        return self._enrich_video(video, user_id)

    def update_video(self, user_id: UUID, video_id: UUID, data: VideoUpdate) -> VideoResponse:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        if video.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.repo.update_video(video, **update_data)
        sync_content_profile(self.db, "video", video_id)
        return self._enrich_video(updated, user_id)

    def delete_video(self, user_id: UUID, video_id: UUID) -> None:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        if video.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        drop_content_profile(self.db, "video", video_id)
        self.repo.delete_video(video)

    def list_videos(self, user_id: UUID, category_id: UUID | None = None, cursor: str | None = None, limit: int = 20) -> VideoListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        videos = self.repo.list_videos(user_id, category_id, cursor_uuid, limit)
        has_more = len(videos) > limit
        videos = videos[:limit]
        return VideoListResponse(
            videos=[self._enrich_video(v, user_id) for v in videos],
            next_cursor=self._cursor_from_videos(videos) if has_more else None,
            has_more=has_more,
        )

    def get_user_videos(self, user_id: UUID, target_user_id: UUID, limit: int = 20, offset: int = 0) -> VideoListResponse:
        videos = self.repo.get_user_videos(target_user_id, user_id, limit, offset)
        return VideoListResponse(videos=[self._enrich_video(v, user_id) for v in videos])

    def search_videos(self, query: str, user_id: UUID, limit: int = 20) -> VideoListResponse:
        videos = self.repo.search_videos(query, user_id, limit)
        return VideoListResponse(videos=[self._enrich_video(v, user_id) for v in videos])

    def get_trending(self, user_id: UUID, limit: int = 20) -> VideoListResponse:
        videos = self.repo.get_trending(user_id, limit)
        return VideoListResponse(videos=[self._enrich_video(v, user_id) for v in videos])

    # ── Likes ──────────────────────────────────────────────

    def toggle_like(self, user_id: UUID, video_id: UUID) -> dict:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        liked = self.repo.toggle_like(user_id, video_id)
        return {"is_liked": liked, "likes_count": video.likes_count + (1 if liked else -1)}

    # ── Comments ───────────────────────────────────────────

    def create_comment(self, user_id: UUID, video_id: UUID, data: VideoCommentCreate) -> VideoCommentResponse:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        comment = self.repo.create_comment(user_id, video_id, data.content, data.parent_id)
        user = self.profile_repo.get_by_id(user_id)
        return VideoCommentResponse(
            id=comment.id, user_id=comment.user_id, video_id=comment.video_id,
            parent_id=comment.parent_id, content=comment.content,
            likes_count=comment.likes_count, user=self._enrich_user(user),
            created_at=comment.created_at,
        )

    def get_comments(self, video_id: UUID, limit: int = 20, offset: int = 0) -> VideoCommentListResponse:
        comments = self.repo.get_comments(video_id, limit, offset)
        total = self.repo.count_comments(video_id)
        result = []
        for c in comments:
            user = self.profile_repo.get_by_id(c.user_id)
            replies_count = len(self.repo.get_comment_replies(c.id, limit=0))
            result.append(VideoCommentResponse(
                id=c.id, user_id=c.user_id, video_id=c.video_id,
                parent_id=c.parent_id, content=c.content,
                likes_count=c.likes_count, user=self._enrich_user(user),
                replies_count=replies_count, created_at=c.created_at,
            ))
        return VideoCommentListResponse(comments=result, total_count=total)

    def get_comment_replies(self, comment_id: UUID, limit: int = 10) -> list[VideoCommentResponse]:
        replies = self.repo.get_comment_replies(comment_id, limit)
        result = []
        for c in replies:
            user = self.profile_repo.get_by_id(c.user_id)
            result.append(VideoCommentResponse(
                id=c.id, user_id=c.user_id, video_id=c.video_id,
                parent_id=c.parent_id, content=c.content,
                likes_count=c.likes_count, user=self._enrich_user(user),
                created_at=c.created_at,
            ))
        return result

    def delete_comment(self, user_id: UUID, comment_id: UUID) -> None:
        comments = self.db.query(self.repo.__class__.__module__ and self.db.query).first() if False else None
        from app.models import VideoComment as VC
        comment = self.db.query(VC).filter(VC.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if comment.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.delete_comment(comment)

    # ── Watch Later ────────────────────────────────────────

    def toggle_watch_later(self, user_id: UUID, video_id: UUID) -> dict:
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        added = self.repo.toggle_watch_later(user_id, video_id)
        return {"is_watch_later": added}

    def get_watch_later(self, user_id: UUID) -> WatchLaterListResponse:
        items = self.repo.get_watch_later(user_id)
        return WatchLaterListResponse(items=[
            WatchLaterResponse(video=self._enrich_video(i.video, user_id), added_at=i.created_at)
            for i in items if i.video
        ])

    # ── Playlists ──────────────────────────────────────────

    def create_playlist(self, user_id: UUID, data: PlaylistCreate) -> PlaylistResponse:
        playlist = self.repo.create_playlist(user_id, data.name, data.description, data.privacy)
        return PlaylistResponse.model_validate(playlist)

    def get_user_playlists(self, user_id: UUID) -> PlaylistListResponse:
        playlists = self.repo.get_user_playlists(user_id)
        return PlaylistListResponse(playlists=[PlaylistResponse.model_validate(p) for p in playlists])

    def get_playlist_detail(self, playlist_id: UUID, user_id: UUID) -> PlaylistDetailResponse:
        playlist = self.repo.get_playlist_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        videos = self.repo.get_playlist_videos(playlist_id)
        user = self.profile_repo.get_by_id(playlist.user_id)
        return PlaylistDetailResponse(
            id=playlist.id, user_id=playlist.user_id, name=playlist.name,
            description=playlist.description, thumbnail_url=playlist.thumbnail_url,
            privacy=playlist.privacy, videos_count=playlist.videos_count,
            is_system=playlist.is_system, created_at=playlist.created_at,
            videos=[self._enrich_video(v, user_id) for v in videos],
            user=self._enrich_user(user),
        )

    def update_playlist(self, user_id: UUID, playlist_id: UUID, data: PlaylistUpdate) -> PlaylistResponse:
        playlist = self.repo.get_playlist_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        if playlist.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.repo.update_playlist(playlist, **update_data)
        return PlaylistResponse.model_validate(updated)

    def delete_playlist(self, user_id: UUID, playlist_id: UUID) -> None:
        playlist = self.repo.get_playlist_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        if playlist.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.delete_playlist(playlist)

    def add_video_to_playlist(self, user_id: UUID, playlist_id: UUID, video_id: UUID) -> dict:
        playlist = self.repo.get_playlist_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        if playlist.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        video = self.repo.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        self.repo.add_video_to_playlist(playlist_id, video_id)
        return {"message": "Video added to playlist"}

    def remove_video_from_playlist(self, user_id: UUID, playlist_id: UUID, video_id: UUID) -> None:
        playlist = self.repo.get_playlist_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        if playlist.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.remove_video_from_playlist(playlist_id, video_id)

    # ── Watch History ──────────────────────────────────────

    def record_watch(self, user_id: UUID, video_id: UUID, progress: float = 0.0) -> None:
        self.repo.record_watch(user_id, video_id, progress)

    def get_watch_history(self, user_id: UUID) -> WatchHistoryListResponse:
        items = self.repo.get_watch_history(user_id)
        return WatchHistoryListResponse(items=[
            WatchHistoryResponse(
                id=i.id,
                video=self._enrich_video(i.video, user_id) if i.video else None,
                progress=i.progress,
                completed=i.completed,
                watched_at=i.updated_at,
            )
            for i in items
        ])

    def clear_watch_history(self, user_id: UUID) -> None:
        self.repo.clear_watch_history(user_id)

    # ── Recommendations ────────────────────────────────────

    def get_recommendations(self, user_id: UUID, video_id: UUID | None = None, limit: int = 20) -> RecommendationListResponse:
        videos = self.repo.get_recommendations(user_id, video_id, limit)
        return RecommendationListResponse(videos=[self._enrich_video(v, user_id) for v in videos])
