import type { Session, ZoneId } from '../types'
import { resolveSession, formatSecShort } from '../lib/sessionPace'
import { formatKm } from '../lib/format'
import { ZONE_COLORS } from '../lib/zones'
import { Mono } from './ui'

// Rendu détaillé d'une séance. Chaque bloc tient sur UNE seule ligne :
// pastille · zone · distance/durée · allure cible · plage (ou récup).
export function SessionDetail({ session, vma }: { session: Session; vma: number }) {
  const r = resolveSession(vma, session)

  return (
    <div className="space-y-1.5">
      {r.warmup && (
        <Row
          zone={r.warmup.zone}
          effort={`Éch ${formatKm(r.warmup.km)} km`}
          pace={r.warmup.pace}
          trailing={r.warmup.range}
        />
      )}

      {r.steady && (
        <Row
          zone={r.steady.zone}
          effort={`${formatKm(r.steady.km)} km`}
          pace={r.steady.pace}
          trailing={r.steady.range}
        />
      )}

      {r.intervals.map((iv, i) => (
        <Row
          key={i}
          zone={iv.zone}
          effort={iv.effortLabel}
          pace={iv.paceLabel}
          trailing={iv.recoveryLabel ?? iv.rangeLabel}
          freeEffort={iv.paceLabel == null}
        />
      ))}

      {r.cooldown && (
        <Row zone="Z1" effort={`RC ${formatKm(r.cooldown.km)} km`} pace={r.cooldown.pace} trailing={r.cooldown.range} />
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

function Row({
  zone,
  effort,
  pace,
  trailing,
  freeEffort,
}: {
  zone: ZoneId
  effort: string
  pace: string | null
  trailing: string | null
  freeEffort?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone] }} aria-hidden />
        <span className="font-cond text-xs font-bold">{zone}</span>
      </span>
      <span className="min-w-0 flex-1 truncate font-cond">{effort}</span>
      {pace ? (
        <Mono className="shrink-0 whitespace-nowrap text-[15px] font-semibold">
          {pace}
          <span className="text-xs text-ink-soft">/km</span>
        </Mono>
      ) : freeEffort ? (
        <span className="shrink-0 whitespace-nowrap font-cond text-xs text-ink-soft">effort libre</span>
      ) : null}
      {trailing && <Mono className="shrink-0 whitespace-nowrap text-xs text-ink-soft">{trailing}</Mono>}
    </div>
  )
}

export { formatSecShort }
