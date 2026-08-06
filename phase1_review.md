# Phase 1 Review: Data Collection for Engagement Tracking

**Reviewer role:** Senior recommendation-system architect
**Scope reviewed:** `ContentEvent` / `ViewSession` models, `/api/v1/tracking/events` ingest endpoint, `EventTrackingService`, `EventTrackingRepository`, schemas, and the Alembic migration.
**Outcome scope:** review only — nothing implemented.

---

## 1. Strengths

- **Append-only raw event log + denormalized aggregate split.** Separating `content_events` (write-optimized, immutable) from `view_sessions` (upserted aggregate) is the right architectural foundation. It matches how real feed producers (TikTok, YouTube, Netflix-style signals) separate raw signals from computed state. Aggregations later can read `view_sessions`, while raw ML feature extraction reads `content_events`.
- **Polymorphic content identity.** `content_type` + `content_id` cleanly covers video/reel/post/story/live/media without duplicating tables per content kind. Future content types are a cheap, additive change.
- **Idempotency by design.** `client_event_id` + dedup-on-existing-`SELECT` is the correct pattern to make client retries safe — a real requirement for lossy/high-frequency telemetry.
- **View session correlation.** A client-generated `view_session_id` that groups view_start / watch_time / view_percentage / completion / skip / replay is exactly what enables per-session funnel analysis later. Good forward-looking signal design.
- **Batch ingestion.** Accepting up to 200 events per request amortizes network round-trips and row-insert costs — directly serving the "without hurting performance" requirement.
- **Single transaction, single-statement inserts.** Bulk `INSERT` for raw rows plus one `upsert` per session keeps the hot path free of N+1 serialization or row-lock contention.
- **Guest tracking.** `get_optional_user_id` correctly allows anonymous/guest tracking without forcing auth, while still capturing the user id when present. This is the right flexibility for a collection endpoint.
- **Validation gates.** Event types and content types are constrained server-side by Pydantic validators — the write surface is closable and never trusts the client for types.
- **Composite indexes on hot read patterns.** Content+event+time, user+time, creator+event, and event+time are sensible and cover the funnel/analytics queries that Phase 2 will need.

---

## 2. Weaknesses

- **Synchronous database writes on the request path.** The endpoint commits to PostgreSQL in-line on every batch. No queue, no background flush, no buffer, no circuit breaker. Under bursts this both (a) slows the collector and (b) couples availability of the tracking pipeline to availability of the primary DB. This is the single biggest scalability gap.
- **Per-session upsert = N round trips per batch.** `_aggregate_view_sessions` calls `upsert_view_session` in a loop (one `INSERT..ON CONFLICT` per session). Most batches touch few sessions, so today this is small, but it does not hold up if a batch is very large or if more session-bearing event types are added. It should be a single multi-row upsert using `pg_insert(...).values([...]).on_conflict_do_update()`.

- **Idempotency scope is too broad.** Idempotency is keyed on a single `client_event_id` per content, globally unique. Two users (or two apps) can independently generate the same value, silently dropping unrelated events, and a bad client can exhaust the token space. It should be scoped: unique `(user_id, client_event_id)` — preserving independence per user. (Google Analytics-scoped session ids, for example, are never globally unique.)
- **Client trust is unbounded.** `value` (watch_time seconds), `view_percentage`, and `position_seconds` are accepted as-is. A malicious/buggy client can inflate the raw and aggregate data. There is no clamping, no sanity bound, and no server-side floor/ceiling check on `occurred_at` (a wildly skewed client clock shifts funnels incorrectly).
- **`creator_id` is client-supplied and unverified.** The "follow after viewing" and creator analytics trust whatever the client says is the content owner. A client could misattribute impressions or follow events to arbitrary creators — both a data-integrity and (potentially) an abuse vector. It should be server-resolved from the real content row when the content kind is a first-class model, or validated that a creator actually owns that `content_id`.
- **No privacy/retention controls.** The raw log contains perpetual PII attachments (`user_id`, plus any `metadata` like IP/device). There is no retention policy, no `deleted_at`/expiry on rows, no EU GDPR export path, and no idle-user/anonymous data anonymization. A compliant system needs purging strategy from day one.

### 3. Missing features

- **A write-ack/read-verify endpoint.** There is no `GET /tracking/events/hits` or metrics endpoint to verify ingestion (`{received, duplicates}` is only returned synchronously). Operators have incomplete observability into whether telemetry is flowing.
- **Watch time funnels at row level.** All four "view funnel" events are collected, but there's no lightweight derived row for "did to (content, user) reach X%".
- **Implicit dwell time.** `Impresion` is logged but there is no `dwell_time`/`sticky_impression` or "impression exposure duration" (how long a card was on-screen before leaving the viewport) — an important engagement signal the system is missing.
- **Interaction aggregation counters.** No denormalized per-content counters table (impressions, completions, shares, saves, reports) for cheap overview reads; Phase 2 will need it and Phase 1 could seed it in the same upsert.
- **Negative-feedback dedup.** `not_interested`/`report` are logged every time; a client can spam them. There is no idempotency/cooldown or "this user already said not appeared for content X" guard (though raw dedup helps, it needs a per-user/content distinct flag).

### 4. Recommended improvements before Phase 2

Prioritized by effort-to-impact:

1. **Add a retention/anonymization policy.** A `purge before occurred_at` job, `retention_days`, cr `anonymized table`, and `deleted_at` for GDPR/export. Reference this in Phase 2 planning.
2. **Move ingestion off the synchronous request path** in two steps: (a) clamp/frame incoming values + validate `occurred_at` window; (b) buffer each batch and flush in the background (or at least accumulate N rows) rather than committing to `db.commit()` inline per request. Add a queue driver seam (Redis/queue) in config.
3. **Collapse session upserts to one multi-row upsert** and scope idempotency `(user_id, client_event_id)`.
4. **Derive `creator_id` server-side** where the content kind maps to a first-class table; otherwise validate ownership. Never just trust the client.
5. **Add dwell/exposure-seconds event** and, optionally, a per-content counter aggregate table seeded during ingestion.
6. **Harden the schema:** `metadata` → allowlisted, schema-validated, size-capped (and PII-stripped); clamp `watch_time`/`percentage`; enforce `metadata_json` JSON structure server-side by generating rather than trusting.
7. **Trim indexes on the write-hot table.** The `content_events` table has 10 indexes/constraints, all of which tax every insert. Evaluate dropping redundant single-column indexes covered by the composites, or moving the raw table toward bucket/partitioned storage (partition by `occurred_at`) and using fewer/BRIN indexes. Remaining indexes should be: unique(client_event_id-scoped), (content_id,event_type,occurred_at), (user_id,occurred_at) — the composites already cover most filters.
8. **Add an ingest observability endpoint** (counts, last flush, duplicates) plus structured logging/tracing (`X-Request-Id`) for debugging the pipeline.

### 5. Overall score: **7.0 / 10**

A genuinely solid, clean, and forward-looking foundation. The core split (raw log ↔ aggregated session), batching, optional auth, and idempotency are all the right instincts and the code is idiomatic for the codebase. It is held back from strong production-readiness by the synchronous DB write path, over-indexing the write hot table, unbounded client trust, and the missing privacy/retention layer. With improvements at #1–#3, it becomes 8.5–9.