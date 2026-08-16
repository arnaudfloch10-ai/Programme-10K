import { Badge } from './Badge'
import { BADGES_BY_FAMILY, FAMILIES, TOTAL_BADGES } from '../../badges/families'
import type { BadgeStates } from '../../badges/types'
import { formatShortDate } from '../../lib/format'

// Grille groupée par famille : 3 colonnes, badges verrouillés visibles en gris,
// compteur global en tête. Aucune comparaison avec d'autres utilisateurs.
export function BadgeGrid({ states }: { states: BadgeStates }) {
  const totalUnlocked = Object.values(states).filter((s) => s.unlocked).length

  return (
    <div className="space-y-6 px-4 py-4">
      <header className="flex items-baseline justify-between gap-2">
        <h1 className="screen-title">Badges</h1>
        <span className="num rounded-full border border-line px-3 py-1 text-sm" style={{ background: 'var(--surface-2, transparent)' }}>
          <b style={{ color: 'var(--accent)' }}>{totalUnlocked}</b> / {TOTAL_BADGES}
        </span>
      </header>

      {FAMILIES.map((fam) => {
        const badges = BADGES_BY_FAMILY(fam.id)
        const got = badges.filter((b) => states[b.id]?.unlocked).length
        return (
          <section key={fam.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: fam.color }} aria-hidden />
              <h2 className="font-cond text-base font-bold">{fam.nom}</h2>
              <span className="num ml-auto text-xs text-ink-soft">
                {got} / {badges.length}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-4">
              {badges.map((b) => {
                const st = states[b.id]
                const unlocked = !!st?.unlocked
                return (
                  <div key={b.id} className="flex flex-col items-center text-center">
                    <Badge id={b.id} state={st} size={84} />
                    <div className={`mt-2 font-cond text-[13px] font-bold leading-tight ${unlocked ? 'text-ink' : 'text-ink-faint'}`}>
                      {b.nom}
                    </div>
                    <div className={`mt-0.5 text-[11px] leading-snug ${unlocked ? 'text-ink-soft' : 'text-ink-faint'}`}>
                      {b.condition}
                    </div>
                    {unlocked ? (
                      <div className="num mt-1 text-[10.5px]" style={{ color: 'var(--accent)' }}>
                        {st?.level ? `${st.level} · ` : ''}
                        {st?.date ? formatShortDate(st.date) : 'obtenu'}
                      </div>
                    ) : (
                      <div className="num mt-1 text-[10.5px] text-ink-faint">verrouillé</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
