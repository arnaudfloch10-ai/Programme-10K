// Moteur d'alertes du profil FC (Charline). Pur, testable.
// Alertes INFORMATIVES, jamais bloquantes. Ton neutre, aucun message de motivation.
import type { MesureMatinale } from '../types'
import type { Alert } from './alerts'
import { parseISODate } from './format'

export interface SeanceSample {
  date: string
  type: string // "EF", "EF + cadence"… ('TEST' exclu du suivi qualitatif)
  fcMoy?: number
  fcMax?: number
  cadence?: number
  ressenti: number
}

// Règle 1 — FC moyenne > 158 sur une séance EF (dernière séance).
export function fcTropHauteAlert(seances: SeanceSample[]): Alert | null {
  const last = seances[seances.length - 1]
  if (!last || !last.type.includes('EF') || last.fcMoy == null) return null
  if (last.fcMoy > 158) {
    return {
      id: 'fc-trop-haute',
      level: 'warning',
      title: 'Séance courue trop vite',
      message: 'La prochaine sortie doit rester sous 155 bpm, même à 9\'30"/km.',
    }
  }
  return null
}

// Règle 2 — Dérive cardiaque : FC max − FC moy > 25 (dernière séance).
export function deriveCardiaqueAlert(seances: SeanceSample[]): Alert | null {
  const last = seances[seances.length - 1]
  if (!last || last.fcMax == null || last.fcMoy == null) return null
  if (last.fcMax - last.fcMoy > 25) {
    return {
      id: 'derive-cardiaque',
      level: 'warning',
      title: 'Forte dérive cardiaque',
      message: "L'allure était au-dessus de l'état stable. Ralentir dès le départ.",
    }
  }
  return null
}

// Règle 3 — FC de repos ≥ 69 sur 3 jours consécutifs.
export function fcReposEleveeAlert(mesures: MesureMatinale[]): Alert | null {
  const pts = mesures.filter((m) => typeof m.fcRepos === 'number').sort((a, b) => a.date.localeCompare(b.date))
  if (pts.length < 3) return null
  const last3 = pts.slice(-3)
  const consecutive =
    daysBetween(last3[0].date, last3[1].date) === 1 && daysBetween(last3[1].date, last3[2].date) === 1
  if (consecutive && last3.every((m) => (m.fcRepos as number) >= 69)) {
    return {
      id: 'fc-repos-elevee',
      level: 'warning',
      title: 'Fatigue accumulée',
      message: 'Alléger la semaine et remonter l\'info au coach.',
    }
  }
  return null
}

// Règle 4 — Cadence < 155 sur 3 séances consécutives.
export function cadenceBasseAlert(seances: SeanceSample[]): Alert | null {
  const withCad = seances.filter((s) => typeof s.cadence === 'number')
  if (withCad.length < 3) return null
  const last3 = withCad.slice(-3)
  if (last3.every((s) => (s.cadence as number) < 155)) {
    return {
      id: 'cadence-basse',
      level: 'info',
      title: 'Travailler la cadence',
      message: '10 min au métronome à 160 en fin de sortie.',
    }
  }
  return null
}

// Règle 5 — Ressenti ≤ 2 sur 2 séances consécutives.
export function ressentiBasAlert(seances: SeanceSample[]): Alert | null {
  if (seances.length < 2) return null
  const last2 = seances.slice(-2)
  if (last2.every((s) => s.ressenti <= 2)) {
    return {
      id: 'ressenti-bas',
      level: 'info',
      title: 'Deux séances difficiles d\'affilée',
      message: 'Vérifier sommeil et récupération.',
    }
  }
  return null
}

// Règle 6 — Volume hebdo réalisé > +10 % vs semaine précédente.
export function volumeExcessifAlert(currentWeekMin: number, previousWeekMin: number): Alert | null {
  if (previousWeekMin <= 0) return null
  if (currentWeekMin > previousWeekMin * 1.1) {
    return {
      id: 'volume-excessif',
      level: 'warning',
      title: 'Progression trop rapide',
      message: 'Risque de blessure de surcharge.',
    }
  }
  return null
}

function daysBetween(aISO: string, bISO: string): number {
  return Math.round((parseISODate(bISO).getTime() - parseISODate(aISO).getTime()) / 86_400_000)
}

export interface FcAlertContext {
  seances: SeanceSample[]
  mesures: MesureMatinale[]
  currentWeekMin: number
  previousWeekMin: number
}

export function computeFcAlerts(ctx: FcAlertContext): Alert[] {
  const alerts: Alert[] = []
  const push = (a: Alert | null) => {
    if (a) alerts.push(a)
  }
  push(fcTropHauteAlert(ctx.seances))
  push(deriveCardiaqueAlert(ctx.seances))
  push(fcReposEleveeAlert(ctx.mesures))
  push(cadenceBasseAlert(ctx.seances))
  push(ressentiBasAlert(ctx.seances))
  push(volumeExcessifAlert(ctx.currentWeekMin, ctx.previousWeekMin))
  const rank = { warning: 0, info: 1, danger: 0 } as const
  return alerts.sort((a, b) => rank[a.level] - rank[b.level])
}
