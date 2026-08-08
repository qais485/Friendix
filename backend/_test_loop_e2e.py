"""End-to-end functional check of the activated Learning Loop.

Creates isolated test rows (user, creator, video category, video, events,
stale interests), runs one full cycle, asserts interest/metrics/decay/watermark
behavior, then removes every test row it created.
"""
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import delete, select

from app.database.base import SessionLocal
from app.models import (
    ContentEvent,
    ContentProfile,
    InterestProfile,
    LearningLoopState,
    User,
    UserInterest,
    Video,
    VideoCategory,
)
from app.services.learning_loop_service import LearningLoopService

TAG = str(uuid4())[:8]
now = datetime.now(timezone.utc)

db = SessionLocal()

viewer = None
creator = None
category = None
video = None
events = []

try:
    viewer = User(email=f"__lptest_{TAG}@example.com", google_id=f"google-{TAG}", full_name="Loop E2E Viewer", username=f"__loopviewer_{TAG}")
    creator = User(email=f"__lpcreator_{TAG}@example.com", google_id=f"gcreator-{TAG}", full_name="Loop E2E Creator", username=f"__loopcreator_{TAG}")
    category = VideoCategory(name=f"E2E Cat {TAG}", slug=f"e2e-cat-{TAG}")
    db.add_all([viewer, creator, category])
    db.flush()

    video = Video(user_id=creator.id, category_id=category.id, title=f"E2E Test Video {TAG}", video_url="https://e2e.local/v.mp4", duration=120.0)
    db.add(video)
    db.flush()

    for i, (etype, val) in enumerate([("view_start", None), ("view_percentage", 100.0),
                                       ("watch_time", 120.0), ("completion", None), ("like", None), ("share", None)]):
        events.append(ContentEvent(
            user_id=viewer.id,
            content_type="video",
            content_id=video.id,
            creator_id=creator.id,
            event_type=etype,
            value=val,
            occurred_at=now - timedelta(minutes=1) + timedelta(seconds=i),
        ))
    db.add_all(events)
    db.flush()

    # Stale synthetic interests on the viewer to exercise the decay pass.
    # KEEP: age 8 days (> stale 7d), strength 25 -> decayed but survives.
    db.add(UserInterest(user_id=viewer.id, interest_type="topic", interest_key=f"loopkeep_{TAG}",
                        interest_name="keep", strength=25.0, last_interaction_at=now - timedelta(days=8)))
    # REMOVE: age 120 days, strength 0.4 -> decays below min (0.05) -> pruned.
    db.add(UserInterest(user_id=viewer.id, interest_type="topic", interest_key=f"loopdrop_{TAG}",
                        interest_name="drop", strength=0.4, last_interaction_at=now - timedelta(days=120)))
    db.commit()

    print("== E2E data ready ==")
    print("  viewer:", viewer.id, "creator:", creator.id, "category:", category.id)
    print("  video:", video.id, "events:", len(events))

    result = LearningLoopService(db).run_cycle()
    print("\n== 1) cycle result ==")
    print(" ", result)
    assert result["interests"]["users_processed"] >= 1
    assert result["interests"]["total_events"] >= 1
    assert result["interests"]["total_signals"] >= 1
    assert result["interests"]["total_interests_updated"] >= 1
    assert result["metrics"]["processed_events"] >= 1
    assert result["metrics"]["profiles_updated"] >= 1
    print("  interests + metrics passes OK")

    print("\n== 2) interest profile watermark advanced ==")
    ip = db.execute(select(InterestProfile).where(InterestProfile.user_id == viewer.id)).scalar_one_or_none()
    assert ip is not None and ip.last_occurred_at is not None and ip.last_event_id is not None
    print("  profile:", ip.last_occurred_at, ip.last_event_id, "interests=", ip.total_interests)
    fresh = db.execute(
        select(UserInterest).where(UserInterest.user_id == viewer.id,
                                   UserInterest.last_interaction_at > now - timedelta(days=1))
    ).scalars().all()
    assert len(fresh) >= 3, "expected category + topic (+creator) interests"
    print("  new user_interests:", [(u.interest_type, u.interest_key, u.strength) for u in fresh])

    print("\n== 3) content metrics built profile ==")
    cp = db.execute(select(ContentProfile).where(ContentProfile.content_type == "video", ContentProfile.content_id == video.id)).scalar_one_or_none()
    assert cp is not None and cp.popularity_score > 0
    print("  profile: popularity=", cp.popularity_score, "freshness=", cp.freshness_score, "metrics_updated_at=", cp.metrics_updated_at)

    print("\n== 4) decay pass exercised (round(numeric,int) fix) ==")
    keep = db.execute(select(UserInterest).where(UserInterest.interest_key == f"loopkeep_{TAG}")).one_or_none()
    assert keep is not None, "keep row should survive decay"
    assert keep.last_decayed_at is not None, "keep row must have last_decayed_at stamped"
    print("  keep strength: 25.0 ->", round(keep.strength, 4), "(target < 25), last_decayed_at=", keep.last_decayed_at)
    dropped = db.execute(select(UserInterest).where(UserInterest.interest_key == f"loopdrop_{TAG}")).one_or_none()
    assert dropped is None, "stale row below min strength should be pruned"
    print("  removed (strength 0.4, 120d old): gone")
    assert result["decay"]["rows_decayed"] >= 1 and result["decay"]["rows_removed"] >= 1
    print("  decay counts: decayed=%d removed=%d" % (result["decay"]["rows_decayed"], result["decay"]["rows_removed"]))

    print("\n== 5) LearningLoopState + MetricsState telemetry ==")
    st = db.execute(select(LearningLoopState).where(LearningLoopState.id == 1)).scalar_one()
    print("  interests_total_events/signals =", st.interests_total_events, st.interests_total_signals)
    print("  metrics_total_events =", st.metrics_total_events, "| decay_removed =", st.decay_removed)
    assert st.metrics_total_events >= len(events)
    print("  interest_profiles for viewer:", db.execute(select(InterestProfile).where(InterestProfile.user_id == viewer.id)).scalar_one().total_interests)

    print("\nALL E2E CHECKS PASSED")
finally:
    if video:
        db.execute(delete(ContentProfile).where(ContentProfile.content_id == video.id))
    if viewer:
        db.execute(delete(InterestProfile).where(InterestProfile.user_id == viewer.id))
        db.execute(delete(UserInterest).where(UserInterest.user_id == viewer.id))
    for e in events:
        db.delete(e)  # cascades interest_event_signals
    if video:
        db.delete(video)
    if category:
        db.delete(category)
    for u in (creator, viewer):
        if u:
            db.delete(u)
    db.commit()
    db.close()
    print("cleanup: test rows removed")