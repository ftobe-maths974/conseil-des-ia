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
- La Phase 1 détermine la **priorité thématique** : le groupe range les cartes, celle du haut (la plus irréversible, index 0) devient le thème dominant. Ce dominant est encodé dans le hash URL → Phase 2.
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
   - Tâche : trier du moins réversible (haut) au plus réversible (bas)
   - **Carte pertinente = celle du haut de pile** (la plus irréversible selon le groupe, index 0)
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
id, name, domaine, institution_centrale, population_affectee, type_decision,
horizon_temporel, risque_dominant, registre_langage,
groups[], mandat_circulation{}

## Les 5 chambres
- delegation-vs-souverainete   (couleur : bleu)
- preuve-vs-simulation         (couleur : ambre)
- metabolisme-vs-progres       (couleur : vert)
- invisibilite-vs-arbitrage    (couleur : violet)
- singularite-vs-standard      (couleur : corail)

## Bible éditoriale

### Fiche deck — champs obligatoires

Tout deck doit définir explicitement :

| Champ | Définition |
|---|---|
| `domaine` | Secteur institutionnel (ex : aides sociales, santé, éducation) |
| `institution_centrale` | L'acteur qui décide (ex : collectivité, entreprise, administration) |
| `population_affectee` | Qui subit les décisions (ex : citoyens, agents, usagers) |
| `type_decision` | Ce qui est arbitré (ex : adoption d'outil IA, régulation, déploiement) |
| `horizon_temporel` | Court/moyen/long terme — fixe le registre de réversibilité |
| `risque_dominant` | Le risque principal que le deck explore |
| `registre_langage` | Le ton attendu (ex : institutionnel-pragmatique, ni technocentré ni catastrophiste) |

Toutes les cartes du deck doivent respecter la même institution, la même population et le même domaine.

### Fiches chambre

Chaque chambre a une question mère, un lexique central, un angle mort et une ligne rouge.
Ces contraintes s'appliquent à chaque carte de la chambre — bascule, tension et action.

---

**Délégation vs Souveraineté**
- **Question mère** : À qui ai-je confié ce pouvoir — et puis-je encore le reprendre ?
- **Lexique central** : mandat, dépendance, lock-in, responsabilité diffuse, sous-traitance, maîtrise
- **Voit bien** : chaînes de délégation invisibles, perte progressive de compétence, contrat comme piège
- **Angle mort** : qu'une IA peut parfois décider plus justement qu'un humain biaisé
- **Ligne rouge** : ne pas dériver vers "technologie = mauvais" ou "l'humain doit toujours décider"
- **Forme typique de mandat** : "N'autoriser aucune décision engageante sans possibilité de reprise humaine identifiée"

---

**Preuve vs Simulation**
- **Question mère** : Comment établir qu'une chose est vraie quand tout peut être simulé ?
- **Lexique central** : attestation, certificat, traçabilité, falsifiabilité, authenticité, chaîne de confiance
- **Voit bien** : crise des institutions de certification, charge de preuve, épistémologie du quotidien
- **Angle mort** : que la simulation peut servir à éduquer, créer, modéliser sans tromperie
- **Ligne rouge** : ne pas dériver vers un débat moral général sur l'IA ou la vérité
- **Forme typique de mandat** : "Imposer la traçabilité de toute décision basée sur du contenu potentiellement synthétique"

---

**Métabolisme vs Progrès**
- **Question mère** : Quel prix physique payons-nous réellement pour ce progrès numérique ?
- **Lexique central** : empreinte, ressource, sobriété, énergie, eau, territoire, irréversibilité physique, externalité
- **Voit bien** : conflits d'usage de ressources, invisibilité du coût physique, greenwashing
- **Angle mort** : que l'IA peut aussi optimiser la consommation et réduire le gaspillage
- **Ligne rouge** : ne pas dériver vers un technopessimisme général ou un romantisme pré-numérique
- **Forme typique de mandat** : "Conditionner tout déploiement IA à la publication vérifiable de son empreinte ressource"

---

**Invisibilité vs Arbitrage**
- **Question mère** : Qui décide pour moi — comment, sur quoi, et sans que je le sache ?
- **Lexique central** : profilage, score, opacité, biais, discrimination systémique, explicabilité, voie de recours
- **Voit bien** : effets de discrimination algorithmique, impossible contestation, victimes silencieuses
- **Angle mort** : que la personnalisation peut aussi aider (accessibilité, recommandation médicale pertinente)
- **Ligne rouge** : ne pas confondre biais algorithmique et simple erreur humaine ; ne pas nier la discrimination préexistante
- **Forme typique de mandat** : "Garantir un droit opposable d'explication et de contestation pour toute décision automatisée affectant des droits"

---

**Singularité vs Standard**
- **Question mère** : Ce qui me rend singulier est-il encore viable dans un monde que l'IA homogénéise ?
- **Lexique central** : norme, diversité, edge case, minorité, adaptation, interopérabilité, exception, monoculture
- **Voit bien** : perdants de la standardisation (minorités linguistiques, neurodivergents, pratiques atypiques)
- **Angle mort** : valeur réelle de l'interopérabilité pour l'équité et l'accès universel
- **Ligne rouge** : ne pas dériver vers un rejet de tout standard ou de toute interopérabilité
- **Forme typique de mandat** : "Imposer l'audit des populations mal couvertes avant tout déploiement à grande échelle"

---

### Règles par phase

**Phase 1 — Bascule (micro-situation incarnée)**
- `situation` : 40–80 mots. Un fait ou comportement observable du quotidien. Pas une analyse.
- `question` : 1 phrase, 15–30 mots. Tension ouverte — ne donne pas la réponse implicitement.
- Test : est-ce que quelqu'un dans la salle a déjà vécu ça ou pourrait le vivre demain ?

**Phase 2 — Tension (montée en généralité)**
- `content` : 60–120 mots. Tension structurelle entre deux valeurs légitimes.
- `data_point` : sourcé ou plausiblement sourcé. Pas de statistique floue sans référence.
- `question` : 1 phrase irréductible, 20–35 mots. On peut avoir raison des deux côtés selon ses valeurs.
- Test : la tension résiste-t-elle à un désaccord légitime ?

**Phase 3 — Action (levier institutionnel)**
- `title` : commence par un verbe d'action institutionnel (Interdire / Conditionner / Auditer / Plafonner / Instaurer / Garantir…). Ne décrit jamais le problème — décrit l'intervention.
- `body` : 30–70 mots. Qui fait quoi, dans quel cadre, avec quel effet mesurable.
- Test : un décideur ou un législateur pourrait-il adopter cette mesure telle quelle ?

**Mandat transmis (issu de Phase 3)**
- 1 à 2 phrases, 20–40 mots.
- Format : "parce que [raison]" + optionnel "à condition que [garde-fou]"
- Non sectoriel : doit avoir un sens pour une chambre travaillant sur un autre domaine.
- Test : une chambre différente peut-elle recevoir ce mandat et le débattre sans contexte supplémentaire ?

**Phase 4 — Scénario (crise décisionnelle)**
- `context` : 100–160 mots. Même institution et même population que le deck.
- 4 rôles, chacun avec une **ligne rouge explicite** et un **angle mort nommé**.
- La tension créée par le mandat reçu doit être réelle dans le scénario local.
- Test : le mandat d'une autre chambre crée-t-il une vraie friction avec ce scénario ?

### Règle de conversion mandat

Une carte action n'est pas transmise telle quelle. Elle doit être reformulée en mandat
interchambre selon un principe de gouvernance non sectoriel.

| Lever de la carte | Formulation type du mandat |
|---|---|
| `interdire` | "N'autoriser aucun [X] sans [garantie Y]" |
| `conditionner` | "N'adopter aucun [X] sans que [condition Z] soit garantie" |
| `auditer` | "Exiger la traçabilité et l'auditabilité publique de tout [X]" |
| `recours` | "Garantir un droit opposable de contestation pour toute [décision X]" |
| `limiter` | "Plafonner [X] à ce qui peut être justifié, mesuré et réversible" |

### Anti-patterns

Ce qui doit être refusé à la relecture :

1. **Titre d'action décrivant le problème** au lieu de l'intervention ("Confier le scoring à une IA" ≠ "Interdire la délégation opaque du scoring")
2. **Corps d'action écrit comme description** d'une pratique, pas comme intervention (présent informatif au lieu d'intervention institutionnelle)
3. **`lever_type` incohérent avec le titre** ("Rendre obligatoire" ≠ `interdire` ; "Substituer des déplacements" ≠ `recours` ; "Plafonner" ≠ `conditionner`)
4. **Tension dérivant vers le débat moral général** sur l'IA plutôt qu'une tension de valeurs irréductible
5. **Mandat trop sectoriel** ("les banques doivent…") au lieu d'un principe portable interchambre
6. **Scénario dans un domaine différent** du deck (contamination de domaine)
7. **Chambres partageant le même vocabulaire** (contamination lexicale entre chambres)
8. **Data_point sans source réelle** ou formulé comme "selon une étude" sans référence
9. **Question de Phase 1 donnant une réponse implicite** (bonne question = tension ouverte, les deux positions sont défendables)
10. **Titre ou body sans sujet institutionnel clair** (qui fait quoi ?)

### Matrice de contrôle qualité

À vérifier pour chaque carte avant validation :

- [ ] Cohérence avec le deck : même institution, même population, même horizon
- [ ] Cohérence avec la chambre : lexique de la chambre, pas de contamination inter-chambre
- [ ] Cohérence avec le `slot_theme` (individu / organisation / système)
- [ ] Bon niveau d'abstraction pour la phase (concret P1, structurel P2, institutionnel P3)
- [ ] `lever_type` cohérent avec le titre et le corps (P3)
- [ ] Mandat transmissible à une chambre différente sans perte de sens
- [ ] Absence de jargon technique inaccessible à des étudiants non-spécialistes
- [ ] Absence de redondance avec une autre carte de la même chambre

## Règles de réversibilité
green  = réversible, usage individuel, soft
yellow = coûteux à défaire, organisationnel, contractuel
red    = quasi irréversible, infrastructure, législatif, systémique

**La réversibilité d'une carte est une propriété intrinsèque et fixe.**
Elle ne change jamais pendant la partie. Ne jamais modifier la couleur d'une carte en cours de jeu.

Convention d'affichage Phase 1 :
- haut de pile = moins réversible / plus irréversible (position 1 = la plus importante pour le groupe)
- bas de pile  = plus réversible
La carte révélée à la validation est toujours celle du haut (la première, index 0).
Toute logique lisant la dernière carte de la pile est incorrecte.

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
Calculée à partir de la réversibilité de la carte en haut de pile (la plus irréversible selon le groupe, index 0) :
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
- [x] Trajectoire de réversibilité : TRAJ_LABELS + clampTraj() + initTraj() dans chambers.ts,
      chaîne complète P1→P2→P3→P4 vérifiée et cohérente
- [x] Audit de cohérence : suppression code mort `inherited=red` (règle red-on-red jamais activée),
      `CHAMBER_ENUM` partagé dans config.ts (actions.chamber + decks.groups.chamber)
- [x] Bible éditoriale : fiches deck+chambre, règles phases (word counts), anti-patterns, matrice QC
- [x] Alignement éditorial cartes action : corrections lever_type + framing titre/body
      (action-001, 004, 009, 010, 011, 012, 013, 016, 017)
- [x] Fiche deck demo.yaml enrichie (domaine, institution_centrale, population_affectee,
      type_decision, horizon_temporel, risque_dominant, registre_langage) + schema Zod

## Ce qui reste à faire (priorité ordre)
1. ~~Corriger le bug Phase 1~~ ✓ corrigé
2. ~~Corriger le bug data-chamber dans setup.astro~~ ✓ corrigé
3. ~~Migration slot : étape 1 (slot dans les cartes) + étape 2 (tri par slot)~~ ✓ fait
4. ~~Migration slot : étape 3 (getStaticPaths deck-driven)~~ ✓ fait
5. ~~Migration slot : étape 4 (centraliser constantes → src/lib/chambers.ts)~~ ✓ fait
6. ~~Refonte Slots & Leviers (slot_theme + lever_type + propagation thématique)~~ ✓ fait
7. ~~Enrichissement contenu : 9 tensions/chambre (3/3/3), filtrage 3/1/1 réel Phase 2~~ ✓ fait
8. ~~Implémenter la trajectoire de réversibilité + audit de cohérence~~ ✓ fait
9. ~~Alignement éditorial cartes action + fiche deck demo.yaml~~ ✓ fait
10. Interface animateur : timer + tableau des mandats reçus + QR distribution
11. Mode clair / lisibilité mobile en pleine lumière

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
- **haut = moins réversible / plus irréversible** (position 1, index 0)
- **bas = plus réversible**

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

Ajouté : `TRAJ_LABELS` (Record&lt;number, string&gt;), `clampTraj()`, `initTraj()`.

### ✓ Priorité 2 — Rendre le projet deck-driven (fait)

`getStaticPaths()` dans toutes les phases lit `getCollection('decks')` et passe
`chamber`, `nextGroupe`, `scenarioId` comme props. Aucun mapping hardcodé restant.

### ✓ Priorité 3 — Renforcer les schémas Zod (fait)

`CHAMBER_ENUM` défini en tête de `config.ts` et utilisé dans les 4 collections :
`bascules`, `tensions`, `actions`, `scenarios`, et `decks.groups`.
Plus aucun `z.string()` libre pour les slugs de chambre.

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
