# =============================================================
# ai_server.py
# =============================================================
# FastAPI server that serves all 3 Dog AI Models:
#   1. /predict/breed    - Dog Breed Classification (EfficientNet-B0)
#   2. /predict/bark     - Bark Pattern Analysis    (EfficientNet-B0)
#   3. /predict/movement - Movement Detection       (1D-CNN)
#
# Run with: python ai_server.py
# Server starts at: http://localhost:8000
# API Docs at:      http://localhost:8000/docs
# =============================================================

import os
import io
import csv
import math
import random
import numpy as np
import torch
import torch.nn as nn
import uvicorn
import librosa
import librosa.display
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from torchvision import models, transforms
from PIL import Image

# ── APP SETUP ─────────────────────────────────────────────────
app = FastAPI(
    title="Dog AI Models Server",
    description="Serves Breed Classification, Bark Analysis, and Movement Detection AI models.",
    version="1.0.0"
)

# Allow React frontend (any origin) to call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MODEL PATHS ───────────────────────────────────────────────
BREED_MODEL_PATH    = "models/breed/breed_classifier.pth"
BREED_CLASSES_PATH  = "models/breed/breed_classes.txt"
PRESENCE_MODEL_PATH = "models/breed/presence_gate.pth"

BARK_MODEL_PATH     = "models/bark/bark_classifier.pth"
BARK_CLASSES_PATH   = "models/bark/bark_classes.txt"

MOVEMENT_MODEL_PATH = "models/movement/movement_model.pth"
MOVEMENT_CLASSES_PATH = "models/movement/movement_classes.txt"
MOVEMENT_MEAN_PATH  = "models/movement/norm_mean.npy"
MOVEMENT_STD_PATH   = "models/movement/norm_std.npy"

DEVICE = torch.device("cpu")

# ── FRONTEND DISPLAY NAMES ────────────────────────────────────
MOVEMENT_DISPLAY = {
    "Normal_Gait"       : "Moving Normally",
    "Limping_Injury"    : "Possibly Injured / Limping",
    "Resting_Posture"   : "Resting / Sleeping",
    "Erratic_Agitation" : "Agitated / Needs Attention",
}

BARK_DISPLAY = {
    "Aggressive_Guard"  : "Aggressive / Guard Barking",
    "Panic_Distress"    : "Panic / Distress",
    "Playful_Happy"     : "Playful / Happy",
    "Isolation_Whine"   : "Isolation / Whining",
}

# ─────────────────────────────────────────────────────────────
# MODEL 3: 1D-CNN for Movement Detection
# ─────────────────────────────────────────────────────────────
class Motion1DCNN(nn.Module):
    def __init__(self, num_classes=4, num_channels=6):
        super(Motion1DCNN, self).__init__()
        self.block1 = nn.Sequential(
            nn.Conv1d(num_channels, 32, kernel_size=5, padding=2),
            nn.BatchNorm1d(32), nn.ReLU(), nn.MaxPool1d(2), nn.Dropout(0.2))
        self.block2 = nn.Sequential(
            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.BatchNorm1d(64), nn.ReLU(), nn.MaxPool1d(2), nn.Dropout(0.2))
        self.block3 = nn.Sequential(
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128), nn.ReLU(), nn.AdaptiveAvgPool1d(1), nn.Dropout(0.3))
        self.classifier = nn.Sequential(
            nn.Flatten(), nn.Linear(128, 64), nn.ReLU(),
            nn.Dropout(0.3), nn.Linear(64, num_classes))

    def forward(self, x):
        return self.classifier(self.block3(self.block2(self.block1(x))))


# ─────────────────────────────────────────────────────────────
# LOAD ALL MODELS AT STARTUP
# ─────────────────────────────────────────────────────────────
breed_model    = None
presence_model = None
breed_classes  = []

bark_model   = None
bark_classes = []

movement_model   = None
movement_classes = []
movement_mean    = 0.0
movement_std     = 1.0


def load_classes(path):
    with open(path, "r") as f:
        return [line.strip() for line in f.readlines()]


