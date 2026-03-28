# Conseil des IA — Documentation architecture

## Vision

Application web statique pour animer un jeu pédagogique en présentiel sur les enjeux de l'IA générative. 2h, 4 à 6 groupes de 4–5 étudiants. Zéro backend, zéro base de données, déployé sur GitHub Pages.

L'application est **content-first** : les decks et les cartes sont des fichiers YAML. Brancher un nouveau deck = créer un dossier. Débrancher = le supprimer. Aucun code à modifier.

---

## Stack & contraintes techniques

- **Astro SSG** — pas de SSR, pas de backend
- **TypeScript strict** — pas de `any` implicite
- **Contenu** — fichiers YAML dans `src/decks/`, validés par schémas Zod
- **Déploiement** — GitHub Actions → GitHub Pages (build statique uniquement)
- **État de session** — mémoire volatile + URL hash uniquement. Pas de localStorage, sessionStorage, IndexedDB ni WebSocket pour l'état de jeu
- **QR codes** — librairie `qrcode` npm, côté client uniquement
- **Animations** — CSS uniquement, aucune librairie JS d'animation
- **Thème** — dark/light via `data-theme` sur `<html>`, détection par `prefers-color-scheme`, toggle stocké en `sessionStorage`

---

## Architecture des pages

```
/                                 → accueil : choix rôle → deck → groupe
/animateur/[deck]                 → interface animateur : timer, circuit mandats, notes
/animateur/setup                  → génération des fiches A4 imprimables par groupe
/groupe/[deck]/phase-1/[groupe]   → Phase 1 : dossiers de bascule (mobile)
/groupe/[deck]/phase-2/[groupe]   → Phase 2 : chambre de tension
/groupe/[deck]/phase-3/[groupe]   → Phase 3 : mandat d'action
/groupe/[deck]/phase-4/[groupe]   → Phase 4 : audience d'arbitrage
```

Toutes les routes sont générées statiquement via `getStaticPaths()` depuis les decks YAML. Aucune route hardcodée.

---

## Structure du contenu

```
src/decks/
  demo/
    config.yaml            ← configuration du deck (groupes, circulation)
    bascules/              ← cartes Phase 1
    tensions/              ← cartes Phase 2
    actions/               ← cartes Phase 3
    scenarios/             ← cartes Phase 4
  care-triage/             ← santé publique, univers CareFlow/GHR
    config.yaml
    bascules/ tensions/ actions/ scenarios/
  glamour-glitch/          ← creator economy, univers OmniStream/FAME-GEN
    config.yaml
    bascules/ tensions/ actions/ scenarios/

src/content/
  config.ts                ← schémas Zod + glob loaders (pas de fichiers YAML ici)
```

Chaque deck est un **paquet autonome**. Brancher = créer un dossier. Débrancher = le supprimer.

Les collections Astro pointent vers `src/decks/` via `glob()` (Content Layer expérimental activé dans `astro.config.mjs`). Astro 4 interdit `glob()` dans `src/content/` — c'est pourquoi le contenu vit dans `src/decks/`.

**Isolation par deck** : `entry.id.startsWith(deckId + '/')`. Les cartes ne peuvent pas fuiter entre decks.

---

## Les 5 chambres

| Slug | Label | Couleur CSS |
|---|---|---|
| `delegation-vs-souverainete` | Délégation vs Souveraineté | `--chamber-delegation` (bleu) |
| `invisibilite-vs-arbitrage` | Invisibilité vs Arbitrage | `--chamber-invisibilite` (violet) |
| `preuve-vs-simulation` | Preuve vs Simulation | `--chamber-preuve` (ambre) |
| `singularite-vs-standard` | Singularité vs Standard | `--chamber-singularite` (corail) |
| `metabolisme-vs-progres` | Métabolisme vs Progrès | `--chamber-metabolisme` (vert) |

**Chaîne canonique** : `delegation → invisibilite → preuve → singularite → metabolisme → delegation`

Un groupe travaille la même chambre de la Phase 1 à la Phase 4 — jamais de mélange inter-chambres.

