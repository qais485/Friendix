"""Background worker that continuously runs the Phase 6 Learning Loop.

Runs ``LearningLoopService.run_cycle`` on a bounded cadence in its own DB
session. It is intended to run either (a) started as a daemon thread from
``app.main`` when ``FRIENDIX_LEARNING_ENABLED=true``, or (b) as a standalone
process for scale-out (``python -m app.learning_loop_worker``).
"""

import logging
import sys
import threading
import time
from contextlib import AbstractContextManager
from datetime import datetime, timezone

from app.core.learning_config import get_learning_config
from app.database.base import SessionLocal
from app.services.learning_loop_service import LearningLoopService

logger = logging.getLogger("learning_loop")


class LearningLoopWorker(AbstractContextManager):
    """A stoppable background thread that repeatedly runs learning cycles."""

    def __init__(self, interval_seconds: float | None = None):
        self.config = get_learning_config()
        self.interval = interval_seconds or self.config.RUN_INTERVAL_SECONDS
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._cycles_run = 0
        self._last_run_at: float | None = None
        self._last_result: dict | None = None
        self._last_error: str | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop = threading.Event()
        self._thread = threading.Thread(
            target=self._run_loop, name="learning-loop", daemon=True
        )
        self._thread.start()
        logger.info("Learning loop worker started (interval=%.2fs)", self.interval)

    def stop(self) -> None:
        if self._thread:
            self._stop.set()
            self._thread.join(timeout=self.interval + 5)
            logger.info("Learning loop worker stopped")

    def _run_loop(self) -> None:
        while not self._stop.is_set():
            try:
                self.run_once()
                self._last_error = None
            except Exception:  # noqa: BLE001 - keep the loop alive on errors
                self._last_error = repr(sys.exc_info()[1]) if sys.exc_info()[1] else "unknown error"
                logger.exception("Learning loop cycle failed")
            self._stop.wait(self.interval)

    def run_once(self) -> dict:
        """Run a single cycle against a fresh session."""
        db = SessionLocal()
        try:
            result = LearningLoopService(db).run_cycle()
            self._cycles_run += 1
            self._last_run_at = time.monotonic()
            self._last_result = result
            return result
        finally:
            db.close()

    def status(self) -> dict:
        """Snapshot for the ops dashboard (worker thread + last cycle telemetry)."""
        return {
            "enabled": self.config.ENABLED,
            "running": self._thread is not None and self._thread.is_alive(),
            "interval_seconds": self.interval,
            "cycles_run": self._cycles_run,
            "last_run_at": (
                datetime.fromtimestamp(self._last_run_at, tz=timezone.utc).isoformat()
                if self._last_run_at
                else None
            ),
            "last_error": self._last_error,
            "last_cycle": self._last_result,
        }

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.stop()


_shared_worker: "LearningLoopWorker | None" = None


def get_learning_loop_worker() -> "LearningLoopWorker":
    """Return the process-wide worker instance (shared by app + ops endpoints)."""
    global _shared_worker
    if _shared_worker is None:
        _shared_worker = LearningLoopWorker()
    return _shared_worker


if __name__ == "__main__":
    from app.core.logging_config import configure_logging

    configure_logging()
    worker = LearningLoopWorker()
    worker.start()
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        worker.stop()