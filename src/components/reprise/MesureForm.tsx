import { useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { useApp } from '../../store/AppContext'

const SOMMEIL = [1, 2, 3, 4, 5].map((n) => ({ id: n as 1 | 2 | 3 | 4 | 5, label: String(n) }))

// Saisie matinale : FC de repos au réveil + qualité de sommeil. Un enregistrement/jour, modifiable.
export function MesureForm({ onClose }: { onClose: () => void }) {
  const { today } = useApp()
  const { mesures, saveMesure } = useReprise()
  const existing = mesures.find((m) => m.date === today)

  const [fcRepos, setFcRepos] = useState(existing?.fcRepos != null ? String(existing.fcRepos) : '')
  const [sommeil, setSommeil] = useState<1 | 2 | 3 | 4 | 5>(existing?.qualiteSommeil ?? 3)

  async function save() {
    const v = Number(fcRepos)
    await saveMesure({
      date: today,
      fcRepos: fcRepos.trim() && Number.isFinite(v) ? v : undefined,
      qualiteSommeil: sommeil,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-cond text-lg font-bold">Saisie du matin</h2>
        <button onClick={onClose} className="tap px-2 font-cond text-sm text-ink-soft">
          Fermer
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <label className="block">
          <span className="label">FC de repos au réveil (bpm)</span>
          <input
            inputMode="numeric"
            autoFocus
            value={fcRepos}
            onChange={(e) => setFcRepos(e.target.value)}
            className="inp num mt-1 text-2xl font-bold"
            placeholder="62"
          />
        </label>

        <div>
          <span className="label">Qualité de sommeil</span>
          <div className="mt-1 flex gap-1.5">
            {SOMMEIL.map((o) => {
              const active = o.id === sommeil
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSommeil(o.id)}
                  className={`tap flex-1 rounded-md border py-3 text-center font-cond ${
                    active ? 'font-bold text-white' : 'border-line text-ink-soft'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent, #141414)', borderColor: 'var(--accent, #141414)' } : undefined}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs text-ink-soft">1 = très mauvais · 5 = excellent</p>
        </div>
      </div>

      <footer className="border-t border-line px-4 py-3">
        <button
          onClick={save}
          className="tap w-full rounded-md py-3 font-cond font-bold text-white"
          style={{ backgroundColor: 'var(--accent, #141414)' }}
        >
          {existing ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </footer>
    </div>
  )
}
