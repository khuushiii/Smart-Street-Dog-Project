"""Pydantic schemas for AdminUser."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "staff"          # super_admin | admin | staff | vet
    department: str = "AMC Vet Dept"


class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AdminUserResponse
