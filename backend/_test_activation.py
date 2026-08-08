"""Activation test: worker single-instance guarantee + one full learning cycle."""
import time
import threading
from sqlalchemy import text

from app.database.base import SessionLocal, engine
from app.learning_loop_worker import LearningLoopWorker
from app.services.learning_loop_service import LearningLoopService

print("== 1) Worker single-instance guard ==")
w = LearningLoopWorker(interval_seconds=600)  # long interval to avoid repeated cycles
w.start()
time.sleep(0.3)
thread1 = w._thread
alive1 = w._thread.is_alive()
threads_named = [t.name for t in threading.enumerate()
                 if t.name.startswith("learning-loop")]
print("  thread started:", w._thread, "alive=", alive1)
print("  learning-loop threads in process:", threads_named)

# Call start() again - must be a no-op (no duplicate loop)
w.start()
time.sleep(0.3)
print("  after 2nd start(): same thread?", w._thread is thread1,
      "alive=", w._thread.is_alive(),
      "thread count=", len(threads_named))
assert w._thread is thread1, "DUPLICATE loop started!"
print("  single-instance guard OK")

print("\n== 2) One complete learning cycle (LearningLoopService.run_cycle) ==")
result = LearningLoopService(SessionLocal()).run_cycle()
print("  cycle result:", result)

print("\n== 3) Verify LearningLoopState was written ==")
with engine.connect() as c:
    s = c.execute(text(
        "select interests_last_run_at, interests_total_events, interests_total_signals, "
        "interests_version, metrics_last_run_at, metrics_total_events, "
        "metrics_profiles_updated, decay_last_run_at, decay_total_rows, decay_removed "
        "from learning_loop_state where id=1"
    )).one_or_none()
    print("  learning_loop_state:", s)
    print("  interest_profiles count:", c.execute(text("select count(*) from interest_profiles")).scalar())
    print("  metrics_state count:", c.execute(text("select count(*) from metrics_state")).scalar())
    print("  content_events count:", c.execute(text("select count(*) from content_events")).scalar())
    print("  user_interests count:", c.execute(text("select count(*) from user_interests")).scalar())

print("\n== 4) Worker shutdown ==")
w.stop()
print("  thread alive after stop():", w._thread.is_alive())
print("OK - all checks passed")