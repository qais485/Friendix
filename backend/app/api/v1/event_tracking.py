from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_optional_user_id
from app.database.base import get_db
from app.schemas.event_tracking import EventTrackRequest, EventTrackResponse
from app.services.event_tracking_service import EventTrackingService

router = APIRouter(tags=["Event Tracking"])


@router.post(
    "/events",
    response_model=EventTrackResponse,
    status_code=202,
    summary="Ingest a batch of content engagement events",
)
def track_events(
    data: EventTrackRequest,
    user_id: UUID | None = Depends(get_optional_user_id),
    db: Session = Depends(get_db),
) -> EventTrackResponse:
    """Receive up to 200 engagement events in one call.

    Events are bulk-inserted into the append-only ``content_events`` log and
    view sessions are upserted. Idempotent per ``client_event_id`` so client
    retries never double count. Authentication is optional (guests tracked).
    """
    result = EventTrackingService(db).track(user_id, data.events)
    return EventTrackResponse(**result)