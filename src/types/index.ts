// Modèle de données — voir prompt. Les allures ne sont JAMAIS stockées : elles
// dérivent de la VMA courante via lib/sessionPace.ts. Les seeds ne portent que
// des zones et des positions dans la zone.

export type ZoneId = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'FORCE' | 'REST'

export type SessionType =
  | 'EF'
  | 'RECUP'
  | 'SEUIL'
  | 'VO2'
  | 'COTES'
  | 'LONGUE'
  | 'TEST'
  | 'COURSE'
  | 'REPOS'
  | 'RENFO'

export interface Interval {
  reps: number
  distanceM?: number // ex. 800
  durationS?: number // ex. 600 (l'un ou l'autre)
  zone: ZoneId
  zonePosition?: 'bas' | 'milieu' | 'haut' // affine l'allure dans la zone
  recoveryS?: number
  recoveryDistanceM?: number // récup exprimée en distance (ex. 200 m trot)
  recoveryZone?: ZoneId
  recoveryType?: 'trot' | 'marche'
  label?: string // ex. "lignes droites", "côte 5–6 %"
}

export interface Session {
  id: string
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7 // 1 = lundi
  type: SessionType
  title: string
  warmupKm?: number
  warmupZone?: ZoneId
  intervals?: Interval[]
  steadyKm?: number // pour les séances continues
  steadyZone?: ZoneId
  steadyZonePosition?: 'bas' | 'milieu' | 'haut'
  cooldownKm?: number
  totalKm: number
  note?: string // justification physiologique, une phrase
  strength?: 'A' | 'B' // séance de renfo associée
  isQuality?: boolean // séance de qualité (compte dans la limite de 2/sem)
  raceConsigne?: string // consigne de course affichée le jour J
}

export interface Week {
  number: number
  startDate: string // ISO
  endDate: string
  totalKm: number
  label?: 'charge' | 'allegee' | 'course'
  sessions: Session[]
}

export interface LoggedSession {
  sessionId: string
  date: string // ISO du jour réalisé (clé avec sessionId)
  done: boolean
  actualKm?: number
  actualPaceS?: number // s/km
  actualHrAvg?: number
  zoneHeld?: ZoneId // zone réellement tenue
  vmaAtDate: number // VMA en vigueur à la date — fige l'historique
  feel: 1 | 2 | 3 | 4 | 5
  fatigue: 1 | 2 | 3 | 4 | 5
  pain?: { area: string; intensity: number; note: string }
  comment?: string
}

export interface Measurement {
  date: string
  weightKg?: number
  waistCm?: number // au réveil, à jeun
  hipCm?: number
  neckCm?: number
  thighCm?: number
  calfCm?: number
  restingHr?: number
}

export type VmaTestType = 'demi-cooper' | 'cooper' | 'course'

export interface VmaTest {
  date: string
  type: VmaTestType
  distanceM?: number // pour un test de 6 ou 12 min
  raceDistanceM?: number // pour une course
  raceTimeS?: number
  computedVma: number
}

// Jalon macro pour les blocs 1 à 4 non encore détaillés.
export interface BlockMilestone {
  block: number
  title: string
  startDate: string
  endDate: string
  focus: string
  keyEvent?: string
}

export interface Profile {
  ageYears: number
  heightCm: number
  weightKg: number
  fcMax: number
  vma: number // km/h — LE paramètre central
  goalRaceName: string
  goalRaceDate: string
  goalTimeS: number
  testRaceName: string
  testRaceDate: string
}
