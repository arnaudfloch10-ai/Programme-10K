import { useState } from 'react'
import { Badge } from './Badge'
import { BadgeGrid } from './BadgeGrid'
import { BadgeUnlock } from './BadgeUnlock'
import { BADGES, FAMILIES } from '../../badges/families'
import type { BadgeLevel, BadgeStates } from '../../badges/types'

// Fichier de démonstration : les 45 badges dans leurs états, pour validation.
// États synthétiques (≈ la moitié débloqués, niveaux variés).
const DEMO: BadgeStates = Object.fromEntries(
  BADGES.map((b, i) => {
    const unlocked = i % 5 !== 0 && i % 7 !== 3
    const level: BadgeLevel | undefined = b.tiers ? (['bronze', 'argent', 'or'] as const)[i % 3] : undefined
    const date = unlocked ? `2026-0${(i % 8) + 1 < 10 ? (i % 8) + 1 : 8}-${String((i % 27) + 1).padStart(2, '0')}` : undefined
    return [b.id, { unlocked, level, date }]
  }),
)

const LEVELS: (BadgeLevel | undefined)[] = [undefined, 'bronze', 'argent', 'or']

export function BadgeShowcase() {
  const [unlock, setUnlock] = useState<{ id: string; level?: BadgeLevel } | null>(null)

  return (
    <div className="space-y-8 pb-16">
      <div className="px-4 pt-4">
        <div className="label">Démonstration · 45 badges</div>
        <p className="mt-1 text-sm text-ink-soft">
          8 familles, forme et couleur constantes par famille. Trois niveaux max pour les badges
          évolutifs. Aucune série de jours, aucun classement.
        </p>
      </div>

      {/* Niveaux d'un badge évolutif. */}
      <section className="space-y-3 px-4">
        <div className="font-cond text-base font-bold">Trois niveaux — badges évolutifs</div>
        <div className="grid grid-cols-4 gap-3">
          {LEVELS.map((lvl) => (
            <div key={lvl ?? 'lock'} className="flex flex-col items-center gap-1.5 text-center">
              <Badge id="repos-merite" state={{ unlocked: !!lvl }} level={lvl} size={78} />
              <span className="font-cond text-xs font-bold uppercase tracking-wide text-ink-soft">
                {lvl ?? 'verrouillé'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Déclenchement de la célébration. */}
      <section className="space-y-3 px-4">
        <div className="font-cond text-base font-bold">Au déblocage · rebond 400 ms</div>
        <div className="flex flex-wrap gap-2">
          {FAMILIES.map((f) => {
            const b = BADGES.find((x) => x.family === f.id && x.message) ?? BADGES.find((x) => x.family === f.id)!
            return (
              <button
                key={f.id}
                onClick={() => setUnlock({ id: b.id, level: b.tiers ? 'bronze' : undefined })}
                className="tap rounded-full border px-3 py-1.5 font-cond text-xs font-semibold"
                style={{ borderColor: f.color, color: f.color }}
              >
                {f.nom}
              </button>
            )
          })}
        </div>
      </section>

      {/* Les 45 dans leurs états. */}
      <BadgeGrid states={DEMO} />

      {unlock && <BadgeUnlock id={unlock.id} level={unlock.level} onClose={() => setUnlock(null)} />}
    </div>
  )
}
