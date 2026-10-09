"""Pydantic schemas for telemetry data from ESP32 collar."""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class MovementData(BaseModel):
    accel_max_g: Optional[float] = 0.0
    accel_variance: Optional[float] = 0.0
    gyro_variance: Optional[float] = 0.0
    inferred_state: Optional[str] = "resting"  # resting | walking | running | shaking
    accel_x: Optional[float] = 0.0
    accel_y: Optional[float] = 0.0
    accel_z: Optional[float] = 0.0
    gyro_x: Optional[float] = 0.0
    gyro_y: Optional[float] = 0.0
    gyro_z: Optional[float] = 0.0
    gait_asymmetry_score: Optional[float] = 0.0
    readings: Optional[List[Dict[str, Any]]] = None


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
    # Direct sensor readings from MPU-6050
    accel_x: Optional[float] = None
    accel_y: Optional[float] = None
    accel_z: Optional[float] = None
    gyro_x: Optional[float] = None
    gyro_y: Optional[float] = None
    gyro_z: Optional[float] = None
    readings: Optional[List[Dict[str, Any]]] = None


class TelemetryResponse(BaseModel):
    status: str = "received"
    alert_triggered: bool = False
    alert_type: Optional[str] = None
    message: str = ""
