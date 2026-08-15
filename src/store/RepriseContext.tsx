import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MesureMatinale, ReprisePlan, SeanceRealisee, VmaTest } from '../types'
import { REPRISE_PLAN } from '../data/plans/reprise'
import { useApp } from './AppContext'
import * as repo from '../db/repo'
import { computeFcAlerts, type SeanceSample } from '../lib/fcAlerts'
import type { Alert } from '../lib/alerts'
import { parseISODate, toISODate } from '../lib/format'

const ACTIVE_WEEK_KEY = 'repriseActiveWeek'
const RENFO_KEY_PREFIX = 'renfo:' // renfo:<weekKey> → string[] d'ids faits

// Clé de semaine calendaire (lundi) pour le bucket de volume et le reset renfo.
function weekKey(dateISO: string): string {
  const d = parseISODate(dateISO)
  const day = (d.getDay() + 6) % 7 // 0 = lundi
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

// Map seanceId → type (depuis le plan), pour enrichir les alertes.
const SEANCE_TYPE: Record<string, string> = {}
for (const b of REPRISE_PLAN.blocs) for (const w of b.semaines) for (const s of w.seances) SEANCE_TYPE[s.id] = s.type

interface RepriseState {
  plan: ReprisePlan
  activeWeek: number
  setActiveWeek: (n: number) => void
  vmaMeasured: boolean
  recordDemiCooper: (distanceM: number) => Promise<number>
  // suivi qualitatif
  seances: SeanceRealisee[]
  mesures: MesureMatinale[]
  alerts: Alert[]
  saveSeance: (s: SeanceRealisee) => Promise<void>
  deleteSeance: (seanceId: string, date: string) => Promise<void>
  saveMesure: (m: MesureMatinale) => Promise<void>
  renfoDone: string[]
  toggleRenfo: (exerciceId: string) => Promise<void>
  // regroupement par semaine calendaire (lundi) pour le bilan
  curWeekKey: string
  weekKeyOf: (dateISO: string) => string
}

const Ctx = createContext<RepriseState | null>(null)

export function RepriseProvider({ children }: { children: ReactNode }) {
  const { profilId, profile, saveProfile, applyVma, today } = useApp()
  const [activeWeek, setActiveWeekState] = useState(1)
  const [seances, setSeances] = useState<SeanceRealisee[]>([])
  const [mesures, setMesures] = useState<MesureMatinale[]>([])
  const [renfoDone, setRenfoDone] = useState<string[]>([])

  const curWeekKey = weekKey(today)

  useEffect(() => {
    ;(async () => {
      if (!profilId) return
      const w = await repo.getScopedSetting<number>(profilId, ACTIVE_WEEK_KEY)
      if (typeof w === 'number') setActiveWeekState(w)
      setSeances(await repo.getSeancesFc(profilId))
      setMesures(await repo.getMesuresMatinales(profilId))
      const done = await repo.getScopedSetting<string[]>(profilId, RENFO_KEY_PREFIX + curWeekKey)
      setRenfoDone(Array.isArray(done) ? done : [])
    })()
  }, [profilId, curWeekKey])

  const setActiveWeek = useCallback(
    (n: number) => {
      setActiveWeekState(n)
      if (profilId) void repo.setScopedSetting(profilId, ACTIVE_WEEK_KEY, n)
    },
    [profilId],
  )

  const recordDemiCooper = useCallback(
    async (distanceM: number) => {
      const vma = Math.round((distanceM / 100) * 10) / 10
      await saveProfile({ ...profile, vma, vmaMeasuredAt: today })
      const test: VmaTest = { date: today, type: 'demi-cooper', distanceM, computedVma: vma }
      await applyVma(vma, test)
      return vma
    },
    [profile, saveProfile, applyVma, today],
  )

  const saveSeance = useCallback(
    async (s: SeanceRealisee) => {
      if (!profilId) return
      await repo.saveSeanceFc(profilId, s)
      setSeances(await repo.getSeancesFc(profilId))
    },
    [profilId],
  )

  const deleteSeance = useCallback(
    async (seanceId: string, date: string) => {
      if (!profilId) return
      await repo.deleteSeanceFc(profilId, seanceId, date)
      setSeances(await repo.getSeancesFc(profilId))
    },
    [profilId],
  )

  const saveMesure = useCallback(
    async (m: MesureMatinale) => {
      if (!profilId) return
      await repo.saveMesureMatinale(profilId, m)
      setMesures(await repo.getMesuresMatinales(profilId))
    },
    [profilId],
  )

  const toggleRenfo = useCallback(
    async (exerciceId: string) => {
      if (!profilId) return
      setRenfoDone((prev) => {
        const next = prev.includes(exerciceId) ? prev.filter((x) => x !== exerciceId) : [...prev, exerciceId]
        void repo.setScopedSetting(profilId, RENFO_KEY_PREFIX + curWeekKey, next)
        return next
      })
    },
    [profilId, curWeekKey],
  )

  // Volume hebdo (minutes) par semaine calendaire, pour la règle d'alerte volume.
  const alerts = useMemo<Alert[]>(() => {
    const samples: SeanceSample[] = seances.map((s) => ({
      date: s.date,
      type: SEANCE_TYPE[s.seanceId] ?? 'EF',
      fcMoy: s.fcMoy,
      fcMax: s.fcMax,
      cadence: s.cadence,
      ressenti: s.ressenti,
    }))
    const prevWeekKey = weekKey(toISODate(new Date(parseISODate(today).getTime() - 7 * 86_400_000)))
    const volInWeek = (wk: string) =>
      seances.filter((s) => weekKey(s.date) === wk).reduce((sum, s) => sum + (s.dureeMin ?? 0), 0)
    return computeFcAlerts({
      seances: samples,
      mesures,
      currentWeekMin: volInWeek(curWeekKey),
      previousWeekMin: volInWeek(prevWeekKey),
    })
  }, [seances, mesures, today, curWeekKey])

  const vmaMeasured = !!profile?.vma && profile.vma > 0 && !!profile.vmaMeasuredAt

  return (
    <Ctx.Provider
      value={{
        plan: REPRISE_PLAN,
        activeWeek,
        setActiveWeek,
        vmaMeasured,
        recordDemiCooper,
        seances,
        mesures,
        alerts,
        saveSeance,
        deleteSeance,
        saveMesure,
        renfoDone,
        toggleRenfo,
        curWeekKey,
        weekKeyOf: weekKey,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useReprise(): RepriseState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useReprise doit être utilisé dans RepriseProvider')
  return ctx
}