---

## Mécanique du jeu — 5 phases

### Phase 1 — Dossiers de bascule (20 min)
- 3 cartes bascules filtrées par chambre (1 par `slot_theme`), triées par `slot` croissant
- Tâche : **mettre la plus irréversible en haut** (position 1), la plus réversible en bas (position 3)
- La carte du **haut (index 0 du DOM, position 1) = dominant** → révélée à la validation
- `initTraj()` : `green → traj=2`, `yellow → traj=3`, `red → traj=4`
- Output hash : `#dominant=X&secondary=Y&minor=Z&traj=N` → Phase 2

> **Vérification code** : `allCardEls2[0]` = premier élément du DOM = haut de pile = dominant. `initTraj(topRev)` confirmé dans `src/lib/chambers.ts`. Pas de contradiction.

### Phase 2 — Chambre de tension (30 min)
- 9 tensions filtrées par chambre, réordonnées 3/1/1 selon le `dominant` de Phase 1
- Tâche : formuler le point de bascule irréductible en 1 phrase
- Si majorité rouge dans les 5 cartes affichées → `traj + 1` (borné à 5)
- Output hash : `#bascule=BASE64&dominant=X&traj=N` → Phase 3

### Phase 3 — Mandat d'action (25 min)
- 4 actions filtrées par chambre, badge **Recommandé** selon le thème dominant
- Mapping : `individu → recours, limiter` / `organisation → conditionner, auditer` / `systeme → interdire, auditer`
- Tâche : choisir 1 carte, rédiger un mandat en 2 champs guidés ("parce que" + "à condition que")
- Le `mandat_principe` de la carte choisie sert de base éditoriale à la reformulation
- Modification trajectoire : `green → traj-1`, `yellow → traj±0`, `red → traj+1`
- Output : objet handoff base64 encodé → QR code → groupe suivant

### Phase 4 — Audience d'arbitrage (30 min)
- 1 scénario + mandat reçu via `#handoff=BASE64`
- 4 rôles : Décideur / Technicien / Affecté / Contre-pouvoir
- Si `traj ≥ 4` : contrainte narrative affichée
- Output : acte en 4 points (autoriser / conditionner / interdire / réexaminer)

### Phase 5 — Délibéré final (15 min)
- Restitution des actes de chaque groupe, rédaction d'une "règle fantôme"

---

## Transmission des mandats

```
Phase 1 → Phase 2 : #dominant=X&secondary=Y&minor=Z&traj=N
Phase 2 → Phase 3 : #bascule=BASE64&dominant=X&traj=N
Phase 3 → Phase 4 : #handoff=BASE64
```

Structure du handoff :
```ts
{
  text: string,              // concaténation des 2 champs guidés
  level: 'green'|'yellow'|'red',
  chamber: string,
  from: string,
  traj: number,              // 1–5
}
```

**Circulation** : circulaire, définie dans `mandat_circulation` du deck YAML. Jamais calculée à la volée.

---

## Trajectoire de réversibilité

| Valeur | Label |
|--------|-------|
| 1 | Fluide |
| 2 | Engagé |
| 3 | Contraint |
| 4 | Critique |
| 5 | Point de non-retour |

`src/lib/chambers.ts` : `TRAJ_LABELS`, `clampTraj()`, `initTraj()`.

**Règle** : la réversibilité d'une carte est fixe. La trajectoire est dynamique. Ne jamais modifier la couleur d'une carte en cours de partie.

---

## Schémas YAML

### Bascule (Phase 1)
```yaml
id: bascule-xxx
phase: bascule
slot: 1|2|3
slot_theme: individu|organisation|systeme
chamber: [slug]
reversibility: green|yellow|red
scope: individuel|organisationnel|systemique
title: "..."
situation: "..."   # 40–80 mots, micro-scène observable du quotidien
question: "..."    # 15–30 mots, tension ouverte, les deux positions défendables
tags: [...]
facilitator_note: { si_silence, si_debat_bloque, relance_cle }  # optionnel
version: "1.0"
```

