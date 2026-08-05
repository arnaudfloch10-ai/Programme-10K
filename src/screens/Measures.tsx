import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useApp } from '../store/AppContext'
import { bodyFatNavyMale } from '../lib/navy'
import { formatShortDate, formatLongDate, todayISO } from '../lib/format'
import type { Measurement } from '../types'
import { Mono } from '../components/ui'

export function Measures() {
  const { measurements, profile, saveMeasurement, deleteMeasurement } = useApp()
  const [date, setDate] = useState(todayISO())

  const existing = measurements.find((m) => m.date === date)
  const [f, setF] = useState<Partial<Record<keyof Measurement, string>>>({})

  // Pré-remplit les champs depuis l'entrée existante quand la date change.
  const cur = {
    weightKg: f.weightKg ?? (existing?.weightKg != null ? String(existing.weightKg) : ''),
    waistCm: f.waistCm ?? (existing?.waistCm != null ? String(existing.waistCm) : ''),
    neckCm: f.neckCm ?? (existing?.neckCm != null ? String(existing.neckCm) : ''),
    hipCm: f.hipCm ?? (existing?.hipCm != null ? String(existing.hipCm) : ''),
    thighCm: f.thighCm ?? (existing?.thighCm != null ? String(existing.thighCm) : ''),
    calfCm: f.calfCm ?? (existing?.calfCm != null ? String(existing.calfCm) : ''),
    restingHr: f.restingHr ?? (existing?.restingHr != null ? String(existing.restingHr) : ''),
  }

  const num = (v: string) => (v ? Number(v.replace(',', '.')) : undefined)

  const previewBf = bodyFatNavyMale({
    heightCm: profile.heightCm,
    neckCm: num(cur.neckCm) ?? 0,
    waistCm: num(cur.waistCm) ?? 0,
  })

  async function save() {
    const m: Measurement = {
      date,
      weightKg: num(cur.weightKg),
      waistCm: num(cur.waistCm),
      neckCm: num(cur.neckCm),
      hipCm: num(cur.hipCm),
      thighCm: num(cur.thighCm),
      calfCm: num(cur.calfCm),
      restingHr: num(cur.restingHr),
    }
    await saveMeasurement(m)
    setF({})
  }

  // Séries pour les courbes.
  const weightSeries = measurements
    .filter((m) => m.weightKg != null)
    .map((m) => ({ date: formatShortDate(m.date), v: m.weightKg as number }))
  const bfSeries = measurements
    .map((m) => ({
      date: formatShortDate(m.date),
      v: bodyFatNavyMale({ heightCm: profile.heightCm, neckCm: m.neckCm ?? 0, waistCm: m.waistCm ?? 0 }),
    }))
    .filter((d): d is { date: string; v: number } => d.v != null)

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="font-cond text-2xl font-bold">Mesures</h1>
        <p className="text-sm text-ink-soft">Au réveil, à jeun. Taille de référence : {profile.heightCm} cm.</p>
      </header>

      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="label">Date</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setF({}) }} className="inp mt-1" />
          <span className="mt-1 block text-xs text-ink-soft">{formatLongDate(date)}</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <G label="Poids (kg)" value={cur.weightKg} onChange={(v) => setF((s) => ({ ...s, weightKg: v }))} />
          <G label="FC repos (bpm)" value={cur.restingHr} onChange={(v) => setF((s) => ({ ...s, restingHr: v }))} />
          <G label="Tour de taille (cm)" value={cur.waistCm} onChange={(v) => setF((s) => ({ ...s, waistCm: v }))} />
          <G label="Cou (cm)" value={cur.neckCm} onChange={(v) => setF((s) => ({ ...s, neckCm: v }))} />
          <G label="Hanches (cm)" value={cur.hipCm} onChange={(v) => setF((s) => ({ ...s, hipCm: v }))} />
          <G label="Cuisse (cm)" value={cur.thighCm} onChange={(v) => setF((s) => ({ ...s, thighCm: v }))} />
          <G label="Mollet (cm)" value={cur.calfCm} onChange={(v) => setF((s) => ({ ...s, calfCm: v }))} />
        </div>

        <div className="flex items-center justify-between rounded-md bg-paper p-3">
          <span className="label">Masse grasse (Navy)</span>
          <Mono className="text-xl font-bold">{previewBf != null ? `${previewBf} %` : '—'}</Mono>
        </div>
        <p className="text-[11px] text-ink-soft">
          Méthode Navy homme (cou + tour de taille). Marge de ±3–4 points : c'est la tendance qui compte, pas le
          niveau absolu.
        </p>

        <div className="flex gap-2">
          {existing && (
            <button onClick={() => deleteMeasurement(date)} className="tap rounded-md border border-line px-4 font-cond text-sm text-ink-soft">
              Supprimer
            </button>
          )}
          <button onClick={save} className="tap flex-1 rounded-md bg-ink py-2 font-cond font-bold text-paper">
            {existing ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {weightSeries.length > 0 && (
        <Panel title="Poids (kg)">
          <Curve data={weightSeries} color="#3d6b7d" />
        </Panel>
      )}
      {bfSeries.length > 0 && (
        <Panel title="Masse grasse estimée (%)">
          <Curve data={bfSeries} color="#8a6d1f" />
        </Panel>
      )}
    </div>
  )
}

function G({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="inp num mt-1" />
    </label>
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

function Curve({ data, color }: { data: { date: string; v: number }[]; color: string }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
