// Helpers d'affichage partagés. Réexporte les formateurs d'allure du moteur.
export { formatPace, formatDuration } from './zones'

/** Formate un nombre de km avec au plus une décimale (ex. 6.5 → "6,5", 8 → "8"). */
export function formatKm(km: number): string {
  const rounded = Math.round(km * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',')
}

const JOURS = ['', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
const JOURS_LONG = ['', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** ISO → objet Date en heure locale, sans décalage de fuseau. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Date locale → 'YYYY-MM-DD'. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** dayOfWeek 1..7 (1 = lundi) depuis une Date. */
export function dayOfWeekMon1(d: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const js = d.getDay() // 0 = dimanche
  return (js === 0 ? 7 : js) as 1 | 2 | 3 | 4 | 5 | 6 | 7
}

/** 'YYYY-MM-DD' → "mar 4 août". */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  return `${JOURS[dayOfWeekMon1(d)]} ${d.getDate()} ${MOIS[d.getMonth()]}`
}

/** "mardi 4 août 2026". */
export function formatLongDate(iso: string): string {
  const d = parseISODate(iso)
  return `${JOURS_LONG[dayOfWeekMon1(d)]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

/** "4 – 9 août" ou "28 sept. – 4 oct." pour un intervalle de semaine. */
export function formatDateRange(startISO: string, endISO: string): string {
  const a = parseISODate(startISO)
  const b = parseISODate(endISO)
  const left = a.getMonth() === b.getMonth() ? `${a.getDate()}` : `${a.getDate()} ${MOIS[a.getMonth()]}`
  return `${left} – ${b.getDate()} ${MOIS[b.getMonth()]}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Nombre de jours (signé) entre deux dates ISO : b - a. */
export function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO).getTime()
  const b = parseISODate(bISO).getTime()
  return Math.round((b - a) / 86_400_000)
}
