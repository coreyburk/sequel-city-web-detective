# SSOT Case Authoring

## Principle

Playable cases must be produced from a repeatable authored contract before they are released. The contract is a pre-release validation surface for case content and ownership boundaries. It is not runtime authority by itself and does not replace backend-approved SQL results, deterministic result-pattern checks, SQL safety, database evidence, or suspect verification.

## Document Scope

This document owns the scalable case-production contract for future Sequel City Web Detective cases. Runtime layering is owned by `SSOT-Architecture.md`. Database tables and spoiler-control rules are owned by `SSOT-Database-Schema.md`. Progression authority is owned by `SSOT-Case-Progression.md`. Investigation state ownership is owned by `SSOT-Investigation-State-Architecture.md`. Case difficulty tiers, Foundations mapping, and tier-axis compliance are owned by `SSOT-Case-Tier-System.md`.

## Authoring Contract

Every future playable case must define these authored sections before release work begins:

| Section | Purpose |
|---|---|
| Case identity | Stable case id and public case number/name |
| Tier classification | Declared tier or Foundations/on-ramp label, with evidence for story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity |
| Release status | Whether the case is released, gated, or locked, including any release-gate behavior |
| Public dossier | Non-spoiler metadata used by the case library and briefing |
| Evidence requirements | Database table families the case depends on |
| SQL milestones | Learner objectives, table-family references, and deterministic validation ownership |
| Completion contract | Completion criteria, completion signal, terminal SQL result evidence, and whether the case has one deterministic conclusion or an auditable Tier 5 evaluation framework |
| State contract | Common learner-owned state and case-specific learner-owned state |
| Persistence/reset semantics | Storage strategy, version expectations, and clear-progress behavior |
| Investigation threads | Authored thread ownership and seed responsibility |
| Guidance | Authored Samuel Tupleton guidance ownership |
| Spoiler boundary | Explicit answer-key, restricted-data, and hidden-solution exclusions |

## Full-Case Plan

The reusable authoring contract is necessary but not sufficient for building a complete playable case. Before broad implementation of a new playable case, create a full case plan artifact under `docs/15-case-plans/` that defines the intended end state, declared tier, tier-axis budget, evidence path, SQL milestones, expected query shapes, assessed SQL concepts, fixture/data needs, distractor/red-herring rules, complexity budget, completion criteria, completion signal, guidance pacing, persistence/reset expectations, suspect verification expectations, automated playthrough criteria, and future implementation sequence.

A full case plan is still authoring documentation. It does not release a case, create database rows, expose answer keys, render Query Lab, advance milestones, persist progress, verify suspects, or become runtime authority. Runtime progression must still be implemented later through backend-approved read-only SQL results and deterministic validators.

Use `docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md` for new case plans and `docs/15-case-plans/CASE-VETTING-CHECKLIST.md` before implementation or release review.

Use `docs/05-development-workflow/Case-Production-Workflow.md` for the development workflow that turns those artifacts into low-churn production steps, Tier 1/Foundations shaping decisions, implementation bundle sizing, validation selection, audit, and closeout.

## Production Sequence

Future cases should be built in production-sized packages rather than isolated skeleton polish:

1. Fill the case-authoring contract.
2. Create a full case plan that defines the complete playable path, declared tier, five-axis tier compliance, and completion contract.
3. Inventory existing relational scaffolding before authoring case data.
4. Add database-backed evidence data in coherent milestone bundles through the fresh-build creation/seed scripts.
5. Add deterministic result-pattern validation for those milestones.
6. Wire the case into the playable module boundary while preserving release gates.
7. Add learner-owned persistence and reset semantics for that case.
8. Add investigation threads, evidence-board behavior, suspect verification, database rebuild/version enforcement, and release unlock through separate scoped packages.

Each package must remain independently auditable. To reduce churn, implementation packages should follow the tier-system bundle guidance: Foundations and Tier 1 may use whole-case or large case-slice packages when practical, Tiers 2 and 3 should bundle two to three coherent story steps when possible, and Tiers 4 and 5 should bundle by investigation thread or evidence web rather than single-row polish. A filled authoring contract does not release a case, render Query Lab, create database rows, advance milestones, persist progress, or expose suspect verification.

