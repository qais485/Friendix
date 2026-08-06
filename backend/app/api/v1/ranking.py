from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id, get_optional_user_id
from app.database.base import get_db
from app.schemas.content_profile import CONTENT_PROFILE_TYPES
from app.schemas.ranking import (
    RankingExplainResponse,
    RankingPreviewRequest,
    RankingPreviewResponse,
)
from app.services.ranking_service import RankingService

router = APIRouter(tags=["Ranking"])


def get_ranking_service(db: Session = Depends(get_db)) -> RankingService:
    return RankingService(db)


def _check_type(content_type: str) -> None:
    if content_type not in CONTENT_PROFILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"content_type must be one of {CONTENT_PROFILE_TYPES}",
        )


@router.post("/preview", response_model=RankingPreviewResponse)
def preview_ranking(
    body: RankingPreviewRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: RankingService = Depends(get_ranking_service),
):
    """Score a pool of content profiles and return them sorted by rank.

    Personalized to the authenticated user by default; admin can preview for a
    different ``user_id`` or pass ``user_id: null`` for a global ranking.
    """
    if body.content_type is not None:
        _check_type(body.content_type)
    target = body.user_id or user_id
    if body.user_id is not None and body.user_id != user_id:
        db = service.db
        if not is_admin(db, user_id):
            raise HTTPException(status_code=403, detail="Admin access required to preview another user's ranking")
    return service.preview(target, body.content_type, body.limit, body.offset)


@router.get("/explain/{content_type}/{content_id}", response_model=RankingExplainResponse)
def explain_ranking(
    content_type: str,
    content_id: UUID,
    viewer_id: UUID | None = Depends(get_optional_user_id),
    service: RankingService = Depends(get_ranking_service),
):
    """Return the rank score and per-signal breakdown for a single item."""
    _check_type(content_type)
    result = service.explain(content_type, content_id, viewer_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Content profile not found")
    return result
