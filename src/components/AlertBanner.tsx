import type { Alert } from '../lib/alerts'

// §5 — sévérité → token dédié. JAMAIS l'accent (indistinguable du reste de l'UI).
// Couleurs pleines (aucun fond translucide, qui rend mal en OLED).
function severityColor(level: Alert['level']): string {
  // haute (warning/danger) → alert-high ; moyenne (info) → alert-warn.
  return level === 'info' ? 'var(--alert-warn)' : 'var(--alert-high)'
}

export function AlertBanner({ alert }: { alert: Alert }) {
  const color = severityColor(alert.level)
  return (
    <div
      className="rounded-md border border-l-4 p-3"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: color }}
      role={alert.blocking ? 'alert' : undefined}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-cond text-sm font-bold uppercase tracking-wide" style={{ color }}>
          {alert.blocking ? '⛔ ' : ''}
          {alert.title}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink">{alert.message}</p>
    </div>
  )
}

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <AlertBanner key={a.id} alert={a} />
      ))}
    </div>
  )
}
