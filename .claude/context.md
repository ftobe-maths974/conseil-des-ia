# Contexte rapide — Conseil des IA

Jeu pédagogique statique sur GitHub Pages.
Stack : Astro + TypeScript + YAML content.

## Commandes utiles
npm run dev          → localhost:4321
npm run build        → dist/
npm run preview      → preview du build

## Lire le contenu
import { getCollection } from 'astro:content';
const bascules = await getCollection('bascules');

## Filtres fréquents
Par chambre  : .filter(c => c.data.chamber === 'slug-chambre')
Par niveau   : .filter(c => c.data.reversibility === 'red')
Par phase    : .filter(c => c.data.phase === 'bascule')

## URL du handoff mandat (Phase 3 → Phase 4)
/groupe/[deck]/phase-4/[groupe-id]#handoff=BASE64
Décoder : JSON.parse(atob(hash.replace('handoff=','')))
Encoder : btoa(JSON.stringify({text, level, chamber, from}))

## Priorité immédiate
Phase 1 interactive : 3 cartes max par groupe, tri réversibilité,
bouton validation → /groupe/[deck]/phase-2/[id]
```

---

**Arborescence finale :**
```
CONSEIL-DES-IA/
├── CLAUDE.md              ← ici, à la racine
├── .claude/
│   └── context.md         ← ici
├── src/
│   └── content/
│       └── bascules/
│           └── ...
└── ...