"""Event-tracking security / validation tests (Task 5)."""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import select

from app.core.rate_limiter import SlidingWindowRateLimiter
from app.core.tracking_config import TrackingConfig
from app.models import ContentEvent
from app.schemas.event_tracking import EventTrackItem
from app.services.event_tracking_service import EventTrackingService


def _svc(db, **cfg_overrides):
    svc = EventTrackingService(db)
    svc.cfg = TrackingConfig(**cfg_overrides)
    svc.limiter = SlidingWindowRateLimiter()
    return svc


def _item(post, event_type="like", **kwargs):
    defaults = dict(
        client_event_id=str(uuid4()),
        content_type="post",
        content_id=post.id,
        creator_id=post.user_id,
        event_type=event_type,
        occurred_at=datetime.now(timezone.utc),
    )
    defaults.update(kwargs)
    return EventTrackItem(**defaults)


def test_valid_batch_is_received(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    res = svc.track(post.user_id, [_item(post), _item(post, "view_start")])
    assert res == {"received": 2, "duplicates": 0, "invalid": 0}


def test_ghost_content_is_invalid(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    item = _item(post)
    item.content_id = uuid4()
    res = svc.track(post.user_id, [item])
    assert res["received"] == 0 and res["invalid"] == 1


def test_spoofed_creator_is_corrected(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    item = _item(post, creator_id=uuid4())
    res = svc.track(post.user_id, [item])
    assert res["received"] == 1
    row = db.execute(
        select(ContentEvent.creator_id)
        .where(ContentEvent.content_id == post.id)
        .order_by(ContentEvent.created_at.desc())
        .limit(1)
    ).scalar()
    assert row == post.user_id


def test_absurd_watch_time_is_invalid(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    item = _item(post, "watch_time", value=5000.0, position_seconds=10.0)
    res = svc.track(post.user_id, [item])
    assert res["received"] == 0 and res["invalid"] == 1


def test_future_timestamp_is_invalid(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    item = _item(post, occurred_at=datetime.now(timezone.utc) + timedelta(hours=2))
    res = svc.track(post.user_id, [item])
    assert res["received"] == 0 and res["invalid"] == 1


def test_bad_percentage_is_invalid(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    item = _item(post, "view_percentage", value=250.0)
    res = svc.track(post.user_id, [item])
    assert res["received"] == 0 and res["invalid"] == 1


def test_duplicate_client_event_id_deduped(db, post_factory):
    post = post_factory()
    svc = _svc(db)
    dup = str(uuid4())
    a = _item(post, client_event_id=dup)
    b = _item(post, client_event_id=dup)
    res = svc.track(post.user_id, [a, b])
    assert res["received"] == 1 and res["duplicates"] == 1


def test_user_rate_limit_rejects_over_limit(db, post_factory):
    post = post_factory()
    svc = _svc(db, USER_RATE_LIMIT=3, USER_RATE_WINDOW_SECONDS=60)
    items = [_item(post) for _ in range(3)]
    res = svc.track(post.user_id, items)
    assert res["received"] == 3
    res = svc.track(post.user_id, [_item(post)])
    assert res["received"] == 0 and res["invalid"] == 1


def test_ip_rate_limit_rejects_over_limit(db, post_factory):
    post = post_factory()
    svc = _svc(db, IP_RATE_LIMIT=2, IP_RATE_WINDOW_SECONDS=60)
    res = svc.track(post.user_id, [_item(post), _item(post)], ip="10.0.0.1")
    assert res["received"] == 2
    res = svc.track(post.user_id, [_item(post)], ip="10.0.0.1")
    assert res["received"] == 0 and res["invalid"] == 1


def test_session_view_start_cap(db, post_factory):
    post = post_factory()
    svc = _svc(db, MAX_VIEW_STARTS_PER_SESSION=2)
    sid = uuid4()
    items = [_item(post, "view_start", view_session_id=sid) for _ in range(4)]
    res = svc.track(post.user_id, items)
    assert res["received"] == 2 and res["invalid"] == 2
