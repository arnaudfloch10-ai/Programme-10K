import type { Profil, ProfilId } from '../types'

// Registre statique des profils. La couleur d'accent est le SEUL différenciateur
// visuel entre profils — aucune refonte de mise en page.
export const PROFILS: Record<ProfilId, Profil> = {
  arnaud: {
    id: 'arnaud',
    prenom: 'Arnaud',
    accentColor: '#3b4a5a', // ardoise
    pilotage: 'allure',
    planId: 'bloc0-10km',
  },
  charline: {
    id: 'charline',
    prenom: 'Charline',
    accentColor: '#b5643c', // terracotta
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
