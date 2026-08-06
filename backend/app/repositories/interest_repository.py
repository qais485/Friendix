from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models import ContentEvent, InterestEventSignal, InterestProfile, UserInterest

# Halflife of interest strength: after HALF_LIFE_DAYS a stored strength halves.
HALF_LIFE_DAYS = 30.0

_RAW_EVENT_COLUMNS = (
    ContentEvent.id,
    ContentEvent.user_id,
    ContentEvent.content_type,
    ContentEvent.content_id,
    ContentEvent.creator_id,
    ContentEvent.event_type,
    ContentEvent.value,
    ContentEvent.occurred_at,
)


class InterestRepository:
    """Persistence for incremental user-interest profile construction.

    The design is a per-user (occurred_at, id) watermark over the raw event
    log: each run consumes only events newer than the watermark, writes
    idempotent derived signals, applies a time-decaying strength update to
    ``user_interests``, then advances the watermark in a single transaction.
    """

    def __init__(self, db: Session):
        self.db = db

    # ── Profile watermark ──────────────────────────────────

    def get_or_create_profile(self, user_id: UUID) -> InterestProfile:
        profile = self.db.execute(
            select(InterestProfile)
            .where(InterestProfile.user_id == user_id)
            .with_for_update()
        ).scalar_one_or_none()
        if profile is None:
            profile = InterestProfile(
                user_id=user_id,
                computed_at=datetime.now(timezone.utc),
                total_interests=0,
                version=1,
            )
            self.db.add(profile)
            self.db.flush()
        return profile

    def get_profile_row(self, user_id: UUID) -> InterestProfile | None:
        return self.db.execute(
            select(InterestProfile).where(InterestProfile.user_id == user_id)
        ).scalar_one_or_none()

    def get_pending_events(
        self,
        user_id: UUID,
        last_occurred_at,
        last_event_id,
        limit: int,
    ) -> list[dict]:
        stmt = select(*_RAW_EVENT_COLUMNS).where(ContentEvent.user_id == user_id)
        if last_occurred_at is not None and last_event_id is not None:
            stmt = stmt.where(
                or_(
                    ContentEvent.occurred_at > last_occurred_at,
                    and_(
                        ContentEvent.occurred_at == last_occurred_at,
                        ContentEvent.id > last_event_id,
                    ),
                )
            )
        elif last_occurred_at is not None:
            stmt = stmt.where(ContentEvent.occurred_at > last_occurred_at)
        stmt = (
            stmt.order_by(ContentEvent.occurred_at.asc(), ContentEvent.id.asc())
            .limit(limit)
        )
        rows = self.db.execute(stmt).mappings().all()
        return [dict(r) for r in rows]

    def update_watermark(self, profile: InterestProfile, occurred_at, event_id) -> None:
        profile.last_occurred_at = occurred_at
        profile.last_event_id = event_id
        profile.computed_at = datetime.now(timezone.utc)

    def count_interests(self, user_id: UUID) -> int:
        return (
            self.db.query(UserInterest)
            .filter(UserInterest.user_id == user_id)
            .count()
        )

    # ── signals ────────────────────────────────────────────

    def insert_signals(self, signals: list[dict]) -> None:
        """Insert derived signals, skipping any (event, dimension) already seen."""
        if not signals:
            return
        stmt = pg_insert(InterestEventSignal).values(signals)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=[
                InterestEventSignal.event_id,
                InterestEventSignal.interest_type,
                InterestEventSignal.interest_key,
            ]
        )
        self.db.execute(stmt)

    # ── user interests ─────────────────────────────────────

    def apply_interests(self, user_id: UUID, updates: list[dict]) -> int:
        """Apply decaying strength updates to user interests. Returns count."""
        if not updates:
            return 0

        pairs = [(u["interest_type"], u["interest_key"]) for u in updates]
        existing_rows = self.db.execute(
            select(UserInterest)
            .where(UserInterest.user_id == user_id)
            .where(_tuple_in(UserInterest, pairs))
            .with_for_update()
        ).scalars().all()
        existing = {(row.interest_type, row.interest_key): row for row in existing_rows}

        now = datetime.now(timezone.utc)
        created: list[UserInterest] = []
        for u in updates:
            key = (u["interest_type"], u["interest_key"])
            row = existing.get(key)
            occurred = u["occurred_at"] or now
            if row is None:
                created.append(
                    UserInterest(
                        user_id=user_id,
                        interest_type=u["interest_type"],
                        interest_key=u["interest_key"],
                        interest_name=u["interest_name"],
                        entity_id=u.get("entity_id"),
                        strength=round(u["delta_sum"], 4),
                        positive_signals=u["positive_signals"],
                        negative_signals=u["negative_signals"],
                        total_signals=u["total_signals"],
                        first_seen_at=occurred,
                        last_interaction_at=occurred,
                    )
                )
                continue

            age_days = (now - row.last_interaction_at).days
            decay = 0.5 ** (age_days / HALF_LIFE_DAYS) if age_days > 0 else 1.0
            row.strength = round(row.strength * decay + u["delta_sum"], 4)
            row.positive_signals += u["positive_signals"]
            row.negative_signals += u["negative_signals"]
            row.total_signals += u["total_signals"]
            row.interest_name = u["interest_name"] or row.interest_name
            row.entity_id = u.get("entity_id") or row.entity_id
            if occurred > row.last_interaction_at:
                row.last_interaction_at = occurred

        if created:
            self.db.add_all(created)
        return len(updates)

    # ── reads ──────────────────────────────────────────────

    def list_interests(self, user_id: UUID, interest_type: str | None = None, top: int = 50) -> list[UserInterest]:
        stmt = (
            select(UserInterest)
            .where(UserInterest.user_id == user_id, UserInterest.strength != 0)
            .order_by(UserInterest.strength.desc())
            .limit(top)
        )
        if interest_type:
            stmt = stmt.where(UserInterest.interest_type == interest_type)
        return list(self.db.execute(stmt).scalars().all())

    def list_users_with_pending(self) -> list[UUID]:
        combined = (
            select(ContentEvent.user_id)
            .distinct()
            .outerjoin(InterestProfile, InterestProfile.user_id == ContentEvent.user_id)
            .where(
                ContentEvent.user_id.is_not(None),
                or_(
                    InterestProfile.user_id.is_(None),
                    ContentEvent.occurred_at > InterestProfile.last_occurred_at,
                    and_(
                        ContentEvent.occurred_at == InterestProfile.last_occurred_at,
                        ContentEvent.id > InterestProfile.last_event_id,
                    ),
                ),
            )
        )
        return [r[0] for r in self.db.execute(combined).all()]


def _tuple_in(table, pairs):
    """Build an OR-of-ANDs expression for (type, key) membership (portable)."""
    expr = None
    for interest_type, interest_key in pairs:
        cond = and_(
            table.interest_type == interest_type,
            table.interest_key == interest_key,
        )
        expr = cond if expr is None else or_(expr, cond)
    return expr