### Tension (Phase 2)
```yaml
id: tension-xxx
phase: tension
slot: 1–9
slot_theme: individu|organisation|systeme
chamber: [slug]
reversibility: green|yellow|red
title: "..."
content: "..."      # 60–120 mots, dilemme entre deux valeurs légitimes
data_point: "..."   # optionnel, sourcé
question: "..."     # 20–35 mots, désaccord légitime possible
tags: [...]
version: "1.0"
```

### Action (Phase 3)
```yaml
id: action-xxx
phase: action
slot: 1–4
lever_type: limiter|conditionner|auditer|recours|interdire
chamber: [slug]
reversibility: green|yellow|red
scope: individuel|organisationnel|systemique
title: "Verbe institutionnel + objet"
body: "..."              # 30–70 mots, qui fait quoi avec quel effet mesurable
mandat_principe: "..."   # principe portable interchambre — OBLIGATOIRE (sauf deck demo legacy)
tags: [...]
version: "1.0"
```

### Scénario (Phase 4)
```yaml
id: scenario-xxx
phase: scenario
chamber: [slug]
title: "..."
context: "..."   # 100–160 mots, même institution/population que le deck, crise décisionnelle
roles_briefing:
  decideur: "..."
  technicien: "..."
  affecte: "..."
  contre_pouvoir: "..."
tags: [...]
difficulty: faible|moyen|eleve
version: "1.0"
```

### Deck (configuration)
```yaml
id: mon-deck
name: "Nom affiché"
domaine: "..."
institution_centrale: "..."
population_affectee: "..."
type_decision: "..."
horizon_temporel: "..."
risque_dominant: "..."
registre_langage: "..."
groups:
  - id: groupe-A
    chamber: delegation-vs-souverainete
    receives_from: groupe-E
    scenario_id: scenario-xxx
mandat_circulation:
  groupe-A: groupe-B
  # ...
```

---

## Doctrine éditoriale : un deck = un univers fermé

Un deck n'est pas un assemblage de cartes thématiquement proches. C'est une **crise systémique cohérente** vécue à travers cinq chambres.

Exigences minimales pour tout nouveau deck :
- **une institution centrale unique** (ex. GHR, OmniStream Studios)
- **une technologie/système central unique** (ex. CareFlow, FAME-GEN)
- **une logique industrielle unique** et un macro-conflit implicite
- **cinq chambres qui lisent la même crise sous cinq angles différents**
- **mandats interchambres organiques** — chaque mandat_principe doit créer une friction réelle dans le scénario de la chambre suivante

---

## Règle Action → Mandat (`mandat_principe`)

Une carte action n'est **jamais** transmise telle quelle. Elle doit être reformulée en `mandat_principe` : un principe de gouvernance portable.

| Champ | Rôle |
|---|---|
| `title` + `body` | Action locale, située, institutionnelle, spécifique au domaine |
| `mandat_principe` | Principe portable, non sectoriel à l'intérieur du deck, formulé comme règle/droit/limite/garantie |

**Gabarits autorisés** :
- `Rendre visible…` / `Garantir…` / `Exiger…` / `Interdire tout usage de… sans…`
- `Préserver…` / `Imposer…` / `Conditionner…` / `Plafonner…`

**À refuser** :
- Nom de module logiciel précis comme mandat
- Action trop locale impossible à réutiliser interchambre
- Consigne purement technique sans portée institutionnelle
- Mandat limité à une spécialité/plateforme si la chambre suivante ne peut pas l'exploiter

**Exemples** :
- Action : "Ajouter un bouton d'audit sur chaque clip généré" → `mandat_principe` : "Garantir la traçabilité intégrale de l'origine de tout signal synthétique exposé au public"
- Action : "Permettre aux doubleurs de retirer leur voix d'un modèle" → `mandat_principe` : "Interdire tout usage d'identité vocale sans clé de consentement révocable"

---

## Bible éditoriale — chambres (générique)

