"""Shared fixtures for the backend test suite.

The suite runs against the configured (live) database. Each test creates its
own data and cleans up after itself, and the process-wide cache is cleared
between tests so cached aggregates never leak across cases.
"""

import pytest
from sqlalchemy import delete, text

from app.core.cache import get_application_cache
from app.database.base import SessionLocal
from app.models import ContentEvent, ViewSession
from app.schemas.feed import PostCreate
from app.services.feed_service import FeedService


@pytest.fixture(scope="session")
def warm_db():
    """Warm the (potentially cold-starting) database connection once per run."""
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    finally:
        db.close()
    return True


@pytest.fixture()
def db(warm_db):
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def clear_cache():
    get_application_cache().clear()
    yield


@pytest.fixture()
def user_id(db):
    uid = db.execute(text("SELECT id FROM users ORDER BY created_at LIMIT 1")).scalar_one_or_none()
    if uid is None:
        pytest.skip("No users present in the database")
    return uid


@pytest.fixture()
def admin_id(db):
    uid = db.execute(text("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).scalar_one_or_none()
    if uid is None:
        pytest.skip("No admin users present in the database")
    return uid


class Cleanup:
    """Tracks test-created rows and removes them after the test."""

    def __init__(self, db, owner_id):
        self.db = db
        self.owner_id = owner_id
        self.post_ids = []

    def add_post(self, post_id):
        self.post_ids.append(post_id)

    def run(self):
        db = self.db
        try:
            for pid in self.post_ids:
                db.execute(delete(ContentEvent).where(ContentEvent.content_id == pid))
                db.execute(delete(ViewSession).where(ViewSession.content_id == pid))
            db.commit()
            for pid in self.post_ids:
                try:
                    FeedService(db).delete_post(self.owner_id, pid)
                except Exception:
                    db.rollback()
        finally:
            db.commit()


@pytest.fixture()
def cleanup(db, user_id):
    handle = Cleanup(db, user_id)
    try:
        yield handle
    finally:
        handle.run()


@pytest.fixture()
def post_factory(db, user_id, cleanup):
    def _make(content="automated test post", post_type="text", **kwargs):
        post = FeedService(db).create_post(user_id, PostCreate(content=content, post_type=post_type, **kwargs))
        cleanup.add_post(post.id)
        return post

    return _make
