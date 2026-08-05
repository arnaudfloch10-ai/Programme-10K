// Résolution d'une séance en allures concrètes à partir de la VMA courante.
// AUCUNE allure n'est stockée : tout est dérivé ici. Change la VMA → tout suit.
import type { Interval, Session, ZoneId } from '../types'
import {
  formatPace,
  formatDuration,
  isTrainingZone,
  zonePace,
  zonePaceRange,
  type ZonePosition,
} from './zones'

/** Allure (s/km) pour une zone + position, ou null pour FORCE/REST (non chiffrable). */
export function resolvePace(vma: number, zone: ZoneId, position?: ZonePosition): number | null {
  if (!isTrainingZone(zone)) return null
  return zonePace(vma, zone, position ?? 'milieu')
}

export interface ResolvedInterval {
  raw: Interval
  /** Libellé de l'effort : "8×800 m", "3×10'", "6×20\"". */
  effortLabel: string
  /** Allure d'effort formatée "m:ss", ou null si non chiffrable (côtes/lignes). */
  paceLabel: string | null
  /** Fourchette d'allures de la zone pour affichage secondaire. */
  rangeLabel: string | null
  zone: ZoneId
  /** Récupération formatée, ex. "r 2'30 Z1 trot" / "r 200 m trot". */
  recoveryLabel: string | null
}

function effortLabel(iv: Interval): string {
  const rep = iv.reps > 1 ? `${iv.reps}×` : ''
  if (iv.distanceM != null) {
    const d = iv.distanceM >= 1000 ? `${iv.distanceM / 1000} km` : `${iv.distanceM} m`
    return `${rep}${d}`
  }
  if (iv.durationS != null) {
    return `${rep}${formatSecShort(iv.durationS)}`
  }
  return `${rep}effort`
}

/** Format court d'une durée : 20 → 20", 150 → 2'30, 600 → 10'. */
export function formatSecShort(s: number): string {
  if (s < 60) return `${s}"`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem === 0 ? `${m}'` : `${m}'${String(rem).padStart(2, '0')}`
}

function recoveryLabel(iv: Interval): string | null {
  const parts: string[] = []
  if (iv.recoveryDistanceM != null) parts.push(`${iv.recoveryDistanceM} m`)
  else if (iv.recoveryS != null) parts.push(formatSecShort(iv.recoveryS))
  else return null
  if (iv.recoveryZone) parts.push(iv.recoveryZone)
  if (iv.recoveryType) parts.push(iv.recoveryType)
  return `r ${parts.join(' ')}`
}

export function resolveInterval(vma: number, iv: Interval): ResolvedInterval {
  const pace = resolvePace(vma, iv.zone, iv.zonePosition)
  const range = isTrainingZone(iv.zone) ? zonePaceRange(vma, iv.zone) : null
  return {
    raw: iv,
    effortLabel: iv.label ? `${effortLabel(iv)} ${iv.label}` : effortLabel(iv),
    paceLabel: pace != null ? formatPace(pace) : null,
    rangeLabel: range ? `${formatPace(range.fastS)}–${formatPace(range.slowS)}` : null,
    zone: iv.zone,
    recoveryLabel: recoveryLabel(iv),
  }
}

export interface ResolvedSession {
  warmup: { km: number; zone: ZoneId; pace: string | null } | null
  steady: { km: number; zone: ZoneId; pace: string | null } | null
  intervals: ResolvedInterval[]
  cooldown: { km: number } | null
}

/** Résout toute une séance pour l'affichage détaillé (écran Aujourd'hui / Semaine). */
export function resolveSession(vma: number, s: Session): ResolvedSession {
  return {
    warmup:
      s.warmupKm != null
        ? {
            km: s.warmupKm,
            zone: s.warmupZone ?? 'Z2',
            pace: resolvePaceLabel(vma, s.warmupZone ?? 'Z2'),
          }
        : null,
    steady:
      s.steadyKm != null
        ? {
            km: s.steadyKm,
            zone: s.steadyZone ?? 'Z2',
            pace: resolvePaceLabel(vma, s.steadyZone ?? 'Z2', s.steadyZonePosition),
          }
        : null,
    intervals: (s.intervals ?? []).map((iv) => resolveInterval(vma, iv)),
    cooldown: s.cooldownKm != null ? { km: s.cooldownKm } : null,
  }
}

function resolvePaceLabel(vma: number, zone: ZoneId, position?: ZonePosition): string | null {
  const p = resolvePace(vma, zone, position)
  return p != null ? formatPace(p) : null
}

export { formatDuration }
