import json
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.metrics_config import get_metrics_config
from app.repositories.content_profile_repository import ContentProfileRepository
from app.schemas.content_profile import (
    ContentProfileListResponse,
    ContentProfileResponse,
    ContentProfileUpdate,
)
from app.services.content_metrics_service import compute_freshness, compute_quality
from app.utils.text_features import detect_language, topic_tokens

# Known story content types map directly onto a media type.
_STORY_TYPES = {"media", "text", "music"}


class ContentProfileService:
    """Builds and maintains the machine-readable profile of each content item.

    Profiles are derived from the content's own row plus its media, category
    and hashtags. Topics are normalized word tokens of the available text;
    language is a heuristic script-based guess (overridable via the API).
    Recommendation logic is intentionally not part of this phase.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ContentProfileRepository(db)
        self.cfg = get_metrics_config()

    # ── building ───────────────────────────────────────────

    def build(self, content_type: str, content_id: UUID) -> ContentProfileResponse | None:
        """Build (or refresh) the profile for a single content item."""
        built = self.build_many(content_type, [content_id])
        if not built:
            return None
        return self.get_profile(content_type, content_id)

    def build_recent(self, content_type: str, limit: int = 200) -> int:
        """Rebuild profiles for the most recently created content of a type."""
        ids = self.repo.list_recent_ids(content_type, limit)
        return self.build_many(content_type, ids)

    def build_many(self, content_type: str, content_ids: list[UUID]) -> int:
        if not content_ids:
            return 0
        sources = self.repo.get_sources(content_type, content_ids)
        if not sources:
            return 0

        video_ids = [i for i in content_ids if content_type == "video"]
        post_ids = [i for i in content_ids if content_type == "post"]
        media_ids = [s.get("media_id") for s in sources.values() if s.get("media_id")]

        categories = self.repo.get_video_categories(video_ids) if video_ids else {}
        tags = self.repo.get_post_tags(post_ids) if post_ids else {}
        media = self.repo.get_media_info(media_ids) if media_ids else {}

        rows = [
            r for cid, src in sources.items()
            if (r := self._build_one(content_type, cid, src, categories, tags, media))
        ]
        built = self.repo.upsert_profiles(rows)
        self.db.commit()
        return built

    def _build_one(self, content_type: str, content_id: UUID, src: dict, categories, tags, media) -> dict | None:
        now = datetime.now(timezone.utc)
        media_info = media.get(src.get("media_id")) if src.get("media_id") else None

        creator_id = src.get("user_id")
        category_id = category_name = None
        media_type = mime_type = duration = None
        published_at = src.get("created_at")
        title = None
        text_sources: list[str] = []

        if content_type == "video":
            title = src.get("title")
            cat = categories.get(content_id)
            if cat:
                category_id, category_name = cat
            media_type = (media_info or {}).get("media_type") or "video"
            mime_type = (media_info or {}).get("mime_type")
            duration = src.get("duration") or (media_info or {}).get("duration")
            text_sources = [category_name or "", title or ""]

        elif content_type == "post":
            title = (src.get("content") or "")[:120] or None
            media_type = _post_media_type(src)
            tag_names = tags.get(content_id, [])
            text_sources = [src.get("content") or ""] + tag_names

        elif content_type == "reel":
            title = src.get("caption")
            media_type = (media_info or {}).get("media_type") or "video"
            mime_type = (media_info or {}).get("mime_type")
            duration = src.get("duration") or (media_info or {}).get("duration")
            text_sources = [src.get("caption") or ""]

        elif content_type == "story":
            title = None
            media_type = src.get("story_type") if src.get("story_type") in _STORY_TYPES else (media_info or {}).get("media_type") or "story"
            mime_type = (media_info or {}).get("mime_type")
            duration = (media_info or {}).get("duration")
            text_sources = [src.get("content") or ""]

        elif content_type == "live":
            title = src.get("title")
            media_type = "live"
            duration = src.get("replay_duration")
            published_at = src.get("started_at") or src.get("created_at")
            text_sources = [title or ""]

        combined = " ".join(s for s in text_sources if s)
        tags = tags.get(content_id, []) if content_type == "post" else []
        topics = topic_tokens(combined)
        return {
            "content_type": content_type,
            "content_id": content_id,
            "creator_id": creator_id,
            "title": title,
            "category_id": category_id,
            "category_name": category_name,
            "tags": tags,
            "topics": topics,
            "language": detect_language(combined),
            "media_type": media_type,
            "mime_type": mime_type,
            "duration_seconds": duration,
            "published_at": published_at,
            "source_updated_at": now,
            "quality_score": compute_quality(
                self.cfg.QUALITY_WEIGHTS,
                title=title,
                media_type=media_type,
                category_name=category_name,
                tags=tags,
                topics=topics,
                cfg=self.cfg,
            ),
            "freshness_score": compute_freshness(self.cfg, published_at),
            "version": 1,
        }

    # ── reads ──────────────────────────────────────────────

    def get_profile(self, content_type: str, content_id: UUID) -> ContentProfileResponse | None:
        row = self.repo.get_profile(content_type, content_id)
        return self._to_response(row) if row else None

    def update_profile(self, content_type: str, content_id: UUID, data: ContentProfileUpdate) -> ContentProfileResponse | None:
        fields = data.model_dump(exclude_unset=True)
        if "tags" in fields:
            fields["tags_json"] = json.dumps(fields.pop("tags") or [])
        if "topics" in fields:
            fields["topics_json"] = json.dumps(fields.pop("topics") or [])
        row = self.repo.update_profile_fields(content_type, content_id, fields)
        if row is None:
            return None
        # Recompute attribute-based scores after a manual edit.
        tags = json.loads(row.tags_json) if row.tags_json else []
        topics = json.loads(row.topics_json) if row.topics_json else []
        row.quality_score = compute_quality(
            self.cfg.QUALITY_WEIGHTS,
            title=row.title,
            media_type=row.media_type,
            category_name=row.category_name,
            tags=tags,
            topics=topics,
            cfg=self.cfg,
        )
        row.freshness_score = compute_freshness(self.cfg, row.published_at)
        self.db.commit()
        return self._to_response(row)

    def list_profiles(self, content_type: str | None, limit: int, offset: int, sort_by: str | None = None) -> ContentProfileListResponse:
        total, rows = self.repo.list_profiles(content_type, limit, offset, sort_by)
        return ContentProfileListResponse(
            total=total,
            profiles=[self._to_response(r) for r in rows],
        )

    # ── helpers ────────────────────────────────────────────

    def _to_response(self, row) -> ContentProfileResponse:
        return ContentProfileResponse(
            content_type=row.content_type,
            content_id=row.content_id,
            creator_id=row.creator_id,
            title=row.title,
            category_id=row.category_id,
            category_name=row.category_name,
            tags=json.loads(row.tags_json) if row.tags_json else [],
            topics=json.loads(row.topics_json) if row.topics_json else [],
            language=row.language,
            media_type=row.media_type,
            mime_type=row.mime_type,
            duration_seconds=row.duration_seconds,
            published_at=row.published_at,
            popularity_score=row.popularity_score or 0.0,
            quality_score=row.quality_score or 0.0,
            freshness_score=row.freshness_score or 0.0,
            version=row.version,
        )


def _post_media_type(src: dict) -> str:
    if src.get("video_url"):
        return "video"
    if src.get("audio_url"):
        return "audio"
    if src.get("gif_url"):
        return "gif"
    if src.get("image_urls"):
        return "image"
    if src.get("document_url"):
        return "document"
    return "text"