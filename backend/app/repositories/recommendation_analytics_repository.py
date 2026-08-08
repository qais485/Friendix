"""Read-optimized aggregation for the Phase 7 recommendation analytics.

Aggregates the Phase 1 event log (``content_events``) and the denormalized
``view_sessions`` aggregate into per-content / per-creator / global metrics.
Enrichment uses ``content_profiles`` (title / category) and ``users`` (creator
identity). No AI — pure, explainable SQL aggregation with time-window filters.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import ContentEvent, ContentProfile, User, ViewSession

# Engagement event types that make up "engagement" (mirrors the platform's own
# weighting used by content metrics / ranking).
_ENGAGEMENT_TYPES = ("like", "comment", "share", "save")
_ENGAGEMENT_WEIGHTS = {"like": 2.0, "comment": 3.0, "share": 4.0, "save": 3.0}
# Trending scans a bounded pool: the top-100 will comfortably sit in the top
# pool without scanning the full engagement history.
_TRENDING_POOL_CAP = 5000


def _rate(numerator, denominator) -> float:
    return round((numerator / denominator), 4) if denominator else 0.0


def _engagement_score(views: int, eng: dict) -> float:
    score = views
    for et, weight in _ENGAGEMENT_WEIGHTS.items():
        score += eng.get(et, 0) * weight
    return round(score, 4)


def _build_rate_metrics(
    sess: dict,
    engagement_counts: dict,
    impressions: int,
) -> dict:
    views = sess["views"]
    total_eng = sum(engagement_counts.get(et, 0) for et in _ENGAGEMENT_TYPES)
    return {
        "views": views,
        "sessions": sess["sessions"],
        "watch_time_seconds": sess["watch_time_seconds"],
        "completions": sess["completions"],
        "completion_rate": _rate(sess["completions"], sess["sessions"]),
        "replays": sess["replays"],
        "replay_rate": _rate(sess["replays"], views),
        "skips": sess["skips"],
        "skip_rate": _rate(sess["skips"], sess["sessions"]),
        "likes": engagement_counts.get("like", 0),
        "comments": engagement_counts.get("comment", 0),
        "shares": engagement_counts.get("share", 0),
        "saves": engagement_counts.get("save", 0),
        "impressions": impressions,
        "ctr": _rate(views, impressions),
        "engagement_rate": _rate(total_eng, impressions),
    }


class RecommendationAnalyticsRepository:
    """Aggregation queries backing the recommendation-performance dashboard."""

    def __init__(self, db: Session):
        self.db = db

    def since(self, days: int) -> datetime:
        return datetime.now(timezone.utc) - timedelta(days=days)

    # ── global / filtered summary ─────────────────────────────────────────────

    def get_summary(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> dict:
        sess = self._session_aggregate(since, content_type, creator_id)
        eng = self._engagement_counts(since, content_type, creator_id)
        impressions = self._impressions(since, content_type, creator_id)
        return _build_rate_metrics(sess, eng, impressions)

    def _session_aggregate(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> dict:
        stmt = select(
            func.count(ViewSession.id).label("sessions"),
            func.coalesce(func.sum(ViewSession.views_count), 0).label("views"),
            func.coalesce(func.sum(ViewSession.watch_time_seconds), 0).label("watch_time"),
            func.coalesce(func.sum(ViewSession.replays_count), 0).label("replays"),
            func.count(case((ViewSession.completed.is_(True), 1))).label("completions"),
            func.count(case((ViewSession.skipped.is_(True), 1))).label("skips"),
        ).where(ViewSession.last_activity_at >= since)
        if content_type:
            stmt = stmt.where(ViewSession.content_type == content_type)
        if creator_id:
            stmt = stmt.where(ViewSession.creator_id == creator_id)
        row = self.db.execute(stmt).one()
        return {
            "sessions": row.sessions or 0,
            "views": row.views or 0,
            "watch_time_seconds": float(row.watch_time or 0.0),
            "replays": row.replays or 0,
            "completions": row.completions or 0,
            "skips": row.skips or 0,
        }

    def _engagement_counts(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> dict[str, int]:
        stmt = select(
            ContentEvent.event_type,
            func.count(ContentEvent.id).label("n"),
        ).where(
            ContentEvent.occurred_at >= since,
            ContentEvent.event_type.in_(_ENGAGEMENT_TYPES),
        )
        if content_type:
            stmt = stmt.where(ContentEvent.content_type == content_type)
        if creator_id:
            stmt = stmt.where(ContentEvent.creator_id == creator_id)
        stmt = stmt.group_by(ContentEvent.event_type)
        counts = {et: 0 for et in _ENGAGEMENT_TYPES}
        for et, n in self.db.execute(stmt).all():
            counts[et] = n
        return counts

    def _impressions(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> int:
        stmt = select(func.count(ContentEvent.id)).where(
            ContentEvent.occurred_at >= since,
            ContentEvent.event_type == "impression",
        )
        if content_type:
            stmt = stmt.where(ContentEvent.content_type == content_type)
        if creator_id:
            stmt = stmt.where(ContentEvent.creator_id == creator_id)
        return self.db.execute(stmt).scalar() or 0

    # ── content ranking ───────────────────────────────────────────────────────

    def get_content_performances(
        self,
        since: datetime,
        limit: int,
        content_type: str | None = None,
        creator_id: UUID | None = None,
        offset: int = 0,
    ) -> list[dict]:
        stmt = select(
            ViewSession.content_type,
            ViewSession.content_id,
            ViewSession.creator_id,
            func.count(ViewSession.id).label("sessions"),
            func.coalesce(func.sum(ViewSession.views_count), 0).label("views"),
            func.coalesce(func.sum(ViewSession.watch_time_seconds), 0).label("watch_time"),
            func.coalesce(func.sum(ViewSession.replays_count), 0).label("replays"),
            func.count(case((ViewSession.completed.is_(True), 1))).label("completions"),
            func.count(case((ViewSession.skipped.is_(True), 1))).label("skips"),
        ).where(
            ViewSession.last_activity_at >= since,
        ).group_by(
            ViewSession.content_type,
            ViewSession.content_id,
            ViewSession.creator_id,
        )
        stmt = self._filter_content(stmt, content_type, creator_id)
        wr = self.db.execute(stmt)
        rows = [r._mapping for r in wr.all()]

        er = self.db.execute(
            select(
                ContentEvent.content_type,
                ContentEvent.content_id,
                ContentEvent.event_type,
                func.count(ContentEvent.id).label("n"),
            )
            .where(
                ContentEvent.occurred_at >= since,
                ContentEvent.event_type.in_(_ENGAGEMENT_TYPES),
            )
            .group_by(
                ContentEvent.content_type,
                ContentEvent.content_id,
                ContentEvent.event_type,
            )
        ).all()
        eng_by_key: dict[tuple, dict] = {}
        for ct, cid, et, n in er:
            d = eng_by_key.setdefault((ct, cid), {e: 0 for e in _ENGAGEMENT_TYPES})
            d[et] = n

        keys = [(r["content_type"], r["content_id"]) for r in rows]
        profiles = self.get_profiles(keys)

        imp_by_key: dict[tuple, int] = {}
        if keys:
            ir = select(
                ContentEvent.content_type,
                ContentEvent.content_id,
                func.count(ContentEvent.id).label("n"),
            ).where(
                ContentEvent.occurred_at >= since,
                ContentEvent.event_type == "impression",
            ).group_by(ContentEvent.content_type, ContentEvent.content_id)
            if content_type:
                ir = ir.where(ContentEvent.content_type == content_type)
            for ct, cid, n in self.db.execute(ir).all():
                imp_by_key[(ct, cid)] = n

        items = []
        for r in rows:
            key = (r["content_type"], r["content_id"])
            eng = eng_by_key.get(key, {e: 0 for e in _ENGAGEMENT_TYPES})
            p = profiles.get(key, {})
            views = r["views"] or 0
            sessions = r["sessions"] or 0
            impressions = imp_by_key.get(key, 0)
            items.append(
                {
                    "content_type": r["content_type"],
                    "content_id": r["content_id"],
                    "creator_id": r["creator_id"],
                    "title": p.get("title"),
                    "category_name": p.get("category_name"),
                    "views": views,
                    "watch_time_seconds": float(r["watch_time"] or 0.0),
                    "completion_rate": _rate(r["completions"], sessions),
                    "replay_rate": _rate(r["replays"], views),
                    "skip_rate": _rate(r["skips"], sessions),
                    "likes": eng["like"],
                    "comments": eng["comment"],
                    "shares": eng["share"],
                    "saves": eng["save"],
                    "impressions": impressions,
                    "ctr": _rate(views, impressions),
                    "engagement_rate": _rate(sum(eng.values()), views),
                    "engagement_score": _engagement_score(views, eng),
                }
            )
        items.sort(key=lambda i: i["engagement_score"], reverse=True)
        return items[offset:offset + limit]

    def get_trending(self, since: datetime, limit: int, content_type: str | None = None) -> list[dict]:
        """Rank content by recent activity velocity (trending score).

        Trending combines the engagement score with a completion-signal boost,
        which surfaces content that is actively being watched to completion.
        The pool is bounded so a "top 100" query never scans the full history.
        """
        rows = self.get_content_performances(since, limit=_TRENDING_POOL_CAP, content_type=content_type)
        for r in rows:
            r["trending_score"] = round(
                r["engagement_score"]
                + (r["completion_rate"] * 20.0)
                + (r["watch_time_seconds"] / 60.0 / 60.0),
                4,
            )
        rows.sort(key=lambda i: i["trending_score"], reverse=True)
        return rows[:limit]

    # ── watch time series ─────────────────────────────────────────────────────

    def get_watch_time_series(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> tuple[float, list[dict]]:
        stmt = select(
            func.date(ViewSession.last_activity_at).label("date"),
            func.coalesce(func.sum(ViewSession.views_count), 0).label("views"),
            func.coalesce(func.sum(ViewSession.watch_time_seconds), 0).label("watch_time"),
            func.count(case((ViewSession.completed.is_(True), 1))).label("completions"),
        ).where(
            ViewSession.last_activity_at >= since
        ).group_by(func.date(ViewSession.last_activity_at))
        if content_type:
            stmt = stmt.where(ViewSession.content_type == content_type)
        if creator_id:
            stmt = stmt.where(ViewSession.creator_id == creator_id)
        stmt = stmt.order_by(func.date(ViewSession.last_activity_at))

        total = 0.0
        points = []
        for date, views, watch, completions in self.db.execute(stmt).all():
            total += float(watch or 0.0)
            points.append(
                {
                    "date": str(date),
                    "views": views or 0,
                    "watch_time_seconds": float(watch or 0.0),
                    "completions": completions or 0,
                }
            )
        return total, points

    # ── creator performance ───────────────────────────────────────────────────

    def get_engagement_series(
        self,
        since: datetime,
        content_type: str | None = None,
        creator_id: UUID | None = None,
    ) -> list[dict]:
        """Daily impressions / views / engagement counts (event-time bucketed)."""
        day = func.date(ViewSession.last_activity_at)
        ws = select(
            day.label("date"),
            func.coalesce(func.sum(ViewSession.views_count), 0).label("views"),
        ).where(ViewSession.last_activity_at >= since).group_by(day)
        if content_type:
            ws = ws.where(ViewSession.content_type == content_type)
        if creator_id:
            ws = ws.where(ViewSession.creator_id == creator_id)
        views_by_date = {str(d): v for d, v in self.db.execute(ws).all()}

        cday = func.date(ContentEvent.occurred_at)
        es = select(
            cday.label("date"),
            ContentEvent.event_type,
            func.count(ContentEvent.id).label("n"),
        ).where(
            ContentEvent.occurred_at >= since,
            ContentEvent.event_type.in_(_ENGAGEMENT_TYPES + ("impression",)),
        ).group_by(cday, ContentEvent.event_type)
        if content_type:
            es = es.where(ContentEvent.content_type == content_type)
        if creator_id:
            es = es.where(ContentEvent.creator_id == creator_id)
        event_rows = self.db.execute(es).all()

        by_date: dict[str, dict] = {}
        for d, et, n in event_rows:
            point = by_date.setdefault(
                str(d),
                {"impression": 0, "like": 0, "comment": 0, "share": 0, "save": 0},
            )
            point[et] += n

        points = []
        for date, eng in sorted(by_date.items()):
            views = views_by_date.get(date, 0)
            total_eng = eng["like"] + eng["comment"] + eng["share"] + eng["save"]
            impressions = eng["impression"]
            points.append(
                {
                    "date": date,
                    "views": views,
                    "impressions": impressions,
                    "likes": eng["like"],
                    "comments": eng["comment"],
                    "shares": eng["share"],
                    "saves": eng["save"],
                    "ctr": _rate(views, impressions),
                    "engagement_rate": _rate(total_eng, impressions),
                }
            )
        return points

    def get_creator_performances(
        self,
        since: datetime,
        limit: int,
        offset: int = 0,
        creator_id: UUID | None = None,
    ) -> list[dict]:
        stmt = select(
            ViewSession.creator_id,
            func.count(func.distinct(ViewSession.content_id)).label("content_count"),
            func.count(ViewSession.id).label("sessions"),
            func.coalesce(func.sum(ViewSession.views_count), 0).label("views"),
            func.coalesce(func.sum(ViewSession.watch_time_seconds), 0).label("watch_time"),
            func.coalesce(func.sum(ViewSession.replays_count), 0).label("replays"),
            func.count(case((ViewSession.completed.is_(True), 1))).label("completions"),
            func.count(case((ViewSession.skipped.is_(True), 1))).label("skips"),
        ).where(
            ViewSession.creator_id.is_not(None),
            ViewSession.last_activity_at >= since,
        )
        if creator_id:
            stmt = stmt.where(ViewSession.creator_id == creator_id)
        stmt = stmt.group_by(ViewSession.creator_id)
        wr = self.db.execute(stmt).all()

        er_stmt = select(
            ContentEvent.creator_id,
            ContentEvent.event_type,
            func.count(ContentEvent.id).label("n"),
        ).where(
            ContentEvent.creator_id.is_not(None),
            ContentEvent.occurred_at >= since,
            ContentEvent.event_type.in_(_ENGAGEMENT_TYPES),
        )
        if creator_id:
            er_stmt = er_stmt.where(ContentEvent.creator_id == creator_id)
        er_stmt = er_stmt.group_by(ContentEvent.creator_id, ContentEvent.event_type)
        er = self.db.execute(er_stmt).all()
        eng_by_creator: dict[UUID, dict] = {}
        for cid, et, n in er:
            eng_by_creator.setdefault(cid, {e: 0 for e in _ENGAGEMENT_TYPES})[et] = n

        imp_stmt = select(
            ContentEvent.creator_id,
            func.count(ContentEvent.id).label("n"),
        ).where(
            ContentEvent.creator_id.is_not(None),
            ContentEvent.occurred_at >= since,
            ContentEvent.event_type == "impression",
        )
        if creator_id:
            imp_stmt = imp_stmt.where(ContentEvent.creator_id == creator_id)
        imp_stmt = imp_stmt.group_by(ContentEvent.creator_id)
        imp_by_creator = {cid: n for cid, n in self.db.execute(imp_stmt).all()}

        creator_ids = [r.creator_id for r in wr]
        users = self.get_users(creator_ids)

        items = []
        for r in wr:
            cid = r.creator_id
            eng = eng_by_creator.get(cid, {e: 0 for e in _ENGAGEMENT_TYPES})
            views = r.views or 0
            sessions = r.sessions or 0
            impressions = imp_by_creator.get(cid, 0)
            u = users.get(cid, {})
            items.append(
                {
                    "creator_id": cid,
                    "username": u.get("username"),
                    "full_name": u.get("full_name"),
                    "avatar_url": u.get("avatar_url"),
                    "is_verified": u.get("is_verified", False),
                    "content_count": r.content_count or 0,
                    "total_views": views,
                    "total_watch_time_seconds": float(r.watch_time or 0.0),
                    "completion_rate": _rate(r.completions, sessions),
                    "replay_rate": _rate(r.replays, views),
                    "skip_rate": _rate(r.skips, sessions),
                    "likes": eng["like"],
                    "comments": eng["comment"],
                    "shares": eng["share"],
                    "saves": eng["save"],
                    "impressions": impressions,
                    "ctr": _rate(views, impressions),
                    "engagement_rate": _rate(sum(eng.values()), views),
                    "engagement_score": _engagement_score(views, eng),
                }
            )
        items.sort(key=lambda i: i["engagement_score"], reverse=True)
        return items[offset:offset + limit]

    # ── enrichment helpers ───────────────────────────────────────────────────

    def get_profiles(self, keys: list[tuple[str, UUID]]) -> dict[tuple[str, UUID], dict]:
        if not keys:
            return {}
        from sqlalchemy import and_, or_

        expr = None
        for content_type, content_id in keys:
            cond = and_(
                ContentProfile.content_type == content_type,
                ContentProfile.content_id == content_id,
            )
            expr = cond if expr is None else or_(expr, cond)
        rows = self.db.execute(
            select(
                ContentProfile.content_type,
                ContentProfile.content_id,
                ContentProfile.title,
                ContentProfile.category_name,
            ).where(expr)
        ).all()
        return {
            (r.content_type, r.content_id): {
                "title": r.title,
                "category_name": r.category_name,
            }
            for r in rows
        }

    def get_users(self, ids: list[UUID]) -> dict[UUID, dict]:
        if not ids:
            return {}
        ids = [i for i in ids if i is not None]
        if not ids:
            return {}
        rows = self.db.execute(
            select(
                User.id,
                User.username,
                User.full_name,
                User.avatar_url,
                User.is_verified,
            ).where(User.id.in_(ids))
        ).all()
        return {r.id: dict(r._mapping) for r in rows}

    def _filter_content(self, stmt, content_type: str | None, creator_id: UUID | None):
        if content_type:
            stmt = stmt.where(ViewSession.content_type == content_type)
        if creator_id:
            stmt = stmt.where(ViewSession.creator_id == creator_id)
        return stmt