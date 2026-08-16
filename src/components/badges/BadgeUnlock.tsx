import { useEffect, useMemo, useState } from 'react'
import { Badge } from './Badge'
import { getBadge, getFamily } from '../../badges/families'
import type { BadgeLevel } from '../../badges/types'

const SPARK_COLORS = ['#d9a63c', '#ff9ecb', '#9aa0ac']

// Notification de déblocage — célébration bienvenue : rebond 400 ms + étincelles,
// message court et chaleureux. Respecte prefers-reduced-motion.
export function BadgeUnlock({
  id,
  level,
  onClose,
  autoCloseMs = 4200,
}: {
  id: string
  level?: BadgeLevel
  onClose: () => void
  autoCloseMs?: number
}) {
  const def = getBadge(id)
  const [go, setGo] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setGo(true), 60)
    const t2 = setTimeout(onClose, autoCloseMs)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onClose, autoCloseMs])

  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        const d = 38 + (i % 3) * 8
        return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - 6, c: SPARK_COLORS[i % 3] }
      }),
    [],
  )

  if (!def) return null
  const fam = getFamily(def.family)

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      role="status"
      aria-live="polite"
      onClick={onClose}
    >
      <div className="badge-pop relative flex max-w-sm items-center gap-4 rounded-2xl border p-4 shadow-lg"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeft: `4px solid ${fam.color}` }}>
        <div className="relative shrink-0">
          {go &&
            sparks.map((s, i) => (
              <span
                key={i}
                className="badge-spark pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-sm"
                style={{ background: s.c, ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px` }}
              />
            ))}
          <Badge id={id} level={level} size={60} />
        </div>
        <div className="min-w-0">
          <div className="font-cond text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: fam.color }}>
            Nouveau badge{level ? ` · ${level}` : ''}
          </div>
          <div className="font-cond text-lg font-extrabold leading-tight text-ink">{def.nom}</div>
          {def.message && <p className="mt-0.5 text-xs text-ink-soft">{def.message}</p>}
        </div>
      </div>
    </div>
  )
}
