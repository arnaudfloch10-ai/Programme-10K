import { useMemo } from 'react'
import { useReprise } from '../../store/RepriseContext'
import { useApp } from '../../store/AppContext'
import { BadgeGrid } from '../../components/badges/BadgeGrid'
import { buildStates, type Activity } from '../../badges/engine'

// Écran Badges de Charline : états calculés par le moteur pur à partir de ses
// données réelles (séances réalisées + FC de repos matinales).
export function RepriseBadges() {
  const { seances, mesures } = useReprise()
  const { profile } = useApp()

  const states = useMemo(() => {
    const activities: Activity[] = seances.map((s) => ({
      date: s.date,
      distanceKm: s.distanceKm,
      durationMin: s.dureeMin,
      avgHr: s.fcMoy,
    }))
    const restingHr = mesures
      .filter((m) => typeof m.fcRepos === 'number')
      .map((m) => ({ date: m.date, bpm: m.fcRepos as number }))
    return buildStates({ activities, fcMax: profile.fcMax, restingHr })
  }, [seances, mesures, profile.fcMax])

  return <BadgeGrid states={states} />
}