### Délégation vs Souveraineté
- **Question mère** : À qui ai-je confié ce pouvoir — et puis-je encore le reprendre ?
- **Lexique** : mandat, dépendance, lock-in, responsabilité diffuse, sous-traitance, maîtrise
- **Angle mort** : une IA peut parfois décider plus justement qu'un humain biaisé
- **Ligne rouge** : ne pas dériver vers "technologie = mauvais"
- **Mandat type** : "N'autoriser aucune décision engageante sans possibilité de reprise humaine identifiée"

### Invisibilité vs Arbitrage
- **Question mère** : Qui décide pour moi — comment, sur quoi, et sans que je le sache ?
- **Lexique** : profilage, score, opacité, biais, discrimination systémique, explicabilité, voie de recours
- **Angle mort** : la personnalisation peut aussi aider
- **Ligne rouge** : ne pas confondre biais algorithmique et erreur humaine
- **Mandat type** : "Garantir un droit opposable d'explication et de contestation pour toute décision automatisée"

### Preuve vs Simulation
- **Question mère** : Comment établir qu'une chose est vraie quand tout peut être simulé ?
- **Lexique** : attestation, certificat, traçabilité, falsifiabilité, authenticité, chaîne de confiance
- **Angle mort** : la simulation peut servir à éduquer, créer, modéliser sans tromperie
- **Ligne rouge** : ne pas dériver vers un débat moral général sur l'IA
- **Mandat type** : "Imposer la traçabilité de toute décision basée sur du contenu potentiellement synthétique"

### Singularité vs Standard
- **Question mère** : Ce qui me rend singulier est-il encore viable dans un monde que l'IA homogénéise ?
- **Lexique** : norme, diversité, edge case, minorité, adaptation, interopérabilité, exception, monoculture
- **Angle mort** : valeur réelle de l'interopérabilité pour l'équité
- **Ligne rouge** : ne pas dériver vers un rejet de tout standard
- **Mandat type** : "Imposer l'audit des populations mal couvertes avant tout déploiement à grande échelle"

### Métabolisme vs Progrès
- **Question mère** : Quel prix physique payons-nous réellement pour ce progrès numérique ?
- **Lexique** : empreinte, ressource, sobriété, énergie, irréversibilité physique, externalité
- **Angle mort** : l'IA peut optimiser la consommation et réduire le gaspillage
- **Ligne rouge** : ne pas dériver vers un technopessimisme général
- **Mandat type** : "Conditionner tout déploiement IA à la publication vérifiable de son empreinte ressource"

---

## Mini-bible deck `care-triage` (univers CareFlow/GHR)

**Institution** : groupement hospitalier régional (GHR) public
**Technologie** : `CareFlow` — suite IA pilotant triage, orientation, priorisation des lits, suivi des patients
**Macro-conflit** : CareFlow devient le centre de gravité des décisions cliniques ; les décisions humaines s'alignent sur ses recommandations sans toujours en connaître les critères
**Registre** : institutionnel, clinique, concret — jamais technobéat, jamais apocalyptique
**Règle** : toutes les cartes restent dans le monde CareFlow/hôpital public/GHR

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | Qui décide encore de l'orientation, de la priorité ou du refus ? | validation humaine, autonomie clinique, responsabilité médicale | N'autoriser aucune décision d'orientation sans validation humaine traçable |
| Invisibilité | Qu'est-ce qui reste visible, traçable et contestable dans les choix de CareFlow ? | score, justification, audit, journalisation, recours | Garantir la traçabilité et la contestabilité des scores qui affectent les patients |
| Preuve | Qu'est-ce qu'une sortie CareFlow prouve vraiment ? | seuil de fiabilité, attestation, protocole de contradiction | Exiger un seuil de fiabilité documenté et un protocole de contradiction |
| Singularité | Que deviennent les patients atypiques dans un système piloté par des modèles ? | exception, atypie, dérogation motivée | Imposer une dérogation motivée pour tout profil hors-standard |
| Métabolisme | Que consomme, rigidifie ou rend irréversible le déploiement de CareFlow ? | dépendance opérationnelle, soutenabilité, capacité autonome résiduelle | Conditionner tout déploiement à la préservation d'une capacité autonome documentée |

