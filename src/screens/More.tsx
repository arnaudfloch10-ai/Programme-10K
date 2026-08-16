import type { ScreenId } from '../components/BottomNav'

const ITEMS: { id: ScreenId; label: string; desc: string }[] = [
  { id: 'journal', label: 'Journal', desc: 'Historique des séances et graphiques' },
  { id: 'measures', label: 'Mesures', desc: 'Poids, circonférences, masse grasse' },
  { id: 'badges', label: 'Badges', desc: 'Jalons et régularité — sans série de jours' },
  { id: 'settings', label: 'Réglages', desc: 'Profil, VMA, export / import' },
]

// Suivi qualitatif du profil FC (Charline) : bilan, renfo, signaux.
const ITEMS_FC: { id: ScreenId; label: string; desc: string }[] = [
  { id: 'bilan', label: 'Bilan semaine', desc: 'Réalisé vs prévu, résumé coach copiable' },
  { id: 'badges', label: 'Badges', desc: 'Jalons et régularité — sans série de jours' },
  { id: 'renfo', label: 'Renforcement', desc: '6 exercices, réinitialisés chaque semaine' },
  { id: 'signaux', label: "Signaux d'alerte", desc: 'Quand consulter · compteur chaussures' },
  { id: 'settings', label: 'Réglages', desc: 'Profil, export / import' },
]

export function More({ onNavigate, fc = false }: { onNavigate: (s: ScreenId) => void; fc?: boolean }) {
  const items = fc ? ITEMS_FC : ITEMS
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
    </div>
  )
}
