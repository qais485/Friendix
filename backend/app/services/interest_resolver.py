"""Enrich content events into interest dimensions.

Given a set of raw ``content_events`` this resolver batch-loads the
category / hashtags / creator for the referenced content and derives a list
of (interest_type, key, name, entity_id) signals per event. Categories come
from the video category, tags from post hashtags, and topics are normalized
word-level tokens derived from both category and tag names.
"""

from collections import defaultdict
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Video, VideoCategory, PostHashtag, Hashtag, User
from app.utils.text_features import topic_tokens


class InterestResolver:
    """Batch content -> interest mapping with minimal queries (no N+1)."""

    def __init__(self, db: Session):
        self.db = db
        self._categories: dict[UUID, tuple[UUID, str]] = {}
        self._tags: dict[UUID, list[str]] = defaultdict(list)
        self._creators: dict[UUID, str] = {}

    def _load_categories(self, content_ids: list[UUID]) -> None:
        if not content_ids:
            return
        rows = self.db.execute(
            select(Video.id, Video.category_id, VideoCategory.name)
            .join(VideoCategory, Video.category_id == VideoCategory.id)
            .where(Video.id.in_(content_ids))
        ).all()
        for video_id, category_id, name in rows:
            self._categories[video_id] = (category_id, name)

    def _load_tags(self, content_ids: list[UUID]) -> None:
        if not content_ids:
            return
        rows = self.db.execute(
            select(PostHashtag.post_id, Hashtag.name)
            .join(Hashtag, Hashtag.id == PostHashtag.hashtag_id)
            .where(PostHashtag.post_id.in_(content_ids))
        ).all()
        for post_id, name in rows:
            self._tags[post_id].append(name)

    def _load_creators(self, creator_ids: list[UUID]) -> None:
        if not creator_ids:
            return
        rows = self.db.execute(
            select(User.id, User.username).where(User.id.in_(creator_ids))
        ).all()
        for user_id, username in rows:
            self._creators[user_id] = username or str(user_id)

    def load(self, events: list[dict]) -> None:
        """Prefetch enrichment data for a batch of event dicts."""
        video_ids = [e["content_id"] for e in events if e["content_type"] == "video"]
        post_ids = [e["content_id"] for e in events if e["content_type"] == "post"]
        creator_ids = [e["creator_id"] for e in events if e["creator_id"] is not None]
        self._load_categories(video_ids)
        self._load_tags(post_ids)
        self._load_creators(creator_ids)

    def resolve(self, event: dict) -> list[tuple[str, str, str | None, UUID | None]]:
        """Return interest signals for a single event dict.

        Each signal is (interest_type, interest_key, interest_name, entity_id).
        Topics are derived from category + tag names.
        """
        signals: list[tuple[str, str, str | None, UUID | None]] = []
        content_id = event["content_id"]
        content_type = event["content_type"]

        creator_id = event.get("creator_id")
        if creator_id is not None:
            name = self._creators.get(creator_id, str(creator_id))
            signals.append(("creator", str(creator_id), name, creator_id))

        topic_sources: list[str] = []

        if content_type == "video":
            resolved = self._categories.get(content_id)
            if resolved:
                category_id, category_name = resolved
                signals.append(("category", str(category_id), category_name, category_id))
                topic_sources.append(category_name)

        if content_type == "post":
            for tag_name in self._tags.get(content_id, []):
                signals.append(("tag", tag_name, tag_name, None))
                topic_sources.append(tag_name)

        for token in topic_tokens(" ".join(topic_sources)):
            signals.append(("topic", token, token, None))

        return signals