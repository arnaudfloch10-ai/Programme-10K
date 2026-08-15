import { useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { useApp } from '../../store/AppContext'
import { SeanceCard } from '../../components/reprise/SeanceCard'
import { TestDemiCooper } from './TestDemiCooper'
import { SeanceForm } from '../../components/reprise/SeanceForm'
import { MesureForm } from '../../components/reprise/MesureForm'
import { AlertList } from '../../components/AlertBanner'
import { Mono } from '../../components/ui'
import { seanceForDay, nextSeanceFrom, nextSeanceSummary, jourIndexFromISO } from '../../lib/repriseSchedule'
import type { RepriseSeance } from '../../types'

export function RepriseToday() {
  const { plan, activeWeek, alerts, seances, mesures } = useReprise()
  const { today } = useApp()
  const [test, setTest] = useState(false)
  const [mesure, setMesure] = useState(false)
  const [logSeance, setLogSeance] = useState<RepriseSeance | null>(null)

  const bloc1 = plan.blocs[0]
  const weeks = bloc1.semaines
  // La semaine en cours est choisie dans l'onglet SEMAINE (persistée) — pas ici.
  const week = weeks.find((w) => w.numero === activeWeek) ?? weeks[0]
  const f = plan.fourchetteTravailParDefaut

  const dayIdx = jourIndexFromISO(today)
  const todaySeance = seanceForDay(week.seances, dayIdx)
  const nextSeance = nextSeanceFrom(week.seances, dayIdx)
  const realiseeOf = (id: string) => seances.find((s) => s.seanceId === id && s.date === today)
  const mesureToday = mesures.find((m) => m.date === today)

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <div className="label">Bloc 1 · {bloc1.titre} · semaine {week.numero}</div>
        <h1 className="screen-title">Aujourd'hui</h1>
      </header>

      {/* Alertes informatives (jamais bloquantes), en haut de l'accueil. */}
      <AlertList alerts={alerts} />

      {/* Saisie matinale, accès direct en un tap. */}
      <button
        onClick={() => setMesure(true)}
        className="tap w-full rounded-md border border-line py-2.5 text-center font-cond text-sm font-semibold text-ink-soft"
      >
        {mesureToday
          ? `Ce matin · FC repos ${mesureToday.fcRepos ?? '—'} · sommeil ${mesureToday.qualiteSommeil}/5 — modifier`
          : 'Saisie du matin (FC repos · sommeil)'}
      </button>

      {/* Fourchette de travail par défaut + consigne clé de la semaine. */}
      <div className="rounded-md p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, white)' }}>
        <div className="flex items-baseline justify-between">
          <span className="label">Fourchette par défaut</span>
          <Mono className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            {f.min}–{f.max} <span className="text-xs text-ink-soft">bpm</span>
          </Mono>
        </div>
        <p className="mt-1 text-sm">{week.consigneCle}</p>
      </div>

      {/* Séance du jour, ou état de repos explicite. */}
      {todaySeance ? (
        <SeanceCard
          seance={todaySeance}
          onOpenTest={() => setTest(true)}
          onLog={() => setLogSeance(todaySeance)}
          realisee={realiseeOf(todaySeance.id)}
        />
      ) : (
        <div className="card p-4">
          <div className="label">Aujourd'hui</div>
          <div className="session-title">Repos</div>
          <p className="mt-1 text-sm text-ink-soft">Pas de séance prévue. Récupération.</p>
          {nextSeance && (
            <p className="mt-3 text-sm">
              <span className="label">Prochaine séance</span>
              <br />
              <span className="font-cond font-semibold">{nextSeanceSummary(nextSeance)}</span>
            </p>
          )}
        </div>
      )}

      {/* Rappel discret d'une ligne : la séance suivante (quand il y a séance aujourd'hui). */}
      {todaySeance && nextSeance && (
        <p className="px-1 text-xs text-ink-soft">
          Ensuite · <span className="font-semibold">{nextSeanceSummary(nextSeance)}</span>
        </p>
      )}

      {test && <TestDemiCooper onClose={() => setTest(false)} />}
      {mesure && <MesureForm onClose={() => setMesure(false)} />}
      {logSeance && <SeanceForm seance={logSeance} onClose={() => setLogSeance(null)} />}
    </div>
  )
}
