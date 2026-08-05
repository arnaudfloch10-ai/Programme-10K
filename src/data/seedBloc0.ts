import type { BlockMilestone, Interval, Session, Week } from '../types'

// Bloc 0 — 9 semaines, du lundi 3 août 2026 au dimanche 4 octobre 2026.
// Structure hebdo fixe : Lun repos · Mar séance · Mer endurance + Renfo A ·
// Jeu repos · Ven séance · Sam Renfo B · Dim sortie longue.
//
// AUCUNE allure n'est stockée : les séances ne portent que zones + positions.
// lib/sessionPace.ts dérive les allures depuis la VMA courante.

type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7

let uid = 0
const id = (w: number, tag: string) => `b0-s${w}-${tag}`

function rest(day: Day, title = 'Repos'): Session {
  return { id: `rest-${uid++}`, dayOfWeek: day, type: 'REPOS', title, totalKm: 0 }
}

function renfoB(day: Day): Session {
  return {
    id: `renfoB-${uid++}`,
    dayOfWeek: day,
    type: 'RENFO',
    title: 'Renforcement B',
    totalKm: 0,
    strength: 'B',
    note: 'Gainage, chaîne postérieure, proprioception cheville.',
  }
}

// Séance d'endurance continue simple.
function ef(
  w: number,
  day: Day,
  km: number,
  zone: 'Z1' | 'Z2',
  opts: { strength?: 'A' | 'B'; strides?: number; note?: string; title?: string } = {},
): Session {
  const intervals: Interval[] = []
  if (opts.strides) {
    intervals.push({
      reps: opts.strides,
      durationS: 20,
      zone: 'FORCE',
      recoveryS: 40,
      recoveryType: 'marche',
      label: 'lignes droites',
    })
  }
  const stridesKm = opts.strides ? Math.round(opts.strides * 0.09 * 10) / 10 : 0
  return {
    id: id(w, `ef${day}`),
    dayOfWeek: day,
    type: zone === 'Z1' ? 'RECUP' : 'EF',
    title: opts.title ?? `Endurance ${km} km ${zone}${opts.strides ? ` + ${opts.strides} lignes droites` : ''}`,
    steadyKm: km,
    steadyZone: zone,
    intervals: intervals.length ? intervals : undefined,
    totalKm: Math.round((km + stridesKm) * 10) / 10,
    strength: opts.strength,
    note: opts.note,
  }
}

// Sortie longue (avec segment de finition optionnel).
function longRun(w: number, km: number, finishKm?: number): Session {
  const intervals: Interval[] | undefined = finishKm
    ? [{ reps: 1, distanceM: finishKm * 1000, zone: 'Z3', zonePosition: 'milieu', label: 'finition' }]
    : undefined
  return {
    id: id(w, 'dim'),
    dayOfWeek: 7,
    type: 'LONGUE',
    title: finishKm ? `Sortie longue ${km} km Z2 + ${finishKm} km Z3` : `Sortie longue ${km} km Z2`,
    steadyKm: km,
    steadyZone: 'Z2',
    intervals,
    totalKm: Math.round((km + (finishKm ?? 0)) * 10) / 10,
    note: 'Endurance fondamentale, base aérobie du bloc.',
  }
}

// ---------------------------------------------------------------------------
// Semaines
// ---------------------------------------------------------------------------

const S1: Week = {
  number: 1,
  startDate: '2026-08-03',
  endDate: '2026-08-09',
  totalKm: 27,
  label: 'charge',
  sessions: [
    rest(1),
    {
      id: id(1, 'mar'),
      dayOfWeek: 2,
      type: 'EF',
      title: 'EF 6 km Z2 + 6 lignes droites',
      steadyKm: 6,
      steadyZone: 'Z2',
      intervals: [
        { reps: 6, durationS: 20, zone: 'FORCE', recoveryS: 40, recoveryType: 'marche', label: 'lignes droites' },
      ],
      totalKm: 6.5,
      note: 'Volume facile + rappel neuromusculaire léger.',
    },
    ef(1, 3, 5, 'Z1', { strength: 'A', note: 'Récupération active + Renfo A.' }),
    rest(4),
    ef(1, 5, 7.5, 'Z2'),
    renfoB(6),
    longRun(1, 8),
  ],
}

const S2: Week = {
  number: 2,
  startDate: '2026-08-10',
  endDate: '2026-08-16',
  totalKm: 29,
  label: 'charge',
  sessions: [
    rest(1),
    {
      id: id(2, 'mar'),
      dayOfWeek: 2,
      type: 'COTES',
      title: 'Côtes 8×20" (5–6 %)',
      warmupKm: 1.5,
      warmupZone: 'Z2',
      intervals: [
        { reps: 8, durationS: 20, zone: 'FORCE', recoveryS: 90, recoveryType: 'marche', label: 'côte 5–6 %' },
      ],
      cooldownKm: 1.5,
      totalKm: 6,
      note: 'Force spécifique, sans acidose. Récup en descente marchée.',
    },
    ef(2, 3, 6, 'Z2', { strength: 'A' }),
    rest(4),
    ef(2, 5, 8, 'Z2'),
    renfoB(6),
    longRun(2, 9),
  ],
}

