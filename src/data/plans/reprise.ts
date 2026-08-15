import type { ReprisePlan } from '../../types'

// Plan « Reprise aérobie » de Charline — piloté en fréquence cardiaque.
// Fichier de données ISOLÉ, éditable chaque semaine sans toucher aux composants.
// Transposé du JSON coach ; blocs 2 et 3 volontairement non chiffrés.
export const REPRISE_PLAN: ReprisePlan = {
  zones: [
    { id: 'ef-basse', libelle: 'EF basse', pctReserveMin: 55, pctReserveMax: 62, fcMin: 138, fcMax: 148, allureMin: '9:15', allureMax: '8:45' },
    { id: 'ef-haute', libelle: 'EF haute', pctReserveMin: 62, pctReserveMax: 70, fcMin: 148, fcMax: 159, allureMin: '8:45', allureMax: '8:15' },
    { id: 'endurance-active', libelle: 'Endurance active', pctReserveMin: 70, pctReserveMax: 78, fcMin: 159, fcMax: 170, allureMin: '8:10', allureMax: '7:45' },
    { id: 'seuil', libelle: 'Seuil', pctReserveMin: 80, pctReserveMax: 88, fcMin: 172, fcMax: 183, allureMin: '7:05', allureMax: '6:55' },
  ],

  fourchetteTravailParDefaut: { min: 140, max: 155 },

  blocs: [
    {
      numero: 1,
      titre: 'Recalage aérobie',
      objectif: "Faire redescendre l'intensité, passer à 3 séances, installer l'allure EF",
      statut: 'actif',
      semaines: [
        {
          numero: 1,
          allegee: false,
          volumeCibleMin: 95,
          volumeCibleKm: 11,
          consigneCle: 'Ne jamais dépasser 155 bpm, quitte à ralentir à 9\'30"/km',
          seances: [
            { id: 's1-1', jourSuggere: 'mardi', type: 'EF', contenu: '30 min continu', dureeMin: 30, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's1-2', jourSuggere: 'jeudi', type: 'EF', contenu: '30 min continu', dureeMin: 30, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's1-3', jourSuggere: 'dimanche', type: 'EF', contenu: '35 min continu', dureeMin: 35, fcCible: { min: 140, max: 155 }, allureCible: '8:15-9:00', note: "Fourchette d'allure plus large : sortie longue, dérive cardiaque attendue en fin de séance. Piloter à la FC, pas à l'allure." },
          ],
        },
        {
          numero: 2,
          allegee: false,
          volumeCibleMin: 105,
          volumeCibleKm: 12.5,
          consigneCle: '10 dernières minutes de S2 au métronome à 160 pas/min',
          seances: [
            { id: 's2-1', jourSuggere: 'mardi', type: 'EF', contenu: '30 min continu', dureeMin: 30, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's2-2', jourSuggere: 'jeudi', type: 'EF + cadence', contenu: '35 min continu, dont 10 min finales à 160 ppm', dureeMin: 35, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: 'Métronome ou playlist à 160 bpm sur les 10 dernières minutes' },
            { id: 's2-3', jourSuggere: 'dimanche', type: 'EF', contenu: '40 min continu', dureeMin: 40, fcCible: { min: 140, max: 155 }, allureCible: '8:15-9:00', note: "Fourchette d'allure plus large : sortie longue, dérive cardiaque attendue en fin de séance. Piloter à la FC, pas à l'allure." },
          ],
        },
        {
          numero: 3,
          allegee: false,
          volumeCibleMin: 115,
          volumeCibleKm: 13.5,
          consigneCle: 'Les lignes droites ne sont pas une séance de qualité : rester relâchée',
          seances: [
            { id: 's3-1', jourSuggere: 'mardi', type: 'EF', contenu: '35 min continu', dureeMin: 35, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's3-2', jourSuggere: 'jeudi', type: 'EF + lignes droites', contenu: '35 min EF + 4 × 20" lignes droites, récup 1\'40" marche', dureeMin: 43, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: '20" ne sollicite pas la filière lactique : travail neuromusculaire pur' },
            { id: 's3-3', jourSuggere: 'dimanche', type: 'EF', contenu: '45 min continu', dureeMin: 45, fcCible: { min: 140, max: 155 }, allureCible: '8:15-9:00', note: "Fourchette d'allure plus large : sortie longue, dérive cardiaque attendue en fin de séance. Piloter à la FC, pas à l'allure." },
          ],
        },
        {
          numero: 4,
          allegee: true,
          volumeCibleMin: 85,
          volumeCibleKm: 10,
          consigneCle: 'Semaine de récupération : le test se fait jambes fraîches',
          seances: [
            { id: 's4-1', jourSuggere: 'mardi', type: 'EF', contenu: '30 min continu', dureeMin: 30, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's4-2', jourSuggere: 'jeudi', type: 'EF + lignes droites', contenu: '30 min EF + 4 × 20" lignes droites, récup 1\'40" marche', dureeMin: 38, fcCible: { min: 140, max: 152 }, allureCible: '8:30-9:00', note: null },
            { id: 's4-3', jourSuggere: 'dimanche', type: 'TEST', contenu: 'Demi-Cooper : 20 min échauffement + 3 lignes droites, distance max en 6 min, 10 min retour au calme', dureeMin: 36, fcCible: null, allureCible: null, note: 'Écran test dédié. Jambes fraîches, 24 h sans séance dure, parcours plat mesuré ou piste.', test: true },
          ],
        },
      ],
    },
    {
      numero: 2,
      titre: 'Développement du volume',
      objectif: 'Capillarisation, densité mitochondriale, tolérance osseuse',
      statut: 'verrouille',
      messageVerrouille: 'À définir après le test VMA de la semaine 4',
      semaines: [],
    },
    {
      numero: 3,
      titre: 'Introduction qualité',
      objectif: 'Une seule séance seuil par semaine, côtes courtes',
      statut: 'verrouille',
      messageVerrouille: 'À définir après le bloc 2',
      semaines: [],
    },
  ],

  testVma: {
    type: 'demi-cooper',
    dureeSecondes: 360,
    preDecompteSecondes: 5,
    formuleVma: 'distance_metres / 100',
    recalculAllures: [
      { id: 'ef', libelle: 'EF', pctVmaMin: 65, pctVmaMax: 70 },
      { id: 'seuil', libelle: 'Seuil', pctVmaMin: 85, pctVmaMax: 85 },
      { id: 'vma-courte', libelle: 'VMA courte', pctVmaMin: 100, pctVmaMax: 105 },
    ],
    messageApresTest: 'VMA mesurée. Transmettre le résultat au coach pour la suite du plan.',
  },
}
