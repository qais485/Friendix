from typing import Optional
from datetime import datetime

from pydantic import BaseModel


class InterestPassOut(BaseModel):
    users_processed: int = 0
    total_events: int = 0
    total_signals: int = 0
    total_interests_updated: int = 0


class MetricsPassOut(BaseModel):
    processed_events: int = 0
    profiles_updated: int = 0
    freshness_updated: int = 0


class DecayPassOut(BaseModel):
    rows_decayed: int = 0
    rows_removed: int = 0


class LearningCycleResult(BaseModel):
    interests: InterestPassOut
    metrics: MetricsPassOut
    decay: DecayPassOut


class InterestTelemetry(BaseModel):
    last_run_at: Optional[datetime] = None
    total_events: int = 0
    total_signals: int = 0
    version: int = 0


class MetricsTelemetry(BaseModel):
    last_run_at: Optional[datetime] = None
    total_events: int = 0
    profiles_updated: int = 0


class DecayTelemetry(BaseModel):
    last_run_at: Optional[datetime] = None
    rows_decayed: int = 0
    rows_removed: int = 0


class LearningStatusResponse(BaseModel):
    initialized: bool
    interests: Optional[InterestTelemetry] = None
    metrics: Optional[MetricsTelemetry] = None
    decay: Optional[DecayTelemetry] = None