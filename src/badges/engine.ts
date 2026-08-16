// Moteur de déblocage — PUR et testable. Règle fondatrice : la régularité se
// mesure en SEMAINES contenant ≥ 2 sorties. Il n'existe AUCUN compteur de jours
// consécutifs : sept jours de course d'affilée ne débloquent rien de plus
// qu'une semaine à 2 sorties.
import type { BadgeLevel, BadgeState, BadgeStates } from './types'
import { BADGES, getBadge } from './families'
import { parseISODate, toISODate } from '../lib/format'

export interface Activity {
  date: string // ISO
  distanceKm?: number
  durationMin?: number
  avgHr?: number
  startHour?: number // 0–23
}

export interface BadgeInput {
  activities: Activity[]
  fcMax?: number
  restingHr?: { date: string; bpm: number }[]
  declarations?: {
    sagesse?: boolean // sortie écourtée volontairement
    sommeilSemaine?: boolean // 7 nuits ≥ 7 h sur une semaine
    kudos?: boolean
    dossard?: boolean // course officielle
    duoCount?: number // nb de sorties à deux
  }
}

// --- Helpers temporels ---

/** Clé de semaine calendaire (lundi). */
export function weekKey(dateISO: string): string {
  const d = parseISODate(dateISO)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

const daysBetween = (a: string, b: string) =>
  Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000)

const sorted = (acts: Activity[]) => [...acts].sort((a, b) => a.date.localeCompare(b.date))

// --- Helpers de mesure (testés) ---

/** Nombre de semaines calendaires contenant AU MOINS `min` sorties. */
export function weeksWithAtLeast(activities: Activity[], min: number): number {
  const counts = new Map<string, number>()
  for (const a of activities) counts.set(weekKey(a.date), (counts.get(weekKey(a.date)) ?? 0) + 1)
  let n = 0
  for (const c of counts.values()) if (c >= min) n++
  return n
}

export const cumulativeKm = (a: Activity[]) => a.reduce((s, x) => s + (x.distanceKm ?? 0), 0)
export const maxSingleKm = (a: Activity[]) => a.reduce((m, x) => Math.max(m, x.distanceKm ?? 0), 0)
export const maxDurationMin = (a: Activity[]) => a.reduce((m, x) => Math.max(m, x.durationMin ?? 0), 0)

/** Occurrences de ≥ 2 jours de repos entre deux sorties consécutives. */
export function restGapCount(activities: Activity[], minRestDays = 2): number {
  const s = sorted(activities)
  let n = 0
  for (let i = 1; i < s.length; i++) if (daysBetween(s[i - 1].date, s[i].date) - 1 >= minRestDays) n++
  return n
}

/** Reprise après ≥ 14 jours d'arrêt entre deux sorties. */
export function hasReturnAfterPause(activities: Activity[], minPauseDays = 14): boolean {
  const s = sorted(activities)
  for (let i = 1; i < s.length; i++) if (daysBetween(s[i - 1].date, s[i].date) >= minPauseDays) return true
  return false
}

/** Nombre de records personnels (distance ou durée) battus après la 1ʳᵉ sortie. */
export function personalRecords(activities: Activity[]): { distance: boolean; duration: boolean; total: number } {
  const s = sorted(activities)
  let bestKm = -1
  let bestMin = -1
  let distance = false
  let duration = false
  let total = 0
  s.forEach((a, i) => {
    const km = a.distanceKm ?? 0
    const mn = a.durationMin ?? 0
    if (i > 0 && km > bestKm && bestKm >= 0) {
      distance = true
      total++
    }
    if (i > 0 && mn > bestMin && bestMin >= 0) {
      duration = true
      total++
    }
    bestKm = Math.max(bestKm, km)
    bestMin = Math.max(bestMin, mn)
  })
  return { distance, duration, total }
}

/** Saisons couvertes (hémisphère nord) par les mois des sorties. */
export function seasonsCovered(activities: Activity[]): number {
  const seasonOf = (m: number) => (m <= 1 || m === 11 ? 'hiver' : m <= 4 ? 'printemps' : m <= 7 ? 'été' : 'automne')
  const set = new Set(activities.map((a) => seasonOf(parseISODate(a.date).getMonth())))
  return set.size
}

/** Une semaine à volume réduit après trois semaines de hausse consécutive. */
export function hasDeloadWeek(activities: Activity[]): boolean {
  const vol = new Map<string, number>()
  for (const a of activities) vol.set(weekKey(a.date), (vol.get(weekKey(a.date)) ?? 0) + (a.distanceKm ?? 0))
  const keys = [...vol.keys()].sort()
  for (let i = 3; i < keys.length; i++) {
    const [a, b, c, d] = [vol.get(keys[i - 3])!, vol.get(keys[i - 2])!, vol.get(keys[i - 1])!, vol.get(keys[i])!]
    if (b > a && c > b && d < c) return true
  }
  return false
}

