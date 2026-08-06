from uuid import UUID

from sqlalchemy.orm import Session

from app.core.rules_config import get_rules_config
from app.repositories.rules_repository import RulesRepository
from app.schemas.rules import (
    RecommendationResponse,
    RecommendedItem,
    RuleEvent as RuleEventOut,
    RulesInfoResponse,
)
from app.services.recommendation_rules import (
    Candidate,
    RecommendationRulesEngine,
    RuleContext,
)
from app.services.ranking_service import RankingService

# Content kinds that can carry a profile (shared with ranking).
_CONTENT_TYPES = ("video", "post", "reel", "story", "live")


class RecommendationService:
    """Composes the Ranking Engine + Recommendation Rules Engine.

    Order is strict: rank first, then apply business rules, then hand the
    ordered candidates to (future) feed generation. This service produces a
    recommendation list, NOT the feed.
    """

    def __init__(self, db: Session):
        self.db = db
        self.ranking = RankingService(db)
        self.rules_repo = RulesRepository(db)
        self.rules_config = get_rules_config()
        self.engine = RecommendationRulesEngine(self.rules_config)

    def recommend(
        self,
        user_id: UUID | None,
        content_type: str | None,
        limit: int,
        offset: int,
    ) -> RecommendationResponse:
        ranked = self.ranking.preview(user_id, content_type, limit, offset)

        if not ranked.items:
            return RecommendationResponse(
                user_id=user_id,
                personalized=ranked.personalized,
                total=ranked.total,
                kept=0,
                rules_applied=self.engine.active_rule_names,
                items=[],
            )

        # Enrich candidates with content features (creator/category/topics/...).
        keys = [(i.content_type, i.content_id) for i in ranked.items]
        profiles = self.rules_repo.get_profiles(keys)
        content_ids = [i.content_id for i in ranked.items]

        ctx = RuleContext(
            followed_creator_ids=frozenset(
                self.rules_repo.get_followed_creator_ids(user_id)
                if user_id else []
            ),
            recently_viewed=self.rules_repo.get_recently_viewed(
                user_id,
                float((self.rules_config.RULES.get("recently_viewed") or {}).get("window_hours", 72)),
            ) if user_id else {},
            reported_counts=self.rules_repo.get_reported_counts(content_ids, list(_CONTENT_TYPES)),
            fresh_window_hours=float((self.rules_config.RULES.get("freshness_boost") or {}).get("fresh_hours", 6)),
        )

        candidates: list[Candidate] = []
        by_key = {(r.content_type, r.content_id): r for r in ranked.items}
        for key, profile in profiles.items():
            ranked_item = by_key[key]
            candidates.append(
                Candidate(
                    content_type=profile.content_type,
                    content_id=profile.content_id,
                    creator_id=profile.creator_id,
                    category_id=profile.category_id,
                    category_name=profile.category_name,
                    topics=_as_list(profile.topics_json),
                    tags=_as_list(profile.tags_json),
                    published_at=profile.published_at,
                    freshness=profile.freshness_score or 0.0,
                    base_score=ranked_item.rank_score,
                    score=ranked_item.rank_score,
                )
            )

        run = self.engine.apply(candidates, ctx)

        items = [
            _to_recommended_item(c, by_key[(c.content_type, c.content_id)], run.events)
            for c in run.kept
        ]
        return RecommendationResponse(
            user_id=user_id,
            personalized=ranked.personalized,
            total=ranked.total,
            kept=len(items),
            rules_applied=self.engine.active_rule_names,
            items=items,
        )

    def rules_info(self) -> RulesInfoResponse:
        return RulesInfoResponse(
            rules={
                name: self.rules_config.RULES.get(name, {})
                for name in self.engine.active_rule_names
            }
        )


def _as_list(json_text: str | None) -> list[str]:
    import json

    if not json_text:
        return []
    try:
        value = json.loads(json_text)
        return value if isinstance(value, list) else []
    except (ValueError, TypeError):
        return []


def _to_recommended_item(c: Candidate, ranked_item, events: list) -> RecommendedItem:
    rule_events = [
        RuleEventOut(rule=e.rule, action=e.action, reason=e.reason, amount=e.amount)
        for e in events
        if e.content_id == c.content_id
    ]
    return RecommendedItem(
        content_type=c.content_type,
        content_id=c.content_id,
        creator_id=c.creator_id,
        base_rank_score=round(c.base_score, 4),
        final_score=round(c.score, 4),
        followed_creator=c.followed_creator,
        breakdown=ranked_item.breakdown,
        events=rule_events,
    )
