# Conseil des IA — Context pour Claude Code

## Ce qu'est ce projet
Application web statique (Astro SSG) pour animer un jeu pédagogique
en présentiel sur les enjeux de l'IA générative. 2h, 4 à 6 groupes
de 4-5 étudiants. Zéro backend, zéro base de données, déployé sur
GitHub Pages.

## Stack
- Astro (SSG, pas de SSR)
- TypeScript strict
- Contenu : fichiers YAML dans src/content/
- Déploiement : GitHub Actions → GitHub Pages
- Zéro localStorage, zéro IndexedDB, zéro WebSocket en V1
- État transmis uniquement via URL hash entre groupes

## Architecture des pages
/                               → accueil, choix animateur/groupe
/animateur/[deck]               → interface projection grand écran
/groupe/[deck]/phase-[n]/[id]   → interface groupe mobile
/carte/[type]/[slug]            → carte individuelle deeplink
/scenario/[slug]                → scénario standalone

## Structure du contenu
src/content/
  bascules/     → cartes Phase 1 (15 fichiers, 3/chambre × 5 chambres)
  tensions/     → cartes Phase 2 (45 fichiers, 9/chambre × 5 chambres, 3 par slot_theme)
  actions/      → cartes Phase 3 (20 fichiers, 4/chambre × 5 chambres)
  scenarios/    → cartes Phase 4 (5 fichiers, 1/chambre × 5 chambres)
  roles/        → fiches rôle Phase 4 (à consolider)
  decks/        → configurations de partie (deck demo existant)

## Circulation des mandats
Toujours circulaire, définie dans le deck :
A → B → C → D → E → A
Jamais choisi en session, jamais aléatoire.
Le groupe destinataire est affiché nommément dans l'interface Phase 3.

## Chaîne d'implications entre chambres (ordre canonique)
delegation → invisibilite → preuve → singularite → metabolisme → delegation
Cet ordre détermine la rotation des groupes dans le deck standard 5 groupes.
Chaque groupe reçoit le mandat de la chambre qui l'implique logiquement.

## Configurations de groupes supportées

4 groupes : retire Singularité vs Standard
  Ordre : Délégation → Invisibilité → Preuve → Métabolisme

5 groupes : version canonique, toutes les chambres
  Ordre : Délégation → Invisibilité → Preuve → Singularité → Métabolisme

6 groupes : duplique Délégation vs Souveraineté
  Les deux groupes Délégation reçoivent des cartes différentes
  de la même chambre (suffixe -A et -B dans les fichiers YAML)

La rotation circulaire et l'assignation chambre/groupe
sont définies dans le fichier deck YAML, jamais calculées
à la volée. L'animateur choisit son deck au lancement.

## Cohérence verticale par chambre
Un groupe travaille la même chambre de la Phase 1 à la Phase 4.
Bascule, tension, action et scénario sont tous filtrés par chamber.
Jamais de mélange inter-chambres sauf décision explicite de l'animateur.

## Mécanique des slots thématiques

Le jeu suit une progression par slots thématiques : **Individu → Organisation → Système**.

- Chaque bascule porte un `slot_theme` (individu / organisation / systeme).
- La Phase 1 détermine la **priorité thématique** : le groupe range les cartes, celle du bas (la plus irréversible) devient le thème dominant. Ce dominant est encodé dans le hash URL → Phase 2.
- La Phase 2 reçoit `#dominant=X&secondary=Y&minor=Z` et réordonne les tensions en **pondération 3/1/1** côté client (3 cartes dominant, 1 secondary, 1 minor).
- La Phase 3 propose des leviers d'action fixes (`lever_type`) dont la pertinence est suggérée par le thème dominant : les actions correspondantes reçoivent un badge **Recommandé**.

Mapping dominant → leviers recommandés :
- individu → recours, limiter
- organisation → conditionner, auditer
- systeme → interdire, auditer

