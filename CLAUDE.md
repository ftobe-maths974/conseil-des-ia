# Conseil des IA — Documentation architecture

## Vision

Application web statique pour animer un jeu pédagogique en présentiel sur les enjeux de l'IA générative. 2h, 4 à 6 groupes de 4–5 étudiants. Zéro backend, zéro base de données, déployé sur GitHub Pages.

L'application est **content-first** : les decks et les cartes sont des fichiers YAML. Brancher un nouveau deck = créer un dossier. Débrancher = le supprimer. Aucun code à modifier.

---

## Stack & contraintes techniques

- **Astro SSG** — pas de SSR, pas de backend
- **TypeScript strict** — pas de `any` implicite
- **Contenu** — fichiers YAML dans `src/content/`, validés par schémas Zod
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

src/content/
  config.ts                ← schémas Zod + glob loaders (pas de fichiers YAML ici)
```

Chaque deck est un **paquet autonome** dans `src/decks/`. Brancher un nouveau deck = créer un dossier. Débrancher = le supprimer.

Les collections Astro pointent vers `src/decks/` via `glob()` (Content Layer expérimental activé dans `astro.config.mjs`). Astro 4 interdit `glob()` dans `src/content/` — c'est pourquoi le contenu vit dans `src/decks/`.

**Isolation par deck** : les pages filtrent toujours avec `entry.id.startsWith(deckId + '/')`. Les cartes d'un deck ne peuvent pas fuiter dans un autre.

**Contenu du deck demo** : 15 bascules (3/chambre × 5), 45 tensions (9/chambre × 5, 3/slot_theme), 20 actions (4/chambre × 5), 5 scénarios (1/chambre).

---

## Les 5 chambres

| Slug | Label | Couleur CSS |
|---|---|---|
| `delegation-vs-souverainete` | Délégation vs Souveraineté | `--chamber-delegation` (bleu) |
| `invisibilite-vs-arbitrage` | Invisibilité vs Arbitrage | `--chamber-invisibilite` (violet) |
| `preuve-vs-simulation` | Preuve vs Simulation | `--chamber-preuve` (ambre) |
| `singularite-vs-standard` | Singularité vs Standard | `--chamber-singularite` (corail) |
| `metabolisme-vs-progres` | Métabolisme vs Progrès | `--chamber-metabolisme` (vert) |

**Chaîne d'implications canonique** : `delegation → invisibilite → preuve → singularite → metabolisme → delegation`

Cet ordre détermine la rotation des mandats. Un groupe travaille la même chambre de la Phase 1 à la Phase 4 — jamais de mélange inter-chambres.

---

## Mécanique du jeu — 5 phases

### Phase 1 — Dossiers de bascule (20 min)
- 3 cartes bascules filtrées par chambre (1 par `slot_theme`)
- Tâche : trier du **moins réversible en haut** au plus réversible en bas
- La carte du **haut** (index 0) est la plus irréversible selon le groupe → révélée à la validation
- Initialise la trajectoire : `green → traj=2`, `yellow → traj=3`, `red → traj=4`
- Output hash : `#dominant=X&secondary=Y&minor=Z&traj=N` → Phase 2

### Phase 2 — Chambre de tension (30 min)
- 9 tensions filtrées par chambre, réordonnées 3/1/1 selon le `dominant` de Phase 1
- Tâche : formuler le point de bascule irréductible en 1 phrase
- Si majorité rouge dans les 5 cartes affichées → `traj + 1` (borné à 5)
- Output hash : `#bascule=BASE64&dominant=X&traj=N` → Phase 3

### Phase 3 — Mandat d'action (25 min)
- 4 actions filtrées par chambre, badge **Recommandé** selon le thème dominant
- Mapping : `individu → recours, limiter` / `organisation → conditionner, auditer` / `systeme → interdire, auditer`
- Tâche : choisir 1 carte, rédiger un mandat en 2 champs guidés ("parce que" + "à condition que")
- Modification trajectoire : `green → traj-1`, `yellow → traj±0`, `red → traj+1`
- Output : objet handoff base64 encodé → QR code → groupe suivant

### Phase 4 — Audience d'arbitrage (30 min)
- 1 scénario + mandat reçu via `#handoff=BASE64`
- 4 rôles : Décideur / Technicien / Affecté / Contre-pouvoir
- Si `traj ≥ 4` : contrainte narrative affichée ("L'infrastructure est déjà verrouillée…")
- Output : acte en 4 points (autoriser / conditionner / interdire / réexaminer)

### Phase 5 — Délibéré final (15 min)
- Restitution des actes de chaque groupe, rédaction d'une "règle fantôme"

