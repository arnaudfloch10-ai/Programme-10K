import type { ReactNode } from 'react'
import { ZONE_COLORS, ZONE_LABELS, type ZoneId } from '../lib/zones'

/** Pastille couleur de zone. La couleur n'encode QUE l'intensité. */
export function ZoneBadge({ zone, showLabel = false }: { zone: ZoneId; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: ZONE_COLORS[zone] }}
        aria-hidden
      />
      <span className="font-cond text-xs font-medium">
        {zone}
        {showLabel && zone !== 'REST' ? ` · ${ZONE_LABELS[zone]}` : ''}
      </span>
    </span>
  )
}

/** Bandeau de couleur de zone à gauche d'un bloc. */
export function ZoneStripe({ zone }: { zone: ZoneId }) {
  return <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone] }} aria-hidden />
}

/** Texte monospace pour allures / temps / FC (alignement des chiffres). */
export function Mono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`num ${className}`}>{children}</span>
}

export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="num text-lg leading-tight">{children}</div>
    </div>
  )
}
