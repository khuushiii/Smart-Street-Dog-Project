# 🐾 Smart Street Dog — Comprehensive Project Documentation & Technical Guide

---

## 1. Executive Summary & Mission

**Smart Street Dog** is an IoT-enabled civic animal welfare and municipal telemetry web platform. It connects community street dogs equipped with smart GPS/health collars to citizens, veterinary volunteers, campus caretakers, and municipal authorities.

### Core Objectives:
- **Real-Time Welfare Monitoring:** Live location tracking and real-time body temperature monitoring to identify fevers or distress early.
- **Civic Engagement & Kindness:** Allows citizens to identify community dogs, understand their health status, view sterilization/vaccination records, and contact emergency helplines.
- **Municipal & Admin Management:** Restricted dashboard for veterinarians and animal welfare cells to update vaccination logs, monitor geofence alerts, and review 24-hour movement patterns.
- **Localized Access:** Seamless trilingual experience in **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)**.

---

## 2. Technical Stack & Architecture

### Core Technologies
| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.0.0` | Declarative UI, state management, component lifecycle |
| **Language** | TypeScript | `^5.7.0` | Strict typing, interface contracts, safe refactoring |
| **Build Tool & Dev Server** | Vite | `^8.0.0` | Ultra-fast HMR (Hot Module Replacement), optimized ES bundle |
| **Styling & Design System**| Tailwind CSS | `^4.0.0` | Utility classes via `@tailwindcss/vite`, zero-CSS overhead |
| **Code Formatter** | oxfmt | `^0.2.0` | High-speed code formatting |
| **Mapping & GIS** | OpenStreetMap + Custom SVG | — | Live map embedding, dynamic vector path movement trails |
| **Device APIs** | Browser Geolocation API | HTML5 | `navigator.geolocation` for real-time user GPS locking |
| **Directions** | Google Maps Universal URLs | — | 1-tap walking / driving navigation to the dog's coordinates |

---

## 3. Directory & File Structure

```
Smart Street Dog/
├── index.html                  # HTML5 entrypoint with responsive viewport & meta tags
├── package.json                # Project dependencies, scripts (dev, build, preview)
├── tsconfig.json               # TypeScript strict compilation settings
├── vite.config.ts              # Vite configuration with React & Tailwind v4 plugins
├── AGENTS.md                   # Environment rules & architecture notes for AI agents
├── README.md                   # Quick-start instructions and credential summary
├── PROJECT_DOCUMENTATION.md    # Complete technical documentation (this file)
├── public/                     # Static downloadable resources and icons
└── src/
    ├── main.tsx                # React root mount point (loads index.css and mounts App)
    ├── App.tsx                 # Core application controller & layout coordinator
    ├── index.css               # Tailwind CSS v4 import & custom styling variables
    ├── types.ts                # TypeScript interfaces (DogProfile, CollarInfo, etc.)
    ├── data/
    │   ├── dogsData.ts         # Mock IoT telemetry data, trail points, vaccination records
    │   └── translations.ts     # Trilingual dictionary (English, Marathi, Hindi)
    └── components/
        ├── AdminLoginModal.tsx # Simplified credential login modal (admin / admin123)
        ├── DigitalIdModal.tsx  # Printable QR animal ID tag modal
        ├── EmergencyModal.tsx  # SOS reporting modal & animal helpline dialer
        └── VetLogModal.tsx     # Comprehensive medical & vaccination record history
```

---

## 4. Key Components & Implementation Details

### A. Navigation & Theme Engine (`Navbar`)
- **Brand Title & Logo:** Warm earth-toned badge with puppy paw icon.
- **Language Selector:** Real-time switcher between English (`en`), Marathi (`mr`), and Hindi (`hi`).
- **Theme Switcher:** Seamless Dark / Light mode toggle utilizing warm amber/earth palette tokens (`#784920`, `#faf6f1`, `#1c1007`).
- **Admin Portal Trigger:** Dynamically renders **"🔐 Admin Portal"** for public visitors, or **"● Admin Session"** with a **"🚪 Log Out"** button when authenticated.

### B. Dog Profile Banner (`DogProfileCard`)
- **AI Breed Recognition:** Displays detected breed with AI model confidence score (e.g., *Indian Pariah Dog • 94% confidence*).
- **Health Badges:** Dynamic status tag color-coded by medical severity (*Healthy* = Green, *Under Observation* = Amber, *Medical Recovery* = Blue, *Geofence Warning* = Red).
- **Quick Actions:** Instant access to the **"🏷️ View Digital ID"** and **"Medical Log →"** modals.

### C. Balanced About & Health Overview (`AboutAndHealth`)
- **About This Dog:** Clean 3-column card displaying **Approx. Age** (2–3 Years), **Gender** (Male ♂ / Female ♀), and **Primary Territory Area** (e.g., JNEC Campus).
- **Health Telemetry:** 
  - Real-time **Body Temperature (°C)** reading with automatic fever alerts (Normal: $\le 39.0^\circ\text{C}$, Elevated: $> 39.0^\circ\text{C}$).
  - **"🔄 Sync Collar"** action button simulating real-time telemetry fetch with animated spinner and last-updated timer.

### D. Live Map & 24-Hour Movement Trail (`LiveMapSection`)
- **Live Satellite / OpenStreetMap Mode:**
  - Embeds real OpenStreetMap iframe centered exactly on latitude & longitude (`currentLat`, `currentLng`).
  - **"📍 My Device GPS" Button:** Uses HTML5 `navigator.geolocation.getCurrentPosition()` to detect the user's real smartphone/laptop location and display accuracy radius ($\pm X\text{m}$).
  - **"🧭 Open in Google Maps":** Launches turn-by-turn navigation directly in Google Maps.
  - **"📋 Copy Coordinates":** Copies precise latitude and longitude to clipboard.
