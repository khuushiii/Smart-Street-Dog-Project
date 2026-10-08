"""SQLAlchemy ORM model for admin_users table."""
from sqlalchemy import Column, String, Boolean, DateTime, func
from database.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff")          # super_admin | admin | staff | vet
    department = Column(String, default="AMC Vet Dept")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime, nullable=True)
