# 🐾 Smart Street Dog — IoT Collar & Civic Animal Welfare Portal

A modern, responsive civic animal welfare web application designed for monitoring smart-collared community street dogs. Includes real-time collar telemetry, 24-hour movement trail replay, live OpenStreetMap & device GPS integration, emergency rescue reporting, digital animal ID cards, and a restricted admin portal.

---

## 🚀 Quick Start (Running in Antigravity or Locally)

### 1. Open in Antigravity IDE
Simply open this project directory in **Antigravity**. The development environment will recognize `AGENTS.md` and `package.json` automatically.

### 2. Run Locally via Terminal
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The app will be available at:
`http://localhost:5173` (or the port shown in your terminal).

---

## 🔑 Admin Portal Credentials
- **Username:** `admin`
- **Password:** `admin123`

Logging in activates the administrative session, enabling care updates, medical logs, and municipal telemetry controls.

---

## 🌟 Key Features

1. **Live GPS & Device Location:**
   - Real OpenStreetMap integration centered on the dog's exact coordinates.
   - 1-Click **"📍 My Device GPS"** to locate yourself relative to the dog.
   - Direct turn-by-turn walking / driving directions via Google Maps.
   - Quick-copy GPS coordinates button.

2. **🐾 24-Hour Movement Trail Playback:**
   - Visual path tracking with animated dog marker.
   - **Play / Pause** automated playback stepping through daily waypoints every 1.2 seconds.
   - Interactive horizontal waypoint timeline scrubber (`06:00 Gate 1`, `09:30 Hostel mess`, `12:15 Canteen porch`, `15:00 Sports complex`, `17:45 Auditorium`, `19:30 Current`).

3. **Collar IoT Telemetry:**
   - Real-time battery status & temperature readings.
   - Active sync button simulating collar ping.
   - Hardware ID & sensor health.

4. **Digital Animal ID & Medical History:**
   - Official municipal QR digital tag modal.
   - Sterilization and vaccination records (Rabies, DHPPi, Deworming).
   - Veterinary logs and notes.

5. **Emergency SOS & Helpline:**
   - 1-tap call to Animal Welfare Helpline (+91 98221 45789).
   - Quick injury and distress reporting form.

6. **UI & Internationalization:**
   - Full dark mode and light mode with earthy palette.
   - English, मराठी (Marathi), and हिंदी (Hindi) language support.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Compatibility:** Antigravity IDE, standard Node.js / pnpm toolchain
