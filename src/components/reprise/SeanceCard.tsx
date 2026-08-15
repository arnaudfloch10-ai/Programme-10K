import type { RepriseSeance } from '../../types'
import { Mono } from '../ui'

const JOUR_ABBR: Record<string, string> = { mardi: 'MAR', jeudi: 'JEU', dimanche: 'DIM' }

// Carte de séance FC : la cible en bpm est l'information principale (gros mono),
// l'allure reste secondaire.
export function SeanceCard({ seance, onOpenTest }: { seance: RepriseSeance; onOpenTest?: () => void }) {
  const isTest = seance.type === 'TEST' || seance.test
  return (
    <div className="card p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded px-1.5 py-0.5 font-cond text-[10px] font-bold uppercase text-white" style={{ backgroundColor: 'var(--accent, #141414)' }}>
          {JOUR_ABBR[seance.jourSuggere] ?? seance.jourSuggere}
        </span>
        <span className="label">{seance.type}</span>
        {seance.dureeMin > 0 && <Mono className="ml-auto text-xs text-ink-soft">{seance.dureeMin} min</Mono>}
      </div>

      <div className="session-title">{seance.contenu}</div>

      {isTest ? (
        <button
          onClick={onOpenTest}
          className="tap mt-3 w-full rounded-md px-4 py-2 font-cond font-bold text-white"
          style={{ backgroundColor: 'var(--accent, #141414)' }}
        >
          Ouvrir le test demi-Cooper
        </button>
      ) : (
        <div className="mt-2 flex items-end justify-between gap-3">
          {seance.fcCible && (
            <div>
              <div className="label">Cible FC</div>
              <Mono className="data-lg font-bold" style={{ color: 'var(--accent, #141414)' }}>
                {seance.fcCible.min}–{seance.fcCible.max}
                <span className="text-sm text-ink-soft"> bpm</span>
              </Mono>
            </div>
          )}
          {seance.allureCible && (
            <div className="text-right">
              <div className="label">Allure indicative</div>
              <Mono className="text-sm text-ink-soft">{seance.allureCible.replace('-', '–')}/km</Mono>
            </div>
          )}
        </div>
      )}

      {seance.note && <p className="mt-2 text-xs italic text-ink-soft">{seance.note}</p>}
    </div>
  )
}
