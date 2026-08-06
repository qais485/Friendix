from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.ranking_repository import RankingRepository, profile_features
from app.schemas.ranking import (
    RankedItem,
    RankingBreakdown,
    RankingExplainResponse,
    RankingPreviewResponse,
)
from app.services.ranking_engine import RankingEngine


class RankingService:
    """Scores content against a user (or globally) using the RankingEngine.

    Deliberately does NOT wire into the feed: this only computes and returns
    scores for a candidate pool so Phase 5 can build feed ordering on top.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = RankingRepository(db)
        self.engine = RankingEngine()

    # ── scoring ────────────────────────────────────────────

    def _score(
        self,
        content: dict,
        engagement: dict,
        interests: list[tuple[str, str, float]],
    ) -> tuple[float, RankingBreakdown]:
        return self.engine.score_item(content, engagement, interests)

    def preview(
        self,
        user_id: UUID | None,
        content_type: str | None,
        limit: int,
        offset: int,
    ) -> RankingPreviewResponse:
        """Score a candidate pool and return items sorted by rank desc."""
        interests: list[tuple[str, str, float]] = []
        if user_id is not None:
            interests = self.repo.get_user_interests(user_id)

        total, rows = self.repo.list_candidate_profiles(content_type, limit, offset)
        if not rows:
            return RankingPreviewResponse(
                user_id=user_id,
                personalized=bool(interests),
                total=0,
                items=[],
            )

        engagement = self.repo.get_engagement([r.content_id for r in rows])
        items: list[RankedItem] = []
        for row in rows:
            features = profile_features(row)
            rank, breakdown = self._score(
                features,
                engagement.get(row.content_id, {}),
                interests,
            )
            items.append(
                RankedItem(
                    content_type=row.content_type,
                    content_id=row.content_id,
                    rank_score=rank,
                    breakdown=breakdown,
                )
            )
        items.sort(key=lambda i: i.rank_score, reverse=True)
        return RankingPreviewResponse(
            user_id=user_id,
            personalized=bool(interests),
            total=total,
            items=items,
        )

    def explain(
        self,
        content_type: str,
        content_id: UUID,
        user_id: UUID | None,
    ) -> RankingExplainResponse | None:
        """Score one content item and return its full component breakdown."""
        row = self.repo.get_profile(content_type, content_id)
        if row is None:
            return None
        interests: list[tuple[str, str, float]] = []
        if user_id is not None:
            interests = self.repo.get_user_interests(user_id)

        engagement = self.repo.get_engagement([content_id]).get(content_id, {})
        rank, breakdown = self._score(profile_features(row), engagement, interests)
        return RankingExplainResponse(
            content_type=row.content_type,
            content_id=row.content_id,
            rank_score=rank,
            breakdown=breakdown,
        )