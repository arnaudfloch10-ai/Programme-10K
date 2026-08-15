import { useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { SeanceCard } from '../../components/reprise/SeanceCard'
import { SeanceForm } from '../../components/reprise/SeanceForm'
import { TestDemiCooper } from './TestDemiCooper'
import { Mono } from '../../components/ui'
import type { RepriseSeance } from '../../types'

// Navigateur des 4 semaines du bloc 1 + séances de la semaine sélectionnée.
// §3 : « SEM. n » désigne une semaine ; S1/S2/S3 restent réservés aux séances.
export function RepriseSemaine() {
  const { plan, activeWeek, setActiveWeek, seances } = useReprise()
  const [test, setTest] = useState(false)
  const [logSeance, setLogSeance] = useState<RepriseSeance | null>(null)
  const weeks = plan.blocs[0].semaines
  const week = weeks.find((w) => w.numero === activeWeek) ?? weeks[0]

  // État « fait » : une séance de plan est saisie si un enregistrement porte son id.
  const realiseeOf = (id: string) => seances.find((s) => s.seanceId === id)

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <h1 className="screen-title">Semaine</h1>
        <p className="text-sm text-ink-soft">Bloc 1 — choisis la semaine en cours.</p>
      </header>

      <div className="space-y-2">
        {weeks.map((w) => {
          const active = w.numero === activeWeek
          return (
            <button
              key={w.numero}
              onClick={() => setActiveWeek(w.numero)}
              className="card flex w-full items-center gap-3 p-3 text-left"
              style={active ? { borderColor: 'var(--accent)', borderWidth: 2 } : undefined}
            >
              <div className="w-14 shrink-0 text-center">
                <div className="font-cond text-sm font-bold">SEM. {w.numero}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Mono className="text-sm font-bold">{w.volumeCibleMin} min</Mono>
                  <Mono className="text-xs text-ink-soft">~{w.volumeCibleKm} km</Mono>
                  {w.allegee && <span className="text-[10px] font-bold uppercase text-ink-soft">allégée</span>}
                </div>
                <div className="truncate text-xs text-ink-soft">{w.consigneCle}</div>
              </div>
              {active && (
                <span className="shrink-0 font-cond text-xs font-bold" style={{ color: 'var(--accent)' }}>
                  active
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Séances de la semaine sélectionnée, chacune saisissable. */}
      <div className="space-y-3 pt-1">
        <div className="label">Séances · semaine {week.numero}</div>
        {week.seances.map((s) => (
          <SeanceCard
            key={s.id}
            seance={s}
            onOpenTest={() => setTest(true)}
            onLog={() => setLogSeance(s)}
            realisee={realiseeOf(s.id)}
          />
        ))}
      </div>

      {test && <TestDemiCooper onClose={() => setTest(false)} />}
      {logSeance && <SeanceForm seance={logSeance} onClose={() => setLogSeance(null)} />}
    </div>
  )
}
