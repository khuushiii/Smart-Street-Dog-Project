"""
Add New Sample Data Script
==========================
Inserts brand-new records into all 6 backend database tables:
  1. Dog (`DOG301` / Bruno)
  2. VetRecord (Vaccine, Clinic, RFID for Bruno)
  3. TrailPoints (GPS movement points for Bruno)
  4. Alert (Critical Geofence Breach for Bruno)
  5. IncidentReport (`MGM-9999` emergency ticket)
  6. AdminUser (Officer Sunita Deshmukh)

Run: python add_sample_data.py
"""
import uuid
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from database.database import SessionLocal
from models import Dog, VetRecord, IncidentReport, AdminUser, Alert, TrailPoint
from utils.auth import hash_password

def add_new_sample_data():
    db = SessionLocal()
    try:
        # 1. Add New Dog: Bruno (DOG301)
        dog_id = "bruno"
        dog_code = "DOG301"
        qr_hash = "QR301BRUN"

        # Check if Bruno already exists, if so delete to make script re-runnable
        db.query(Alert).filter(Alert.dog_id == dog_id).delete()
        db.query(IncidentReport).filter(IncidentReport.dog_id == dog_id).delete()
        db.query(TrailPoint).filter(TrailPoint.dog_id == dog_id).delete()
        db.query(VetRecord).filter(VetRecord.dog_id == dog_id).delete()
        db.query(Dog).filter(Dog.id == dog_id).delete()
        db.query(AdminUser).filter(AdminUser.email == "sunita@amc.gov.in").delete()
        db.query(IncidentReport).filter(IncidentReport.ticket_id == "MGM-9999").delete()
        db.commit()

        new_dog = Dog(
            id=dog_id,
            code=dog_code,
            qr_hash=qr_hash,
            name="Bruno",
            breed="Labrador Pariah Mix",
            breed_confidence=98.5,
            gender="Male",
            approx_age="2 years",
            nature="Playful & Guarding",
            area="Chhatrapati Sambhajinagar Central",
            lat=19.8780,
            lng=75.3400,
            accuracy_meters=4,
            registered_date="2026-10-04",
            collar_installed_date="2026-10-04",
            health_status="Under Observation",
            temperature_c=40.5,
            activity_score=94,
            battery_percent=95,
            last_seen_minutes_ago=1,
            last_update_timestamp=datetime.utcnow().isoformat(),
            is_geofenced_safe=False,
            special_notes="Geofence boundary breach detected near Central Mall. High body temperature.",
            collar_hardware_id="ESP32-COLLAR-8301",
            photo_url=""
        )
        db.add(new_dog)

        # 2. Add New Vet Record for Bruno
        vet_record = VetRecord(
            id=str(uuid.uuid4()),
            dog_id=dog_id,
            vaccine_batch="RBV-2026-Z99",
            vaccine_date="2026-09-01",
            vaccine_expiry="2027-09-01",
            sterilisation_clinic="AMC Sambhajinagar Veterinary Center",
            sterilisation_date="2026-09-02",
            vet_doctor="Dr. Sunita Deshmukh",
            deworming_date="2026-09-15",
            weight_kg=24.5,
            microchip_id="982009102488301",
            clinical_notes="Newly registered collar. High activity level. Monitor hydration."
        )
        db.add(vet_record)

        # 3. Add Trail Points for Bruno
        trail1 = TrailPoint(
            dog_id=dog_id,
            timestamp="04:00 PM",
            label="Central Bus Stand",
            x=150.0,
            y=200.0,
            lat=19.8760,
            lng=75.3380
        )
        trail2 = TrailPoint(
            dog_id=dog_id,
            timestamp="06:30 PM",
            label="Current - Near Central Mall (BREACH)",
            x=480.0,
            y=310.0,
            lat=19.8780,
            lng=75.3400
        )
        db.add_all([trail1, trail2])

        # 4. Add New Alert for Bruno
        new_alert = Alert(
            id=str(uuid.uuid4()),
            dog_id=dog_id,
            dog_name="Bruno",
            dog_code=dog_code,
            severity="CRITICAL",
            alert_type="Geofence Breach & High Fever",
            diagnostic="Out of safe boundary (Zone B). Body Temp 40.5°C",
            sensor_source="GPS + DS18B20 Temp",
            status="open",
            timestamp=datetime.utcnow()
        )
        db.add(new_alert)

        # 5. Add New Incident Report
        new_incident = IncidentReport(
            id=str(uuid.uuid4()),
            ticket_id="MGM-9999",
            dog_id=dog_id,
            dog_name="Bruno",
            dog_code=dog_code,
            category="geofence_breach",
            location="Chhatrapati Sambhajinagar Central, Near Mall Gate 2",
            description="Dog strayed outside designated campus geofence boundary with elevated temperature.",
            reporter_name="Security Guard Vikram",
            reporter_phone="9822998877",
            status="dispatched",
            timestamp=datetime.utcnow()
        )
        db.add(new_incident)

        # 6. Add New Admin User
        new_admin = AdminUser(
            id=str(uuid.uuid4()),
            name="Dr. Sunita Deshmukh",
            email="sunita@amc.gov.in",
            hashed_password=hash_password("sunita123"),
            role="vet_officer",
            department="AMC Animal Welfare & Medical Response",
            is_active=True
        )
        db.add(new_admin)

        db.commit()

        print("[SUCCESS] New Sample Data inserted into ALL 6 database tables!")
        print("  - Dog Added        : Bruno (DOG301)")
        print("  - Vet Record Added : Microchip #982009102488301")
        print("  - Trail Points     : 2 Movement Waypoints")
        print("  - Alert Added      : Critical Geofence Breach & Fever (40.5°C)")
        print("  - Incident Ticket  : MGM-9999")
        print("  - Admin User Added : sunita@amc.gov.in / sunita123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to insert sample data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_new_sample_data()
