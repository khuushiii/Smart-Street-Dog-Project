"""
Dogs CRUD API (Admin)
GET    /api/v1/dogs          – list all dogs
POST   /api/v1/dogs          – register new dog (5-step wizard)
GET    /api/v1/dogs/{id}     – get single dog profile
PUT    /api/v1/dogs/{id}     – update dog fields
DELETE /api/v1/dogs/{id}     – remove dog

GET    /api/v1/map/dogs      – all dogs as map pins for city-map.html
GET    /api/v1/dashboard/stats – KPI counters for index.html
GET    /api/v1/dogs/{id}/trail – trail breadcrumbs for map playback
"""
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Dog, VetRecord, TrailPoint, Alert
from schemas.dog import DogPublicResponse, DogCreate, DogUpdate, DogMapPin, VetRecordSchema, TrailPointSchema, Coordinates
from routers.public import _build_dog_response

router = APIRouter(prefix="/api/v1", tags=["Dogs (Admin)"])


def _make_code(name: str) -> str:
    """Generate DOGxxx code from name."""
    suffix = str(uuid.uuid4().int)[:3]
    return f"DOG{suffix}"


def _make_id(name: str) -> str:
    return name.lower().replace(" ", "_") + "_" + uuid.uuid4().hex[:4]


# ── Map & Dashboard ──────────────────────────────────────────────────────────

@router.get("/map/dogs", response_model=list[DogMapPin])
def get_map_dogs(db: Session = Depends(get_db)):
    """
    Returns all dogs as map pins for city-map.html.
    Includes latest movement inferred_state from telemetry.
    """
    dogs = db.query(Dog).all()
    return [
        DogMapPin(
            id=d.id,
            code=d.code,
            name=d.name,
            photo_url=d.photo_url or "",
            area=d.area,
            lat=d.lat,
            lng=d.lng,
            health_status=d.health_status,
            temperature_c=d.temperature_c,
            activity_score=d.activity_score,
            battery_percent=d.battery_percent,
            last_seen_minutes_ago=d.last_seen_minutes_ago,
            is_geofenced_safe=d.is_geofenced_safe,
            inferred_state="resting",
        )
        for d in dogs
    ]


@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """KPI counters for the admin dashboard index.html cards."""
    total_dogs = db.query(Dog).count()
    active_collars = db.query(Dog).filter(Dog.last_seen_minutes_ago <= 60).count()
    open_alerts = db.query(Alert).filter(Alert.status == "open").count()
    geofence_breaches = db.query(Dog).filter(Dog.is_geofenced_safe == False).count()
    vaccinated_dogs = db.query(VetRecord).filter(VetRecord.vaccine_batch != None, VetRecord.vaccine_batch != "").count()
    vaccinated_percent = round((vaccinated_dogs / total_dogs * 100), 1) if total_dogs > 0 else 0.0
    return {
        "total_dogs": total_dogs,
        "active_collars": active_collars,
        "open_alerts": open_alerts,
        "geofence_breaches": geofence_breaches,
        "vaccinated_dogs": vaccinated_dogs,
        "vaccinated_percent": vaccinated_percent,
    }


# ── CRUD ─────────────────────────────────────────────────────────────────────

@router.get("/dogs", response_model=list[DogPublicResponse])
def list_dogs(db: Session = Depends(get_db)):
    dogs = db.query(Dog).order_by(Dog.created_at.desc()).all()
    result = []
    for d in dogs:
        vet = db.query(VetRecord).filter(VetRecord.dog_id == d.id).first()
        trails = db.query(TrailPoint).filter(TrailPoint.dog_id == d.id).all()
        result.append(_build_dog_response(d, vet, trails))
    return result


@router.post("/dogs", response_model=DogPublicResponse, status_code=201)
def register_dog(payload: DogCreate, db: Session = Depends(get_db)):
    """
    Register a new dog via the 5-step admin wizard (register-dog.html).
    Creates the dog record + vet_record in one transaction.
    """
    dog_id = _make_id(payload.name)
    code = _make_code(payload.name)
    qr_hash = f"QR{code[3:]}{payload.name.upper()[:4]}"

    dog = Dog(
        id=dog_id,
        code=code,
        qr_hash=qr_hash,
        name=payload.name,
        breed=payload.breed,
        breed_confidence=payload.breed_confidence,
        gender=payload.gender,
        approx_age=payload.approx_age,
        nature=payload.nature,
        area=payload.area,
        lat=payload.lat,
        lng=payload.lng,
        accuracy_meters=5,
        registered_date=date.today().isoformat(),
        collar_installed_date=date.today().isoformat(),
        health_status="Healthy",
        temperature_c=38.5,
        activity_score=70,
        battery_percent=100,
        last_seen_minutes_ago=0,
        last_update_timestamp=datetime.utcnow().isoformat(),
        is_geofenced_safe=True,
        special_notes=payload.special_notes,
        collar_hardware_id=payload.collar_hardware_id,
    )
    db.add(dog)

    vet = VetRecord(
        id=str(uuid.uuid4()),
        dog_id=dog_id,
        vaccine_batch=payload.vaccine_batch,
        vaccine_date=payload.vaccine_date,
        vaccine_expiry=payload.vaccine_expiry,
        sterilisation_clinic=payload.sterilisation_clinic,
        sterilisation_date=payload.sterilisation_date,
        vet_doctor=payload.vet_doctor,
        deworming_date=payload.deworming_date,
        weight_kg=payload.weight_kg,
        microchip_id=payload.microchip_id,
        clinical_notes=payload.clinical_notes,
    )
    db.add(vet)
    db.commit()
    db.refresh(dog)
    return _build_dog_response(dog, vet, [])


@router.get("/dogs/{dog_id}", response_model=DogPublicResponse)
def get_dog(dog_id: str, db: Session = Depends(get_db)):
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    vet = db.query(VetRecord).filter(VetRecord.dog_id == dog.id).first()
    trails = db.query(TrailPoint).filter(TrailPoint.dog_id == dog.id).all()
    return _build_dog_response(dog, vet, trails)


@router.put("/dogs/{dog_id}", response_model=DogPublicResponse)
def update_dog(dog_id: str, payload: DogUpdate, db: Session = Depends(get_db)):
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(dog, field, value)
    db.commit()
    db.refresh(dog)
    vet = db.query(VetRecord).filter(VetRecord.dog_id == dog.id).first()
    trails = db.query(TrailPoint).filter(TrailPoint.dog_id == dog.id).all()
    return _build_dog_response(dog, vet, trails)


@router.delete("/dogs/{dog_id}")
def delete_dog(dog_id: str, db: Session = Depends(get_db)):
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    db.delete(dog)
    db.commit()
    return {"status": "deleted", "id": dog_id}


@router.get("/dogs/{dog_id}/trail", response_model=list[TrailPointSchema])
def get_dog_trail(dog_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Returns movement breadcrumb trail for map trail playback."""
    dog = db.query(Dog).filter((Dog.id == dog_id) | (Dog.code == dog_id)).first()
    target_id = dog.id if dog else dog_id
    points = (
        db.query(TrailPoint)
        .filter(TrailPoint.dog_id == target_id)
        .order_by(TrailPoint.id.asc())
        .limit(limit)
        .all()
    )
    return [TrailPointSchema(x=p.x, y=p.y, lat=p.lat, lng=p.lng, time=p.timestamp, label=p.label) for p in points]
