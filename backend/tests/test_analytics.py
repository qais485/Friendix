"""Analytics tests (Task 7): CTR, engagement series, creator event analytics."""

from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.event_tracking import EventTrackItem
from app.services.analytics_service import AnalyticsService
from app.services.event_tracking_service import EventTrackingService
from app.services.recommendation_analytics_service import RecommendationAnalyticsService


def _seed_events(db, post):
    now = datetime.now(timezone.utc)
    vsid = uuid4()
    EventTrackingService(db).track(post.user_id, [
        EventTrackItem(client_event_id=str(uuid4()), content_type="post", content_id=post.id,
                       creator_id=post.user_id, event_type="impression", occurred_at=now),
        EventTrackItem(client_event_id=str(uuid4()), content_type="post", content_id=post.id,
                       creator_id=post.user_id, event_type="view_start", view_session_id=vsid, occurred_at=now),
        EventTrackItem(client_event_id=str(uuid4()), content_type="post", content_id=post.id,
                       creator_id=post.user_id, event_type="watch_time", value=10.0,
                       position_seconds=10.0, view_session_id=vsid, occurred_at=now),
        EventTrackItem(client_event_id=str(uuid4()), content_type="post", content_id=post.id,
                       creator_id=post.user_id, event_type="like", occurred_at=now),
        EventTrackItem(client_event_id=str(uuid4()), content_type="post", content_id=post.id,
                       creator_id=post.user_id, event_type="impression", occurred_at=now),
    ])


def test_summary_includes_ctr(db, post_factory):
    post = post_factory()
    _seed_events(db, post)
    summary = RecommendationAnalyticsService(db).summary(30)
    assert summary.impressions >= 2
    assert summary.ctr == round(summary.views / summary.impressions, 4)


def test_engagement_series_has_event_day(db, post_factory):
    post = post_factory()
    _seed_events(db, post)
    series = RecommendationAnalyticsService(db).engagement_series(30)
    assert len(series.points) >= 1
    today = series.points[-1]
    assert today.impressions >= 2 and today.likes >= 1 and today.views >= 1
    assert today.ctr == round(today.views / today.impressions, 4)


def test_content_and_creator_items_carry_ctr(db, post_factory):
    post = post_factory()
    _seed_events(db, post)
    svc = RecommendationAnalyticsService(db)
    top = svc.top_posts(30, limit=10)
    assert all("ctr" in i.model_dump() and "impressions" in i.model_dump() for i in top.items)
    creators = svc.creators(30, limit=10)
    assert all("ctr" in i.model_dump() and "impressions" in i.model_dump() for i in creators.items)


def test_creator_detail_uses_filter(db, post_factory):
    post = post_factory()
    _seed_events(db, post)
    detail = RecommendationAnalyticsService(db).creator_detail(post.user_id, 30, limit=5)
    assert detail is not None
    assert detail.creator_id == post.user_id
    assert len(detail.top_content) >= 1


def test_creator_self_scoped_event_analytics(db, post_factory):
    post = post_factory()
    _seed_events(db, post)
    events = AnalyticsService(db).get_events(post.user_id, 30)
    assert set(["days", "summary", "total_watch_time_seconds", "watch_time_series", "engagement_series", "top_content"]).issubset(events.keys())
    assert events["summary"]["impressions"] >= 2
    assert len(events["top_content"]) >= 1