---

## Mini-bible deck `glamour-glitch` (univers OmniStream/FAME-GEN)

**Institution** : `OmniStream Studios`
**Technologie** : `FAME-GEN` — suite IA qui génère scripts/trailers/clips/thumbnails, clone voix/visage/gestes/style, produit des avatars 24h/24, pilote visibilité algorithmique, classe/booste/enterre/démonétise, peut "faire rejouer" des talents vivants ou morts
**Population** : créateurs, influenceurs, acteurs, doubleurs, monteurs, scénaristes, ayants droit, fans, petits studios
**Enjeu** : à qui appartiennent le visage, la voix, le style, la performance et la valeur symbolique quand FAME-GEN peut les simuler, les industrialiser et les monétiser mieux que leur propriétaire ?
**Registre** : nerveux, contemporain, précis, hype mais crédible — jamais boomer, jamais Black Mirror paresseux
**Tagline** : *À qui appartient ton visage, ta voix et ta vibe quand FAME-GEN peut les monétiser mieux que toi ?*
**Règle** : toutes les cartes restent dans le monde OmniStream/FAME-GEN — pas de références directes à TikTok, Twitch, Netflix comme entités séparées

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | À quel moment les créateurs cessent-ils réellement de décider eux-mêmes ? | ghostwriting, autonomie créative, pipeline, délégation de performance, perte de talent | N'autoriser aucune performance synthétique sans validation explicite du créateur identifié |
| Invisibilité | Pourquoi tel créateur est-il boosté, enterré, shadowbanné ou démonétisé ? | ranking, shadowban, démonétisation, boost, opacité, règles cachées | Garantir la lisibilité et la contestabilité des critères de classement et de sanction |
| Preuve | Comment sait-on si une voix, un visage ou une performance dans OmniStream est authentique ? | deepfake, clone vocal, authenticité, certification, consentement, traçabilité, faux-vrai | Interdire tout usage d'identité de créateur sans clé de consentement traçable et révocable |
| Singularité | Que devient la créativité humaine quand FAME-GEN optimise tout pour le contenu moyen ? | standardisation, formatage, contenu moyen, edge case, vibe homogène, créateur interchangeable | Imposer un audit des profils hors-standard avant toute décision de déclassement |
| Métabolisme | Quel coût physique et infrastructurel cache l'usine à célébrités synthétiques ? | GPU, énergie, verrouillage industriel, dépendance, coût caché, soutenabilité | Conditionner tout déploiement FAME-GEN à la publication de son empreinte ressource |

### Logique de circulation `glamour-glitch`

| Passage | Problème transmis | Pourquoi la chambre suivante est la bonne destinataire |
|---|---|---|
| Délégation → Invisibilité | Si la création est déléguée à FAME-GEN, qu'est-ce qui reste visible du travail humain, du crédit, de la responsabilité ? | La chambre Invisibilité doit se demander comment auditer un système qui classe sans montrer ses critères |
| Invisibilité → Preuve | Si le ranking est opaque, comment établir la preuve d'une origine, d'un boost, d'un clone ? | La chambre Preuve doit se demander ce qui prouve qu'une performance est humaine ou synthétique |
| Preuve → Singularité | Si tout doit être certifié et labellisé, que devient ce qui échappe au label ou à la norme ? | La chambre Singularité doit se demander si les créateurs atypiques peuvent être certifiés et visibles |
| Singularité → Métabolisme | Si on veut préserver l'exception créative, quel coût industriel et énergétique accepte-t-on ? | La chambre Métabolisme doit se demander si l'infrastructure FAME-GEN peut absorber l'exception |
| Métabolisme → Délégation | Si l'infrastructure est lourde et dépendante, que peut-on encore déléguer sans perdre la capacité de créer autrement ? | La chambre Délégation doit se demander si on peut reprendre le contrôle quand on est captif de FAME-GEN |

