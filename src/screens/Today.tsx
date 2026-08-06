import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { findWeekForDate, sessionForDate, findLog, prescribedZone } from '../lib/plan'
import { formatLongDate, daysBetween, parseISODate, toISODate, formatKm } from '../lib/format'
import { paceRangeLabel } from '../lib/sessionPace'
import { SessionDetail } from '../components/SessionDetail'
import { RacePlan } from '../components/RacePlan'
import { StrengthDetail } from '../components/StrengthDetail'
import { AlertList } from '../components/AlertBanner'
import { Mono } from '../components/ui'
import { LogForm } from './LogForm'
import { routineForStrength } from '../data/strength'
import { derivedPaces, formatPace, ZONE_COLORS } from '../lib/zones'
import type { Session, Week } from '../types'

export function Today() {
  const { today, weeks, profile, logs, alerts } = useApp()
  const [logging, setLogging] = useState(false)

  const week = findWeekForDate(weeks, today)
  const session = sessionForDate(week, today)
  const log = session ? findLog(logs, session.id, today) : undefined
  const dp = derivedPaces(profile.vma)

  // Jour de repos ou de renfo seul : on prépare la séance du lendemain.
  const restLike = !!session && (session.type === 'REPOS' || session.type === 'RENFO')
  const tomorrowD = parseISODate(today)
  tomorrowD.setDate(tomorrowD.getDate() + 1)
  const tomorrow = toISODate(tomorrowD)
  const tomWeek = findWeekForDate(weeks, tomorrow)
  const tomSession = sessionForDate(tomWeek, tomorrow)

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <div className="label">{formatLongDate(today)}</div>
        <h1 className="screen-title">Aujourd'hui</h1>
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

      {/* Séance de renfo seule (jour de Renfo B) : uniquement la routine. */}
      {session && session.type === 'RENFO' && (
        <StrengthDetail routine={routineForStrength('B')} renfoSessionId={session.id} date={today} currentWeekNumber={week?.number} />
      )}

      {/* Jour de repos / renfo : aperçu de la séance de demain, en lecture seule. */}
      {restLike && tomSession && tomSession.type !== 'REPOS' && (
        <NextDayPreview session={tomSession} week={tomWeek} dateISO={tomorrow} vma={profile.vma} />
      )}

      {session && session.type !== 'REPOS' && session.type !== 'RENFO' && (
        <div className="card p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="label">Semaine {week?.number} · {session.type}</div>
              <h2 className="session-title">{session.title}</h2>
              <div className="num mt-0.5 text-sm text-ink-soft">{session.totalKm} km</div>
            </div>
            {log?.done && (
              <span className="rounded-md border border-line px-2 py-1 font-cond text-xs">✓ faite</span>
            )}
          </div>

          {session.type === 'COURSE' ? (
            <RacePlan session={session} vma={profile.vma} />
          ) : (
            <SessionDetail session={session} vma={profile.vma} />
          )}

          <button
            onClick={() => setLogging(true)}
            className="tap mt-4 w-full rounded-md bg-ink px-4 py-2 font-cond font-bold text-paper"
          >
            {log?.done ? 'Modifier le log' : 'Marquer faite'}
          </button>
        </div>
      )}

      {/* Renfo A associé à une séance d'endurance (mercredi). */}
      {session && session.strength === 'A' && (
        <StrengthDetail
          routine={routineForStrength('A')}
          renfoSessionId={`${session.id}#renfoA`}
          date={today}
          currentWeekNumber={week?.number}
        />
      )}
      {/* Renfo B rattaché à une séance d'endurance (cas S9 mercredi). */}
      {session && session.strength === 'B' && session.type !== 'RENFO' && (
        <StrengthDetail
          routine={routineForStrength('B')}
          renfoSessionId={`${session.id}#renfoB`}
          date={today}
          currentWeekNumber={week?.number}
        />
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

// Aperçu lecture seule de la séance du lendemain (jours de repos / renfo).
function NextDayPreview({
  session,
  week,
  dateISO,
  vma,
}: {
  session: Session
  week: Week | null
  dateISO: string
  vma: number
}) {
  const zone = prescribedZone(session)
  const range = paceRangeLabel(vma, zone)
  const isRenfo = session.type === 'RENFO'
  return (
    <div className="card p-4">
      <div className="label">Demain — {formatLongDate(dateISO)}</div>
      <div className="session-title mt-1">{session.title}</div>
      {!isRenfo && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone] }} aria-hidden />
          <span className="font-cond text-xs font-bold">{zone}</span>
          <span className="font-cond">{formatKm(session.totalKm)} km</span>
          <span className="flex-1" />
          {range && (
            <Mono className="whitespace-nowrap text-sm">
              {range}
              <span className="text-xs text-ink-soft"> /km</span>
            </Mono>
          )}
        </div>
      )}
      {week && <div className="mt-1 text-xs text-ink-soft">Semaine {week.number}</div>}
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
