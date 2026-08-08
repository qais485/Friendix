"""Tiny caching layer for hot read paths.

A Redis-backed cache is used when the ``redis`` package is installed and a URL
is configured (``FRIENDIX_CACHE_REDIS_URL`` or ``FRIENDIX_REDIS_URL``). Otherwise
a thread-safe in-process TTL store provides the same interface, so the system
runs with zero external dependencies while staying drop-in Redis-ready.

Cached values MUST be JSON-serializable (UUID keys are stored as strings); callers
that keyed dicts by UUID round-trip through ``str`` explicitly.
"""

import json
import os
import threading
import time
from typing import Any, Optional


class TtlCache:
    """Thread-safe in-memory cache with sliding TTL and a size bound."""

    def __init__(self, ttl_default: float = 60.0, max_items: int = 10_000):
        self._ttl_default = ttl_default
        self._max_items = max_items
        self._data: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            expires, value = item
            if expires < time.monotonic():
                self._data.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl_seconds: Optional[float] = None) -> None:
        expires = time.monotonic() + (ttl_seconds if ttl_seconds is not None else self._ttl_default)
        with self._lock:
            if len(self._data) >= self._max_items and key not in self._data:
                self._evict_locked()
            self._data[key] = (expires, value)

    def _evict_locked(self) -> None:
        if not self._data:
            return
        now = time.monotonic()
        for k in [k for k, (exp, _) in self._data.items() if exp < now]:
            self._data.pop(k, None)
        while len(self._data) >= self._max_items:
            oldest = min(self._data.items(), key=lambda kv: kv[1][0])[0]
            self._data.pop(oldest, None)

    def delete(self, key: str) -> None:
        with self._lock:
            self._data.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._data.clear()


class RedisCache:
    """Redis-backed cache exposing the same interface as TtlCache.

    Values are JSON-serialized with UUIDs stringified, matching the contract
    that cached payloads are JSON-safe.
    """

    def __init__(self, url: str, ttl_default: float = 60.0, max_items: int = 10_000):
        import redis as redis_module  # lazily imported; factory guarantees availability

        self._client = redis_module.Redis.from_url(url, decode_responses=True)
        self._ttl_default = ttl_default
        self._max_items = max_items

    def get(self, key: str) -> Any | None:
        try:
            raw = self._client.get(key)
        except Exception:
            return None
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except (ValueError, TypeError):
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[float] = None) -> None:
        ttl = max(1, int(ttl_seconds if ttl_seconds is not None else self._ttl_default))
        try:
            self._client.set(key, json.dumps(value, default=str), ex=ttl)
        except Exception:
            pass

    def delete(self, key: str) -> None:
        try:
            self._client.delete(key)
        except Exception:
            pass

    def clear(self) -> None:
        try:
            self._client.flushdb()
        except Exception:
            pass


_cache_singletons: dict[str, Any] = {}
_cache_singletons_lock = threading.Lock()


def get_application_cache() -> Any:
    """Return the process-wide cache, building it once per configuration."""
    with _cache_singletons_lock:
        if "application" in _cache_singletons:
            return _cache_singletons["application"]

        from app.core.cache_config import get_cache_config

        cfg = get_cache_config()
        backend = (cfg.BACKEND or "auto").lower()

        if backend in ("auto", "redis"):
            url = cfg.REDIS_URL or os.getenv("FRIENDIX_REDIS_URL")
            if url:
                try:
                    cache = RedisCache(url, ttl_default=cfg.ENGAGEMENT_TTL_SECONDS, max_items=cfg.MAX_ITEMS)
                    cache._client.ping()
                    _cache_singletons["application"] = cache
                    return cache
                except Exception:
                    if backend == "redis":
                        raise
                    # fall through to the in-process store

        cache = TtlCache(ttl_default=cfg.ENGAGEMENT_TTL_SECONDS, max_items=cfg.MAX_ITEMS)
        _cache_singletons["application"] = cache
        return cache


def cache_key(*parts: str) -> str:
    """Build a namespaced cache key from parts (e.g. ``cache_key("engagement", "..ids..")``)."""
    return "|".join(parts)


def content_set_key(content_ids: list) -> str:
    """Canonical cache key for a set of content ids (order-independent)."""
    return ",".join(sorted(str(c) for c in content_ids))
