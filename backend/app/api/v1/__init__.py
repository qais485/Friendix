from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.privacy import router as privacy_router
from app.api.v1.friends import router as friends_router
from app.api.v1.feed import router as feed_router
from app.api.v1.media import router as media_router
from app.api.v1.live import router as live_router
from app.api.v1.comments import router as comments_router
from app.api.v1.messaging import router as messaging_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router
from app.api.v1.search import router as search_router
from app.api.v1.hashtags import router as hashtags_router
from app.api.v1.groups import router as groups_router
from app.api.v1.events import router as events_router
from app.api.v1.videos import router as videos_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.event_tracking import router as event_tracking_router
from app.api.v1.interests import router as interests_router
from app.api.v1.content_profiles import router as content_profiles_router
from app.api.v1.ranking import router as ranking_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.feed_generator import router as feed_generator_router
from app.api.v1.settings import router as settings_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(privacy_router, prefix="/privacy", tags=["Privacy"])
api_router.include_router(friends_router, prefix="/friends", tags=["Friends"])
api_router.include_router(feed_router, prefix="/feed", tags=["Feed"])
api_router.include_router(media_router, prefix="/media", tags=["Media"])
api_router.include_router(live_router, prefix="/live", tags=["Live Streaming"])
api_router.include_router(comments_router, prefix="/feed", tags=["Comments"])
api_router.include_router(messaging_router, prefix="/messaging", tags=["Messaging"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])
api_router.include_router(hashtags_router, prefix="/hashtags", tags=["Hashtags"])
api_router.include_router(groups_router, prefix="/groups", tags=["Groups"])
api_router.include_router(events_router, prefix="/events", tags=["Events"])
api_router.include_router(videos_router, prefix="/videos", tags=["Videos"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(event_tracking_router, prefix="/tracking", tags=["Event Tracking"])
api_router.include_router(interests_router, prefix="/interests", tags=["User Interests"])
api_router.include_router(content_profiles_router, prefix="/content-profiles", tags=["Content Profiles"])
api_router.include_router(ranking_router, prefix="/ranking", tags=["Ranking"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(feed_generator_router, prefix="/feed", tags=["Feed"])
api_router.include_router(settings_router, prefix="", tags=["Settings"])
