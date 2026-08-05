// Masse grasse — méthode US Navy (homme). Pur, testable.
//
// MG% = 495 / (1.0324 − 0.19077·log10(tour_taille − cou) + 0.15456·log10(taille)) − 450
// (mesures en cm)

export interface NavyInput {
  heightCm: number
  neckCm: number
  waistCm: number
}

/** Retourne le % de masse grasse, ou null si entrées insuffisantes/invalides. */
export function bodyFatNavyMale(input: NavyInput): number | null {
  const { heightCm, neckCm, waistCm } = input
  if (!heightCm || !neckCm || !waistCm) return null
  const diff = waistCm - neckCm
  if (diff <= 0) return null // log10 non défini
  const denom = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm)
  const bf = 495 / denom - 450
  if (!isFinite(bf)) return null
  return Math.round(bf * 10) / 10
}
