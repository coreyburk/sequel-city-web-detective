# Case Production Workflow

## Purpose

This workflow turns the case-tier SSOT, authoring template, and vetting checklist into a short operating lane for creating playable cases with less repeated planning churn.

It is development-process guidance only. It does not release cases, change runtime behavior, authorize runtime AI, mutate database content, or replace work-package audit and human acceptance gates.

## Best Low-Churn Improvements

Use these rules before starting or resuming case implementation work:

1. Start tier-first. Declare the intended tier or `Foundations` track before planning implementation scope.
2. Shape the case before building it. Check story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity against `SSOT-Case-Tier-System.md`.
3. Keep onboarding cases small. If a `Foundations` or Tier 1 case exceeds its budget, reduce or split the case before reclassifying it upward unless the product decision is explicitly to stop making it an onboarding case.
4. Bundle coherent slices. Plan implementation around complete evidence-and-validator slices, not single-row or single-validator polish.
5. Audit once per coherent slice. Prefer one independent audit for a bundled case slice that includes data, validators, UI feedback, and tests when those changes naturally belong together.
6. Match validation to touched surfaces. Documentation-only work uses targeted searches and lifecycle checks; database work also validates fresh-build scripts and version notes; runtime work runs the related unit, integration, or browser checks.
7. Keep closeout mandatory. Work-package planning, independent audit when available, human final decision, handoff refresh, commit-helper finalization, and push remain required for accepted work.

## Tier 1 And Foundations Gate

Use this gate for Case 001 and any future onboarding case before creating an implementation WP.

| Axis | Gate |
|---|---|
| Story steps | 1 to 2 linear steps |
| SQL scope | `SELECT`, `WHERE`, `ORDER BY`, simple `COUNT`; 1 to 2 tables |
| People/entities | 2 to 3 meaningful people or entities |
| Clues/evidence | 2 to 3 clear evidence items |
| Interpretation complexity | No ambiguity, no major red herrings, no unresolved contradictions |

If the planned case exceeds any gate, do one of these before implementation:

- Reduce the case to fit the intended onboarding tier.
- Split the excess material into a later case or later tier.
- Record an explicit product decision to reclassify the case upward.

Do not silently let an intended Tier 1/Foundations case grow into a higher-tier investigation through accumulated milestones, extra entities, broad joins, or unresolved distractors.

## Standard Case Production Lane

Use this sequence for new cases and for substantial changes to gated cases:

1. Intake: write the intended learner outcome, target tier, public case premise, and release intent.
2. Tier gate: check the five tier axes before selecting implementation scope.
3. Authoring plan: fill `docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md` or update the case plan through a scoped WP.
4. Vetting: use `docs/15-case-plans/CASE-VETTING-CHECKLIST.md` before implementation or release review.
5. Bundle plan: group work by coherent evidence progression, validation ownership, and student-facing feedback.
6. Implementation WP: scope only the files needed for that bundle and include graph refresh when known up front.
7. Validation: run checks that match the touched surfaces and record skipped runtime tests when the package is documentation-only.
8. Audit and acceptance: use independent audit when available, then record the human final decision.
9. Closeout: refresh handoff, finalize with the commit helper, and push.

## Bundle Sizing

Use the smallest number of WPs that still keeps review meaningful:

| Tier | Preferred bundle size |
|---|---|
| Foundations / Tier 1 | Whole case or one large case slice when practical |
| Tier 2 / Tier 3 | Two to three coherent story steps when data, validators, UI feedback, and tests can be audited together |
| Tier 4 / Tier 5 | One investigation thread or evidence web per package |

Split a package when the changed surfaces are unrelated, the audit would become unclear, or the package would blur release gates, spoiler boundaries, restricted-data boundaries, or deterministic progression authority.

## Database Seed Work

Fresh database creation scripts are authoritative for authored case content. When a package changes database seed content, it must:

- update the base creation/seed script path in scope, especially `database/02-SequelCityCrimesDB - Insert Data.sql`;
- update the SQL file version number and change date in the script header;
- document reused, modified, new, and avoided rows;
- validate that a clean rebuild creates the intended case content;
- preserve released Case 004 behavior and restricted-data boundaries.

Do not add case-story migrations or `ALTER`-style data-evolution packages for authored case content unless a future SSOT update explicitly changes that rule.

## Validation Selection

Use validation proportional to the package:

| Surface touched | Expected validation |
|---|---|
| Documentation only | Targeted `rg` checks, lifecycle/status helpers, `git diff --check` |
| Case plan or checklist | Targeted tier-axis and spoiler-boundary checks |
| Database seed content | Fresh-build script validation, version/change-date check, relevant backend validator tests |
| Backend validators/API contracts | Related service, route, integration, and negative-path tests |
| Frontend case feedback | Related component/hook tests and browser checks when interaction changes |
| Release gates/persistence/reset | Unit, integration, and browser checks that prove state and access boundaries |

Skipping runtime tests is acceptable only when the package does not touch runtime code or database behavior, and the reason is recorded in `Code Results`.

## Non-Negotiable Boundaries

- SQL-result evidence remains the progression authority.
- Query text, UI state, localStorage, AI output, prompt text, and free-text guesses are not completion authority.
- Spoilers, answer-key rows, hidden solution values, and restricted data stay behind scoped implementation boundaries.
- Case release, persistence, suspect verification, database rebuild/version enforcement, and unlock behavior require separate explicit scope unless bundled by a WP that names those surfaces.
- Workflow improvements must reduce planning churn without removing review gates.
