import { useState } from 'react'
import type { RepriseSeance, SeanceRealisee } from '../../types'
import { Mono } from '../ui'

const JOUR_ABBR: Record<string, string> = { mardi: 'MAR', jeudi: 'JEU', dimanche: 'DIM' }

// §5 — repli d'aide course/marche pour tenir la zone (bloc 1).
const RUN_WALK =
  "Impossible de rester sous 155 bpm en courant ? Passer en 5 min course / 1 min marche. " +
  "Ce n'est pas une régression : c'est le seul moyen de tenir la zone."

// Récapitulatif compact d'une séance faite : durée, FC moy, ressenti (champs absents omis).
function recap(r: SeanceRealisee): string {
  const parts: string[] = []
  if (r.dureeMin != null) parts.push(`${r.dureeMin} min`)
  if (r.fcMoy != null) parts.push(`FC ${r.fcMoy}`)
  parts.push(`ressenti ${r.ressenti}/5`)
  return parts.join(' · ')
}

// Carte de séance FC : la cible en bpm est l'information principale (gros mono),
// l'allure reste secondaire.
export function SeanceCard({
  seance,
  onOpenTest,
  onLog,
  realisee,
}: {
  seance: RepriseSeance
  onOpenTest?: () => void
  onLog?: () => void
  realisee?: SeanceRealisee
}) {
  const isTest = seance.type === 'TEST' || seance.test
  const [openWalk, setOpenWalk] = useState(false)
  const done = !!realisee

  return (
    <div className="card p-4" style={done ? { borderColor: 'var(--accent, #141414)' } : undefined}>
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

      {/* §4 — note de séance (physiologie), affichée quand renseignée. */}
      {seance.note && <p className="mt-2 text-xs italic text-ink-soft">{seance.note}</p>}

      {/* §5 — aide course/marche, repliée par défaut. */}
      {!isTest && (
        <details className="mt-2" open={openWalk} onToggle={(e) => setOpenWalk((e.target as HTMLDetailsElement).open)}>
          <summary className="tap cursor-pointer list-none font-cond text-xs font-semibold text-ink-soft">
            {openWalk ? '−' : '+'} Difficile de tenir la zone ?
          </summary>
          <p className="mt-1 text-xs text-ink-soft">{RUN_WALK}</p>
        </details>
      )}

      {/* État fait : récap compact + lien de modification. */}
      {!isTest && done && (
        <div className="mt-3 rounded-md p-2.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, white)' }}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-cond text-sm font-semibold" style={{ color: 'var(--accent, #141414)' }}>
              ✓ Fait
            </span>
            <Mono className="text-xs text-ink-soft">{recap(realisee)}</Mono>
          </div>
        </div>
      )}

      {!isTest && onLog && (
        <button
          onClick={onLog}
          className={`tap mt-2 w-full rounded-md border py-2 font-cond text-sm font-semibold ${
            done ? 'border-line text-ink-soft' : ''
          }`}
          style={done ? undefined : { borderColor: 'var(--accent, #141414)', color: 'var(--accent, #141414)' }}
        >
          {done ? 'Modifier la saisie' : 'Saisir'}
        </button>
      )}
    </div>
  )
}
