"""
Incidents API
POST /api/v1/incidents        – citizen submits emergency report (EmergencyModal.tsx)
GET  /api/v1/incidents        – admin lists all incident reports
PUT  /api/v1/incidents/{id}   – admin updates incident status
"""
import uuid
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import IncidentReport
from schemas.incident import IncidentCreate, IncidentResponse, IncidentStatusUpdate

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])


def _generate_ticket_id() -> str:
    """Generate MGM-XXXX ticket ID (server-side, for proper tracking)."""
    return f"MGM-{random.randint(1000, 9999)}"


@router.post("", response_model=IncidentResponse, status_code=201)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """
    Citizen submits an emergency report via EmergencyModal.tsx.
    Returns a ticket_id (MGM-XXXX format) that is shown to the citizen.
    """
    incident = IncidentReport(
        id=str(uuid.uuid4()),
        ticket_id=_generate_ticket_id(),
        dog_id=payload.dog_id,
        dog_name=payload.dog_name,
        dog_code=payload.dog_code,
        category=payload.category,
        location=payload.location,
        description=payload.description,
        reporter_name=payload.reporter_name,
        reporter_phone=payload.reporter_phone,
        status="open",
        timestamp=datetime.utcnow(),
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=list[IncidentResponse])
def list_incidents(
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Admin: list incident reports, optionally filtered by status."""
    q = db.query(IncidentReport)
    if status:
        q = q.filter(IncidentReport.status == status)
    return q.order_by(IncidentReport.timestamp.desc()).limit(limit).all()


@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db),
):
    """Admin: update incident status (dispatched → investigating → resolved)."""
    incident = db.query(IncidentReport).filter(IncidentReport.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident.status = payload.status
    if payload.status == "resolved":
        incident.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)
    return incident
