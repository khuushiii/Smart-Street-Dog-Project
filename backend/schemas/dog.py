"""Pydantic schemas for Dog and VetRecord."""
from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel


# ──────────────────────────────────────────────
#  VetRecord
# ──────────────────────────────────────────────
class VetRecordSchema(BaseModel):
    vaccineBatch: str = ""
    vaccineDate: str = ""
    vaccineExpiry: str = ""
    sterilisationClinic: str = ""
    sterilisationDate: str = ""
    vetDoctor: str = ""
    dewormingDate: str = ""
    weightKg: float = 0.0
    microchipId: str = ""
    clinicalNotes: str = ""

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
#  TrailPoint
# ──────────────────────────────────────────────
class TrailPointSchema(BaseModel):
    x: float = 0.0
    y: float = 0.0
    lat: float = 0.0
    lng: float = 0.0
    time: str = ""
    label: str = ""

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
#  Coordinates
# ──────────────────────────────────────────────
class Coordinates(BaseModel):
    lat: float
    lng: float
    accuracyMeters: int = 5


# ──────────────────────────────────────────────
#  DogProfile (public / citizen view)
# ──────────────────────────────────────────────
class DogPublicResponse(BaseModel):
    id: str
    code: str
    name: str
    photo: str
    breed: str
    breedConfidence: float
    gender: str
    approxAge: str
    nature: str
    area: str
    coordinates: Coordinates
    registeredDate: str
    collarInstalledDate: str
    healthStatus: str
    temperatureC: float
    activityScore: int
    batteryPercent: int
    lastSeenMinutesAgo: int
    lastUpdateTimestamp: str
    isGeofencedSafe: bool
    specialNotes: str
    trailPoints: List[TrailPointSchema] = []
    vetRecord: VetRecordSchema = VetRecordSchema()


# ──────────────────────────────────────────────
#  Dog creation (admin – register-dog wizard)
# ──────────────────────────────────────────────
class DogCreate(BaseModel):
    name: str
    collar_hardware_id: str = ""
    lat: float = 19.8762
    lng: float = 75.3433
    breed: str = "Indian Pariah"
    breed_confidence: float = 96.4
    gender: str = "Male"
    approx_age: str = "2-3 years"
    nature: str = "Friendly"
    area: str = ""
    vaccination_status: str = "Vaccinated"  # for Step 4 of wizard
    special_notes: str = ""
    # VetRecord fields embedded (Step 4)
    vaccine_batch: str = ""
    vaccine_date: str = ""
    vaccine_expiry: str = ""
    sterilisation_clinic: str = ""
    sterilisation_date: str = ""
    vet_doctor: str = ""
    deworming_date: str = ""
    weight_kg: float = 0.0
    microchip_id: str = ""
    clinical_notes: str = ""


class DogUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    health_status: Optional[str] = None
    temperature_c: Optional[float] = None
    battery_percent: Optional[int] = None
    activity_score: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    special_notes: Optional[str] = None
    is_geofenced_safe: Optional[bool] = None


# ──────────────────────────────────────────────
#  Map pin response
# ──────────────────────────────────────────────
class DogMapPin(BaseModel):
    id: str
    code: str
    name: str
    photo_url: str
    area: str
    lat: float
    lng: float
    health_status: str
    temperature_c: float
    activity_score: int
    battery_percent: int
    last_seen_minutes_ago: int
    is_geofenced_safe: bool
    inferred_state: str = "resting"

    class Config:
        from_attributes = True
