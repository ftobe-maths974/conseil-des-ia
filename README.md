# Conseil des IA

Jeu pédagogique en présentiel sur les points de bascule de l'intelligence artificielle.

## Stack

- **Astro** (SSG) + TypeScript
- **Contenu** : fichiers YAML dans `src/content/`
- **Déploiement** : GitHub Actions → GitHub Pages
- **Zéro base de données, zéro backend**

## Développement

```bash
npm install
npm run dev
```

Le site est accessible sur `http://localhost:4321`

## Déploiement

Push sur `main` → build automatique → déployé sur GitHub Pages.

## Structure

```
src/
  content/
    bascules/       → cartes Phase 1
    tensions/       → cartes Phase 2
    actions/        → cartes Phase 3
    scenarios/      → cartes Phase 4
    roles/          → fiches rôle Phase 4
    decks/          → configurations de partie
  components/       → composants Astro réutilisables
  layouts/          → layouts de page
  pages/            → routing
  styles/           → CSS global et tokens
```
