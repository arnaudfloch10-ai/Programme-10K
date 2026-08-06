// Contenu des séances de renforcement, affiché au même titre qu'une séance.
export interface StrengthExercise {
  name: string
  sets: string // "3 × 8–10", "3 × 12 par jambe"…
  from?: string // ex. "S3" si l'exercice n'entre qu'à partir d'une semaine
}

export interface StrengthRoutine {
  id: 'A' | 'B'
  title: string
  day: string
  note: string
  exercises: StrengthExercise[]
}

export const RENFO_A: StrengthRoutine = {
  id: 'A',
  title: 'Renfo A — Force',
  day: 'mercredi',
  note: 'Charges légères de S1 à S4, montée en charge à partir de S5.',
  exercises: [
    { name: 'Squat ou goblet squat', sets: '3 × 8–10' },
    { name: 'Fentes marchées', sets: '3 × 10 par jambe' },
    { name: 'Soulevé de terre roumain unilatéral', sets: '3 × 8 par jambe' },
    { name: 'Montée de banc chargée', sets: '3 × 8 par jambe' },
  ],
}

export const RENFO_B: StrengthRoutine = {
  id: 'B',
  title: 'Renfo B — Chaîne postérieure & pied',
  day: 'samedi',
  note: 'Travail excentrique du mollet et proprioception du pied.',
  exercises: [
    { name: 'Excentriques mollet (montée 2 pieds, descente 1 pied, tempo 3")', sets: '3 × 12 par jambe' },
    { name: 'Extensions mollets genou tendu', sets: '3 × 15' },
    { name: 'Extensions mollets genou fléchi', sets: '3 × 15' },
    { name: 'Pont fessier unilatéral', sets: '3 × 12 par jambe' },
    { name: 'Gainage ventral', sets: '3 × 45"' },
    { name: 'Gainage latéral', sets: '3 × 30" par côté' },
    { name: 'Dead bug', sets: '3 × 10 par côté' },
    { name: 'Pogo hops ou corde à sauter', sets: '3 × 30"', from: 'S3' },
    { name: 'Équilibre unipodal yeux fermés', sets: '3 × 30" par pied' },
  ],
}

export function routineForStrength(id: 'A' | 'B'): StrengthRoutine {
  return id === 'A' ? RENFO_A : RENFO_B
}