/** Tendance à la baisse de la FC de repos sur ≥ 28 jours. */
export function restingHrDown(series: { date: string; bpm: number }[]): boolean {
  const s = [...series].sort((a, b) => a.date.localeCompare(b.date))
  if (s.length < 4 || daysBetween(s[0].date, s[s.length - 1].date) < 28) return false
  const mid = Math.floor(s.length / 2)
  const avg = (arr: typeof s) => arr.reduce((t, x) => t + x.bpm, 0) / arr.length
  return avg(s.slice(mid)) < avg(s.slice(0, mid)) - 1
}

// --- Construction des états ---

function tierFor(count: number, tiers: { level: BadgeLevel; seuil: number }[]): BadgeState {
  let hit: BadgeState = { unlocked: false }
  for (const t of tiers) if (count >= t.seuil) hit = { unlocked: true, level: t.level }
  return hit
}

const ON = (cond: boolean, date?: string): BadgeState => (cond ? { unlocked: true, date } : { unlocked: false })

/**
 * Évalue les 45 badges. Les badges dont la donnée n'est pas encore collectée
 * (météo, dénivelé, tracé, cadence, partenaire…) restent verrouillés — jamais
 * débloqués « par défaut ».
 */
export function buildStates(input: BadgeInput): BadgeStates {
  const A = sorted(input.activities)
  const last = A.length ? A[A.length - 1].date : undefined
  const km = cumulativeKm(A)
  const single = maxSingleKm(A)
  const dur = maxDurationMin(A)
  const wk2 = weeksWithAtLeast(A, 2)
  const morning = A.filter((a) => a.startHour != null && a.startHour < 9).length
  const pr = personalRecords(A)
  const decl = input.declarations ?? {}
  const easy = input.fcMax
    ? A.some((a) => a.avgHr != null && a.avgHr < 0.75 * input.fcMax!)
    : false

  const map: BadgeStates = {}
  const set = (id: string, s: BadgeState) => (map[id] = s)

  // 1 · Premiers pas
  set('premiere-foulee', ON(A.length >= 1, A[0]?.date))
  set('premier-km', ON(single >= 1))
  set('trois-km', ON(single >= 3))
  set('cinq-km', ON(single >= 5))
  set('cumul-25', ON(km >= 25))
  set('cumul-100', ON(km >= 100))
  set('cumul-250', ON(km >= 250))
  set('cumul-500', ON(km >= 500))

  // 2 · Régularité (semaines, jamais jours consécutifs)
  set('deux-de-suite', ON(wk2 >= 2, last))
  set('un-mois-regulier', ON(wk2 >= 4, last))
  set('deux-mois', ON(wk2 >= 8, last))
  set('une-saison', ON(wk2 >= 12, last))
  set('retour-apres-pause', ON(hasReturnAfterPause(A), last))
  set('matinale', ON(morning >= 10))
  set('toutes-saisons', ON(seasonsCovered(A) >= 4))

  // 3 · Progression
  set('plus-loin', ON(pr.distance))
  set('plus-longtemps', ON(pr.duration))
  set('trois-records', ON(pr.total >= 3))
  set('cinq-records', ON(pr.total >= 5))
  set('souffle-qui-revient', { unlocked: false }) // besoin de l'historique FC/allure
  set('sans-marcher', ON(dur >= 20))
  set('trente-minutes', ON(dur >= 30))

  // 4 · Écoute du corps
  const repos = getBadge('repos-merite')!
  set('repos-merite', tierFor(restGapCount(A), repos.tiers!))
  set('depart-prudent', { unlocked: false }) // besoin des splits intra-sortie
  set('negative-split', { unlocked: false }) // besoin des splits intra-sortie
  set('allure-facile', ON(easy))
  set('semaine-legere', ON(hasDeloadWeek(A)))
  set('recuperation', ON(restGapCount(A, 3) >= 1)) // approx : ≥ 3 jours sans course
  set('sagesse', ON(!!decl.sagesse))
  set('sommeil-dabord', ON(!!decl.sommeilSemaine))

  // 5 · Découverte (données non collectées → verrouillés)
  for (const id of ['nouveau-parcours', 'exploratrice', 'sous-la-pluie', 'au-froid', 'premiere-cote', 'chemin-de-traverse'])
    set(id, { unlocked: false })

  // 6 · Bien-être
  set('souffle-neuf', ON(wk2 >= 4, last))
  set('poumons-libres', ON(wk2 >= 12, last))
  set('nouvelle-habitude', ON(wk2 >= 24, last))
  set('energie', ON(A.length >= 20))
  set('coeur-solide', ON(restingHrDown(input.restingHr ?? [])))

  // 7 · Ensemble
  set('a-deux', ON((decl.duoCount ?? 0) >= 1))
  set('duo-regulier', ON((decl.duoCount ?? 0) >= 5))
  set('premier-dossard', ON(!!decl.dossard))
  set('encouragement', ON(!!decl.kudos))

  // Garantit un état pour chaque badge (verrouillé par défaut).
  for (const b of BADGES) if (!(b.id in map)) map[b.id] = { unlocked: false }
  return map
}

export const countUnlocked = (states: BadgeStates): number => Object.values(states).filter((s) => s.unlocked).length
