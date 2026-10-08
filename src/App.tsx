import { useState, useEffect, useRef } from "react"
import { CAMPUS_DOGS } from "./data/dogsData"
import { TRANSLATIONS } from "./data/translations"
import { DogProfile, Language, ViewMode } from "./types"
import { EmergencyModal } from "./components/EmergencyModal"
import { DigitalIdModal } from "./components/DigitalIdModal"
import { QrScannerModal } from "./components/QrScannerModal"
import { VetDetailsModal } from "./components/VetDetailsModal"
import { AdminPortal } from "./components/AdminPortal"
import { AdminLoginModal } from "./components/AdminLoginModal"

// ─── design tokens ────────────────────────────────────────────────────────────
const T = {
  // palette
  brown:      "#784920",
  rust:       "#764a2f",
  beige:      "#dbc8ad",
  warmGray:   "#bebbbd",
  coolGray:   "#bcc7cf",
  // surfaces
  bgLight:    "#faf6f1",
  bgDark:     "#110a04",
  cardLight:  "#ffffff",
  cardDark:   "#1c1007",
  // borders
  bLight:     "#ede5d8",
  bDark:      "#2e1a0a",
  // text
  tLight:     "#2c1a0e",
  tDark:      "#f0e6d8",
  mLight:     "#8a6a50",
  mDark:      "#a07858",
  // sub-accent
  subLight:   "#784920",
  subDark:    "#c8a070",
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const NavIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M5 12.55a11 11 0 0114.08 0"/>
    <path d="M1.42 9a16 16 0 0121.16 0"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
)
const BatteryIcon = ({ dark, percent }: { dark: boolean; percent: number }) => {
  const isLow = percent < 30
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <rect x="1" y="6" width="18" height="12" rx="2"/>
      <line x1="23" y1="13" x2="23" y2="11" strokeWidth={3}/>
      <rect
        x="3"
        y="8"
        width={Math.max(2, Math.round((percent / 100) * 14))}
        height="8"
        rx="1"
        fill={isLow ? "#dc2626" : dark ? T.subDark : T.brown}
        stroke="none"
      />
    </svg>
  )
}
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const DogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .336-3.5 2.112-3.5 4.201v4.799a9 9 0 0018 0v-4.799c0-2.089-1.5-3.865-3.5-4.201C15.577 2.679 14 3.782 14 5.172V9H10V5.172z"/>
    <path d="M9 17v-3M15 17v-3"/>
  </svg>
)
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const RunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

