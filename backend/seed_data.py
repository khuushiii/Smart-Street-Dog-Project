"""
Seed Data – Pre-populates the SmartDog SQLite database with demo data
matching the frontend's CAMPUS_DOGS data from Smart-Street-Dog/src/data/dogsData.ts
and the dog pins shown in city-map.html.

Run once: python seed_data.py
"""
import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.database import SessionLocal, engine
from models import Dog, VetRecord, IncidentReport, AdminUser, Alert, TrailPoint
from database.database import Base
from utils.auth import hash_password
from datetime import datetime

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def seed():
    # ── Clear existing data ─────────────────────────────────────────────────
    for model in [Alert, IncidentReport, TrailPoint, VetRecord, Dog, AdminUser]:
        db.query(model).delete()
    db.commit()

    # ── Admin Users ──────────────────────────────────────────────────────────
    admin = AdminUser(
        id=str(uuid.uuid4()),
        name="Ashish Joshi",
        email="admin@amc.gov.in",
        hashed_password=hash_password("admin123"),
        role="super_admin",
        department="AMC Vet Dept",
        is_active=True,
    )
    vet_staff = AdminUser(
        id=str(uuid.uuid4()),
        name="Dr. Priya Sharma",
        email="vet@amc.gov.in",
        hashed_password=hash_password("vet123"),
        role="vet",
        department="Animal Welfare",
        is_active=True,
    )
    db.add_all([admin, vet_staff])

    # ── Dogs ─────────────────────────────────────────────────────────────────
    dogs_data = [
        {
            "id": "moti",
            "code": "DOG042",
            "qr_hash": "QR042MOTI",
            "name": "Moti",
            "breed": "Indian Pariah",
            "breed_confidence": 96.4,
            "gender": "Male",
            "approx_age": "3-4 years",
            "nature": "Friendly but cautious",
            "area": "Kranti Chowk",
            "lat": 19.8758,
            "lng": 75.3437,
            "health_status": "Under Observation",
            "temperature_c": 39.8,
            "activity_score": 45,
            "battery_percent": 73,
            "last_seen_minutes_ago": 2,
            "is_geofenced_safe": False,
            "special_notes": "Distress bark detected 2 mins ago. Rescue team alerted.",
            "collar_hardware_id": "ESP32-COLLAR-8042",
            "registered_date": "2026-03-15",
            "collar_installed_date": "2026-03-15",
        },
        {
            "id": "sheru",
            "code": "DOG117",
            "qr_hash": "QR117SHER",
            "name": "Sheru",
            "breed": "Indian Pariah",
            "breed_confidence": 94.2,
            "gender": "Male",
            "approx_age": "5-6 years",
            "nature": "Gentle, loves children",
            "area": "Waluj MIDC",
            "lat": 19.8521,
            "lng": 75.2933,
            "health_status": "Under Observation",
            "temperature_c": 40.2,
            "activity_score": 30,
            "battery_percent": 58,
            "last_seen_minutes_ago": 15,
            "is_geofenced_safe": True,
            "special_notes": "Fever detected. ABC sterilisation completed Jan 2026.",
            "collar_hardware_id": "ESP32-COLLAR-8117",
            "registered_date": "2026-01-10",
            "collar_installed_date": "2026-01-10",
        },
        {
            "id": "kalu",
            "code": "DOG089",
            "qr_hash": "QR089KALU",
            "name": "Kalu",
            "breed": "Indian Pariah",
            "breed_confidence": 91.7,
            "gender": "Male",
            "approx_age": "2-3 years",
            "nature": "Shy, avoids strangers",
            "area": "Satara Parisar",
            "lat": 19.8610,
            "lng": 75.3280,
            "health_status": "Medical Recovery",
            "temperature_c": 38.9,
            "activity_score": 35,
            "battery_percent": 82,
            "last_seen_minutes_ago": 42,
            "is_geofenced_safe": False,
            "special_notes": "Limping gait detected. Under vet observation.",
            "collar_hardware_id": "ESP32-COLLAR-8089",
            "registered_date": "2026-02-20",
            "collar_installed_date": "2026-02-20",
        },
        {
            "id": "tyson",
            "code": "DOG099",
            "qr_hash": "QR099TYSO",
            "name": "Tyson",
            "breed": "Labrador Mix",
            "breed_confidence": 83.5,
            "gender": "Male",
            "approx_age": "4-5 years",
            "nature": "Energetic, playful",
            "area": "Railway Station Road",
            "lat": 19.8762,
            "lng": 75.3192,
            "health_status": "Healthy",
            "temperature_c": 38.4,
            "activity_score": 88,
            "battery_percent": 91,
            "last_seen_minutes_ago": 8,
            "is_geofenced_safe": True,
            "special_notes": "Previously abandoned pet. Vaccinated and sterilised.",
            "collar_hardware_id": "ESP32-COLLAR-8099",
            "registered_date": "2026-04-05",
            "collar_installed_date": "2026-04-05",
        },
        {
            "id": "simba",
            "code": "DOG143",
            "qr_hash": "QR143SIMB",
            "name": "Simba",
            "breed": "Indian Spitz",
            "breed_confidence": 89.3,
            "gender": "Male",
            "approx_age": "1-2 years",
            "nature": "Very friendly, community favourite",
            "area": "Delhi Gate / Begumpura",
            "lat": 19.8891,
            "lng": 75.3371,
            "health_status": "Healthy",
            "temperature_c": 38.1,
            "activity_score": 92,
            "battery_percent": 97,
            "last_seen_minutes_ago": 5,
            "is_geofenced_safe": True,
            "special_notes": "Community favourite near Delhi Gate temple.",
            "collar_hardware_id": "ESP32-COLLAR-8143",
            "registered_date": "2026-05-12",
            "collar_installed_date": "2026-05-12",
        },
        {
            "id": "tommy",
            "code": "DOG251",
            "qr_hash": "QR251TOMM",
            "name": "Tommy",
            "breed": "Indian Pariah",
            "breed_confidence": 97.1,
            "gender": "Female",
            "approx_age": "3-4 years",
            "nature": "Calm, well-behaved",
            "area": "Seven Hills / Garkheda",
            "lat": 19.8689,
            "lng": 75.3512,
            "health_status": "Healthy",
            "temperature_c": 38.3,
            "activity_score": 75,
            "battery_percent": 88,
            "last_seen_minutes_ago": 12,
            "is_geofenced_safe": True,
            "special_notes": "Mother of 3 pups. Pups registered separately.",
            "collar_hardware_id": "ESP32-COLLAR-8251",
            "registered_date": "2026-03-28",
            "collar_installed_date": "2026-03-28",
        },
        {
            "id": "rocky",
            "code": "DOG190",
            "qr_hash": "QR190ROCK",
            "name": "Rocky",
            "breed": "German Shepherd Mix",
            "breed_confidence": 79.1,
            "gender": "Male",
            "approx_age": "6-7 years",
            "nature": "Protective of territory",
            "area": "CIDCO N-8 (Prozone)",
            "lat": 19.8823,
            "lng": 75.3621,
            "health_status": "Healthy",
            "temperature_c": 38.6,
            "activity_score": 65,
            "battery_percent": 76,
            "last_seen_minutes_ago": 3,
            "is_geofenced_safe": True,
            "special_notes": "Senior dog. Annual deworming due Oct 2026.",
            "collar_hardware_id": "ESP32-COLLAR-8190",
            "registered_date": "2026-01-22",
            "collar_installed_date": "2026-01-22",
        },
    ]

    vet_data = {
        "moti":  ("RBV-2026-A12", "2026-01-15", "2027-01-15", "SPCA Aurangabad", "2026-01-16", "Dr. Mehta", "2026-07-10", 18.5, "982009102488042", "Pain bark history. Monitor closely."),
        "sheru": ("RBV-2026-B07", "2025-11-20", "2026-11-20", "AMC City Clinic",  "2025-11-21", "Dr. Kale",  "2026-05-20", 22.1, "982009102488117", "Fever episodes. Deworming done."),
        "kalu":  ("RBV-2026-C03", "2026-02-10", "2027-02-10", "AMC City Clinic",  "2026-02-11", "Dr. Patil", "2026-08-11", 16.8, "982009102488089", "Limping left hind leg. Physiotherapy ongoing."),
        "tyson": ("RBV-2026-D18", "2026-03-05", "2027-03-05", "SPCA Aurangabad", "2026-03-06", "Dr. Mehta", "2026-09-05", 27.3, "982009102488099", "Healthy. Well-socialized."),
        "simba": ("RBV-2026-E22", "2026-04-18", "2027-04-18", "AMC East Clinic",  "2026-04-19", "Dr. Sharma","2026-10-18", 9.2,  "982009102488143", "Young pup. First vaccine cycle complete."),
        "tommy": ("RBV-2026-F09", "2026-02-25", "2027-02-25", "AMC City Clinic",  "2026-02-26", "Dr. Kale",  "2026-08-25", 15.4, "982009102488251", "Mother dog. Post-whelping health check done."),
        "rocky": ("RBV-2026-G01", "2025-10-12", "2026-10-12", "SPCA Aurangabad", "2025-10-13", "Dr. Mehta", "2026-04-12", 29.7, "982009102488190", "Senior dog. Arthritis signs. Monthly monitoring."),
    }

    trail_data = {
        "moti": [
            (19.8650, 75.3180, "06:30 AM", "Near Railway Station", 100, 192),
            (19.8700, 75.3310, "08:15 AM", "Usmanpura Square", 180, 240),
            (19.8758, 75.3437, "11:45 AM", "Kranti Chowk Market", 240, 288),
            (19.8820, 75.3350, "02:30 PM", "City Chowk", 320, 250),
            (19.8758, 75.3437, "04:20 PM", "Current - Kranti Chowk", 400, 216),
        ],
        "sheru": [
            (19.8450, 75.2850, "07:00 AM", "Pandharpur Outskirts", 60, 140),
            (19.8500, 75.2900, "09:30 AM", "Waluj Sector 1", 80, 160),
            (19.8550, 75.2960, "12:00 PM", "Bajaj Nagar Corner", 110, 180),
            (19.8521, 75.2933, "03:15 PM", "Current - Waluj MIDC", 150, 200),
        ],
        "kalu": [
            (19.8550, 75.3350, "08:00 AM", "Beed Bypass Intersection", 280, 380),
            (19.8600, 75.3310, "10:30 AM", "Satara Parisar Ring Road", 300, 400),
            (19.8640, 75.3410, "01:15 PM", "Darga Road", 320, 410),
            (19.8610, 75.3280, "03:45 PM", "Current - Satara Parisar", 350, 420),
        ],
        "tyson": [
            (19.8710, 75.3240, "07:30 AM", "Usmanpura South", 200, 210),
            (19.8750, 75.3200, "10:00 AM", "Station Road Flyover", 220, 220),
            (19.8780, 75.3310, "01:30 PM", "Nirala Bazar Park", 250, 230),
            (19.8762, 75.3192, "04:00 PM", "Current - Railway Station Road", 270, 240),
        ],
        "simba": [
            (19.8980, 75.3420, "06:00 AM", "Himayat Bagh Garden", 420, 100),
            (19.8920, 75.3310, "09:15 AM", "Begumpura Lane", 440, 120),
            (19.8891, 75.3371, "12:45 PM", "Current - Delhi Gate", 460, 140),
        ],
        "tommy": [
            (19.8610, 75.3540, "08:30 AM", "Gajanan Maharaj Temple", 500, 300),
            (19.8640, 75.3580, "11:00 AM", "Garkheda Parisar", 520, 320),
            (19.8689, 75.3512, "02:15 PM", "Current - Seven Hills", 550, 340),
        ],
        "rocky": [
            (19.8790, 75.3590, "07:45 AM", "Jalna Road CIDCO Flyover", 580, 260),
            (19.8850, 75.3680, "10:30 AM", "Prozone Mall Perimeter", 620, 280),
            (19.8823, 75.3621, "01:20 PM", "Current - CIDCO N-8", 650, 300),
        ],
    }

    for d in dogs_data:
        dog = Dog(**d, last_update_timestamp=datetime.utcnow().isoformat(), photo_url="")
        db.add(dog)

        if d["id"] in vet_data:
            vb, vd, ve, sc, sd, doc, dew, wt, mc, cn = vet_data[d["id"]]
            vet = VetRecord(
                id=str(uuid.uuid4()),
                dog_id=d["id"],
                vaccine_batch=vb, vaccine_date=vd, vaccine_expiry=ve,
                sterilisation_clinic=sc, sterilisation_date=sd, vet_doctor=doc,
                deworming_date=dew, weight_kg=wt, microchip_id=mc, clinical_notes=cn,
            )
            db.add(vet)

        if d["id"] in trail_data:
            for lat, lng, ts, label, x, y in trail_data[d["id"]]:
                tp = TrailPoint(dog_id=d["id"], timestamp=ts, label=label, x=x, y=y,
                                lat=lat, lng=lng)
                db.add(tp)

    # ── Seed Alerts ─────────────────────────────────────────────────────────
    alerts = [
        Alert(id=str(uuid.uuid4()), dog_id="rocky", dog_name="Rocky", dog_code="DOG190",
              severity="CRITICAL", alert_type="High Temperature / Fever",
              diagnostic="Fever detected: 41.2°C", sensor_source="NTC Temp Sensor", status="open",
              timestamp=datetime.utcnow()),
        Alert(id=str(uuid.uuid4()), dog_id="moti", dog_name="Moti", dog_code="DOG042",
              severity="CRITICAL", alert_type="Distress Barking",
              diagnostic="Pain Bark (94.8% prob)", sensor_source="INMP441 Microphone", status="open",
              timestamp=datetime.utcnow()),
        Alert(id=str(uuid.uuid4()), dog_id="sheru", dog_name="Sheru", dog_code="DOG117",
              severity="WARNING", alert_type="High Temperature / Fever",
              diagnostic="Trembling / Fever (40.2°C)", sensor_source="NTC Temp Sensor", status="open",
              timestamp=datetime.utcnow()),
        Alert(id=str(uuid.uuid4()), dog_id="kalu", dog_name="Kalu", dog_code="DOG089",
              severity="WARNING", alert_type="Limping Anomaly",
              diagnostic="Gait asymmetry detected (RMS > 3.4)", sensor_source="MPU6050 Motion Sensor", status="open",
              timestamp=datetime.utcnow()),
        Alert(id=str(uuid.uuid4()), dog_id="tyson", dog_name="Tyson", dog_code="DOG099",
              severity="CRITICAL", alert_type="Geofence Breach",
              diagnostic="Out of safe boundary (Zone B). Distance: 4.2 km", sensor_source="GPS Telemetry", status="open",
              timestamp=datetime.utcnow()),
    ]
    db.add_all(alerts)

    # ── Seed Incident Reports ────────────────────────────────────────────────
    incidents = [
        IncidentReport(id=str(uuid.uuid4()), ticket_id="MGM-4231", dog_id="moti",
                       dog_name="Moti", dog_code="DOG042", category="injured",
                       location="Kranti Chowk, Near Bank", description="Dog appears injured near left leg.",
                       reporter_name="Rahul Sharma", reporter_phone="9822145789", status="dispatched",
                       timestamp=datetime.utcnow()),
    ]
    db.add_all(incidents)

    db.commit()
    db.close()
    print("[OK] Seed data inserted successfully!")
    print("   Admin login:  admin@amc.gov.in  /  admin123")
    print("   Vet login:    vet@amc.gov.in    /  vet123")
    print(f"   {len(dogs_data)} dogs, {len(alerts)} alerts, {len(incidents)} incidents seeded.")


if __name__ == "__main__":
    seed()
