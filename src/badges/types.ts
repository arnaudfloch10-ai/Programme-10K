// Système de badges — modèle de données.
// Règle fondatrice : AUCUN badge ne récompense les jours consécutifs. La
// régularité se compte en SEMAINES contenant ≥ 2 sorties (voir engine.ts).

export type BadgeFamilyId =
  | 'premiers-pas'
  | 'regularite'
  | 'progression'
  | 'ecoute-du-corps'
  | 'decouverte'
  | 'bien-etre'
  | 'ensemble'

export type BadgeShape = 'hexagon' | 'circle'
export type BadgeLevel = 'bronze' | 'argent' | 'or'

export interface FamilyMeta {
  id: BadgeFamilyId
  nom: string
  color: string // une couleur dominante par famille
  shape: BadgeShape // forme constante par famille
}

/** Palier d'un badge évolutif : un seuil, un niveau. Trois maximum. */
export interface BadgeTier {
  level: BadgeLevel
  seuil: number // valeur de la métrique à atteindre
}

export interface BadgeDef {
  id: string
  family: BadgeFamilyId
  nom: string
  condition: string // libellé lisible
  icon?: string // clé de pictogramme (voir icons.tsx)
  label?: string // médaillon texte (ex. « 5 KM ») quand pas de pictogramme
  message?: string // message chaleureux au déblocage
  /** Badges évolutifs : bronze → argent → or. Absent = un seul palier. */
  tiers?: BadgeTier[]
}

/** État runtime d'un badge, produit par le moteur. */
export interface BadgeState {
  unlocked: boolean
  level?: BadgeLevel // pour un badge évolutif débloqué
  date?: string // ISO du déblocage
}

export type BadgeStates = Record<string, BadgeState>