// ─── Real-Time GIS Map & 24h Trail rendered below via Leaflet OpenStreetMap ──

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({
  dark,
  lang,
  viewMode,
  onAdminClick,
  onLogout,
}: {
  dark: boolean
  lang: Language
  viewMode: ViewMode
  onAdminClick: () => void
  onLogout: () => void
}) {
  const t = TRANSLATIONS[lang]
  const bg     = dark ? T.cardDark : T.cardLight
  const border = dark ? T.bDark    : T.bLight
  const chipBg = dark ? "#2a1608"  : "#f5ede0"
  const chipBd = dark ? T.bDark    : T.beige

  return (
    <nav style={{ background: bg, borderBottom: `1px solid ${border}` }} className="sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* logo + branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(145deg, ${T.brown}, ${T.rust})` }}
          >
            <span className="text-[19px]">🐾</span>
          </div>
          <div className="leading-none">
            <p className="text-[14px] font-700 tracking-tight" style={{ color: T.brown }}>
              {t.brandTitle}
            </p>
            <p className="text-[11px] font-400 mt-0.5" style={{ color: dark ? T.mDark : T.mLight }}>
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* right controls: Admin Portal Login / Exit */}
        <div className="flex items-center gap-2">
          {viewMode === "admin" ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ● Admin Session
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-xs"
                style={{
                  background: chipBg,
                  color: T.brown,
                  border: `1px solid ${chipBd}`,
                }}
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-xs hover:opacity-95"
              style={{
                background: "#784920",
                color: "#ffffff",
                border: "1px solid #784920",
              }}
            >
              <span>🔐</span>
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── ROW 1: Full-width Individual Dog Profile ─────────────────────────────────
function DogProfileCard({
  dark,
  dog,
  lang,
  onOpenDigitalId,
  onOpenVetLog,
}: {
  dark: boolean
  dog: DogProfile
  lang: Language
  onOpenDigitalId: () => void
  onOpenVetLog: () => void
}) {
  const t     = TRANSLATIONS[lang]
  const bg    = dark ? T.cardDark : T.cardLight
  const bd    = dark ? T.bDark    : T.bLight
  const text  = dark ? T.tDark    : T.tLight
  const muted = dark ? T.mDark    : T.mLight
  const faint = dark ? "#200e04"  : "#faf4ec"
  const chipBg= dark ? "#2a1608"  : "#f5ede0"
  const chipBd= dark ? T.bDark    : T.beige

  // Emotion color mapping
  const getBarkColor = (emotion?: string) => {
    switch (emotion) {
      case "Panic / Distress": return "#dc2626"
      case "Aggressive / Guard Barking": return "#d97706"
      case "Isolation / Whining": return "#8b5cf6"
      default: return "#16a34a"
    }
  }

  // Movement color mapping
  const getMovementColor = (state?: string) => {
    switch (state) {
      case "Agitated / Needs Attention": return "#dc2626"
      case "Possibly Injured / Limping": return "#d97706"
      case "Resting / Sleeping": return "#2563eb"
      default: return "#16a34a"
    }
  }

  const statItems = [
    {
      Icon: DogIcon,
      label: t.breedAi,
      value: `${dog.breed} (${dog.breedConfidence}%)`,
      valColor: text,
    },
    {
      Icon: ShieldIcon,
      label: t.vaccinationStatus,
      value: t.vaccinated,
      valColor: "#4a7c3a",
    },
    {
      Icon: ScissorsIcon,
      label: t.sterilisationStatus,
      value: t.sterilised,
      valColor: dark ? T.coolGray : "#4a6070",
    },
    {
      Icon: MicIcon,
      label: "Bark Emotion",
      value: dog.barkEmotion || "Playful / Happy",
      valColor: getBarkColor(dog.barkEmotion),
    },
    {
      Icon: RunIcon,
      label: "Movement Monitor",
      value: dog.movementState || "Moving Normally",
      valColor: getMovementColor(dog.movementState),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return { bg: "#4a7c3a", label: t.healthy }
      case "Under Observation": return { bg: "#d97706", label: t.observation }
      case "Medical Recovery": return { bg: "#2563eb", label: t.recovery }
      case "Geofence Warning": return { bg: "#dc2626", label: t.geofenceAlert }
      default: return { bg: T.brown, label: status }
    }
  }

  const statusInfo = getStatusColor(dog.healthStatus)

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-6 pb-0">
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: bg, border: `1px solid ${bd}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">

          {/* photo */}
          <div className="relative">
            <img
              src={dog.photo}
              alt={`${dog.name} – street dog at ${dog.area}`}
              className="w-full h-72 lg:h-full object-cover"
              style={{ minHeight: 290 }}
            />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-white text-[11px] font-600 px-2.5 py-1 rounded-full"
                style={{ background: T.brown, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                {t.liveBadge}
              </span>
              <button
                onClick={onOpenDigitalId}
                className="inline-flex items-center gap-1 text-[11px] font-600 px-3 py-1 rounded-full text-stone-900 bg-white/95 backdrop-blur-xs shadow-md hover:bg-white transition-all"
              >
                <span>🏷️</span> {t.viewIdCard}
              </button>
            </div>
          </div>

          {/* info */}
          <div className="p-6 lg:p-8 flex flex-col justify-between gap-5">
            {/* name + id */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-[32px] font-800 tracking-tight leading-none" style={{ color: text }}>
                      {dog.name}
                    </h1>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: chipBg, color: T.brown, border: `1px solid ${chipBd}` }}
                    >
                      <CheckIcon/>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[12px] font-400" style={{ color: muted }}>{t.dogId}</span>
                    <span
                      className="text-[12px] font-700 px-2.5 py-0.5 rounded-full"
                      style={{ background: chipBg, color: T.brown, border: `1px solid ${chipBd}` }}
                    >
                      {dog.code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-white text-[12px] font-600 px-3 py-1.5 rounded-full"
                    style={{ background: statusInfo.bg }}
                  >
                    <HeartIcon/>{statusInfo.label}
                  </span>
                  <button
                    onClick={onOpenVetLog}
                    className="text-[11px] font-600 text-stone-500 dark:text-stone-400 hover:text-[#784920] dark:hover:text-[#d4a876] underline underline-offset-2 transition-colors"
                  >
                    {t.viewMedicalLog} →
                  </button>
                </div>
              </div>

              {/* location + date */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                <div className="flex items-center gap-1.5 text-[13px]" style={{ color: muted }}>
                  <span style={{ color: T.rust }}><MapPinIcon/></span>
                  {dog.area}
                </div>
                <div className="flex items-center gap-1.5 text-[13px]" style={{ color: muted }}>
                  <span style={{ color: T.rust }}><CalendarIcon/></span>
                  {t.registered} {dog.registeredDate}
                </div>
              </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: dark ? T.bDark : T.bLight }}/>

            {/* stat chips row: Breed, Vaccination, Sterilisation, Bark Emotion, Movement Monitor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {statItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 p-3.5 rounded-[14px]"
                  style={{ background: faint, border: `1px solid ${bd}` }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-500" style={{ color: muted }}>
                    <span style={{ color: T.rust }}><item.Icon/></span>
                    {item.label}
                  </div>
                  <p className="text-[13px] font-600 truncate" style={{ color: item.valColor }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Age, Gender & Territory bio bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-[12px]" style={{ borderColor: bd, color: muted }}>
              <div className="flex flex-wrap items-center gap-3 font-medium">
                <span><strong className="font-semibold" style={{ color: text }}>Approx Age:</strong> {dog.approxAge}</span>
                <span>•</span>
                <span><strong className="font-semibold" style={{ color: text }}>Gender:</strong> {dog.gender}</span>
                <span>•</span>
                <span><strong className="font-semibold" style={{ color: text }}>Nature:</strong> {dog.nature}</span>
              </div>
              {dog.specialNotes && (
                <p className="italic text-[11.5px] opacity-85">"{dog.specialNotes}"</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ROW 3: Real GIS Map with OpenStreetMap, Real 24h Trail & Device GPS ──────
function RealLiveMapSection({
  dark,
  dog,
  lang,
  onSyncCollar,
  isSyncing,
  hideFloatingControls,
}: {
  dark: boolean
  dog: DogProfile
  lang: Language
  onSyncCollar: () => void
  isSyncing: boolean
  hideFloatingControls?: boolean
}) {
  const t = TRANSLATIONS[lang]
  const bg = dark ? T.cardDark : T.cardLight
  const bd = dark ? T.bDark : T.bLight
  const text = dark ? T.tDark : T.tLight
  const muted = dark ? T.mDark : T.mLight
  const divBd = dark ? T.bDark : "#f5ede8"
  const rowBg = dark ? "#180e06" : "#faf6f1"

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const dogMarkerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const geofenceCircleRef = useRef<any>(null)
  const waypointMarkersRef = useRef<any[]>([])
  const deviceMarkerRef = useRef<any>(null)

  // 24-Hour Trail Playback state
  const [activeWaypoint, setActiveWaypoint] = useState(dog.trailPoints.length - 1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [coordsCopied, setCoordsCopied] = useState(false)
  const [deviceLocation, setDeviceLocation] = useState<{
    lat: number
    lng: number
    accuracy: number
    timestamp: string
  } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  void geoError

  // Reset trail on dog change
  useEffect(() => {
    setActiveWaypoint(dog.trailPoints.length - 1)
    setIsPlaying(false)
  }, [dog])

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setActiveWaypoint((prev) => {
        if (prev >= dog.trailPoints.length - 1) {
          setIsPlaying(false)
          return dog.trailPoints.length - 1
        }
        return prev + 1
      })
    }, 1400)
    return () => clearInterval(interval)
  }, [isPlaying, dog])

  // Initialize and update Leaflet Map
  useEffect(() => {
    const L = (window as any).L
    if (!L || !mapContainerRef.current) return

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const currentPt = dog.trailPoints[activeWaypoint] || { lat: dog.coordinates.lat, lng: dog.coordinates.lng }

    const map = L.map(mapContainerRef.current, {
      center: [currentPt.lat, currentPt.lng],
      zoom: 16,
      zoomControl: true,
      attributionControl: false,
    })
    mapInstanceRef.current = map

    // OpenStreetMap Tile Layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map)

    // Geofence Circle
    const geofenceColor = dog.isGeofencedSafe ? "#4a7c3a" : "#dc2626"
    const geofence = L.circle([19.8755, 75.3435], {
      color: geofenceColor,
      fillColor: geofenceColor,
      fillOpacity: 0.07,
      radius: 420,
      weight: 2,
      dashArray: "6, 6",
    }).addTo(map)
    geofence.bindTooltip(
      dog.isGeofencedSafe ? "🛡️ Safe Campus Geofence Boundary" : "⚠️ Geofence Boundary Breached!",
      { permanent: false, direction: "top" }
    )
    geofenceCircleRef.current = geofence

    // 24-hr Trail Polyline
    const trailLatLngs = dog.trailPoints.map((p) => [p.lat, p.lng])
    const polyline = L.polyline(trailLatLngs, {
      color: "#784920",
      weight: 4,
      opacity: 0.85,
      dashArray: "8, 6",
    }).addTo(map)
    polylineRef.current = polyline

    // Waypoint Markers
    waypointMarkersRef.current = []
    dog.trailPoints.forEach((pt, idx) => {
      const isCurrent = idx === activeWaypoint
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: isCurrent ? 8 : 5,
        fillColor: isCurrent ? "#784920" : "#c49050",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map)
      marker.bindPopup(`<b>${pt.time}</b><br>${pt.label}`)
      marker.on("click", () => {
        setActiveWaypoint(idx)
        setIsPlaying(false)
      })
      waypointMarkersRef.current.push(marker)
    })

    // Dog Icon Marker with animated pulse ring
    const dogIconHtml = `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${dog.isGeofencedSafe ? "#784920" : "#dc2626"}; opacity:0.3; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#ffffff; border:2.5px solid ${dog.isGeofencedSafe ? "#784920" : "#dc2626"}; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.35); font-size:18px;">
          🐕
        </div>
      </div>
    `
    const dogIcon = L.divIcon({
      className: "dog-real-pin",
      html: dogIconHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    })

    const dogMarker = L.marker([currentPt.lat, currentPt.lng], { icon: dogIcon }).addTo(map)
    dogMarker.bindPopup(`<b>${dog.name} (${dog.code})</b><br>${dog.breed}<br>📍 ${currentPt.label || dog.area}`)
    dogMarkerRef.current = dogMarker

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [dog])

  // Move marker and pan smoothly when activeWaypoint changes
  useEffect(() => {
    const currentPt = dog.trailPoints[activeWaypoint]
    if (!currentPt) return

    if (dogMarkerRef.current) {
      dogMarkerRef.current.setLatLng([currentPt.lat, currentPt.lng])
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([currentPt.lat, currentPt.lng], { animate: true, duration: 0.6 })
    }

    // Highlight active waypoint marker
    waypointMarkersRef.current.forEach((m, idx) => {
      if (idx === activeWaypoint) {
        m.setStyle({ radius: 8, fillColor: "#784920" })
      } else {
        m.setStyle({ radius: 5, fillColor: "#c49050" })
      }
    })
  }, [activeWaypoint, dog])

  // My Device Geolocation
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }
    setGeoLoading(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const devLat = pos.coords.latitude
        const devLng = pos.coords.longitude
        const acc = Math.round(pos.coords.accuracy)

        setDeviceLocation({
          lat: devLat,
          lng: devLng,
          accuracy: acc,
          timestamp: "Just now • Device GPS",
        })
        setGeoLoading(false)

        const L = (window as any).L
        if (L && mapInstanceRef.current) {
          if (deviceMarkerRef.current) {
            mapInstanceRef.current.removeLayer(deviceMarkerRef.current)
          }

          const devIcon = L.divIcon({
            className: "device-user-pin",
            html: `
              <div style="width:30px; height:30px; border-radius:50%; background:#2563eb; border:3px solid #ffffff; box-shadow:0 2px 10px rgba(37,99,235,0.5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">
                👤
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })

          const devMarker = L.marker([devLat, devLng], { icon: devIcon }).addTo(mapInstanceRef.current)
          devMarker.bindPopup(`<b>Your Device Location</b><br>Accuracy: ±${acc}m`).openPopup()
          deviceMarkerRef.current = devMarker

          // Zoom bounds to include both dog and device
          const currentPt = dog.trailPoints[activeWaypoint] || dog.coordinates
          const bounds = L.latLngBounds([[currentPt.lat, currentPt.lng], [devLat, devLng]])
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === 1) {
          setGeoError("Location permission denied. Please allow location access in your browser.")
        } else if (err.code === 2) {
          setGeoError("Position unavailable. Make sure your device location / GPS is turned on.")
        } else {
          setGeoError("Location request timed out. Please try again.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const activePt = dog.trailPoints[activeWaypoint] || dog.coordinates
  const currentLat = activePt.lat
  const currentLng = activePt.lng
  const accuracy = deviceLocation ? deviceLocation.accuracy : dog.coordinates.accuracyMeters

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLat},${currentLng}`
    window.open(url, "_blank")
  }

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`)
    setCoordsCopied(true)
    setTimeout(() => setCoordsCopied(false), 2000)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-5">
      <div
        className="rounded-[18px] overflow-hidden"
        style={{ background: bg, border: `1px solid ${bd}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4" style={{ borderBottom: `1px solid ${divBd}` }}>
          <div className="flex items-center gap-3">
            <span style={{ color: T.brown }}><MapPinIcon/></span>
            <h2 className="text-[14px] font-700" style={{ color: text }}>
              Real-Time GIS Location & 24h Trail
            </h2>

            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              style={{
                background: deviceLocation ? (dark ? "#162814" : "#edf5e8") : (dark ? "#261508" : "#fbf5ee"),
                color: deviceLocation ? "#4a7c3a" : T.brown,
                border: `1px solid ${deviceLocation ? "#4a7c3a30" : bd}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              {deviceLocation ? `Device GPS Locked (±${deviceLocation.accuracy}m)` : "Collar GPS Active"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Trail Playback toggle */}
            <button
              onClick={() => {
                if (activeWaypoint >= dog.trailPoints.length - 1) {
                  setActiveWaypoint(0)
                  setIsPlaying(true)
                } else {
                  setIsPlaying(!isPlaying)
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all shadow-xs"
              style={{
                background: isPlaying ? T.brown : (dark ? "#221308" : "#fdfaf6"),
                color: isPlaying ? "#ffffff" : text,
                border: `1px solid ${isPlaying ? T.brown : bd}`,
              }}
              title="Play 24-Hour Trail Playback"
            >
              <span>{isPlaying ? "⏸ Pause" : "▶ Play 24h Trail"}</span>
            </button>

            {/* My Device GPS */}
            <button
              onClick={handleGetDeviceLocation}
              disabled={geoLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all shadow-xs"
              style={{
                borderColor: deviceLocation ? "#4a7c3a" : bd,
                color: deviceLocation ? "#4a7c3a" : T.brown,
                background: deviceLocation ? (dark ? "#162814" : "#edf5e8") : (dark ? "#221308" : "#fdfaf6"),
              }}
              title="Locate my smartphone/device relative to this dog"
            >
              <span className={geoLoading ? "animate-spin" : ""}>📍</span>
              <span>{geoLoading ? "Acquiring..." : deviceLocation ? "Device Located" : "My Device GPS"}</span>
            </button>

            {/* Sync Telemetry */}
            <button
              onClick={onSyncCollar}
              disabled={isSyncing}
              className="p-2 rounded-xl transition-colors border shadow-xs"
              style={{ borderColor: bd, color: T.brown, background: dark ? "#221308" : "#fdfaf6" }}
              title="Sync GPS Telemetry"
            >
              <span className={isSyncing ? "animate-spin inline-block" : ""}><RefreshIcon/></span>
            </button>
          </div>
        </div>

        {/* Real Leaflet Map Container */}
        <div className="relative w-full bg-[#e5e3df]" style={{ height: 420 }}>
          <div ref={mapContainerRef} id="dog-leaflet-map" className="w-full h-full z-0" style={{ height: 420 }} />


          {/* Action buttons on map (hidden when modals open so focus is on popups) */}
          {!hideFloatingControls && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-[20]">
              <button
                onClick={handleCopyCoords}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-2 rounded-full border shadow-md transition-all backdrop-blur-md"
                style={{
                  background: dark ? "rgba(28,16,7,0.9)" : "rgba(255,255,255,0.9)",
                  borderColor: bd,
                  color: text,
                }}
              >
                <span>📍</span>
                <span>{coordsCopied ? "✓ Copied" : `${currentLat.toFixed(4)}°, ${currentLng.toFixed(4)}°`}</span>
              </button>

              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg transition-transform hover:scale-105"
                style={{ background: T.brown }}
              >
                <NavIcon/>
                <span>Open in Google Maps</span>
              </button>
            </div>
          )}
        </div>

        {/* 24-Hour Trail Timeline Scrubber Strip */}
        <div
          className="px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-[11px]"
          style={{ background: dark ? "#221308" : "#fdfaf6", borderTop: `1px solid ${divBd}` }}
        >
          <span className="font-bold shrink-0 text-stone-400 uppercase tracking-wider text-[10px] mr-1">
            24h Trail:
          </span>
          {dog.trailPoints.map((pt, i) => {
            const isActive = i === activeWaypoint
            return (
              <button
                key={i}
                onClick={() => {
                  setActiveWaypoint(i)
                  setIsPlaying(false)
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
                style={{
                  background: isActive ? T.brown : (dark ? "#2c170a" : "#ffffff"),
                  color: isActive ? "#ffffff" : text,
                  borderColor: isActive ? T.brown : bd,
                }}
              >
                <span className="text-[10px] opacity-75 font-mono">{pt.time}</span>
                <span>{pt.label.split(" • ")[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Footer telemetry strip */}
        <div className="grid grid-cols-3" style={{ borderTop: `1px solid ${divBd}`, background: rowBg }}>
          {[
            {
              icon: <WifiIcon/>,
              label: t.gpsAccuracy,
              value: `±${accuracy} m`,
            },
            {
              icon: <ClockIcon/>,
              label: t.lastSeen,
              value: deviceLocation ? deviceLocation.timestamp : `${dog.lastSeenMinutesAgo} ${t.minsAgo}`,
            },
            {
              icon: <MapPinIcon/>,
              label: t.locationStr,
              value: `${currentLat.toFixed(4)}°, ${currentLng.toFixed(4)}°`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-5 py-3.5"
              style={{ borderRight: i < 2 ? `1px solid ${divBd}` : "none" }}
            >
              <span style={{ color: T.brown }}>{item.icon}</span>
              <div>
                <p className="text-[10px] font-400" style={{ color: muted }}>{item.label}</p>
                <p className="text-[12px] font-600 truncate" style={{ color: text }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ROW 4: Collar + Emergency ────────────────────────────────────────────────
function CollarEmergency({
  dark,
  dog,
  lang,
  onOpenEmergency,
}: {
  dark: boolean
  dog: DogProfile
  lang: Language
  onOpenEmergency: () => void
}) {
  const t     = TRANSLATIONS[lang]
  const bg    = dark ? T.cardDark : T.cardLight
  const bd    = dark ? T.bDark    : T.bLight
  const text  = dark ? T.tDark    : T.tLight
  const muted = dark ? T.mDark    : T.mLight
  const divBd = dark ? T.bDark    : "#f5ede8"

  const collarItems = [
    { icon: <CalendarIcon/>,                                 label: t.collarInstalled, value: dog.collarInstalledDate },
    { icon: <WifiIcon/>,                                     label: t.gpsAccuracy,     value: `±${dog.coordinates.accuracyMeters} m` },
    { icon: <BatteryIcon dark={dark} percent={dog.batteryPercent}/>, label: t.batteryLevel, value: `${dog.batteryPercent}%` },
    { icon: <ClockIcon/>,                                    label: t.lastGpsUpdate,   value: dog.lastUpdateTimestamp },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-5 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* collar & tracking */}
        <div
          className="rounded-[18px]"
          style={{ background: bg, border: `1px solid ${bd}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${divBd}` }}>
            <h2 className="text-[14px] font-600" style={{ color: text }}>{t.collarTitle}</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-3">
            {collarItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-[13px]"
                style={{ background: dark ? "#200e04" : "#faf4ec", border: `1px solid ${bd}` }}
              >
                <span style={{ color: T.brown }}>{item.icon}</span>
                <div>
                  <p className="text-[10px] font-400 mb-0.5" style={{ color: muted }}>{item.label}</p>
                  <p className="text-[13px] font-600" style={{ color: text }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* emergency */}
        <div
          className="rounded-[18px] overflow-hidden"
          style={{
            background: dark ? "#180606" : "#fff5f5",
            border: "1px solid #fecaca",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: "1px solid #fecaca" }}>
            <span className="text-red-500"><AlertIcon/></span>
            <h2 className="text-[14px] font-600 text-red-600">{t.emergencyTitle}</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-[13px] leading-[1.6]" style={{ color: dark ? "#fca5a5" : "#dc2626" }}>
              {t.emergencyNotice}
            </p>
            <a
              href="tel:+919822145789"
              className="w-full flex items-center justify-center gap-2 text-white font-semibold text-[13px] py-3.5 rounded-[13px] bg-red-600 hover:bg-red-700 transition-all shadow-sm active:scale-[0.99]"
              style={{ boxShadow: "0 2px 8px rgba(220,38,38,0.3)" }}
            >
              <PhoneIcon/>
              <span>{t.contactHelpline}</span>
            </a>

            <button
              onClick={onOpenEmergency}
              className="w-full py-2.5 rounded-[12px] border border-red-200 dark:border-red-900/50 text-[12px] font-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>📋</span>
              <span>{t.reportIncident}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ dark, lang }: { dark: boolean; lang: Language }) {
  const t = TRANSLATIONS[lang]
  return (
    <footer style={{ background: dark ? T.cardDark : T.cardLight, borderTop: `1px solid ${dark ? T.bDark : T.beige}` }}>
      <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-center">
        <p className="text-[12px] text-center" style={{ color: dark ? T.mDark : T.mLight }}>
          🐾 &nbsp;{t.footerText}
        </p>
      </div>
    </footer>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark] = useState(false)
  const [lang] = useState<Language>("en")
  const [viewMode, setViewMode] = useState<ViewMode>("citizen")
  const [activeDog, setActiveDog] = useState<DogProfile>(CAMPUS_DOGS[0])
  const [isSyncing, setIsSyncing] = useState(false)

  // Modals state
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false)
  const [digitalIdModalOpen, setDigitalIdModalOpen] = useState(false)
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState(false)
  const [vetModalOpen, setVetModalOpen] = useState(false)
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // Collar Telemetry Sync handler
  const handleSyncCollar = () => {
    setIsSyncing(true)
    setTimeout(() => {
      // Simulate live incoming packet updating telemetry slightly
      setActiveDog((prev) => ({
        ...prev,
        lastSeenMinutesAgo: 0,
        lastUpdateTimestamp: "Just now • Live GPS Lock",
        temperatureC: Number((38.4 + Math.random() * 0.4).toFixed(1)),
      }))
      setIsSyncing(false)
    }, 900)
  }

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setViewMode("admin")
    } else {
      setAdminLoginOpen(true)
    }
  }

  const handleAdminLoginSuccess = (_officerName: string) => {
    setIsAdminAuthenticated(true)
    setAdminLoginOpen(false)
    setViewMode("admin")
  }

  const handleLogout = () => {
    setIsAdminAuthenticated(false)
    setViewMode("citizen")
  }

  const isAnyModalOpen =
    vetModalOpen || emergencyModalOpen || digitalIdModalOpen || qrScannerModalOpen || adminLoginOpen

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dark ? T.bgDark : T.bgLight,
        color: dark ? T.tDark : T.tLight,
        transition: "background 0.25s, color 0.25s",
      }}
    >
      {/* Conditional View: Citizen View vs. Municipal Admin Portal */}
      {viewMode === "admin" ? (
        <AdminPortal
          dogs={CAMPUS_DOGS}
          activeDog={activeDog}
          onSelectDog={(d) => setActiveDog(d)}
          lang={lang}
          dark={dark}
          onSwitchToCitizen={handleLogout}
        />
      ) : (
        <>
          {/* Navigation */}
          <Navbar
            dark={dark}
            lang={lang}
            viewMode={viewMode}
            onAdminClick={handleAdminClick}
            onLogout={handleLogout}
          />

          <main className="animate-fadeIn">
            <DogProfileCard
              dark={dark}
              dog={activeDog}
              lang={lang}
              onOpenDigitalId={() => setDigitalIdModalOpen(true)}
              onOpenVetLog={() => setVetModalOpen(true)}
            />

            <RealLiveMapSection
              dark={dark}
              dog={activeDog}
              lang={lang}
              onSyncCollar={handleSyncCollar}
              isSyncing={isSyncing}
              hideFloatingControls={isAnyModalOpen}
            />

            <CollarEmergency
              dark={dark}
              dog={activeDog}
              lang={lang}
              onOpenEmergency={() => setEmergencyModalOpen(true)}
            />
          </main>

          {/* Footer */}
          <Footer dark={dark} lang={lang}/>
        </>
      )}

      {/* Modals */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        dark={dark}
        lang={lang}
      />

      {emergencyModalOpen && (
        <EmergencyModal
          dog={activeDog}
          lang={lang}
          onClose={() => setEmergencyModalOpen(false)}
        />
      )}

      {digitalIdModalOpen && (
        <DigitalIdModal
          dog={activeDog}
          lang={lang}
          onClose={() => setDigitalIdModalOpen(false)}
        />
      )}

      {qrScannerModalOpen && (
        <QrScannerModal
          dogs={CAMPUS_DOGS}
          lang={lang}
          onSelectDog={(d) => setActiveDog(d)}
          onClose={() => setQrScannerModalOpen(false)}
        />
      )}

      {vetModalOpen && (
        <VetDetailsModal
          dog={activeDog}
          lang={lang}
          onClose={() => setVetModalOpen(false)}
        />
      )}
    </div>
  )
}
