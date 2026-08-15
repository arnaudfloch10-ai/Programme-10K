import { describe, it, expect } from 'vitest'
import {
  fcTropHauteAlert,
  deriveCardiaqueAlert,
  fcReposEleveeAlert,
  cadenceBasseAlert,
  ressentiBasAlert,
  volumeExcessifAlert,
  computeFcAlerts,
  type SeanceSample,
} from './fcAlerts'
import type { MesureMatinale } from '../types'

const s = (p: Partial<SeanceSample>): SeanceSample => ({ date: '2026-08-10', type: 'EF', ressenti: 3, ...p })

describe('règle 1 — FC EF trop haute', () => {
  it('déclenche si dernière séance EF avec FC moy > 158', () => {
    expect(fcTropHauteAlert([s({ fcMoy: 162 })])).not.toBeNull()
  })
  it('ne déclenche pas à 158 ou moins', () => {
    expect(fcTropHauteAlert([s({ fcMoy: 155 })])).toBeNull()
  })
  it('ignore les séances non EF', () => {
    expect(fcTropHauteAlert([s({ type: 'TEST', fcMoy: 170 })])).toBeNull()
  })
})

describe('règle 2 — dérive cardiaque', () => {
  it('déclenche si FC max − FC moy > 25', () => {
    expect(deriveCardiaqueAlert([s({ fcMoy: 145, fcMax: 172 })])).not.toBeNull()
  })
  it('ne déclenche pas à 25 ou moins', () => {
    expect(deriveCardiaqueAlert([s({ fcMoy: 150, fcMax: 175 })])).toBeNull()
  })
})

describe('règle 3 — FC repos ≥ 69 sur 3 jours', () => {
  it('déclenche sur 3 jours consécutifs', () => {
    const m: MesureMatinale[] = [
      { date: '2026-08-08', fcRepos: 70, qualiteSommeil: 3 },
      { date: '2026-08-09', fcRepos: 69, qualiteSommeil: 3 },
      { date: '2026-08-10', fcRepos: 71, qualiteSommeil: 3 },
    ]
    expect(fcReposEleveeAlert(m)).not.toBeNull()
  })
  it('ne déclenche pas si un jour manque', () => {
    const m: MesureMatinale[] = [
      { date: '2026-08-08', fcRepos: 70, qualiteSommeil: 3 },
      { date: '2026-08-10', fcRepos: 70, qualiteSommeil: 3 },
      { date: '2026-08-11', fcRepos: 70, qualiteSommeil: 3 },
    ]
    expect(fcReposEleveeAlert(m)).toBeNull()
  })
  it('ne déclenche pas sous 69', () => {
    const m: MesureMatinale[] = [
      { date: '2026-08-08', fcRepos: 62, qualiteSommeil: 3 },
      { date: '2026-08-09', fcRepos: 63, qualiteSommeil: 3 },
      { date: '2026-08-10', fcRepos: 64, qualiteSommeil: 3 },
    ]
    expect(fcReposEleveeAlert(m)).toBeNull()
  })
})

describe('règle 4 — cadence basse', () => {
  it('déclenche si cadence < 155 sur 3 séances', () => {
    const arr = [s({ cadence: 150 }), s({ cadence: 152 }), s({ cadence: 149 })]
    expect(cadenceBasseAlert(arr)).not.toBeNull()
  })
  it('ne déclenche pas si une séance ≥ 155', () => {
    const arr = [s({ cadence: 150 }), s({ cadence: 158 }), s({ cadence: 149 })]
    expect(cadenceBasseAlert(arr)).toBeNull()
  })
})

describe('règle 5 — ressenti bas', () => {
  it('déclenche à ressenti ≤ 2 sur 2 séances', () => {
    expect(ressentiBasAlert([s({ ressenti: 2 }), s({ ressenti: 1 })])).not.toBeNull()
  })
  it('ne déclenche pas si une séance > 2', () => {
    expect(ressentiBasAlert([s({ ressenti: 2 }), s({ ressenti: 3 })])).toBeNull()
  })
})

describe('règle 6 — volume excessif', () => {
  it('déclenche au-delà de +10 %', () => {
    expect(volumeExcessifAlert(120, 105)).not.toBeNull()
  })
  it('ne déclenche pas à +10 % ou moins', () => {
    expect(volumeExcessifAlert(115, 105)).toBeNull()
  })
})

describe('computeFcAlerts', () => {
  it('agrège plusieurs règles', () => {
    const alerts = computeFcAlerts({
      seances: [s({ fcMoy: 162, fcMax: 190, ressenti: 2 }), s({ fcMoy: 165, fcMax: 192, ressenti: 1 })],
      mesures: [],
      currentWeekMin: 130,
      previousWeekMin: 100,
    })
    // fc-trop-haute + derive + ressenti-bas + volume-excessif
    expect(alerts.length).toBeGreaterThanOrEqual(4)
    expect(alerts.every((a) => !a.blocking)).toBe(true)
  })
})