---

## Mini-bible deck `terminus` (univers L'Agence/CITIZEN-SCAN)

**Institution** : `L'Agence` — guichet unifié concentrant accès aux aides, logement, mobilité, bourses, restauration, priorités de dossier, bonus/malus de conformité, détection d'anomalies
**Technologie** : `CITIZEN-SCAN` — IA calculant un score d'utilité sociale, interprétant activité/inactivité/rythmes de vie/traces, agrégeant signaux de mobilité/consommation/présence/capteurs, priorisant ou dépriorisant l'accès aux droits selon conformité présumée
**Population** : étudiants, précaires, familles, aidants, jeunes actifs, personnes en logement instable, usagers dépendants d'un pass/bourse/dossier
**Macro-conflit** : le temps mort, le sommeil, l'inactivité, la solidarité informelle et la vie non standard deviennent suspects, coûteux ou illégitimes quand l'IA mesure tout
**Thèse** : Qui a encore le droit de ne pas être immédiatement lisible, rentable, traçable, actif et conforme ?
**Registre** : brut, sec, précis, quotidien, digne — jamais misérabiliste, jamais argot décoratif, jamais dystopie gadget
**Règle de ton** : écrire comme si le système existait presque déjà — une extrapolation froide de logiques déjà en place

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | À qui a-t-on confié le pouvoir de dire si ma vie est conforme, méritante ou recevable ? | score, effacement de l'agent humain, verrouillage du dossier, responsabilité dissoute | N'autoriser aucune décision de dépriorisation sans qu'un agent humain identifiable puisse la réviser |
| Invisibilité | Pourquoi ai-je été sanctionné, ralenti ou bloqué sans comprendre sur quelle base ? | opacité punitive, micro-sanctions, anomalie, shadowban administratif, file invisible | Interdire toute sanction automatisée sans explication humaine compréhensible et voie de recours identifiée |
| Preuve | Qu'est-ce qu'il faut prouver pour exister comme sujet légitime quand la machine interprète tout ? | preuve de présence, silence, inactivité, suspicion, biométrie, trace, présomption de fraude | Garantir que l'absence de signal numérique ne soit jamais interprétée par défaut comme fraude ou désengagement |
| Singularité | Que devient une vie si elle ne rentre pas dans les cases du modèle ? | solidarité informelle, hébergement non standard, transfert au pays, rythme atypique, situation socialement réelle mais administrativement illisible | Reconnaître les formes de solidarité et les rythmes de vie non standard dans l'évaluation des droits |
| Métabolisme | Combien coûte réellement le contrôle algorithmique de la survie, et que détruit-il en prétendant optimiser ? | coût du contrôle, inflation bureaucratique, saturation des agents, surveillance plus chère que l'aide | Conditionner tout déploiement de CITIZEN-SCAN à la démonstration que son coût est inférieur au bénéfice social produit |

### Logique de circulation `terminus`

| Passage | Problème transmis | Pourquoi la chambre suivante est la bonne destinataire |
|---|---|---|
| Délégation → Invisibilité | Si CITIZEN-SCAN décide sans agent humain identifiable, les sanctions deviennent opaques et déresponsabilisées | La chambre Invisibilité doit se demander comment contester une sanction quand on ne sait pas qui l'a décidée |
| Invisibilité → Preuve | Si le système sanctionne sans expliquer, les personnes doivent sans cesse prouver qu'elles méritent encore leurs droits | La chambre Preuve doit se demander ce qui constitue une preuve acceptable pour un système qui interprète tout comme signal |
| Preuve → Singularité | Si les preuves légitimes sont standardisées, les vies non standard deviennent suspectes ou illisibles | La chambre Singularité doit se demander que faire quand la vie réelle d'une personne ne peut pas être prouvée selon les standards du système |
| Singularité → Métabolisme | Plus on force les vies réelles dans des catégories fixes, plus le coût de surveillance et de rectification explose | La chambre Métabolisme doit se demander si le système peut absorber les exceptions sans devenir plus coûteux que l'aide elle-même |
| Métabolisme → Délégation | Quand surveiller coûte plus cher que protéger, faut-il rendre le pouvoir à des instances humaines locales ? | La chambre Délégation doit se demander qui reprend la décision et avec quel mandat si l'automatisation est abandonnée |