---

## Transmission des mandats

Le mandat circule via URL hash, jamais stocké :

```
Phase 1 → Phase 2 : #dominant=X&secondary=Y&minor=Z&traj=N
Phase 2 → Phase 3 : #bascule=BASE64&dominant=X&traj=N
Phase 3 → Phase 4 : #handoff=BASE64
```

Structure du handoff décodé :
```ts
{
  text: string,              // concaténation des 2 champs guidés
  level: 'green'|'yellow'|'red',
  chamber: string,           // chambre du groupe émetteur
  from: string,              // id du groupe émetteur
  traj: number,              // trajectoire 1–5
}
```

**Circulation** : toujours circulaire, définie dans le deck YAML (`mandat_circulation`). Jamais calculée à la volée, jamais aléatoire.

---

## Trajectoire de réversibilité

Entier borné 1–5, local à chaque chambre, jamais de score global.

| Valeur | Label |
|--------|-------|
| 1 | Fluide |
| 2 | Engagé |
| 3 | Contraint |
| 4 | Critique |
| 5 | Point de non-retour |

Constantes et helpers dans `src/lib/chambers.ts` : `TRAJ_LABELS`, `clampTraj()`, `initTraj()`.

**Règle fondamentale** : la réversibilité d'une carte est une propriété **fixe et intrinsèque**. La trajectoire est **dynamique** et résulte des choix successifs. Ne jamais modifier la couleur d'une carte en cours de partie.

---

## Schémas YAML

### Bascule (Phase 1)
```yaml
id: bascule-xxx
phase: bascule
slot: 1          # ordre d'affichage dans la chambre
slot_theme: individu | organisation | systeme
chamber: [slug chambre]
reversibility: green | yellow | red
scope: individuel | organisationnel | systemique
title: "..."
situation: "..."   # 40–80 mots, fait observable du quotidien
question: "..."    # 15–30 mots, tension ouverte
tags: [...]
facilitator_note:  # optionnel
  si_silence: "..."
  si_debat_bloque: "..."
  si_trop_technique: "..."  # optionnel
  relance_cle: "..."
version: "1.0"
```

### Tension (Phase 2)
```yaml
id: tension-xxx
phase: tension
slot: 1–9
slot_theme: individu | organisation | systeme
chamber: [slug chambre]
reversibility: green | yellow | red
title: "..."
content: "..."      # 60–120 mots, tension structurelle entre deux valeurs
data_point: "..."   # optionnel, sourcé
question: "..."     # 20–35 mots, irréductible
tags: [...]
suggestions_bascule: [...]  # optionnel
facilitator_note: { ... }   # optionnel
version: "1.0"
```

### Action (Phase 3)
```yaml
id: action-xxx
phase: action
slot: 1–4
lever_type: limiter | conditionner | auditer | recours | interdire
chamber: [slug chambre]
reversibility: green | yellow | red
scope: individuel | organisationnel | systemique
title: "Verbe institutionnel + objet"   # décrit l'intervention, jamais le problème
body: "..."    # 30–70 mots, qui fait quoi avec quel effet mesurable
tags: [...]
amplifies: [...]         # optionnel
blocks: [...]            # optionnel
compatible_scenarios: [] # optionnel
facilitator_note: { ... } # optionnel
version: "1.0"
```

### Scénario (Phase 4)
```yaml
id: scenario-xxx
phase: scenario
chamber: [slug chambre]
title: "..."
context: "..."   # 100–160 mots, même institution/population que le deck
roles_briefing:
  decideur: "..."
  technicien: "..."
  affecte: "..."
  contre_pouvoir: "..."
tags: [...]
difficulty: faible | moyen | eleve
facilitator_note: { ... }  # optionnel
version: "1.0"
```

### Deck (configuration)
```yaml
id: mon-deck
name: "Nom affiché"
domaine: "secteur institutionnel"
institution_centrale: "qui décide"
population_affectee: "qui subit"
type_decision: "ce qui est arbitré"
horizon_temporel: "court/moyen/long terme"
risque_dominant: "risque principal exploré"
registre_langage: "ton attendu"
groups:
  - id: groupe-A
    chamber: delegation-vs-souverainete
    receives_from: groupe-E
    scenario_id: scenario-del
  # ...
mandat_circulation:
  groupe-A: groupe-B
  # ...
```

---

## Bible éditoriale

### Philosophie des chambres

Chaque chambre a une **question mère**, un **lexique central**, un **angle mort** et une **ligne rouge**.

---

