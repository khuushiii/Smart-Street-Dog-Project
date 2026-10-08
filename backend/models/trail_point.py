"""SQLAlchemy model for trail_points (movement breadcrumb history)."""
from sqlalchemy import Column, String, Float, Integer, DateTime, func
from database.database import Base


class TrailPoint(Base):
    __tablename__ = "trail_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dog_id = Column(String, nullable=False, index=True)
    timestamp = Column(String, default="")
    label = Column(String, default="")
    x = Column(Float, default=0.0)    # SVG map coordinate X
    y = Column(Float, default=0.0)    # SVG map coordinate Y
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
