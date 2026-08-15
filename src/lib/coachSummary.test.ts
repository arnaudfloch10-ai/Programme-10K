import { describe, it, expect } from 'vitest'
import { seanceLabel, seanceLine, moyenneFcRepos, generateCoachSummary } from './coachSummary'
import type { SeanceRealisee } from '../types'

const base: SeanceRealisee = {
  seanceId: 's1-1',
  date: '2026-08-10',
  dureeMin: 30,
  distanceKm: 3.5,
  fcMoy: 147,
  fcMax: 163,
  cadence: 157,
  ressenti: 4,
  sensationJambes: 'normales',
}

describe('seanceLabel', () => {
  it('extrait l\'index de la séance', () => {
    expect(seanceLabel('s1-1')).toBe('S1')
    expect(seanceLabel('s3-2')).toBe('S2')
  })
  it('retombe sur l\'identifiant si pas d\'index', () => {
    expect(seanceLabel('libre')).toBe('libre')
  })
})

describe('seanceLine', () => {
  it('respecte le format coach', () => {
    expect(seanceLine(base)).toBe('S1 · 30 min · 3,5 km · FC 147/163 · cad 157 · ressenti 4 · jambes normales')
  })
  it('omet les champs absents', () => {
    expect(seanceLine({ seanceId: 's2-3', date: '2026-08-12', ressenti: 3, sensationJambes: 'fraiches' })).toBe(
      'S3 · ressenti 3 · jambes fraîches',
    )
  })
  it('ajoute le commentaire en fin de ligne', () => {
    expect(seanceLine({ ...base, commentaire: 'chaud' })).toContain('— chaud')
  })
})

describe('moyenneFcRepos', () => {
  it('moyenne les valeurs renseignées', () => {
    expect(
      moyenneFcRepos([
        { date: '2026-08-10', fcRepos: 62, qualiteSommeil: 3 },
        { date: '2026-08-11', fcRepos: 66, qualiteSommeil: 3 },
      ]),
    ).toBe(64)
  })
  it('null si aucune valeur', () => {
    expect(moyenneFcRepos([{ date: '2026-08-10', qualiteSommeil: 3 }])).toBeNull()
  })
})

describe('generateCoachSummary', () => {
  it('produit un bloc complet', () => {
    const txt = generateCoachSummary({
      weekNumero: 1,
      seances: [base],
      mesures: [{ date: '2026-08-10', fcRepos: 64, qualiteSommeil: 4 }],
      alertes: ['Séance courue trop vite'],
    })
    expect(txt).toContain('Semaine 1')
    expect(txt).toContain('S1 · 30 min')
    expect(txt).toContain('FC repos moyenne : 64 bpm')
    expect(txt).toContain('Alertes : Séance courue trop vite')
  })
  it('indique « aucune » sans alerte', () => {
    const txt = generateCoachSummary({ weekNumero: 2, seances: [], mesures: [], alertes: [] })
    expect(txt).toContain('Alertes : aucune')
    expect(txt).toContain('FC repos moyenne : —')
  })
})
