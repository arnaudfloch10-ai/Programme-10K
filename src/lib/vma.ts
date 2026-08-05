// Calcul de la VMA depuis un test. Pur, testable.
import type { VmaTest, VmaTestType } from '../types'

/** demi-Cooper (6 min) : VMA = distance_m / 100. */
export function vmaFromDemiCooper(distanceM: number): number {
  return distanceM / 100
}

/** Cooper (12 min) : approximation VMA ≈ distance_m / 200. */
export function vmaFromCooper(distanceM: number): number {
  return distanceM / 200
}

// % de VMA soutenable selon la durée d'effort d'une course (table indicative).
// Point d'ancrage : ~6 min = 100 % VMA, dégradation logarithmique au-delà.
const RACE_PCT_TABLE: Array<{ maxDurationS: number; pct: number }> = [
  { maxDurationS: 6 * 60, pct: 1.0 },
  { maxDurationS: 12 * 60, pct: 0.95 },
  { maxDurationS: 20 * 60, pct: 0.92 },
  { maxDurationS: 30 * 60, pct: 0.9 }, // ~5 km rapide
  { maxDurationS: 45 * 60, pct: 0.88 }, // ~10 km
  { maxDurationS: 60 * 60, pct: 0.86 },
  { maxDurationS: 90 * 60, pct: 0.84 },
  { maxDurationS: 120 * 60, pct: 0.82 }, // semi
  { maxDurationS: Infinity, pct: 0.8 },
]

/** Fraction de VMA estimée pour une durée d'effort en secondes. */
export function racePctForDuration(durationS: number): number {
  for (const row of RACE_PCT_TABLE) {
    if (durationS <= row.maxDurationS) return row.pct
  }
  return 0.8
}

/**
 * VMA estimée à partir d'une course : vitesse moyenne / % de VMA correspondant
 * à la durée d'effort.
 */
export function vmaFromRace(distanceM: number, timeS: number): number {
  if (distanceM <= 0 || timeS <= 0) return 0
  const speedKmh = distanceM / 1000 / (timeS / 3600)
  return speedKmh / racePctForDuration(timeS)
}

export interface VmaTestInput {
  date: string
  type: VmaTestType
  distanceM?: number
  raceDistanceM?: number
  raceTimeS?: number
}

/** Construit un VmaTest complet avec sa VMA calculée depuis les entrées brutes. */
export function computeVmaTest(input: VmaTestInput): VmaTest {
  let computedVma = 0
  switch (input.type) {
    case 'demi-cooper':
      computedVma = vmaFromDemiCooper(input.distanceM ?? 0)
      break
    case 'cooper':
      computedVma = vmaFromCooper(input.distanceM ?? 0)
      break
    case 'course':
      computedVma = vmaFromRace(input.raceDistanceM ?? 0, input.raceTimeS ?? 0)
      break
  }
  return {
    date: input.date,
    type: input.type,
    distanceM: input.distanceM,
    raceDistanceM: input.raceDistanceM,
    raceTimeS: input.raceTimeS,
    computedVma: Math.round(computedVma * 10) / 10,
  }
}
