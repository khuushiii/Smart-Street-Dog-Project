export type Language = "en" | "mr" | "hi"

export type ViewMode = "citizen" | "admin"

export type HealthStatus = "Healthy" | "Under Observation" | "Medical Recovery" | "Geofence Warning"

export type BarkEmotion =
  | "Aggressive / Guard Barking"
  | "Panic / Distress"
  | "Playful / Happy"
  | "Isolation / Whining"

export type MovementState =
  | "Moving Normally"
  | "Possibly Injured / Limping"
  | "Resting / Sleeping"
  | "Agitated / Needs Attention"

export type DogBreed =
  | "Indian Pariah"
  | "Indian spitz"
  | "Mixed mutt"
  | "Pedigree Stray"

export interface TrailPoint {
  x: number
  y: number
  lat: number
  lng: number
  time: string
  label: string
}

export interface VetRecord {
  vaccineBatch: string
  vaccineDate: string
  vaccineExpiry: string
  sterilisationClinic: string
  sterilisationDate: string
  vetDoctor: string
  dewormingDate: string
  weightKg: number
  microchipId: string
  clinicalNotes: string
}

export interface DogProfile {
  id: string
  code: string
  name: string
  photo: string
  breed: DogBreed
  breedConfidence: number
  gender: "Male" | "Female"
  approxAge: string
  nature: string
  area: string
  coordinates: {
    lat: number
    lng: number
    accuracyMeters: number
  }
  registeredDate: string
  collarInstalledDate: string
  healthStatus: HealthStatus
  temperatureC: number
  activityScore: number
  batteryPercent: number
  lastSeenMinutesAgo: number
  lastUpdateTimestamp: string
  isGeofencedSafe: boolean
  specialNotes: string
  barkEmotion: BarkEmotion
  movementState: MovementState
  trailPoints: TrailPoint[]
  vetRecord: VetRecord
}

export interface IncidentReport {
  id: string
  dogId: string
  dogName: string
  category: "injured" | "aggression" | "lost_collar" | "food_water" | "sighting"
  location: string
  description: string
  reporterName: string
  reporterPhone: string
  timestamp: string
  status: "dispatched" | "investigating" | "resolved"
}
