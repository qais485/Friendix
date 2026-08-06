from typing import Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

InterestType = Literal["category", "tag", "creator", "topic"]

# The four interest dimensions the profile is built from.
INTEREST_TYPES: tuple[str, ...] = ("category", "tag", "creator", "topic")


class InterestItem(BaseModel):
    interest_type: str
    interest_key: str
    interest_name: str | None = None
    entity_id: UUID | None = None
    strength: float
    positive_signals: int
    negative_signals: int
    total_signals: int
    last_interaction_at: datetime

    model_config = {"from_attributes": True}


class InterestProfileResponse(BaseModel):
    user_id: UUID
    computed_at: datetime | None = None
    total_interests: int
    version: int
    categories: list[InterestItem] = Field(default_factory=list)
    tags: list[InterestItem] = Field(default_factory=list)
    creators: list[InterestItem] = Field(default_factory=list)
    topics: list[InterestItem] = Field(default_factory=list)


class InterestRefreshResponse(BaseModel):
    user_id: UUID
    processed_events: int
    signals_written: int
    interests_updated: int
    is_complete: bool


class InterestBatchProcessResponse(BaseModel):
    users_processed: int
    total_events: int
    total_signals: int
    total_interests_updated: int


class InterestTypeParam:
    @field_validator("interest_type")
    @classmethod
    def _validate(cls, v: str) -> str:
        if v not in INTEREST_TYPES:
            raise ValueError(f"interest_type must be one of {INTEREST_TYPES}")
        return v