**Distribution du contenu :** chaque chambre a 3 bascules (1 par thème), 9 tensions (3 par thème), et 4 actions couvrant des lever_type variés. Le filtrage 3/1/1 en Phase 2 est pleinement fonctionnel.

## Les 5 phases du jeu
1. Dossiers de Bascule (20 min)
   - 3 cartes tirées depuis bascules/ selon la chambre du groupe (1 par slot_theme)
   - Tâche : trier du plus réversible (haut) au moins réversible (bas)
   - **Carte pertinente = celle du bas de pile** (la plus irréversible selon le groupe)
   - Initialisation de la trajectoire : green → traj=2 / yellow → traj=3 / red → traj=4
   - Output : `#dominant=X&secondary=Y&minor=Z&traj=N` → Phase 2

2. Chambre de Tension (30 min)
   - 9 cartes depuis tensions/ filtrées par chambre, filtrage 3/1/1 selon le dominant de Phase 1
   - Tâche : formuler le point de bascule irréductible en 1 phrase
   - Confirmation de trajectoire : si paquet affiché majoritairement red → traj+1 (borné à 5)
   - Output : `#bascule=BASE64&dominant=X&traj=N` → Phase 3

3. Mandat d'Action (25 min)
   - 4 cartes depuis actions/ compatibles avec la chambre (lever_type varié)
   - Les actions correspondant au thème dominant reçoivent un badge **Recommandé**
   - Tâche : choisir 1 carte, rédiger un mandat (2 champs guidés)
   - Modification de trajectoire : action green → traj-1 / yellow → traj+0 / red → traj+1 (borné 1–5)
   - Output : handoff base64 avec traj intégré → QR code → groupe suivant
   - Règle : impossible d'émettre 2 mandats red consécutifs

4. Audience d'Arbitrage (30 min)
   - 1 scénario depuis scenarios/ + mandat hérité via URL hash (traj inclus)
   - 4 rôles distribués : Décideur / Technicien / Affecté / Contre-pouvoir
   - Si traj >= 4 : afficher une contrainte narrative ("L'infrastructure est déjà verrouillée…")
   - Output : acte en 4 points (autoriser/conditionner/interdire/réexaminer)

5. Délibéré Final (15 min)
   - Restitution des actes de chaque groupe
   - Rédaction d'une "règle fantôme" par groupe

## Transmission des mandats (mécanique clé)
Le mandat du Groupe A est encodé en base64 dans l'URL :
/groupe/[deck]/phase-4/groupe-B#handoff=BASE64

Structure du handoff décodé :
{
  text: string,        // texte du mandat rédigé par le groupe
  level: 'green' | 'yellow' | 'red',  // réversibilité de la carte choisie
  chamber: string,     // chambre du groupe émetteur
  from: string,        // id du groupe émetteur
  traj: number,        // trajectoire finale (1–5) après Phase 3
}

## Schéma YAML — types de cartes

### Bascule (Phase 1)
id, phase, slot, slot_theme, chamber, reversibility, scope, title, situation,
question, tags, facilitator_note?, illustration?, version

### Tension (Phase 2)
id, phase, slot, slot_theme, chamber, reversibility, title, content, data_point?,
question, tags, facilitator_note?, illustration?, version

### Action (Phase 3)
id, phase, slot, lever_type, chamber, reversibility, scope, title, body,
tags, amplifies[], blocks[], compatible_scenarios[],
facilitator_note?, illustration?, version

### Scenario (Phase 4)
id, phase, chamber, title, context, constraint_from_mandat,
roles_briefing{decideur,technicien,affecte,contre_pouvoir},
output_format, tags, difficulty, facilitator_note?, version

### Role (Phase 4)
id, role_type, scenario_id, priority, blind_spot, red_line, version

### Deck (configuration)
id, name, groups[], phases[], card_distribution{}

