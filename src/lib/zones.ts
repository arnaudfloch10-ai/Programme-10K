// src/lib/zones.ts
//
// Moteur de zones — cœur du système.
// Toutes les allures de l'application dérivent d'un unique paramètre : la VMA.
// Module PUR : aucune dépendance, aucun effet de bord, entièrement testable.

export type ZoneId = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'FORCE' | 'REST'
export type ZonePosition = 'bas' | 'milieu' | 'haut'

/** Zones d'intensité définies par une fraction de VMA et une fraction de FC max. */
export type TrainingZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5'

export interface ZoneDef {
  id: TrainingZone
  name: string
  /** Bornes en fraction de VMA (0.60 = 60 %). */
  vmaMin: number
  vmaMax: number
  /** Bornes en fraction de FC max. null = borne ouverte (pas de plancher/plafond). */
  hrMin: number | null
  hrMax: number | null
  color: string
}

/** Couleur constante par zone dans toute l'app. La couleur n'encode QUE l'intensité. */
export const ZONE_COLORS: Record<ZoneId, string> = {
  Z1: '#7b98a8',
  Z2: '#3d6b7d',
  Z3: '#5f7a3a',
  Z4: '#8a6d1f',
  Z5: '#a32e3d',
  FORCE: '#a86a1f',
  REST: '#9aa2a8',
}

/** Définition des 5 zones aérobies. Source unique de vérité pour les pourcentages. */
export const ZONES: Record<TrainingZone, ZoneDef> = {
  Z1: { id: 'Z1', name: 'Récupération',           vmaMin: 0.6,  vmaMax: 0.7,  hrMin: null, hrMax: 0.7,  color: ZONE_COLORS.Z1 },
  Z2: { id: 'Z2', name: 'Endurance fondamentale', vmaMin: 0.7,  vmaMax: 0.78, hrMin: 0.7,  hrMax: 0.8,  color: ZONE_COLORS.Z2 },
  Z3: { id: 'Z3', name: 'Endurance active',       vmaMin: 0.78, vmaMax: 0.85, hrMin: 0.8,  hrMax: 0.87, color: ZONE_COLORS.Z3 },
  Z4: { id: 'Z4', name: 'Seuil',                  vmaMin: 0.85, vmaMax: 0.92, hrMin: 0.87, hrMax: 0.92, color: ZONE_COLORS.Z4 },
  Z5: { id: 'Z5', name: 'VO₂max / VMA',           vmaMin: 0.92, vmaMax: 1.05, hrMin: 0.92, hrMax: null, color: ZONE_COLORS.Z5 },
}

export const ZONE_ORDER: TrainingZone[] = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']

/** Noms courts des zones non-aérobies pour l'affichage. */
export const ZONE_LABELS: Record<ZoneId, string> = {
  Z1: 'Récupération',
  Z2: 'Endurance fondamentale',
  Z3: 'Endurance active',
  Z4: 'Seuil',
  Z5: 'VO₂max / VMA',
  FORCE: 'Force / hors zone',
  REST: 'Repos',
}

/** Allures dérivées, exprimées en fraction de VMA. */
export const DERIVED_VMA_PCT = {
  p10k: 0.88, // allure 10 km actuelle
  p5k: 0.93, // allure 5 km actuelle
  marathon: 0.82, // allure marathon
} as const

// ---------------------------------------------------------------------------
// Conversions fondamentales
// ---------------------------------------------------------------------------

/** Vitesse (km/h) pour une fraction donnée de la VMA. pct = 0.88 → 88 % VMA. */
export function speedFromVma(vmaKmh: number, pct: number): number {
  return vmaKmh * pct
}

/** Allure (secondes par km) à partir d'une vitesse en km/h. */
export function paceFromSpeed(speedKmh: number): number {
  if (speedKmh <= 0) return Infinity
  return 3600 / speedKmh
}

/** Allure (s/km) directement à partir de la VMA et d'une fraction. */
export function paceFromVma(vmaKmh: number, pct: number): number {
  return paceFromSpeed(speedFromVma(vmaKmh, pct))
}

