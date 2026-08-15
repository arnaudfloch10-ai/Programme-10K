import { useReprise } from '../../store/RepriseContext'
import { REPRISE_SUIVI } from '../../data/plans/repriseSuivi'

// Renforcement : 2 séances/semaine, 20 min, APRÈS une sortie ou sur jour off.
// Cases réinitialisées chaque semaine (clé de semaine calendaire).
export function RepriseRenfo() {
  const { renfoDone, toggleRenfo } = useReprise()
  const done = renfoDone.length
  const total = REPRISE_SUIVI.renfo.length

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="screen-title">Renforcement</h1>
        <p className="text-sm text-ink-soft">
          2 séances de 20 min par semaine, <strong>après</strong> une sortie ou sur jour off — jamais avant.
        </p>
      </header>

      <div className="flex items-center justify-between rounded-md p-3" style={{ backgroundColor: 'var(--accent-tint)' }}>
        <span className="label">Cette semaine</span>
        <span className="num text-lg font-bold text-ink">
          {done}/{total}
        </span>
      </div>

      <div className="space-y-2">
        {REPRISE_SUIVI.renfo.map((ex) => {
          const checked = renfoDone.includes(ex.id)
          return (
            <button
              key={ex.id}
              onClick={() => toggleRenfo(ex.id)}
              className="card tap flex w-full items-start gap-3 p-4 text-left"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border text-white"
                style={
                  checked
                    ? { backgroundColor: 'var(--accent, #141414)', borderColor: 'var(--accent, #141414)' }
                    : { borderColor: 'var(--line, #ddd)' }
                }
              >
                {checked ? '✓' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`font-cond text-sm font-semibold ${checked ? 'text-ink-soft line-through' : ''}`}>
                    {ex.nom}
                  </span>
                  <span className="num shrink-0 text-xs text-ink-soft">{ex.volume}</span>
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">{ex.justification}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
