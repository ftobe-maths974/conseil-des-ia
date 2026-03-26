import { defineCollection, z } from 'astro:content';

const bascules = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    phase: z.literal('bascule'),
    chamber: z.enum([
      'delegation-vs-souverainete',
      'preuve-vs-simulation',
      'metabolisme-vs-progres',
      'invisibilite-vs-arbitrage',
      'singularite-vs-standard',
    ]),
    reversibility: z.enum(['green', 'yellow', 'red']),
    scope: z.enum(['individuel', 'organisationnel', 'systemique']),
    title: z.string(),
    situation: z.string(),
    question: z.string(),
    tags: z.array(z.string()),
    facilitator_note: z.string().optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const tensions = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    phase: z.literal('tension'),
    chamber: z.enum([
      'delegation-vs-souverainete',
      'preuve-vs-simulation',
      'metabolisme-vs-progres',
      'invisibilite-vs-arbitrage',
      'singularite-vs-standard',
    ]),
    reversibility: z.enum(['green', 'yellow', 'red']),
    title: z.string(),
    content: z.string(),
    data_point: z.string().optional(),
    question: z.string(),
    tags: z.array(z.string()),
    facilitator_note: z.string().optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const actions = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    phase: z.literal('action'),
    chamber: z.string(),
    reversibility: z.enum(['green', 'yellow', 'red']),
    scope: z.enum(['individuel', 'organisationnel', 'systemique']),
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
    amplifies: z.array(z.string()).optional(),
    blocks: z.array(z.string()).optional(),
    compatible_scenarios: z.array(z.string()).optional(),
    facilitator_note: z.string().optional(),
    illustration: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const scenarios = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    phase: z.literal('scenario'),
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
    facilitator_note: z.string().optional(),
    version: z.string().default('1.0'),
  }),
});

const roles = defineCollection({
  type: 'data',
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
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    groups: z.number().min(4).max(6),
    bascules: z.array(z.string()),
    tensions: z.array(z.string()),
    actions: z.array(z.string()),
    scenarios: z.array(z.string()),
    roles: z.array(z.string()),
    version: z.string().default('1.0'),
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
