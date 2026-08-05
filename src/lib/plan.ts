// Calculs de rattachement séance ↔ semaine ↔ date. Pur.
import type { LoggedSession, Session, Week, ZoneId } from '../types'
import { dayOfWeekMon1, parseISODate } from './format'

/** Zone prescrite « principale » d'une séance (pour l'agrégation à défaut de zone tenue). */
export function prescribedZone(s: Session): ZoneId {
  if (s.steadyZone) return s.steadyZone
  const iv = s.intervals?.find((i) => i.zone !== 'FORCE' && i.zone !== 'REST')
  if (iv) return iv.zone
  return s.warmupZone ?? 'Z2'
}

/** Retrouve une séance par son id dans l'ensemble des semaines. */
export function findSessionById(weeks: Week[], sessionId: string): Session | undefined {
  for (const w of weeks) {
    const s = w.sessions.find((x) => x.id === sessionId)
    if (s) return s
  }
  return undefined
}

/** Semaine du plan contenant la date ISO, ou null si hors plan. */
export function findWeekForDate(weeks: Week[], iso: string): Week | null {
  const t = parseISODate(iso).getTime()
  for (const w of weeks) {
    if (t >= parseISODate(w.startDate).getTime() && t <= parseISODate(w.endDate).getTime()) {
      return w
    }
  }
  return null
}

/** Séance planifiée pour une date (par jour de la semaine). */
export function sessionForDate(week: Week | null, iso: string): Session | null {
  if (!week) return null
  const dow = dayOfWeekMon1(parseISODate(iso))
  return week.sessions.find((s) => s.dayOfWeek === dow) ?? null
}

/** Date ISO du jour d'une séance dans sa semaine. */
export function dateForSession(week: Week, session: Session): string {
  const start = parseISODate(week.startDate)
  const d = new Date(start)
  d.setDate(start.getDate() + (session.dayOfWeek - 1))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Km réalisés dans une semaine (somme des actualKm des logs sur l'intervalle). */
export function weekDoneKm(week: Week, logs: LoggedSession[]): number {
  const start = parseISODate(week.startDate).getTime()
  const end = parseISODate(week.endDate).getTime()
  return logs
    .filter((l) => l.done)
    .filter((l) => {
      const t = parseISODate(l.date).getTime()
      return t >= start && t <= end
    })
    .reduce((sum, l) => sum + (l.actualKm ?? 0), 0)
}

/** Km planifiés d'une semaine (somme des totalKm des séances). */
export function weekPlannedKm(week: Week): number {
  return week.sessions.reduce((sum, s) => sum + s.totalKm, 0)
}

/** Retrouve le log d'une séance à une date. */
export function findLog(
  logs: LoggedSession[],
  sessionId: string,
  date: string,
): LoggedSession | undefined {
  return logs.find((l) => l.sessionId === sessionId && l.date === date)
}
