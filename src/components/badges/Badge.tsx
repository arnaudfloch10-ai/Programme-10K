import { useId } from 'react'
import { getBadge, getFamily } from '../../badges/families'
import { ICONS } from '../../badges/icons'
import type { BadgeLevel, BadgeState } from '../../badges/types'

const HEX = '96,50 73,89.8 27,89.8 4,50 27,10.2 73,10.2'
const METAL: Record<BadgeLevel, string> = { bronze: '#c0824e', argent: '#9aa0ac', or: '#d9a63c' }

// Badge unitaire : médaillon SVG. Forme constante par famille (hexagone/cercle),
// couleur de la famille, niveau bronze/argent/or, état verrouillé/débloqué.
export function Badge({
  id,
  state,
  level,
  size = 96,
}: {
  id: string
  state?: BadgeState
  level?: BadgeLevel
  size?: number
}) {
  const def = getBadge(id)
  const gid = useId().replace(/:/g, '')
  if (!def) return null
  const fam = getFamily(def.family)
  const unlocked = state?.unlocked ?? true
  const lvl = level ?? state?.level

  // Dégradé et négatif dérivés de la couleur de famille.
  const soft = `color-mix(in srgb, ${fam.color} 78%, white)`
  const deep = `color-mix(in srgb, ${fam.color} 72%, black)`
  const nb = unlocked ? deep : 'var(--surface, #eee)'

  const shapeEl = (fill: string, extra = '') =>
    fam.shape === 'hexagon'
      ? `<polygon points="${HEX}" fill="${fill}" ${extra}/>`
      : `<circle cx="50" cy="50" r="46" fill="${fill}" ${extra}/>`

  const body = unlocked
    ? shapeEl(`url(#g${gid})`)
    : shapeEl('var(--surface-2, #e7e1ea)', 'stroke="var(--border,#ddd)" stroke-width="1.5"')

  const ring = unlocked && lvl ? shapeEl('none', `stroke="${METAL[lvl]}" stroke-width="6" stroke-linejoin="round"`) : ''

  const content = !unlocked
    ? `<g transform="translate(50 52)" fill="var(--text-tertiary,#9a8fa0)"><rect x="-9" y="-2" width="18" height="14" rx="3"/><path d="M-6 -2v-4a6 6 0 0112 0v4" fill="none" stroke="var(--text-tertiary,#9a8fa0)" stroke-width="3"/></g>`
    : def.label
      ? `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Jost, system-ui, sans-serif" font-weight="800" font-size="${def.label.length > 3 ? 26 : 30}" letter-spacing="-0.5">${def.label}</text>`
      : `<g transform="translate(28 28) scale(1.83)" fill="#fff" style="--nb:${nb}">${ICONS[def.icon ?? ''] ?? ''}</g>`

  const svg = `<defs><linearGradient id="g${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${soft}"/><stop offset="1" stop-color="${fam.color}"/></linearGradient></defs>
    ${body}${ring}${content}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${def.nom}${unlocked ? '' : ' (verrouillé)'}`}
      style={{ display: 'block', filter: unlocked ? 'drop-shadow(0 5px 10px rgba(0,0,0,.25))' : 'none' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
