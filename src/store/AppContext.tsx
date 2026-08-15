import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LoggedSession, Measurement, Profile, ProfilId, VmaTest, Week } from '../types'
import * as repo from '../db/repo'
import type { ExportBundle } from '../db/repo'
import { getDB } from '../db/db'
import { getProfil } from '../data/profils'
import { weeksForPlan } from '../data/plans'
import { computeAlerts, type Alert, type Z2Sample } from '../lib/alerts'
import { findWeekForDate, weekDoneKm } from '../lib/plan'
import { parseISODate, todayISO, daysBetween } from '../lib/format'
import type { Profil } from '../types'

const EXPORT_REMINDER_DAYS = 28 // rappel d'export toutes les 4 semaines

interface AppState {
  loading: boolean
  profilId: ProfilId | null // null → aucun profil actif (afficher le sélecteur)
  profil: Profil | null
  profile: Profile
  weeks: Week[]
  logs: LoggedSession[]
  measurements: Measurement[]
  vmaTests: VmaTest[]
  alerts: Alert[]
  today: string
  // actions profil
  switchProfile: (id: ProfilId) => Promise<void>
  // actions données (scopées au profil actif)
  saveProfile: (p: Profile) => Promise<void>
  applyVma: (vma: number, test?: VmaTest) => Promise<void>
  saveLog: (l: LoggedSession) => Promise<void>
  deleteLog: (sessionId: string, date: string) => Promise<void>
  saveMeasurement: (m: Measurement) => Promise<void>
  deleteMeasurement: (date: string) => Promise<void>
  exportAll: () => Promise<ExportBundle>
  importAll: (b: ExportBundle) => Promise<void>
  markExported: () => Promise<void>
  exportReminderDue: boolean
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profilId, setProfilId] = useState<ProfilId | null>(null)
  const [profile, setProfile] = useState<Profile>({} as Profile)
  const [logs, setLogs] = useState<LoggedSession[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [vmaTests, setVmaTests] = useState<VmaTest[]>([])
  const [lastExportAt, setLastExportAt] = useState<string | undefined>()
  const [firstLaunchAt, setFirstLaunchAt] = useState<string | undefined>()
  const today = todayISO()

  const profil = profilId ? getProfil(profilId) : null
  const weeks = useMemo(() => (profil ? weeksForPlan(profil.planId) : []), [profil])

  // Charge les données du profil donné en mémoire.
  const loadProfileData = useCallback(async (id: ProfilId) => {
    await repo.ensureProfileInitialized(id)
    await repo.ensureFirstLaunch(id, todayISO())
    const [p, l, m, t, meta] = await Promise.all([
      repo.getProfile(id),
      repo.getLogs(id),
      repo.getMeasurements(id),
      repo.getVmaTests(id),
      repo.getExportMeta(id),
    ])
    setProfile(p)
    setLogs(l)
    setMeasurements(m)
    setVmaTests(t)
    setFirstLaunchAt(meta.firstLaunchAt)
    setLastExportAt(meta.lastExportAt)
  }, [])

  useEffect(() => {
    ;(async () => {
      await getDB() // déclenche la migration v1→v2 si nécessaire
      try {
        await navigator.storage?.persist?.()
      } catch {
        /* non supporté */
      }
      const active = await repo.getActiveProfileId()
      if (active) {
        setProfilId(active)
        await loadProfileData(active)
      }
      setLoading(false)
    })()
  }, [loadProfileData])

  const switchProfile = useCallback(
    async (id: ProfilId) => {
      setLoading(true)
      await repo.setActiveProfileId(id)
      setProfilId(id)
      await loadProfileData(id)
      setLoading(false)
    },
    [loadProfileData],
  )

  const markExported = useCallback(async () => {
    if (!profilId) return
    const d = todayISO()
    await repo.setLastExport(profilId, d)
    setLastExportAt(d)
  }, [profilId])

  const saveProfile = useCallback(
    async (p: Profile) => {
      if (!profilId) return
      await repo.saveProfile(profilId, p)
      setProfile(p)
    },
    [profilId],
  )

  const applyVma = useCallback(
    async (vma: number, test?: VmaTest) => {
      if (!profilId) return
      const next = await repo.setVma(profilId, vma)
      setProfile(next)
      if (test) {
        await repo.saveVmaTest(profilId, test)
        setVmaTests(await repo.getVmaTests(profilId))
      }
    },
    [profilId],
  )

  const saveLog = useCallback(
    async (l: LoggedSession) => {
      if (!profilId) return
      await repo.saveLog(profilId, l)
      setLogs(await repo.getLogs(profilId))
    },
    [profilId],
  )

  const deleteLog = useCallback(
    async (sessionId: string, date: string) => {
      if (!profilId) return
      await repo.deleteLog(profilId, sessionId, date)
      setLogs(await repo.getLogs(profilId))
    },
    [profilId],
  )

  const saveMeasurement = useCallback(
    async (m: Measurement) => {
      if (!profilId) return
      await repo.saveMeasurement(profilId, m)
      setMeasurements(await repo.getMeasurements(profilId))
    },
    [profilId],
  )

  const deleteMeasurement = useCallback(
    async (date: string) => {
      if (!profilId) return
      await repo.deleteMeasurement(profilId, date)
      setMeasurements(await repo.getMeasurements(profilId))
    },
    [profilId],
  )

  const exportAll = useCallback(() => {
    if (!profilId) throw new Error('Aucun profil actif')
    return repo.exportAll(profilId)
  }, [profilId])

  const importAll = useCallback(
    async (b: ExportBundle) => {
      if (!profilId) return
      await repo.importAll(profilId, b)
      await loadProfileData(profilId)
    },
    [profilId, loadProfileData],
  )

  const exportReminderDue = useMemo(() => {
    const ref = lastExportAt ?? firstLaunchAt
    if (!ref) return false
    return daysBetween(ref, today) >= EXPORT_REMINDER_DAYS
  }, [lastExportAt, firstLaunchAt, today])

  // Alertes (moteur allure/VMA) — uniquement pour les profils pilotés à l'allure.
  // Le moteur d'alertes FC de Charline arrive en Phase C.
  const alerts = useMemo<Alert[]>(() => {
    if (loading || !profil || profil.pilotage !== 'allure') return []
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
    return computeAlerts({ measurements, logs, z2Samples, currentWeekKm, previousWeekKm, todayISO: today })
  }, [loading, profil, logs, measurements, weeks, today])

  const value: AppState = {
    loading,
    profilId,
    profil,
    profile,
    weeks,
    logs,
    measurements,
    vmaTests,
    alerts,
    today,
    switchProfile,
    saveProfile,
    applyVma,
    saveLog,
    deleteLog,
    saveMeasurement,
    deleteMeasurement,
    exportAll,
    importAll,
    markExported,
    exportReminderDue,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider')
  return ctx
}

export { parseISODate }