**Délégation vs Souveraineté**
- **Question mère** : À qui ai-je confié ce pouvoir — et puis-je encore le reprendre ?
- **Lexique** : mandat, dépendance, lock-in, responsabilité diffuse, sous-traitance, maîtrise
- **Angle mort** : qu'une IA peut parfois décider plus justement qu'un humain biaisé
- **Ligne rouge** : ne pas dériver vers "technologie = mauvais" ou "l'humain doit toujours décider"
- **Mandat type** : "N'autoriser aucune décision engageante sans possibilité de reprise humaine identifiée"

**Invisibilité vs Arbitrage**
- **Question mère** : Qui décide pour moi — comment, sur quoi, et sans que je le sache ?
- **Lexique** : profilage, score, opacité, biais, discrimination systémique, explicabilité, voie de recours
- **Angle mort** : que la personnalisation peut aussi aider (accessibilité, recommandation médicale)
- **Ligne rouge** : ne pas confondre biais algorithmique et erreur humaine ; ne pas nier la discrimination préexistante
- **Mandat type** : "Garantir un droit opposable d'explication et de contestation pour toute décision automatisée"

**Preuve vs Simulation**
- **Question mère** : Comment établir qu'une chose est vraie quand tout peut être simulé ?
- **Lexique** : attestation, certificat, traçabilité, falsifiabilité, authenticité, chaîne de confiance
- **Angle mort** : que la simulation peut servir à éduquer, créer, modéliser sans tromperie
- **Ligne rouge** : ne pas dériver vers un débat moral général sur l'IA ou la vérité
- **Mandat type** : "Imposer la traçabilité de toute décision basée sur du contenu potentiellement synthétique"

**Singularité vs Standard**
- **Question mère** : Ce qui me rend singulier est-il encore viable dans un monde que l'IA homogénéise ?
- **Lexique** : norme, diversité, edge case, minorité, adaptation, interopérabilité, exception, monoculture
- **Angle mort** : valeur réelle de l'interopérabilité pour l'équité et l'accès universel
- **Ligne rouge** : ne pas dériver vers un rejet de tout standard ou de toute interopérabilité
- **Mandat type** : "Imposer l'audit des populations mal couvertes avant tout déploiement à grande échelle"

**Métabolisme vs Progrès**
- **Question mère** : Quel prix physique payons-nous réellement pour ce progrès numérique ?
- **Lexique** : empreinte, ressource, sobriété, énergie, eau, territoire, irréversibilité physique, externalité
- **Angle mort** : que l'IA peut aussi optimiser la consommation et réduire le gaspillage
- **Ligne rouge** : ne pas dériver vers un technopessimisme général ou un romantisme pré-numérique
- **Mandat type** : "Conditionner tout déploiement IA à la publication vérifiable de son empreinte ressource"

---

### Règles d'écriture par phase

**Phase 1 — Bascule**
- `situation` : 40–80 mots. Fait ou comportement observable du quotidien. Pas une analyse.
- `question` : 15–30 mots. Tension ouverte — ne donne pas la réponse implicitement.
- Test : est-ce que quelqu'un dans la salle a déjà vécu ça ou pourrait le vivre demain ?

**Phase 2 — Tension**
- `content` : 60–120 mots. Tension structurelle entre deux valeurs légitimes.
- `data_point` : sourcé ou plausiblement sourcé. Pas de statistique floue sans référence.
- `question` : 20–35 mots. On peut avoir raison des deux côtés selon ses valeurs.
- Test : la tension résiste-t-elle à un désaccord légitime ?

**Phase 3 — Action**
- `title` : commence par un verbe institutionnel (Interdire / Conditionner / Auditer / Plafonner / Garantir…). Décrit l'intervention, jamais le problème.
- `body` : 30–70 mots. Qui fait quoi, dans quel cadre, avec quel effet mesurable.
- Test : un décideur ou législateur pourrait-il adopter cette mesure telle quelle ?

**Mandat transmis**
- 1–2 phrases, 20–40 mots. Format : "parce que [raison]" + optionnel "à condition que [garde-fou]"
- Non sectoriel — doit avoir un sens pour une chambre travaillant sur un autre domaine.

**Phase 4 — Scénario**
- `context` : 100–160 mots. Même institution et même population que le deck.
- 4 rôles, chacun avec une ligne rouge explicite et un angle mort nommé.
- La tension créée par le mandat reçu doit créer une vraie friction dans le scénario.

### Conversion mandat

| `lever_type` | Formulation type |
|---|---|
| `interdire` | "N'autoriser aucun [X] sans [garantie Y]" |
| `conditionner` | "N'adopter aucun [X] sans que [condition Z] soit garantie" |
| `auditer` | "Exiger la traçabilité et l'auditabilité publique de tout [X]" |
| `recours` | "Garantir un droit opposable de contestation pour toute [décision X]" |
| `limiter` | "Plafonner [X] à ce qui peut être justifié, mesuré et réversible" |

