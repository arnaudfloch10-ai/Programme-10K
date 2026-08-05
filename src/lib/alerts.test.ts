import { describe, it, expect } from 'vitest'
import {
  restingHrAlert,
  z2PaceAlert,
  fatigueAlert,
  painAlert,
  volumeSpikeAlert,
  z1z2Distribution,
  checkQualitySpacing,
  computeAlerts,
  type Z2Sample,
} from './alerts'
import type { LoggedSession, Measurement, Session } from '../types'

function log(partial: Partial<LoggedSession>): LoggedSession {
  return {
    sessionId: 's',
    date: '2026-08-10',
    done: true,
    vmaAtDate: 12.5,
    feel: 3,
    fatigue: 2,
    ...partial,
  }
}

describe('restingHrAlert', () => {
  it('déclenche à +7 bpm sur 2 matins consécutifs', () => {
    const m: Measurement[] = [
      { date: '2026-08-01', restingHr: 50 },
      { date: '2026-08-02', restingHr: 50 },
      { date: '2026-08-03', restingHr: 48 },
      { date: '2026-08-04', restingHr: 58 }, // consécutif
      { date: '2026-08-05', restingHr: 59 }, // consécutif
    ]
    const a = restingHrAlert(m)
    expect(a).not.toBeNull()
    expect(a!.level).toBe('warning')
  })

  it('ne déclenche pas si un seul matin est élevé', () => {
    const m: Measurement[] = [
      { date: '2026-08-01', restingHr: 50 },
      { date: '2026-08-02', restingHr: 50 },
      { date: '2026-08-03', restingHr: 50 },
      { date: '2026-08-04', restingHr: 50 },
      { date: '2026-08-05', restingHr: 60 },
    ]
    expect(restingHrAlert(m)).toBeNull()
  })

  it('ne déclenche pas si les 2 matins ne sont pas consécutifs', () => {
    const m: Measurement[] = [
      { date: '2026-08-01', restingHr: 50 },
      { date: '2026-08-02', restingHr: 50 },
      { date: '2026-08-04', restingHr: 58 },
      { date: '2026-08-07', restingHr: 59 },
    ]
    expect(restingHrAlert(m)).toBeNull()
  })
})

describe('z2PaceAlert', () => {
  it('déclenche si dégradation > 20 s/km à FC équivalente', () => {
    const s: Z2Sample[] = [
      { date: '2026-08-01', paceS: 390, hr: 150 },
      { date: '2026-08-08', paceS: 392, hr: 151 },
      { date: '2026-08-15', paceS: 420, hr: 150 }, // +30 s/km à FC équivalente
    ]
    const a = z2PaceAlert(s)
    expect(a).not.toBeNull()
    expect(a!.message).toContain('qualité')
  })

  it('ne déclenche pas si la FC diffère trop', () => {
    const s: Z2Sample[] = [
      { date: '2026-08-01', paceS: 390, hr: 150 },
      { date: '2026-08-15', paceS: 420, hr: 165 }, // FC bien plus haute → non comparable
    ]
    expect(z2PaceAlert(s)).toBeNull()
  })

  it('ne déclenche pas pour une petite variation', () => {
    const s: Z2Sample[] = [
      { date: '2026-08-01', paceS: 390, hr: 150 },
      { date: '2026-08-15', paceS: 400, hr: 150 },
    ]
    expect(z2PaceAlert(s)).toBeNull()
  })
})

describe('fatigueAlert', () => {
  it('déclenche à fatigue ≥ 4 sur 2 séances consécutives', () => {
    const logs = [
      log({ date: '2026-08-10', fatigue: 4 }),
      log({ date: '2026-08-12', fatigue: 5 }),
    ]
    expect(fatigueAlert(logs)).not.toBeNull()
  })

  it('ne déclenche pas si une seule séance fatiguée', () => {
    const logs = [
      log({ date: '2026-08-10', fatigue: 2 }),
      log({ date: '2026-08-12', fatigue: 5 }),
    ]
    expect(fatigueAlert(logs)).toBeNull()
  })
})

