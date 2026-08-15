import { useMemo, useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { Mono } from '../../components/ui'
import { AlertList } from '../../components/AlertBanner'
import { formatKm } from '../../lib/format'
import { generateCoachSummary, moyenneFcRepos } from '../../lib/coachSummary'

// Bilan de la semaine calendaire en cours : réalisé vs prévu, indicateurs, résumé coach.
export function RepriseBilan() {
  const { plan, activeWeek, seances, mesures, alerts, curWeekKey, weekKeyOf } = useReprise()
  const f = plan.fourchetteTravailParDefaut

  const week = plan.blocs[0].semaines.find((w) => w.numero === activeWeek) ?? plan.blocs[0].semaines[0]

  const weekSeances = useMemo(
    () => seances.filter((s) => weekKeyOf(s.date) === curWeekKey),
    [seances, weekKeyOf, curWeekKey],
  )
  const weekMesures = useMemo(
    () => mesures.filter((m) => weekKeyOf(m.date) === curWeekKey),
    [mesures, weekKeyOf, curWeekKey],
  )

  const volMin = weekSeances.reduce((a, s) => a + (s.dureeMin ?? 0), 0)
  const volKm = weekSeances.reduce((a, s) => a + (s.distanceKm ?? 0), 0)

  const avecFc = weekSeances.filter((s) => s.fcMoy != null)
  const dansCible = avecFc.filter((s) => (s.fcMoy as number) >= f.min && (s.fcMoy as number) <= f.max).length
  const cadences = weekSeances.map((s) => s.cadence).filter((c): c is number => c != null)
  const cadMoy = cadences.length ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length) : null
  const fcReposMoy = moyenneFcRepos(weekMesures)

  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function generate() {
    const txt = generateCoachSummary({
      weekNumero: week.numero,
      seances: weekSeances,
      mesures: weekMesures,
      alertes: alerts.map((a) => a.title),
    })
    setSummary(txt)
    setCopied(false)
  }

  async function copy() {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <header>
        <div className="label">Semaine {week.numero} en cours</div>
        <h1 className="screen-title">Bilan</h1>
      </header>

      {/* Volume réalisé vs prévu. */}
      <div className="card p-4">
        <div className="label mb-2">Volume réalisé / prévu</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-ink-soft">Minutes</div>
            <Mono className="data-lg font-bold text-ink">
              {volMin}
              <span className="text-sm text-ink-soft"> / {week.volumeCibleMin}</span>
            </Mono>
          </div>
          <div>
            <div className="text-xs text-ink-soft">Kilomètres</div>
            <Mono className="data-lg font-bold text-ink">
              {formatKm(volKm)}
              <span className="text-sm text-ink-soft"> / {formatKm(week.volumeCibleKm)}</span>
            </Mono>
          </div>
        </div>
      </div>

      {/* Indicateurs. */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="label">Dans la cible {f.min}–{f.max}</div>
          <Mono className="text-lg font-bold">
            {dansCible}
            <span className="text-sm text-ink-soft"> / {avecFc.length || 0} séances</span>
          </Mono>
        </div>
        <div className="card p-3">
          <div className="label">Cadence moyenne</div>
          <Mono className="text-lg font-bold">
            {cadMoy != null ? cadMoy : '—'}
            {cadMoy != null && <span className="text-sm text-ink-soft"> ppm</span>}
          </Mono>
        </div>
        <div className="card p-3">
          <div className="label">FC repos moyenne</div>
          <Mono className="text-lg font-bold">
            {fcReposMoy != null ? fcReposMoy : '—'}
            {fcReposMoy != null && <span className="text-sm text-ink-soft"> bpm</span>}
          </Mono>
        </div>
        <div className="card p-3">
          <div className="label">Séances notées</div>
          <Mono className="text-lg font-bold">{weekSeances.length}</Mono>
        </div>
      </div>

      {/* Alertes de la semaine. */}
      {alerts.length > 0 && (
        <div>
          <div className="label mb-2">Alertes</div>
          <AlertList alerts={alerts} />
        </div>
      )}

      {/* Résumé coach copiable. */}
      <div className="space-y-2">
        <button
          onClick={generate}
          className="tap w-full rounded-md py-3 font-cond font-bold text-white"
          style={{ backgroundColor: 'var(--accent, #141414)' }}
        >
          Générer le résumé coach
        </button>

        {summary != null && (
          <div className="space-y-2">
            <textarea readOnly value={summary} rows={Math.min(12, summary.split('\n').length + 1)} className="inp num text-xs" />
            <button onClick={copy} className="tap w-full rounded-md border border-line py-2 font-cond text-sm font-semibold">
              {copied ? '✓ Copié' : 'Copier le texte'}
            </button>
            <p className="text-xs text-ink-soft">À transmettre au coach pour l'ajustement hebdomadaire.</p>
          </div>
        )}
      </div>
    </div>
  )
}
