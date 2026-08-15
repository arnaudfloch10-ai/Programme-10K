import type { RepriseSuivi } from '../../types'

// Suivi qualitatif de Charline : renfo, signaux d'alerte, matériel.
// Fichier de données ISOLÉ, éditable sans toucher aux composants.
// Transposé exactement du JSON coach — aucun contenu inventé.
export const REPRISE_SUIVI: RepriseSuivi = {
  // 2 séances/semaine, 20 min, APRÈS une sortie ou sur jour off, jamais avant.
  renfo: [
    {
      id: 'mollet-tendu',
      nom: 'Montées de mollet unipodales, genou tendu',
      volume: '3 × 15/jambe',
      justification: 'Achille et soleus — structure la plus chargée en course',
    },
    {
      id: 'mollet-flechi',
      nom: 'Montées de mollet unipodales, genou fléchi 30°',
      volume: '2 × 12/jambe',
      justification: 'Soleus profond, maillon faible fréquent',
    },
    {
      id: 'pont-fessier',
      nom: 'Pont fessier unipodal',
      volume: '3 × 12/jambe',
      justification: "Fessier moyen — prévention du syndrome de l'essuie-glace",
    },
    {
      id: 'fentes',
      nom: 'Fentes marchées',
      volume: '3 × 10/jambe',
      justification: 'Contrôle du valgus en appui unipodal',
    },
    {
      id: 'gainage-lateral',
      nom: 'Gainage latéral',
      volume: '3 × 30"/côté',
      justification: 'Stabilité du bassin dans le plan frontal',
    },
    {
      id: 'gainage-ventral',
      nom: 'Gainage ventral',
      volume: '3 × 40"',
      justification: 'Chaîne antérieure',
    },
  ],

  // Écran statique. Arrêt immédiat et consultation si :
  signauxArret: [
    "Douleur osseuse localisée au tibia ou à l'avant-pied qui s'intensifie pendant la course",
    'Douleur au talon dès le premier pas du matin',
    'FC de repos ≥ 69 sur 3 jours',
    'Sommeil dégradé sur plusieurs nuits',
  ],

  chaussure: { nom: 'Nike Vomero Plus', seuilMinKm: 600, seuilMaxKm: 800 },
}
