import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LoggedSession, Measurement, MesureMatinale, ProfilId, SeanceRealisee, VmaTest } from '../types'

export const DB_NAME = 'programme-10k'
// v2 : cloisonnement par profil. v3 : suivi qualitatif FC (séances réalisées, mesures matinales).
export const DB_VERSION = 3

// Valeurs stockées : les données applicatives + le profil auquel elles appartiennent.
export type StoredLog = LoggedSession & { profileId: ProfilId }
export type StoredMeasurement = Measurement & { profileId: ProfilId }
export type StoredVmaTest = VmaTest & { profileId: ProfilId }
export type StoredSeanceFc = SeanceRealisee & { profileId: ProfilId }
export type StoredMesureMatinale = MesureMatinale & { profileId: ProfilId }

export interface AppDB extends DBSchema {
  // Clé-valeur. Clés namespacées par profil (`profile:<id>:*`) + globales
  // (`activeProfileId`, `schemaMigratedV2`).
  settings: { key: string; value: unknown }
  logs: {
    key: [ProfilId, string, string] // [profileId, sessionId, date]
    value: StoredLog
    indexes: { 'by-profile': ProfilId }
  }
  measurements: {
    key: [ProfilId, string] // [profileId, date]
    value: StoredMeasurement
    indexes: { 'by-profile': ProfilId }
  }
  vmaTests: {
    key: [ProfilId, string] // [profileId, date]
    value: StoredVmaTest
    indexes: { 'by-profile': ProfilId }
  }
  // v3 — suivi qualitatif du profil FC.
  seancesFc: {
    key: [ProfilId, string, string] // [profileId, seanceId, date]
    value: StoredSeanceFc
    indexes: { 'by-profile': ProfilId }
  }
  mesuresMatinales: {
    key: [ProfilId, string] // [profileId, date]
    value: StoredMesureMatinale
    indexes: { 'by-profile': ProfilId }
  }
}

// Clés du store settings.
export const ACTIVE_PROFILE_KEY = 'activeProfileId'
export const MIGRATED_V2_KEY = 'schemaMigratedV2'
export const scoped = (profileId: ProfilId, key: string) => `profile:${profileId}:${key}`
export const PROFILE_KEY = 'profile'
export const SEEDED_KEY = 'seeded'
export const FIRST_LAUNCH_KEY = 'firstLaunchAt'
export const LAST_EXPORT_KEY = 'lastExportAt'

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, tx) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }

        // --- Migration v1 → v2 : rattacher toute la donnée existante à « arnaud ». ---
        if (oldVersion === 1) {
          // Handles non typés : pendant la migration les anciens stores ont le schéma v1.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const legacyTx = tx as any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const legacyDb = db as any

          // 1. Lire l'ancienne donnée AVANT de recréer les stores.
          const legacyLogs: LoggedSession[] = await legacyTx.objectStore('logs').getAll()
          const legacyMeas: Measurement[] = await legacyTx.objectStore('measurements').getAll()
          const legacyTests: VmaTest[] = await legacyTx.objectStore('vmaTests').getAll()
          const settings = tx.objectStore('settings')
          const legacyProfile = await settings.get(PROFILE_KEY)
          const legacySeeded = await settings.get(SEEDED_KEY)
          const legacyFirst = await settings.get(FIRST_LAUNCH_KEY)
          const legacyLastExp = await settings.get(LAST_EXPORT_KEY)

          // 2. Supprimer les anciens stores (clés non namespacées) + le store weeks
          //    (le plan est désormais un module statique, plus une source de vérité en base).
          legacyDb.deleteObjectStore('logs')
          legacyDb.deleteObjectStore('measurements')
          legacyDb.deleteObjectStore('vmaTests')
          if (db.objectStoreNames.contains('weeks' as never)) {
            legacyDb.deleteObjectStore('weeks')
          }

          // 3. Recréer les stores avec clés composites incluant profileId.
          createDataStores(db)

          // 4. Réinsérer, taggé « arnaud ».
          for (const l of legacyLogs) await tx.objectStore('logs').put({ ...l, profileId: 'arnaud' })
          for (const m of legacyMeas)
            await tx.objectStore('measurements').put({ ...m, profileId: 'arnaud' })
          for (const t of legacyTests)
            await tx.objectStore('vmaTests').put({ ...t, profileId: 'arnaud' })

          // 5. Migrer les clés settings vers l'espace de nom d'arnaud, puis nettoyer.
          if (legacyProfile !== undefined) await settings.put(legacyProfile, scoped('arnaud', PROFILE_KEY))
          if (legacySeeded !== undefined) await settings.put(legacySeeded, scoped('arnaud', SEEDED_KEY))
          if (legacyFirst !== undefined) await settings.put(legacyFirst, scoped('arnaud', FIRST_LAUNCH_KEY))
          if (legacyLastExp !== undefined) await settings.put(legacyLastExp, scoped('arnaud', LAST_EXPORT_KEY))
          await settings.delete(PROFILE_KEY)
          await settings.delete(SEEDED_KEY)
          await settings.delete(FIRST_LAUNCH_KEY)
          await settings.delete(LAST_EXPORT_KEY)

          // 6. Profil actif = arnaud (l'utilisateur existant retrouve son plan directement).
          await settings.put('arnaud', ACTIVE_PROFILE_KEY)
          await settings.put(true, MIGRATED_V2_KEY)
        } else if (oldVersion === 0) {
          // Installation neuve : stores vides, pas de profil actif (le sélecteur choisit).
          createDataStores(db)
        }

        // --- v3 : stores du suivi qualitatif FC (additif, aucune migration). ---
        if (!db.objectStoreNames.contains('seancesFc')) {
          const s = db.createObjectStore('seancesFc', { keyPath: ['profileId', 'seanceId', 'date'] })
          s.createIndex('by-profile', 'profileId')
        }
        if (!db.objectStoreNames.contains('mesuresMatinales')) {
          const m = db.createObjectStore('mesuresMatinales', { keyPath: ['profileId', 'date'] })
          m.createIndex('by-profile', 'profileId')
        }
      },
    })
  }
  return dbPromise
}

function createDataStores(db: IDBPDatabase<AppDB>): void {
  const logs = db.createObjectStore('logs', { keyPath: ['profileId', 'sessionId', 'date'] })
  logs.createIndex('by-profile', 'profileId')
  const meas = db.createObjectStore('measurements', { keyPath: ['profileId', 'date'] })
  meas.createIndex('by-profile', 'profileId')
  const tests = db.createObjectStore('vmaTests', { keyPath: ['profileId', 'date'] })
  tests.createIndex('by-profile', 'profileId')
}
