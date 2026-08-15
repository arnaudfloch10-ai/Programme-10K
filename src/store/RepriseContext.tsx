import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ReprisePlan, VmaTest } from '../types'
import { REPRISE_PLAN } from '../data/plans/reprise'
import { useApp } from './AppContext'
import * as repo from '../db/repo'

const ACTIVE_WEEK_KEY = 'repriseActiveWeek'

interface RepriseState {
  plan: ReprisePlan
  activeWeek: number // numéro de semaine du bloc 1
  setActiveWeek: (n: number) => void
  vmaMeasured: boolean
  recordDemiCooper: (distanceM: number) => Promise<number> // renvoie la VMA calculée
}

const Ctx = createContext<RepriseState | null>(null)

export function RepriseProvider({ children }: { children: ReactNode }) {
  const { profilId, profile, saveProfile, applyVma, today } = useApp()
  const [activeWeek, setActiveWeekState] = useState(1)

  useEffect(() => {
    ;(async () => {
      if (!profilId) return
      const w = await repo.getScopedSetting<number>(profilId, ACTIVE_WEEK_KEY)
      if (typeof w === 'number') setActiveWeekState(w)
    })()
  }, [profilId])

  const setActiveWeek = useCallback(
    (n: number) => {
      setActiveWeekState(n)
      if (profilId) void repo.setScopedSetting(profilId, ACTIVE_WEEK_KEY, n)
    },
    [profilId],
  )

  // Test demi-Cooper : VMA = distance / 100. Enregistre VMA + date + test.
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

  const vmaMeasured = !!profile?.vma && profile.vma > 0 && !!profile.vmaMeasuredAt

  return (
    <Ctx.Provider value={{ plan: REPRISE_PLAN, activeWeek, setActiveWeek, vmaMeasured, recordDemiCooper }}>
      {children}
    </Ctx.Provider>
  )
}

export function useReprise(): RepriseState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useReprise doit être utilisé dans RepriseProvider')
  return ctx
}
