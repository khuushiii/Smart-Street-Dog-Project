"""SQLAlchemy ORM model for alerts table."""
from sqlalchemy import Column, String, Text, DateTime, func
from database.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    dog_id = Column(String, nullable=False)
    dog_name = Column(String, default="")
    dog_code = Column(String, default="")

    # severity: CRITICAL | WARNING | INFO
    severity = Column(String, default="WARNING")

    # alert_type: Distress Barking | High Temperature | Limping Anomaly | Geofence Breach | Low Battery
    alert_type = Column(String, nullable=False)
    diagnostic = Column(String, default="")
    sensor_source = Column(String, default="")   # INMP441 | MPU6050 | GPS | Temp Sensor
    audio_file_url = Column(Text, default="")

    # status: open | investigating | resolved
    status = Column(String, default="open")
    timestamp = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
