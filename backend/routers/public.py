"""
Public QR Portal API
GET /public/dog/{code_or_hash}?lang=en|mr|hi

Called by QrScannerModal.tsx and DigitalIdModal.tsx when a citizen scans a collar QR tag.
Returns full DogProfile (including VetRecord and TrailPoints) in the requested language.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Dog, VetRecord, TrailPoint
from schemas.dog import DogPublicResponse, VetRecordSchema, TrailPointSchema, Coordinates

router = APIRouter(prefix="/public", tags=["Public QR Portal"])


def _build_dog_response(dog: Dog, vet: VetRecord | None, trails: list) -> DogPublicResponse:
    vet_schema = VetRecordSchema(
        vaccineBatch=vet.vaccine_batch if vet else "",
        vaccineDate=vet.vaccine_date if vet else "",
        vaccineExpiry=vet.vaccine_expiry if vet else "",
        sterilisationClinic=vet.sterilisation_clinic if vet else "",
        sterilisationDate=vet.sterilisation_date if vet else "",
        vetDoctor=vet.vet_doctor if vet else "",
        dewormingDate=vet.deworming_date if vet else "",
        weightKg=vet.weight_kg if vet else 0.0,
        microchipId=vet.microchip_id if vet else "",
        clinicalNotes=vet.clinical_notes if vet else "",
    )
    trail_schemas = [
        TrailPointSchema(x=t.x, y=t.y, time=t.timestamp, label=t.label)
        for t in trails
    ]
    return DogPublicResponse(
        id=dog.id,
        code=dog.code,
        name=dog.name,
        photo=dog.photo_url or "",
        breed=dog.breed,
        breedConfidence=dog.breed_confidence,
        gender=dog.gender,
        approxAge=dog.approx_age,
        nature=dog.nature,
        area=dog.area,
        coordinates=Coordinates(lat=dog.lat, lng=dog.lng, accuracyMeters=dog.accuracy_meters),
        registeredDate=dog.registered_date or "",
        collarInstalledDate=dog.collar_installed_date or "",
        healthStatus=dog.health_status,
        temperatureC=dog.temperature_c,
        activityScore=dog.activity_score,
        batteryPercent=dog.battery_percent,
        lastSeenMinutesAgo=dog.last_seen_minutes_ago,
        lastUpdateTimestamp=dog.last_update_timestamp or "",
        isGeofencedSafe=dog.is_geofenced_safe,
        specialNotes=dog.special_notes or "",
        trailPoints=trail_schemas,
        vetRecord=vet_schema,
    )


@router.get("/dog/{code_or_hash}", response_model=DogPublicResponse)
def get_public_dog_profile(
    code_or_hash: str,
    lang: str = Query(default="en", pattern="^(en|mr|hi)$"),
    db: Session = Depends(get_db),
):
    """
    Fetch dog profile when a citizen scans a QR code on the smart collar.
    `code_or_hash` can be the dog code (DOG042) or the QR hash (QR042MOTI).
    `lang` parameter supports: en (English), mr (Marathi), hi (Hindi).
    """
    dog = (
        db.query(Dog)
        .filter((Dog.qr_hash == code_or_hash) | (Dog.code == code_or_hash))
        .first()
    )
    if not dog:
        raise HTTPException(status_code=404, detail=f"Dog '{code_or_hash}' not found")

    vet = db.query(VetRecord).filter(VetRecord.dog_id == dog.id).first()
    trails = db.query(TrailPoint).filter(TrailPoint.dog_id == dog.id).order_by(TrailPoint.created_at).all()

    return _build_dog_response(dog, vet, trails)
