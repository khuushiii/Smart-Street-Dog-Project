"""
AI Service Integration
----------------------
Connects SmartDog Backend to the real PyTorch AI Server (dog-ai-server):
  - POST /predict/breed    -> EfficientNet-B0 Dog Breed Classifier
  - POST /predict/bark     -> EfficientNet-B0 Audio Spectrogram Bark Classifier
  - POST /predict/movement -> 1D-CNN MPU-6050 Motion & Gait Classifier

Includes automatic graceful fallback if the AI server is offline.
"""
import os
import random
import requests
from config import AI_SERVICE_URL


class AIService:
    def __init__(self, base_url: str = AI_SERVICE_URL):
        self.base_url = base_url.rstrip("/")

    # ── Bark / Audio Classification ─────────────────────────────────────────
    def classify_audio(self, wav_bytes: bytes) -> dict:
        """Call real PyTorch Bark Classifier or fallback to simulation."""
        url = f"{self.base_url}/predict/bark"
        try:
            files = {"file": ("audio.wav", wav_bytes, "audio/wav")}
            resp = requests.post(url, files=files, timeout=6.0)
            if resp.status_code == 200:
                data = resp.json()
                label = data.get("display_name", data.get("class_name", "Barking Detected"))
                prob = round(data.get("confidence", 85.0) / 100.0, 3)
                return {
                    "label": label,
                    "probability": prob,
                    "description": f"Real-time AI classified: {label}",
                    "model": "EfficientNet-B0 (Real AI)",
                    "all_probs": data.get("all_probs", {}),
                }
        except Exception as e:
            print(f"[AIService] Bark AI server call failed ({e}). Falling back to simulation.")

        # Fallback simulation
        fallback_classes = [
            ("Distress Barking", 0.948, "Pain Bark (Simulated)"),
            ("Aggressive Barking", 0.871, "Aggression / Territory (Simulated)"),
            ("Playful Bark", 0.763, "Playful / Excited (Simulated)"),
            ("Howling", 0.812, "Loneliness / Night Call (Simulated)"),
        ]
        label, prob, description = random.choice(fallback_classes)
        return {
            "label": label,
            "probability": round(prob + random.uniform(-0.05, 0.05), 3),
            "description": description,
            "model": "Simulation-Fallback",
        }

    # ── Gait Anomaly & Movement Detection ────────────────────────────────────
    def analyze_gait(self, movement: dict) -> dict:
        """Call real 1D-CNN Movement Model if readings provided, or analyze IMU stats."""
        # If raw MPU-6050 readings are included in movement payload
        readings = movement.get("readings")
        if readings and len(readings) >= 10:
            url = f"{self.base_url}/predict/movement"
            try:
                resp = requests.post(url, json={"readings": readings}, timeout=4.0)
                if resp.status_code == 200:
                    data = resp.json()
                    state = data.get("class_name", "resting").lower()
                    conf = data.get("confidence", 90.0)
                    anomaly = state in ["abnormal", "limping", "shaking"]
                    return {
                        "anomaly_detected": anomaly,
                        "rms_value": round(movement.get("accel_max_g", 1.0), 3),
                        "gait_state": state,
                        "confidence": conf,
                        "model": "1D-CNN Movement (Real AI)",
                    }
            except Exception as e:
                print(f"[AIService] Movement AI call failed ({e}). Falling back to heuristic.")

        # Heuristic gait anomaly check from collar stats
        rms = movement.get("accel_max_g", 1.0)
        variance = movement.get("accel_variance", 0.05)
        anomaly = variance > 0.12 or rms > 2.0
        return {
            "anomaly_detected": anomaly,
            "rms_value": round(rms, 3),
            "gait_state": "limping" if anomaly else movement.get("inferred_state", "normal"),
            "model": "Statistical-Heuristic",
        }

    # ── Breed Classification ─────────────────────────────────────────────────
    def classify_breed(self, image_bytes: bytes) -> dict:
        """Call real EfficientNet-B0 Breed Classifier or fallback."""
        url = f"{self.base_url}/predict/breed"
        try:
            files = {"file": ("dog.jpg", image_bytes, "image/jpeg")}
            resp = requests.post(url, files=files, timeout=6.0)
            if resp.status_code == 200:
                data = resp.json()
                breed = data.get("display_name", data.get("class_name", "Indian Pariah"))
                conf = data.get("confidence", 90.0)
                return {
                    "breed": breed,
                    "confidence": conf,
                    "model": "EfficientNet-B0 (Real AI)",
                    "all_probs": data.get("all_probs", {}),
                }
        except Exception as e:
            print(f"[AIService] Breed AI call failed ({e}). Falling back to simulation.")

        # Fallback simulation
        breeds = [
            ("Indian Pariah", 96.4),
            ("Indian Spitz", 91.2),
            ("Labrador Mix", 83.5),
            ("German Shepherd Mix", 79.1),
        ]
        breed, confidence = random.choice(breeds)
        return {
            "breed": breed,
            "confidence": round(confidence + random.uniform(-3, 3), 1),
            "model": "Simulation-Fallback",
        }

    # ── Temperature Alert ────────────────────────────────────────────────────
    def check_temperature(self, temp_c: float) -> dict:
        """Check if temperature reading indicates fever."""
        if temp_c > 40.0:
            return {"alert": True, "severity": "CRITICAL", "message": f"Fever detected: {temp_c}°C"}
        elif temp_c > 39.5:
            return {"alert": True, "severity": "WARNING", "message": f"Elevated temperature: {temp_c}°C"}
        return {"alert": False, "severity": None, "message": "Normal"}


# Singleton instance
ai_service = AIService()
