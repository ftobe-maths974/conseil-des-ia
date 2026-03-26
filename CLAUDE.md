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
  bascules/     → cartes Phase 1 (6 existantes)
  tensions/     → cartes Phase 2 (à créer, par chambre)
  actions/      → cartes Phase 3 (à créer)
  scenarios/    → cartes Phase 4 (à créer)
  roles/        → fiches rôle Phase 4 (à créer)
  decks/        → configurations de partie (à créer)

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

## Les 5 phases du jeu
1. Dossiers de Bascule (20 min)
   - 3 cartes tirées depuis bascules/ selon la chambre du groupe
   - Tâche : trier du plus réversible au moins réversible
   - Output : "notre carte la plus irréversible" → bouton validation

2. Chambre de Tension (30 min)
   - 5 cartes depuis tensions/ filtrées par chamber du groupe
   - Tâche : formuler le point de bascule irréductible en 1 phrase
   - Output : texte libre sauvé en mémoire volatile

3. Mandat d'Action (25 min)
   - 4 cartes depuis actions/ compatibles avec la chambre
   - Tâche : choisir 1 carte, rédiger un mandat court (1-2 phrases)
   - Output : URL hash encodée en base64 → QR code → groupe suivant
   - Règle : impossible d'émettre 2 mandats red consécutifs

4. Audience d'Arbitrage (30 min)
   - 1 scénario depuis scenarios/ + mandat hérité via URL hash
   - 4 rôles distribués : Décideur / Technicien / Affecté / Contre-pouvoir
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
  from: string         // id du groupe émetteur
}

## Schéma YAML — types de cartes

### Bascule (Phase 1) — 6 fichiers existants
id, phase, chamber, reversibility, scope, title, situation,
question, tags, facilitator_note?, illustration?, version

### Tension (Phase 2) — à créer
id, phase, chamber, reversibility, title, content, data_point?,
question, tags, facilitator_note?, illustration?, version

### Action (Phase 3) — à créer
id, phase, chamber, reversibility, scope, title, body,
tags, amplifies[], blocks[], compatible_scenarios[],
facilitator_note?, illustration?, version

### Scenario (Phase 4) — à créer
id, phase, chamber, title, context, constraint_from_mandat,
roles_briefing{decideur,technicien,affecte,contre_pouvoir},
output_format, tags, difficulty, facilitator_note?, version

### Role (Phase 4) — à créer
id, role_type, scenario_id, priority, blind_spot, red_line, version

### Deck (configuration) — à créer
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

Règle de jeu : un groupe ne peut pas valider un mandat red s'il a
déjà hérité d'un mandat red. Il doit d'abord émettre un green ou yellow.
L'animateur peut override depuis son interface.

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
- [x] 6 cartes bascules en YAML (bascule-001 à bascule-006)
- [x] config.ts avec schéma Zod pour bascules
- [x] Page index (choix animateur/groupe)
- [x] Page animateur/[deck] (liste des cartes)
- [x] Page groupe/[deck]/phase-1/[id] (affichage cartes)
- [x] GitHub Actions deploy
- [x] Phase 1 : tirage déterministe (3 cartes/chambre), tri ↑↓ interactif,
      bouton validation désactivé puis révélation de la carte top
- [x] Phase 2 : 25 cartes tensions YAML (5/chambre × 5 chambres), accordion interactif,
      textarea "point de bascule", navigation vers Phase 3
- [x] Phase 3 : 20 cartes actions YAML (4/chambre × 5 chambres), sélection carte,
      rédaction mandat, encodage base64, génération QR code client-side
- [x] Cohérence verticale : CHAMBER_MAP aligné sur la chaîne canonique
      (delegation → invisibilite → preuve → singularite → metabolisme)
- [x] Couleurs chambres corrigées (preuve=ambre, singularite=corail)
- [x] 15 cartes bascules (3/chambre × 5 chambres), plus aucun fallback cross-chamber
- [x] groupe-E (métabolisme) ajouté, rotation 5 groupes A→B→C→D→E→A
- [x] Phase 4 : 5 scénarios YAML (1/chambre), décodage handoff depuis URL hash,
      4 rôles avec briefings, acte d'arbitrage en 4 points, acte final révélé

## Ce qui reste à faire (priorité ordre)
1. Interface animateur : timer + tableau des mandats reçus + QR distribution
2. Mode clair / lisibilité mobile en pleine lumière

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

Page /animateur/setup à créer :
- 3 boutons : 4 / 5 / 6 groupes
- Génère les fiches avec window.print()
- CSS print : 1 fiche par page A4, QR géant centré
- Bouton "Lancer" → /animateur/[deck-id]

## Spec fonctionnelle — Phase 1 (priorité immédiate)

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
- Au clic : affiche la carte en position 1 (la plus irréversible selon eux)
  avec sa vraie couleur révélée
- Puis bouton "Continuer vers la Phase 2" → /groupe/[deck]/phase-2/[id]

### Ce qu'on ne fait PAS en Phase 1
- Pas de sauvegarde du classement (mémoire volatile suffit)
- Pas de validation animateur requise
- Pas d'affichage du classement des autres groupes