"""Response + cursor helpers for the Phase 5 Feed Generator."""

import base64
import json
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.rules import RecommendedItem


class FeedGeneratorResponse(BaseModel):
    """The final personalized feed for one page.

    ``total`` is the size of the underlying candidate pool; ``returned`` is the
    number of items on this page; ``next_cursor`` is an opaque token to fetch
    the following page (or null when there is none).
    """

    user_id: Optional[UUID] = None
    personalized: bool = False
    total: int = 0
    returned: int = 0
    items: list[RecommendedItem] = Field(default_factory=list)
    next_cursor: Optional[str] = None
    has_more: bool = False


def encode_cursor(offset: int) -> str:
    """Encode an absolute feed offset into an opaque, url-safe cursor."""
    raw = json.dumps({"o": offset}, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_cursor(cursor: Optional[str]) -> Optional[int]:
    """Decode a cursor back into an absolute offset, or None if invalid."""
    if not cursor:
        return None
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        raw = base64.urlsafe_b64decode(padded.encode("ascii"))
        value = json.loads(raw.decode("utf-8"))
        offset = int(value["o"])
        return offset if offset >= 0 else None
    except (ValueError, KeyError, UnicodeDecodeError):
        return None