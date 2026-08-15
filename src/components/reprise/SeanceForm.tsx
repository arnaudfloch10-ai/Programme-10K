import { useState } from 'react'
import type { RepriseSeance, SensationJambes } from '../../types'
import { useReprise } from '../../store/RepriseContext'
import { useApp } from '../../store/AppContext'

const JAMBES: { id: SensationJambes; label: string }[] = [
  { id: 'fraiches', label: 'Fraîches' },
  { id: 'normales', label: 'Normales' },
  { id: 'lourdes', label: 'Lourdes' },
]

// Contrôle segmenté générique (ressenti, sensation jambes).
function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="mt-1 flex gap-1.5">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => onChange(o.id)}
            className={`tap flex-1 rounded-md border py-2 text-center font-cond text-sm ${
              active ? 'font-bold text-white' : 'border-line text-ink-soft'
            }`}
            style={active ? { backgroundColor: 'var(--accent, #141414)', borderColor: 'var(--accent, #141414)' } : undefined}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const RESSENTI = [1, 2, 3, 4, 5].map((n) => ({ id: n as 1 | 2 | 3 | 4 | 5, label: String(n) }))

const numOrUndef = (s: string): number | undefined => {
  const v = Number(s.replace(',', '.'))
  return s.trim() && Number.isFinite(v) ? v : undefined
}

// Saisie post-séance en une seule vue. Champs numériques → clavier numérique.
export function SeanceForm({ seance, onClose }: { seance: RepriseSeance; onClose: () => void }) {
  const { today } = useApp()
  const { seances, saveSeance, deleteSeance } = useReprise()
  const existing = seances.find((s) => s.seanceId === seance.id && s.date === today)

  const [dureeMin, setDureeMin] = useState(existing?.dureeMin != null ? String(existing.dureeMin) : String(seance.dureeMin || ''))
  const [distanceKm, setDistanceKm] = useState(existing?.distanceKm != null ? String(existing.distanceKm).replace('.', ',') : '')
  const [fcMoy, setFcMoy] = useState(existing?.fcMoy != null ? String(existing.fcMoy) : '')
  const [fcMax, setFcMax] = useState(existing?.fcMax != null ? String(existing.fcMax) : '')
  const [cadence, setCadence] = useState(existing?.cadence != null ? String(existing.cadence) : '')
  const [ressenti, setRessenti] = useState<1 | 2 | 3 | 4 | 5>(existing?.ressenti ?? 3)
  const [jambes, setJambes] = useState<SensationJambes>(existing?.sensationJambes ?? 'normales')
  const [commentaire, setCommentaire] = useState(existing?.commentaire ?? '')

  async function save() {
    await saveSeance({
      seanceId: seance.id,
      date: today,
      dureeMin: numOrUndef(dureeMin),
      distanceKm: numOrUndef(distanceKm),
      fcMoy: numOrUndef(fcMoy),
      fcMax: numOrUndef(fcMax),
      cadence: numOrUndef(cadence),
      ressenti,
      sensationJambes: jambes,
      commentaire: commentaire.trim() || undefined,
    })
    onClose()
  }

  async function remove() {
    await deleteSeance(seance.id, today)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-cond text-lg font-bold">Noter la séance</h2>
        <button onClick={onClose} className="tap px-2 font-cond text-sm text-ink-soft">
          Fermer
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <div>
          <span className="label">Séance</span>
          <p className="session-title">{seance.contenu}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Durée (min)</span>
            <input inputMode="numeric" value={dureeMin} onChange={(e) => setDureeMin(e.target.value)} className="inp num mt-1" placeholder="30" />
          </label>
          <label className="block">
            <span className="label">Distance (km)</span>
            <input inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className="inp num mt-1" placeholder="3,5" />
          </label>
          <label className="block">
            <span className="label">FC moyenne</span>
            <input inputMode="numeric" value={fcMoy} onChange={(e) => setFcMoy(e.target.value)} className="inp num mt-1" placeholder="147" />
          </label>
          <label className="block">
            <span className="label">FC max</span>
            <input inputMode="numeric" value={fcMax} onChange={(e) => setFcMax(e.target.value)} className="inp num mt-1" placeholder="163" />
          </label>
          <label className="block">
            <span className="label">Cadence (ppm)</span>
            <input inputMode="numeric" value={cadence} onChange={(e) => setCadence(e.target.value)} className="inp num mt-1" placeholder="157" />
          </label>
        </div>

        <div>
          <span className="label">Ressenti</span>
          <Segmented options={RESSENTI} value={ressenti} onChange={setRessenti} />
        </div>

        <div>
          <span className="label">Sensation jambes</span>
          <Segmented options={JAMBES} value={jambes} onChange={setJambes} />
        </div>

        <label className="block">
          <span className="label">Commentaire</span>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            className="inp mt-1"
            placeholder="Sensations, météo, terrain…"
          />
        </label>
      </div>

      <footer className="space-y-2 border-t border-line px-4 py-3">
        <button
          onClick={save}
          className="tap w-full rounded-md py-3 font-cond font-bold text-white"
          style={{ backgroundColor: 'var(--accent, #141414)' }}
        >
          {existing ? 'Mettre à jour' : 'Enregistrer'}
        </button>
        {existing && (
          <button onClick={remove} className="tap w-full py-2 font-cond text-sm text-danger">
            Supprimer cette saisie
          </button>
        )}
      </footer>
    </div>
  )
}
