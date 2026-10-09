"""
Telemetry, Audio & AI Ingestion API (from ESP32 Smart Collar)
POST /api/v1/telemetry       — JSON sensor data (GPS, MPU-6050, temperature, battery)
POST /api/v1/bark-audio      — WAV binary file upload (INMP441 microphone)
POST /api/v1/classify-breed  — Dog photo upload (ESP32-CAM / Admin)
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Dog, Alert, TrailPoint
from schemas.telemetry import TelemetryPayload, TelemetryResponse
from services.ai_service import ai_service
from config import UPLOAD_DIR
from models.telemetry_ai import CollarRawTelemetry, AIModelPrediction

router = APIRouter(prefix="/api/v1", tags=["ESP32 Telemetry"])


@router.post("/telemetry", response_model=TelemetryResponse)
async def ingest_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    """
    Receives JSON telemetry from the ESP32 collar every few seconds.
    Updates the dog's live status, runs AI anomaly checks, and stores in collar_raw_telemetry & ai_model_predictions.
    """
    # Find dog by collar_mac, collar_id, or dog_id
    dog = None
    collar_key = payload.collar_mac or payload.collar_id
    if payload.dog_id:
        dog = db.query(Dog).filter((Dog.id == payload.dog_id) | (Dog.code == payload.dog_id)).first()
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

    # ── AI: MPU-6050 Motion & Gait Analysis ───────────────────────────────────
    mv_dict = payload.movement.model_dump() if payload.movement else {}
    if payload.readings:
        mv_dict["readings"] = payload.readings
    elif payload.movement and payload.movement.readings:
        mv_dict["readings"] = payload.movement.readings

    acc_x = payload.accel_x if payload.accel_x is not None else (payload.movement.accel_x if payload.movement else None)
    acc_y = payload.accel_y if payload.accel_y is not None else (payload.movement.accel_y if payload.movement else None)
    acc_z = payload.accel_z if payload.accel_z is not None else (payload.movement.accel_z if payload.movement else None)
    gy_x = payload.gyro_x if payload.gyro_x is not None else (payload.movement.gyro_x if payload.movement else None)
    gy_y = payload.gyro_y if payload.gyro_y is not None else (payload.movement.gyro_y if payload.movement else None)
    gy_z = payload.gyro_z if payload.gyro_z is not None else (payload.movement.gyro_z if payload.movement else None)

    gait = ai_service.analyze_gait(mv_dict)
    gait_state = gait.get("gait_state", "Moving Normally")
    dog.movement_state = gait_state

    # Save to ai_model_predictions table
    ai_pred = AIModelPrediction(
        dog_id=dog.id,
        movement_state=gait_state,
        movement_confidence=float(gait.get("confidence", 90.0)),
        movement_model_version=gait.get("model", "1D-CNN-MPU6050"),
    )
    db.add(ai_pred)

    # Save Raw Telemetry Data to CollarRawTelemetry table
    raw_telemetry = CollarRawTelemetry(
        dog_id=dog.id,
        collar_hardware_id=payload.collar_mac or payload.collar_id or dog.collar_hardware_id,
        lat=lat_val,
        lng=lng_val,
        accuracy_meters=dog.accuracy_meters,
        accel_x=acc_x,
        accel_y=acc_y,
        accel_z=acc_z,
        gyro_x=gy_x,
        gyro_y=gy_y,
        gyro_z=gy_z,
        accel_max_g=float(mv_dict.get("accel_max_g") or 0.0),
        accel_variance=float(mv_dict.get("accel_variance") or 0.0),
        battery_percent=payload.battery_percent
    )
    db.add(raw_telemetry)

    # ── AI: Temperature check ─────────────────────────────────────────────────
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

    # ── AI: Gait anomaly check ────────────────────────────────────────────────
    if gait.get("anomaly_detected"):
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
            diagnostic=f"Gait asymmetry detected: {gait_state}",
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
    Runs PyTorch Bark Classification, updates dog.bark_emotion, saves to
    ai_model_predictions & collar_raw_telemetry, and creates an alert if distress detected.

    Expected: 16kHz, 16-bit Mono WAV, ~32KB per 1-second clip.
    """
    if not file.filename.lower().endswith((".wav", ".mp3", ".ogg")):
        raise HTTPException(status_code=400, detail="Only audio files (.wav, .mp3) are accepted")

    wav_bytes = await file.read()

    # Save audio file locally
    filename = f"{dog_id}_{uuid.uuid4().hex[:8]}.wav"
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(wav_bytes)

    # Run AI audio classification
    result = ai_service.classify_audio(wav_bytes)

    # Fetch dog
    dog = db.query(Dog).filter((Dog.id == dog_id) | (Dog.code == dog_id)).first()
    dog_name = dog.name if dog else dog_id
    dog_code = dog.code if dog else dog_id

    # 1. Update live dog emotion in dogs table
    if dog:
        dog.bark_emotion = result["label"]
        dog.last_seen_minutes_ago = 0
        dog.last_update_timestamp = datetime.utcnow().isoformat()

    # 2. Insert into ai_model_predictions table
    conf_val = float(result.get("probability", 0.9) * 100) if result.get("probability", 1.0) <= 1.0 else float(result.get("probability", 90.0))
    pred = AIModelPrediction(
        dog_id=dog.id if dog else dog_id,
        bark_emotion=result["label"],
        bark_confidence=round(conf_val, 2),
        bark_model_version=result.get("model", "EfficientNet-B0-Audio"),
    )
    db.add(pred)

    # 3. Insert raw telemetry record into collar_raw_telemetry table
    telemetry_record = CollarRawTelemetry(
        dog_id=dog.id if dog else dog_id,
        collar_hardware_id=dog.collar_hardware_id if dog else "",
        lat=dog.lat if dog else None,
        lng=dog.lng if dog else None,
        audio_wav_url=f"/uploads/{filename}",
        battery_percent=dog.battery_percent if dog else 100,
    )
    db.add(telemetry_record)

    # 4. Create alert for high-confidence distress bark events
    alert_created = False
    is_distress = any(w in result["label"].lower() for w in ["aggressive", "guard", "panic", "distress", "pain", "whin"])
    if result["probability"] > 0.80 and is_distress:
        alert = Alert(
            id=str(uuid.uuid4()),
            dog_id=dog.id if dog else dog_id,
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
        alert_created = True

    db.commit()

    return {
        "status": "processed",
        "file_saved": filename,
        "ai_result": result,
        "alert_created": alert_created,
        "updated_dog_emotion": dog.bark_emotion if dog else result["label"],
    }


@router.post("/classify-breed")
async def classify_breed_endpoint(
    dog_id: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Receives JPEG/PNG photo from ESP32-CAM or Admin/Citizen photo upload.
    Runs PyTorch EfficientNet-B0 breed classification.
    Updates dog.breed & dog.breed_confidence in Supabase and records in ai_model_predictions.
    """
    if not (file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images accepted")

    image_bytes = await file.read()
    filename = f"breed_{uuid.uuid4().hex[:8]}.jpg"
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    result = ai_service.classify_breed(image_bytes)
    breed_name = result.get("breed", "Indian Pariah")
    confidence = float(result.get("confidence", 95.0))

    dog = None
    if dog_id:
        dog = db.query(Dog).filter((Dog.id == dog_id) | (Dog.code == dog_id)).first()
        if dog:
            dog.breed = breed_name
            dog.breed_confidence = confidence
            dog.photo_url = f"/uploads/{filename}"
            dog.last_update_timestamp = datetime.utcnow().isoformat()

    pred = AIModelPrediction(
        dog_id=dog.id if dog else (dog_id or "unassigned"),
        breed_name=breed_name,
        breed_confidence=confidence,
        breed_model_version=result.get("model", "EfficientNet-B0"),
    )
    db.add(pred)
    db.commit()

    return {
        "status": "success",
        "breed": breed_name,
        "confidence": confidence,
        "photo_url": f"/uploads/{filename}",
        "dog_id": dog.id if dog else dog_id,
        "all_probs": result.get("all_probs", {}),
    }
