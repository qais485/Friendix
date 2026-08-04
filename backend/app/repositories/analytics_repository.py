from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, desc, and_, or_, case, extract
from sqlalchemy.orm import Session
from app.models import (
    ProfileView, Post, PostLike, PostSave, Comment,
    Follow, Friendship, Story, StoryView, StoryReaction,
    Reel, Video, VideoLike, VideoComment, WatchHistory,
)


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def _days_ago(self, days: int) -> datetime:
        return datetime.now(timezone.utc) - timedelta(days=days)

    # ── Profile Views ──────────────────────────────────────

    def record_profile_view(self, viewer_id: UUID, viewed_id: UUID) -> None:
        if viewer_id == viewed_id:
            return
        pv = ProfileView(viewer_id=viewer_id, viewed_id=viewed_id)
        self.db.add(pv)
        self.db.commit()

    def get_profile_views_count(self, user_id: UUID, days: int = 30) -> int:
        since = self._days_ago(days)
        return self.db.query(func.count(ProfileView.id)).filter(
            ProfileView.viewed_id == user_id,
            ProfileView.created_at >= since,
        ).scalar() or 0

    def get_profile_views_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(ProfileView.created_at).label("date"),
                func.count(ProfileView.id).label("count"),
            )
            .filter(ProfileView.viewed_id == user_id, ProfileView.created_at >= since)
            .group_by(func.date(ProfileView.created_at))
            .order_by(func.date(ProfileView.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count} for r in rows]

    def get_profile_viewers(self, user_id: UUID, limit: int = 10) -> list[dict]:
        from app.models import User
        rows = (
            self.db.query(
                ProfileView.viewer_id,
                func.count(ProfileView.id).label("views"),
                func.max(ProfileView.created_at).label("last_viewed"),
            )
            .filter(ProfileView.viewed_id == user_id)
            .group_by(ProfileView.viewer_id)
            .order_by(desc("views"))
            .limit(limit)
            .all()
        )
        result = []
        for r in rows:
            user = self.db.query(User).filter(User.id == r.viewer_id).first()
            if user:
                result.append({
                    "user_id": r.viewer_id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "avatar_url": getattr(user, "avatar_url", None),
                    "views": r.views,
                    "last_viewed": str(r.last_viewed) if r.last_viewed else None,
                })
        return result

    # ── Post Reach / Engagement ────────────────────────────

    def get_post_analytics(self, user_id: UUID, days: int = 30) -> dict:
        since = self._days_ago(days)
        posts = self.db.query(Post).filter(Post.user_id == user_id, Post.created_at >= since).all()
        total_posts = len(posts)
        total_likes = sum(p.likes_count or 0 for p in posts)
        total_comments = sum(p.comments_count or 0 for p in posts)
        total_shares = sum(p.shares_count or 0 for p in posts)
        total_reposts = sum(p.repost_count or 0 for p in posts)
        total_engagement = total_likes + total_comments + total_shares + total_reposts
        engagement_rate = (total_engagement / total_posts if total_posts > 0 else 0.0)
        return {
            "total_posts": total_posts,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_reposts": total_reposts,
            "total_engagement": total_engagement,
            "engagement_rate": round(engagement_rate, 2),
        }

    def get_posts_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(Post.created_at).label("date"),
                func.count(Post.id).label("count"),
                func.coalesce(func.sum(Post.likes_count), 0).label("likes"),
                func.coalesce(func.sum(Post.comments_count), 0).label("comments"),
            )
            .filter(Post.user_id == user_id, Post.created_at >= since)
            .group_by(func.date(Post.created_at))
            .order_by(func.date(Post.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count, "likes": r.likes, "comments": r.comments} for r in rows]

    def get_top_posts(self, user_id: UUID, limit: int = 5) -> list[dict]:
        posts = (
            self.db.query(Post)
            .filter(Post.user_id == user_id, Post.is_archived == False, Post.is_draft == False)
            .order_by(desc(Post.likes_count + Post.comments_count + Post.shares_count))
            .limit(limit)
            .all()
        )
        return [{
            "id": str(p.id),
            "content": (p.content or "")[:100],
            "post_type": p.post_type,
            "likes_count": p.likes_count or 0,
            "comments_count": p.comments_count or 0,
            "shares_count": p.shares_count or 0,
            "created_at": str(p.created_at) if p.created_at else None,
        } for p in posts]

    # ── Followers Growth ───────────────────────────────────

    def get_followers_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Follow.id)).filter(Follow.following_id == user_id).scalar() or 0

    def get_following_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Follow.id)).filter(Follow.follower_id == user_id).scalar() or 0

    def get_friends_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Friendship.id)).filter(
            or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
            Friendship.status == "accepted",
        ).scalar() or 0

    def get_followers_growth_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(Follow.created_at).label("date"),
                func.count(Follow.id).label("count"),
            )
            .filter(Follow.following_id == user_id, Follow.created_at >= since)
            .group_by(func.date(Follow.created_at))
            .order_by(func.date(Follow.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count} for r in rows]

    def get_followers_summary(self, user_id: UUID, days: int = 30) -> dict:
        current_followers = self.get_followers_count(user_id)
        current_following = self.get_following_count(user_id)
        current_friends = self.get_friends_count(user_id)
        since = self._days_ago(days)
        new_followers = self.db.query(func.count(Follow.id)).filter(
            Follow.following_id == user_id, Follow.created_at >= since
        ).scalar() or 0
        new_following = self.db.query(func.count(Follow.id)).filter(
            Follow.follower_id == user_id, Follow.created_at >= since
        ).scalar() or 0
        return {
            "total_followers": current_followers,
            "total_following": current_following,
            "total_friends": current_friends,
            "new_followers": new_followers,
            "new_following": new_following,
        }

    # ── Story Analytics ────────────────────────────────────

    def get_story_analytics(self, user_id: UUID, days: int = 30) -> dict:
        since = self._days_ago(days)
        stories = self.db.query(Story).filter(Story.user_id == user_id, Story.created_at >= since).all()
        total_stories = len(stories)
        total_views = sum(s.views_count or 0 for s in stories)
        total_reactions = self.db.query(func.count(StoryReaction.id)).join(Story).filter(
            Story.user_id == user_id, Story.created_at >= since
        ).scalar() or 0
        total_replies = self.db.query(func.count(StoryReply.id)).join(Story).filter(
            Story.user_id == user_id, Story.created_at >= since
        ).scalar() or 0
        avg_views = total_views / total_stories if total_stories > 0 else 0
        return {
            "total_stories": total_stories,
            "total_views": total_views,
            "total_reactions": total_reactions,
            "total_replies": total_replies,
            "avg_views_per_story": round(avg_views, 1),
        }

    def get_stories_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(Story.created_at).label("date"),
                func.count(Story.id).label("count"),
                func.coalesce(func.sum(Story.views_count), 0).label("views"),
            )
            .filter(Story.user_id == user_id, Story.created_at >= since)
            .group_by(func.date(Story.created_at))
            .order_by(func.date(Story.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count, "views": r.views} for r in rows]

    # ── Reel Analytics ─────────────────────────────────────

    def get_reel_analytics(self, user_id: UUID, days: int = 30) -> dict:
        since = self._days_ago(days)
        reels = self.db.query(Reel).filter(Reel.user_id == user_id, Reel.created_at >= since).all()
        total_reels = len(reels)
        total_views = sum(r.views_count or 0 for r in reels)
        total_likes = sum(r.likes_count or 0 for r in reels)
        total_comments = sum(r.comments_count or 0 for r in reels)
        total_shares = sum(r.shares_count or 0 for r in reels)
        avg_views = total_views / total_reels if total_reels > 0 else 0
        return {
            "total_reels": total_reels,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "avg_views_per_reel": round(avg_views, 1),
        }

    def get_reels_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(Reel.created_at).label("date"),
                func.count(Reel.id).label("count"),
                func.coalesce(func.sum(Reel.views_count), 0).label("views"),
                func.coalesce(func.sum(Reel.likes_count), 0).label("likes"),
            )
            .filter(Reel.user_id == user_id, Reel.created_at >= since)
            .group_by(func.date(Reel.created_at))
            .order_by(func.date(Reel.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count, "views": r.views, "likes": r.likes} for r in rows]

    def get_top_reels(self, user_id: UUID, limit: int = 5) -> list[dict]:
        reels = (
            self.db.query(Reel)
            .filter(Reel.user_id == user_id, Reel.is_archived == False)
            .order_by(desc(Reel.views_count))
            .limit(limit)
            .all()
        )
        return [{
            "id": str(r.id),
            "caption": (r.caption or "")[:100],
            "views_count": r.views_count or 0,
            "likes_count": r.likes_count or 0,
            "comments_count": r.comments_count or 0,
            "created_at": str(r.created_at) if r.created_at else None,
        } for r in reels]

    # ── Video Analytics ────────────────────────────────────

    def get_video_analytics(self, user_id: UUID, days: int = 30) -> dict:
        since = self._days_ago(days)
        videos = self.db.query(Video).filter(Video.user_id == user_id, Video.created_at >= since).all()
        total_videos = len(videos)
        total_views = sum(v.views_count or 0 for v in videos)
        total_likes = sum(v.likes_count or 0 for v in videos)
        total_comments = sum(v.comments_count or 0 for v in videos)
        avg_views = total_views / total_videos if total_videos > 0 else 0
        return {
            "total_videos": total_videos,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "avg_views_per_video": round(avg_views, 1),
        }

    def get_videos_time_series(self, user_id: UUID, days: int = 30) -> list[dict]:
        since = self._days_ago(days)
        rows = (
            self.db.query(
                func.date(Video.created_at).label("date"),
                func.count(Video.id).label("count"),
                func.coalesce(func.sum(Video.views_count), 0).label("views"),
                func.coalesce(func.sum(Video.likes_count), 0).label("likes"),
            )
            .filter(Video.user_id == user_id, Video.created_at >= since)
            .group_by(func.date(Video.created_at))
            .order_by(func.date(Video.created_at))
            .all()
        )
        return [{"date": str(r.date), "count": r.count, "views": r.views, "likes": r.likes} for r in rows]

    def get_top_videos(self, user_id: UUID, limit: int = 5) -> list[dict]:
        videos = (
            self.db.query(Video)
            .filter(Video.user_id == user_id, Video.is_archived == False)
            .order_by(desc(Video.views_count))
            .limit(limit)
            .all()
        )
        return [{
            "id": str(v.id),
            "title": v.title,
            "views_count": v.views_count or 0,
            "likes_count": v.likes_count or 0,
            "comments_count": v.comments_count or 0,
            "duration": v.duration,
            "created_at": str(v.created_at) if v.created_at else None,
        } for v in videos]

    # ── Overview ───────────────────────────────────────────

    def get_overview(self, user_id: UUID) -> dict:
        total_posts = self.db.query(func.count(Post.id)).filter(Post.user_id == user_id).scalar() or 0
        total_followers = self.get_followers_count(user_id)
        total_views = self.db.query(func.count(ProfileView.id)).filter(ProfileView.viewed_id == user_id).scalar() or 0
        total_reels = self.db.query(func.count(Reel.id)).filter(Reel.user_id == user_id).scalar() or 0
        total_videos = self.db.query(func.count(Video.id)).filter(Video.user_id == user_id).scalar() or 0
        return {
            "total_posts": total_posts,
            "total_followers": total_followers,
            "total_profile_views": total_views,
            "total_reels": total_reels,
            "total_videos": total_videos,
        }
