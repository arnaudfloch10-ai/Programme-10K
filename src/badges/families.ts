import type { BadgeDef, BadgeFamilyId, FamilyMeta } from './types'

// Métadonnées des familles : une couleur dominante + une forme constante.
export const FAMILIES: FamilyMeta[] = [
  { id: 'premiers-pas', nom: 'Premiers pas', color: '#4a9d7f', shape: 'circle' },
  { id: 'regularite', nom: 'Régularité', color: '#e08a3c', shape: 'hexagon' },
  { id: 'progression', nom: 'Progression', color: '#4a7fa8', shape: 'hexagon' },
  { id: 'ecoute-du-corps', nom: 'Écoute du corps', color: '#7d5ba6', shape: 'hexagon' },
  { id: 'decouverte', nom: 'Découverte', color: '#d4a63c', shape: 'circle' },
  { id: 'bien-etre', nom: 'Bien-être', color: '#d4657a', shape: 'circle' },
  { id: 'ensemble', nom: 'Ensemble', color: '#5ba6a0', shape: 'circle' },
]

export const FAMILY_ORDER: BadgeFamilyId[] = FAMILIES.map((f) => f.id)
export const getFamily = (id: BadgeFamilyId): FamilyMeta => FAMILIES.find((f) => f.id === id)!