- **🐾 24-Hour Movement Trail Mode:**
  - Toggled with the **`🐾 24h Trail`** button in the map header.
  - Renders a custom vector SVG map tracking the dog's actual path across 6 major daily checkpoints.
  - **Automated Playback:** Includes `▶ Play Trail` / `⏸ Pause` controls stepping through daily waypoints every 1.2 seconds with an animated, pulsing dog marker.
  - **Interactive 24h Timeline:** Clickable checkpoint pills (`06:00 Gate 1`, `09:30 Hostel mess`, `12:15 Canteen porch`, `15:00 Sports complex`, `17:45 Auditorium`, `19:30 Current`). Clicking any stop jumps the pin immediately to that location.
- **Telemetry Footer Strip:** Real-time GPS Accuracy, Last Seen timestamp, and collar coordinates.

### E. Smart Collar & Emergency Help (`CollarEmergency`)
- **Hardware Telemetry:** Battery percentage indicator (with low-battery warning), installation date, firmware version, and unique collar hardware UUID.
- **Emergency Helpline:** Prominently displays municipal helpline number (`+91 98221 45789`) and opens the Emergency SOS reporting modal.

### F. Modals System
1. **Admin Login Modal (`AdminLoginModal.tsx`):**
   - Clean, credential-based authentication.
   - Defaults to **Username:** `admin`, **Password:** `admin123`.
   - On submission, verifies credentials and transitions the UI into Admin Mode.
2. **Digital ID Card Modal (`DigitalIdModal.tsx`):**
   - Generates an official civic animal ID badge with QR code, municipal registration number, sterilization status, and vaccination tags.
3. **Emergency Rescue Modal (`EmergencyModal.tsx`):**
   - Citizen reporting form for sick, injured, or aggressive dogs. Includes 1-tap emergency calling (`tel:+919822145789`).
4. **Medical & Vet Log Modal (`VetLogModal.tsx`):**
   - Comprehensive veterinary ledger showing past vaccines (Anti-Rabies, DHPPi booster, Deworming), attending veterinarian names, and upcoming booster due dates.

---

## 5. IoT Smart Collar Architecture (Hardware Concepts)

In a real-world deployment, the software interfaces with an IoT animal tracking collar through the following architecture:

```
┌────────────────────────────────────────────────────────┐
│               Smart Animal Collar Hardware             │
│  - GPS / GNSS Module (u-blox MAX-M10S)                 │
│  - Temperature Sensor (Digital Contact Thermistor)     │
│  - 3-Axis Accelerometer (Activity & Rest detection)    │
│  - Solar Trickle Charger + 800mAh LiPo Battery        │
│  - Microcontroller (ESP32-S3 or Nordic nRF9160)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                 LTE-M / NB-IoT / LoRaWAN
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Cloud Backend API                    │
│  - Ingests telemetry packets (lat, lng, temp, batt)    │
│  - Stores waypoints in TimescaleDB / PostgreSQL GIS    │
│  - Evaluates geofence breaches & triggers SMS alerts   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│          Smart Street Dog Web Portal (This App)        │
│  - Real-time OpenStreetMap & SVG Trail Playback        │
│  - Citizen QR scanning & ID card verification          │
│  - Restricted municipal admin dashboard                │
└────────────────────────────────────────────────────────┘
```

---

## 6. How to Integrate Your Separate Admin Dashboard Later

Because you already have a separate admin dashboard built, follow this integration roadmap when you are ready to combine them:

1. **Shared Authentication (Single Sign-On / JWT):**
   - In `src/components/AdminLoginModal.tsx`, replace the local `setTimeout` credential check with an HTTP `POST` to your backend auth API:
     ```ts
     const response = await fetch("https://your-api.com/api/admin/login", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ username, password }),
     });
     const { token } = await response.json();
     localStorage.setItem("admin_token", token);
     ```
2. **Dashboard Redirect or Embedded Route:**
   - Once authenticated, you can either:
     - Redirect to your existing admin dashboard URL: `window.location.href = "https://your-admin-dashboard.com?token=" + token;`
     - Or embed your existing dashboard components inside React using a tabbed route (e.g. `/admin`).
3. **Database Sharing:**
   - Connect the `DogProfile` data structure in `src/types.ts` directly to your database tables (`dogs`, `vaccinations`, `gps_pings`).

---

## 7. Development & Deployment Commands

```bash
# 1. Install all dependencies
npm install

# 2. Start local development server (Vite HMR)
npm run dev

# 3. Compile and build production bundle
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Format code with oxfmt
npm run format
```

---

## 8. Presentation & Viva Talking Points

If presenting this project to evaluators, faculty, or municipal officials:
- **The Civic Problem:** Unmonitored street dogs often suffer from untreated illnesses, missed rabies boosters, or displacement, causing human-dog conflicts.
- **The Technological Solution:** A lightweight IoT telemetry web app that bridges community care with municipal tracking.
- **Key Innovations:**
  - Zero-lag 24h movement trail playback to understand territory habits.
  - Instant browser-based GPS locking so citizens can guide rescue teams accurately.
  - Multi-tier access: Public citizen view (safe, informative, SOS) vs. Authenticated admin portal (medical management).
  - Trilingual design ensuring grassroots accessibility across Maharashtra and India.
