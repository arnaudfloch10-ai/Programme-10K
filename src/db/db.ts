import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LoggedSession, Measurement, VmaTest, Week } from '../types'

export const DB_NAME = 'programme-10k'
export const DB_VERSION = 1

export interface AppDB extends DBSchema {
  // Réglages : profil courant, drapeaux (seed effectué…).
  settings: {
    key: string
    value: unknown
  }
  // Plan : une entrée par semaine (clé = numéro).
  weeks: {
    key: number
    value: Week
  }
  // Séances loggées : clé composite (sessionId + date).
  logs: {
    key: [string, string]
    value: LoggedSession
    indexes: { 'by-date': string }
  }
  measurements: {
    key: string // date
    value: Measurement
  }
  vmaTests: {
    key: string // date
    value: VmaTest
  }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
        if (!db.objectStoreNames.contains('weeks')) {
          db.createObjectStore('weeks', { keyPath: 'number' })
        }
        if (!db.objectStoreNames.contains('logs')) {
          const logs = db.createObjectStore('logs', { keyPath: ['sessionId', 'date'] })
          logs.createIndex('by-date', 'date')
        }
        if (!db.objectStoreNames.contains('measurements')) {
          db.createObjectStore('measurements', { keyPath: 'date' })
        }
        if (!db.objectStoreNames.contains('vmaTests')) {
          db.createObjectStore('vmaTests', { keyPath: 'date' })
        }
      },
    })
  }
  return dbPromise
}

export const PROFILE_KEY = 'profile'
export const SEEDED_KEY = 'seeded'
