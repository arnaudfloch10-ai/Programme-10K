import { useState } from 'react'
import {
  restingHrAlert,
  z2PaceAlert,
  fatigueAlert,
  painAlert,
  volumeSpikeAlert,
  type Alert,
} from '../lib/alerts'
import type { LoggedSession, Measurement } from '../types'
import { todayISO, toISODate, parseISODate } from '../lib/format'
import { AlertBanner } from './AlertBanner'

// Mode test : déclenche chacune des six règles avec des données synthétiques,
// pour vérifier visuellement que le moteur d'alertes fonctionne.
function daysAgo(n: number): string {
  const d = parseISODate(todayISO())
  d.setDate(d.getDate() - n)
  return toISODate(d)
}

function baseLog(p: Partial<LoggedSession>): LoggedSession {
  return { sessionId: 'test', date: todayISO(), done: true, vmaAtDate: 12.5, feel: 3, fatigue: 2, ...p }
}

interface Case {
  rule: string
  build: () => Alert | null
}

const CASES: Case[] = [
  {
    rule: 'FC de repos +7 bpm sur 2 matins',
    build: () =>
      restingHrAlert(
        [
          { date: daysAgo(10), restingHr: 50 },
          { date: daysAgo(9), restingHr: 50 },
          { date: daysAgo(8), restingHr: 49 },
          { date: daysAgo(1), restingHr: 58 },
          { date: daysAgo(0), restingHr: 59 },
        ] as Measurement[],
      ),
  },
  {
    rule: 'Allure Z2 dégradée > 20 s/km',
    build: () =>
      z2PaceAlert([
        { date: daysAgo(14), paceS: 390, hr: 150 },
        { date: daysAgo(7), paceS: 392, hr: 151 },
        { date: daysAgo(0), paceS: 420, hr: 150 },
      ]),
  },
  {
    rule: 'Fatigue ≥ 4 sur 2 séances',
    build: () =>
      fatigueAlert([
        baseLog({ date: daysAgo(2), fatigue: 4 }),
        baseLog({ date: daysAgo(0), fatigue: 5 }),
      ]),
  },
  {
    rule: 'Douleur intensité ≥ 3',
    build: () =>
      painAlert([baseLog({ date: daysAgo(0), pain: { area: 'mollet', intensity: 3, note: '' } })], todayISO()),
  },
  {
    rule: 'Douleur en zone osseuse (bloquante)',
    build: () =>
      painAlert([baseLog({ date: daysAgo(0), pain: { area: 'tibia', intensity: 4, note: '' } })], todayISO()),
  },
  {
    rule: 'Cumul hebdo > +10 %',
    build: () => volumeSpikeAlert(34, 30),
  },
]

export function AlertsTest() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="tap w-full rounded-md border border-line py-2 font-cond text-sm">
        Tester le moteur d'alertes
      </button>
    )
  }
  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="label">Test des alertes</div>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-soft">
          fermer
        </button>
      </div>
      <p className="text-xs text-ink-soft">
        Chaque règle est déclenchée avec des données fictives (non enregistrées). Vérifie le rendu et la sévérité.
      </p>
      {CASES.map((c) => {
        const alert = c.build()
        return (
          <div key={c.rule} className="space-y-1">
            <div className="num text-xs text-ink-soft">
              {alert ? '✓' : '✗'} {c.rule}
            </div>
            {alert && <AlertBanner alert={alert} />}
          </div>
        )
      })}
    </div>
  )
}
