import type { ScreenId } from '../components/BottomNav'

const ITEMS: { id: ScreenId; label: string; desc: string }[] = [
  { id: 'journal', label: 'Journal', desc: 'Historique des séances et graphiques' },
  { id: 'measures', label: 'Mesures', desc: 'Poids, circonférences, masse grasse' },
  { id: 'settings', label: 'Réglages', desc: 'Profil, VMA, export / import' },
]

export function More({ onNavigate }: { onNavigate: (s: ScreenId) => void }) {
  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <h1 className="screen-title">Plus</h1>
      </header>
      <div className="space-y-2">
        {ITEMS.map((it) => (
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
    </div>
  )
}
