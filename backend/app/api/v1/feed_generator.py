from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.feed_config import get_feed_config
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.schemas.feed import FeedResponse
from app.schemas.feed_generator import FeedGeneratorResponse
from app.schemas.videos import VideoListResponse
from app.services.feed_generator import FeedGenerator
from app.services.feed_service import FeedService
from app.services.video_service import VideoService

router = APIRouter(tags=["Feed"])


def get_feed_generator(db: Session = Depends(get_db)) -> FeedGenerator:
    return FeedGenerator(db)


def get_feed_service(db: Session = Depends(get_db)) -> FeedService:
    return FeedService(db)


def get_video_service(db: Session = Depends(get_db)) -> VideoService:
    return VideoService(db)


@router.get(
    "/for-you",
    response_model=FeedGeneratorResponse,
    summary="Generate the personalized feed",
)
def get_recommended_feed(
    cursor: Optional[str] = Query(default=None),
    content_type: Optional[str] = Query(default=None),
    limit: int = Query(default=get_feed_config().DEFAULT_LIMIT, ge=1, le=get_feed_config().MAX_LIMIT),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedGenerator = Depends(get_feed_generator),
):
    """Return a page of the personalized feed for the authenticated user.

    Candidates are ranked with the Ranking Engine, deduplicated and adjusted by
    the recommendation rules, then paginated with an opaque ``cursor``. No
    machine learning: ordering is fully deterministic.
    """
    if content_type is not None:
        if content_type not in CONTENT_PROFILE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"content_type must be one of {CONTENT_PROFILE_TYPES}",
            )
    return service.generate(user_id, content_type, cursor, limit)


@router.get(
    "/for-you/posts",
    response_model=FeedResponse,
    summary="Personalized feed hydrated into full post objects",
)
def get_recommended_posts(
    cursor: Optional[str] = Query(default=None),
    limit: int = Query(default=get_feed_config().DEFAULT_LIMIT, ge=1, le=get_feed_config().MAX_LIMIT),
    user_id: UUID = Depends(get_current_user_id),
    generator: FeedGenerator = Depends(get_feed_generator),
    service: FeedService = Depends(get_feed_service),
):
    """Ranked post page from the Ranking -> Rules pipeline, hydrated to full posts."""
    feed = generator.generate(user_id, "post", cursor, limit)
    if not feed.items:
        return FeedResponse(posts=[], next_cursor=feed.next_cursor, has_more=feed.has_more)
    posts_by_id = {p.id: p for p in service.feed_repo.get_posts_by_ids([i.content_id for i in feed.items])}
    posts = [
        service._enrich_post(posts_by_id[item.content_id], user_id)
        for item in feed.items
        if item.content_id in posts_by_id
    ]
    return FeedResponse(
        posts=posts,
        next_cursor=feed.next_cursor,
        has_more=feed.has_more,
    )


@router.get(
    "/for-you/videos",
    response_model=VideoListResponse,
    summary="Personalized video feed hydrated into full video objects",
)
def get_recommended_videos(
    cursor: Optional[str] = Query(default=None),
    limit: int = Query(default=get_feed_config().DEFAULT_LIMIT, ge=1, le=get_feed_config().MAX_LIMIT),
    user_id: UUID = Depends(get_current_user_id),
    generator: FeedGenerator = Depends(get_feed_generator),
    service: VideoService = Depends(get_video_service),
):
    """Ranked video page from the Ranking -> Rules pipeline, hydrated to full videos."""
    feed = generator.generate(user_id, "video", cursor, limit)
    if not feed.items:
        return VideoListResponse(videos=[], next_cursor=feed.next_cursor, has_more=feed.has_more)
    videos_by_id = {v.id: v for v in service.repo.get_videos_by_ids([i.content_id for i in feed.items])}
    videos = service._enrich_videos_batch(
        [videos_by_id[item.content_id] for item in feed.items if item.content_id in videos_by_id],
        user_id,
    )
    return VideoListResponse(
        videos=videos,
        next_cursor=feed.next_cursor,
        has_more=feed.has_more,
    )