## Les 5 chambres
- delegation-vs-souverainete   (couleur : bleu)
- preuve-vs-simulation         (couleur : ambre)
- metabolisme-vs-progres       (couleur : vert)
- invisibilite-vs-arbitrage    (couleur : violet)
- singularite-vs-standard      (couleur : corail)

## Règles de réversibilité
green  = réversible, usage individuel, soft
yellow = coûteux à défaire, organisationnel, contractuel
red    = quasi irréversible, infrastructure, législatif, systémique

**La réversibilité d'une carte est une propriété intrinsèque et fixe.**
Elle ne change jamais pendant la partie. Ne jamais modifier la couleur d'une carte en cours de jeu.

Convention d'affichage Phase 1 :
- haut de pile = plus réversible
- bas de pile  = moins réversible / plus irréversible
La carte révélée à la validation est toujours celle du bas (la dernière).
Toute logique lisant la première carte de la pile est incorrecte.

Règle de jeu : un groupe ne peut pas valider un mandat red s'il a
déjà hérité d'un mandat red. Il doit d'abord émettre un green ou yellow.
L'animateur peut override depuis son interface.

## Trajectoire de Réversibilité

La trajectoire est un état dynamique par chambre, distinct de la réversibilité des cartes.

> **Dans Conseil des IA, la réversibilité des cartes est une propriété intrinsèque et fixe.
> La trajectoire de la chambre est un état dynamique, résultant des choix successifs des joueurs.
> Les cartes gardent leur couleur ; la partie, elle, évolue.**

### Indice de trajectoire

Entier borné entre 1 et 5. Pas de décimales. Pas de demi-points.

| Valeur | Label | Sens |
|--------|-------|------|
| 1 | Fluide | Totalement réversible |
| 2 | Engagé | Premiers choix structurants |
| 3 | Contraint | Coûteux à défaire |
| 4 | Critique | Quasi irréversible |
| 5 | Point de non-retour | Verrouillage systémique |

Ces labels sont à centraliser dans `src/lib/chambers.ts` (`TRAJ_LABELS`).

### Évolution par phase

**Phase 1 — Initialisation**
Calculée à partir de la réversibilité de la carte en bas de pile (la plus irréversible selon le groupe) :
- green → traj = 2
- yellow → traj = 3
- red → traj = 4

Propagée dans le hash : `#dominant=X&secondary=Y&minor=Z&traj=N`

**Phase 2 — Confirmation**
La trajectoire peut être aggravée par la composition du paquet de tensions affiché.
Règle V1 : si la majorité des 5 cartes montrées est red → traj = traj + 1 (borné à 5).
La trajectoire ne se calcule pas à partir du texte libre rédigé par les joueurs.

Propagée dans le hash : `#bascule=BASE64&dominant=X&traj=N`

**Phase 3 — Action correctrice ou verrouillage**
Le choix de l'action modifie la trajectoire transmise au groupe suivant :
- action green → traj - 1
- action yellow → traj + 0
- action red → traj + 1

Valeur rebornée entre 1 et 5 avant transmission.

> Cette règle est une approximation de gameplay V1. Elle ne dit pas qu'une action rouge
> est moralement mauvaise. Elle modélise qu'en V1, une action rouge renforce le verrouillage structurel.

Intégrée dans l'objet handoff encodé en base64 (champ `traj`).

**Phase 4 — Conséquence scénarisée**
Le scénario de base ne change pas de fichier ni de structure.
La trajectoire influe sur l'interprétation et les contraintes narratives affichées :
- traj >= 4 → contrainte narrative explicite :
  *"L'infrastructure est déjà verrouillée. Interdire n'est plus une suspension simple, mais un démantèlement coûteux."*
- Le visuel peut intensifier le niveau d'alerte selon traj (couleur, icône).

### Propagation technique

