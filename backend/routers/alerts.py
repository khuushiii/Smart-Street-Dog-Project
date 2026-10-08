"""
Alerts API
GET  /api/v1/alerts              – list alerts (with optional status filter)
GET  /api/v1/alerts/count        – count for the sidebar badge (admin dashboard)
PUT  /api/v1/alerts/{id}/resolve – mark alert resolved + dispatch rescue
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Alert

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


@router.get("/count")
def get_alert_count(status: str = "open", db: Session = Depends(get_db)):
    """Returns count for the sidebar badge number (shows 12 in admin dashboard)."""
    count = db.query(Alert).filter(Alert.status == status).count()
    return {"count": count, "status": status}


@router.get("")
def list_alerts(
    status: str | None = None,
    severity: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Admin alerts inbox (alerts-inbox.html).
    Returns: severity, alert_type, dog_id, dog_name, dog_code, diagnostic, timestamp, status.
    """
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    if severity:
        q = q.filter(Alert.severity == severity)
    alerts = q.order_by(Alert.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": a.id,
            "severity": a.severity,
            "alert_type": a.alert_type,
            "dog_id": a.dog_id,
            "dog_name": a.dog_name,
            "dog_code": a.dog_code,
            "diagnostic": a.diagnostic,
            "sensor_source": a.sensor_source,
            "audio_file_url": a.audio_file_url,
            "status": a.status,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
        }
        for a in alerts
    ]


@router.put("/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    resolved_by: str = Query(default="admin"),
    db: Session = Depends(get_db),
):
    """Dispatch rescue team / mark alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = resolved_by
    db.commit()
    return {"status": "resolved", "alert_id": alert_id, "resolved_by": resolved_by}


@router.put("/{alert_id}/investigate")
def investigate_alert(alert_id: str, db: Session = Depends(get_db)):
    """Mark alert as under investigation."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}
    alert.status = "investigating"
    db.commit()
    return {"status": "investigating", "alert_id": alert_id}
