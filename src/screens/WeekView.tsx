import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { findWeekForDate, dateForSession, weekDoneKm, weekPlannedKm, findLog, prescribedZone } from '../lib/plan'
import { checkQualitySpacing } from '../lib/alerts'
import { paceRangeLabel } from '../lib/sessionPace'
import { formatDateRange, formatKm } from '../lib/format'
import { ZONE_COLORS } from '../lib/zones'
import { Mono } from '../components/ui'
import { LogForm } from './LogForm'
import type { Session } from '../types'

const DOW_LABEL = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function WeekView() {
  const { weeks, logs, today, profile } = useApp()
  const current = findWeekForDate(weeks, today)
  const initialIdx = current ? weeks.findIndex((w) => w.number === current.number) : 0
  const [idx, setIdx] = useState(Math.max(0, initialIdx))
  const [logTarget, setLogTarget] = useState<{ session: Session; date: string } | null>(null)

  const week = weeks[idx]
  const done = useMemo(() => (week ? weekDoneKm(week, logs) : 0), [week, logs])
  const planned = week ? weekPlannedKm(week) : 0
  const quality = week ? checkQualitySpacing(week.sessions) : { count: 0, tooMany: false, consecutive: false }

  if (!week) return <div className="px-4 py-6 text-sm text-ink-soft">Aucune semaine.</div>

  const sessions = [...week.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <div className="space-y-4 px-4 py-4">
      <header className="flex items-center justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="tap px-2 font-cond text-lg disabled:opacity-30"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-cond text-xl font-bold">
            Semaine {week.number}
            {week.label && week.label !== 'charge' && (
              <span className="ml-2 rounded border border-line px-1.5 py-0.5 text-xs font-normal uppercase">
                {week.label === 'allegee' ? 'allégée' : 'course'}
              </span>
            )}
          </div>
          <div className="text-xs text-ink-soft">{formatDateRange(week.startDate, week.endDate)}</div>
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(weeks.length - 1, i + 1))}
          disabled={idx === weeks.length - 1}
          className="tap px-2 font-cond text-lg disabled:opacity-30"
        >
          ›
        </button>
      </header>

      <div className="card flex items-center justify-between p-3">
        <div>
          <div className="label">Réalisé / prévu</div>
          <Mono className="text-lg font-bold">
            {formatKm(done)} <span className="text-ink-soft">/ {formatKm(planned)} km</span>
          </Mono>
        </div>
        <div className="h-2 w-28 overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-ink"
            style={{ width: `${planned ? Math.min(100, (done / planned) * 100) : 0}%` }}
          />
        </div>
      </div>

      {(quality.consecutive || quality.tooMany) && (
        <div className="rounded-md border-l-4 border-z4 bg-z4/10 p-2 text-xs">
          {quality.tooMany && <div>Plus de 2 séances de qualité cette semaine.</div>}
          {quality.consecutive && <div>Deux séances de qualité sont programmées sur des jours consécutifs.</div>}
        </div>
      )}

      <div className="space-y-2">
        {sessions.map((s) => {
          const date = dateForSession(week, s)
          const log = findLog(logs, s.id, date)
          const isRest = s.type === 'REPOS' || s.type === 'RENFO'
          return (
            <button
              key={s.id}
              disabled={isRest}
              onClick={() => setLogTarget({ session: s, date })}
              className={`card flex w-full items-center gap-3 p-3 text-left ${isRest ? 'opacity-70' : ''}`}
            >
              <div className="w-9 shrink-0 text-center">
                <div className="font-cond text-sm font-bold">{DOW_LABEL[s.dayOfWeek]}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-cond text-sm font-semibold">{s.title}</span>
                  {s.isQuality && <span className="shrink-0 rounded bg-ink px-1 text-[10px] font-bold text-paper">Q</span>}
                </div>
                {/* Allure visible sans ouvrir la séance. */}
                {!isRest && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: ZONE_COLORS[prescribedZone(s)] }}
                      aria-hidden
                    />
                    <span className="font-cond text-[11px] font-bold">{prescribedZone(s)}</span>
                    <Mono className="text-xs">{paceRangeLabel(profile.vma, prescribedZone(s))}</Mono>
                    <span className="whitespace-nowrap">/km</span>
                  </div>
                )}
                {s.strength && <div className="mt-0.5 text-xs text-ink-soft">Renfo {s.strength}</div>}
              </div>
              {!isRest && (
                <div className="shrink-0 text-right">
                  {log?.done ? (
                    <span className="font-cond text-xs">✓ {log.actualKm ? `${formatKm(log.actualKm)} km` : ''}</span>
                  ) : (
                    <span className="font-cond text-xs text-ink-soft">à faire</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {logTarget && (
        <LogForm session={logTarget.session} date={logTarget.date} onClose={() => setLogTarget(null)} />
      )}
    </div>
  )
}