### Anti-patterns spécifiques `terminus`

- **Misérabilisme** — la pauvreté n'est pas un décor ni un gimmick narratif
- **Argot décoratif** — pas d'"argot de banlieue" plaqué comme accessoire de style
- **Dystopie gadget** — situations trop absurdes pour être politiquement crédibles
- **Moralisation grossière** — pas de "la tech est méchante", pas de "les pauvres sont toujours purs"
- **Science-fiction lointaine** — écrire comme si le système existait presque déjà
- **Absence de dignité** — le deck peut être dur, les personnages doivent conserver une dignité narrative
- **Abstractivité sociologique** — pas de jargon académique, pas de cartes qui ressemblent à des cours
- **Patchwork de monde** — tout passe par L'Agence et CITIZEN-SCAN, pas un collage de systèmes disparates

---

## Règles d'écriture par phase

### Phase 1 — Bascule
- `situation` : 40–80 mots. Micro-scène incarnée, observable, concrète, située dans l'univers du deck
- `question` : 15–30 mots. Tension ouverte — les deux positions défendables
- Test : quelqu'un dans la salle a-t-il déjà vécu ça ou pourrait-il le vivre demain ?

### Phase 2 — Tension
- `content` : 60–120 mots. Dilemme institutionnel entre deux valeurs légitimes
- `data_point` : sourcé ou plausiblement sourcé
- `question` : 20–35 mots. On peut avoir raison des deux côtés

### Phase 3 — Action
- `title` : verbe institutionnel (Interdire / Conditionner / Auditer / Plafonner / Garantir…)
- `body` : 30–70 mots. Qui fait quoi, dans quel cadre, avec quel effet mesurable
- `mandat_principe` : principe portable interchambre — obligatoire
- Test : un décideur ou législateur pourrait-il adopter cette mesure telle quelle ?

### Phase 4 — Scénario
- `context` : 100–160 mots. Même institution et même population que le deck
- 4 rôles avec angle mort et ligne rouge
- Le scénario est une **collision** entre la logique locale de la chambre, le mandat reçu et la trajectoire

### Conversion `lever_type` → mandat

| `lever_type` | Formulation type |
|---|---|
| `interdire` | "N'autoriser aucun [X] sans [garantie Y]" |
| `conditionner` | "N'adopter aucun [X] sans que [condition Z] soit garantie" |
| `auditer` | "Exiger la traçabilité et l'auditabilité publique de tout [X]" |
| `recours` | "Garantir un droit opposable de contestation pour toute [décision X]" |
| `limiter` | "Plafonner [X] à ce qui peut être justifié, mesuré et réversible" |

---

## Anti-patterns universels

1. **Titre d'action décrivant le problème** — le titre décrit l'intervention institutionnelle
2. **Corps d'action descriptif** — "il est interdit de / toute entité doit", pas "une banque adopte X"
3. **`lever_type` incohérent avec le titre** — "Rendre obligatoire" ≠ `interdire`
4. **Tension dérivant vers le débat moral général** — deux valeurs légitimes en conflit
5. **Mandat trop sectoriel** — pas portable interchambre
6. **Scénario dans un domaine différent du deck** — contamination de domaine
7. **Chambres partageant le même vocabulaire** — contamination lexicale
8. **`data_point` sans source réelle**
9. **Question de Phase 1 donnant une réponse implicite**
10. **Sujet institutionnel absent** — qui fait quoi ?
11. **`mandat_principe` absent** sur une action d'un deck non-demo
12. **`mandat_principe` trop technique ou trop local**

### Anti-patterns spécifiques `glamour-glitch`

