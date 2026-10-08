# 🐾 Smart Collar System - All-In-One Integrated Repository

> **Complete system containing:**
> 1. **FastAPI Backend Server** (Port 8001)
> 2. **PyTorch AI Models Server** (Port 8000) inside /ai_server
> 3. **Supabase PostgreSQL Cloud Database** integration

---

## 🏗️ Architecture & Data Flow

`
   [ React Frontend (Citizen & Admin) ]
                  │
                  ▼ (REST APIs)
     [ FastAPI Backend ] (Port 8001)
         │           │
         │           ▼ (Internal HTTP calls)
         │    [ PyTorch AI Server ] (Port 8000)
         │    • Dog Breed Classifier (EfficientNet-B0)
         │    • Bark Emotion Classifier (Spectrograms)
         │    • Movement Anomaly Detector (1D-CNN)
         ▼
[ Supabase PostgreSQL Cloud Database ]
  • dogs, alerts, incident_reports, vet_records, admin_users, trail_points
`

---

## 🚀 Setup Guide for Frontend Developers & Collaborators

### 1. Clone this Repository
`ash
git clone https://github.com/Aarya1525/Smart_collar_backend.git
cd Smart_collar_backend
`

### 2. Configure Environment (.env)
1. Create a .env file from the template:
   `cmd
   copy .env.example .env
   `
2. Open .env and replace YOUR_PASSWORD_HERE with our shared Supabase database password (contact Aarya for the password).

---

### 3. Install Dependencies
`cmd
pip install -r requirements.txt
pip install psycopg2-binary requests
cd ai_server
pip install -r requirements.txt
cd ..
`

---

### 4. Run the Services

#### 🪟 Terminal 1: Start Backend (Port 8001)
`cmd
python -m uvicorn main:app --port 8001 --reload
`
- **API Docs (Swagger UI):** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Base URL for React Frontend:** http://127.0.0.1:8001

#### 🪟 Terminal 2: Start AI Model Server (Port 8000)
`cmd
cd ai_server
python -m uvicorn ai_server:app --port 8000 --reload
`
- **AI Docs (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🌐 How Frontend Connects to this Backend
Your React frontend only needs to call http://127.0.0.1:8001:

- **Get all dogs:** GET http://127.0.0.1:8001/api/v1/dogs
- **Get specific dog profile:** GET http://127.0.0.1:8001/public/dog/{dog_code}
- **Register dog / Upload photo:** POST http://127.0.0.1:8001/api/v1/dogs
  *(Backend automatically calls the AI breed classifier and saves result to Supabase)*
- **Report incident:** POST http://127.0.0.1:8001/api/v1/incidents
- **View alerts:** GET http://127.0.0.1:8001/api/v1/alerts

---

## 🗄️ Database Credentials & Preloaded Data
The Supabase PostgreSQL cloud database already has:
- **7 Seeded Dogs:** Sheru, Moti, Tyson, Rocky, Simba, Kalu, Tommy
- **Sample alerts & GPS telemetry**
- **Default Admin Login:** dmin@amc.gov.in / dmin123
- **Default Vet Login:** et@amc.gov.in / et123
