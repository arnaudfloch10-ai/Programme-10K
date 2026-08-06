import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { ZONES, ZONE_ORDER, ZONE_COLORS, zoneHrRange } from '../lib/zones'
import { paceRangeLabel, lapRangeLabel } from '../lib/sessionPace'
import { computeVmaTest, type VmaTestInput } from '../lib/vma'
import { formatShortDate, todayISO } from '../lib/format'
import type { VmaTestType } from '../types'
import { Mono } from '../components/ui'

// Grille à colonnes fixes : les colonnes restent alignées d'une ligne à l'autre.
const ZONE_GRID = '2.5rem minmax(0, 1fr) 5.75rem 3.5rem 4.5rem'

function hrLabel(minBpm: number | null, maxBpm: number | null): string {
  if (minBpm == null) return `<${maxBpm}`
  if (maxBpm == null) return `${minBpm}+`
  return `${minBpm}–${maxBpm}`
}

export function Zones() {
  const { profile, vmaTests, applyVma } = useApp()
  const vma = profile.vma

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="screen-title">Zones</h1>
        <p className="text-sm text-ink-soft">Toutes les allures dérivent de la VMA.</p>
      </header>

      <VmaField vma={vma} onApply={(v) => applyVma(v)} fcMax={profile.fcMax} />

      <div className="card overflow-hidden">
        {/* En-têtes de colonnes */}
        <div
          className="grid items-center gap-x-2 border-b border-line px-3 py-2"
          style={{ gridTemplateColumns: ZONE_GRID }}
        >
          <span className="label">Zone</span>
          <span className="label" />
          <span className="label text-right">Allure/km</span>
          <span className="label text-right">FC</span>
          <span className="label text-right">400 m</span>
        </div>

        {ZONE_ORDER.map((z) => {
          const def = ZONES[z]
          const hr = zoneHrRange(profile.fcMax, z)
          return (
            <div
              key={z}
              className="grid items-center gap-x-2 border-b border-line px-3 py-2.5 last:border-0"
              style={{ gridTemplateColumns: ZONE_GRID }}
            >
              {/* Bloc largeur fixe : pastille + code */}
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ZONE_COLORS[z] }} />
                <span className="font-cond text-sm font-bold">{z}</span>
              </span>
              {/* Nom : tronqué plutôt que passer à la ligne */}
              <span className="truncate font-cond text-[13px] uppercase tracking-wide text-ink-soft">
                {def.name}
              </span>
              <Mono className="text-right text-[13px]">{paceRangeLabel(vma, z)}</Mono>
              <Mono className="text-right text-[13px]">{hrLabel(hr.minBpm, hr.maxBpm)}</Mono>
              <Mono className="text-right text-[13px]">{lapRangeLabel(vma, z)}</Mono>
            </div>
          )
        })}
      </div>

      <VmaTestForm onApply={applyVma} />

      <div>
        <div className="label mb-2">Historique des tests VMA</div>
        {vmaTests.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucun test enregistré.</p>
        ) : (
          <div className="space-y-2">
            {[...vmaTests].reverse().map((t) => (
              <div key={t.date} className="card flex items-center justify-between p-3">
                <div>
                  <div className="font-cond text-sm font-bold">{formatShortDate(t.date)}</div>
                  <div className="text-xs text-ink-soft">{t.type}</div>
                </div>
                <Mono className="text-lg font-bold">{t.computedVma} km/h</Mono>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VmaField({ vma, onApply, fcMax }: { vma: number; onApply: (v: number) => void; fcMax: number }) {
  const [val, setVal] = useState(String(vma))
  const parsed = Number(val.replace(',', '.'))
  const changed = !isNaN(parsed) && parsed > 0 && parsed !== vma
  return (
    <div className="card p-4">
      <div className="flex items-end justify-between gap-3">
        <label className="flex-1">
          <span className="label">VMA (km/h)</span>
          <input
            inputMode="decimal"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="inp num mt-1 text-2xl font-bold"
          />
        </label>
        <button
          disabled={!changed}
          onClick={() => onApply(parsed)}
          className="tap rounded-md bg-ink px-4 py-2 font-cond font-bold text-paper disabled:opacity-30"
        >
          Appliquer
        </button>
      </div>
      <p className="mt-2 text-[11px] text-ink-soft">
        FC max {fcMax} bpm. Modifier la VMA recalcule instantanément tout le plan (l'historique déjà loggé
        est préservé).
      </p>
    </div>
  )
}

const TYPE_LABELS: Record<VmaTestType, string> = {
  'demi-cooper': 'demi-Cooper (6 min)',
  cooper: 'Cooper (12 min)',
  course: 'Course',
}

function VmaTestForm({ onApply }: { onApply: (v: number, test: import('../types').VmaTest) => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<VmaTestType>('demi-cooper')
  const [distanceM, setDistanceM] = useState('')
  const [raceDistanceM, setRaceDistanceM] = useState('')
  const [raceTime, setRaceTime] = useState('')

  function raceTimeS(): number | undefined {
    const m = raceTime.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
    if (!m) return raceTime ? Number(raceTime) : undefined
    if (m[3]) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
    return Number(m[1]) * 60 + Number(m[2])
  }

  const input: VmaTestInput = {
    date: todayISO(),
    type,
    distanceM: distanceM ? Number(distanceM) : undefined,
    raceDistanceM: raceDistanceM ? Number(raceDistanceM) : undefined,
    raceTimeS: raceTimeS(),
  }
  const preview = computeVmaTest(input)
  const valid = preview.computedVma > 0

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="tap w-full rounded-md border border-line py-2 font-cond text-sm">
        + Saisir un test VMA
      </button>
    )
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="label">Recalibrage VMA</div>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-soft">
          annuler
        </button>
      </div>

      <label className="block">
        <span className="label">Type de test</span>
        <select value={type} onChange={(e) => setType(e.target.value as VmaTestType)} className="inp mt-1">
          {(['demi-cooper', 'cooper', 'course'] as VmaTestType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      {(type === 'demi-cooper' || type === 'cooper') && (
        <label className="block">
          <span className="label">Distance parcourue (m)</span>
          <input inputMode="numeric" value={distanceM} onChange={(e) => setDistanceM(e.target.value)} className="inp num mt-1" placeholder={type === 'demi-cooper' ? '1250' : '2500'} />
        </label>
      )}

      {type === 'course' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Distance (m)</span>
            <input inputMode="numeric" value={raceDistanceM} onChange={(e) => setRaceDistanceM(e.target.value)} className="inp num mt-1" placeholder="5000" />
          </label>
          <label className="block">
            <span className="label">Temps (h:mm:ss)</span>
            <input value={raceTime} onChange={(e) => setRaceTime(e.target.value)} className="inp num mt-1" placeholder="25:47" />
          </label>
        </div>
      )}

      <div className="flex items-center justify-between rounded-md bg-paper p-3">
        <span className="label">VMA estimée</span>
        <Mono className="text-xl font-bold">{valid ? `${preview.computedVma} km/h` : '—'}</Mono>
      </div>

      <button
        disabled={!valid}
        onClick={() => {
          onApply(preview.computedVma, preview)
          setOpen(false)
          setDistanceM('')
          setRaceDistanceM('')
          setRaceTime('')
        }}
        className="tap w-full rounded-md bg-ink py-2 font-cond font-bold text-paper disabled:opacity-30"
      >
        Appliquer cette VMA
      </button>
    </div>
  )
}
