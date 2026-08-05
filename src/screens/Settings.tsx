import { useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Profile } from '../types'
import type { ExportBundle } from '../db/repo'
import { formatPace } from '../lib/zones'

export function Settings({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const { profile, saveProfile, exportAll, importAll } = useApp()
  const [p, setP] = useState<Profile>(profile)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const num = (v: string) => Number(v.replace(',', '.'))

  async function handleExport() {
    const bundle = await exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `programme-10k-${bundle.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const bundle = JSON.parse(text) as ExportBundle
      if (!bundle.profile || !Array.isArray(bundle.weeks)) throw new Error('format')
      await importAll(bundle)
      setP(bundle.profile)
      setMsg('Import réussi.')
    } catch {
      setMsg('Fichier invalide.')
    }
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="font-cond text-2xl font-bold">Réglages</h1>
      </header>

      <div className="card space-y-3 p-4">
        <div className="label">Profil</div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Âge" value={String(p.ageYears)} onChange={(v) => setP({ ...p, ageYears: num(v) })} />
          <F label="Taille (cm)" value={String(p.heightCm)} onChange={(v) => setP({ ...p, heightCm: num(v) })} />
          <F label="Poids (kg)" value={String(p.weightKg)} onChange={(v) => setP({ ...p, weightKg: num(v) })} />
          <F label="FC max (bpm)" value={String(p.fcMax)} onChange={(v) => setP({ ...p, fcMax: num(v) })} />
          <F label="VMA (km/h)" value={String(p.vma)} onChange={(v) => setP({ ...p, vma: num(v) })} />
        </div>
        <div className="rounded-md bg-paper p-2 text-xs text-ink-soft">
          À VMA {p.vma} km/h : allure 10 km <span className="num font-bold">{formatPace(3600 / (p.vma * 0.88))}</span>/km ·
          objectif {p.goalRaceName} le {p.goalRaceDate} ({formatPace(p.goalTimeS / 10)}/km cible).
        </div>
        <button
          onClick={async () => {
            await saveProfile(p)
            setMsg('Profil enregistré.')
          }}
          className="tap w-full rounded-md bg-ink py-2 font-cond font-bold text-paper"
        >
          Enregistrer le profil
        </button>
      </div>

      <div className="card space-y-3 p-4">
        <div className="label">Données (tout reste sur cet appareil)</div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="tap flex-1 rounded-md border border-line py-2 font-cond text-sm">
            Exporter JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="tap flex-1 rounded-md border border-line py-2 font-cond text-sm">
            Importer JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
        </div>
        <p className="text-[11px] text-ink-soft">L'import remplace intégralement les données actuelles.</p>
      </div>

      <div className="card flex items-center justify-between p-4">
        <div className="label">Mode sombre</div>
        <button
          onClick={onToggleDark}
          className={`tap rounded-md border px-4 py-1 font-cond text-sm ${dark ? 'border-ink bg-ink text-paper' : 'border-line'}`}
        >
          {dark ? 'activé' : 'désactivé'}
        </button>
      </div>

      {msg && <p className="text-center text-sm text-ink-soft">{msg}</p>}
    </div>
  )
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="inp num mt-1" />
    </label>
  )
}
