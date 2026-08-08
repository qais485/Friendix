from fastapi import FastAPI, WebSocket, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.learning_config import get_learning_config
from app.core.logging_config import configure_logging
from app.database.base import get_db
from app.api.v1 import api_router
from app.api.v1.messaging_ws import messaging_websocket
from app.learning_loop_worker import LearningLoopWorker, get_learning_loop_worker
import os
import time

settings = get_settings()
configure_logging()
_STARTED_AT = time.monotonic()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

_learning_worker = get_learning_loop_worker()


@app.on_event("startup")
def _start_learning_loop():
    if get_learning_config().ENABLED:
        _learning_worker.start()


@app.on_event("shutdown")
def _stop_learning_loop():
    _learning_worker.stop()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.websocket("/ws/messaging")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    await messaging_websocket(websocket, token)


@app.get("/health")
def health_check():
    """Liveness probe: the process is up and serving."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": round(time.monotonic() - _STARTED_AT, 1),
        "learning_loop_enabled": get_learning_config().ENABLED,
    }


@app.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    """Readiness probe: dependencies (database) are reachable."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - surface failure to the orchestrator
        raise HTTPException(status_code=503, detail=f"Database unreachable: {exc}")
    return {"status": "ready", "database": "reachable"}
