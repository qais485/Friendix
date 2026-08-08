"""For-you feed generator tests (Task 3 / 6)."""

from app.services.feed_generator import FeedGenerator


def test_for_you_posts_batch_hydration(db, user_id, post_factory):
    post_factory(content="feed hydration one")
    post_factory(content="feed hydration two")
    generator = FeedGenerator(db)
    feed = generator.generate(user_id, "post", None, 10)
    if not feed.items:
        return
    from app.services.feed_service import FeedService

    service = FeedService(db)
    ids = [i.content_id for i in feed.items]
    by_id = {p.id: p for p in service.feed_repo.get_posts_by_ids(ids)}
    assert len(by_id) == len(ids), "batch hydration dropped ranked items"


def test_pagination_advances(db, user_id, post_factory):
    for i in range(4):
        post_factory(content=f"paginate post number {i}")
    generator = FeedGenerator(db)
    page1 = generator.generate(user_id, "post", None, 3)
    assert len(page1.items) == 3
    assert page1.has_more is True and page1.next_cursor is not None
    page2 = generator.generate(user_id, "post", page1.next_cursor, 3)
    first_page_ids = {i.content_id for i in page1.items}
    second_page_ids = {i.content_id for i in page2.items}
    assert first_page_ids.isdisjoint(second_page_ids)