@app.on_event("startup")
def load_all_models():
    global breed_model, presence_model, breed_classes
    global bark_model, bark_classes
    global movement_model, movement_classes, movement_mean, movement_std

    print("=" * 55)
    print("  Loading AI Models...")
    print("=" * 55)

    # ── BREED MODEL ──────────────────────────────────────────
    try:
        breed_classes = load_classes(BREED_CLASSES_PATH)
        breed_model = models.efficientnet_b0(weights=None)
        breed_model.classifier[1] = nn.Linear(
            breed_model.classifier[1].in_features, len(breed_classes))
        breed_model.load_state_dict(
            torch.load(BREED_MODEL_PATH, map_location=DEVICE, weights_only=True))
        breed_model.eval()

        if os.path.exists(PRESENCE_MODEL_PATH):
            presence_model = models.mobilenet_v2(weights=None)
            presence_model.classifier[1] = nn.Linear(
                presence_model.classifier[-1].in_features, 2)
            presence_model.load_state_dict(
                torch.load(PRESENCE_MODEL_PATH, map_location=DEVICE, weights_only=True))
            presence_model.eval()

        print(f"  Breed Model loaded. Classes: {breed_classes}")
    except Exception as e:
        print(f"  [WARNING] Breed model not loaded: {e}")

    # ── BARK MODEL ───────────────────────────────────────────
    try:
        bark_classes = load_classes(BARK_CLASSES_PATH)
        bark_model = models.efficientnet_b0(weights=None)
        bark_model.classifier[1] = nn.Linear(
            bark_model.classifier[1].in_features, len(bark_classes))
        bark_model.load_state_dict(
            torch.load(BARK_MODEL_PATH, map_location=DEVICE, weights_only=True))
        bark_model.eval()
        print(f"  Bark Model loaded. Classes: {bark_classes}")
    except Exception as e:
        print(f"  [WARNING] Bark model not loaded: {e}")

    # ── MOVEMENT MODEL ───────────────────────────────────────
    try:
        movement_classes = load_classes(MOVEMENT_CLASSES_PATH)
        movement_mean    = float(np.load(MOVEMENT_MEAN_PATH)[0])
        movement_std     = float(np.load(MOVEMENT_STD_PATH)[0])
        movement_model   = Motion1DCNN(num_classes=len(movement_classes))
        movement_model.load_state_dict(
            torch.load(MOVEMENT_MODEL_PATH, map_location=DEVICE, weights_only=True))
        movement_model.eval()
        print(f"  Movement Model loaded. Classes: {movement_classes}")
    except Exception as e:
        print(f"  [WARNING] Movement model not loaded: {e}")

    print("=" * 55)
    print("  All models loaded! Server is ready.")
    print("=" * 55)


