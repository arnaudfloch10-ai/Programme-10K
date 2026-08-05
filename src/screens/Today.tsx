import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { findWeekForDate, sessionForDate, findLog } from '../lib/plan'
import { formatLongDate, daysBetween } from '../lib/format'
import { SessionDetail } from '../components/SessionDetail'
import { AlertList } from '../components/AlertBanner'
import { Mono } from '../components/ui'
import { LogForm } from './LogForm'
import { derivedPaces, formatPace } from '../lib/zones'

export function Today() {
  const { today, weeks, profile, logs, alerts } = useApp()
  const [logging, setLogging] = useState(false)

  const week = findWeekForDate(weeks, today)
  const session = sessionForDate(week, today)
  const log = session ? findLog(logs, session.id, today) : undefined
  const dp = derivedPaces(profile.vma)

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <div className="label">{formatLongDate(today)}</div>
        <h1 className="font-cond text-2xl font-bold leading-tight">Aujourd'hui</h1>
      </header>

      <AlertList alerts={alerts} />

      {!week && <OutOfPlan today={today} weeks={weeks} />}

      {week && !session && (
        <div className="card p-4">
          <p className="text-sm text-ink-soft">Aucune séance planifiée aujourd'hui.</p>
        </div>
      )}

      {session && session.type === 'REPOS' && (
        <div className="card p-6 text-center">
          <div className="font-cond text-3xl font-bold">Repos</div>
          <p className="mt-1 text-sm text-ink-soft">
            {session.title === 'Repos complet' ? 'Repos complet — récupération.' : 'Jour de repos. Récupération et sommeil.'}
          </p>
        </div>
      )}

      {session && session.type !== 'REPOS' && (
        <div className="card p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="label">Semaine {week?.number} · {session.type}</div>
              <h2 className="font-cond text-xl font-bold leading-tight">{session.title}</h2>
              <div className="num mt-0.5 text-sm text-ink-soft">{session.totalKm} km</div>
            </div>
            {log?.done && (
              <span className="rounded-md border border-line px-2 py-1 font-cond text-xs">✓ faite</span>
            )}
          </div>

          <SessionDetail session={session} vma={profile.vma} />

          <button
            onClick={() => setLogging(true)}
            className="tap mt-4 w-full rounded-md bg-ink px-4 py-2 font-cond font-bold text-paper"
          >
            {log?.done ? 'Modifier le log' : 'Marquer faite'}
          </button>
        </div>
      )}

      {/* Repères d'allure toujours dérivés de la VMA courante. */}
      <div className="card p-4">
        <div className="label mb-2">Allures repères (VMA {profile.vma} km/h)</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <RefPace label="10 km" pace={formatPace(dp.p10kS)} />
          <RefPace label="5 km" pace={formatPace(dp.p5kS)} />
          <RefPace label="Marathon" pace={formatPace(dp.marathonS)} />
        </div>
      </div>

      {logging && session && (
        <LogForm session={session} date={today} onClose={() => setLogging(false)} />
      )}
    </div>
  )
}

function RefPace({ label, pace }: { label: string; pace: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <Mono className="text-lg font-semibold">{pace}</Mono>
    </div>
  )
}

function OutOfPlan({ today, weeks }: { today: string; weeks: ReturnType<typeof useApp>['weeks'] }) {
  const first = weeks[0]
  const last = weeks[weeks.length - 1]
  if (!first || !last) return null
  const beforeStart = today < first.startDate
  const afterEnd = today > last.endDate
  let msg = ''
  if (beforeStart) {
    const d = daysBetween(today, first.startDate)
    msg = `Le Bloc 0 démarre le ${formatLongDate(first.startDate)} — dans ${d} jour${d > 1 ? 's' : ''}.`
  } else if (afterEnd) {
    msg = `Le Bloc 0 s'est terminé le ${formatLongDate(last.endDate)}. Les blocs 1 à 4 ne sont pas encore détaillés (voir l'écran Plan).`
  }
  return (
    <div className="card p-4">
      <div className="font-cond text-lg font-bold">Hors période du plan</div>
      <p className="mt-1 text-sm text-ink-soft">{msg}</p>
    </div>
  )
}
