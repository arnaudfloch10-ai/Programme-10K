# Prompt pour Claude Code — Application de suivi d'entraînement 10 km

> Copie tout ce qui suit dans Claude Code, dans un dossier vide.

---

Construis une application web de suivi d'entraînement running, utilisable au quotidien depuis un téléphone. Elle doit fonctionner **hors ligne**, sans compte utilisateur, sans backend, sans base de données distante. Toutes les données restent sur l'appareil.

## Contexte

C'est mon plan personnel de préparation pour un 10 km. Le point central de l'application : **les allures ne sont jamais écrites en dur**. Elles sont toutes dérivées d'un unique paramètre, la VMA. Quand je fais un test et que ma VMA change, l'intégralité du plan doit se recalculer automatiquement. C'est l'exigence architecturale numéro un.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS**
- **IndexedDB** via `idb` pour la persistance (pas localStorage : je veux pouvoir stocker un historique long)
- **PWA** : manifest + service worker, installable sur l'écran d'accueil iOS/Android, fonctionnelle en mode avion
- **Recharts** pour les graphiques
- Aucune dépendance à un service externe. Aucun appel réseau au runtime.
- Déployable en statique (Vercel, Netlify, ou un simple `dist/` servi en local)

## Mon profil (valeurs initiales, toutes modifiables dans les réglages)

```
Âge                39 ans
Taille             181 cm
Poids              77 kg
FC max             196 bpm
VMA                12,5 km/h   (demi-Cooper 1250 m, août 2026)
Record 5 km        25'47" (solo, GPS)
Volume de départ   25 km/semaine
```

**Objectif** : 10 km de Vincennes, 23 mai 2027, cible 48'30".
**Course-test intermédiaire** : 10 km de St-Maur, 4 octobre 2026.

## Le moteur de zones — cœur du système

Cinq zones, toutes calculées à partir de la VMA en km/h et de la FC max. Implémente ça comme une fonction pure, testée, dans `src/lib/zones.ts` :

| Zone | Nom | % VMA | % FC max |
|---|---|---|---|
| Z1 | Récupération | 60–70 % | < 70 % |
| Z2 | Endurance fondamentale | 70–78 % | 70–80 % |
| Z3 | Endurance active | 78–85 % | 80–87 % |
| Z4 | Seuil | 85–92 % | 87–92 % |
| Z5 | VO₂max / VMA | 92–105 % | > 92 % |

**Conversions à implémenter :**
- vitesse (km/h) = VMA × pourcentage
- allure (s/km) = 3600 / vitesse
- temps au tour de 400 m (s) = allure / 2,5
- affichage allure au format `m:ss` (ex. `6:30`)

**Allures dérivées à exposer aussi :**
- Allure 10 km actuelle = 88 % VMA
- Allure 5 km actuelle = 93 % VMA
- Allure marathon = 82 % VMA

Chaque zone a une couleur constante dans toute l'app :
```
Z1 #7b98a8   Z2 #3d6b7d   Z3 #5f7a3a   Z4 #8a6d1f   Z5 #a32e3d
Force/hors zone #a86a1f   Repos #9aa2a8
```

## Modèle de données

```ts
type ZoneId = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5'|'FORCE'|'REST'

type Interval = {
  reps: number
  distanceM?: number        // ex. 800
  durationS?: number        // ex. 600  (l'un ou l'autre)
  zone: ZoneId
  zonePosition?: 'bas'|'milieu'|'haut'   // affine l'allure dans la zone
  recoveryS?: number
  recoveryZone?: ZoneId
  recoveryType?: 'trot'|'marche'
}

type Session = {
  id: string
  dayOfWeek: 1|2|3|4|5|6|7   // 1 = lundi
  type: 'EF'|'RECUP'|'SEUIL'|'VO2'|'COTES'|'LONGUE'|'TEST'|'COURSE'|'REPOS'|'RENFO'
  title: string
  warmupKm?: number
  warmupZone?: ZoneId
  intervals?: Interval[]
  steadyKm?: number          // pour les séances continues
  steadyZone?: ZoneId
  cooldownKm?: number
  totalKm: number
  note?: string              // justification physiologique, une phrase
  strength?: 'A'|'B'         // séance de renfo associée
}

type Week = {
  number: number
  startDate: string          // ISO
  endDate: string
  totalKm: number
  label?: 'charge'|'allegee'|'course'
  sessions: Session[]
}

type LoggedSession = {
  sessionId: string
  date: string
  done: boolean
  actualKm?: number
  actualPaceS?: number       // s/km
  actualHrAvg?: number
  zoneHeld?: ZoneId          // zone réellement tenue
  feel: 1|2|3|4|5
  fatigue: 1|2|3|4|5
  pain?: { area: string; intensity: number; note: string }
  comment?: string
}

type Measurement = {
  date: string
  weightKg?: number
  waistCm?: number           // au réveil, à jeun
  hipCm?: number
  neckCm?: number
  thighCm?: number
  calfCm?: number
  restingHr?: number
}

type VmaTest = {
  date: string
  type: 'demi-cooper'|'cooper'|'course'
  distanceM?: number         // pour un test de 6 ou 12 min
  raceDistanceM?: number     // pour une course
  raceTimeS?: number
  computedVma: number
}
```

