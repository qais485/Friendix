import math
from collections import defaultdict
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.metrics_config import get_metrics_config
from app.models import ContentProfile
from app.repositories.content_metrics_repository import ContentMetricsRepository


def compute_quality(
    weights: dict[str, float],
    *,
    title: str | None = None,
    media_type: str | None = None,
    category_name: str | None = None,
    tags: list[str] | None = None,
    topics: list[str] | None = None,
    cfg=None,
) -> float:
    """Compute the 0..1 quality score as a weighted blend of attributes."""
    cfg = cfg or get_metrics_config()
    tags = tags or []
    topics = topics or []

    parts = {
        "title": 1.0 if title and len(title) >= cfg.QUALITY_TITLE_MIN_LENGTH else (0.3 if title else 0.0),
        "media": 1.0 if media_type and media_type not in ("text",) else 0.2,
        "category": 1.0 if category_name else 0.0,
        "tags": min(len(tags) / cfg.QUALITY_TAGS_TARGET, 1.0),
        "topics": min(len(topics) / cfg.QUALITY_TOPICS_TARGET, 1.0),
    }
    weights = cfg.QUALITY_WEIGHTS
    total_w = sum(weights.values())
    if total_w <= 0:
        return 0.0
    score = sum(weights.get(k, 0.0) * parts[k] for k in parts) / total_w
    return round(max(0.0, min(score, 1.0)), 4)


def compute_freshness(cfg, published_at) -> float:
    """freshness_score = exp(-age_hours / timescale_hours), 0 if unpublished."""
    if not published_at:
        return 0.0
    age_hours = (
        datetime.now(timezone.utc) - published_at
    ).total_seconds() / 3600.0
    if age_hours < 0:
        return 1.0
    return round(math.exp(-age_hours / cfg.FRESHNESS_TIMESCALE_HOURS), 4)


class ContentMetricsService:
    """Incrementally updates computed metrics on ContentProfile.

    Popularity is maintained via a global single-row watermark over the raw
    event log: each pass consumes events newer than the watermark, applies the
    configured per-event weights, and merges into a decaying popularity score.
    Freshness is bulk-refreshed for all profiles in the same pass.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ContentMetricsRepository(db)
        self.cfg = get_metrics_config()

    def process_recent(self, limit: int = 2000) -> dict:
        state = self.repo.get_or_create_state()
        events = self.repo.get_pending_events(
            state.last_occurred_at, state.last_event_id, limit
        )
        if not events:
            self.db.commit()
            return {"processed_events": 0, "profiles_updated": 0, "freshness_updated": 0}

        weights = self.cfg.POPULARITY_WEIGHTS

        # Group event counts by (content_type, content_id) and capture creator.
        group_counts: dict[tuple[str, UUID], dict[str, int]] = defaultdict(lambda: defaultdict(int))
        creators: dict[tuple[str, UUID], UUID | None] = {}
        content_type_of: dict[tuple[str, UUID], str] = {}
        for event in events:
            key = (event["content_type"], event["content_id"])
            content_type_of[key] = event["content_type"]
            group_counts[key][event["event_type"]] += 1
            creators.setdefault(key, event["creator_id"])

        keys = list(group_counts.keys())
        existing = self.repo.get_profiles(keys)

        now = datetime.now(timezone.utc)
        new_profiles: list[ContentProfile] = []
        profiles_updated = 0
        for key, counts in group_counts.items():
            delta = sum(weights.get(event_type, 0.0) * count for event_type, count in counts.items())
            profile = existing.get(key)
            if profile is None:
                content_type, content_id = key
                profile = ContentProfile(
                    content_type=content_type,
                    content_id=content_id,
                    creator_id=creators.get(key),
                    popularity_score=0.0,
                    metrics_updated_at=None,
                    version=1,
                )
                existing[key] = profile
                new_profiles.append(profile)
            if profile.metrics_updated_at is not None:
                age_days = (now - profile.metrics_updated_at).days or 0.0
                decay = 0.5 ** (age_days / self.cfg.POPULARITY_HALF_LIFE_DAYS)
            else:
                decay = 1.0
            profile.popularity_score = round(profile.popularity_score * decay + delta, 4)
            profile.metrics_updated_at = now
            profiles_updated += 1

        if new_profiles:
            self.db.add_all(new_profiles)

        freshness_updated = self.repo.refresh_freshness(self.cfg.FRESHNESS_TIMESCALE_HOURS)

        last = events[-1]
        self.repo.advance_state(state, last["occurred_at"], last["id"])
        self.db.commit()

        return {
            "processed_events": len(events),
            "profiles_updated": profiles_updated,
            "freshness_updated": freshness_updated,
        }