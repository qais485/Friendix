from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.recommendation_analytics_repository import RecommendationAnalyticsRepository


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AnalyticsRepository(db)

    def record_profile_view(self, viewer_id: UUID, viewed_id: UUID) -> None:
        self.repo.record_profile_view(viewer_id, viewed_id)

    def get_overview(self, user_id: UUID) -> dict:
        return self.repo.get_overview(user_id)

    def get_events(self, user_id: UUID, days: int = 30) -> dict:
        """Event-log analytics for the authenticated creator's own content.

        Complements the denormalized-counter endpoints with the rich signals
        only available from the tracking log: impressions, view conversion
        (CTR), watch time, completion and engagement — self-scoped to content
        the caller owns.
        """
        repo = RecommendationAnalyticsRepository(self.db)
        since = repo.since(days)
        summary = repo.get_summary(since, creator_id=user_id)
        total_watch, watch_points = repo.get_watch_time_series(since, creator_id=user_id)
        engagement_points = repo.get_engagement_series(since, creator_id=user_id)
        top = repo.get_content_performances(since, 10, creator_id=user_id)
        return {
            "days": days,
            "summary": summary,
            "total_watch_time_seconds": total_watch,
            "watch_time_series": watch_points,
            "engagement_series": engagement_points,
            "top_content": top,
        }

    def get_profile_views(self, user_id: UUID, days: int = 30) -> dict:
        return {
            "total": self.repo.get_profile_views_count(user_id, days),
            "time_series": self.repo.get_profile_views_time_series(user_id, days),
            "top_viewers": self.repo.get_profile_viewers(user_id, limit=10),
        }

    def get_post_analytics(self, user_id: UUID, days: int = 30) -> dict:
        summary = self.repo.get_post_analytics(user_id, days)
        return {
            **summary,
            "time_series": self.repo.get_posts_time_series(user_id, days),
            "top_posts": self.repo.get_top_posts(user_id, limit=5),
        }

    def get_engagement(self, user_id: UUID, days: int = 30) -> dict:
        post_data = self.repo.get_post_analytics(user_id, days)
        story_data = self.repo.get_story_analytics(user_id, days)
        reel_data = self.repo.get_reel_analytics(user_id, days)
        video_data = self.repo.get_video_analytics(user_id, days)
        total_content = post_data["total_posts"] + story_data["total_stories"] + reel_data["total_reels"] + video_data["total_videos"]
        total_interactions = (
            post_data["total_engagement"]
            + story_data["total_views"] + story_data["total_reactions"]
            + reel_data["total_views"] + reel_data["total_likes"]
            + video_data["total_views"] + video_data["total_likes"]
        )
        return {
            "total_content": total_content,
            "total_interactions": total_interactions,
            "avg_engagement_rate": round(total_interactions / total_content if total_content > 0 else 0, 2),
            "posts": post_data,
            "stories": story_data,
            "reels": reel_data,
            "videos": video_data,
        }

    def get_followers_growth(self, user_id: UUID, days: int = 30) -> dict:
        summary = self.repo.get_followers_summary(user_id, days)
        return {
            **summary,
            "time_series": self.repo.get_followers_growth_time_series(user_id, days),
        }

    def get_story_analytics(self, user_id: UUID, days: int = 30) -> dict:
        summary = self.repo.get_story_analytics(user_id, days)
        return {
            **summary,
            "time_series": self.repo.get_stories_time_series(user_id, days),
        }

    def get_reel_analytics(self, user_id: UUID, days: int = 30) -> dict:
        summary = self.repo.get_reel_analytics(user_id, days)
        return {
            **summary,
            "time_series": self.repo.get_reels_time_series(user_id, days),
            "top_reels": self.repo.get_top_reels(user_id, limit=5),
        }

    def get_video_analytics(self, user_id: UUID, days: int = 30) -> dict:
        summary = self.repo.get_video_analytics(user_id, days)
        return {
            **summary,
            "time_series": self.repo.get_videos_time_series(user_id, days),
            "top_videos": self.repo.get_top_videos(user_id, limit=5),
        }
