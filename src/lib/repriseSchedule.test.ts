import { describe, it, expect } from 'vitest'
import { jourIndexFromISO, seanceForDay, nextSeanceFrom, nextSeanceSummary } from './repriseSchedule'
import type { RepriseSeance } from '../types'

const mk = (id: string, jour: string, extra: Partial<RepriseSeance> = {}): RepriseSeance => ({
  id,
  jourSuggere: jour,
  type: 'EF',
  contenu: '30 min continu',
  dureeMin: 30,
  fcCible: { min: 140, max: 152 },
  allureCible: '8:30-9:00',
  note: null,
  ...extra,
})

const week = [mk('s1-1', 'mardi'), mk('s1-2', 'jeudi'), mk('s1-3', 'dimanche', { dureeMin: 35, fcCible: { min: 140, max: 155 } })]

describe('jourIndexFromISO', () => {
  it('mappe la date sur 1..7 (lundi..dimanche)', () => {
    expect(jourIndexFromISO('2026-08-15')).toBe(6) // samedi
    expect(jourIndexFromISO('2026-08-16')).toBe(7) // dimanche
    expect(jourIndexFromISO('2026-08-17')).toBe(1) // lundi
  })
})

describe('seanceForDay', () => {
  it('trouve la séance du jour', () => {
    expect(seanceForDay(week, 2)?.id).toBe('s1-1') // mardi
    expect(seanceForDay(week, 4)?.id).toBe('s1-2') // jeudi
  })
  it('undefined un jour de repos', () => {
    expect(seanceForDay(week, 6)).toBeUndefined() // samedi
  })
})

describe('nextSeanceFrom', () => {
  it('donne la séance suivante dans la semaine', () => {
    expect(nextSeanceFrom(week, 6)?.id).toBe('s1-3') // après samedi → dimanche
    expect(nextSeanceFrom(week, 1)?.id).toBe('s1-1') // après lundi → mardi
    expect(nextSeanceFrom(week, 2)?.id).toBe('s1-2') // après mardi → jeudi
  })
  it('reboucle sur la première si plus rien cette semaine', () => {
    expect(nextSeanceFrom(week, 7)?.id).toBe('s1-1') // après dimanche → mardi (semaine suivante)
  })
})

describe('nextSeanceSummary', () => {
  it('format compact avec FC', () => {
    expect(nextSeanceSummary(week[1])).toBe('jeudi · 30 min EF · 140–152 bpm')
  })
  it('séance test sans FC', () => {
    expect(nextSeanceSummary(mk('s4-3', 'dimanche', { type: 'TEST', fcCible: null, test: true, dureeMin: 36 }))).toBe(
      'dimanche · 36 min TEST · test demi-Cooper',
    )
  })
})
