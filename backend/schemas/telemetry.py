"""Pydantic schemas for telemetry data from ESP32 collar."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class MovementData(BaseModel):
    accel_max_g: float = 0.0
    accel_variance: float = 0.0
    gyro_variance: float = 0.0
    inferred_state: str = "resting"  # resting | walking | running | shaking


class CoordinatesPayload(BaseModel):
    lat: float
    lng: float
    accuracy_meters: int = 5


class TelemetryPayload(BaseModel):
    """Exact JSON structure the ESP32 collar POST-s every few seconds."""
    collar_mac: Optional[str] = None
    collar_id: Optional[str] = None
    dog_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    battery_percent: int = 85
    temperature_c: float = 38.5
    activity_score: int = 70
    coordinates: Optional[CoordinatesPayload] = None
    movement: Optional[MovementData] = None


class TelemetryResponse(BaseModel):
    status: str = "received"
    alert_triggered: bool = False
    alert_type: Optional[str] = None
    message: str = ""