Case 001 has completed the first three pre-release production-sequence surfaces for its opening SQL milestone: a filled authoring definition, one base seed `CrimeSceneReport` fixture for the public clocktower incident report, and a deterministic backend service-level result-pattern validator for `case-001-clocktower-report-located`. It also has a gated backend integration-boundary consumer that can call that validator only when an explicit Case 001 skeleton-gate input is enabled, a query execution transport contract that can return its non-spoiler metadata only for explicit enabled Case 001 milestone opt-in requests, and a gated skeleton-local frontend feedback slice that can display non-spoiler report-location feedback from that metadata. Case 001 now also has a full author-only case plan at `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md` to guide future bundled evidence, validator, guidance, persistence, verification, and release work. These surfaces do not release Case 001, render the normal Query Lab, advance runtime milestones, persist progress, expose suspect verification, or make authoring metadata runtime authority. The validator boundary remains unwired from runtime progression until a later scoped package connects approved SQL results to milestone state.

## Case Data Authoring

Existing seed data may provide useful relational scaffolding, but it must not be treated as already containing coherent mystery story threads. Case authors should reuse existing `PersonsOfInterest`, `DriversLicense`, `Employment`, `EventSchedule`, and `EventRegistration` rows when their relationships support the planned case fairly. Story-bearing `CrimeSceneReport` and `InterviewLog` content should be authored, replaced, or modified as needed so the mystery path is intentional rather than accidental.

Future case data packages must document which rows are reused unchanged, modified for story fit, newly inserted, or avoided. They must preserve referential integrity, avoid breaking released Case 004 behavior, and avoid relying on random coincidental data as clue logic.

Fresh database creation scripts are the authoritative case-content source. Case story/data authoring must update the base creation/seed script path, especially `database/02-SequelCityCrimesDB - Insert Data.sql`, so a clean rebuild creates the intended case from scratch. Do not add case-story migrations or `ALTER`-style data-evolution packages for authored case content. Existing local databases that do not match the expected authored case content version should be blocked from normal play and rebuilt from the current scripts through an explicit user-confirmed drop/recreate path. Learner browser progress is separate convenience state and must be reset or ignored when its case/database version no longer matches the rebuilt database.

## Progression Authority

SQL milestones must use backend-approved read-only SQL results and deterministic backend/result-pattern checks. The following are never valid SQL progression authorities:

- UI state
- skeleton selections
- localStorage
- AI output
- prompt text
- free-text guesses

Every SQL milestone must reference at least one declared evidence table family. A milestone cannot point to an undeclared table family, inferred schema, hidden answer-key row, or restricted data source.

Completion criteria and completion signals must be declared in the case plan before implementation. Tiers 1 through 4 require one deterministic completion outcome. Tier 5 may allow multiple defensible conclusions only when the case declares an auditable evaluation framework and required SQL result evidence.

## State And Persistence

The authoring contract must distinguish common learner-owned state from case-specific state. Common state includes concepts such as notebook entries, pinned facts, draft query text, and visible learner progress. Case-specific state includes authored milestone ids, case-specific thread ids, case-specific clue ids, and case-specific validation payloads.

Persistence and reset behavior must be declared before a case can be restored. Reset semantics must clear only learner-owned progress for that case id. Persistence must not clear or mutate backend query history, database state, account/cloud data, browser history state, case-library metadata, locked/future case data, or unrelated localStorage keys.

## Spoiler Boundary

Public case metadata, authored guidance, and pre-release validation examples must not include culprit identity, mastermind identity, answer-key rows, restricted table contents, hidden solution values, or direct solution query paths. Spoiler-bearing implementation details must stay behind scoped backend/database and verification packages that preserve the existing restricted-data boundaries.

## Current Runtime Status

The current runtime is not migrated to this contract. Case 004 remains the only released playable/restorable case. Case 001 remains a gated skeleton-only case with a first SQL milestone declaration, a filled pre-release authoring definition, one public `CrimeSceneReport` base seed fixture for the planned first evidence row, an unwired deterministic backend service-level validator for that first row, a gated backend integration-boundary consumer for that validator, an opt-in query execution transport contract for the boundary metadata, and one gated skeleton-local UI/API-client feedback slice for the first SQL query. That definition, fixture, validator, boundary consumer, transport contract, and skeleton feedback slice record the existing public dossier, `CrimeSceneReport` first evidence table family, and planned first SQL milestone boundary, but they do not release the case or make authored metadata runtime authority. Future packages may migrate cases toward this contract after WP-247, but runtime progression wiring, persistence, suspect verification, and release unlock are separate work.
