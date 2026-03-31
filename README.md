# Conseil des IA

**Jeu de délibération en présentiel sur la gouvernance de l'IA.** 2h, 4–6 groupes, zéro backend.

**→ [Jouer la démo](https://ftobe-maths974.github.io/conseil-des-ia)**

---

Chaque groupe reçoit un rôle dans une institution réelle — hôpital, agence sociale, studio de création, office d'identité numérique. Une IA a été déployée. Elle produit des décisions. Maintenant il faut les gouverner.

En quatre phases, les joueurs classent des irréversibilités, écartent des dossiers, adoptent un mandat de gouvernance, puis l'incarnent dans un scénario de crise transmis par le groupe voisin. Le jeu ne demande pas "est-ce que l'IA est bonne ou mauvaise" — il demande **qui décide, sur quelle base, avec quelle procédure, et qui répond quand ça dérape**.

---

## Les quatre univers

| Deck | Institution | Système IA | Enjeu central |
|---|---|---|---|
| **care-triage** | Groupement hospitalier régional | CareFlow | Qui a encore le dernier mot sur l'orientation d'un patient ? |
| **terminus** | L'Agence (protection sociale) | CITIZEN-SCAN | Qui a le droit de ne pas être immédiatement lisible et conforme ? |
| **glamour-glitch** | OmniStream Studios | FAME-GEN | À qui appartient ton visage, ta voix et ta vibe quand une IA peut les monétiser mieux que toi ? |
| **trace-zero** | Office de Garantie du Réel | SIGMA-ID | Comment prouver qu'on est réel quand tout peut être simulé — et qui décide qu'on ne l'est plus ? |

---

## Mécanique en 4 phases (2h)

```
Phase 1 — Bascules     (20 min)   3 micro-scènes, classées par irréversibilité
Phase 2 — Tensions     (30 min)   5 dossiers, écarter jusqu'à n'en garder qu'un
Phase 3 — Actions      (25 min)   4 mandats institutionnels, en choisir un
Phase 4 — Scénario     (30 min)   Crise + mandat hérité du groupe voisin
```

La trajectoire du groupe (Fluide → Engagé → Contraint → Critique → Point de non-retour) se construit automatiquement depuis les choix. En Phase 4, chaque groupe reçoit le mandat adopté par le groupe précédent dans la chaîne — et doit s'en débrouiller dans son propre scénario.

**Zéro backend.** L'état circule dans les URL hash. Les QR codes entre groupes encodent le handoff en Base64. Déployable sur GitHub Pages, fonctionne sans réseau une fois chargé.

---

## Structure du projet

```
src/
  decks/
    care-triage/          ← santé publique
    terminus/             ← protection sociale
    glamour-glitch/       ← creator economy
    trace-zero/           ← identité numérique
      bascules/           ← 15 cartes Phase 1
      tensions/           ← 45 cartes Phase 2
      actions/            ← 20 cartes Phase 3
      scenarios/          ← 5 scénarios Phase 4
      config.yaml         ← groupes, chambres, circulation
  content/config.ts       ← schémas Zod + glob loaders
  pages/                  ← routes Astro SSG
  lib/chambers.ts         ← constantes métier
```

Chaque deck est isolé. Brancher un nouveau deck = créer `src/decks/mon-deck/` et ses fichiers YAML. Aucun code à modifier.

---

## Démarrage rapide

```bash
npm install
npm run dev
# → http://localhost:4321
```

```bash
npm run build   # génère le site statique
npm run preview # prévisualise le build
```

Push sur `main` → build GitHub Actions → déployé automatiquement sur GitHub Pages.

---

## Ajouter un deck

```bash
mkdir -p src/decks/mon-deck/{bascules,tensions,actions,scenarios}
# Créer config.yaml, puis les cartes YAML par phase
npm run build
```

La recette complète, les bibles éditoriales par chambre et les anti-patterns sont dans [`.claude/deck-recipe.md`](.claude/deck-recipe.md).

---

## Stack

- **Astro 4 SSG** + Content Layer expérimental
- **TypeScript strict** — pas de `any` implicite
- **CSS uniquement** — pas de lib JS d'animation
- **État de session** : URL hash — pas de localStorage
- Contenu YAML dans `src/decks/` (hors `src/content/` — contrainte Astro 4)
