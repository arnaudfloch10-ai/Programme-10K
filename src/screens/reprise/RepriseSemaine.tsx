import { useReprise } from '../../store/RepriseContext'
import { Mono } from '../../components/ui'

// Navigateur des 4 semaines du bloc 1 : sélectionne la semaine active.
export function RepriseSemaine() {
  const { plan, activeWeek, setActiveWeek } = useReprise()
  const weeks = plan.blocs[0].semaines

  return (
    <div className="space-y-4 px-4 py-4">
      <header>
        <h1 className="screen-title">Semaine</h1>
        <p className="text-sm text-ink-soft">Bloc 1 — choisis la semaine en cours.</p>
      </header>

      <div className="space-y-2">
        {weeks.map((w) => {
          const active = w.numero === activeWeek
          return (
            <button
              key={w.numero}
              onClick={() => setActiveWeek(w.numero)}
              className="card flex w-full items-center gap-3 p-3 text-left"
              style={active ? { borderColor: 'var(--accent)', borderWidth: 2 } : undefined}
            >
              <div className="w-10 shrink-0 text-center">
                <div className="font-cond text-sm font-bold">S{w.numero}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Mono className="text-sm font-bold">{w.volumeCibleMin} min</Mono>
                  <Mono className="text-xs text-ink-soft">~{w.volumeCibleKm} km</Mono>
                  {w.allegee && <span className="text-[10px] font-bold uppercase text-ink-soft">allégée</span>}
                </div>
                <div className="truncate text-xs text-ink-soft">{w.consigneCle}</div>
              </div>
              {active && (
                <span className="shrink-0 font-cond text-xs font-bold" style={{ color: 'var(--accent)' }}>
                  active
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
