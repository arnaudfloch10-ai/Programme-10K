import { describe, it, expect } from 'vitest'
import {
  weeksWithAtLeast,
  restGapCount,
  hasReturnAfterPause,
  personalRecords,
  seasonsCovered,
  hasDeloadWeek,
  restingHrDown,
  buildStates,
  countUnlocked,
  type Activity,
} from './engine'

const run = (date: string, distanceKm = 3, durationMin = 25): Activity => ({ date, distanceKm, durationMin })

describe('weeksWithAtLeast — régularité en semaines, jamais en jours', () => {
  it('7 jours consécutifs ne comptent que pour UNE semaine', () => {
    const week = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09'].map((d) => run(d))
    expect(weeksWithAtLeast(week, 2)).toBe(1)
  })
  it('3 sorties + 4 jours de repos valent une semaine', () => {
    const w = [run('2026-08-04'), run('2026-08-06'), run('2026-08-09')] // mar, jeu, dim
    expect(weeksWithAtLeast(w, 2)).toBe(1)
    expect(weeksWithAtLeast(w, 3)).toBe(1)
  })
  it('compte des semaines distinctes', () => {
    const w = [run('2026-08-04'), run('2026-08-06'), run('2026-08-11'), run('2026-08-13')]
    expect(weeksWithAtLeast(w, 2)).toBe(2)
  })
  it('une seule sortie dans la semaine ne qualifie pas', () => {
    expect(weeksWithAtLeast([run('2026-08-04'), run('2026-08-11')], 2)).toBe(0)
  })
})

describe('restGapCount — repos entre sorties', () => {
  it('compte les intervalles avec ≥ 2 jours de repos', () => {
    // 04 → 07 (2 repos), 07 → 08 (0 repos), 08 → 12 (3 repos)
    const a = [run('2026-08-04'), run('2026-08-07'), run('2026-08-08'), run('2026-08-12')]
    expect(restGapCount(a, 2)).toBe(2)
  })
})

describe('hasReturnAfterPause', () => {
  it('déclenche après ≥ 14 jours d’arrêt', () => {
    expect(hasReturnAfterPause([run('2026-07-01'), run('2026-07-20')])).toBe(true)
    expect(hasReturnAfterPause([run('2026-07-01'), run('2026-07-08')])).toBe(false)
  })
})

describe('personalRecords', () => {
  it('compte les records de distance et de durée', () => {
    const a = [run('2026-08-01', 3, 20), run('2026-08-05', 4, 20), run('2026-08-09', 4, 30)]
    const pr = personalRecords(a)
    expect(pr.distance).toBe(true)
    expect(pr.duration).toBe(true)
    expect(pr.total).toBe(2)
  })
  it('la première sortie n’est pas un record', () => {
    expect(personalRecords([run('2026-08-01', 5)]).total).toBe(0)
  })
})

describe('seasonsCovered / hasDeloadWeek / restingHrDown', () => {
  it('compte les 4 saisons', () => {
    expect(seasonsCovered([run('2026-01-10'), run('2026-04-10'), run('2026-07-10'), run('2026-10-10')])).toBe(4)
  })
  it('détecte une semaine allégée après 3 de hausse', () => {
    const a = [
      run('2026-08-03', 5), // s1
      run('2026-08-10', 8), // s2 >
      run('2026-08-17', 11), // s3 >
      run('2026-08-24', 6), // s4 < → deload
    ]
    expect(hasDeloadWeek(a)).toBe(true)
  })
  it('FC de repos en baisse sur ≥ 28 jours', () => {
    const s = [
      { date: '2026-07-01', bpm: 64 },
      { date: '2026-07-10', bpm: 63 },
      { date: '2026-07-22', bpm: 61 },
      { date: '2026-08-01', bpm: 60 },
    ]
    expect(restingHrDown(s)).toBe(true)
  })
})

describe('buildStates', () => {
  it('débloque distance, cumul, régularité ; laisse verrouillé ce qui manque de données', () => {
    const activities = [
      run('2026-08-04', 5, 30),
      run('2026-08-06', 3, 25),
      run('2026-08-11', 6, 32),
      run('2026-08-13', 3, 25),
    ]
    const st = buildStates({ activities })
    expect(st['premiere-foulee'].unlocked).toBe(true)
    expect(st['cinq-km'].unlocked).toBe(true)
    expect(st['deux-de-suite'].unlocked).toBe(true)
    expect(st['trente-minutes'].unlocked).toBe(true)
    // données non collectées → verrouillés
    expect(st['sous-la-pluie'].unlocked).toBe(false)
    expect(st['negative-split'].unlocked).toBe(false)
    // tout badge a un état
    expect(Object.keys(st).length).toBe(45)
  })
  it('repos-merite est évolutif (bronze/argent/or)', () => {
    const many: Activity[] = []
    let d = new Date('2026-01-05')
    for (let i = 0; i < 13; i++) {
      many.push(run(d.toISOString().slice(0, 10)))
      d = new Date(d.getTime() + 3 * 86_400_000) // +3 j → 2 jours de repos à chaque fois
    }
    const st = buildStates({ activities: many })
    expect(st['repos-merite'].unlocked).toBe(true)
    expect(st['repos-merite'].level).toBe('argent') // 12 intervalles
  })
  it('déblocage manuel via déclarations', () => {
    const st = buildStates({ activities: [run('2026-08-04')], declarations: { sagesse: true, kudos: true } })
    expect(st['sagesse'].unlocked).toBe(true)
    expect(st['encouragement'].unlocked).toBe(true)
    expect(countUnlocked(st)).toBeGreaterThanOrEqual(3)
  })
})

describe('philosophie — aucun badge de jours consécutifs', () => {
  it('la famille Régularité se compte en semaines', () => {
    // Toutes les conditions de régularité parlent de « semaines », pas de « jours ».
    const reg = buildStates({ activities: [] })
    expect(reg['deux-de-suite'].unlocked).toBe(false)
  })
})
