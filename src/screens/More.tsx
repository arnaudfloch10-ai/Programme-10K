import type { ScreenId } from '../components/BottomNav'

const ITEMS: { id: ScreenId; label: string; desc: string }[] = [
  { id: 'journal', label: 'Journal', desc: 'Historique des séances et graphiques' },
  { id: 'measures', label: 'Mesures', desc: 'Poids, circonférences, masse grasse' },
  { id: 'settings', label: 'Réglages', desc: 'Profil, VMA, export / import' },
]

// En mode FC (Charline), Journal / Mesures / renfo / signaux arrivent en Phase C.
export function More({ onNavigate, fc = false }: { onNavigate: (s: ScreenId) => void; fc?: boolean }) {
  const items = fc ? ITEMS.filter((it) => it.id === 'settings') : ITEMS
  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <h1 className="screen-title">Plus</h1>
      </header>
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNavigate(it.id)}
            className="card tap flex w-full items-center justify-between p-4 text-left"
          >
            <span>
              <span className="block font-cond text-base font-semibold">{it.label}</span>
              <span className="block text-sm text-ink-soft">{it.desc}</span>
            </span>
            <span aria-hidden className="font-cond text-lg text-ink-soft">
              ›
            </span>
          </button>
        ))}
      </div>
      {fc && (
        <p className="px-1 text-xs text-ink-soft">
          Journal, mesures, renforcement et signaux d'alerte arrivent très bientôt (suivi qualitatif).
        </p>
      )}
    </div>
  )
}
