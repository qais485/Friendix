from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import func, desc, and_, not_
from sqlalchemy.orm import Session, joinedload
from app.models import (
    Video, VideoCategory, VideoLike, VideoComment, WatchLater,
    Playlist, PlaylistVideo, WatchHistory, User, BlockedUser, Friendship,
)


class VideoRepository:
    def __init__(self, db: Session):
        self.db = db

    def _get_blocked_ids(self, user_id: UUID) -> list[UUID]:
        return [
            r.blocked_id for r in
            self.db.query(BlockedUser.blocked_id).filter(BlockedUser.blocker_id == user_id).all()
        ]

    def _get_friend_ids(self, user_id: UUID) -> list[UUID]:
        rows = (
            self.db.query(Friendship.addressee_id)
            .filter(Friendship.requester_id == user_id, Friendship.status == "accepted")
            .all()
        ) + (
            self.db.query(Friendship.requester_id)
            .filter(Friendship.addressee_id == user_id, Friendship.status == "accepted")
            .all()
        )
        return [r[0] for r in rows]

    def _privacy_filter(self, user_id: UUID, author_id: UUID, privacy: str) -> bool:
        if author_id == user_id:
            return True
        if privacy == "everyone":
            return True
        blocked = self._get_blocked_ids(user_id)
        if author_id in blocked:
            return False
        if privacy == "friends":
            friends = self._get_friend_ids(user_id)
            return author_id in friends
        return False

    # ── Categories ─────────────────────────────────────────

    def get_categories(self) -> list[VideoCategory]:
        return self.db.query(VideoCategory).filter(VideoCategory.is_active == True).order_by(desc(VideoCategory.videos_count)).all()

    def get_category_by_slug(self, slug: str) -> VideoCategory | None:
        return self.db.query(VideoCategory).filter(VideoCategory.slug == slug).first()

    # ── Videos ─────────────────────────────────────────────

    def create_video(self, user_id: UUID, **kwargs) -> Video:
        video = Video(user_id=user_id, **kwargs)
        self.db.add(video)
        self.db.commit()
        self.db.refresh(video)
        return video

    def get_video_by_id(self, video_id: UUID) -> Video | None:
        return (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.id == video_id, Video.is_archived == False)
            .first()
        )

    def get_videos_by_ids(self, video_ids: list[UUID]) -> list[Video]:
        """Fetch many videos in one query with author + category pre-loaded."""
        if not video_ids:
            return []
        return (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.id.in_(video_ids), Video.is_archived == False)
            .all()
        )

    def update_video(self, video: Video, **kwargs) -> Video:
        for k, v in kwargs.items():
            if v is not None:
                setattr(video, k, v)
        self.db.commit()
        self.db.refresh(video)
        return video

    def delete_video(self, video: Video) -> None:
        self.db.delete(video)
        self.db.commit()

    def increment_views(self, video_id: UUID) -> None:
        self.db.query(Video).filter(Video.id == video_id).update({Video.views_count: Video.views_count + 1})
        self.db.commit()

    def list_videos(self, user_id: UUID, category_id: UUID | None = None, cursor: UUID | None = None, limit: int = 20) -> list[Video]:
        blocked = self._get_blocked_ids(user_id)
        q = (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.is_archived == False, Video.status == "ready", not_(Video.user_id.in_(blocked)))
        )
        if category_id:
            q = q.filter(Video.category_id == category_id)
        if cursor:
            cursor_video = self.db.query(Video).filter(Video.id == cursor).first()
            if cursor_video:
                q = q.filter(
                    Video.created_at < cursor_video.created_at,
                )
        return q.order_by(desc(Video.created_at)).limit(limit + 1).all()

    def get_user_videos(self, user_id: UUID, viewer_id: UUID | None = None, limit: int = 20, offset: int = 0) -> list[Video]:
        q = (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.user_id == user_id, Video.is_archived == False)
        )
        return q.order_by(desc(Video.created_at)).offset(offset).limit(limit).all()

    def search_videos(self, query: str, user_id: UUID, limit: int = 20) -> list[Video]:
        blocked = self._get_blocked_ids(user_id)
        pattern = f"%{query}%"
        return (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(
                Video.is_archived == False,
                Video.status == "ready",
                not_(Video.user_id.in_(blocked)),
                (Video.title.ilike(pattern) | Video.description.ilike(pattern)),
            )
            .order_by(desc(Video.views_count))
            .limit(limit)
            .all()
        )

    def get_trending(self, user_id: UUID, limit: int = 20) -> list[Video]:
        blocked = self._get_blocked_ids(user_id)
        return (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.is_archived == False, Video.status == "ready", not_(Video.user_id.in_(blocked)))
            .order_by(desc(Video.views_count), desc(Video.created_at))
            .limit(limit)
            .all()
        )

    # ── Likes ──────────────────────────────────────────────

    def toggle_like(self, user_id: UUID, video_id: UUID) -> bool:
        existing = self.db.query(VideoLike).filter(VideoLike.user_id == user_id, VideoLike.video_id == video_id).first()
        if existing:
            self.db.delete(existing)
            self.db.query(Video).filter(Video.id == video_id).update({Video.likes_count: func.greatest(Video.likes_count - 1, 0)})
            self.db.commit()
            return False
        else:
            self.db.add(VideoLike(user_id=user_id, video_id=video_id))
            self.db.query(Video).filter(Video.id == video_id).update({Video.likes_count: Video.likes_count + 1})
            self.db.commit()
            return True

    def is_liked(self, user_id: UUID, video_id: UUID) -> bool:
        return self.db.query(VideoLike).filter(VideoLike.user_id == user_id, VideoLike.video_id == video_id).first() is not None

    def get_liked_video_ids(self, user_id: UUID, video_ids: list[UUID]) -> list[UUID]:
        """Batch variant of :meth:`is_liked` (single query, no N+1)."""
        if not video_ids:
            return []
        rows = self.db.query(VideoLike.video_id).filter(
            VideoLike.user_id == user_id, VideoLike.video_id.in_(video_ids)
        ).all()
        return [r[0] for r in rows]

    # ── Comments ───────────────────────────────────────────

    def create_comment(self, user_id: UUID, video_id: UUID, content: str, parent_id: UUID | None = None) -> VideoComment:
        comment = VideoComment(user_id=user_id, video_id=video_id, content=content, parent_id=parent_id)
        self.db.add(comment)
        self.db.query(Video).filter(Video.id == video_id).update({Video.comments_count: Video.comments_count + 1})
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comments(self, video_id: UUID, limit: int = 20, offset: int = 0) -> list[VideoComment]:
        return (
            self.db.query(VideoComment)
            .options(joinedload(VideoComment.user))
            .filter(VideoComment.video_id == video_id, VideoComment.parent_id == None)
            .order_by(desc(VideoComment.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_comment_replies(self, comment_id: UUID, limit: int = 10) -> list[VideoComment]:
        return (
            self.db.query(VideoComment)
            .options(joinedload(VideoComment.user))
            .filter(VideoComment.parent_id == comment_id)
            .order_by(VideoComment.created_at)
            .limit(limit)
            .all()
        )

    def count_comments(self, video_id: UUID) -> int:
        return self.db.query(func.count(VideoComment.id)).filter(VideoComment.video_id == video_id).scalar() or 0

    def delete_comment(self, comment: VideoComment) -> None:
        self.db.query(Video).filter(Video.id == comment.video_id).update({Video.comments_count: func.greatest(Video.comments_count - 1, 0)})
        self.db.delete(comment)
        self.db.commit()

    # ── Watch Later ────────────────────────────────────────

    def toggle_watch_later(self, user_id: UUID, video_id: UUID) -> bool:
        existing = self.db.query(WatchLater).filter(WatchLater.user_id == user_id, WatchLater.video_id == video_id).first()
        if existing:
            self.db.delete(existing)
            self.db.commit()
            return False
        else:
            self.db.add(WatchLater(user_id=user_id, video_id=video_id))
            self.db.commit()
            return True

    def is_watch_later(self, user_id: UUID, video_id: UUID) -> bool:
        return self.db.query(WatchLater).filter(WatchLater.user_id == user_id, WatchLater.video_id == video_id).first() is not None

    def get_watch_later_video_ids(self, user_id: UUID, video_ids: list[UUID]) -> list[UUID]:
        """Batch variant of :meth:`is_watch_later` (single query, no N+1)."""
        if not video_ids:
            return []
        rows = self.db.query(WatchLater.video_id).filter(
            WatchLater.user_id == user_id, WatchLater.video_id.in_(video_ids)
        ).all()
        return [r[0] for r in rows]

    def get_watch_later(self, user_id: UUID, limit: int = 50) -> list[WatchLater]:
        return (
            self.db.query(WatchLater)
            .options(joinedload(WatchLater.video).joinedload(Video.user))
            .filter(WatchLater.user_id == user_id)
            .order_by(desc(WatchLater.created_at))
            .limit(limit)
            .all()
        )

    # ── Playlists ──────────────────────────────────────────

    def create_playlist(self, user_id: UUID, name: str, description: str | None = None, privacy: str = "everyone") -> Playlist:
        playlist = Playlist(user_id=user_id, name=name, description=description, privacy=privacy)
        self.db.add(playlist)
        self.db.commit()
        self.db.refresh(playlist)
        return playlist

    def get_playlist_by_id(self, playlist_id: UUID) -> Playlist | None:
        return (
            self.db.query(Playlist)
            .options(joinedload(Playlist.user))
            .filter(Playlist.id == playlist_id)
            .first()
        )

    def get_user_playlists(self, user_id: UUID) -> list[Playlist]:
        return (
            self.db.query(Playlist)
            .filter(Playlist.user_id == user_id, Playlist.is_system == False)
            .order_by(desc(Playlist.created_at))
            .all()
        )

    def update_playlist(self, playlist: Playlist, **kwargs) -> Playlist:
        for k, v in kwargs.items():
            if v is not None:
                setattr(playlist, k, v)
        self.db.commit()
        self.db.refresh(playlist)
        return playlist

    def delete_playlist(self, playlist: Playlist) -> None:
        self.db.delete(playlist)
        self.db.commit()

    def add_video_to_playlist(self, playlist_id: UUID, video_id: UUID) -> PlaylistVideo:
        max_pos = self.db.query(func.max(PlaylistVideo.position)).filter(PlaylistVideo.playlist_id == playlist_id).scalar() or 0
        pv = PlaylistVideo(playlist_id=playlist_id, video_id=video_id, position=max_pos + 1)
        self.db.add(pv)
        self.db.query(Playlist).filter(Playlist.id == playlist_id).update({Playlist.videos_count: Playlist.videos_count + 1})
        self.db.commit()
        self.db.refresh(pv)
        return pv

    def remove_video_from_playlist(self, playlist_id: UUID, video_id: UUID) -> None:
        pv = self.db.query(PlaylistVideo).filter(PlaylistVideo.playlist_id == playlist_id, PlaylistVideo.video_id == video_id).first()
        if pv:
            self.db.delete(pv)
            self.db.query(Playlist).filter(Playlist.id == playlist_id).update({Playlist.videos_count: func.greatest(Playlist.videos_count - 1, 0)})
            self.db.commit()

    def get_playlist_videos(self, playlist_id: UUID) -> list[Video]:
        return (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .join(PlaylistVideo, PlaylistVideo.video_id == Video.id)
            .filter(PlaylistVideo.playlist_id == playlist_id)
            .order_by(PlaylistVideo.position)
            .all()
        )

    # ── Watch History ──────────────────────────────────────

    def record_watch(self, user_id: UUID, video_id: UUID, progress: float = 0.0) -> WatchHistory:
        existing = self.db.query(WatchHistory).filter(WatchHistory.user_id == user_id, WatchHistory.video_id == video_id).first()
        if existing:
            existing.progress = progress
            existing.completed = progress > 0.9
            existing.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        entry = WatchHistory(user_id=user_id, video_id=video_id, progress=progress, completed=progress > 0.9)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_watch_history(self, user_id: UUID, limit: int = 50) -> list[WatchHistory]:
        return (
            self.db.query(WatchHistory)
            .options(joinedload(WatchHistory.video).joinedload(Video.user))
            .filter(WatchHistory.user_id == user_id)
            .order_by(desc(WatchHistory.updated_at))
            .limit(limit)
            .all()
        )

    def clear_watch_history(self, user_id: UUID) -> None:
        self.db.query(WatchHistory).filter(WatchHistory.user_id == user_id).delete()
        self.db.commit()

    # ── Recommendations ────────────────────────────────────

    def get_recommendations(self, user_id: UUID, video_id: UUID | None = None, limit: int = 20) -> list[Video]:
        blocked = self._get_blocked_ids(user_id)
        base = (
            self.db.query(Video)
            .options(joinedload(Video.user), joinedload(Video.category))
            .filter(Video.is_archived == False, Video.status == "ready", not_(Video.user_id.in_(blocked)))
        )
        if video_id:
            current = self.db.query(Video).filter(Video.id == video_id).first()
            if current and current.category_id:
                base = base.filter(Video.category_id == current.category_id, Video.id != video_id)
        else:
            history_ids = [h.video_id for h in self.db.query(WatchHistory.video_id).filter(WatchHistory.user_id == user_id).order_by(desc(WatchHistory.updated_at)).limit(10).all()]
            if history_ids:
                watched_cats = [v.category_id for v in self.db.query(Video.category_id).filter(Video.id.in_(history_ids)).all() if v.category_id]
                if watched_cats:
                    base = base.filter(Video.category_id.in_(watched_cats))
        return base.order_by(desc(Video.views_count), desc(Video.created_at)).limit(limit).all()
