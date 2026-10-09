"""
SmartDog Backend – Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartdog.db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "smartdog-secret-key-for-dev-only-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# CORS origins for local development & Vercel production
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://localhost:8443",
    "http://127.0.0.1:8443",
    "https://smart-street-dog-project-updated.vercel.app",
    "https://smart-street-dog-project.vercel.app",
    "*",
    "null",
]

# AI Service connection (FastAPI Dog AI Server)
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")
