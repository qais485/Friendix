from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.schemas.rules import (
    RecommendationRequest,
    RecommendationResponse,
    RulesInfoResponse,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(tags=["Recommendations"])


def get_recommendation_service(db: Session = Depends(get_db)) -> RecommendationService:
    return RecommendationService(db)


@router.post("", response_model=RecommendationResponse)
def get_recommendations(
    body: RecommendationRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: RecommendationService = Depends(get_recommendation_service),
):
    """Rank candidates then apply the recommendation rules.

    The result is the rule-adjusted, ordered candidate list — the input a feed
    generator would consume. It is not the feed itself.
    """
    if body.content_type is not None:
        if body.content_type not in CONTENT_PROFILE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"content_type must be one of {CONTENT_PROFILE_TYPES}",
            )
    target = body.user_id or user_id
    if body.user_id is not None and body.user_id != user_id:
        db = service.db
        if not is_admin(db, user_id):
            raise HTTPException(status_code=403, detail="Admin access required to preview another user's recommendations")
    return service.recommend(target, body.content_type, body.limit, body.offset)


@router.get("/rules", response_model=RulesInfoResponse)
def get_active_rules(
    user_id: UUID = Depends(get_current_user_id),
    service: RecommendationService = Depends(get_recommendation_service),
):
    """Return the active rules and their parameter sets (ops transparency)."""
    return service.rules_info()
