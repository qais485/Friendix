"""System status + diagnostics endpoints (admin-gated).

Exposes the learning-loop worker telemetry, config summary, database latency
and table sizes so operators can answer "is the pipeline healthy?" without
SSH access. All endpoints require admin.
"""

import platform
import sys
import time
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.core.cache import get_application_cache
from app.core.learning_config import get_learning_config
from app.core.permissions import is_admin
from app.core.security import get_current_user_id
from app.database.base import get_db
from app.learning_loop_worker import get_learning_loop_worker
from app.models import ContentEvent, ContentProfile, LearningLoopState, UserInterest, ViewSession

router = APIRouter(tags=["System"])


def _require_admin(db: Session, user_id: UUID) -> None:
    if not is_admin(db, user_id):
        raise HTTPException(status_code=403, detail="Admin access required")


def _count(db: Session, model) -> int:
    return db.execute(select(func.count(model.id))).scalar() or 0


@router.get("/system/status")
def system_status(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Learning-loop worker health + pipeline config summary."""
    _require_admin(db, user_id)

    worker = get_learning_loop_worker()
    state = db.execute(select(LearningLoopState).limit(1)).scalar_one_or_none()

    config = get_learning_config()
    return {
        "worker": worker.status(),
        "learning_loop_config": {
            "enabled": config.ENABLED,
            "run_interval_seconds": config.RUN_INTERVAL_SECONDS,
        },
        "state": (
            {
                "interests_last_run_at": state.interests_last_run_at,
                "interests_total_events": state.interests_total_events,
                "interests_total_signals": state.interests_total_signals,
                "interests_version": state.interests_version,
                "metrics_last_run_at": state.metrics_last_run_at,
                "metrics_total_events": state.metrics_total_events,
                "metrics_profiles_updated": state.metrics_profiles_updated,
                "decay_last_run_at": state.decay_last_run_at,
                "decay_total_rows": state.decay_total_rows,
                "decay_removed": state.decay_removed,
            }
            if state
            else None
        ),
    }


@router.get("/system/diagnostics")
def system_diagnostics(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Runtime + data-plane diagnostics (version, DB latency, table sizes)."""
    _require_admin(db, user_id)

    started = time.perf_counter()
    db.execute(text("SELECT 1"))
    db_latency_ms = round((time.perf_counter() - started) * 1000, 2)

    return {
        "runtime": {
            "python": sys.version.split()[0],
            "platform": platform.platform(),
        },
        "database": {
            "latency_ms": db_latency_ms,
            "content_profiles": _count(db, ContentProfile),
            "content_events": _count(db, ContentEvent),
            "view_sessions": _count(db, ViewSession),
            "user_interests": _count(db, UserInterest),
        },
        "cache_backend": type(get_application_cache()).__name__,
    }
