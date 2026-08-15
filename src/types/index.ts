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
  warmupNote?: string // détail d'échauffement (gammes, progressives…)
  raceSegments?: RaceSegment[] // plan de course par tronçons de km
}

export interface RaceSegment {
  label: string // "km 1–3", "km 8–10"
  zone?: ZoneId
  zonePosition?: 'bas' | 'milieu' | 'haut'
  free?: boolean // tronçon libre, sans allure imposée
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
  period: string // libellé lisible de la période
  focus: string
  volume: string // ex. "37 → 46 km", "−40 %"
  keyEvent?: string
}

export interface Profile {
  ageYears: number
  heightCm: number
  weightKg: number
  fcMax: number
  vma: number // km/h — paramètre central pour le pilotage à l'allure (peut être 0 si non mesurée)
  // Champs objectif : propres au plan course d'Arnaud (optionnels pour les autres profils).
  goalRaceName?: string
  goalRaceDate?: string
  goalTimeS?: number
  testRaceName?: string
  testRaceDate?: string
  // Champs du pilotage FC (profils de type « reprise »).
  fcRepos?: number
  vmaMeasuredAt?: string // ISO — date du test demi-Cooper si réalisé
}

// --- Multi-profil ---

export type ProfilId = 'arnaud' | 'charline'
export type Pilotage = 'allure' | 'fc'
export type ThemeId = 'light-copper' | 'dark-rose'

/** Descripteur statique d'un profil (registre, non stocké en base). */
export interface Profil {
  id: ProfilId
  prenom: string
  accentColor: string // accent du profil (surcharge --accent)
  theme: ThemeId // jeu de tokens appliqué via data-theme
  pilotage: Pilotage
  planId: string // référence vers le module de plan statique
}

// --- Plan piloté en fréquence cardiaque (profil « reprise ») ---

export interface FcCible {
  min: number
  max: number
}

export interface RepriseZone {
  id: string
  libelle: string
  pctReserveMin: number
  pctReserveMax: number
  fcMin: number
  fcMax: number
  allureMin: string // "9:15" — plus lent
  allureMax: string // "8:45" — plus rapide
}

export interface RepriseSeance {
  id: string
  jourSuggere: string // "mardi", "jeudi", "dimanche"
  type: string // "EF", "EF + cadence", "TEST"…
  contenu: string
  dureeMin: number
  fcCible: FcCible | null
  allureCible: string | null // ex. "8:30-9:00", secondaire
  note: string | null
  test?: boolean // séance test demi-Cooper
}

export interface RepriseSemaine {
  numero: number
  allegee: boolean
  volumeCibleMin: number // minutes cibles
  volumeCibleKm: number
  consigneCle: string
  seances: RepriseSeance[]
}

export type BlocStatut = 'actif' | 'verrouille'

export interface RepriseBloc {
  numero: number
  titre: string
  objectif: string
  statut: BlocStatut
  messageVerrouille?: string
  semaines: RepriseSemaine[]
}

export interface RepriseTestAllure {
  id: string
  libelle: string
  pctVmaMin: number
  pctVmaMax: number
}

export interface RepriseTestVma {
  type: string
  dureeSecondes: number
  preDecompteSecondes: number
  formuleVma: string
  recalculAllures: RepriseTestAllure[]
  messageApresTest: string
}

export interface ReprisePlan {
  zones: RepriseZone[]
  fourchetteTravailParDefaut: FcCible
  blocs: RepriseBloc[]
  testVma: RepriseTestVma
}

// --- Suivi qualitatif (profil FC) ---

export type SensationJambes = 'fraiches' | 'normales' | 'lourdes'

export interface SeanceRealisee {
  seanceId: string
  date: string
  dureeMin?: number
  distanceKm?: number
  fcMoy?: number
  fcMax?: number
  cadence?: number
  ressenti: 1 | 2 | 3 | 4 | 5
  sensationJambes: SensationJambes
  commentaire?: string
}

export interface MesureMatinale {
  date: string
  fcRepos?: number
  qualiteSommeil: 1 | 2 | 3 | 4 | 5
}

// Renforcement musculaire (onglet dédié au profil FC).
export interface RenfoExercice {
  id: string
  nom: string
  volume: string // "3 × 15/jambe"
  justification: string // libellé secondaire, physiologique
}

// Configuration du suivi qualitatif propre au profil FC (fichier de données isolé).
export interface RepriseSuivi {
  renfo: RenfoExercice[]
  signauxArret: string[]
  chaussure: { nom: string; seuilMinKm: number; seuilMaxKm: number }
}
