"""Pydantic schemas for IncidentReport."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class IncidentCreate(BaseModel):
    """Payload sent by EmergencyModal.tsx"""
    dog_id: str
    dog_name: str = ""
    dog_code: str = ""
    category: str          # injured | aggression | lost_collar | food_water | sighting
    location: str = ""
    description: str = ""
    reporter_name: str
    reporter_phone: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class IncidentResponse(BaseModel):
    id: str
    ticket_id: str         # MGM-XXXX format
    dog_id: str
    dog_name: str
    dog_code: str
    category: str
    location: str
    description: str
    reporter_name: str
    reporter_phone: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class IncidentStatusUpdate(BaseModel):
    status: str   # dispatched | investigating | resolved
