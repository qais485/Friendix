"""Phase 5 — Feed Generator.

Generates the final personalized feed: pull a bounded candidate pool, rank it
with the Ranking Engine, remove duplicates and re-score through the
recommendation rules, then serve cursor-based pages of the resulting ordered
list. No machine learning: the ordering is entirely the deterministic
Ranking -> Rules pipeline built in Phases 4 / 4.5.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.feed_config import get_feed_config
from app.schemas.feed_generator import (
    FeedGeneratorResponse,
    decode_cursor,
    encode_cursor,
)
from app.services.recommendation_service import RecommendationService


class FeedGenerator:
    """Cursor-paginated view over the shared Ranking -> Rules pipeline."""

    def __init__(self, db: Session):
        self.db = db
        self.recommendation = RecommendationService(db)
        self.config = get_feed_config()

    def generate(
        self,
        user_id: UUID | None,
        content_type: str | None,
        cursor: Optional[str] | None,
        limit: int,
    ) -> FeedGeneratorResponse:
        # Build the full ordered, deduped feed once per request. Cursor pages
        # are then a deterministic slice of this list: scores and rules are
        # recomputed identically between requests for the same candidate pool,
        # so an absolute-offset cursor stays stable.
        total, personalized, ordered = self.recommendation._build_ordered(
            user_id, content_type, self.config.CANDIDATE_POOL_SIZE
        )
        if not ordered:
            return FeedGeneratorResponse(
                user_id=user_id,
                personalized=personalized,
                total=total,
                returned=0,
                items=[],
                next_cursor=None,
                has_more=False,
            )

        start = decode_cursor(cursor) or 0
        if start > len(ordered):
            start = len(ordered)
        page = ordered[start:start + limit]

        end = start + len(page)
        has_more = end < len(ordered)
        return FeedGeneratorResponse(
            user_id=user_id,
            personalized=personalized,
            total=total,
            returned=len(page),
            items=page,
            next_cursor=encode_cursor(end) if has_more else None,
            has_more=has_more,
        )