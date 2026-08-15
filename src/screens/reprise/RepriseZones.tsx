import { useReprise } from '../../store/RepriseContext'
import { useApp } from '../../store/AppContext'
import { Mono } from '../../components/ui'
import { formatLongDate } from '../../lib/format'

// Zones FC (méthode Karvonen) : la FC est l'information principale, l'allure secondaire.
export function RepriseZones() {
  const { plan, vmaMeasured } = useReprise()
  const { profile } = useApp()

  return (
    <div className="space-y-4 px-4 py-3">
      <header>
        <h1 className="screen-title">Zones</h1>
        <p className="text-sm text-ink-soft">
          Fréquence cardiaque (réserve {profile.fcMax}−{profile.fcRepos ?? 62} bpm). L'allure est indicative.
        </p>
      </header>

      <div className="card overflow-hidden">
        <div className="grid items-center gap-x-2 border-b border-line px-3 py-2" style={{ gridTemplateColumns: '1fr auto auto' }}>
          <span className="label">Zone</span>
          <span className="label text-right">FC bpm</span>
          <span className="label text-right">Allure</span>
        </div>
        {plan.zones.map((z) => (
          <div key={z.id} className="grid items-center gap-x-2 border-b border-line px-3 py-2 last:border-0" style={{ gridTemplateColumns: '1fr auto auto' }}>
            <div className="min-w-0">
              <div className="truncate font-cond text-sm font-bold">{z.libelle}</div>
              <div className="num text-[11px] text-ink-soft">{z.pctReserveMin}–{z.pctReserveMax} % réserve</div>
            </div>
            <Mono className="text-right text-base font-bold" style={{ color: 'var(--accent)' }}>
              {z.fcMin}–{z.fcMax}
            </Mono>
            <Mono className="w-20 text-right text-[13px] text-ink-soft">
              {z.allureMin}–{z.allureMax}
            </Mono>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-md p-3" style={{ backgroundColor: 'var(--accent-tint)' }}>
        <span className="label">Fourchette bloc 1</span>
        <Mono className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
          {plan.fourchetteTravailParDefaut.min}–{plan.fourchetteTravailParDefaut.max} <span className="text-xs text-ink-soft">bpm</span>
        </Mono>
      </div>

      <div className="card p-4">
        <div className="label mb-1">VMA</div>
        {vmaMeasured ? (
          <p className="text-sm">
            <Mono className="font-bold">{profile.vma} km/h</Mono>
            {profile.vmaMeasuredAt && (
              <span className="text-ink-soft"> — mesurée le {formatLongDate(profile.vmaMeasuredAt)}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            Inconnue — à mesurer avec le test demi-Cooper de la semaine 4 (jambes fraîches).
          </p>
        )}
      </div>
    </div>
  )
}
