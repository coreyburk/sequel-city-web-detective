# SSOT Case Tier System

## Purpose And Authority

This document defines the authoritative case-tier system for Sequel Detective.

The tier system governs future case design, case authoring, learner difficulty progression, case-library filtering, progression planning, and audit checks. Runtime implementation still requires separately scoped work packages. This document does not release cases, create progression logic, mutate database content, authorize runtime AI, or expose solution data.

When tier definitions conflict with older progression-design notes, this SSOT is authoritative for case-tier classification.

## Core Principle

Investigation complexity is the primary driver of case difficulty. SQL syntax novelty is secondary.

Learner progression should come from richer investigations: more evidence to correlate, more people and entities, longer reasoning chains, tighter clue fairness, and greater synthesis demands. SQL fluency is demonstrated through reasoning with query results, joins, aggregation, filtering, and interpretation. Advanced syntax must not be introduced faster than the investigation itself becomes more complex.

Permitted SQL concepts across the tier system include:

- `SELECT`
- `WHERE`
- `ORDER BY`
- `JOIN`
- `GROUP BY`
- `HAVING`

Optional upper-tier optimizations such as `CASE` expressions, CTEs, or window functions may appear in examples or advanced paths, but they must not be required for lower-tier completion unless a future SSOT update explicitly changes the tier contract.

## Mandatory Tier Axes

Every playable case must declare evidence for all five axes before broad implementation begins. A case is compliant with a declared tier only when all five axes fit that tier.

### Story Steps

A story step is a discrete investigative phase that introduces a new objective, requires one or more SQL queries to advance, and produces a new fact, clue, or narrative development. Passive observations, decorative copy, and UI-only acknowledgements do not count as story steps.

### SQL Scope

SQL scope describes the expected query concepts, joined-table count, aggregation requirements, and constraint patterns needed on the intended completion path. Query text is not the authority; expected result shape and values are.

### People And Entities

This axis counts meaningful people, organizations, locations, vehicles, events, or other investigation entities that the learner must distinguish or connect. Random database rows do not count unless the authored case intentionally makes them part of the evidence field.

### Clues And Evidence

This axis counts authored evidence items that contribute to the investigation. Evidence may live across database rows, result sets, milestone metadata, guidance, or learner-visible case materials, but completion authority must ultimately come from backend-approved SQL result evidence and deterministic checks where implemented.

### Interpretation Complexity

This axis describes how much synthesis the learner must perform, including dependency between findings, ambiguity, contradictions, distractors, and red herrings. Difficulty should increase through fair interpretation load, not through accidental noise or hidden answer-key access.

## Completion Contracts

Every case must declare:

- completion criteria,
- completion signal,
- terminal evidence requirements,
- whether the case has a single accepted conclusion or multiple defensible conclusions.

For Tiers 1 through 4, completion must be deterministic. The learner completes the case only when backend-approved SQL query results satisfy the declared completion criteria. Query text, free-text explanation, UI state, localStorage, AI output, prompt intent, or narrative assertions are not valid completion authorities.

Tier 5 may allow multiple defensible conclusions, but it must still declare an auditable evaluation framework and required SQL result evidence. Free text alone is never enough.

## Foundations Mapping

`Foundations` is a pre-release/on-ramp authoring label for cases designed at or below Tier 1 complexity.

Foundations cases must satisfy the Tier 1 completion contract unless a future SSOT update defines a separate pre-tier release model. A Foundations case may include extra scaffolding, Samuel guidance, and smaller step sizes, but it must not exceed Tier 1 ambiguity, red-herring, or SQL-scope limits while still being labeled Foundations.

Case 001 currently uses the `Foundations` track as a gated pre-release/on-ramp label. Its final tier assignment must be checked against this SSOT before release.

## Tier Definitions

### Tier 1: Junior Data Analyst

Core identity: first investigation experience.

Primary goal: confidence, discovery, and momentum.

Axis contract:

| Axis | Requirement |
|---|---|
| Story steps | 1 to 2 linear steps |
| SQL scope | `SELECT`, `WHERE`, `ORDER BY`, simple `COUNT`; 1 to 2 tables |
| People/entities | 2 to 3 meaningful people or entities |
| Clues/evidence | 2 to 3 clear, directly observable evidence items |
| Interpretation complexity | No ambiguity, no major red herrings, no unresolved contradictions |

Completion criteria: the learner produces a SQL result that directly answers the investigative question using basic filtering, ordering, or counting.

Completion signal: one correct scalar value or a small exact result set.

Guarantee: the learner can complete the case with one or two straightforward query paths and understand why the result is correct.

### Tier 2: Senior Data Analyst

Core identity: relationship discovery.

Primary goal: connecting multiple sources.

Axis contract:

| Axis | Requirement |
|---|---|
| Story steps | 2 to 3 sequential dependent steps |
| SQL scope | Joins across 2 to 3 tables; `GROUP BY`; aggregation |
| People/entities | 4 to 5 meaningful people or entities |
| Clues/evidence | 3 to 5 evidence items spread across tables |
| Interpretation complexity | One correct interpretation per step; no ambiguity; distractors must be visibly resolvable |

Completion criteria: the learner produces a grouped, aggregated, or joined SQL result that demonstrates a relationship or pattern across multiple entities.

Completion signal: an exact result set whose structure, grouping, and values match the declared expectations.

Guarantee: the learner learns to confirm relational patterns through joins and aggregation without being asked to resolve ambiguous story logic.

### Tier 3: Data Inspector

Core identity: sustained investigation.

