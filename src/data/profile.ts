import type { Profile } from '../types'

// Valeurs initiales — toutes modifiables dans les réglages.
export const DEFAULT_PROFILE: Profile = {
  ageYears: 39,
  heightCm: 181,
  weightKg: 77,
  fcMax: 196,
  vma: 12.5, // demi-Cooper 1250 m, août 2026
  goalRaceName: '10 km de Vincennes',
  goalRaceDate: '2027-05-23',
  goalTimeS: 48 * 60 + 30, // 48'30"
  testRaceName: '10 km de St-Maur',
  testRaceDate: '2026-10-04',
}

// Record 5 km de référence (solo, GPS) : 25'47".
export const REFERENCE_5K_S = 25 * 60 + 47

export const START_VOLUME_KM_PER_WEEK = 25