# ─────────────────────────────────────────────────────────────
# ENDPOINT 1: Breed Classification
# POST /predict/breed
# Input : Image file (jpg/png)
# Output: breed name + confidence
# ─────────────────────────────────────────────────────────────
@app.post("/predict/breed")
async def predict_breed(file: UploadFile = File(...)):
    if breed_model is None:
        raise HTTPException(status_code=503, detail="Breed model not loaded.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        tensor = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = breed_model(tensor)
            probs  = torch.softmax(output, dim=1)[0]
            pred   = torch.argmax(probs).item()

        class_name  = breed_classes[pred]
        confidence  = round(probs[pred].item() * 100, 2)
        all_probs   = {breed_classes[i]: round(probs[i].item() * 100, 2)
                       for i in range(len(breed_classes))}

        return JSONResponse({
            "model"       : "breed_classification",
            "class_name"  : class_name,
            "display_name": class_name.replace("_", " "),
            "confidence"  : confidence,
            "all_probs"   : all_probs
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ENDPOINT 2: Bark Analysis
# POST /predict/bark
# Input : Audio file (wav/mp3)
# Output: bark type + confidence
# ─────────────────────────────────────────────────────────────
@app.post("/predict/bark")
async def predict_bark(file: UploadFile = File(...)):
    if bark_model is None:
        raise HTTPException(status_code=503, detail="Bark model not loaded.")

    try:
        audio_bytes = await file.read()
        audio_buf   = io.BytesIO(audio_bytes)
        y, sr       = librosa.load(audio_buf, sr=22050, duration=5.0)

        # Generate Mel Spectrogram
        mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_db   = librosa.power_to_db(mel_spec, ref=np.max)

        fig, ax = plt.subplots(figsize=(2.24, 2.24), dpi=100)
        ax.axis("off")
        librosa.display.specshow(mel_db, sr=sr, ax=ax)
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
        plt.close(fig)
        buf.seek(0)
        image = Image.open(buf).convert("RGB")

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        tensor = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = bark_model(tensor)
            probs  = torch.softmax(output, dim=1)[0]
            pred   = torch.argmax(probs).item()

        class_name   = bark_classes[pred]
        display_name = BARK_DISPLAY.get(class_name, class_name)
        confidence   = round(probs[pred].item() * 100, 2)
        all_probs    = {bark_classes[i]: round(probs[i].item() * 100, 2)
                        for i in range(len(bark_classes))}

        return JSONResponse({
            "model"       : "bark_analysis",
            "class_name"  : class_name,
            "display_name": display_name,
            "confidence"  : confidence,
            "all_probs"   : all_probs
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ENDPOINT 3: Movement Detection
# POST /predict/movement
# Input : JSON body with list of 100 MPU-6050 readings
# Output: movement state + confidence
#
# Request body format:
# {
#   "readings": [
#     {"ax": 16600, "ay": -476, "az": 2712, "gx": 0, "gy": 0, "gz": 0},
#     ... (100 readings total)
#   ]
# }
# ─────────────────────────────────────────────────────────────
class MPUReading(BaseModel):
    ax: float
    ay: float
    az: float
    gx: float = 0.0
    gy: float = 0.0
    gz: float = 0.0

class MovementRequest(BaseModel):
    readings: List[MPUReading]


@app.post("/predict/movement")
async def predict_movement(request: MovementRequest):
    if movement_model is None:
        raise HTTPException(status_code=503, detail="Movement model not loaded.")

    readings = request.readings
    if len(readings) < 10:
        raise HTTPException(status_code=400,
            detail=f"Need at least 10 readings. Got {len(readings)}.")

    # If less than 100 readings, pad with repetition
    while len(readings) < 100:
        readings = readings + readings
    readings = readings[:100]

    try:
        window = [[r.ax, r.ay, r.az, r.gx, r.gy, r.gz] for r in readings]
        arr    = np.array(window, dtype=np.float32)
        arr    = (arr - movement_mean) / (movement_std + 1e-8)
        tensor = torch.tensor(arr.T).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            output = movement_model(tensor)
            probs  = torch.softmax(output, dim=1)[0]
            pred   = torch.argmax(probs).item()

        class_name   = movement_classes[pred]
        display_name = MOVEMENT_DISPLAY.get(class_name, class_name)
        confidence   = round(probs[pred].item() * 100, 2)
        all_probs    = {movement_classes[i]: round(probs[i].item() * 100, 2)
                        for i in range(len(movement_classes))}

        return JSONResponse({
            "model"       : "movement_detection",
            "class_name"  : class_name,
            "display_name": display_name,
            "confidence"  : confidence,
            "all_probs"   : all_probs
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# HEALTH CHECK ENDPOINT
# GET /health
# ─────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status"         : "running",
        "breed_model"    : "loaded" if breed_model   else "not loaded",
        "bark_model"     : "loaded" if bark_model    else "not loaded",
        "movement_model" : "loaded" if movement_model else "not loaded",
    }


@app.get("/")
def root():
    return {
        "message"   : "Dog AI Models Server is running!",
        "endpoints" : {
            "breed"    : "POST /predict/breed    - Upload dog image",
            "bark"     : "POST /predict/bark     - Upload audio file",
            "movement" : "POST /predict/movement - Send 100 MPU-6050 readings",
            "health"   : "GET  /health           - Check model status",
            "docs"     : "GET  /docs             - Full API documentation"
        }
    }


# ─────────────────────────────────────────────────────────────
# RUN SERVER
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print()
    print("=" * 60)
    print("  DOG AI SERVER IS READY!")
    print("  Test in your browser at:")
    print("  http://localhost:8000/docs")
    print("=" * 60)
    print()
    uvicorn.run("ai_server:app", host="0.0.0.0", port=8000, reload=False)