La trajectoire circule exclusivement via le hash URL, sans stockage persistant :
```
Phase 1 → Phase 2 : #dominant=X&secondary=Y&minor=Z&traj=N
Phase 2 → Phase 3 : #bascule=BASE64&dominant=X&traj=N
Phase 3 → Phase 4 : #handoff=BASE64  (traj inclus dans l'objet décodé)
```

### Ce qu'il ne faut PAS faire
- Changer la couleur intrinsèque d'une carte pendant la partie
- Utiliser des demi-points, des pourcentages ou une valeur décimale
- Analyser automatiquement le texte libre des joueurs pour calculer la trajectoire
- Créer un score global unique de session (la trajectoire est locale à la chambre)
- Confondre "rouge" avec "mauvais" au sens moral
- Transformer la trajectoire en tableau de bord complexe

### Philosophie pédagogique
La trajectoire de réversibilité montre que l'irréversibilité n'est pas une fatalité instantanée,
mais le résultat de choix successifs. Le jeu ne modifie pas la nature des cartes ; il donne à voir
comment les décisions accumulées réduisent ou restaurent la possibilité de revenir en arrière.

## Contraintes techniques impératives
- PAS de localStorage ni sessionStorage (non supporté dans l'env cible)
- PAS de backend, PAS de WebSocket en V1
- PAS de base de données
- Tout état de session = mémoire volatile + URL hash
- GitHub Pages only = build statique uniquement, pas de SSR
- Images : WebP/AVIF générées au build, SVG pour illustrations de cartes
- Animations : CSS uniquement, pas de librairie JS d'animation
- QR codes : librairie qrcode npm, côté client uniquement

## Ce qui est fait
- [x] Scaffolding Astro
- [x] config.ts avec schémas Zod pour bascules, tensions, actions, scenarios, decks
- [x] Page index (choix animateur/groupe)
- [x] Page animateur/[deck] (liste des cartes)
- [x] Page groupe/[deck]/phase-1/[id] (affichage cartes)
- [x] GitHub Actions deploy
- [x] Phase 1 : tirage déterministe (3 cartes/chambre), tri ↑↓ interactif,
      bouton validation désactivé puis révélation de la carte du bas (la plus irréversible)
- [x] Phase 2 : 25 cartes tensions YAML (5/chambre × 5 chambres), accordion interactif,
      textarea "point de bascule", navigation vers Phase 3
- [x] Phase 3 : 20 cartes actions YAML (4/chambre × 5 chambres), sélection carte,
      rédaction mandat (2 champs guidés), encodage base64, génération QR code client-side
- [x] Cohérence verticale : CHAMBER_MAP aligné sur la chaîne canonique
      (delegation → invisibilite → preuve → singularite → metabolisme)
- [x] 15 cartes bascules (3/chambre × 5 chambres), plus aucun fallback cross-chamber
- [x] groupe-E (métabolisme) ajouté, rotation 5 groupes A→B→C→D→E→A
- [x] Phase 4 : 5 scénarios YAML (1/chambre), décodage handoff depuis URL hash,
      4 rôles avec briefings, acte d'arbitrage en 4 points, acte final révélé
- [x] /animateur/setup : fiches A4 imprimables avec QR code par groupe
- [x] Refonte Slots & Leviers : slot_theme (individu/organisation/systeme) sur bascules et tensions,
      lever_type sur actions, propagation Phase 1→2→3 via hash, réordonnancement 3/1/1 Phase 2,
      badge Recommandé Phase 3 selon thème dominant
- [x] Enrichissement contenu : 45 tensions (9/chambre × 5 chambres, distribution 3/3/3 par slot_theme),
      filtrage 3/1/1 réel en Phase 2 (cartes hors sélection masquées côté client)

## Ce qui reste à faire (priorité ordre)
1. ~~Corriger le bug Phase 1~~ ✓ corrigé
2. ~~Corriger le bug data-chamber dans setup.astro~~ ✓ corrigé
3. ~~Migration slot : étape 1 (slot dans les cartes) + étape 2 (tri par slot)~~ ✓ fait
4. ~~Migration slot : étape 3 (getStaticPaths deck-driven)~~ ✓ fait
5. ~~Migration slot : étape 4 (centraliser constantes → src/lib/chambers.ts)~~ ✓ fait
6. ~~Refonte Slots & Leviers (slot_theme + lever_type + propagation thématique)~~ ✓ fait
7. ~~Enrichissement contenu : 9 tensions/chambre (3/3/3), filtrage 3/1/1 réel Phase 2~~ ✓ fait
8. Implémenter la trajectoire de réversibilité (traj dans le hash, calcul Phase 1→2→3,
   contrainte narrative Phase 4, TRAJ_LABELS dans chambers.ts)
9. Interface animateur : timer + tableau des mandats reçus + QR distribution
10. Mode clair / lisibilité mobile en pleine lumière

## Conventions de code
- Composants Astro pour tout ce qui est statique
- TypeScript (.tsx) uniquement si interactivité client requise
- Nommage fichiers : kebab-case partout
- Pas de CSS-in-JS, styles dans fichiers .css ou style tag Astro
- getCollection() pour lire le contenu, jamais fs direct

## Conventions UX — règles figées
- Phase 3 : jamais de textarea libre pour le mandat. Toujours 2 champs guidés :
  "parce que" + "à condition que". Le texte encodé dans le handoff est la
  concaténation des deux. Ne pas revenir au champ unique.

# Distribution des groupes — flow animateur

PAS de QR projeté pour la distribution initiale.
PAS de sélection manuelle par les étudiants.

Flow :
1. /animateur/setup → choix nb groupes → génération fiches
2. Impression N fiches A4 (1 par table) avant la session
3. Chaque fiche = nom groupe + chambre + 1 QR code géant
4. URL courte encodée dans le QR : /g/[deck]/[groupe-id]
5. Les étudiants scannent la fiche sur leur table, pas l'écran

## Spec fonctionnelle — Phase 1

### Distribution des cartes
- Tirer exactement 3 cartes depuis bascules/
- Filtrées par la chambre assignée au groupe dans le deck
- Si moins de 3 cartes disponibles pour cette chambre,
  compléter avec des cartes d'autres chambres (reversibility red en priorité)
- Tirage déterministe basé sur group-id + deck-id (pas aléatoire pur)
  pour que deux rechargements donnent les mêmes cartes

### Interaction de tri
- Afficher les 3 cartes empilées verticalement sur mobile
- Chaque carte a deux boutons : ↑ monter / ↓ descendre
- Ordre = du plus réversible (haut) au moins réversible (bas)
- Le badge green/yellow/red est visible mais pas la réponse
  (les étudiants doivent débattre, pas lire la couleur)

### Validation
- Bouton "Valider notre choix" en bas de page
- Désactivé tant que le groupe n'a pas modifié l'ordre au moins une fois
- Au clic : affiche la carte en dernière position (la plus irréversible selon eux)
  avec sa vraie couleur révélée
- Puis bouton "Continuer vers la Phase 2" → /groupe/[deck]/phase-2/[id]

### Ce qu'on ne fait PAS en Phase 1
- Pas de sauvegarde du classement (mémoire volatile suffit)
- Pas de validation animateur requise
- Pas d'affichage du classement des autres groupes

---

## Audit technique actuel

Le projet est un **MVP propre et cohérent** :
- base technique saine (Astro SSG + TypeScript strict + contenu YAML + GitHub Pages),
- structure claire et prévisible,
- modèle de contenu pertinent (YAML par chambre, schémas Zod, 4 phases couvertes),
- approche content-first avec une base éditoriale solide (75 cartes, 5 scénarios, 1 deck).

Cependant, plusieurs zones sont encore trop **hardcodées**, **dupliquées** ou **insuffisamment validées**.
Il faut désormais passer de **prototype intelligent** à **produit robuste**.

### Bugs corrigés

#### ✓ Bug 1 — Phase 1 : mauvaise carte révélée
Fichier : `src/pages/groupe/[session]/[phase]/[groupe].astro`

- **Corrigé** : la validation récupère désormais la dernière carte du DOM
  (`stack.querySelectorAll('.p1-card')[last]`), pas la première.

Règle canonique à respecter partout :
- **haut = plus réversible**
- **bas = moins réversible / plus irréversible**

#### ✓ Bug 2 — Setup animateur : incohérence de `data-chamber`
Fichier : `src/pages/animateur/setup.astro`

- **Corrigé** : suppression du `CHAMBER_KEY` d'abréviation ; `data-chamber` injecte
  directement `g.chamber` (slug complet, ex. `delegation-vs-souverainete`).
- **Règle** : `data-chamber` doit utiliser les **slugs complets canoniques** partout.
  Ne jamais introduire de mapping d'abréviation pour les slugs de chambre.

---

## Dette technique prioritaire

### ✓ Priorité 1 — Centraliser les constantes métier (fait)

`src/lib/chambers.ts` créé : `CHAMBER_LABELS`, `CHAMBER_LABELS_SHORT`, `REV_LABELS`,
`SLOT_THEMES`, `SLOT_THEME_LABELS`, `LEVER_TYPES`, `LEVER_LABELS`, `DOMINANT_TO_LEVERS`.
Toutes les pages importent depuis ce fichier, plus de duplication.

À ajouter lors de l'implémentation de la trajectoire : `TRAJ_LABELS` (Record&lt;number, string&gt;
mappant 1→'Fluide', 2→'Engagé', 3→'Contraint', 4→'Critique', 5→'Point de non-retour').

