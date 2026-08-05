import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Legend as RLegend,
} from 'recharts'
import { useApp } from '../store/AppContext'
import { weekDoneKm, weekPlannedKm } from '../lib/plan'
import { z1z2Distribution } from '../lib/alerts'
import { ZONE_COLORS, ZONE_ORDER, formatPace } from '../lib/zones'
import { formatShortDate } from '../lib/format'
import { Mono } from '../components/ui'

export function Journal() {
  const { weeks, logs, measurements } = useApp()

  // Volume hebdo réalisé vs prévu.
  const weeklyVolume = weeks.map((w) => ({
    name: `S${w.number}`,
    prevu: weekPlannedKm(w),
    realise: Math.round(weekDoneKm(w, logs) * 10) / 10,
  }))

  // Temps par zone (s) : actualKm × actualPaceS attribué à la zone tenue.
  const secondsByZone = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const l of logs) {
      if (!l.done || !l.zoneHeld || !l.actualKm || !l.actualPaceS) continue
      acc[l.zoneHeld] = (acc[l.zoneHeld] ?? 0) + l.actualKm * l.actualPaceS
    }
    return acc
  }, [logs])

  const dist = z1z2Distribution(secondsByZone)
  const zoneData = ZONE_ORDER.map((z) => ({
    zone: z,
    min: Math.round((secondsByZone[z] ?? 0) / 60),
  })).filter((d) => d.min > 0)

  // Allure Z2 à FC comparable dans le temps.
  const z2Series = logs
    .filter((l) => l.zoneHeld === 'Z2' && l.actualPaceS && l.actualHrAvg)
    .map((l) => ({
      date: formatShortDate(l.date),
      paceS: l.actualPaceS as number,
      hr: l.actualHrAvg as number,
    }))

  // FC de repos.
  const rhrSeries = measurements
    .filter((m) => typeof m.restingHr === 'number')
    .map((m) => ({ date: formatShortDate(m.date), rhr: m.restingHr as number }))

  const hasLogs = logs.some((l) => l.done)

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="font-cond text-2xl font-bold">Journal</h1>
        <p className="text-sm text-ink-soft">{logs.filter((l) => l.done).length} séance(s) enregistrée(s)</p>
      </header>

      {!hasLogs && (
        <div className="card p-4 text-sm text-ink-soft">
          Aucune séance loggée pour l'instant. Les graphiques apparaîtront ici dès les premières séances.
        </div>
      )}

      <Panel title="Volume hebdomadaire — réalisé vs prévu">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyVolume} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <RLegend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="prevu" name="prévu" fill="#d9d8d3" radius={[2, 2, 0, 0]} />
              <Bar dataKey="realise" name="réalisé" fill="#3d6b7d" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Répartition du temps par zone">
        {zoneData.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm">
                Z1–Z2 : <Mono className="font-bold">{dist.lowIntensityPct}%</Mono>
              </span>
              <span className={`text-xs ${dist.warning ? 'text-danger' : dist.belowTarget ? 'text-z4' : 'text-ink-soft'}`}>
                cible 80 % {dist.warning ? '· sous 75 % !' : dist.belowTarget ? '· sous la cible' : '· ok'}
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="zone" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Bar dataKey="min" name="min" radius={[0, 2, 2, 0]}>
                    {zoneData.map((d) => (
                      <Cell key={d.zone} fill={ZONE_COLORS[d.zone]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Panel>

      <Panel title="Allure moyenne en Z2 (s/km) dans le temps">
        {z2Series.length === 0 ? (
          <Empty hint="À FC comparable, une allure Z2 qui remonte = fatigue ou forme en baisse." />
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={z2Series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(v) => formatPace(Number(v))}
                  reversed
                />
                <Line type="monotone" dataKey="paceS" stroke="#3d6b7d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="FC de repos (bpm)">
        {rhrSeries.length === 0 ? (
          <Empty hint="Saisir la FC au réveil dans l'écran Mesures." />
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rhrSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                <Line type="monotone" dataKey="rhr" stroke="#8a6d1f" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-3">
      <div className="label mb-2">{title}</div>
      {children}
    </div>
  )
}

function Empty({ hint }: { hint?: string }) {
  return <p className="py-6 text-center text-xs text-ink-soft">{hint ?? 'Pas encore de données.'}</p>
}
