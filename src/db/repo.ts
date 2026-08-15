import type {
  LoggedSession,
  Measurement,
  MesureMatinale,
  Profile,
  ProfilId,
  SeanceRealisee,
  VmaTest,
} from '../types'
import {
  getDB,
  scoped,
  ACTIVE_PROFILE_KEY,
  PROFILE_KEY,
  SEEDED_KEY,
  FIRST_LAUNCH_KEY,
  LAST_EXPORT_KEY,
  type StoredLog,
  type StoredMeasurement,
  type StoredVmaTest,
  type StoredSeanceFc,
  type StoredMesureMatinale,
} from './db'
import { defaultProfileFor } from '../data/profile'
import { isProfilId } from '../data/profils'

// --- Profil actif (global) ---

export async function getActiveProfileId(): Promise<ProfilId | null> {
  const db = await getDB()
  const v = await db.get('settings', ACTIVE_PROFILE_KEY)
  return isProfilId(v) ? v : null
}

export async function setActiveProfileId(id: ProfilId): Promise<void> {
  const db = await getDB()
  await db.put('settings', id, ACTIVE_PROFILE_KEY)
}

// --- Réglages génériques scopés (ex. semaine active de Charline) ---

export async function getScopedSetting<T = unknown>(
  profileId: ProfilId,
  key: string,
): Promise<T | undefined> {
  const db = await getDB()
  return (await db.get('settings', scoped(profileId, key))) as T | undefined
}

export async function setScopedSetting(profileId: ProfilId, key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('settings', value, scoped(profileId, key))
}

// --- Réglages / profil (namespacés par profil) ---

export async function getProfile(profileId: ProfilId): Promise<Profile> {
  const db = await getDB()
  const p = (await db.get('settings', scoped(profileId, PROFILE_KEY))) as Profile | undefined
  return p ?? defaultProfileFor(profileId)
}

export async function saveProfile(profileId: ProfilId, p: Profile): Promise<void> {
  const db = await getDB()
  await db.put('settings', p, scoped(profileId, PROFILE_KEY))
}

/** Recalibrage VMA sans toucher au reste. */
export async function setVma(profileId: ProfilId, vma: number): Promise<Profile> {
  const p = await getProfile(profileId)
  const next = { ...p, vma }
  await saveProfile(profileId, next)
  return next
}

/** Initialise un profil au premier accès : écrit ses réglages par défaut. Idempotent. */
export async function ensureProfileInitialized(profileId: ProfilId): Promise<void> {
  const db = await getDB()
  const seeded = await db.get('settings', scoped(profileId, SEEDED_KEY))
  if (seeded) return
  const existing = await db.get('settings', scoped(profileId, PROFILE_KEY))
  if (!existing) await db.put('settings', defaultProfileFor(profileId), scoped(profileId, PROFILE_KEY))
  await db.put('settings', true, scoped(profileId, SEEDED_KEY))
}

// --- Métadonnées de sauvegarde (par profil) ---

export async function getExportMeta(
  profileId: ProfilId,
): Promise<{ firstLaunchAt?: string; lastExportAt?: string }> {
  const db = await getDB()
  const [firstLaunchAt, lastExportAt] = await Promise.all([
    db.get('settings', scoped(profileId, FIRST_LAUNCH_KEY)) as Promise<string | undefined>,
    db.get('settings', scoped(profileId, LAST_EXPORT_KEY)) as Promise<string | undefined>,
  ])
  return { firstLaunchAt, lastExportAt }
}

export async function ensureFirstLaunch(profileId: ProfilId, todayISO: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('settings', scoped(profileId, FIRST_LAUNCH_KEY))
  if (!existing) await db.put('settings', todayISO, scoped(profileId, FIRST_LAUNCH_KEY))
}

export async function setLastExport(profileId: ProfilId, todayISO: string): Promise<void> {
  const db = await getDB()
  await db.put('settings', todayISO, scoped(profileId, LAST_EXPORT_KEY))
}

// --- Séances réalisées (scopées via l'index by-profile) ---

