import { useReprise } from '../../store/RepriseContext'
import { REPRISE_SUIVI } from '../../data/plans/repriseSuivi'
import { Mono } from '../../components/ui'
import { formatKm } from '../../lib/format'

// Écran statique « Signaux d'alerte » + rappel matériel (compteur chaussures cumulé).
export function RepriseSignaux() {
  const { seances } = useReprise()
  const { signauxArret, chaussure } = REPRISE_SUIVI

  const kmCumul = seances.reduce((a, s) => a + (s.distanceKm ?? 0), 0)
  const pct = Math.min(100, (kmCumul / chaussure.seuilMaxKm) * 100)
  const aRemplacer = kmCumul >= chaussure.seuilMinKm

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <h1 className="screen-title">Signaux d'alerte</h1>
      </header>

      <div className="rounded-md border-l-4 border-danger bg-danger/10 p-4">
        <div className="font-cond text-sm font-bold uppercase tracking-wide text-danger">
          Arrêt immédiat et consultation si
        </div>
        <ul className="mt-2 space-y-2">
          {signauxArret.map((s) => (
            <li key={s} className="flex gap-2 text-sm">
              <span aria-hidden className="text-danger">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rappel matériel : compteur chaussures cumulé. */}
      <div className="card p-4">
        <div className="flex items-baseline justify-between">
          <span className="label">Chaussures</span>
          <span className="font-cond text-sm font-semibold">{chaussure.nom}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <Mono className="data-lg font-bold" style={{ color: aRemplacer ? '#a32e3d' : 'var(--accent)' }}>
            {formatKm(kmCumul)}
          </Mono>
          <span className="text-sm text-ink-soft">
            km cumulés · remplacer entre {chaussure.seuilMinKm} et {chaussure.seuilMaxKm} km
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/50">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: aRemplacer ? '#a32e3d' : 'var(--accent, #141414)' }}
          />
        </div>
        {aRemplacer && (
          <p className="mt-2 text-xs font-semibold text-danger">
            Seuil de remplacement atteint — surveiller l'amorti et prévoir une paire neuve.
          </p>
        )}
        <p className="mt-1 text-xs text-ink-soft">Cumul calculé sur les distances des séances notées.</p>
      </div>
    </div>
  )
}
