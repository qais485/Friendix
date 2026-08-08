"""Structured logging setup.

Call ``configure_logging()`` once at process start (app / worker). When
``FRIENDIX_LOG_JSON=true`` records are emitted as single-line JSON for log
shippers; otherwise a human-friendly aligned format is used. Extra structured
fields can be attached to a record by setting ``record.ctx_<name>`` before
logging (e.g. ``record.ctx_content_id = str(pid)``).
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone

_LOG_FORMAT = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        for key, value in record.__dict__.items():
            if key.startswith("ctx_") and value is not None:
                payload[key[4:]] = value
        return json.dumps(payload, default=str)


def _json_enabled() -> bool:
    return os.getenv("FRIENDIX_LOG_JSON", "").strip().lower() in ("1", "true", "yes", "on")


def configure_logging(level: int = logging.INFO) -> None:
    """Install a single structured handler on the root logger."""
    handler = logging.StreamHandler(sys.stdout)
    if _json_enabled():
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter(_LOG_FORMAT))
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level)
