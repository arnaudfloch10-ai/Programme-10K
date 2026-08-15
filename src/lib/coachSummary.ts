// Génère le « résumé coach » copiable d'une semaine (profil FC).
// Pur et testable. Une ligne par séance, format fixé par le coach :
//   S1 · 30 min · 3,5 km · FC 147/163 · cad 157 · ressenti 4 · jambes normales
import type { MesureMatinale, SeanceRealisee, SensationJambes } from '../types'
import { formatKm } from './format'

const JAMBES_LABEL: Record<SensationJambes, string> = {
  fraiches: 'fraîches',
  normales: 'normales',
  lourdes: 'lourdes',
}

/** Libellé court de la séance (« S1 ») depuis l'index en fin d'identifiant. */
export function seanceLabel(seanceId: string): string {
  const m = seanceId.match(/-(\d+)$/)
  return m ? `S${m[1]}` : seanceId
}

/** Ligne de résumé d'une séance réalisée. Les champs absents sont omis. */
export function seanceLine(s: SeanceRealisee): string {
  const parts: string[] = [seanceLabel(s.seanceId)]
  if (s.dureeMin != null) parts.push(`${s.dureeMin} min`)
  if (s.distanceKm != null) parts.push(`${formatKm(s.distanceKm)} km`)
  if (s.fcMoy != null && s.fcMax != null) parts.push(`FC ${s.fcMoy}/${s.fcMax}`)
  else if (s.fcMoy != null) parts.push(`FC ${s.fcMoy}`)
  if (s.cadence != null) parts.push(`cad ${s.cadence}`)
  parts.push(`ressenti ${s.ressenti}`)
  parts.push(`jambes ${JAMBES_LABEL[s.sensationJambes]}`)
  let line = parts.join(' · ')
  if (s.commentaire && s.commentaire.trim()) line += ` — ${s.commentaire.trim()}`
  return line
}

export interface CoachSummaryInput {
  weekNumero: number
  seances: SeanceRealisee[] // séances de la semaine, triées par date
  mesures: MesureMatinale[] // mesures matinales de la semaine
  alertes: string[] // titres des alertes déclenchées
}

/** Moyenne (arrondie) des FC de repos renseignées, ou null. */
export function moyenneFcRepos(mesures: MesureMatinale[]): number | null {
  const vals = mesures.map((m) => m.fcRepos).filter((v): v is number => typeof v === 'number')
  if (vals.length === 0) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function generateCoachSummary(input: CoachSummaryInput): string {
  const lines: string[] = [`Semaine ${input.weekNumero}`]
  for (const s of input.seances) lines.push(seanceLine(s))
  const fcRepos = moyenneFcRepos(input.mesures)
  lines.push(`FC repos moyenne : ${fcRepos != null ? `${fcRepos} bpm` : '—'}`)
  lines.push(`Alertes : ${input.alertes.length ? input.alertes.join(' ; ') : 'aucune'}`)
  return lines.join('\n')
}
