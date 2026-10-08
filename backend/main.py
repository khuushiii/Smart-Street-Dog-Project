"""
SmartDog Backend – FastAPI Application Entry Point
===================================================
Aurangabad Municipal Corporation | Smart Street Dog IoT & AI System

Endpoints:
  Public (Citizen / QR Scan):
    GET  /public/dog/{code_or_hash}?lang=en|mr|hi

  Telemetry (ESP32 Collar):
    POST /api/v1/telemetry
    POST /api/v1/bark-audio

  Incidents (EmergencyModal):
    POST /api/v1/incidents
    GET  /api/v1/incidents
    PUT  /api/v1/incidents/{id}

  Dogs (Admin CRUD):
    GET/POST       /api/v1/dogs
    GET/PUT/DELETE /api/v1/dogs/{id}
    GET            /api/v1/dogs/{id}/trail

  Map & Dashboard:
    GET /api/v1/map/dogs
    GET /api/v1/dashboard/stats

  Alerts:
    GET /api/v1/alerts
    GET /api/v1/alerts/count
    PUT /api/v1/alerts/{id}/resolve
    PUT /api/v1/alerts/{id}/investigate

  Auth:
    POST /auth/admin/login
    GET  /auth/me

  Admin Users:
    GET/POST   /api/v1/admin-users
    DELETE     /api/v1/admin-users/{id}

  WebSocket:
    WS /ws/telemetry

  Docs:
    GET /docs     – Swagger UI
    GET /redoc    – ReDoc
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import ALLOWED_ORIGINS, UPLOAD_DIR
from database import Base, engine
from models import Dog, VetRecord, IncidentReport, AdminUser, Alert, TrailPoint  # noqa: F401 – ensure all models are registered

from routers import (
    public_router,
    incidents_router,
    telemetry_router,
    dogs_router,
    alerts_router,
    auth_router,
    admin_users_router,
    ws_router,
)

# ── App factory ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="SmartDog API",
    description=(
        "Backend API for the QR Code Based Smart Collar for Street Dogs System. "
        "Serves both the React citizen portal and the HTML5/JS admin dashboard. "
        "Ingests IoT telemetry from ESP32 smart collars."
    ),
    version="1.0.0",
    contact={"name": "Aurangabad Municipal Corporation", "email": "smartdog@amc.gov.in"},
    license_info={"name": "MIT"},
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving (uploaded dog photos & WAV files) ────────────────────
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(public_router)
app.include_router(incidents_router)
app.include_router(telemetry_router)
app.include_router(dogs_router)
app.include_router(alerts_router)
app.include_router(auth_router)
app.include_router(admin_users_router)
app.include_router(ws_router)


# ── Startup: create tables ────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables verified / created.")


# ── Root health check ─────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "SmartDog API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "public_qr_scan": "GET /public/dog/{code_or_hash}?lang=en",
            "esp32_telemetry": "POST /api/v1/telemetry",
            "esp32_audio": "POST /api/v1/bark-audio",
            "incidents": "POST /api/v1/incidents",
            "dogs": "GET /api/v1/dogs",
            "map_pins": "GET /api/v1/map/dogs",
            "dashboard": "GET /api/v1/dashboard/stats",
            "alerts": "GET /api/v1/alerts",
            "alert_count": "GET /api/v1/alerts/count",
            "admin_login": "POST /auth/admin/login",
            "websocket": "WS /ws/telemetry",
        },
    }
