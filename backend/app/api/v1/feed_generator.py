from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.feed_config import get_feed_config
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.schemas.feed_generator import FeedGeneratorResponse
from app.services.feed_generator import FeedGenerator

router = APIRouter(tags=["Feed"])


def get_feed_generator(db: Session = Depends(get_db)) -> FeedGenerator:
    return FeedGenerator(db)


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