/** Temps au tour de 400 m (secondes) à partir d'une allure en s/km. */
export function lapTime400(paceSPerKm: number): number {
  return paceSPerKm / 2.5
}

/** Vitesse (km/h) à partir d'une allure en s/km — utile pour les logs saisis. */
export function speedFromPace(paceSPerKm: number): number {
  if (paceSPerKm <= 0) return Infinity
  return 3600 / paceSPerKm
}

// ---------------------------------------------------------------------------
// Résolution d'une zone → allures / FC
// ---------------------------------------------------------------------------

/** Fraction de VMA correspondant à une position dans la zone. */
export function pctForPosition(zone: TrainingZone, position: ZonePosition = 'milieu'): number {
  const { vmaMin, vmaMax } = ZONES[zone]
  switch (position) {
    case 'bas':
      return vmaMin
    case 'haut':
      return vmaMax
    case 'milieu':
      return (vmaMin + vmaMax) / 2
  }
}

export interface PaceRange {
  /** Allure la plus rapide de la zone (borne haute de % VMA), en s/km. */
  fastS: number
  /** Allure la plus lente de la zone (borne basse de % VMA), en s/km. */
  slowS: number
}

/** Fourchette d'allures (s/km) d'une zone pour une VMA donnée. */
export function zonePaceRange(vmaKmh: number, zone: TrainingZone): PaceRange {
  const { vmaMin, vmaMax } = ZONES[zone]
  return {
    fastS: paceFromVma(vmaKmh, vmaMax), // % VMA haut → plus rapide → moins de s/km
    slowS: paceFromVma(vmaKmh, vmaMin),
  }
}

/** Allure ponctuelle (s/km) pour une zone et une position (bas/milieu/haut). */
export function zonePace(vmaKmh: number, zone: TrainingZone, position: ZonePosition = 'milieu'): number {
  return paceFromVma(vmaKmh, pctForPosition(zone, position))
}

export interface HrRange {
  /** FC plancher de la zone en bpm (null si borne ouverte). */
  minBpm: number | null
  /** FC plafond de la zone en bpm (null si borne ouverte). */
  maxBpm: number | null
}

/** Fourchette de FC (bpm) d'une zone à partir de la FC max. */
export function zoneHrRange(fcMaxBpm: number, zone: TrainingZone): HrRange {
  const { hrMin, hrMax } = ZONES[zone]
  return {
    minBpm: hrMin === null ? null : Math.round(fcMaxBpm * hrMin),
    maxBpm: hrMax === null ? null : Math.round(fcMaxBpm * hrMax),
  }
}

/** Vrai si l'identifiant de zone est une des 5 zones aérobies calculables. */
export function isTrainingZone(zone: ZoneId): zone is TrainingZone {
  return zone === 'Z1' || zone === 'Z2' || zone === 'Z3' || zone === 'Z4' || zone === 'Z5'
}

// ---------------------------------------------------------------------------
// Allures dérivées (10 km / 5 km / marathon)
// ---------------------------------------------------------------------------

export interface DerivedPaces {
  p10kS: number
  p5kS: number
  marathonS: number
}

/** Allures de course dérivées de la VMA, en s/km. */
export function derivedPaces(vmaKmh: number): DerivedPaces {
  return {
    p10kS: paceFromVma(vmaKmh, DERIVED_VMA_PCT.p10k),
    p5kS: paceFromVma(vmaKmh, DERIVED_VMA_PCT.p5k),
    marathonS: paceFromVma(vmaKmh, DERIVED_VMA_PCT.marathon),
  }
}

// ---------------------------------------------------------------------------
// Formatage (monospace côté UI)
// ---------------------------------------------------------------------------

/** Formate une allure/temps en `m:ss` (ex. 390 → "6:30"). Arrondit à la seconde. */
export function formatPace(sPerKm: number): string {
  if (!isFinite(sPerKm) || sPerKm <= 0) return '—'
  let total = Math.round(sPerKm)
  let m = Math.floor(total / 60)
  let s = total % 60
  if (s === 60) {
    m += 1
    s = 0
  } // garde-fou après arrondi
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Formate une durée en `m:ss` si < 1 h, sinon `h:mm:ss`. Pour les temps de tour/effort. */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
