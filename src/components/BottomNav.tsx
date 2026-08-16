export type ScreenId =
  | 'today'
  | 'week'
  | 'plan'
  | 'zones'
  | 'more'
  | 'journal'
  | 'measures'
  | 'settings'
  | 'bilan'
  | 'renfo'
  | 'signaux'
  | 'badges'

// Cinq onglets. Libellés courts pour tenir sans chevauchement ni troncature.
const TABS: { id: ScreenId; label: string }[] = [
  { id: 'today', label: 'Auj.' },
  { id: 'week', label: 'Semaine' },
  { id: 'plan', label: 'Plan' },
  { id: 'zones', label: 'Zones' },
  { id: 'more', label: 'Plus' },
]

// Les sous-écrans de « Plus » gardent l'onglet Plus actif.
const MORE_CHILDREN: ScreenId[] = ['more', 'journal', 'measures', 'settings', 'bilan', 'renfo', 'signaux', 'badges']

export function BottomNav({ active, onNavigate }: { active: ScreenId; onNavigate: (s: ScreenId) => void }) {
  return (
    <nav
      className="sticky bottom-0 z-10 flex border-t border-line bg-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((t) => {
        const isActive = t.id === 'more' ? MORE_CHILDREN.includes(active) : active === t.id
        // §4 — actif : accent ; inactif : text-tertiary.
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className={`tap min-w-0 flex-1 whitespace-nowrap px-1 py-3 text-center font-cond text-[11px] uppercase tracking-[0.04em] ${
              isActive ? 'border-t-2 font-bold' : 'text-ink-faint'
            }`}
            style={isActive ? { borderTopColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
