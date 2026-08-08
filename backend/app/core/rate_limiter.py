"""In-process sliding-window rate limiter.

Thread-safe and lock-free for reads apart from the append path. Designed for
single-process deployments; swap for a Redis-backed limiter when horizontal
scaling is introduced (keys are already plain strings).
"""

import threading
import time
from collections import deque


class SlidingWindowRateLimiter:
    """Tracks timestamps per key; a call is allowed if the window is under limit."""

    def __init__(self):
        self._buckets: dict[str, deque] = {}
        self._lock = threading.Lock()
        self._cleanup_threshold = 10000

    def allow(self, key: str, limit: int, window_seconds: float) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._buckets.get(key)
            if bucket is None:
                bucket = deque()
                self._buckets[key] = bucket
            cutoff = now - window_seconds
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            if len(self._buckets) >= self._cleanup_threshold:
                self._cleanup(now)
            return True

    def _cleanup(self, now: float) -> None:
        stale = [k for k, b in self._buckets.items() if not b or (now - b[-1]) > 3600]
        for k in stale:
            self._buckets.pop(k, None)


_rate_limiter = SlidingWindowRateLimiter()


def get_rate_limiter() -> SlidingWindowRateLimiter:
    return _rate_limiter
