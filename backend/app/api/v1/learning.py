from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import is_admin
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.learning_loop import (
    LearningCycleResult,
    LearningStatusResponse,
)
from app.services.learning_loop_service import LearningLoopService

router = APIRouter(tags=["Learning Loop"])


def get_learning_service(db: Session = Depends(get_db)) -> LearningLoopService:
    return LearningLoopService(db)


def _require_admin(db: Session, user_id: UUID) -> None:
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/status", response_model=LearningStatusResponse)
def get_loop_status(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Report the learning loop's progress telemetry (read-only)."""
    _require_admin(db, user_id)
    return LearningLoopService(db).get_status()


@router.post("/run", response_model=LearningCycleResult)
def run_loop_cycle(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Admin-only: execute one learning cycle on demand.

    Runs the interest update, content-metrics update, and interest-decay passes
    in a single session, then returns the cycle totals.
    """
    _require_admin(db, user_id)
    return LearningLoopService(db).run_cycle()