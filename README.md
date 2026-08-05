# Programme 10 km

Application web de suivi d'entraînement running, utilisable au quotidien depuis un
téléphone. **Hors ligne**, sans compte, sans backend, sans base distante. Toutes les
données restent sur l'appareil (IndexedDB).

Exigence centrale : **les allures ne sont jamais écrites en dur**. Elles dérivent
toutes d'un unique paramètre — la VMA. Modifier la VMA recalcule instantanément tout
le plan.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- IndexedDB via `idb`
- PWA (manifest + service worker) — installable, fonctionne en mode avion
- Recharts pour les graphiques
- Aucun appel réseau au runtime

## Commandes

```bash
npm install       # dépendances
npm run dev       # serveur de dev
npm test          # tests unitaires (zones + moteur d'alertes)
npm run build     # build statique dans dist/
npm run preview   # sert le build
```

Le dossier `dist/` est déployable en statique (Vercel, Netlify, ou servi en local).

## Architecture

- `src/lib/zones.ts` — moteur de zones (pur, testé). Le socle : toutes les
  conversions VMA → vitesse → allure → temps au tour 400 m, les 5 zones, les allures
  dérivées (10 km / 5 km / marathon), le formatage `m:ss`.
- `src/lib/sessionPace.ts` — résout une séance en allures concrètes depuis la VMA.
- `src/lib/vma.ts` — recalibrage VMA (demi-Cooper, Cooper, course).
- `src/lib/navy.ts` — masse grasse méthode US Navy (homme).
- `src/lib/alerts.ts` — moteur d'alertes (pur, testé) : FC de repos, allure Z2,
  fatigue, douleur (blocage en zone osseuse), pic de charge, répartition Z1–Z2,
  espacement des séances de qualité.
- `src/data/seedBloc0.ts` — le plan Bloc 0 (9 semaines) + jalons Blocs 1–4.
- `src/db/` — persistance IndexedDB, seed idempotent, export/import JSON.
- `src/store/AppContext.tsx` — état global réactif.
- `src/screens/` — Aujourd'hui, Semaine, Plan, Zones, Journal, Mesures, Réglages.

## Écrans

1. **Aujourd'hui** — la séance du jour avec ses allures calculées, alertes, repères.
2. **Semaine** — les 7 jours, volume réalisé vs prévu, navigation.
3. **Plan** — vue macro 9 semaines (profil de charge) + jalons Blocs 1–4.
4. **Zones** — tableau des 5 zones (allure / FC / temps 400 m), édition VMA, historique des tests.
5. **Journal** — historique loggé + graphiques (volume, répartition par zone, allure Z2, FC de repos).
6. **Mesures** — poids, circonférences, masse grasse Navy, courbes.
7. **Réglages** — profil, VMA, FC max, export/import JSON.

## Précaution

Outil de suivi personnel. Les seuils affichés proviennent d'un plan d'entraînement et
ne constituent pas un avis médical. Aucune donnée ne sort de l'appareil.
