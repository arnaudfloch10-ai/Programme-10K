import { describe, it, expect } from 'vitest'
import {
  ZONES,
  ZONE_COLORS,
  speedFromVma,
  paceFromSpeed,
  paceFromVma,
  lapTime400,
  zonePace,
  zonePaceRange,
  zoneHrRange,
  pctForPosition,
  derivedPaces,
  formatPace,
  formatDuration,
  isTrainingZone,
} from './zones'

const VMA = 12.5
const FC = 196

describe('conversions fondamentales', () => {
  it('vitesse = VMA × pct', () => {
    expect(speedFromVma(VMA, 0.88)).toBeCloseTo(11.0, 6)
    expect(speedFromVma(VMA, 1.0)).toBe(12.5)
  })

  it('allure (s/km) = 3600 / vitesse', () => {
    expect(paceFromSpeed(12)).toBe(300) // 12 km/h → 5:00
    expect(paceFromSpeed(0)).toBe(Infinity)
  })

  it('paceFromVma compose vitesse puis allure', () => {
    // 88 % VMA = 11 km/h → 327,27 s/km
    expect(paceFromVma(VMA, 0.88)).toBeCloseTo(327.27, 1)
  })

  it('temps au tour de 400 m = allure / 2,5', () => {
    expect(lapTime400(400)).toBe(160)
    // Z2 milieu ≈ 389 s/km → ~155,6 s au tour
    expect(lapTime400(zonePace(VMA, 'Z2'))).toBeCloseTo(155.7, 0)
  })
})

describe('positions dans la zone', () => {
  it('bas / milieu / haut mappent sur les bornes de % VMA', () => {
    expect(pctForPosition('Z2', 'bas')).toBe(0.7)
    expect(pctForPosition('Z2', 'haut')).toBe(0.78)
    expect(pctForPosition('Z2', 'milieu')).toBeCloseTo(0.74, 6)
  })

  it('milieu est la valeur par défaut', () => {
    expect(zonePace(VMA, 'Z4')).toBe(zonePace(VMA, 'Z4', 'milieu'))
  })

  it('borne haute de zone = allure plus rapide (moins de s/km)', () => {
    const { fastS, slowS } = zonePaceRange(VMA, 'Z3')
    expect(fastS).toBeLessThan(slowS)
  })
})

describe('allures repères', () => {
  it('Z2 milieu ≈ 6:29', () => {
    expect(formatPace(zonePace(VMA, 'Z2'))).toBe('6:29')
  })

  it('allure 10 km (88 %) ≈ 5:27', () => {
    expect(formatPace(derivedPaces(VMA).p10kS)).toBe('5:27')
  })

  it('allure 5 km (93 %) ≈ 5:10', () => {
    expect(formatPace(derivedPaces(VMA).p5kS)).toBe('5:10')
  })

  it('allure marathon (82 %) ≈ 5:51', () => {
    expect(formatPace(derivedPaces(VMA).marathonS)).toBe('5:51')
  })
})

describe('FC par zone', () => {
  it('Z4 = 87–92 % FC max → 171–180 bpm', () => {
    expect(zoneHrRange(FC, 'Z4')).toEqual({ minBpm: 171, maxBpm: 180 })
  })

  it('Z1 a un plafond mais pas de plancher', () => {
    expect(zoneHrRange(FC, 'Z1')).toEqual({ minBpm: null, maxBpm: 137 })
  })

  it('Z5 a un plancher mais pas de plafond', () => {
    expect(zoneHrRange(FC, 'Z5')).toEqual({ minBpm: 180, maxBpm: null })
  })
})

describe('formatage', () => {
  it('formate m:ss avec padding', () => {
    expect(formatPace(390)).toBe('6:30')
    expect(formatPace(305)).toBe('5:05')
  })

  it('garde-fou d\'arrondi (59,6 → 60 → incrément minute)', () => {
    expect(formatPace(359.6)).toBe('6:00')
  })

  it('valeurs invalides → tiret', () => {
    expect(formatPace(0)).toBe('—')
    expect(formatPace(Infinity)).toBe('—')
    expect(formatPace(-5)).toBe('—')
  })

  it('formatDuration bascule en h:mm:ss au-delà d\'une heure', () => {
    expect(formatDuration(155.7)).toBe('2:36')
    expect(formatDuration(3661)).toBe('1:01:01')
  })
})

describe('intégrité des définitions', () => {
  it('les bornes de zones sont contiguës et croissantes', () => {
    const order = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'] as const
    for (let i = 1; i < order.length; i++) {
      expect(ZONES[order[i]].vmaMin).toBe(ZONES[order[i - 1]].vmaMax)
    }
  })

  it('chaque zone a une couleur définie', () => {
    for (const z of ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'FORCE', 'REST'] as const) {
      expect(ZONE_COLORS[z]).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('isTrainingZone distingue les zones calculables', () => {
    expect(isTrainingZone('Z3')).toBe(true)
    expect(isTrainingZone('FORCE')).toBe(false)
    expect(isTrainingZone('REST')).toBe(false)
  })
})