13. **Patchwork de plateformes** — tout passe par OmniStream/FAME-GEN, pas des références directes à des plateformes réelles comme entités séparées
14. **Ton boomer** — pas d'extériorité face aux codes du feed/clip/stream/fandom
15. **Black Mirror paresseux** — dystopie sans ancrage institutionnel et économique
16. **Hype vide** — pas d'architecture systémique derrière la référence culturelle
17. **Scénario Phase 4 trop faible** — doit être une vraie collision, pas une suite fade de Phase 3
18. **Absence de tension sur consentement, visibilité, preuve, standardisation ou coût**

---

## Matrice de contrôle qualité

- [ ] Cohérence deck : même institution, même population, même horizon
- [ ] Cohérence chambre : lexique propre, sans contamination
- [ ] Cohérence `slot_theme` : individu / organisation / système
- [ ] Niveau d'abstraction correct (concret P1, structurel P2, institutionnel P3)
- [ ] `lever_type` cohérent avec titre et body
- [ ] `mandat_principe` portable interchambre
- [ ] Accessible à des étudiants non-spécialistes
- [ ] Pas de redondance dans la même chambre

---

## Protocole de génération d'un nouveau deck

Ordre **obligatoire** :

1. **Bible du deck** — univers, institution, technologie centrale, population, macro-conflit, registre
2. **5 scénarios (Phase 4)** — les collisions finales ; chaque scénario nomme la friction attendue avec le mandat qu'il recevra
3. **20 actions + `mandat_principe`** — vérifier que chaque mandat peut créer une friction dans le scénario de la chambre suivante
4. **Audit de circulation** : tableau chambre émettrice / mandat_principe / chambre réceptrice / nature de la friction / verdict (fort / acceptable / trop local / trop abstrait / à réécrire)
5. **15 bascules** — préparer le terrain
6. **45 tensions** — approfondir les dilemmes
7. **Audit de cohérence global**

Le deck n'est pas validé tant que les 5 passages interchambres ne sont pas jugés cohérents.

**Decks de référence** : `care-triage` (santé publique), `glamour-glitch` (creator economy).

---

## Conventions de code

**Architecture**
- `getCollection()` pour lire le contenu, jamais `fs` direct
- `getStaticPaths()` dans toutes les phases lit les decks et passe `chamber`, `nextGroupe`, `scenarioId` comme props — aucun mapping hardcodé
- Filtrage par deck : `entries.filter(e => e.id.startsWith(deckId + '/'))` — IDs de la forme `glamour-glitch/bascules/bascule-gg-001`
- Lookup scénario : `scenarios.find(s => s.data.id === scenarioId)` — jamais par entry ID

**Constantes métier**
- Toutes dans `src/lib/chambers.ts` : `CHAMBER_LABELS`, `CHAMBER_LABELS_SHORT`, `REV_LABELS`, `SLOT_THEME_LABELS`, `LEVER_LABELS`, `DOMINANT_TO_LEVERS`, `TRAJ_LABELS`, `clampTraj()`, `initTraj()`
- Jamais redéclarées localement

**CSS**
- Tokens dans `src/styles/global.css`
- `data-chamber` utilise toujours les slugs complets canoniques
- Pas de CSS-in-JS
- Éléments créés dynamiquement → `<style is:global>`

**UX figée**
- Phase 1 : position 1 (haut) = plus irréversible = dominant ; carte révélée = index 0 du DOM
- Phase 3 : 2 champs guidés "parce que" + "à condition que" — jamais de textarea libre
- Distribution des groupes : fiches A4 imprimées, QR scanné sur la table

---

## Ajouter un deck

1. Créer `src/decks/mon-deck/config.yaml`
2. Créer les sous-dossiers `bascules/`, `tensions/`, `actions/`, `scenarios/`
3. Suivre le **protocole de génération** (scénarios → actions → audit → bascules → tensions)
4. `npm run build` — les routes sont générées automatiquement

---

## Migration structure par paquets (terminée)

`src/decks/` (hors `src/content/`) via `glob()` + Content Layer expérimental (`astro.config.mjs`). Les schémas Zod, les filtres `startsWith()` et les URLs sont inchangés.