describe('painAlert', () => {
  it('douleur intensité ≥ 3 → avertissement', () => {
    const logs = [log({ date: '2026-08-12', pain: { area: 'mollet', intensity: 3, note: '' } })]
    const a = painAlert(logs, '2026-08-13')
    expect(a).not.toBeNull()
    expect(a!.level).toBe('warning')
    expect(a!.blocking).toBeFalsy()
  })

  it('douleur en zone osseuse → rouge bloquante (même avec accent)', () => {
    const logs = [log({ date: '2026-08-12', pain: { area: 'Métatarse droit', intensity: 4, note: '' } })]
    const a = painAlert(logs, '2026-08-13')
    expect(a).not.toBeNull()
    expect(a!.level).toBe('danger')
    expect(a!.blocking).toBe(true)
  })

  it('tibia déclenche aussi le blocage', () => {
    const logs = [log({ date: '2026-08-12', pain: { area: 'tibia gauche', intensity: 3, note: '' } })]
    expect(painAlert(logs, '2026-08-13')!.blocking).toBe(true)
  })

  it('ignore les douleurs hors fenêtre', () => {
    const logs = [log({ date: '2026-07-01', pain: { area: 'genou', intensity: 4, note: '' } })]
    expect(painAlert(logs, '2026-08-13')).toBeNull()
  })

  it('ignore intensité < 3', () => {
    const logs = [log({ date: '2026-08-12', pain: { area: 'genou', intensity: 2, note: '' } })]
    expect(painAlert(logs, '2026-08-13')).toBeNull()
  })
})

describe('volumeSpikeAlert', () => {
  it('déclenche au-delà de +10 %', () => {
    expect(volumeSpikeAlert(34, 30)).not.toBeNull()
  })
  it('ne déclenche pas à +10 % ou moins', () => {
    expect(volumeSpikeAlert(33, 30)).toBeNull()
  })
})

describe('z1z2Distribution', () => {
  it('calcule le % Z1–Z2 et les seuils', () => {
    const r = z1z2Distribution({ Z1: 20, Z2: 60, Z3: 5, Z4: 10, Z5: 5 })
    expect(r.lowIntensityPct).toBe(80)
    expect(r.belowTarget).toBe(false)
    expect(r.warning).toBe(false)
  })
  it('signale sous 75 %', () => {
    const r = z1z2Distribution({ Z1: 10, Z2: 60, Z3: 10, Z4: 15, Z5: 5 })
    expect(r.warning).toBe(true)
  })
})

describe('checkQualitySpacing', () => {
  const q = (dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7): Session => ({
    id: `q${dayOfWeek}`,
    dayOfWeek,
    type: 'SEUIL',
    title: 'Q',
    totalKm: 8,
    isQuality: true,
  })

  it('détecte deux qualités consécutives', () => {
    const r = checkQualitySpacing([q(2), q(3)])
    expect(r.consecutive).toBe(true)
  })
  it('ok si les qualités sont espacées', () => {
    const r = checkQualitySpacing([q(2), q(5)])
    expect(r.consecutive).toBe(false)
    expect(r.tooMany).toBe(false)
  })
  it('signale plus de deux qualités', () => {
    const r = checkQualitySpacing([q(2), q(5), q(7)])
    expect(r.tooMany).toBe(true)
  })
})

describe('computeAlerts', () => {
  it('classe la douleur osseuse bloquante en premier', () => {
    const alerts = computeAlerts({
      measurements: [],
      logs: [log({ date: '2026-08-12', pain: { area: 'hanche', intensity: 4, note: '' }, fatigue: 5 })],
      z2Samples: [],
      currentWeekKm: 40,
      previousWeekKm: 30,
      todayISO: '2026-08-13',
    })
    expect(alerts[0].blocking).toBe(true)
    expect(alerts.length).toBeGreaterThanOrEqual(2)
  })
})
