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

    # ── Bark / Audio Classification ──────────────────────────────────────────
    def classify_audio(self, wav_bytes: bytes) -> dict:
        """Call real PyTorch Bark Classifier or fallback to simulation."""
        url = f"{self.base_url}/predict/bark"
        try:
            files = {"file": ("audio.wav", wav_bytes, "audio/wav")}
            resp = requests.post(url, files=files, timeout=6.0)
            if resp.status_code == 200:
                data = resp.json()
                label = data.get("display_name", data.get("class_name", "Playful / Happy"))
                conf = float(data.get("confidence", 85.0))
                prob = round(conf / 100.0 if conf > 1.0 else conf, 3)
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
            ("Panic / Distress", 0.948, "Distress bark detected"),
            ("Aggressive / Guard Barking", 0.871, "Aggression / Territory bark"),
            ("Playful / Happy", 0.763, "Playful / Excited bark"),
            ("Isolation / Whining", 0.812, "Loneliness / Whining"),
        ]
        label, prob, description = random.choice(fallback_classes)
        return {
            "label": label,
            "probability": round(prob, 3),
            "description": description,
            "model": "Simulation-Fallback",
        }

    # ── Gait Anomaly & Movement Detection ────────────────────────────────────
    def analyze_gait(self, movement: dict) -> dict:
        """Call real 1D-CNN Movement Model if readings provided, or analyze IMU stats."""
        readings = movement.get("readings")
        if not readings:
            ax = float(movement.get("accel_x") or 0.0)
            ay = float(movement.get("accel_y") or 0.0)
            az = float(movement.get("accel_z") or 0.0)
            gx = float(movement.get("gyro_x") or 0.0)
            gy = float(movement.get("gyro_y") or 0.0)
            gz = float(movement.get("gyro_z") or 0.0)
            if ax != 0.0 or ay != 0.0 or az != 0.0 or gx != 0.0 or gy != 0.0 or gz != 0.0:
                readings = [{"ax": ax, "ay": ay, "az": az, "gx": gx, "gy": gy, "gz": gz}] * 10

        if readings and len(readings) >= 10:
            url = f"{self.base_url}/predict/movement"
            try:
                resp = requests.post(url, json={"readings": readings}, timeout=4.0)
                if resp.status_code == 200:
                    data = resp.json()
                    state = data.get("display_name", data.get("class_name", "Moving Normally"))
                    conf = float(data.get("confidence", 90.0))
                    anomaly = any(w in state.lower() for w in ["limping", "injured", "agitated", "erratic", "shaking"])
                    return {
                        "anomaly_detected": anomaly,
                        "rms_value": round(float(movement.get("accel_max_g") or 1.0), 3),
                        "gait_state": state,
                        "confidence": conf,
                        "model": "1D-CNN Movement (Real AI)",
                    }
            except Exception as e:
                print(f"[AIService] Movement AI call failed ({e}). Falling back to heuristic.")

        # Heuristic gait anomaly check from collar stats
        rms = float(movement.get("accel_max_g") or 1.0)
        variance = float(movement.get("accel_variance") or 0.05)
        anomaly = variance > 0.12 or rms > 2.0
        gait_state = "Possibly Injured / Limping" if anomaly else "Moving Normally"
        return {
            "anomaly_detected": anomaly,
            "rms_value": round(rms, 3),
            "gait_state": gait_state,
            "confidence": 88.0,
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
                conf = float(data.get("confidence", 90.0))
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
            ("Mixed Mutt", 83.5),
            ("Pedigree Stray", 79.1),
        ]
        breed, confidence = random.choice(breeds)
        return {
            "breed": breed,
            "confidence": round(confidence + random.uniform(-1, 1), 1),
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