const S3: Week = {
  number: 3,
  startDate: '2026-08-17',
  endDate: '2026-08-23',
  totalKm: 32,
  label: 'charge',
  sessions: [
    rest(1),
    ef(3, 2, 7, 'Z2', { strides: 6, title: 'EF 7 km Z2 + 6 lignes droites' }),
    ef(3, 3, 6.5, 'Z2', { strength: 'A' }),
    rest(4),
    {
      id: id(3, 'ven'),
      dayOfWeek: 5,
      type: 'SEUIL',
      title: 'Seuil 2×10\' Z4 bas',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 2, durationS: 600, zone: 'Z4', zonePosition: 'bas', recoveryS: 180, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1.5,
      totalKm: 8.5,
      isQuality: true,
      note: 'Première introduction du seuil, intensité contenue.',
    },
    renfoB(6),
    longRun(3, 10),
  ],
}

const S4: Week = {
  number: 4,
  startDate: '2026-08-24',
  endDate: '2026-08-30',
  totalKm: 26,
  label: 'allegee',
  sessions: [
    rest(1),
    ef(4, 2, 6.5, 'Z2'),
    ef(4, 3, 4, 'Z1', { strength: 'A', note: 'Semaine allégée : récup active + Renfo A.' }),
    rest(4),
    {
      id: id(4, 'ven'),
      dayOfWeek: 5,
      type: 'SEUIL',
      title: 'Seuil 2×10\' Z4 bas',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 2, durationS: 600, zone: 'Z4', zonePosition: 'bas', recoveryS: 180, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1,
      totalKm: 7,
      isQuality: true,
      note: 'Maintien du seuil en semaine allégée.',
    },
    renfoB(6),
    longRun(4, 8),
  ],
}

const S5: Week = {
  number: 5,
  startDate: '2026-08-31',
  endDate: '2026-09-06',
  totalKm: 35,
  label: 'charge',
  sessions: [
    rest(1),
    {
      id: id(5, 'mar'),
      dayOfWeek: 2,
      type: 'COTES',
      title: 'Côtes 10×20"',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 10, durationS: 20, zone: 'FORCE', recoveryS: 90, recoveryType: 'marche', label: 'côte' },
      ],
      cooldownKm: 2,
      totalKm: 7.5,
      note: 'Progression du volume de force en côte.',
    },
    ef(5, 3, 6, 'Z2', { strength: 'A' }),
    rest(4),
    {
      id: id(5, 'ven'),
      dayOfWeek: 5,
      type: 'SEUIL',
      title: 'Seuil 3×10\' Z4',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 3, durationS: 600, zone: 'Z4', zonePosition: 'milieu', recoveryS: 150, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1.5,
      totalKm: 10,
      isQuality: true,
      note: 'Volume au seuil en hausse.',
    },
    renfoB(6),
    longRun(5, 11.5),
  ],
}

const S6: Week = {
  number: 6,
  startDate: '2026-09-07',
  endDate: '2026-09-13',
  totalKm: 38,
  label: 'charge',
  sessions: [
    rest(1),
    {
      id: id(6, 'mar'),
      dayOfWeek: 2,
      type: 'TEST',
      title: 'Test VMA 6 min',
      warmupKm: 3,
      warmupZone: 'Z2',
      intervals: [
        { reps: 3, durationS: 20, zone: 'FORCE', recoveryS: 40, recoveryType: 'marche', label: 'lignes droites' },
        { reps: 1, durationS: 360, zone: 'Z5', zonePosition: 'haut', label: '6 min max' },
      ],
      cooldownKm: 2,
      totalKm: 8,
      isQuality: true,
      note: 'Effort maximal 6 min. Distance parcourue → nouvelle VMA (distance/100).',
    },
    ef(6, 3, 7.5, 'Z2', { strength: 'A' }),
    rest(4),
    {
      id: id(6, 'ven'),
      dayOfWeek: 5,
      type: 'SEUIL',
      title: 'Seuil 2×15\' Z4 bas',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 2, durationS: 900, zone: 'Z4', zonePosition: 'bas', recoveryS: 180, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1.5,
      totalKm: 9.5,
      isQuality: true,
      note: 'Allongement des fractions au seuil.',
    },
    renfoB(6),
    longRun(6, 13),
  ],
}

