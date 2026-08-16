import { useMemo } from 'react'
import { useApp } from '../store/AppContext'
import { BadgeGrid } from '../components/badges/BadgeGrid'
import { buildStates, type Activity } from '../badges/engine'

// Écran Badges d'Arnaud : états calculés par le moteur pur à partir de ses
// séances loggées (distance/allure → durée) et de ses mesures (FC de repos).
export function Badges() {
  const { logs, measurements, profile } = useApp()

  const states = useMemo(() => {
    const activities: Activity[] = logs
      .filter((l) => l.done)
      .map((l) => ({
        date: l.date,
        distanceKm: l.actualKm,
        durationMin: l.actualKm != null && l.actualPaceS != null ? Math.round((l.actualKm * l.actualPaceS) / 60) : undefined,
        avgHr: l.actualHrAvg,
      }))
    const restingHr = measurements
      .filter((m) => typeof m.restingHr === 'number')
      .map((m) => ({ date: m.date, bpm: m.restingHr as number }))
    return buildStates({ activities, fcMax: profile.fcMax, restingHr })
  }, [logs, measurements, profile.fcMax])

  return <BadgeGrid states={states} />
}
