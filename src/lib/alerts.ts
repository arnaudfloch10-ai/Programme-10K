// Moteur d'alertes — pur, testable. Il n'émet que des seuils issus du plan
// d'entraînement. Il ne pose AUCUN diagnostic médical.
import type { LoggedSession, Measurement, Session } from '../types'
import { parseISODate } from './format'

export type AlertLevel = 'info' | 'warning' | 'danger'

export interface Alert {
  id: string
  level: AlertLevel
  title: string
  message: string
  /** true = alerte rouge bloquante (arrêt + avis médical). */
  blocking?: boolean
}

// Zones osseuses déclenchant l'alerte rouge bloquante.
const BONE_AREAS = ['tibia', 'metatarse', 'métatarse', 'hanche']

function normalize(s: string): string {
  // NFD décompose les accents en diacritiques combinants (U+0300–U+036F) qu'on retire.
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function isBoneArea(area: string): boolean {
  const n = normalize(area)
  return BONE_AREAS.some((b) => n.includes(normalize(b)))
}

// ---------------------------------------------------------------------------
// Règle 1 — FC de repos élevée 2 matins consécutifs
// ---------------------------------------------------------------------------

/** FC de repos ≥ +7 bpm vs moyenne des 14 derniers jours, sur 2 matins consécutifs. */
export function restingHrAlert(measurements: Measurement[]): Alert | null {
  const pts = measurements
    .filter((m) => typeof m.restingHr === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
  if (pts.length < 2) return null

  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]

  // Deux matins consécutifs (1 jour d'écart).
  const gap = Math.round(
    (parseISODate(last.date).getTime() - parseISODate(prev.date).getTime()) / 86_400_000,
  )
  if (gap !== 1) return null

  // Baseline : moyenne des FC de repos dans les 14 jours précédant l'avant-dernier matin.
  const windowStart = parseISODate(prev.date).getTime() - 14 * 86_400_000
  const baselinePts = pts
    .slice(0, pts.length - 2)
    .filter((m) => parseISODate(m.date).getTime() >= windowStart)
  if (baselinePts.length === 0) return null
  const baseline =
    baselinePts.reduce((sum, m) => sum + (m.restingHr as number), 0) / baselinePts.length

  const threshold = baseline + 7
  if ((last.restingHr as number) >= threshold && (prev.restingHr as number) >= threshold) {
    return {
      id: 'resting-hr',
      level: 'warning',
      title: 'FC de repos élevée',
      message: `FC de repos ≥ ${Math.round(threshold)} bpm sur 2 matins (moyenne 14 j : ${Math.round(baseline)}). Semaine allégée −30 % recommandée.`,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Règle 2 — Allure Z2 dégradée à FC équivalente
// ---------------------------------------------------------------------------

export interface Z2Sample {
  date: string
  paceS: number
  hr: number
}

/**
 * Allure moyenne en Z2 dégradée de plus de 20 s/km à FC équivalente (±3 bpm).
 * Compare le dernier échantillon Z2 à la médiane des précédents à FC comparable.
 */
export function z2PaceAlert(samples: Z2Sample[], hrToleranceBpm = 3): Alert | null {
  const valid = samples
    .filter((s) => s.paceS > 0 && s.hr > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (valid.length < 2) return null

  const last = valid[valid.length - 1]
  const reference = valid
    .slice(0, valid.length - 1)
    .filter((s) => Math.abs(s.hr - last.hr) <= hrToleranceBpm)
  if (reference.length === 0) return null

  const paces = reference.map((s) => s.paceS).sort((a, b) => a - b)
  const median = paces[Math.floor((paces.length - 1) / 2)]
  const drift = last.paceS - median // positif = plus lent

  if (drift > 20) {
    return {
      id: 'z2-pace',
      level: 'warning',
      title: 'Allure Z2 en baisse',
      message: `Allure Z2 dégradée de ${Math.round(drift)} s/km à FC équivalente. Supprimer la séance de qualité de la semaine.`,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Règle 3 — Fatigue ≥ 4 sur 2 séances consécutives
// ---------------------------------------------------------------------------

export function fatigueAlert(logs: LoggedSession[]): Alert | null {
  const done = logs
    .filter((l) => l.done)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (done.length < 2) return null
  const a = done[done.length - 1]
  const b = done[done.length - 2]
  if (a.fatigue >= 4 && b.fatigue >= 4) {
    return {
      id: 'fatigue',
      level: 'warning',
      title: 'Fatigue persistante',
      message: `Fatigue ≥ 4 déclarée sur 2 séances consécutives. Envisager du repos ou une séance allégée.`,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Règle 4 & 5 — Douleur
// ---------------------------------------------------------------------------

/** Alerte sur la douleur la plus récente (fenêtre en jours). Zone osseuse → rouge bloquante. */
export function painAlert(logs: LoggedSession[], todayISO: string, windowDays = 10): Alert | null {
  const withPain = logs
    .filter((l) => l.pain && l.pain.intensity >= 3)
    .filter((l) => {
      const gap = Math.round(
        (parseISODate(todayISO).getTime() - parseISODate(l.date).getTime()) / 86_400_000,
      )
      return gap >= 0 && gap <= windowDays
    })
    .sort((a, b) => a.date.localeCompare(b.date))
  if (withPain.length === 0) return null

  const latest = withPain[withPain.length - 1]
  const pain = latest.pain!

  if (isBoneArea(pain.area)) {
    return {
      id: 'pain-bone',
      level: 'danger',
      blocking: true,
      title: 'Douleur en zone osseuse',
      message: `Douleur "${pain.area}" (intensité ${pain.intensity}). Arrêt de la course et avis médical avant de reprendre.`,
    }
  }

  return {
    id: 'pain',
    level: 'warning',
    title: 'Douleur signalée',
    message: `Douleur "${pain.area}" (intensité ${pain.intensity}). Surveiller ; ne pas forcer.`,
  }
}

// ---------------------------------------------------------------------------
// Règle 6 — Cumul kilométrique en cours de semaine > +10 % vs semaine précédente
// ---------------------------------------------------------------------------

export function volumeSpikeAlert(currentWeekKm: number, previousWeekKm: number): Alert | null {
  if (previousWeekKm <= 0) return null
  if (currentWeekKm > previousWeekKm * 1.1) {
    const pct = Math.round((currentWeekKm / previousWeekKm - 1) * 100)
    return {
      id: 'volume-spike',
      level: 'warning',
      title: 'Charge en hausse rapide',
      message: `Cumul de la semaine (${currentWeekKm.toFixed(1)} km) déjà +${pct} % vs la semaine précédente (${previousWeekKm.toFixed(1)} km).`,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Contrôle de répartition Z1–Z2 (cible 80 %, seuil visuel 75 %)
// ---------------------------------------------------------------------------

export interface DistributionResult {
  lowIntensityPct: number // % du temps en Z1–Z2
  belowTarget: boolean // < 80 %
  warning: boolean // < 75 %
}

/** Part du temps (ou volume) passé en Z1–Z2 à partir de secondes par zone. */
export function z1z2Distribution(secondsByZone: Record<string, number>): DistributionResult {
  const total = Object.values(secondsByZone).reduce((a, b) => a + b, 0)
  if (total === 0) return { lowIntensityPct: 0, belowTarget: false, warning: false }
  const low = (secondsByZone['Z1'] ?? 0) + (secondsByZone['Z2'] ?? 0)
  const pct = (low / total) * 100
  return {
    lowIntensityPct: Math.round(pct),
    belowTarget: pct < 80,
    warning: pct < 75,
  }
}

// ---------------------------------------------------------------------------
// Deux séances de qualité max/semaine, jamais consécutives
// ---------------------------------------------------------------------------

export interface QualityCheck {
  count: number
  tooMany: boolean // > 2 qualités
  consecutive: boolean // 2 qualités sur des jours consécutifs
}

/** Vérifie la répartition des séances de qualité d'une semaine (par dayOfWeek). */
export function checkQualitySpacing(sessions: Session[]): QualityCheck {
  const qualityDays = sessions
    .filter((s) => s.isQuality)
    .map((s) => s.dayOfWeek)
    .sort((a, b) => a - b)
  let consecutive = false
  for (let i = 1; i < qualityDays.length; i++) {
    if (qualityDays[i] - qualityDays[i - 1] === 1) consecutive = true
  }
  return {
    count: qualityDays.length,
    tooMany: qualityDays.length > 2,
    consecutive,
  }
}

// ---------------------------------------------------------------------------
// Agrégation
// ---------------------------------------------------------------------------

export interface AlertContext {
  measurements: Measurement[]
  logs: LoggedSession[]
  z2Samples: Z2Sample[]
  currentWeekKm: number
  previousWeekKm: number
  todayISO: string
}

/** Assemble toutes les alertes actives. Bloquantes d'abord, puis par sévérité. */
export function computeAlerts(ctx: AlertContext): Alert[] {
  const alerts: Alert[] = []
  const push = (a: Alert | null) => {
    if (a) alerts.push(a)
  }
  push(painAlert(ctx.logs, ctx.todayISO))
  push(restingHrAlert(ctx.measurements))
  push(z2PaceAlert(ctx.z2Samples))
  push(fatigueAlert(ctx.logs))
  push(volumeSpikeAlert(ctx.currentWeekKm, ctx.previousWeekKm))

  const rank: Record<AlertLevel, number> = { danger: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => {
    if (!!b.blocking !== !!a.blocking) return b.blocking ? 1 : -1
    return rank[a.level] - rank[b.level]
  })
}
