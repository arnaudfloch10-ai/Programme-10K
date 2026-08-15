import type { Profil, ProfilId } from '../types'

// Registre statique des profils. Chaque profil porte SON thème (jeu de tokens)
// et son accent — basculer de profil bascule le thème.
export const PROFILS: Record<ProfilId, Profil> = {
  arnaud: {
    id: 'arnaud',
    prenom: 'Arnaud',
    accentColor: '#3b4a5a', // ardoise
    theme: 'light-copper',
    pilotage: 'allure',
    planId: 'bloc0-10km',
  },
  charline: {
    id: 'charline',
    prenom: 'Charline',
    accentColor: '#ff5ba8', // rose — accent du thème sombre OLED
    theme: 'dark-rose',
    pilotage: 'fc',
    planId: 'reprise-aerobie',
  },
}

export const PROFIL_ORDER: ProfilId[] = ['arnaud', 'charline']

export function getProfil(id: ProfilId): Profil {
  return PROFILS[id]
}

export function isProfilId(v: unknown): v is ProfilId {
  return v === 'arnaud' || v === 'charline'
}