### Anti-patterns à rejeter

1. **Titre d'action décrivant le problème** — le titre décrit l'intervention institutionnelle
2. **Corps d'action descriptif** — pas "une banque adopte X", mais "il est interdit de / toute entité doit"
3. **`lever_type` incohérent avec le titre** — "Rendre obligatoire" ≠ `interdire`, "Plafonner" ≠ `conditionner`
4. **Tension dérivant vers le débat moral général** — la tension doit être entre deux valeurs légitimes
5. **Mandat trop sectoriel** — "les banques doivent…" n'est pas portable interchambre
6. **Scénario dans un domaine différent du deck** — contamination de domaine
7. **Chambres partageant le même vocabulaire** — contamination lexicale inter-chambres
8. **`data_point` sans source réelle** — pas de "selon une étude" sans référence
9. **Question de Phase 1 donnant une réponse implicite** — les deux positions doivent être défendables
10. **Sujet institutionnel absent** — qui fait quoi ?

### Matrice de contrôle qualité

- [ ] Cohérence deck : même institution, même population, même horizon
- [ ] Cohérence chambre : lexique propre à la chambre, sans contamination
- [ ] Cohérence `slot_theme` : individu / organisation / système
- [ ] Niveau d'abstraction correct pour la phase (concret P1, structurel P2, institutionnel P3)
- [ ] `lever_type` cohérent avec le titre et le body (P3)
- [ ] Mandat transmissible à une chambre différente sans perte de sens
- [ ] Accessible à des étudiants non-spécialistes (pas de jargon technique opaque)
- [ ] Pas de redondance avec une autre carte de la même chambre

---

## Conventions de code

**Architecture**
- `getCollection()` pour lire le contenu, jamais `fs` direct
- `getStaticPaths()` dans toutes les phases lit les decks et passe `chamber`, `nextGroupe`, `scenarioId` comme props — aucun mapping hardcodé
- Filtrage par deck : `entries.filter(e => e.id.startsWith(deckId + '/'))` — fonctionne car les IDs générés par `glob()` ont la forme `demo/bascules/bascule-001`
- Lookup scénario par champ YAML : `scenarios.find(s => s.data.id === scenarioId)` — jamais par entry ID

**Constantes métier**
- Toutes centralisées dans `src/lib/chambers.ts` : `CHAMBER_LABELS`, `CHAMBER_LABELS_SHORT`, `REV_LABELS`, `SLOT_THEME_LABELS`, `LEVER_LABELS`, `DOMINANT_TO_LEVERS`, `TRAJ_LABELS`, `clampTraj()`, `initTraj()`
- Jamais redéclarées localement dans une page

**CSS**
- Tokens dans `src/styles/global.css` — deux thèmes via `[data-theme="dark"]` / `[data-theme="light"]`
- `data-chamber` utilise toujours les **slugs complets canoniques** (ex. `delegation-vs-souverainete`), jamais d'abréviation
- Pas de CSS-in-JS, styles dans `<style>` tag Astro ou fichier `.css`
- Éléments créés dynamiquement par JS → styles dans `<style is:global>` (Astro scoped CSS ne s'applique pas aux éléments `createElement()`)

**UX figée**
- Phase 1 : haut de pile = plus irréversible (index 0 = dominant), carte révélée = index 0
- Phase 3 : jamais de textarea libre pour le mandat — toujours 2 champs guidés "parce que" + "à condition que"
- Distribution des groupes : fiches A4 imprimées avant session, QR scanné sur la table — pas de QR projeté ni sélection manuelle

---

## Ajouter un deck

1. Créer `src/decks/mon-deck/config.yaml` avec tous les champs obligatoires
2. Créer les sous-dossiers `bascules/`, `tensions/`, `actions/`, `scenarios/` dans ce même dossier
3. Peupler avec les fichiers YAML en respectant les schémas et la bible éditoriale
4. Le build génère automatiquement toutes les routes — aucun code à modifier

---

## Migration : structure par paquets (terminée)

Migration effectuée. Structure résultante : `src/decks/[deck-id]/config.yaml` + sous-dossiers par phase.

**Note technique** : Astro 4 interdit `glob()` dans `src/content/` — le contenu vit donc dans `src/decks/` (hors zone réservée). Le Content Layer expérimental est activé dans `astro.config.mjs`.

Les schémas Zod, les filtres `startsWith(deckId + '/')`, et toutes les URLs générées sont inchangés.
