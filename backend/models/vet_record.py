"""SQLAlchemy ORM model for vet_records table."""
from sqlalchemy import Column, String, Float, Text, ForeignKey
from database.database import Base


class VetRecord(Base):
    __tablename__ = "vet_records"

    id = Column(String, primary_key=True)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False)

    vaccine_batch = Column(String, default="")
    vaccine_date = Column(String, default="")
    vaccine_expiry = Column(String, default="")
    sterilisation_clinic = Column(String, default="")
    sterilisation_date = Column(String, default="")
    vet_doctor = Column(String, default="")
    deworming_date = Column(String, default="")
    weight_kg = Column(Float, default=0.0)
    microchip_id = Column(String, default="")
    clinical_notes = Column(Text, default="")
