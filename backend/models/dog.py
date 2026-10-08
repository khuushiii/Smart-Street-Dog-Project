"""SQLAlchemy ORM model for the dogs table."""
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, func
from database.database import Base


class Dog(Base):
    __tablename__ = "dogs"

    id = Column(String, primary_key=True, index=True)      # e.g. "moti"
    code = Column(String, unique=True, index=True)          # e.g. "DOG042"
    qr_hash = Column(String, unique=True, index=True)       # e.g. "QR042MOTI"
    name = Column(String, nullable=False)
    photo_url = Column(String, default="")
    breed = Column(String, default="Indian Pariah")
    breed_confidence = Column(Float, default=96.4)
    gender = Column(String, default="Male")                 # Male | Female
    approx_age = Column(String, default="2-3 years")
    nature = Column(String, default="Friendly")
    area = Column(String, default="")

    # GPS
    lat = Column(Float, default=19.8762)
    lng = Column(Float, default=75.3433)
    accuracy_meters = Column(Integer, default=5)

    # Dates
    registered_date = Column(String, default="")
    collar_installed_date = Column(String, default="")

    # Health / Telemetry
    health_status = Column(String, default="Healthy")       # HealthStatus enum
    temperature_c = Column(Float, default=38.5)
    activity_score = Column(Integer, default=70)
    battery_percent = Column(Integer, default=85)
    last_seen_minutes_ago = Column(Integer, default=2)
    last_update_timestamp = Column(String, default="")
    is_geofenced_safe = Column(Boolean, default=True)
    special_notes = Column(Text, default="")
    collar_hardware_id = Column(String, default="")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
