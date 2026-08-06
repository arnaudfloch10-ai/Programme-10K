import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from 'recharts'
import { useApp } from '../store/AppContext'
import { BLOCK_MILESTONES } from '../data/seedBloc0'
import { formatDateRange, formatLongDate, niceAxisMax } from '../lib/format'
import { weekDoneKm } from '../lib/plan'

const CHARGE = '#3d6b7d'
const ALLEGEE = '#9aa2a8'
const COURSE = '#a32e3d'

function barColor(label?: string): string {
  if (label === 'allegee') return ALLEGEE
  if (label === 'course') return COURSE
  return CHARGE
}

export function Plan() {
  const { weeks, logs } = useApp()

  const data = weeks.map((w) => ({
    name: `S${w.number}`,
    km: w.totalKm,
    label: w.label,
  }))

  const axisMax = niceAxisMax(data.reduce((m, d) => Math.max(m, d.km), 0))

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="screen-title">Plan</h1>
        <p className="text-sm text-ink-soft">Bloc 0 — 9 semaines · 3 août → 4 octobre 2026</p>
      </header>

      <div className="card p-3">
        <div className="label mb-2">Profil de charge (km/semaine)</div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 4, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, axisMax]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="km" radius={[2, 2, 0, 0]}>
                <LabelList dataKey="km" position="top" style={{ fontSize: 10, fill: '#4a4a4a' }} />
                {data.map((d, i) => (
                  <Cell key={i} fill={barColor(d.label)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex gap-4 text-[11px] text-ink-soft">
          <Legend color={CHARGE} label="charge" />
          <Legend color={ALLEGEE} label="allégée" />
          <Legend color={COURSE} label="course" />
        </div>
      </div>

      <div className="space-y-2">
        {weeks.map((w) => {
          const done = weekDoneKm(w, logs)
          return (
            <div key={w.number} className="card flex items-center justify-between p-3">
              <div>
                <div className="font-cond text-sm font-bold">
                  Semaine {w.number}
                  {w.label && w.label !== 'charge' && (
                    <span className="ml-2 text-xs font-normal uppercase text-ink-soft">
                      {w.label === 'allegee' ? 'allégée' : 'course'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-soft">{formatDateRange(w.startDate, w.endDate)}</div>
              </div>
              <div className="num text-right text-sm">
                <span className="font-bold">{done > 0 ? done.toFixed(1) : '—'}</span>
                <span className="text-ink-soft"> / {w.totalKm} km</span>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <div className="label mb-2">Blocs suivants — jalons</div>
        <div className="space-y-2">
          {BLOCK_MILESTONES.map((b) => (
            <div key={b.block} className="card border-dashed p-3">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-cond text-sm font-bold">
                  Bloc {b.block} · {b.title}
                </div>
                <div className="num shrink-0 text-xs text-ink-soft">{b.volume}</div>
              </div>
              <div className="num mt-0.5 text-xs text-ink-soft">{b.period}</div>
              <p className="mt-1 text-xs text-ink-soft">{b.focus}</p>
              {b.keyEvent && <p className="mt-1 text-xs font-semibold">🎯 {b.keyEvent}</p>}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-soft">
          Objectif final : {BLOCK_MILESTONES[3]?.keyEvent} Course-test intermédiaire le{' '}
          {formatLongDate('2026-10-04')}.
        </p>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
