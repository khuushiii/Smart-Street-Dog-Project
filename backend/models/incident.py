"""SQLAlchemy ORM model for incident_reports table."""
from sqlalchemy import Column, String, Text, DateTime, func
from database.database import Base


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(String, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)  # e.g. "MGM-4231"
    dog_id = Column(String, nullable=False)
    dog_name = Column(String, default="")
    dog_code = Column(String, default="")

    # category: injured | aggression | lost_collar | food_water | sighting
    category = Column(String, nullable=False)
    location = Column(String, default="")
    description = Column(Text, default="")
    reporter_name = Column(String, default="")
    reporter_phone = Column(String, default="")

    # status: dispatched | investigating | resolved
    status = Column(String, default="dispatched")
    timestamp = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
