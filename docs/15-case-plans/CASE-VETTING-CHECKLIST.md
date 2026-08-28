# Case Vetting Checklist

Use this checklist before implementing or releasing a Sequel Detective case.

Authority:

- `docs/00-ssot/SSOT-Case-Tier-System.md`
- `docs/00-ssot/SSOT-Case-Authoring.md`
- `docs/00-ssot/SSOT-Case-Progression.md`
- `docs/00-ssot/SSOT-Database-Schema.md`
- `docs/00-ssot/SSOT-SQL-Safety-Rules.md`

## Pre-Implementation Vetting

- [ ] The case has a stable case id and public case number/name.
- [ ] The case declares a tier or explicitly declares `Foundations` as a pre-tier/on-ramp label.
- [ ] `Foundations` cases satisfy the Tier 1 contract unless a future SSOT update authorizes otherwise.
- [ ] The case declares all five tier axes: story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity.
- [ ] The declared tier matches all five axes, not only the SQL syntax.
- [ ] Investigation complexity is the primary difficulty driver.
- [ ] SQL syntax novelty is not used as a substitute for authored evidence.
- [ ] The completion criteria are explicit.
- [ ] The completion signal is explicit.
- [ ] Completion authority comes from SQL query results, not query text, free text, UI state, localStorage, AI output, prompt intent, or narrative assertion.
- [ ] Tiers 1 through 4 have one deterministic completion outcome.
- [ ] Tier 5, if used, has an auditable evaluation framework for multiple defensible conclusions.
- [ ] No culprit identity, answer-key value, hidden solution row, restricted table content, or final solve path appears in learner-facing materials.
- [ ] Every milestone references at least one declared evidence table family.
- [ ] Evidence data is intentionally authored or intentionally reused; the case does not rely on random row coincidence.
- [ ] Planned fresh-build seed edits include version/change-date documentation requirements when database scripts will change.
- [ ] Case 004 protected rows and existing released behavior are identified before data reuse or modification.
- [ ] Red herrings and ambiguity comply with the declared tier.
- [ ] Tiers 1 through 3 use only clearly resolvable distractors, not major red herrings.
- [ ] Samuel guidance helps the learner reason without revealing answer-key values or final solve paths.
- [ ] The planned implementation bundles are coherent and auditable.

## Implementation Bundle Guidance

- [ ] Foundations or Tier 1 work is bundled as a whole case or large case slice when practical.
- [ ] Tier 2 or Tier 3 work bundles two to three story steps per WP when data, validators, UI feedback, and tests can be reviewed together.
- [ ] Tier 4 or Tier 5 work is bundled by investigation thread or evidence web rather than single-row polish.
- [ ] Each bundle still has a work package, allowed-file scope, validation plan, independent audit when available, human final decision, handoff refresh, and commit-helper closeout.
- [ ] Out-of-scope findings become follow-up WPs instead of being silently added to the active package.

## Pre-Release Vetting

- [ ] The implemented case still matches its declared tier across all five axes.
- [ ] The public case-library metadata matches the approved public dossier.
- [ ] The case can be completed using backend-approved read-only SQL results.
- [ ] Result-pattern validators or final evaluation checks are deterministic for Tiers 1 through 4.
- [ ] Restricted-table and answer-key access remains blocked from learner SQL and frontend state.
- [ ] All required evidence data exists in the fresh-build database scripts.
- [ ] Local database version/rebuild expectations are documented and enforced by the scoped release plan.
- [ ] Learner-owned persistence and reset behavior are implemented when release requires restore.
- [ ] Reset clears only learner-owned progress for the active case.
- [ ] Query history, database state, browser history, other cases, and unrelated localStorage keys are not cleared by case reset.
- [ ] Positive and negative suspect-verification or final-evaluation paths are tested.
- [ ] At least one plausible wrong submission or wrong final result is tested when the tier requires suspect verification.
- [ ] A golden-path playthrough passes against a fresh local database.
- [ ] Browser or live-stack smoke coverage matches the released entry path.
- [ ] Human final acceptance is recorded in the release WP.

## Audit Prompts Should Check

- Tier-axis compliance.
- Deterministic completion and SQL-result authority.
- Spoiler and restricted-data boundaries.
- Data coherence and avoidance of random-row clue logic.
- Lower-tier ambiguity/red-herring limits.
- Bundle scope discipline.
- Validation evidence aligned to the changed files.
