import type { Session } from '../types'
import { resolveSession, formatSecShort } from '../lib/sessionPace'
import { formatKm } from '../lib/format'
import { ZoneBadge, ZoneStripe, Mono } from './ui'

// Rendu détaillé d'une séance : échauffement, corps, récup — AVEC les allures.
export function SessionDetail({ session, vma }: { session: Session; vma: number }) {
  const r = resolveSession(vma, session)

  return (
    <div className="space-y-2">
      {r.warmup && (
        <Line
          label="Échauffement"
          zoneNode={<ZoneBadge zone={r.warmup.zone} />}
          effort={`${formatKm(r.warmup.km)} km`}
          pace={r.warmup.pace}
        />
      )}

      {r.steady && (
        <Line
          label="Corps"
          zoneNode={<ZoneBadge zone={r.steady.zone} showLabel />}
          effort={`${formatKm(r.steady.km)} km`}
          pace={r.steady.pace}
        />
      )}

      {r.intervals.map((iv, i) => (
        <div key={i} className="flex items-stretch gap-2">
          <ZoneStripe zone={iv.zone} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-cond text-base font-semibold">{iv.effortLabel}</span>
              {iv.paceLabel ? (
                <Mono className="text-base font-semibold">{iv.paceLabel}<span className="text-xs text-ink-soft">/km</span></Mono>
              ) : (
                <span className="font-cond text-xs text-ink-soft">effort libre</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
              <ZoneBadge zone={iv.zone} />
              {iv.recoveryLabel && <Mono className="text-xs">{iv.recoveryLabel}</Mono>}
            </div>
          </div>
        </div>
      ))}

      {r.cooldown && (
        <Line label="Retour au calme" zoneNode={<ZoneBadge zone="Z1" />} effort={`${formatKm(r.cooldown.km)} km`} pace={null} />
      )}

      {session.raceConsigne && (
        <div className="mt-3 rounded-md border-l-4 border-z4 bg-z4/5 p-3">
          <div className="label mb-1">Consigne de course</div>
          <p className="text-sm">{session.raceConsigne}</p>
        </div>
      )}

      {session.note && <p className="pt-1 text-xs italic text-ink-soft">{session.note}</p>}

      {session.strength && (
        <div className="pt-1 text-xs text-ink-soft">
          + Renforcement <span className="font-semibold">{session.strength}</span>
        </div>
      )}
    </div>
  )
}

function Line({
  label,
  zoneNode,
  effort,
  pace,
}: {
  label: string
  zoneNode: React.ReactNode
  effort: string
  pace: string | null
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="flex items-baseline gap-2">
        <span className="label w-24 shrink-0">{label}</span>
        <span className="font-cond text-sm">{effort}</span>
        {zoneNode}
      </div>
      {pace && (
        <Mono className="text-sm">
          {pace}
          <span className="text-xs text-ink-soft">/km</span>
        </Mono>
      )}
    </div>
  )
}

export { formatSecShort }
