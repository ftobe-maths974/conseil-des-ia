# Conseil des IA — Architecture

## Vision

Jeu pédagogique en présentiel sur l'IA générative. 2h, 4–6 groupes. Zéro backend, déployé sur GitHub Pages.
**Content-first** : brancher un deck = créer `src/decks/mon-deck/`. Aucun code à modifier.

## Stack

- **Astro 4 SSG** + Content Layer expérimental (`astro.config.mjs`)
- **TypeScript strict**, pas de `any` implicite
- Contenu YAML dans `src/decks/` (hors `src/content/` — contrainte Astro 4)
- État de session : URL hash uniquement — pas de localStorage/sessionStorage pour l'état de jeu
- CSS uniquement, pas de lib JS d'animation

## Structure du contenu

```
src/decks/
  demo/           config.yaml  bascules/  tensions/  actions/  scenarios/
  care-triage/    ← santé publique, CareFlow / GHR
  glamour-glitch/ ← creator economy, OmniStream / FAME-GEN
  terminus/       ← protection sociale, L'Agence / CITIZEN-SCAN

src/content/config.ts   ← schémas Zod + glob loaders
```

Isolation par deck : `entry.id.startsWith(deckId + '/')` — IDs de la forme `care-triage/bascules/bascule-ct-001`.

## Pages

```
/                                → accueil
/animateur/[deck]                → interface animateur
/animateur/setup                 → fiches A4 imprimables
/groupe/[deck]/phase-1/[groupe]  → Phase 1 : bascules
/groupe/[deck]/phase-2/[groupe]  → Phase 2 : tensions
/groupe/[deck]/phase-3/[groupe]  → Phase 3 : actions + mandat
/groupe/[deck]/phase-4/[groupe]  → Phase 4 : scénario
```

Routes générées via `getStaticPaths()` depuis les decks YAML. Aucune route hardcodée.

## Les 5 chambres

| Slug | Label | Couleur |
|---|---|---|
| `delegation-vs-souverainete` | Délégation vs Souveraineté | `--chamber-delegation` (bleu) |
| `invisibilite-vs-arbitrage` | Invisibilité vs Arbitrage | `--chamber-invisibilite` (violet) |
| `preuve-vs-simulation` | Preuve vs Simulation | `--chamber-preuve` (ambre) |
| `singularite-vs-standard` | Singularité vs Standard | `--chamber-singularite` (corail) |
| `metabolisme-vs-progres` | Métabolisme vs Progrès | `--chamber-metabolisme` (vert) |

**Chaîne canonique** : `delegation → invisibilite → preuve → singularite → metabolisme → delegation`

## Mécanique — résumé des phases

| Phase | Durée | Entrée | Sortie hash |
|---|---|---|---|
| 1 — Bascules | 20 min | 3 cartes triées par irréversibilité | `#dominant=X&secondary=Y&minor=Z&traj=N` |
| 2 — Tensions | 30 min | 9 tensions, reordonnées selon dominant | `#bascule=BASE64&dominant=X&traj=N` |
| 3 — Action + mandat | 25 min | 4 actions, badge Recommandé | `#handoff=BASE64` |
| 4 — Scénario | 30 min | Scénario + mandat reçu | acte à 4 points |

**Phase 1** : haut de pile (index 0 DOM) = carte la plus irréversible = **dominant**.
`initTraj` : `green→2`, `yellow→3`, `red→4`. Vérifié dans `src/lib/chambers.ts`.

**Trajectoire 1–5** : Fluide / Engagé / Contraint / Critique / Point de non-retour.

## Schémas YAML

### Bascule
```yaml
id: bascule-xxx          phase: bascule
slot: 1|2|3              slot_theme: individu|organisation|systeme
chamber: [slug]          reversibility: green|yellow|red
scope: individuel|organisationnel|systemique
title: "..."
situation: "..."         # 40–80 mots, micro-scène observable
question: "..."          # 15–30 mots, tension ouverte
tags: [...]              version: "1.0"
```

### Tension
```yaml
id: tension-xxx          phase: tension
slot: 1–9                slot_theme: individu|organisation|systeme
chamber: [slug]          reversibility: green|yellow|red
title: "..."
content: "..."           # 60–120 mots, dilemme entre deux valeurs légitimes
data_point: "..."        # optionnel, sourcé
question: "..."          # 20–35 mots, désaccord légitime possible
tags: [...]              version: "1.0"
```

### Action
```yaml
id: action-xxx           phase: action
slot: 1–4                lever_type: limiter|conditionner|auditer|recours|interdire
chamber: [slug]          reversibility: green|yellow|red
scope: individuel|organisationnel|systemique
title: "Verbe institutionnel + objet"
body: "..."              # 30–70 mots, qui fait quoi avec quel effet mesurable
mandat_principe: "..."   # OBLIGATOIRE sauf deck demo — voir .claude/deck-recipe.md
tags: [...]              version: "1.0"
```

### Scénario
```yaml
id: scenario-xxx         phase: scenario
chamber: [slug]          difficulty: faible|moyen|eleve
title: "..."
context: "..."           # 100–160 mots, même institution/population, crise décisionnelle
roles_briefing:
  decideur: "..."   technicien: "..."   affecte: "..."   contre_pouvoir: "..."
tags: [...]              version: "1.0"
```

### Deck (config.yaml)
```yaml
id: mon-deck             name: "Nom affiché"
domaine / institution_centrale / population_affectee / type_decision
horizon_temporel / risque_dominant / registre_langage
groups:
  - id: groupe-A
    chamber: delegation-vs-souverainete
    receives_from: groupe-E
    scenario_id: scenario-xxx
mandat_circulation:
  groupe-A: groupe-B
  # …
```

## Conventions de code

- `getCollection()` pour lire le contenu, jamais `fs` direct
- Filtrage : `entries.filter(e => e.id.startsWith(deckId + '/'))`
- Lookup scénario : `scenarios.find(s => s.data.id === scenarioId)` — jamais par entry ID
- Constantes métier dans `src/lib/chambers.ts` uniquement — jamais redéclarées localement
- `data-chamber` utilise toujours les slugs complets canoniques
- Éléments JS créés dynamiquement → `<style is:global>` (Astro scoped CSS ne s'applique pas)
- Phase 3 : toujours 2 champs guidés "parce que" + "à condition que" — jamais textarea libre

## Ajouter un deck

```bash
mkdir -p src/decks/mon-deck/{bascules,tensions,actions,scenarios}
# Créer config.yaml, puis suivre le protocole dans .claude/deck-recipe.md
npm run build   # routes générées automatiquement
```

> Recette complète, bibles éditoriales et anti-patterns : **`.claude/deck-recipe.md`**
