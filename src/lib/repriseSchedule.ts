// Résolution de la séance du jour pour le plan FC (piloté par jourSuggere).
// Pur et testable. Semaine relative : le motif mardi/jeudi/dimanche se répète.
import type { RepriseSeance } from '../types'
import { dayOfWeekMon1, parseISODate } from './format'

export const JOUR_INDEX: Record<string, number> = {
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
  dimanche: 7,
}

/** Index de jour 1..7 (lundi..dimanche) d'une date ISO. */
export function jourIndexFromISO(iso: string): number {
  return dayOfWeekMon1(parseISODate(iso))
}

/** Séance suggérée pour un index de jour donné, ou undefined (jour de repos). */
export function seanceForDay(seances: RepriseSeance[], dayIdx: number): RepriseSeance | undefined {
  return seances.find((s) => JOUR_INDEX[s.jourSuggere] === dayIdx)
}

/**
 * Prochaine séance strictement après `dayIdx` dans la semaine ;
 * si aucune, on reboucle sur la première (semaine suivante).
 */
export function nextSeanceFrom(seances: RepriseSeance[], dayIdx: number): RepriseSeance | undefined {
  const sorted = seances
    .filter((s) => JOUR_INDEX[s.jourSuggere] != null)
    .sort((a, b) => JOUR_INDEX[a.jourSuggere] - JOUR_INDEX[b.jourSuggere])
  if (sorted.length === 0) return undefined
  return sorted.find((s) => JOUR_INDEX[s.jourSuggere] > dayIdx) ?? sorted[0]
}

/** Résumé d'une ligne « prochaine séance » : "jeudi · 30 min EF · 140–152 bpm". */
export function nextSeanceSummary(s: RepriseSeance): string {
  const parts = [s.jourSuggere, `${s.dureeMin} min ${s.type}`.trim()]
  if (s.fcCible) parts.push(`${s.fcCible.min}–${s.fcCible.max} bpm`)
  else if (s.type === 'TEST' || s.test) parts.push('test demi-Cooper')
  return parts.join(' · ')
}
