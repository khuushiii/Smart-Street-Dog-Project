"""
Admin Users API (admin-users.html)
GET    /api/v1/admin-users         – list all staff users
POST   /api/v1/admin-users         – create a new staff user
DELETE /api/v1/admin-users/{id}    – deactivate a staff user
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AdminUser
from schemas.admin_user import AdminUserCreate, AdminUserResponse
from utils.auth import hash_password

router = APIRouter(prefix="/api/v1/admin-users", tags=["Admin Users"])


@router.get("", response_model=list[AdminUserResponse])
def list_admin_users(db: Session = Depends(get_db)):
    return db.query(AdminUser).filter(AdminUser.is_active == True).all()


@router.post("", response_model=AdminUserResponse, status_code=201)
def create_admin_user(payload: AdminUserCreate, db: Session = Depends(get_db)):
    existing = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = AdminUser(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        department=payload.department,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def deactivate_admin_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"status": "deactivated", "id": user_id}
