"""Content-profile lifecycle tests (Task 1)."""

from sqlalchemy import select

from app.models import ContentProfile
from app.services.content_profile_service import ContentProfileService


def _profile(db, content_type, content_id):
    return db.execute(
        select(ContentProfile).where(
            ContentProfile.content_type == content_type,
            ContentProfile.content_id == content_id,
        )
    ).scalar_one_or_none()


def test_create_post_builds_profile(post_factory, db):
    post = post_factory(content="rockets and space")
    row = _profile(db, "post", post.id)
    assert row is not None
    assert row.version == 1
    assert row.creator_id == post.user_id
    assert row.media_type == "text"
    assert "space" in (row.topics_json or "")


def test_update_post_bumps_profile_version(post_factory, db):
    from app.schemas.feed import PostUpdate
    from app.services.feed_service import FeedService

    post = post_factory(content="first version")
    row = _profile(db, "post", post.id)
    assert row.version == 1
    FeedService(db).update_post(post.user_id, post.id, PostUpdate(content="second version"))
    db.refresh(row)
    assert row.version == 2
    assert "second" in (row.topics_json or "")


def test_delete_post_removes_profile(post_factory, db):
    from app.services.feed_service import FeedService

    post = post_factory(content="delete me")
    assert _profile(db, "post", post.id) is not None
    FeedService(db).delete_post(post.user_id, post.id)
    assert _profile(db, "post", post.id) is None


def test_backfill_is_idempotent(db):
    service = ContentProfileService(db)
    first = service.backfill()
    second = service.backfill()
    assert first["built"] == second["built"]
    assert first["pruned"] == second["pruned"]
    for ct, info in first["per_type"].items():
        assert 0 <= info["built"] <= info["total"], (ct, info)
