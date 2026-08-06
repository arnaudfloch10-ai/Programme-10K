import type { StrengthRoutine } from '../data/strength'
import { useApp } from '../store/AppContext'

// Affiche une routine de renfo comme une séance, avec une case à cocher
// comptabilisée dans le journal (log dédié, clé = renfoSessionId + date).
export function StrengthDetail({
  routine,
  renfoSessionId,
  date,
  currentWeekNumber,
}: {
  routine: StrengthRoutine
  renfoSessionId: string
  date: string
  currentWeekNumber?: number
}) {
  const { logs, profile, saveLog, deleteLog } = useApp()
  const log = logs.find((l) => l.sessionId === renfoSessionId && l.date === date)
  const done = !!log?.done

  async function toggle() {
    if (done) {
      await deleteLog(renfoSessionId, date)
    } else {
      await saveLog({
        sessionId: renfoSessionId,
        date,
        done: true,
        vmaAtDate: profile.vma,
        feel: 3,
        fatigue: 3,
      })
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="session-title">{routine.title}</div>
          <div className="label mt-0.5">{routine.day}</div>
        </div>
        <label className="flex shrink-0 items-center gap-2">
          <span className="label">Fait</span>
          <input type="checkbox" checked={done} onChange={toggle} className="h-6 w-6" />
        </label>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {routine.exercises.map((ex, i) => {
          const upcoming = ex.from && currentWeekNumber != null && weekNum(ex.from) > currentWeekNumber
          return (
            <li key={i} className={`flex items-center justify-between gap-3 py-2 ${upcoming ? 'opacity-40' : ''}`}>
              <span className="text-sm">
                {ex.name}
                {ex.from && <span className="ml-1 text-xs text-ink-soft">(à partir de {ex.from})</span>}
              </span>
              <span className="num shrink-0 text-sm">{ex.sets}</span>
            </li>
          )
        })}
      </ul>

      <p className="mt-2 text-xs italic text-ink-soft">{routine.note}</p>
    </div>
  )
}

function weekNum(s: string): number {
  const m = s.match(/\d+/)
  return m ? Number(m[0]) : 0
}
