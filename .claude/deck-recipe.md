# Recette de fabrication d'un deck — Conseil des IA

Distillée à partir des quatre decks de référence : `care-triage`, `glamour-glitch`, `terminus`, `trace-zero`.

---

## Principe fondateur : un deck = un univers fermé

Un deck n'est pas un assemblage de cartes thématiquement proches.
C'est une **crise systémique cohérente** vécue sous cinq angles.

Checklist minimale :
- une institution centrale unique (ex. GHR, OmniStream Studios, L'Agence)
- une technologie/système central unique (ex. CareFlow, FAME-GEN, CITIZEN-SCAN)
- une logique industrielle ou institutionnelle unique
- un macro-conflit implicite traversant les 5 chambres
- des mandats interchambres organiques — chaque `mandat_principe` doit créer une friction réelle dans le scénario de la chambre suivante

---

## Protocole de génération (ordre obligatoire)

Ne pas générer dans le désordre. La phase 4 est le point culminant : elle valide ou invalide tout.

```
1. Bible du deck   → config.yaml + univers + registre
2. 5 scénarios P4  → les collisions finales ; chaque scénario nomme la friction attendue
3. 20 actions      → avec mandat_principe ; vérifier friction dans le scénario chambre suivante
4. Audit circulation → tableau avant de continuer (voir ci-dessous)
5. 15 bascules     → préparer le terrain, micro-scènes concrètes
6. 45 tensions     → approfondir les dilemmes structurels
7. Audit global    → cohérence, dignité, contamination lexicale
```

Le deck n'est pas validé tant que les 5 passages interchambres ne sont pas jugés **forts** ou **acceptables**.

---

## La boucle interchambre — le cœur mécanique

```
Délégation → Invisibilité → Preuve → Singularité → Métabolisme → Délégation
```

Chaque passage transmet un problème que la chambre suivante est la mieux placée pour traiter.

| Passage | Ce qui est transmis | Friction dans la chambre réceptrice |
|---|---|---|
| Délégation → Invisibilité | On a confié le jugement à une machine | Comment contester ce qu'on ne comprend pas ? |
| Invisibilité → Preuve | Le système sanctionne sans expliquer | Que faut-il prouver pour être considéré légitime ? |
| Preuve → Singularité | Les preuves valides sont standardisées | Que devient ce qui échappe au modèle ? |
| Singularité → Métabolisme | Préserver l'exception a un coût | Ce coût est-il soutenable ou justifiable ? |
| Métabolisme → Délégation | Le contrôle coûte plus que l'aide | Qui reprend la décision, et avec quel mandat ? |

Cette logique est **universelle** — elle vaut pour tous les decks. Ce qui change d'un deck à l'autre, c'est le lexique et les personnages qui l'incarnent.

---

## Règle Action → Mandat (`mandat_principe`)

Une action locale n'est **jamais** transmise telle quelle. Elle doit être reformulée.

| Champ | Rôle |
|---|---|
| `title` + `body` | Intervention concrète, située, institutionnelle, spécifique au domaine |
| `mandat_principe` | Principe de gouvernance portable — la chambre suivante doit pouvoir l'exploiter sans explication |

**Gabarits autorisés :**
```
Rendre visible…        Garantir…              Exiger…
Interdire tout … sans… Préserver…             Imposer…
Conditionner…          Plafonner…
```

**Transformation type :**
- Action : "Permettre aux doubleurs de retirer leur voix d'un modèle"
- Mandat : "Interdire tout usage d'identité vocale sans clé de consentement révocable"

**À refuser :**
- Nom de module logiciel précis comme mandat
- Action trop locale impossible à réutiliser interchambre
- Consigne purement technique sans portée institutionnelle
- Mandat limité à une spécialité que la chambre suivante ne peut pas exploiter

---

## Tableau d'audit de circulation (à remplir avant validation)

| Chambre émettrice | Action locale | `mandat_principe` | Chambre réceptrice | Scénario récepteur | Nature de la friction | Verdict |
|---|---|---|---|---|---|---|
| Délégation | … | … | Invisibilité | … | … | fort / acceptable / trop local / à réécrire |
| Invisibilité | … | … | Preuve | … | … | … |
| Preuve | … | … | Singularité | … | … | … |
| Singularité | … | … | Métabolisme | … | … | … |
| Métabolisme | … | … | Délégation | … | … | … |

---

## Niveaux d'abstraction par phase

| Phase | Niveau | Test de validation |
|---|---|---|
| P1 — Bascule | Micro-scène concrète | "Quelqu'un dans la salle a déjà vécu ça ou pourrait le vivre demain" |
| P2 — Tension | Dilemme institutionnel structurel | "Un désaccord est possible sans que l'un des camps paraisse idiot" |
| P3 — Action | Levier institutionnel défendable | "Un décideur ou législateur pourrait adopter cette mesure telle quelle" |
| P4 — Scénario | Collision politique | "Le mandat reçu complique immédiatement et visiblement la situation locale" |

---

## Bible des 5 chambres (générique)

### Délégation vs Souveraineté
- **Question mère** : À qui ai-je confié ce pouvoir — et puis-je encore le reprendre ?
- **Lexique** : mandat, dépendance, lock-in, responsabilité diffuse, sous-traitance, maîtrise
- **Angle mort** : une IA peut parfois décider plus justement qu'un humain biaisé
- **Ligne rouge** : ne pas dériver vers "technologie = mauvais"

### Invisibilité vs Arbitrage
- **Question mère** : Qui décide pour moi — comment, sur quoi, et sans que je le sache ?
- **Lexique** : profilage, score, opacité, biais, discrimination systémique, explicabilité, voie de recours
- **Angle mort** : la personnalisation peut aussi aider
- **Ligne rouge** : ne pas confondre biais algorithmique et erreur humaine

### Preuve vs Simulation
- **Question mère** : Comment établir qu'une chose est vraie quand tout peut être simulé ou interprété ?
- **Lexique** : attestation, certificat, traçabilité, falsifiabilité, authenticité, chaîne de confiance
- **Angle mort** : la simulation peut servir à éduquer, créer, modéliser sans tromperie
- **Ligne rouge** : ne pas dériver vers un débat moral général sur l'IA

### Singularité vs Standard
- **Question mère** : Ce qui me rend singulier est-il encore viable dans un monde que l'IA homogénéise ?
- **Lexique** : norme, diversité, edge case, minorité, adaptation, exception, monoculture
- **Angle mort** : valeur réelle de l'interopérabilité pour l'équité
- **Ligne rouge** : ne pas dériver vers un rejet de tout standard

### Métabolisme vs Progrès
- **Question mère** : Quel prix réel payons-nous pour ce progrès — et qu'est-ce qu'il rend irréversible ?
- **Lexique** : empreinte, ressource, sobriété, énergie, irréversibilité physique, externalité, dépendance
- **Angle mort** : l'IA peut optimiser la consommation et réduire le gaspillage
- **Ligne rouge** : ne pas dériver vers un technopessimisme général

---

## Mini-bibles des decks existants

### `care-triage` (CareFlow / GHR)

**Univers** : CareFlow pilote triage, orientation, priorisation des lits dans un GHR public.
**Macro-conflit** : CareFlow devient le centre de gravité des décisions cliniques sans que les critères soient connus.
**Registre** : institutionnel, clinique, concret. Jamais technobéat ni apocalyptique.

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | Qui décide encore de l'orientation ou du refus ? | validation humaine, autonomie clinique, responsabilité médicale | N'autoriser aucune décision d'orientation sans validation humaine traçable |
| Invisibilité | Qu'est-ce qui reste visible et contestable dans les choix de CareFlow ? | score, justification, audit, journalisation, recours | Garantir la traçabilité et la contestabilité des scores affectant les patients |
| Preuve | Qu'est-ce qu'une sortie CareFlow prouve vraiment ? | seuil de fiabilité, attestation, protocole de contradiction | Exiger un seuil de fiabilité documenté et un protocole de contradiction |
| Singularité | Que deviennent les patients atypiques dans un système standardisé ? | exception, atypie, dérogation motivée | Imposer une dérogation motivée pour tout profil hors-standard |
| Métabolisme | Que consomme et rigidifie le déploiement de CareFlow ? | dépendance opérationnelle, soutenabilité, capacité autonome résiduelle | Conditionner tout déploiement à la préservation d'une capacité autonome documentée |

**Logique de circulation** :
- Del → Inv : si CareFlow décide, que reste-t-il visible du raisonnement clinique ?
- Inv → Pre : si les scores sont opaques, que peut-on prouver d'une décision médicale ?
- Pre → Sin : si la preuve est standardisée, que devient le patient qui n'entre pas dans les cohortes ?
- Sin → Met : si on veut protéger les profils atypiques, quel coût infrastructure accepte-t-on ?
- Met → Del : si CareFlow est irremplaçable, peut-on encore reprendre la main cliniquement ?

---

### `glamour-glitch` (OmniStream Studios / FAME-GEN)

**Univers** : FAME-GEN clone voix/visage/style, génère contenu, pilote visibilité, peut "rejouer" des talents.
**Macro-conflit** : à qui appartiennent le visage, la voix, le style et la valeur symbolique d'un créateur ?
**Registre** : nerveux, contemporain, hype mais crédible. Jamais boomer ni Black Mirror paresseux.
**Tagline** : *À qui appartient ton visage, ta voix et ta vibe quand FAME-GEN peut les monétiser mieux que toi ?*
**Règle** : tout passe par OmniStream/FAME-GEN — pas de références directes à des plateformes réelles.

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | À quel moment les créateurs cessent-ils de décider eux-mêmes ? | ghostwriting, autonomie créative, pipeline, délégation de performance | N'autoriser aucune performance synthétique sans validation explicite du créateur |
| Invisibilité | Pourquoi tel créateur est-il boosté, enterré ou démonétisé ? | ranking, shadowban, démonétisation, boost, opacité, règles cachées | Garantir la lisibilité et la contestabilité des critères de classement |
| Preuve | Comment sait-on si une voix ou une performance est authentique ? | deepfake, clone vocal, authenticité, certification, consentement, faux-vrai | Interdire tout usage d'identité de créateur sans clé de consentement révocable |
| Singularité | Que devient la créativité humaine quand FAME-GEN optimise pour le contenu moyen ? | standardisation, contenu moyen, edge case, vibe homogène, créateur interchangeable | Imposer un audit des profils hors-standard avant toute décision de déclassement |
| Métabolisme | Quel coût physique cache l'usine à célébrités synthétiques ? | GPU, énergie, verrouillage industriel, dépendance, coût caché | Conditionner tout déploiement FAME-GEN à la publication de son empreinte ressource |

**Logique de circulation** :
- Del → Inv : si la création est déléguée, qu'est-ce qui reste visible du travail humain et du crédit ?
- Inv → Pre : si le ranking est opaque, comment prouver une origine, un boost, un clone ?
- Pre → Sin : si tout doit être certifié, que devient ce qui échappe au label ?
- Sin → Met : si on veut préserver l'exception créative, quel coût infrastructure accepte-t-on ?
- Met → Del : si l'infrastructure est totalement dépendante, peut-on encore reprendre le contrôle créatif ?

**Anti-patterns spécifiques** :
- Patchwork de plateformes — tout passe par OmniStream/FAME-GEN
- Ton boomer — pas d'extériorité face aux codes du feed/clip/stream
- Black Mirror paresseux — dystopie sans ancrage institutionnel et économique
- Hype vide — pas d'architecture systémique derrière la référence culturelle

---

### `terminus` (L'Agence / CITIZEN-SCAN)

**Univers** : CITIZEN-SCAN calcule un score d'utilité sociale, interprète activité/inactivité/traces, dépriorise les droits selon conformité présumée.
**Macro-conflit** : le temps mort, le sommeil, l'inactivité et la vie non standard deviennent suspects ou illégitimes.
**Thèse** : Qui a encore le droit de ne pas être immédiatement lisible, rentable, traçable et conforme ?
**Registre** : brut, sec, précis, quotidien, digne. Jamais misérabiliste ni argot décoratif ni dystopie gadget.
**Règle de ton** : écrire comme si le système existait presque déjà — extrapolation froide, pas science-fiction.

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | À qui a-t-on confié le pouvoir de dire si ma vie est conforme et recevable ? | score, effacement de l'agent humain, verrouillage du dossier, responsabilité dissoute | N'autoriser aucune décision de dépriorisation sans qu'un agent humain identifiable puisse la réviser |
| Invisibilité | Pourquoi ai-je été sanctionné ou bloqué sans comprendre sur quelle base ? | opacité punitive, micro-sanctions, anomalie, shadowban administratif, file invisible | Interdire toute sanction automatisée sans explication humaine compréhensible et voie de recours identifiée |
| Preuve | Qu'est-ce qu'il faut prouver pour exister comme sujet légitime quand la machine interprète tout ? | preuve de présence, silence, inactivité, suspicion, trace, présomption de fraude | Garantir que l'absence de signal numérique ne soit jamais interprétée par défaut comme fraude |
| Singularité | Que devient une vie si elle ne rentre pas dans les cases du modèle ? | solidarité informelle, hébergement non standard, rythme atypique, administrativement illisible | Reconnaître les formes de solidarité et les rythmes de vie non standard dans l'évaluation des droits |
| Métabolisme | Combien coûte réellement le contrôle algorithmique, et que détruit-il en prétendant optimiser ? | coût du contrôle, inflation bureaucratique, saturation des agents, surveillance plus chère que l'aide | Conditionner tout déploiement de CITIZEN-SCAN à la démonstration que son coût est inférieur au bénéfice produit |

**Logique de circulation** :
- Del → Inv : si CITIZEN-SCAN décide sans agent humain, les sanctions deviennent opaques et déresponsabilisées
- Inv → Pre : si le système sanctionne sans expliquer, les usagers doivent sans cesse prouver qu'ils méritent leurs droits
- Pre → Sin : si les preuves légitimes sont standardisées, les vies non standard deviennent suspectes
- Sin → Met : plus on force les vies réelles dans des catégories fixes, plus le coût de surveillance explose
- Met → Del : quand surveiller coûte plus cher que protéger, faut-il rendre la décision à des humains locaux ?

**Anti-patterns spécifiques** :
- Misérabilisme — la pauvreté n'est pas un décor ni un gimmick narratif
- Argot décoratif — pas d'argot plaqué comme accessoire de style
- Dystopie gadget — situations trop absurdes pour être politiquement crédibles
- Absence de dignité — les personnages conservent une dignité narrative même dans la dureté
- Abstractivité sociologique — pas de jargon académique, pas de cartes-cours résumés

---

### `trace-zero` (OGR / SIGMA-ID)

**Univers** : SIGMA-ID certifie les identités numériques via biométrie comportementale (CVR). L'OGR arbitre la confiance dans un monde où tout peut être deepfaké.
**Macro-conflit** : quand l'authenticité doit être prouvée en permanence, qui protège ceux dont l'existence réelle ne correspond pas au modèle de preuve ?
**Thèse** : Peut-on gouverner un système qui doit décider ce qui est vrai, sans que ce système devienne lui-même une menace pour la liberté ?
**Registre** : technique, juridique, précis. Ni thriller ni prophétie — le système existe déjà à moitié.
**Règle de ton** : le danger vient de la normalité du dispositif, pas de sa monstruosité.

| Chambre | Question mère | Lexique propre | Mandat typique |
|---|---|---|---|
| Délégation | À qui ai-je confié le pouvoir de certifier que je suis moi — et puis-je le reprendre ? | CVR, délégation d'autorité de certification, reprise de contrôle, opérateur de confiance | Limiter le droit de délégation à SIGMA-ID aux entités maintenant une capacité de reprise autonome |
| Invisibilité | Pourquoi mon score d'authenticité baisse — et comment le contester si je ne sais pas d'où il vient ? | score d'authenticité, log opaque, déclassement silencieux, suspicion latente | Rendre visible le score d'authenticité en temps réel et garantir une voie de recours humaine |
| Preuve | Comment prouver que je suis vivant et réel quand tout peut être simulé ? | liveness, deepfake, présomption de synthèse, chaîne de garde, charge de la preuve | Imposer une présomption de légitimité de la preuve vivante en l'absence de certification contraire |
| Singularité | Que devient quelqu'un dont le profil biométrique ou comportemental échappe au modèle d'entraînement ? | atypie biométrique, variabilité, hors-modèle, protocole alternatif, faux positif | Interdire tout refus d'accès à un service essentiel fondé sur la seule atypie biométrique |
| Métabolisme | Quel est le coût réel — en friction, données, énergie, temps — d'un monde où tout doit être certifié ? | friction d'authentification, conservation de données comportementales, fatigue d'authentification, coût de vérification | Plafonner le nombre de vérifications imposables et limiter la conservation des données comportementales |

**Logique de circulation** :
- Del → Inv : si SIGMA-ID décide de l'authenticité, comment conteste-t-on une décision qu'on ne comprend pas ?
- Inv → Pre : si le score est opaque, que faut-il prouver pour être considéré légitime ?
- Pre → Sin : si les preuves valides sont standardisées, que devient celui dont le corps ou le comportement échappe au modèle ?
- Sin → Met : préserver les atypies a un coût en procédures, agents, exceptions — est-il soutenable ?
- Met → Del : quand vérifier coûte plus cher que faire confiance, à qui redonne-t-on la décision ?

**Anti-patterns spécifiques** :
- Thriller technologique — le danger vient de la banalisation du dispositif, pas de sa spectacularité
- Confusion deepfake/IA générale — SIGMA-ID est un système d'authentification, pas une IA générative
- Suspicion sans issue — les mandats doivent toujours préserver une voie humaine réelle
- Fatalisme juridique — les droits sont défendables, même dans un système opaque

---

## Anti-patterns universels

| # | Anti-pattern | Correction |
|---|---|---|
| 1 | Titre d'action décrivant le problème | Le titre décrit l'intervention institutionnelle |
| 2 | Corps d'action descriptif | "il est interdit de / toute entité doit", pas "une institution adopte X" |
| 3 | `lever_type` incohérent avec le titre | "Rendre obligatoire" ≠ `interdire` ; "Plafonner" ≠ `conditionner` |
| 4 | Tension dérivant vers le débat moral général | Deux valeurs légitimes en conflit, pas un jugement |
| 5 | `mandat_principe` trop sectoriel | Portable vers la chambre suivante sans perte de sens |
| 6 | Scénario dans un domaine différent du deck | Contamination de domaine — tout reste dans l'univers |
| 7 | Chambres partageant le même vocabulaire | Contamination lexicale — chaque chambre a son propre lexique |
| 8 | `data_point` sans source réelle | Sourcé ou plausiblement sourcé, jamais "selon une étude" |
| 9 | Question de Phase 1 donnant une réponse implicite | Les deux positions doivent être défendables |
| 10 | Sujet institutionnel absent | Qui fait quoi ? Toujours identifiable |
| 11 | `mandat_principe` absent sur action (hors demo) | Champ obligatoire |
| 12 | `mandat_principe` trop technique | Portable, sans jargon opaque |

---

## Matrice de contrôle qualité

- [ ] Univers cohérent : même institution, même technologie, même population, même horizon
- [ ] Chambre cohérente : lexique propre, question mère respectée, pas de contamination
- [ ] `slot_theme` distribué : individu / organisation / système (3 bascules par chambre)
- [ ] Abstraction correcte par phase : concret P1, structurel P2, institutionnel P3, collision P4
- [ ] `lever_type` cohérent avec titre et body (Plafonner/Limiter → `limiter`, Interdire → `interdire`, etc.)
- [ ] `lever_type` équilibré sur les 20 actions : les 5 types représentés, pas de sous-représentation < 2
- [ ] `mandat_principe` portable vers la chambre suivante
- [ ] `facilitator_note` présent sur toutes les tensions et actions, avec les 3 sous-champs : `si_silence`, `si_debat_bloque`, `relance_cle`
- [ ] `relance_cle` des actions commence par "Ce mandat pose la question de…"
- [ ] Accessible à des étudiants non-spécialistes
- [ ] Pas de redondance forte dans la même chambre
- [ ] Audit de circulation complété (5 passages évalués)
- [ ] Dignité narrative préservée (aucun personnage humilié par la manière d'écrire)