## Le plan à charger en seed

Bloc 0, 9 semaines, du **lundi 3 août 2026** au **dimanche 4 octobre 2026**. Structure hebdomadaire fixe : Lun repos · Mar séance · Mer endurance + Renfo A · Jeu repos · Ven séance · Sam Renfo B · Dim sortie longue.

| Sem. | Dates | Total | Mardi | Mercredi | Jeudi | Vendredi | Dimanche |
|---|---|---|---|---|---|---|---|
| S1 | 3–9 août | 27 | EF 6 km Z2 + 6×20" lignes droites (r 40" marche) — 6,5 | EF 5 km Z1 — 5 | — | EF 7,5 km Z2 — 7,5 | SL 8 km Z2 — 8 |
| S2 | 10–16 août | 29 | Éch 1,5 + 8×20" côte 5–6 % (r descente marchée 90") + RC 1,5 — 6 | EF 6 km Z2 — 6 | — | EF 8 km Z2 — 8 | SL 9 km Z2 — 9 |
| S3 | 17–23 août | 32 | EF 7 km Z2 + 6×20" LD — 7 | EF 6,5 km Z2 — 6,5 | — | Éch 2 + 2×10' Z4 bas (r 3' Z1) + RC 1,5 — 8,5 | SL 10 km Z2 — 10 |
| S4 *allégée* | 24–30 août | 26 | EF 6,5 km Z2 — 6,5 | EF 4 km Z1 — 4 | — | Éch 2 + 2×10' Z4 bas (r 3') + RC 1 — 7 | SL 8 km Z2 — 8 |
| S5 | 31 août–6 sept | 35 | Éch 2 + 10×20" côte + RC 2 — 7,5 | EF 6 km Z2 — 6 | — | Éch 2 + 3×10' Z4 (r 2'30) + RC 1,5 — 10 | SL 11,5 km Z2 — 11,5 |
| S6 | 7–13 sept | 38 | **Test VMA 6 min** : éch 20 min Z2 + 3 LD + 6' max + RC 2 km — 8 | EF 7,5 km Z2 — 7,5 | — | Éch 2 + 2×15' Z4 bas (r 3') + RC 1,5 — 9,5 | SL 13 km Z2 — 13 |
| S7 | 14–20 sept | 41 | Éch 2 + 5×800 m Z5 bas (r 2'30 Z1) + RC 1,5 — 10 | EF 6 km Z2 — 6 | EF 5 km Z1 — 5 | Éch 2 + 4000 m Z4 continu + RC 1 — 7 | SL 10 km Z2 + 3 km Z3 — 13 |
| S8 *allégée* | 21–27 sept | 30 | Éch 2 + 6×400 m Z5 haut (r 1') + RC 2 — 7 | EF 6 km Z2 — 6 | — | EF 6,5 km Z2 + 6×20" LD — 6,5 | SL 10,5 km Z2 — 10,5 |
| S9 *course* | 28 sept–4 oct | 28 | Éch 2 + 2000 m allure 10 km + 3' + 4×200 m Z5 (r 200 m trot) + RC 1,5 — 6 | EF 4 km Z1 — 4 | — | EF 4 km Z1 + 4×20" LD — 4 | **10 km de St-Maur** : éch 2,5 + course + RC 1,5 — 14 |

Vendredi S9 : pas de Renfo A cette semaine-là, Renfo B déplacé au mercredi, samedi en repos complet.

**Consigne de course St-Maur** (à afficher le jour J) : km 1–3 en Z3 haut, km 4–7 en Z4, km 8–10 libre. Négative split obligatoire, aucun chrono recherché.

Les blocs 1 à 4 (oct 2026 → mai 2027) ne sont pas encore détaillés. Prévois le modèle pour les accueillir et affiche-les comme jalons à venir dans la vue macro.

## Écrans

**1 · Aujourd'hui** (écran d'accueil)
La séance du jour en grand, avec ses intervalles et **les allures calculées**, pas les zones seules. Un bouton pour la marquer faite et ouvrir le formulaire de log. Si c'est un jour de repos, l'afficher clairement plutôt que de laisser un écran vide.

**2 · Semaine**
Les 7 jours, volume cumulé réalisé vs prévu, état de chaque séance. Navigation semaine précédente / suivante.

**3 · Plan**
Vue macro des 9 semaines avec le profil de charge en barres (semaines allégées visuellement distinctes). Puis les blocs 1 à 4 en jalons.

**4 · Zones**
Le tableau des 5 zones avec allures, FC, temps au tour de 400 m. Un champ pour modifier la VMA, avec recalcul instantané. Historique des tests VMA.

**5 · Journal**
Historique des séances loggées. Graphiques : volume hebdo réalisé vs prévu, répartition du temps par zone, allure moyenne en Z2 à FC comparable dans le temps, FC de repos.

**6 · Mesures**
Saisie poids et circonférences. Calcul de la masse grasse par la méthode Navy homme :

```
MG% = 495 / (1.0324 − 0.19077 × log10(taille_cm − cou_cm) + 0.15456 × log10(hauteur_cm)) − 450
```

Courbes dans le temps. Affiche une note : la méthode a une marge de ±3–4 points, c'est la tendance qui compte, pas le niveau.

**7 · Réglages**
Profil, VMA, FC max, export/import JSON complet des données.

## Règles métier à coder

**Recalibrage VMA.** Quand je saisis un test, calcule la nouvelle VMA et propose de l'appliquer :
- demi-Cooper (6 min) : `VMA = distance_m / 100`
- Cooper (12 min) : `VMA = (distance_m − 504.9) / 44.73 / 3.5` puis convertir, ou plus simplement `VMA ≈ distance_m / 200`
- à partir d'une course : estimer via le % de VMA correspondant à la durée d'effort

Toutes les allures du plan se recalculent. Les séances déjà loggées conservent les allures en vigueur à leur date — ne réécris pas l'historique.

**Alertes automatiques**, affichées sur l'écran Aujourd'hui :
- FC de repos supérieure de 7 bpm ou plus à la moyenne des 14 derniers jours, sur 2 matins consécutifs → « semaine allégée −30 % »
- allure moyenne en Z2 dégradée de plus de 20 s/km à FC équivalente → « supprimer la séance de qualité de la semaine »
- fatigue déclarée ≥ 4 sur 2 séances consécutives → alerte
- toute douleur saisie avec une intensité ≥ 3 → alerte
- douleur signalée dans une zone osseuse (tibia, métatarse, hanche) → **alerte rouge bloquante** : arrêt et avis médical
- cumul kilométrique en cours de semaine dépassant de plus de 10 % la semaine précédente → avertissement

**Contrôle de la répartition.** Calcule et affiche le % de volume passé en Z1–Z2. La cible est 80 %. Signale visuellement si on descend sous 75 %.

**Deux séances de qualité maximum par semaine, jamais consécutives.** Si je déplace une séance dans le calendrier et que ça crée deux qualités à la suite, préviens-moi.

## Direction visuelle

Sobre, dense, lisible en extérieur et en plein soleil. Pas de dégradés, pas d'ombres portées, pas d'illustrations. C'est un instrument de travail, pas une app de lifestyle — aucune gamification, aucun badge, aucun message d'encouragement.

- Typographie condensée pour les titres et les chiffres de volume, sans-serif classique pour le corps, **police monospace obligatoire pour toutes les allures, temps et FC** (l'alignement des chiffres compte)
- Fond clair, texte quasi-noir, forte hiérarchie
- La couleur ne sert qu'à une chose : encoder la zone d'intensité. Nulle part ailleurs.
- Cibles tactiles d'au moins 44 px, saisie utilisable d'une main
- Mode sombre en bonus, pas prioritaire

## Ordre de travail

Livre par étapes, en vérifiant que chaque étape tourne avant de passer à la suivante :

1. Setup Vite + TS + Tailwind, structure de dossiers, types
2. `lib/zones.ts` avec les tests unitaires — le socle, à valider en premier
3. Couche de persistance IndexedDB + seed du plan Bloc 0
4. Écrans Aujourd'hui et Semaine
5. Log de séance + écran Journal avec graphiques
6. Écran Zones avec recalibrage VMA
7. Écran Mesures avec Navy
8. Moteur d'alertes
9. PWA : manifest, service worker, test hors ligne
10. Export/import JSON

Écris les tests unitaires de `lib/zones.ts` et du moteur d'alertes. Le reste peut s'en passer.

## Précautions

- Aucune donnée ne sort de l'appareil, jamais.
- L'app affiche des seuils d'alerte issus de mon plan d'entraînement. Elle ne pose aucun diagnostic. Prévois une mention discrète en pied de page : outil de suivi personnel, ne remplace pas un avis médical.
- Prévois le cas du premier lancement sans aucune donnée, et le cas où j'ouvre l'app un jour hors des dates du plan.

Commence par me proposer l'arborescence de fichiers et le contenu de `lib/zones.ts`, que je valide avant que tu construises le reste.