export async function getLogs(profileId: ProfilId): Promise<LoggedSession[]> {
  const db = await getDB()
  const logs = await db.getAllFromIndex('logs', 'by-profile', profileId)
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveLog(profileId: ProfilId, log: LoggedSession): Promise<void> {
  const db = await getDB()
  await db.put('logs', { ...log, profileId } as StoredLog)
}

export async function deleteLog(profileId: ProfilId, sessionId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.delete('logs', [profileId, sessionId, date])
}

// --- Mesures ---

export async function getMeasurements(profileId: ProfilId): Promise<Measurement[]> {
  const db = await getDB()
  const m = await db.getAllFromIndex('measurements', 'by-profile', profileId)
  return m.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveMeasurement(profileId: ProfilId, m: Measurement): Promise<void> {
  const db = await getDB()
  await db.put('measurements', { ...m, profileId } as StoredMeasurement)
}

export async function deleteMeasurement(profileId: ProfilId, date: string): Promise<void> {
  const db = await getDB()
  await db.delete('measurements', [profileId, date])
}

// --- Tests VMA ---

export async function getVmaTests(profileId: ProfilId): Promise<VmaTest[]> {
  const db = await getDB()
  const t = await db.getAllFromIndex('vmaTests', 'by-profile', profileId)
  return t.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveVmaTest(profileId: ProfilId, t: VmaTest): Promise<void> {
  const db = await getDB()
  await db.put('vmaTests', { ...t, profileId } as StoredVmaTest)
}

// --- Suivi qualitatif FC : séances réalisées ---

export async function getSeancesFc(profileId: ProfilId): Promise<SeanceRealisee[]> {
  const db = await getDB()
  const s = await db.getAllFromIndex('seancesFc', 'by-profile', profileId)
  return s.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveSeanceFc(profileId: ProfilId, s: SeanceRealisee): Promise<void> {
  const db = await getDB()
  await db.put('seancesFc', { ...s, profileId } as StoredSeanceFc)
}

export async function deleteSeanceFc(profileId: ProfilId, seanceId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.delete('seancesFc', [profileId, seanceId, date])
}

// --- Suivi qualitatif FC : mesures matinales ---

export async function getMesuresMatinales(profileId: ProfilId): Promise<MesureMatinale[]> {
  const db = await getDB()
  const m = await db.getAllFromIndex('mesuresMatinales', 'by-profile', profileId)
  return m.sort((a, b) => a.date.localeCompare(b.date))
}

export async function saveMesureMatinale(profileId: ProfilId, m: MesureMatinale): Promise<void> {
  const db = await getDB()
  await db.put('mesuresMatinales', { ...m, profileId } as StoredMesureMatinale)
}

// --- Export / import (scopé au profil) ---

export interface ExportBundle {
  version: number
  exportedAt: string
  profileId: ProfilId
  profile: Profile
  logs: LoggedSession[]
  measurements: Measurement[]
  vmaTests: VmaTest[]
}

export async function exportAll(profileId: ProfilId): Promise<ExportBundle> {
  const [profile, logs, measurements, vmaTests] = await Promise.all([
    getProfile(profileId),
    getLogs(profileId),
    getMeasurements(profileId),
    getVmaTests(profileId),
  ])
  return { version: 2, exportedAt: new Date().toISOString(), profileId, profile, logs, measurements, vmaTests }
}

export async function importAll(profileId: ProfilId, bundle: ExportBundle): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['settings', 'logs', 'measurements', 'vmaTests'], 'readwrite')
  // Remplace uniquement les données DU profil courant (les autres profils sont intacts).
  const wipe = async (store: 'logs' | 'measurements' | 'vmaTests') => {
    const idx = tx.objectStore(store).index('by-profile')
    let cursor = await idx.openCursor(profileId)
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
  }
  await wipe('logs')
  await wipe('measurements')
  await wipe('vmaTests')

  await tx.objectStore('settings').put(bundle.profile, scoped(profileId, PROFILE_KEY))
  for (const l of bundle.logs) await tx.objectStore('logs').put({ ...l, profileId } as StoredLog)
  for (const m of bundle.measurements)
    await tx.objectStore('measurements').put({ ...m, profileId } as StoredMeasurement)
  for (const t of bundle.vmaTests)
    await tx.objectStore('vmaTests').put({ ...t, profileId } as StoredVmaTest)
  await tx.objectStore('settings').put(true, scoped(profileId, SEEDED_KEY))
  await tx.done
}
