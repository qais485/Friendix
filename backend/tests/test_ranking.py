"""Ranking + engagement-cache tests (Tasks 4 & 6)."""

from datetime import datetime, timezone

from sqlalchemy import delete

from app.core.cache import cache_key, content_set_key, get_application_cache
from app.models import UserInterest
from app.repositories.ranking_repository import RankingRepository
from app.services.ranking_service import RankingService


def test_engagement_cache_hit_and_equality(db):
    repo = RankingRepository(db)
    cache = get_application_cache()
    _, rows = repo.list_candidate_profiles(None, 50, 0)
    ids = [r.content_id for r in rows]
    if not ids:
        return
    key = cache_key("engagement", content_set_key(ids))
    assert cache.get(key) is None
    fresh = repo.get_engagement(ids)
    assert cache.get(key) is not None
    assert repo.get_engagement(ids) == fresh


def test_matching_interest_outranks_nonmatching(db, user_id, post_factory, cleanup):
    matching = post_factory(content="space rockets launch astronomy")
    other = post_factory(content="cooking recipes kitchen pasta")
    interest_id = _add_interest(db, user_id, "space")
    try:
        preview = RankingService(db).preview(user_id, "post", 50, 0)
        scores = {i.content_id: i.rank_score for i in preview.items}
        assert matching.id in scores and other.id in scores
        assert scores[matching.id] > scores[other.id], scores
    finally:
        cleanup.db.execute(delete(UserInterest).where(UserInterest.id == interest_id))
        cleanup.db.commit()


def test_feed_order_is_stable(db, user_id):
    from app.services.feed_generator import FeedGenerator

    generator = FeedGenerator(db)
    first = generator.generate(user_id, "post", None, 10)
    second = generator.generate(user_id, "post", None, 10)
    assert [i.content_id for i in first.items] == [i.content_id for i in second.items]


def _add_interest(db, user_id, key):
    ui = UserInterest(
        user_id=user_id,
        interest_type="topic",
        interest_key=key,
        interest_name=key,
        strength=50.0,
        positive_signals=5,
        total_signals=5,
        first_seen_at=datetime.now(timezone.utc),
        last_interaction_at=datetime.now(timezone.utc),
    )
    db.add(ui)
    db.commit()
    return ui.id
