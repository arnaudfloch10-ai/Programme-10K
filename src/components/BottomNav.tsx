export type ScreenId = 'today' | 'week' | 'plan' | 'zones' | 'journal' | 'measures' | 'settings'

const TABS: { id: ScreenId; label: string }[] = [
  { id: 'today', label: "Auj." },
  { id: 'week', label: 'Semaine' },
  { id: 'plan', label: 'Plan' },
  { id: 'zones', label: 'Zones' },
  { id: 'journal', label: 'Journal' },
  { id: 'measures', label: 'Mesures' },
  { id: 'settings', label: 'Réglages' },
]

export function BottomNav({ active, onNavigate }: { active: ScreenId; onNavigate: (s: ScreenId) => void }) {
  return (
    <nav
      className="sticky bottom-0 z-10 border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className={`tap flex-1 whitespace-nowrap px-2 py-2 text-center font-cond text-xs ${
              active === t.id ? 'border-t-2 border-ink font-bold text-ink' : 'text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
