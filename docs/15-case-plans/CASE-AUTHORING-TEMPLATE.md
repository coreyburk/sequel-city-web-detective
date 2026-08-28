# Case Authoring Template

Use this template when creating a new Sequel Detective case plan under `docs/15-case-plans/`.

This template is authoring documentation. It does not release a case, create database rows, expose answer keys, implement runtime progression, persist learner state, or authorize runtime AI.

## Case Identity

| Field | Value |
|---|---|
| Case id | |
| Public case number/name | |
| Working title | |
| Declared tier | |
| Rank title | |
| Track label | |
| Release status | Locked / gated / released |
| Spoiler classification | |

## Tier Compliance

Authority: `docs/00-ssot/SSOT-Case-Tier-System.md`.

| Axis | Declared budget | Case evidence |
|---|---|---|
| Story steps | | |
| SQL scope | | |
| People/entities | | |
| Clues/evidence | | |
| Interpretation complexity | | |

Foundations mapping, if used:

- State whether `Foundations` is acting as a pre-tier/on-ramp label.
- Confirm the case still satisfies the Tier 1 contract unless a future SSOT update authorizes otherwise.

## Completion Contract

| Field | Value |
|---|---|
| Completion criteria | |
| Completion signal | |
| Terminal SQL result evidence | |
| Single accepted conclusion or multiple defensible conclusions | |
| Deterministic completion required | Yes / No |

Completion authority must come from SQL query results that satisfy declared criteria. Query text, free-text explanation, UI state, localStorage, AI output, prompt intent, and narrative assertions are not completion authority.

## Public Dossier

Define only learner-safe public metadata:

- public summary
- initial briefing premise
- learner objective
- expected table-family orientation
- release-gate or locked-state copy

Do not include culprit identity, answer-key values, restricted table content, or final solve paths.

## Evidence Path

Describe the full intended evidence path in order. Each item should identify the fact learned, the table family involved, and the later dependency it supports.

| Step | Evidence fact | Table family | Depends on | Supports |
|---|---|---|---|---|
| 1 | | | | |

## Story Steps And SQL Milestones

| # | Milestone id | Learner objective | Evidence table family | Expected result shape | SQL concept | Validator expectation |
|---|---|---|---|---|---|---|
| 1 | | | | | | |

## SQL Concept Coverage

| SQL concept | Milestone coverage | Assessment target |
|---|---|---|
| Projection | | |
| Filtering | | |
| Sorting | | |
| Joins | | |
| Aggregation | | |
| `HAVING` / null handling / upper-tier concepts | | |

## People And Entity Inventory

| Entity | Type | Role in evidence | Spoiler status | Reuse/modify/new decision |
|---|---|---|---|---|
| | | | | |

## Data Fixture Plan

| Table/script area | Row strategy | Stable lookup fields | Version/change-date needs | Conflict checks |
|---|---|---|---|---|
| | Reuse / modify / new / avoid | | | |

Fresh database creation scripts are the authoritative case-content source. Story data should be authored through the base creation/seed path, not case-story migrations, unless a future SSOT update changes that policy.

## Clue Fairness And Distractors

| Clue or distractor | Purpose | How learner can verify it | Tier compliance |
|---|---|---|---|
| | | | |

For Tiers 1 through 3, distractors must be clearly resolvable and must not become major red herrings.

## Guidance And Mentor Pacing

Describe Samuel guidance by story step:

| Step | Guidance intent | Hint escalation boundary | Spoiler boundary |
|---|---|---|---|
| | | | |

## State, Persistence, And Reset

| Area | Planned behavior |
|---|---|
| Learner-owned state | |
| Case-specific state | |
| Storage key/version | |
| Reset behavior | |
| Stale database/version handling | |

Persistence is presentation convenience. It is not evidence authority.

## Suspect Verification Or Final Evaluation

| Area | Planned behavior |
|---|---|
| Verification authority | |
| Positive path | |
| Negative path | |
| Restricted data / answer-key boundary | |
| Tier 5 evaluation framework, if applicable | |

## Automated Validation And Playthrough

| Validation type | Planned command or evidence | Required before release |
|---|---|---|
| Unit/result-pattern validator tests | | |
| Route/service metadata tests | | |
| Restricted-table/spoiler-boundary tests | | |
| Browser or live-stack smoke tests | | |
| Golden-path playthrough | | |
| Reset/restore tests | | |

## Implementation Bundle Plan

Use the tier-system bundle guidance:

- Foundations and Tier 1: whole case or large case slice when practical.
- Tiers 2 and 3: two to three story steps per WP when coherent.
- Tiers 4 and 5: thread-sized or evidence-web slices.

| Package | Intended scope | Files likely affected | Validation |
|---|---|---|---|
| | | | |

## Release Criteria

- Tier compliance verified.
- Completion contract implemented.
- Required evidence data exists in fresh-build scripts.
- Validators and route/service behavior pass.
- Restricted data and answer-key boundaries pass.
- Learner-owned persistence/reset behavior passes if release requires restore.
- Golden-path playthrough passes against a fresh local database.
- Human final acceptance recorded in the release WP.

## Unresolved Authoring Assumptions

- 
