import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CHAMBER_ENUM = z.enum([
  'delegation-vs-souverainete',
  'preuve-vs-simulation',
  'metabolisme-vs-progres',
  'invisibilite-vs-arbitrage',
  'singularite-vs-standard',
]);

const bascules = defineCollection({
  loader: glob({ pattern: '*/bascules/*.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    phase: z.literal('bascule'),
    slot: z.number().int().min(1),
    slot_theme: z.enum(['individu', 'organisation', 'systeme']),
    chamber: CHAMBER_ENUM,
    reversibility: z.enum(['green', 'yellow', 'red']),
    scope: z.enum(['individuel', 'organisationnel', 'systemique']),
    title: z.string(),
    situation: z.string(),
    question: z.string(),
    tags: z.array(z.string()),
    facilitator_note: z.object({
      si_silence: z.string(),
      si_debat_bloque: z.string(),
      si_trop_technique: z.string().optional(),
      relance_cle: z.string(),
    }).optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const tensions = defineCollection({
  loader: glob({ pattern: '*/tensions/*.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    phase: z.literal('tension'),
    slot: z.number().int().min(1),
    slot_theme: z.enum(['individu', 'organisation', 'systeme']),
    chamber: CHAMBER_ENUM,
    reversibility: z.enum(['green', 'yellow', 'red']),
    title: z.string(),
    content: z.string(),
    data_point: z.string().optional(),
    question: z.string(),
    tags: z.array(z.string()),
    suggestions_bascule: z.array(z.string()).optional(),
    facilitator_note: z.object({
      si_silence: z.string(),
      si_debat_bloque: z.string(),
      si_trop_technique: z.string().optional(),
      relance_cle: z.string(),
    }).optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const actions = defineCollection({
  loader: glob({ pattern: '*/actions/*.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    phase: z.literal('action'),
    slot: z.number().int().min(1),
    lever_type: z.enum(['limiter', 'conditionner', 'auditer', 'recours', 'interdire']),
    chamber: CHAMBER_ENUM,
    reversibility: z.enum(['green', 'yellow', 'red']),
    scope: z.enum(['individuel', 'organisationnel', 'systemique']),
    title: z.string(),
    body: z.string(),
    mandat_principe: z.string().optional(),
    tags: z.array(z.string()),
    amplifies: z.array(z.string()).optional(),
    blocks: z.array(z.string()).optional(),
    compatible_scenarios: z.array(z.string()).optional(),
    facilitator_note: z.object({
      si_silence: z.string(),
      si_debat_bloque: z.string(),
      si_trop_technique: z.string().optional(),
      relance_cle: z.string(),
    }).optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const scenarios = defineCollection({
  loader: glob({ pattern: '*/scenarios/*.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    phase: z.literal('scenario'),
    chamber: CHAMBER_ENUM,
    title: z.string(),
    context: z.string(),
    roles_briefing: z.object({
      decideur: z.string(),
      technicien: z.string(),
      affecte: z.string(),
      contre_pouvoir: z.string(),
    }),
    tags: z.array(z.string()),
    difficulty: z.enum(['faible', 'moyen', 'eleve']),
    facilitator_note: z.object({
      si_silence: z.string(),
      si_debat_bloque: z.string(),
      si_trop_technique: z.string().optional(),
      relance_cle: z.string(),
    }).optional(),
    version: z.string().default('1.0'),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: '*/roles/*.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    phase: z.literal('role'),
    title: z.string(),
    description: z.string(),
    objective: z.string(),
    constraints: z.array(z.string()),
    version: z.string().default('1.0'),
  }),
});

const decks = defineCollection({
  loader: glob({ pattern: '*/config.yaml', base: './src/decks' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    domaine: z.string().optional(),
    institution_centrale: z.string().optional(),
    population_affectee: z.string().optional(),
    type_decision: z.string().optional(),
    horizon_temporel: z.string().optional(),
    risque_dominant: z.string().optional(),
    registre_langage: z.string().optional(),
    groups: z.array(z.object({
      id: z.string(),
      chamber: CHAMBER_ENUM,
      receives_from: z.string(),
      scenario_id: z.string(),
    })),
    mandat_circulation: z.record(z.string(), z.string()),
  }),
});

export const collections = {
  bascules,
  tensions,
  actions,
  scenarios,
  roles,
  decks,
};
