"""
Telemetry & Audio Ingestion API (from ESP32 Smart Collar)
POST /api/v1/telemetry    – JSON sensor data (GPS, MPU-6050, temperature, battery)
POST /api/v1/bark-audio   – WAV binary file upload (INMP441 microphone)
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Dog, Alert, TrailPoint
from schemas.telemetry import TelemetryPayload, TelemetryResponse
from services.ai_service import ai_service
from config import UPLOAD_DIR

router = APIRouter(prefix="/api/v1", tags=["ESP32 Telemetry"])


@router.post("/telemetry", response_model=TelemetryResponse)
async def ingest_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    """
    Receives JSON telemetry from the ESP32 collar every few seconds.
    Updates the dog's live status and runs AI anomaly checks.
    """
    # Find dog by collar_mac, collar_id, or dog_id
    dog = None
    collar_key = payload.collar_mac or payload.collar_id
    if payload.dog_id:
        dog = db.query(Dog).filter(Dog.id == payload.dog_id).first()
    if not dog and collar_key:
        dog = db.query(Dog).filter(
            (Dog.collar_hardware_id == collar_key) | (Dog.id == collar_key)
        ).first()

    if not dog:
        # Unknown collar — still store telemetry but don't crash
        return TelemetryResponse(status="received", message="Unknown collar, data logged")

    alert_triggered = False
    alert_type_str = None

    # ── Update live dog fields ───────────────────────────────────────────────
    dog.battery_percent = payload.battery_percent
    dog.temperature_c = payload.temperature_c
    dog.activity_score = payload.activity_score
    dog.last_seen_minutes_ago = 0
    dog.last_update_timestamp = datetime.utcnow().isoformat()

    lat_val = payload.coordinates.lat if payload.coordinates else payload.lat
    lng_val = payload.coordinates.lng if payload.coordinates else payload.lng

    if lat_val is not None and lng_val is not None:
        dog.lat = lat_val
        dog.lng = lng_val
        if payload.coordinates:
            dog.accuracy_meters = payload.coordinates.accuracy_meters
        # Save breadcrumb
        trail = TrailPoint(
            dog_id=dog.id,
            timestamp=datetime.utcnow().strftime("%I:%M %p"),
            label="Live Update",
            x=0, y=0,
            lat=lat_val,
            lng=lng_val,
        )
        db.add(trail)

    # ── AI: Temperature check ────────────────────────────────────────────────
    temp_result = ai_service.check_temperature(payload.temperature_c)
    if temp_result["alert"]:
        alert_triggered = True
        alert_type_str = "High Temperature / Fever"
        dog.health_status = "Under Observation"
        alert = Alert(
            id=str(uuid.uuid4()),
            dog_id=dog.id,
            dog_name=dog.name,
            dog_code=dog.code,
            severity=temp_result["severity"],
            alert_type="High Temperature / Fever",
            diagnostic=temp_result["message"],
            sensor_source="Temp Sensor",
            status="open",
            timestamp=datetime.utcnow(),
        )
        db.add(alert)

    # ── AI: Gait anomaly check ───────────────────────────────────────────────
    if payload.movement:
        gait = ai_service.analyze_gait(payload.movement.model_dump())
        if gait["anomaly_detected"]:
            alert_triggered = True
            alert_type_str = "Limping Anomaly"
            dog.health_status = "Under Observation"
            alert = Alert(
                id=str(uuid.uuid4()),
                dog_id=dog.id,
                dog_name=dog.name,
                dog_code=dog.code,
                severity="WARNING",
                alert_type="Limping Anomaly",
                diagnostic=f"Gait asymmetry detected (RMS > {gait['rms_value']})",
                sensor_source="MPU6050",
                status="open",
                timestamp=datetime.utcnow(),
            )
            db.add(alert)

    db.commit()
    return TelemetryResponse(
        status="received",
        alert_triggered=alert_triggered,
        alert_type=alert_type_str,
        message=f"Telemetry saved for {dog.name}",
    )


@router.post("/bark-audio")
async def ingest_bark_audio(
    dog_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Receives a binary WAV file from INMP441 microphone on the ESP32 collar.
    Runs AI bark classification (YAMNet + ResNet-18) and creates an alert if distress detected.

    Expected: 16kHz, 16-bit Mono WAV, ~32KB per 1-second clip.
    """
    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav audio files are accepted")

    wav_bytes = await file.read()

    # Save audio file locally
    filename = f"{dog_id}_{uuid.uuid4().hex[:8]}.wav"
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(wav_bytes)

    # Run AI classification
    result = ai_service.classify_audio(wav_bytes)

    # Fetch dog
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    dog_name = dog.name if dog else dog_id
    dog_code = dog.code if dog else dog_id

    # Create alert for high-confidence bark events
    alert_created = False
    if result["probability"] > 0.80:
        alert = Alert(
            id=str(uuid.uuid4()),
            dog_id=dog_id,
            dog_name=dog_name,
            dog_code=dog_code,
            severity="CRITICAL" if result["probability"] > 0.90 else "WARNING",
            alert_type=result["label"],
            diagnostic=f"{result['description']} ({result['probability']*100:.1f}% prob)",
            sensor_source="INMP441",
            audio_file_url=f"/uploads/{filename}",
            status="open",
            timestamp=datetime.utcnow(),
        )
        db.add(alert)
        db.commit()
        alert_created = True

    return {
        "status": "processed",
        "file_saved": filename,
        "ai_result": result,
        "alert_created": alert_created,
    }
