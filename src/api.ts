import { DogProfile, IncidentReport } from "./types"

// Dynamic API Base URL: connects to local FastAPI on port 8001 during dev,
// or custom backend URL when deployed to production (e.g. AWS).
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://smart-collar-khushi-backend-code-3.onrender.com").replace(/\/$/, "")

export interface DashboardStats {
  total_dogs: number
  active_collars: number
  open_alerts: number
  geofence_breaches: number
  vaccinated_dogs: number
  vaccinated_percent: number
}

export interface MapPin {
  id: string
  code: string
  name: string
  photo_url: string
  area: string
  lat: number
  lng: number
  health_status: string
  temperature_c: number
  activity_score: number
  battery_percent: number
  last_seen_minutes_ago: number
  is_geofenced_safe: boolean
  inferred_state?: string
}

export interface AlertItem {
  id: string
  dog_id?: string
  dog_name?: string
  dog_code?: string
  severity: "critical" | "warning" | "info"
  alert_type: string
  diagnostic: string
  sensor_source: string
  audio_file_url?: string
  status: "open" | "investigating" | "resolved"
  timestamp: string
}

/**
 * Fetch all registered dogs from Supabase through FastAPI
 */
export async function fetchLiveDogs(): Promise<DogProfile[]> {
  const res = await fetch(`${API_BASE}/api/v1/dogs`)
  if (!res.ok) throw new Error(`Failed to fetch dogs: ${res.statusText}`)
  return res.json()
}

/**
 * Fetch live KPI dashboard stats (Total dogs, Vaccinated %, Active collars, Alerts)
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`)
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`)
  return res.json()
}

/**
 * Fetch map pins for all registered dogs with coordinates
 */
export async function fetchMapDogs(): Promise<MapPin[]> {
  const res = await fetch(`${API_BASE}/api/v1/map/dogs`)
  if (!res.ok) throw new Error(`Failed to fetch map pins: ${res.statusText}`)
  return res.json()
}

/**
 * Fetch single dog public profile by dog code (e.g. DOG042)
 */
export async function fetchDogByCode(code: string, lang = "en"): Promise<DogProfile> {
  const res = await fetch(`${API_BASE}/public/dog/${code}?lang=${lang}`)
  if (!res.ok) throw new Error(`Failed to fetch dog ${code}: ${res.statusText}`)
  return res.json()
}

/**
 * Register a new dog into the database (with automatic AI breed classification if photo uploaded)
 */
export async function registerNewDog(payload: any): Promise<DogProfile> {
  const res = await fetch(`${API_BASE}/api/v1/dogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to register dog")
  }
  return res.json()
}

export interface IncidentPayload {
  dog_id: string
  dog_name?: string
  dog_code?: string
  category: string
  location?: string
  description?: string
  reporter_name: string
  reporter_phone: string
  lat?: number
  lng?: number
}

/**
 * Report citizen emergency SOS incident into Supabase
 */
export async function reportIncident(incident: IncidentPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incident),
  })
  if (!res.ok) throw new Error("Failed to report incident")
  return res.json()
}

/**
 * Fetch open alerts from database
 */
export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/alerts`)
  if (!res.ok) throw new Error("Failed to fetch alerts")
  return res.json()
}

/**
 * Fetch count of active alerts
 */
export async function fetchAlertCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/api/v1/alerts/count`)
  if (!res.ok) return 0
  const data = await res.json()
  return data.count || 0
}
