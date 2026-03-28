// ── Constantes métier partagées ───────────────────────────────────────────────
// Source de vérité unique pour les slugs, labels et réversibilité.
// À importer partout — ne jamais redéclarer localement.

export const CHAMBER_SLUGS = [
  'delegation-vs-souverainete',
  'preuve-vs-simulation',
  'metabolisme-vs-progres',
  'invisibilite-vs-arbitrage',
  'singularite-vs-standard',
] as const;

export type ChamberSlug = typeof CHAMBER_SLUGS[number];

/** Labels complets — en-têtes, badges chambre, fiches groupes */
export const CHAMBER_LABELS: Record<string, string> = {
  'delegation-vs-souverainete': 'Délégation vs Souveraineté',
  'preuve-vs-simulation':       'Preuve vs Simulation',
  'metabolisme-vs-progres':     'Métabolisme vs Progrès',
  'invisibilite-vs-arbitrage':  'Invisibilité vs Arbitrage',
  'singularite-vs-standard':    'Singularité vs Standard',
};

/** Labels courts — affichage compact (ex. handoff phase-4) */
export const CHAMBER_LABELS_SHORT: Record<string, string> = {
  'delegation-vs-souverainete': 'Délégation',
  'preuve-vs-simulation':       'Preuve',
  'metabolisme-vs-progres':     'Métabolisme',
  'invisibilite-vs-arbitrage':  'Invisibilité',
  'singularite-vs-standard':    'Singularité',
};

/** Labels de réversibilité */
export const REV_LABELS: Record<string, string> = {
  green:  'Réversible',
  yellow: 'Coûteux',
  red:    'Irréversible',
};

// ── Slots thématiques ─────────────────────────────────────────────────────────

export const SLOT_THEMES = ['individu', 'organisation', 'systeme'] as const;
export type SlotTheme = typeof SLOT_THEMES[number];

export const SLOT_THEME_LABELS: Record<string, string> = {
  individu:     'Individu',
  organisation: 'Organisation',
  systeme:      'Système',
};

// ── Leviers d'action ──────────────────────────────────────────────────────────

export const LEVER_TYPES = ['limiter', 'conditionner', 'auditer', 'recours', 'interdire'] as const;
export type LeverType = typeof LEVER_TYPES[number];

export const LEVER_LABELS: Record<string, string> = {
  limiter:      'Limiter',
  conditionner: 'Conditionner',
  auditer:      'Auditer',
  recours:      'Recours',
  interdire:    'Interdire',
};

/** Leviers recommandés selon le thème dominant */
export const DOMINANT_TO_LEVERS: Record<string, string[]> = {
  individu:     ['recours', 'limiter'],
  organisation: ['conditionner', 'auditer'],
  systeme:      ['interdire', 'auditer'],
};
