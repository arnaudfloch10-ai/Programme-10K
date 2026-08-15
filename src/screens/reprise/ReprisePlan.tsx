import { useReprise } from '../../store/RepriseContext'
import { Mono } from '../../components/ui'

// Périodisation : bloc 1 (chiffré) + blocs 2/3 verrouillés « à définir »,
// déverrouillés (message coach) une fois la VMA mesurée.
export function ReprisePlan() {
  const { plan, vmaMeasured } = useReprise()

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="screen-title">Plan</h1>
        <p className="text-sm text-ink-soft">Reprise aérobie — pilotage fréquence cardiaque.</p>
      </header>

      {plan.blocs.map((b) => {
        const locked = b.statut === 'verrouille'
        return (
          <div key={b.numero} className={`card p-4 ${locked ? 'border-dashed' : ''}`}>
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-cond text-base font-bold">
                Bloc {b.numero} · {b.titre}
              </div>
              {b.numero === 1 && <span className="num text-xs text-ink-soft">semaines 1–4</span>}
            </div>
            <p className="mt-1 text-xs text-ink-soft">{b.objectif}</p>

            {b.statut === 'actif' && (
              <div className="mt-3 space-y-1.5">
                {b.semaines.map((w) => (
                  <div key={w.numero} className="flex items-baseline justify-between border-t border-line pt-1.5 text-sm first:border-0 first:pt-0">
                    <span className="font-cond">
                      Semaine {w.numero}
                      {w.allegee && <span className="ml-1 text-[10px] uppercase text-ink-soft">allégée</span>}
                    </span>
                    <Mono className="text-ink-soft">
                      {w.volumeCibleMin} min · ~{w.volumeCibleKm} km
                    </Mono>
                  </div>
                ))}
              </div>
            )}

            {locked && (
              <div className="mt-3 rounded-md bg-paper p-3 text-sm">
                {vmaMeasured && b.numero === 2 ? (
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    VMA mesurée — transmettre le résultat au coach pour la suite du plan.
                  </span>
                ) : (
                  <span className="text-ink-soft">🔒 {b.messageVerrouille}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
