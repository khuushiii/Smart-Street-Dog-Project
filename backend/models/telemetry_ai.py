from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class CollarRawTelemetry(Base):
    __tablename__ = 'collar_raw_telemetry'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dog_id = Column(String(100), ForeignKey('dogs.id', ondelete='CASCADE'))
    collar_hardware_id = Column(String(100), default='')
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    accuracy_meters = Column(Integer, default=5)
    accel_x = Column(Float, nullable=True)
    accel_y = Column(Float, nullable=True)
    accel_z = Column(Float, nullable=True)
    gyro_x = Column(Float, nullable=True)
    gyro_y = Column(Float, nullable=True)
    gyro_z = Column(Float, nullable=True)
    accel_max_g = Column(Float, nullable=True)
    accel_variance = Column(Float, nullable=True)
    audio_wav_url = Column(Text, default='')
    battery_percent = Column(Integer, default=100)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class AIModelPrediction(Base):
    __tablename__ = 'ai_model_predictions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dog_id = Column(String(100), ForeignKey('dogs.id', ondelete='CASCADE'))
    breed_name = Column(String(100), default='Indian Pariah')
    breed_confidence = Column(Float, default=96.4)
    breed_model_version = Column(String(50), default='EfficientNet-B0')
    bark_emotion = Column(String(100), default='Playful / Happy')
    bark_confidence = Column(Float, default=90.0)
    bark_model_version = Column(String(50), default='EfficientNet-B0-Audio')
    movement_state = Column(String(100), default='Moving Normally')
    movement_confidence = Column(Float, default=90.0)
    movement_model_version = Column(String(50), default='1D-CNN-MPU6050')
    created_at = Column(DateTime(timezone=True), server_default=func.now())