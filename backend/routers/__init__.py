from routers.public import router as public_router
from routers.incidents import router as incidents_router
from routers.telemetry import router as telemetry_router
from routers.dogs import router as dogs_router
from routers.alerts import router as alerts_router
from routers.auth import router as auth_router
from routers.admin_users import router as admin_users_router
from routers.websocket import router as ws_router

__all__ = [
    "public_router", "incidents_router", "telemetry_router",
    "dogs_router", "alerts_router", "auth_router",
    "admin_users_router", "ws_router",
]
