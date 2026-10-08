"""
WebSocket endpoint for real-time telemetry streaming.
WS /ws/telemetry

Admin city-map.html connects here to receive live dog location + status updates
without polling the REST API every second.
"""
import json
import asyncio
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models import Dog

router = APIRouter(tags=["WebSocket"])

# Active WebSocket connections
_connections: Set[WebSocket] = set()


async def broadcast(message: dict):
    """Broadcast a JSON message to all connected WebSocket clients."""
    disconnected = set()
    for ws in _connections:
        try:
            await ws.send_json(message)
        except Exception:
            disconnected.add(ws)
    _connections.difference_update(disconnected)


@router.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket):
    """
    WebSocket endpoint for the admin dashboard city map.
    After connecting, the server sends a snapshot of all dogs every 5 seconds.
    Also receives telemetry push messages from the telemetry router.
    """
    await websocket.accept()
    _connections.add(websocket)
    try:
        while True:
            # Send live dog snapshot every 5 seconds
            db: Session = SessionLocal()
            try:
                dogs = db.query(Dog).all()
                snapshot = [
                    {
                        "id": d.id,
                        "code": d.code,
                        "name": d.name,
                        "lat": d.lat,
                        "lng": d.lng,
                        "health_status": d.health_status,
                        "temperature_c": d.temperature_c,
                        "activity_score": d.activity_score,
                        "battery_percent": d.battery_percent,
                        "last_seen_minutes_ago": d.last_seen_minutes_ago,
                        "is_geofenced_safe": d.is_geofenced_safe,
                    }
                    for d in dogs
                ]
            finally:
                db.close()

            await websocket.send_json({"type": "snapshot", "dogs": snapshot})

            # Wait for 5 seconds or receive a client message
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                # Clients can send {"action": "ping"} to keep alive
            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        _connections.discard(websocket)
    except Exception:
        _connections.discard(websocket)