// --- Les 45 badges. Aucun ne récompense les jours consécutifs. ---
export const BADGES: BadgeDef[] = [
  // 1 · Premiers pas (distance) — médaillons numériques, sauf la première foulée.
  { id: 'premiere-foulee', family: 'premiers-pas', nom: 'Première foulée', condition: 'Première activité enregistrée', icon: 'foot', message: 'Ça y est, tu es coureuse. Le plus dur est fait.' },
  { id: 'premier-km', family: 'premiers-pas', nom: 'Premier kilomètre', condition: "1 km d'un seul tenant", label: '1 KM' },
  { id: 'trois-km', family: 'premiers-pas', nom: 'Trois kilomètres', condition: "3 km d'un seul tenant", label: '3 KM' },
  { id: 'cinq-km', family: 'premiers-pas', nom: 'Cinq kilomètres', condition: "5 km d'un seul tenant", label: '5 KM' },
  { id: 'cumul-25', family: 'premiers-pas', nom: '25 km cumulés', condition: 'Distance totale', label: '25' },
  { id: 'cumul-100', family: 'premiers-pas', nom: '100 km cumulés', condition: 'Distance totale', label: '100' },
  { id: 'cumul-250', family: 'premiers-pas', nom: '250 km cumulés', condition: 'Distance totale', label: '250' },
  { id: 'cumul-500', family: 'premiers-pas', nom: '500 km cumulés', condition: 'Distance totale', label: '500' },

  // 2 · Régularité — comptée en SEMAINES, jamais en jours consécutifs.
  { id: 'deux-de-suite', family: 'regularite', nom: 'Deux de suite', condition: '2 semaines avec au moins 2 sorties', icon: 'calendar', message: 'Deux semaines qui se tiennent. La régularité se construit comme ça.' },
  { id: 'un-mois-regulier', family: 'regularite', nom: 'Un mois régulier', condition: '4 semaines avec au moins 2 sorties', icon: 'calendar' },
  { id: 'deux-mois', family: 'regularite', nom: 'Deux mois', condition: '8 semaines avec au moins 2 sorties', icon: 'calendar' },
  { id: 'une-saison', family: 'regularite', nom: 'Une saison', condition: '12 semaines avec au moins 2 sorties', icon: 'calendar' },
  { id: 'retour-apres-pause', family: 'regularite', nom: 'Retour après pause', condition: "Reprise après 2 semaines ou plus d'arrêt", icon: 'return', message: 'Reprendre après une coupure, c’est une force, pas un retard.' },
  { id: 'matinale', family: 'regularite', nom: 'Matinale', condition: '10 sorties démarrées avant 9 h', icon: 'sunrise' },
  { id: 'toutes-saisons', family: 'regularite', nom: 'Toutes saisons', condition: 'Une sortie dans chacune des 4 saisons', icon: 'seasons' },

  // 3 · Progression
  { id: 'plus-loin', family: 'progression', nom: 'Plus loin', condition: 'Nouveau record de distance sur une sortie', icon: 'arrowfar' },
  { id: 'plus-longtemps', family: 'progression', nom: 'Plus longtemps', condition: 'Nouveau record de durée', icon: 'clock' },
  { id: 'trois-records', family: 'progression', nom: 'Trois records', condition: '3 records personnels cumulés', icon: 'medal' },
  { id: 'cinq-records', family: 'progression', nom: 'Cinq records', condition: '5 records personnels cumulés', icon: 'medal' },
  { id: 'souffle-qui-revient', family: 'progression', nom: 'Souffle qui revient', condition: "Même allure avec 5 bpm de moins qu'un mois plus tôt", icon: 'lungs', message: 'Ton cœur travaille moins pour la même allure. Il s’adapte.' },
  { id: 'sans-marcher', family: 'progression', nom: 'Sans marcher', condition: 'Première sortie de 20 min sans interruption', icon: 'run' },
  { id: 'trente-minutes', family: 'progression', nom: 'Trente minutes', condition: 'Première sortie de 30 min sans interruption', icon: 'stopwatch' },

  // 4 · Écoute du corps — la famille la plus importante (validée).
  { id: 'repos-merite', family: 'ecoute-du-corps', nom: 'Repos mérité', condition: '2 jours de repos entre deux sorties, 4 fois', icon: 'pause', message: 'Ton corps construit pendant que tu te reposes.', tiers: [ { level: 'bronze', seuil: 4 }, { level: 'argent', seuil: 12 }, { level: 'or', seuil: 24 } ] },
  { id: 'depart-prudent', family: 'ecoute-du-corps', nom: 'Départ prudent', condition: 'Premier kilomètre plus lent que la moyenne', icon: 'turtle' },
  { id: 'negative-split', family: 'ecoute-du-corps', nom: 'Negative split', condition: 'Seconde moitié plus rapide que la première', icon: 'bars' },
  { id: 'allure-facile', family: 'ecoute-du-corps', nom: 'Allure facile', condition: 'Sortie entière en dessous de 75 % de la FC max', icon: 'heart' },
  { id: 'semaine-legere', family: 'ecoute-du-corps', nom: 'Semaine légère', condition: 'Une semaine à volume réduit après trois de hausse', icon: 'feather', message: 'Alléger après une montée, c’est ce qui rend la progression durable.' },
  { id: 'recuperation', family: 'ecoute-du-corps', nom: 'Récupération', condition: '3 jours sans course après une sortie longue', icon: 'refresh' },
  { id: 'sagesse', family: 'ecoute-du-corps', nom: 'Sagesse', condition: 'Sortie écourtée ou annulée volontairement', icon: 'owl', message: 'S’arrêter à temps, c’est savoir courir longtemps.' },
  { id: 'sommeil-dabord', family: 'ecoute-du-corps', nom: "Sommeil d'abord", condition: '7 nuits de 7 h ou plus sur une semaine', icon: 'moon' },

  // 5 · Découverte
  { id: 'nouveau-parcours', family: 'decouverte', nom: 'Nouveau parcours', condition: '5 tracés différents', icon: 'map' },
  { id: 'exploratrice', family: 'decouverte', nom: 'Exploratrice', condition: '10 tracés différents', icon: 'compass' },
  { id: 'sous-la-pluie', family: 'decouverte', nom: 'Sous la pluie', condition: 'Une sortie par temps de pluie', icon: 'rain' },
  { id: 'au-froid', family: 'decouverte', nom: 'Au froid', condition: 'Une sortie sous 5 °C', icon: 'snow' },
  { id: 'premiere-cote', family: 'decouverte', nom: 'Première côte', condition: '50 m de dénivelé positif sur une sortie', icon: 'mountain' },
  { id: 'chemin-de-traverse', family: 'decouverte', nom: 'Chemin de traverse', condition: 'Une sortie hors bitume', icon: 'trail' },

  // 6 · Bien-être — ciblés sur son contexte (reprise, arrêt du tabac).
  { id: 'souffle-neuf', family: 'bien-etre', nom: 'Souffle neuf', condition: '1 mois de course régulière', icon: 'leaf', message: 'Un mois sans tabac et en mouvement. Tes poumons te remercient.' },
  { id: 'poumons-libres', family: 'bien-etre', nom: 'Poumons libres', condition: '3 mois de course régulière', icon: 'lungs' },
  { id: 'nouvelle-habitude', family: 'bien-etre', nom: 'Nouvelle habitude', condition: '6 mois de course régulière', icon: 'calendarheart' },
  { id: 'energie', family: 'bien-etre', nom: 'Énergie', condition: '20 sorties enregistrées', icon: 'bolt' },
  { id: 'coeur-solide', family: 'bien-etre', nom: 'Cœur solide', condition: 'FC de repos en baisse sur 4 semaines', icon: 'heartpulse' },

  // 7 · Ensemble
  { id: 'a-deux', family: 'ensemble', nom: 'À deux', condition: "Une sortie en même temps qu'un autre coureur", icon: 'duo' },
  { id: 'duo-regulier', family: 'ensemble', nom: 'Duo régulier', condition: '5 sorties à deux', icon: 'duo' },
  { id: 'premier-dossard', family: 'ensemble', nom: 'Premier dossard', condition: 'Une course officielle', icon: 'bib', message: 'Un dossard, pas un chrono. Tu y étais, c’est tout ce qui compte.' },
  { id: 'encouragement', family: 'ensemble', nom: 'Encouragement', condition: "Un kudos donné à quelqu'un", icon: 'thumbsup' },
]

export const BADGES_BY_FAMILY = (id: BadgeFamilyId): BadgeDef[] => BADGES.filter((b) => b.family === id)
export const getBadge = (id: string): BadgeDef | undefined => BADGES.find((b) => b.id === id)
export const TOTAL_BADGES = BADGES.length
