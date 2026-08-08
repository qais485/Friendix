import json
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models import (
    ContentProfile,
    Hashtag,
    LiveStream,
    Media,
    Post,
    PostHashtag,
    Reel,
    Story,
    Video,
    VideoCategory,
)

# Per content type: (model, columns) used to extract a source profile.
_SOURCE_MODELS = {
    "video": (Video, [Video.id, Video.user_id, Video.category_id, Video.media_id, Video.title, Video.duration, Video.created_at]),
    "post": (Post, [Post.id, Post.user_id, Post.content, Post.video_url, Post.audio_url, Post.gif_url, Post.image_urls, Post.document_url, Post.created_at]),
    "reel": (Reel, [Reel.id, Reel.user_id, Reel.media_id, Reel.caption, Reel.duration, Reel.created_at]),
    "story": (Story, [Story.id, Story.user_id, Story.media_id, Story.content, Story.story_type, Story.created_at]),
    "live": (LiveStream, [LiveStream.id, LiveStream.user_id, LiveStream.title, LiveStream.status, LiveStream.started_at, LiveStream.replay_duration, LiveStream.created_at]),
}


class ContentProfileRepository:
    """Persistence + source extraction for content profiles."""

    def __init__(self, db: Session):
        self.db = db

    # ── source extraction ─────────────────────────────────

    def get_sources(self, content_type: str, content_ids: list[UUID]) -> dict[UUID, dict]:
        if not content_ids:
            return {}
        model, columns = _SOURCE_MODELS[content_type]
        rows = self.db.execute(select(*columns).where(model.id.in_(content_ids))).mappings().all()
        return {r["id"]: dict(r) for r in rows}

    def get_media_info(self, media_ids: list[UUID]) -> dict[UUID, dict]:
        if not media_ids:
            return {}
        rows = self.db.execute(
            select(Media.id, Media.media_type, Media.mime_type, Media.duration)
            .where(Media.id.in_(media_ids))
        ).mappings().all()
        return {r["id"]: dict(r) for r in rows}

    def get_post_tags(self, post_ids: list[UUID]) -> dict[UUID, list[str]]:
        if not post_ids:
            return {}
        rows = self.db.execute(
            select(PostHashtag.post_id, Hashtag.name)
            .join(Hashtag, Hashtag.id == PostHashtag.hashtag_id)
            .where(PostHashtag.post_id.in_(post_ids))
        ).all()
        result: dict[UUID, list[str]] = {}
        for post_id, name in rows:
            result.setdefault(post_id, []).append(name)
        return result

    def get_video_categories(self, video_ids: list[UUID]) -> dict[UUID, tuple[UUID, str]]:
        if not video_ids:
            return {}
        rows = self.db.execute(
            select(Video.id, Video.category_id, VideoCategory.name)
            .join(VideoCategory, Video.category_id == VideoCategory.id)
            .where(Video.id.in_(video_ids))
        ).all()
        return {video_id: (category_id, name) for video_id, category_id, name in rows}

    def list_recent_ids(self, content_type: str, limit: int) -> list[UUID]:
        model, _ = _SOURCE_MODELS[content_type]
        rows = self.db.execute(
            select(model.id).order_by(model.created_at.desc()).limit(limit)
        ).scalars().all()
        return list(rows)

    def count_source_rows(self, content_type: str) -> int:
        model, _ = _SOURCE_MODELS[content_type]
        return self.db.execute(select(func.count(model.id))).scalar() or 0

    def list_content_ids_paginated(self, content_type: str, offset: int, limit: int) -> list[UUID]:
        model, _ = _SOURCE_MODELS[content_type]
        rows = self.db.execute(
            select(model.id)
            .order_by(model.created_at.desc(), model.id.desc())
            .offset(offset)
            .limit(limit)
        ).scalars().all()
        return list(rows)

    def prune_stale(self, content_type: str, batch_size: int = 500) -> int:
        """Delete profiles whose source content row no longer exists."""
        model, _ = _SOURCE_MODELS[content_type]
        profile_ids = self.db.execute(
            select(ContentProfile.content_id).where(ContentProfile.content_type == content_type)
        ).scalars().all()
        removed = 0
        for i in range(0, len(profile_ids), batch_size):
            chunk = profile_ids[i:i + batch_size]
            existing = set(self.db.execute(select(model.id).where(model.id.in_(chunk))).scalars().all())
            missing = [cid for cid in chunk if cid not in existing]
            if missing:
                self.db.execute(
                    delete(ContentProfile).where(
                        ContentProfile.content_type == content_type,
                        ContentProfile.content_id.in_(missing),
                    )
                )
                removed += len(missing)
        return removed

    # ── persistence ───────────────────────────────────────

    def upsert_profiles(self, profiles: list[dict]) -> int:
        if not profiles:
            return 0
        rows = [p.copy() for p in profiles]
        for r in rows:
            r["tags_json"] = json.dumps(r.get("tags") or [])
            r["topics_json"] = json.dumps(r.get("topics") or [])
            r.pop("tags", None)
            r.pop("topics", None)

        stmt = pg_insert(ContentProfile).values(rows)
        exclude = {c.name for c in ContentProfile.__table__.columns}
        exclude -= {"id", "content_type", "content_id", "version", "created_at", "updated_at"}
        set_ = {col: getattr(stmt.excluded, col) for col in exclude}
        set_["version"] = ContentProfile.version + 1
        stmt = stmt.on_conflict_do_update(
            index_elements=[ContentProfile.content_type, ContentProfile.content_id],
            set_=set_,
        )
        self.db.execute(stmt)
        return len(profiles)

    def get_profile(self, content_type: str, content_id: UUID) -> ContentProfile | None:
        return self.db.execute(
            select(ContentProfile).where(
                ContentProfile.content_type == content_type,
                ContentProfile.content_id == content_id,
            )
        ).scalar_one_or_none()

    def list_profiles(self, content_type: str | None, limit: int, offset: int, sort_by: str | None = None) -> tuple[int, list[ContentProfile]]:
        base = select(func.count(ContentProfile.id))
        if content_type:
            base = base.where(ContentProfile.content_type == content_type)
        total = self.db.execute(base).scalar() or 0

        sort_column = {
            "popularity": ContentProfile.popularity_score,
            "quality": ContentProfile.quality_score,
            "freshness": ContentProfile.freshness_score,
        }.get(sort_by)
        stmt = select(ContentProfile).order_by(
            sort_column.desc() if sort_column is not None else ContentProfile.published_at.desc().nullslast(),
            ContentProfile.id.desc(),
        )
        if content_type:
            stmt = stmt.where(ContentProfile.content_type == content_type)
        stmt = stmt.offset(offset).limit(limit)
        return total, list(self.db.execute(stmt).scalars().all())

    def update_profile_fields(self, content_type: str, content_id: UUID, fields: dict) -> ContentProfile | None:
        profile = self.get_profile(content_type, content_id)
        if profile is None:
            return None
        for key, value in fields.items():
            if value is not None:
                setattr(profile, key, value)
        profile.version = (profile.version or 1) + 1
        return profile

    def delete_content_profile(self, content_type: str, content_id: UUID) -> None:
        self.db.execute(
            delete(ContentProfile).where(
                ContentProfile.content_type == content_type,
                ContentProfile.content_id == content_id,
            )
        )