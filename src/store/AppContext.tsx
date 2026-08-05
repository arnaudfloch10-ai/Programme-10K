import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LoggedSession, Measurement, Profile, VmaTest, Week } from '../types'
import * as repo from '../db/repo'
import type { ExportBundle } from '../db/repo'
import { computeAlerts, type Alert, type Z2Sample } from '../lib/alerts'
import { findWeekForDate, weekDoneKm } from '../lib/plan'
import { parseISODate, todayISO } from '../lib/format'

interface AppState {
  loading: boolean
  profile: Profile
  weeks: Week[]
  logs: LoggedSession[]
  measurements: Measurement[]
  vmaTests: VmaTest[]
  alerts: Alert[]
  today: string
  // actions
  saveProfile: (p: Profile) => Promise<void>
  applyVma: (vma: number, test?: VmaTest) => Promise<void>
  saveLog: (l: LoggedSession) => Promise<void>
  deleteLog: (sessionId: string, date: string) => Promise<void>
  saveMeasurement: (m: Measurement) => Promise<void>
  deleteMeasurement: (date: string) => Promise<void>
  exportAll: () => Promise<ExportBundle>
  importAll: (b: ExportBundle) => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>({} as Profile)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [logs, setLogs] = useState<LoggedSession[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [vmaTests, setVmaTests] = useState<VmaTest[]>([])
  const today = todayISO()

  const reload = useCallback(async () => {
    const [p, w, l, m, t] = await Promise.all([
      repo.getProfile(),
      repo.getWeeks(),
      repo.getLogs(),
      repo.getMeasurements(),
      repo.getVmaTests(),
    ])
    setProfile(p)
    setWeeks(w)
    setLogs(l)
    setMeasurements(m)
    setVmaTests(t)
  }, [])

  useEffect(() => {
    ;(async () => {
      await repo.ensureSeeded()
      await reload()
      setLoading(false)
    })()
  }, [reload])

  const saveProfile = useCallback(
    async (p: Profile) => {
      await repo.saveProfile(p)
      setProfile(p)
    },
    [],
  )

  const applyVma = useCallback(
    async (vma: number, test?: VmaTest) => {
      const next = await repo.setVma(vma)
      setProfile(next)
      if (test) {
        await repo.saveVmaTest(test)
        setVmaTests(await repo.getVmaTests())
      }
    },
    [],
  )

  const saveLog = useCallback(async (l: LoggedSession) => {
    await repo.saveLog(l)
    setLogs(await repo.getLogs())
  }, [])

  const deleteLog = useCallback(async (sessionId: string, date: string) => {
    await repo.deleteLog(sessionId, date)
    setLogs(await repo.getLogs())
  }, [])

  const saveMeasurement = useCallback(async (m: Measurement) => {
    await repo.saveMeasurement(m)
    setMeasurements(await repo.getMeasurements())
  }, [])

  const deleteMeasurement = useCallback(async (date: string) => {
    await repo.deleteMeasurement(date)
    setMeasurements(await repo.getMeasurements())
  }, [])

  const exportAll = useCallback(() => repo.exportAll(), [])
  const importAll = useCallback(
    async (b: ExportBundle) => {
      await repo.importAll(b)
      await reload()
    },
    [reload],
  )

  // Alertes dérivées.
  const alerts = useMemo<Alert[]>(() => {
    if (loading) return []
    const z2Samples: Z2Sample[] = logs
      .filter((l) => l.zoneHeld === 'Z2' && l.actualPaceS && l.actualHrAvg)
      .map((l) => ({ date: l.date, paceS: l.actualPaceS as number, hr: l.actualHrAvg as number }))

    const currentWeek = findWeekForDate(weeks, today)
    let currentWeekKm = 0
    let previousWeekKm = 0
    if (currentWeek) {
      currentWeekKm = weekDoneKm(currentWeek, logs)
      const prev = weeks.find((w) => w.number === currentWeek.number - 1)
      if (prev) previousWeekKm = weekDoneKm(prev, logs)
    }

    return computeAlerts({
      measurements,
      logs,
      z2Samples,
      currentWeekKm,
      previousWeekKm,
      todayISO: today,
    })
  }, [loading, logs, measurements, weeks, today])

  const value: AppState = {
    loading,
    profile,
    weeks,
    logs,
    measurements,
    vmaTests,
    alerts,
    today,
    saveProfile,
    applyVma,
    saveLog,
    deleteLog,
    saveMeasurement,
    deleteMeasurement,
    exportAll,
    importAll,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider')
  return ctx
}

// Réexport utilitaire pour les écrans.
export { parseISODate }
