import type { Alert } from '../lib/alerts'

const STYLES: Record<Alert['level'], string> = {
  danger: 'border-danger bg-danger/10 text-danger',
  warning: 'border-z4 bg-z4/10 text-ink',
  info: 'border-line bg-white text-ink',
}

export function AlertBanner({ alert }: { alert: Alert }) {
  return (
    <div
      className={`rounded-md border-l-4 p-3 ${STYLES[alert.level]} ${alert.blocking ? 'border-2' : ''}`}
      role={alert.blocking ? 'alert' : undefined}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-cond text-sm font-bold uppercase tracking-wide">
          {alert.blocking ? '⛔ ' : ''}
          {alert.title}
        </span>
      </div>
      <p className="mt-1 text-sm">{alert.message}</p>
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