### ✓ Priorité 2 — Rendre le projet deck-driven (fait)

`getStaticPaths()` dans toutes les phases lit `getCollection('decks')` et passe
`chamber`, `nextGroupe`, `scenarioId` comme props. Aucun mapping hardcodé restant.

### Priorité 3 — Renforcer les schémas Zod

Dans `src/content/config.ts`, les schémas sont trop permissifs sur certains champs :
- `actions.chamber` : `z.string()` libre alors que la liste est connue et fixe
- `decks.groups.chamber` : idem

**Règle** : les champs `chamber` doivent utiliser un **enum canonique partagé**,
pas un `z.string()` libre. Tout champ métier récurrent doit être validé par un type/schéma partagé.

### Priorité 4 — Ajouter une chaîne de contrôle qualité

Avant déploiement, il manque :
- un script `check` (lint + validation de contenu + TypeScript strict),
- une étape CI bloquante avant publication GitHub Pages,
- une validation des contenus YAML contre les schémas Zod,
- une vérification TypeScript stricte (`tsc --noEmit`).

**Objectif** : ne pas déployer uniquement parce que "ça build".
Déployer uniquement si : types OK + contenu OK + cohérence métier OK.

---

## Ligne de conduite pour les prochaines modifications

- **Avant de créer une constante**, vérifier si elle existe déjà (dans les pages ou dans `src/lib/`).
  Si elle existe ailleurs, la déplacer dans `src/lib/`, pas la dupliquer.
- **Ne pas hardcoder** une logique de session/groupe si elle peut venir du `deck` YAML.
- **Ne pas introduire de divergence** entre :
  - schémas de contenu (`config.ts`),
  - constantes frontend (pages Astro, scripts client),
  - valeurs CSS (`global.css`, variables `--chamber-*`),
  - attributs `data-*` (toujours les slugs complets canoniques).
- **Quand une règle métier structure plusieurs fichiers**, la documenter dans `CLAUDE.md`.
- **Préférer les refactors qui réduisent la duplication** plutôt que les correctifs locaux.
  Un correctif local qui laisse une constante dupliquée est une dette, pas une solution.
