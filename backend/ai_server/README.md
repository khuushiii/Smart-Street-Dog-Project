# Dog AI Models Server

This is the FastAPI server that serves all 3 Dog AI Models for the Dog Tracking Project.

## Models Included
1. **Breed Classification** - Classifies dog breed from image (EfficientNet-B0)
2. **Bark Analysis** - Classifies barking pattern from audio (EfficientNet-B0)
3. **Movement Detection** - Detects dog movement state from MPU-6050 data (1D-CNN)

## Setup Instructions

### Step 1: Install requirements
```bash
pip install -r requirements.txt
```

### Step 2: Place model files
Make sure the following files exist:
```
models/breed/breed_classifier.pth
models/breed/breed_classes.txt
models/bark/bark_classifier.pth
models/bark/bark_classes.txt
models/movement/movement_model.pth
models/movement/movement_classes.txt
models/movement/norm_mean.npy
models/movement/norm_std.npy
```

### Step 3: Run the server
```bash
python ai_server.py
```

Server runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

## API Endpoints

### 1. Breed Classification
```
POST /predict/breed
Content-Type: multipart/form-data
Body: image file (jpg/png)
```

### 2. Bark Analysis
```
POST /predict/bark
Content-Type: multipart/form-data
Body: audio file (wav/mp3)
```

### 3. Movement Detection
```
POST /predict/movement
Content-Type: application/json
Body: {
  "readings": [
    {"ax": 16600, "ay": -476, "az": 2712, "gx": 0, "gy": 0, "gz": 0},
    ... (100 readings)
  ]
}
```

### 4. Health Check
```
GET /health
```

## Response Format (all endpoints)
```json
{
  "model": "breed_classification",
  "class_name": "Indian_Pariah",
  "display_name": "Indian Pariah",
  "confidence": 94.5,
  "all_probs": {
    "Indian_Pariah": 94.5,
    "Spitz": 3.2,
    "Mutt": 1.8,
    "Pedigree": 0.5
  }
}
```
