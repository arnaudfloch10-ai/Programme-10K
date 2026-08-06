import type { Session } from '../types'
import { zonePace, formatPace, ZONE_COLORS, isTrainingZone, type TrainingZone } from '../lib/zones'
import { formatKm } from '../lib/format'
import { Mono } from './ui'

// Plan de course affiché le jour J (écran Aujourd'hui) : tronçons + allures dérivées.
export function RacePlan({ session, vma }: { session: Session; vma: number }) {
  return (
    <div className="space-y-1.5">
      {session.warmupKm != null && (
        <RaceRow
          label="Échauffement"
          detail={`${formatKm(session.warmupKm)} km ${session.warmupZone ?? 'Z2'}${session.warmupNote ? ` + ${session.warmupNote}` : ''}`}
        />
      )}

      {(session.raceSegments ?? []).map((seg, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-24 shrink-0 font-cond font-semibold">{seg.label}</span>
          {seg.free ? (
            <span className="font-cond text-ink-soft">libre</span>
          ) : (
            <>
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: ZONE_COLORS[seg.zone ?? 'Z4'] }}
                  aria-hidden
                />
                <span className="font-cond text-xs font-bold">
                  {seg.zone}
                  {seg.zonePosition === 'haut' ? ' haut' : seg.zonePosition === 'bas' ? ' bas' : ''}
                </span>
              </span>
              <span className="flex-1" />
              <Mono className="shrink-0 text-[15px] font-semibold">
                {formatPace(
                  zonePace(
                    vma,
                    (seg.zone && isTrainingZone(seg.zone) ? seg.zone : 'Z4') as TrainingZone,
                    seg.zonePosition ?? 'milieu',
                  ),
                )}
                <span className="text-xs text-ink-soft">/km</span>
              </Mono>
            </>
          )}
        </div>
      ))}

      {session.cooldownKm != null && (
        <RaceRow label="Retour au calme" detail={`${formatKm(session.cooldownKm)} km Z1`} />
      )}

      {session.raceConsigne && (
        <div className="mt-3 rounded-md border-l-4 border-z4 bg-z4/5 p-3">
          <p className="text-sm">{session.raceConsigne}</p>
        </div>
      )}
    </div>
  )
}

function RaceRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="label w-24 shrink-0">{label}</span>
      <span className="font-cond">{detail}</span>
    </div>
  )
}
