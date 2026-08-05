import { useState } from 'react'
import type { LoggedSession, Session, ZoneId } from '../types'
import { useApp } from '../store/AppContext'
import { formatLongDate } from '../lib/format'

const ZONES: ZoneId[] = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']

/** "6:30" → 390 s. Chaîne vide → undefined. */
function parseMMSS(v: string): number | undefined {
  const s = v.trim()
  if (!s) return undefined
  const m = s.match(/^(\d+):(\d{1,2})$/)
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  const n = Number(s)
  return isNaN(n) ? undefined : n
}

function secToMMSS(s?: number): string {
  if (s == null) return ''
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function LogForm({
  session,
  date,
  onClose,
}: {
  session: Session
  date: string
  onClose: () => void
}) {
  const { logs, profile, saveLog, deleteLog } = useApp()
  const existing = logs.find((l) => l.sessionId === session.id && l.date === date)

  const [actualKm, setActualKm] = useState(existing?.actualKm != null ? String(existing.actualKm) : String(session.totalKm))
  const [paceStr, setPaceStr] = useState(secToMMSS(existing?.actualPaceS))
  const [hr, setHr] = useState(existing?.actualHrAvg != null ? String(existing.actualHrAvg) : '')
  const [zoneHeld, setZoneHeld] = useState<ZoneId | ''>(existing?.zoneHeld ?? '')
  const [feel, setFeel] = useState<number>(existing?.feel ?? 3)
  const [fatigue, setFatigue] = useState<number>(existing?.fatigue ?? 2)
  const [hasPain, setHasPain] = useState<boolean>(!!existing?.pain)
  const [painArea, setPainArea] = useState(existing?.pain?.area ?? '')
  const [painIntensity, setPainIntensity] = useState<number>(existing?.pain?.intensity ?? 1)
  const [painNote, setPainNote] = useState(existing?.pain?.note ?? '')
  const [comment, setComment] = useState(existing?.comment ?? '')

  async function submit() {
    const log: LoggedSession = {
      sessionId: session.id,
      date,
      done: true,
      actualKm: actualKm ? Number(actualKm.replace(',', '.')) : undefined,
      actualPaceS: parseMMSS(paceStr),
      actualHrAvg: hr ? Number(hr) : undefined,
      zoneHeld: zoneHeld || undefined,
      vmaAtDate: profile.vma, // fige l'historique à la VMA du jour
      feel: feel as 1 | 2 | 3 | 4 | 5,
      fatigue: fatigue as 1 | 2 | 3 | 4 | 5,
      pain: hasPain && painArea ? { area: painArea, intensity: painIntensity, note: painNote } : undefined,
      comment: comment || undefined,
    }
    await saveLog(log)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 className="font-cond text-lg font-bold">{session.title}</h2>
          <p className="text-xs text-ink-soft">{formatLongDate(date)}</p>
        </div>
        <button onClick={onClose} className="tap px-2 font-cond text-sm text-ink-soft">
          Fermer
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance réelle (km)">
            <input inputMode="decimal" value={actualKm} onChange={(e) => setActualKm(e.target.value)} className="inp num" />
          </Field>
          <Field label="Allure moy. (m:ss/km)">
            <input inputMode="numeric" placeholder="6:30" value={paceStr} onChange={(e) => setPaceStr(e.target.value)} className="inp num" />
          </Field>
          <Field label="FC moyenne (bpm)">
            <input inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value)} className="inp num" />
          </Field>
          <Field label="Zone tenue">
            <select value={zoneHeld} onChange={(e) => setZoneHeld(e.target.value as ZoneId | '')} className="inp">
              <option value="">—</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Scale label="Ressenti" value={feel} onChange={setFeel} lowLabel="difficile" highLabel="facile" />
        <Scale label="Fatigue" value={fatigue} onChange={setFatigue} lowLabel="fraîche" highLabel="épuisé" />

        <div>
          <label className="flex items-center gap-2 py-2">
            <input type="checkbox" checked={hasPain} onChange={(e) => setHasPain(e.target.checked)} className="h-5 w-5" />
            <span className="font-cond text-sm">Signaler une douleur</span>
          </label>
          {hasPain && (
            <div className="space-y-3 rounded-md border border-line p-3">
              <Field label="Zone (ex. tibia, mollet, genou)">
                <input value={painArea} onChange={(e) => setPainArea(e.target.value)} className="inp" />
              </Field>
              <Scale label="Intensité" value={painIntensity} onChange={setPainIntensity} lowLabel="légère" highLabel="vive" />
              <Field label="Note">
                <input value={painNote} onChange={(e) => setPainNote(e.target.value)} className="inp" />
              </Field>
              <p className="text-[11px] text-ink-soft">
                Une douleur en zone osseuse (tibia, métatarse, hanche) déclenche une alerte : arrêt et avis médical.
              </p>
            </div>
          )}
        </div>

        <Field label="Commentaire">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className="inp" />
        </Field>
      </div>

      <footer className="flex gap-2 border-t border-line px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        {existing && (
          <button
            onClick={async () => {
              await deleteLog(session.id, date)
              onClose()
            }}
            className="tap rounded-md border border-line px-4 font-cond text-sm text-ink-soft"
          >
            Supprimer
          </button>
        )}
        <button onClick={submit} className="tap flex-1 rounded-md bg-ink px-4 font-cond font-bold text-paper">
          {existing ? 'Mettre à jour' : 'Marquer faite'}
        </button>
      </footer>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Scale({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  lowLabel: string
  highLabel: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        <span className="text-[11px] text-ink-soft">
          {lowLabel} → {highLabel}
        </span>
      </div>
      <div className="mt-1 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`tap flex-1 rounded-md border font-mono text-base ${
              value === n ? 'border-ink bg-ink text-paper' : 'border-line text-ink'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