Primary goal: managing scope, continuity, and evidence integrity.

Axis contract:

| Axis | Requirement |
|---|---|
| Story steps | 3 to 5 steps with findings that persist across steps |
| SQL scope | Joins across 3 to 4 tables; `GROUP BY` with `HAVING`; basic null handling when introduced fairly |
| People/entities | 5 to 7 meaningful people or entities |
| Clues/evidence | 5 to 8 evidence items distributed across story steps |
| Interpretation complexity | Deterministic narrowing; no unresolved ambiguity; no major red herrings; misleading rows must be ruled out by visible evidence |

Completion criteria: the learner produces a final SQL result, possibly after multiple exploratory queries, that satisfies all declared constraints and proves a specific investigative conclusion.

Completion signal: a terminal SQL result set containing exactly the qualifying rows and no extraneous rows.

Guarantee: the learner experiences cumulative reasoning and systematic verification without needing to choose among unresolved interpretations.

### Tier 4: Data Detective

Core identity: complex pattern investigation.

Primary goal: synthesis and discernment.

Axis contract:

| Axis | Requirement |
|---|---|
| Story steps | 5 to 8 steps; some steps validate or invalidate prior assumptions |
| SQL scope | Joins across 5 to 6 tables; complex aggregation patterns; optional advanced syntax not required |
| People/entities | 7 to 10 meaningful people or entities |
| Clues/evidence | 8 to 12 evidence items |
| Interpretation complexity | Limited red herrings permitted; contradictions must be resolvable; final conclusion must be deterministic and defensible |

Completion criteria: the learner produces one or more final SQL results that together satisfy a declared multi-part completion specification.

Completion signal: a defined set of SQL result outputs whose combined evidence resolves the case.

Guarantee: the learner distinguishes meaningful patterns from noise while still reaching one deterministic case-close condition.

### Tier 5: Director of Data Integrity

Core identity: executive synthesis.

Primary goal: professional judgment under complexity.

Axis contract:

| Axis | Requirement |
|---|---|
| Story steps | 8 to 12 or more steps; multiple investigative threads converge |
| SQL scope | Joins across 6 to 8 or more tables; sophisticated correlation strategies; multiple valid exploratory paths |
| People/entities | 10 to 15 or more meaningful people or entities |
| Clues/evidence | 12 to 20 or more evidence items; some evidence may be inconclusive |
| Interpretation complexity | Ambiguity permitted; multiple defensible conclusions may exist under a declared evaluation framework |

Completion criteria: the learner produces SQL results that support a defensible conclusion under the declared evaluation framework.

Completion signal: a required set of SQL outputs that collectively justify the learner's conclusion.

Guarantee: the learner demonstrates professional-level analytical judgment while still grounding the conclusion in auditable SQL result evidence.

## Ambiguity And Red-Herring Rules

| Element | Foundations | Tiers 1 to 3 | Tier 4 | Tier 5 |
|---|---|---|---|---|
| Major red herrings | Prohibited | Prohibited | Limited and resolvable | Permitted |
| Narrative ambiguity | Prohibited | Prohibited | Minimal and resolvable | Expected |
| Multiple valid endings | Prohibited | Prohibited | Prohibited | Permitted only with an evaluation framework |
| Distractors | Clearly resolvable only | Clearly resolvable only | Permitted when fair | Permitted when fair |

Distractors are not the same as red herrings. A distractor is a visible alternative ruled out by evidence. A red herring is a designed misleading lead that can occupy sustained investigation time. Tiers 1 through 3 may use distractors only when the disqualifying evidence is available and deterministic.

## Summary Progression Table

| Tier | Rank title | Story steps | Joined-table scope | People/entities | Evidence items | Ambiguity |
|---|---|---:|---:|---:|---:|---|
| Foundations | On-ramp label | 1 to 2 | 1 to 2 | 2 to 3 | 2 to 3 | None |
| 1 | Junior Data Analyst | 1 to 2 | 1 to 2 | 2 to 3 | 2 to 3 | None |
| 2 | Senior Data Analyst | 2 to 3 | 2 to 3 | 4 to 5 | 3 to 5 | None |
| 3 | Data Inspector | 3 to 5 | 3 to 4 | 5 to 7 | 5 to 8 | None |
| 4 | Data Detective | 5 to 8 | 5 to 6 | 7 to 10 | 8 to 12 | Limited and resolvable |
| 5 | Director of Data Integrity | 8 to 12+ | 6 to 8+ | 10 to 15+ | 12 to 20+ | Permitted |

## Case Implementation Bundle Guidance

To reduce process churn while preserving review quality, future case work should be bundled by coherent evidence slices:

- Foundations and Tier 1: implement the whole case or a large case slice in one WP when practical.
- Tiers 2 and 3: implement two to three story steps per WP when data, validators, UI feedback, and tests can be audited together.
- Tiers 4 and 5: implement thread-sized or evidence-web slices rather than single-row or single-validator polish.

Every bundle must still preserve the existing work-package lifecycle, independent audit, human final decision, handoff refresh, and commit-helper closeout.

## Current Case Placement Notes

Case 004 remains provisionally classified as `Tier 3: Data Inspector` until an end-to-end case audit validates its full playable path, final query complexity, and observed learner friction.

Case 001 remains gated and unreleased. Its `Foundations` label means it is being authored as an on-ramp case that must satisfy the Tier 1 contract before release unless a future SSOT update changes the Foundations model.

## Change Control

Updates to this tier system require a scoped work package, SSOT review, explicit version/change notes where applicable, independent audit when available, and human final acceptance.
