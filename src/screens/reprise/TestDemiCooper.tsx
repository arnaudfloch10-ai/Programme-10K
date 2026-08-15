import { useEffect, useRef, useState } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { paceFromVma, formatPace } from '../../lib/zones'
import { Mono } from '../../components/ui'

type Phase = 'idle' | 'countdown' | 'running' | 'stopped' | 'saved'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

// Test demi-Cooper : chrono 6 min (pré-décompte 5 s), saisie distance, VMA = distance/100.
export function TestDemiCooper({ onClose }: { onClose: () => void }) {
  const { plan, recordDemiCooper } = useReprise()
  const { dureeSecondes, preDecompteSecondes, recalculAllures, messageApresTest } = plan.testVma

  const [phase, setPhase] = useState<Phase>('idle')
  const [count, setCount] = useState(preDecompteSecondes)
  const [remaining, setRemaining] = useState(dureeSecondes)
  const [distance, setDistance] = useState('')
  const [vma, setVma] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }
  useEffect(() => clear, [])

  function start() {
    setPhase('countdown')
    setCount(preDecompteSecondes)
    clear()
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clear()
          setPhase('running')
          setRemaining(dureeSecondes)
          runTimer()
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  function runTimer() {
    clear()
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clear()
          setPhase('stopped')
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  function stopEarly() {
    clear()
    setPhase('stopped')
  }

  const distM = Number(distance) || 0
  const previewVma = distM > 0 ? Math.round((distM / 100) * 10) / 10 : 0

  async function save() {
    const v = await recordDemiCooper(distM)
    setVma(v)
    setPhase('saved')
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-cond text-lg font-bold">Test demi-Cooper</h2>
        <button onClick={onClose} className="tap px-2 font-cond text-sm text-ink-soft">
          Fermer
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {phase === 'idle' && (
          <>
            <p className="text-sm text-ink-soft">
              Après 20 min d'échauffement et 3 lignes droites : cours la <strong>distance maximale en 6 minutes</strong>,
              sur parcours plat mesuré ou piste. Un pré-décompte de {preDecompteSecondes} s précède le départ.
            </p>
            <button
              onClick={start}
              className="tap w-full rounded-md py-3 font-cond text-lg font-bold text-white"
              style={{ backgroundColor: 'var(--accent, #141414)' }}
            >
              Démarrer le test
            </button>
          </>
        )}

        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="label">Départ dans</div>
            <Mono className="text-7xl font-bold" style={{ color: 'var(--accent)' }}>
              {count}
            </Mono>
          </div>
        )}

        {phase === 'running' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="label">Temps restant</div>
            <Mono className="text-7xl font-bold" style={{ color: 'var(--accent)' }}>
              {fmt(remaining)}
            </Mono>
            <button
              onClick={stopEarly}
              className="tap mt-8 rounded-md border border-line px-6 py-2 font-cond font-bold"
            >
              Arrêter
            </button>
          </div>
        )}

        {phase === 'stopped' && (
          <>
            <label className="block">
              <span className="label">Distance parcourue (mètres)</span>
              <input
                inputMode="numeric"
                autoFocus
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="1200"
                className="inp num mt-1 text-2xl font-bold"
              />
            </label>

            {previewVma > 0 && (
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="label">VMA estimée</span>
                  <Mono className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                    {previewVma} km/h
                  </Mono>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="label">Allures dérivées</div>
                  {recalculAllures.map((a) => {
                    const slow = formatPace(paceFromVma(previewVma, a.pctVmaMin / 100))
                    const fast = formatPace(paceFromVma(previewVma, a.pctVmaMax / 100))
                    return (
                      <div key={a.id} className="flex items-baseline justify-between text-sm">
                        <span className="font-cond">
                          {a.libelle} <span className="text-xs text-ink-soft">{a.pctVmaMin}
                          {a.pctVmaMax !== a.pctVmaMin ? `–${a.pctVmaMax}` : ''} %</span>
                        </span>
                        <Mono className="font-semibold">
                          {a.pctVmaMin === a.pctVmaMax ? fast : `${slow}–${fast}`}
                          <span className="text-xs text-ink-soft"> /km</span>
                        </Mono>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              disabled={previewVma <= 0}
              onClick={save}
              className="tap w-full rounded-md py-3 font-cond font-bold text-white disabled:opacity-30"
              style={{ backgroundColor: 'var(--accent, #141414)' }}
            >
              Enregistrer la VMA
            </button>
          </>
        )}

        {phase === 'saved' && (
          <div className="space-y-4 py-8 text-center">
            <Mono className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>
              {vma} km/h
            </Mono>
            <p className="mx-auto max-w-xs text-sm">{messageApresTest}</p>
            <button
              onClick={onClose}
              className="tap w-full rounded-md py-3 font-cond font-bold text-white"
              style={{ backgroundColor: 'var(--accent, #141414)' }}
            >
              Terminé
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