const S7: Week = {
  number: 7,
  startDate: '2026-09-14',
  endDate: '2026-09-20',
  totalKm: 41,
  label: 'charge',
  sessions: [
    rest(1),
    {
      id: id(7, 'mar'),
      dayOfWeek: 2,
      type: 'VO2',
      title: 'VO₂max 5×800 m Z5 bas',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 5, distanceM: 800, zone: 'Z5', zonePosition: 'bas', recoveryS: 150, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1.5,
      totalKm: 10,
      isQuality: true,
      note: 'Développement VO₂max, allure VMA contenue en bas de Z5.',
    },
    ef(7, 3, 6, 'Z2', { strength: 'A' }),
    ef(7, 4, 5, 'Z1', { note: 'EF récup supplémentaire, semaine de charge.' }),
    {
      id: id(7, 'ven'),
      dayOfWeek: 5,
      type: 'SEUIL',
      title: 'Seuil 4000 m continu Z4',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [{ reps: 1, distanceM: 4000, zone: 'Z4', zonePosition: 'milieu' }],
      cooldownKm: 1,
      totalKm: 7,
      isQuality: true,
      note: 'Bloc de seuil continu, tenue de l\'allure.',
    },
    renfoB(6),
    longRun(7, 10, 3),
  ],
}

const S8: Week = {
  number: 8,
  startDate: '2026-09-21',
  endDate: '2026-09-27',
  totalKm: 30,
  label: 'allegee',
  sessions: [
    rest(1),
    {
      id: id(8, 'mar'),
      dayOfWeek: 2,
      type: 'VO2',
      title: 'VO₂max 6×400 m Z5 haut',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 6, distanceM: 400, zone: 'Z5', zonePosition: 'haut', recoveryS: 60, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 2,
      totalKm: 7,
      isQuality: true,
      note: 'Vivacité, allure haute de Z5, récup courte. Semaine allégée.',
    },
    ef(8, 3, 6, 'Z2', { strength: 'A' }),
    rest(4),
    ef(8, 5, 6.5, 'Z2', { strides: 6, title: 'EF 6,5 km Z2 + 6 lignes droites' }),
    renfoB(6),
    longRun(8, 10.5),
  ],
}

const S9: Week = {
  number: 9,
  startDate: '2026-09-28',
  endDate: '2026-10-04',
  totalKm: 28,
  label: 'course',
  sessions: [
    rest(1),
    {
      id: id(9, 'mar'),
      dayOfWeek: 2,
      type: 'VO2',
      title: 'Affûtage : 2000 m allure 10 km + 4×200 m',
      warmupKm: 2,
      warmupZone: 'Z2',
      intervals: [
        { reps: 1, distanceM: 2000, zone: 'Z4', zonePosition: 'milieu', recoveryS: 180, recoveryZone: 'Z1', recoveryType: 'trot', label: 'allure 10 km' },
        { reps: 4, distanceM: 200, zone: 'Z5', zonePosition: 'haut', recoveryDistanceM: 200, recoveryZone: 'Z1', recoveryType: 'trot' },
      ],
      cooldownKm: 1.5,
      totalKm: 6,
      isQuality: true,
      note: 'Rappel d\'allure course + vivacité, sans fatigue.',
    },
    // Renfo B déplacé au mercredi cette semaine (voir note S9).
    ef(9, 3, 4, 'Z1', { strength: 'B', title: 'EF 4 km Z1 + Renfo B', note: 'Renfo B avancé au mercredi.' }),
    rest(4),
    ef(9, 5, 4, 'Z1', { strides: 4, title: 'EF 4 km Z1 + 4 lignes droites', note: 'Déblocage, jambes fraîches.' }),
    rest(6, 'Repos complet'),
    {
      id: id(9, 'dim'),
      dayOfWeek: 7,
      type: 'COURSE',
      title: '10 km de St-Maur',
      warmupKm: 2.5,
      warmupZone: 'Z2',
      intervals: [{ reps: 1, distanceM: 10000, zone: 'Z4', label: 'course' }],
      cooldownKm: 1.5,
      totalKm: 14,
      raceConsigne:
        'km 1–3 en Z3 haut · km 4–7 en Z4 · km 8–10 libre. Négative split obligatoire, aucun chrono recherché.',
      note: 'Course-test intermédiaire. Objectif : gestion d\'allure, pas de chrono.',
    },
  ],
}

export const BLOC0_WEEKS: Week[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9]

// Blocs 1 à 4 — non détaillés, affichés comme jalons dans la vue macro.
export const BLOCK_MILESTONES: BlockMilestone[] = [
  {
    block: 1,
    title: 'Reprise & seuil',
    startDate: '2026-10-05',
    endDate: '2026-12-06',
    focus: 'Réendurance post-St-Maur, consolidation du seuil.',
  },
  {
    block: 2,
    title: 'Puissance aérobie',
    startDate: '2026-12-07',
    endDate: '2027-02-07',
    focus: 'VMA courte et longue, renforcement hivernal.',
  },
  {
    block: 3,
    title: 'Spécifique 10 km',
    startDate: '2027-02-08',
    endDate: '2027-04-11',
    focus: 'Allure course 10 km, tolérance lactique.',
  },
  {
    block: 4,
    title: 'Affûtage & objectif',
    startDate: '2027-04-12',
    endDate: '2027-05-23',
    focus: 'Affûtage progressif vers l\'objectif.',
    keyEvent: '10 km de Vincennes — 23 mai 2027, cible 48\'30".',
  },
]
