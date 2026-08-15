import type { ProfilId } from '../types'
import { PROFIL_ORDER, getProfil } from '../data/profils'

// Sélecteur de profil : au lancement (obligatoire si aucun profil actif) et
// accessible à tout moment via le chip d'en-tête (2 taps).
export function ProfileSelect({
  current,
  onSelect,
  onCancel,
}: {
  current: ProfilId | null
  onSelect: (id: ProfilId) => void
  onCancel?: () => void
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-5 py-8">
      <header className="mb-6">
        <div className="label">Programme 10 km</div>
        <h1 className="screen-title">Choisir un profil</h1>
      </header>

      <div className="space-y-3">
        {PROFIL_ORDER.map((id) => {
          const p = getProfil(id)
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="tap flex w-full items-center gap-4 rounded-lg border-2 bg-white p-4 text-left"
              style={{ borderColor: p.accentColor }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-cond text-lg font-bold text-white"
                style={{ backgroundColor: p.accentColor }}
              >
                {p.prenom[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-cond text-lg font-bold">{p.prenom}</span>
                <span className="block text-sm text-ink-soft">
                  {p.pilotage === 'fc' ? 'Pilotage fréquence cardiaque' : 'Pilotage allure (VMA)'}
                </span>
              </span>
              {active && <span className="num shrink-0 text-xs text-ink-soft">dernier utilisé</span>}
            </button>
          )
        })}
      </div>

      {onCancel && current && (
        <button onClick={onCancel} className="tap mt-6 text-center font-cond text-sm text-ink-soft">
          Annuler
        </button>
      )}

      <p className="mt-8 text-center text-[11px] leading-relaxed text-ink-soft">
        Chaque profil a ses propres données (plan, séances, mesures, réglages). Rien n'est partagé.
      </p>
    </div>
  )
}
