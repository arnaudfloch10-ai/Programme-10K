import { useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { SeanceCard } from '../../components/reprise/SeanceCard'
import { TestDemiCooper } from './TestDemiCooper'
import { Mono } from '../../components/ui'

export function RepriseToday() {
  const { plan, activeWeek, setActiveWeek } = useReprise()
  const [test, setTest] = useState(false)

  const bloc1 = plan.blocs[0]
  const weeks = bloc1.semaines
  const week = weeks.find((w) => w.numero === activeWeek) ?? weeks[0]
  const f = plan.fourchetteTravailParDefaut

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <div className="label">Bloc 1 · {bloc1.titre}</div>
        <h1 className="screen-title">Aujourd'hui</h1>
      </header>

      {/* Navigation de semaine (plan relatif, sans dates). */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveWeek(Math.max(1, week.numero - 1))}
          disabled={week.numero === 1}
          className="tap px-2 font-cond text-lg disabled:opacity-30"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-cond text-xl font-bold">
            Semaine {week.numero}
            {week.allegee && (
              <span className="ml-2 rounded border border-line px-1.5 py-0.5 text-xs font-normal uppercase">allégée</span>
            )}
          </div>
          <Mono className="text-xs text-ink-soft">
            objectif {week.volumeCibleMin} min · ~{week.volumeCibleKm} km
          </Mono>
        </div>
        <button
          onClick={() => setActiveWeek(Math.min(weeks.length, week.numero + 1))}
          disabled={week.numero === weeks.length}
          className="tap px-2 font-cond text-lg disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Fourchette de travail par défaut + consigne clé. */}
      <div className="rounded-md p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, white)' }}>
        <div className="flex items-baseline justify-between">
          <span className="label">Fourchette par défaut</span>
          <Mono className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            {f.min}–{f.max} <span className="text-xs text-ink-soft">bpm</span>
          </Mono>
        </div>
        <p className="mt-1 text-sm">{week.consigneCle}</p>
      </div>

      <div className="space-y-3">
        {week.seances.map((s) => (
          <SeanceCard key={s.id} seance={s} onOpenTest={() => setTest(true)} />
        ))}
      </div>

      {test && <TestDemiCooper onClose={() => setTest(false)} />}
    </div>
  )
}
