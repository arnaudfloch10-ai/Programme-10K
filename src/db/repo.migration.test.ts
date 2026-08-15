import 'fake-indexeddb/auto'
import { describe, it, expect, beforeAll } from 'vitest'
import { openDB } from 'idb'
import { DB_NAME } from './db'
import * as repo from './repo'

// Reconstitue une base v1 (mono-profil) telle qu'elle existait avant le multi-profil,
// puis vérifie que l'ouverture v2 migre tout vers le profil « arnaud » sans perte.
beforeAll(async () => {
  // --- Base v1 (schéma d'origine) ---
  const v1 = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore('settings')
      db.createObjectStore('weeks', { keyPath: 'number' })
      const logs = db.createObjectStore('logs', { keyPath: ['sessionId', 'date'] })
      logs.createIndex('by-date', 'date')
      db.createObjectStore('measurements', { keyPath: 'date' })
      db.createObjectStore('vmaTests', { keyPath: 'date' })
    },
  })
  await v1.put('settings', { ageYears: 39, fcMax: 196, vma: 12.5 }, 'profile')
  await v1.put('settings', true, 'seeded')
  await v1.put('settings', '2026-08-01', 'firstLaunchAt')
  await v1.put('weeks', { number: 1, sessions: [] } as never)
  await v1.put('logs', { sessionId: 'b0-s1-mar', date: '2026-08-04', done: true, vmaAtDate: 12.5, feel: 4, fatigue: 2 } as never)
  await v1.put('measurements', { date: '2026-08-05', weightKg: 77, restingHr: 48 } as never)
  await v1.put('vmaTests', { date: '2026-09-08', type: 'demi-cooper', distanceM: 1300, computedVma: 13 } as never)
  v1.close()
})

describe('migration v1 → v2', () => {
  it('rattache toute la donnée existante au profil arnaud', async () => {
    // getDB() (v2) déclenche la migration à la première ouverture.
    const active = await repo.getActiveProfileId()
    expect(active).toBe('arnaud')

    const profile = await repo.getProfile('arnaud')
    expect(profile.vma).toBe(12.5)
    expect(profile.fcMax).toBe(196)

    const logs = await repo.getLogs('arnaud')
    expect(logs).toHaveLength(1)
    expect(logs[0].sessionId).toBe('b0-s1-mar')
    expect(logs[0].feel).toBe(4)

    const meas = await repo.getMeasurements('arnaud')
    expect(meas).toHaveLength(1)
    expect(meas[0].restingHr).toBe(48)

    const tests = await repo.getVmaTests('arnaud')
    expect(tests).toHaveLength(1)
    expect(tests[0].computedVma).toBe(13)
  })

  it('ne fait fuiter aucune donnée vers le profil charline', async () => {
    expect(await repo.getLogs('charline')).toHaveLength(0)
    expect(await repo.getMeasurements('charline')).toHaveLength(0)
    expect(await repo.getVmaTests('charline')).toHaveLength(0)
  })

  it('cloisonne les écritures : un log charline reste invisible chez arnaud', async () => {
    await repo.saveLog('charline', {
      sessionId: 'c-s1',
      date: '2026-08-10',
      done: true,
      vmaAtDate: 0,
      feel: 3,
      fatigue: 3,
    })
    const charlineLogs = await repo.getLogs('charline')
    const arnaudLogs = await repo.getLogs('arnaud')
    expect(charlineLogs).toHaveLength(1)
    expect(arnaudLogs.find((l) => l.sessionId === 'c-s1')).toBeUndefined()
    expect(arnaudLogs).toHaveLength(1) // inchangé
  })
})
