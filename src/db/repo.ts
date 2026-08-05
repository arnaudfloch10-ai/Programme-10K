import type { LoggedSession, Measurement, Profile, VmaTest, Week } from '../types'
import { getDB, PROFILE_KEY, SEEDED_KEY } from './db'
import { BLOC0_WEEKS } from '../data/seedBloc0'
import { DEFAULT_PROFILE } from '../data/profile'

// --- Réglages / profil ---

export async function getProfile(): Promise<Profile> {
  const db = await getDB()
  const p = (await db.get('settings', PROFILE_KEY)) as Profile | undefined
  return p ?? DEFAULT_PROFILE
}

export async function saveProfile(p: Profile): Promise<void> {
  const db = await getDB()
  await db.put('settings', p, PROFILE_KEY)
}

/** Met à jour uniquement la VMA (recalibrage) sans toucher au reste. */
export async function setVma(vma: number): Promise<Profile> {
  const p = await getProfile()
  const next = { ...p, vma }
  await saveProfile(next)
  return next
}

// --- Plan / semaines ---

export async function getWeeks(): Promise<Week[]> {
  const db = await getDB()
  const weeks = await db.getAll('weeks')
  return weeks.sort((a, b) => a.number - b.number)
}

export async function saveWeek(week: Week): Promise<void> {
  const db = await getDB()
  await db.put('weeks', week)
}

// --- Logs ---

export async function getLogs(): Promise<LoggedSession[]> {
  const db = await getDB()
  const logs = await db.getAll('logs')
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveLog(log: LoggedSession): Promise<void> {
  const db = await getDB()
  await db.put('logs', log)
}

export async function deleteLog(sessionId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.delete('logs', [sessionId, date])
}

// --- Mesures ---

export async function getMeasurements(): Promise<Measurement[]> {
  const db = await getDB()
  const m = await db.getAll('measurements')
  return m.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveMeasurement(m: Measurement): Promise<void> {
  const db = await getDB()
  await db.put('measurements', m)
}

export async function deleteMeasurement(date: string): Promise<void> {
  const db = await getDB()
  await db.delete('measurements', date)
}

// --- Tests VMA ---

export async function getVmaTests(): Promise<VmaTest[]> {
  const db = await getDB()
  const t = await db.getAll('vmaTests')
  return t.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveVmaTest(t: VmaTest): Promise<void> {
  const db = await getDB()
  await db.put('vmaTests', t)
}

// --- Seed (premier lancement, idempotent) ---

export async function ensureSeeded(): Promise<void> {
  const db = await getDB()
  const seeded = await db.get('settings', SEEDED_KEY)
  if (seeded) return

  const tx = db.transaction(['weeks', 'settings'], 'readwrite')
  for (const week of BLOC0_WEEKS) {
    await tx.objectStore('weeks').put(week)
  }
  const settings = tx.objectStore('settings')
  const existingProfile = await settings.get(PROFILE_KEY)
  if (!existingProfile) {
    await settings.put(DEFAULT_PROFILE, PROFILE_KEY)
  }
  await settings.put(true, SEEDED_KEY)
  await tx.done
}

// --- Export / import complet ---

export interface ExportBundle {
  version: number
  exportedAt: string
  profile: Profile
  weeks: Week[]
  logs: LoggedSession[]
  measurements: Measurement[]
  vmaTests: VmaTest[]
}

export async function exportAll(): Promise<ExportBundle> {
  const [profile, weeks, logs, measurements, vmaTests] = await Promise.all([
    getProfile(),
    getWeeks(),
    getLogs(),
    getMeasurements(),
    getVmaTests(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    weeks,
    logs,
    measurements,
    vmaTests,
  }
}

export async function importAll(bundle: ExportBundle): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['settings', 'weeks', 'logs', 'measurements', 'vmaTests'], 'readwrite')
  // Remplace intégralement les données existantes.
  await tx.objectStore('weeks').clear()
  await tx.objectStore('logs').clear()
  await tx.objectStore('measurements').clear()
  await tx.objectStore('vmaTests').clear()

  await tx.objectStore('settings').put(bundle.profile, PROFILE_KEY)
  for (const w of bundle.weeks) await tx.objectStore('weeks').put(w)
  for (const l of bundle.logs) await tx.objectStore('logs').put(l)
  for (const m of bundle.measurements) await tx.objectStore('measurements').put(m)
  for (const t of bundle.vmaTests) await tx.objectStore('vmaTests').put(t)
  await tx.objectStore('settings').put(true, SEEDED_KEY)
  await tx.done
}
