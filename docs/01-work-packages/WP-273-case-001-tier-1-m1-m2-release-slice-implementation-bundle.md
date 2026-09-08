# case-001-tier-1-m1-m2-release-slice-implementation-bundle

## Objective

Finish the gated Case 001 Tier 1 release-slice implementation path for milestones M1-M2, using only `CrimeSceneReport` and `InterviewLog` evidence, while keeping Case 001 locked/unreleased and excluding all deferred M3-M6, suspect-verification, answer-key, persistence, reset, and release-unlock scope.

## Scope

### In Scope

- Align Case 001 runtime constants, supported milestone types, query-metadata routing, frontend visible milestones, Samuel step counts, and UI feedback with the accepted two-milestone Tier 1 release slice from WP-272.
- Keep M1 `case-001-clocktower-report-located` backed by the public `CrimeSceneReport` row for `CrimeID = 1080`, `ReportDate = 20230502`, `ReportCity = 'Sequel City'`, and non-spoiler clocktower report text.
- Keep M2 `case-001-report-interviews-located` backed by report-linked `InterviewLog` rows resolved from the public clocktower report, without hard-coding generated `ReportID` as an authoring requirement.
- Update deterministic backend Case 001 milestone evaluation so only M1-M2 are active supported milestones for the gated Tier 1 release slice.
- Update frontend Case 001 query guidance, query-assist tokens, visible milestone totals, active leads, and tests so the gated Case 001 path stops after M2.
- Remove or disable active M3/M4 Case 001 UI and metadata paths from the current gated release-slice flow, while preserving deferred documentation in the case plan.
- Update database seed content only if needed to make the fresh-build M1-M2 rows deterministic and aligned with the accepted Case 001 plan; if seed content changes, update the SQL file version number and change date in the header.
- Add or update focused API, frontend, and opt-in browser tests for the M1-M2 gated flow.
- Refresh tracked Understand graph artifacts after implementation.
- Record Code Results and validation evidence in this WP.

### Out of Scope

- Releasing Case 001 to normal playable/default entry.
- Removing or weakening `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON`.
- Implementing M3-M6, `PersonsOfInterest` identity-resolution joins, `EventSchedule`/`EventRegistration` ceremony roster work, `DriversLicense` narrowing, final opportunity transcript, suspect verification, answer-key data, mastermind flow, or culprit submission.
- Implementing Case 001 persistence, restore, reset semantics, release-readiness smoke fixes beyond M1-M2, or release unlock.
- Modifying Case 004 behavior, Case 004 data, Case 004 progression, Case 004 suspect-verification behavior, or shared Case 004 copy.
- Adding migrations for authored Case 001 story content.
- Changing database schema, foreign keys, package manifests, lockfiles, dependencies, runtime AI behavior, SSOT policy, workflow docs, repo-local skills, or lifecycle scripts.
- Broad UI redesign, visual polish unrelated to the M1-M2 gated flow, or large component refactors.

## Impact Analysis

### Understand Status

- Graph available: Yes. `.understand-anything/knowledge-graph.json`, `.understand-anything/fingerprints.json`, `.understand-anything/meta.json`, and `.understand-anything/intermediate/scan-result.json` exist.
- Baseline commit: `cb5cec2d4680039c1d75fa0c5ef3dbcb6f221396` from `.understand-anything/meta.json`.
- Freshness assessment: Usable with structurally relevant Case 001 documentation drift. The only accepted commit after the graph baseline is `6cd8fcf`, WP-272, which changed the Case 001 authoring plan, WP-272 record, handoff, and tracked Understand artifacts. Because this package implements the WP-272 plan across app/API/database surfaces, graph findings were used only as navigation hints and were verified against current source.
- Analysis performed: Read the WP planning skill and checklist, development workflow SSOT, work-package lifecycle, Understand guidance, current graph metadata, changed paths since the graph baseline, WP-271 case-production workflow, WP-272 Case 001 Tier 1 shaping plan, Case 001 authoring plan, Case 001 existing-data inventory, current Case 001 API validators/evaluation service/query route tests, frontend Case 001 constants/module/tests, `useStudentCaseState` Case 001 flow, `StudentPlayableCaseSkeletonView` tests, opt-in browser smoke, package scripts, and targeted graph entries for Case 001 validator/UI/database surfaces.

### Affected Architecture

- Layers: database seed data, backend query-result milestone validation, backend query execution metadata, frontend Case 001 playable shell constants/module, student query runner feedback, frontend Case 001 state/guidance, unit/integration/browser validation, Understand graph artifacts.
- Primary files/components: `database/02-SequelCityCrimesDB - Insert Data.sql`, `apps/api/src/services/case001ResultPatternService.ts`, `apps/api/src/services/case001GatedMilestoneEvaluationService.ts`, `apps/api/src/services/queryExecutionService.ts`, `apps/api/src/routes/queryRoutes.test.ts`, `apps/web/src/studentCase001.ts`, `apps/web/src/studentCaseModule.ts`, `apps/web/src/useStudentCaseState.ts`, `apps/web/src/components/student/StudentPlayableCaseSkeletonView.tsx`, `apps/web/src/api/types.ts`, related focused tests, this WP, closeout handoff, and tracked Understand graph artifacts.
- Upstream consumers: human reviewer, future Case 001 implementation agents, audit agents, student-mode query flow, local API query endpoint, local database fresh-build flow.
- Downstream dependencies: later Case 001 guidance/evidence-board bundle, Case 001 persistence/reset bundle, Case 001 release-readiness smoke package, Case 001 release unlock package, and any future higher-tier expansion/sequel planning for M3-M6.

### Regression Surface

- Related tests: `npm run test --workspace apps/api`, `npm run test --workspace apps/web`, `npm run build`, focused API tests for `case001ResultPatternService`, `case001GatedMilestoneEvaluationService`, `queryExecutionService`, `queryRoutes`, focused frontend tests for `studentCaseModule`, `StudentPlayableCaseSkeletonView`, `App`, `QueryRunner` if touched, opt-in `CASE_001_LIVE_SMOKE=1 VITE_ENABLE_CASE_001_PLAYABLE_SKELETON=true npm run test:browser --workspace apps/web -- case-001-live-smoke.spec.ts` when local API/database/browser prerequisites are available, `scripts/check-understand-refresh-readiness.ps1`, `scripts/refresh-understand-graph.ps1`, `scripts/get-work-package-status.ps1 WP-273`, `scripts/get-work-package-validation-plan.ps1 WP-273`, and `git diff --check`.
- User workflows: gated Case 001 entry when the skeleton gate is enabled, student Query Lab M1 public report lookup, M2 report-linked interview lookup, visible milestone count/lead guidance stopping after M2, evidence logging/notebook feedback for M1-M2, Case 001 remaining locked when gate is disabled, Case 004 normal playable flow.
- Security/data boundaries: read-only SQL safety remains enforced; restricted tables and answer-key data remain blocked; SQL-result evidence remains the only progression authority; query text, UI state, `localStorage`, AI output, prompt text, and free-text guesses remain non-authoritative; Case 001 remains unreleased; no final culprit identity, suspect verification, answer-key row, hidden solution value, or restricted data may be introduced.

### Graph Update Decision

- Regeneration required: Yes.
- Rationale: The planned implementation touches app/API runtime files, database seed content or database seed expectations, tests, and Case 001 progression/guidance surfaces. These are structural surfaces future planning and audit agents will rely on, and the known need is part of this originating WP.

## Files Allowed to Change

The live handoff is closeout-only scope: refresh current state after human acceptance.

Allowed:

- docs/01-work-packages/WP-273-case-001-tier-1-m1-m2-release-slice-implementation-bundle.md
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- database/02-SequelCityCrimesDB - Insert Data.sql
- apps/api/src/services/case001ResultPatternService.ts
- apps/api/src/services/case001ResultPatternService.test.ts
- apps/api/src/services/case001GatedMilestoneEvaluationService.ts
- apps/api/src/services/case001GatedMilestoneEvaluationService.test.ts
- apps/api/src/services/queryExecutionService.ts
- apps/api/src/services/queryExecutionService.test.ts
- apps/api/src/routes/queryRoutes.test.ts
- apps/api/src/types/query.ts
- apps/web/src/api/types.ts
- apps/web/src/api/client.test.ts
- apps/web/src/studentCase001.ts
- apps/web/src/studentCaseModule.ts
- apps/web/src/studentCaseModule.test.ts
- apps/web/src/useStudentCaseState.ts
- apps/web/src/useStudentCaseState.upsert.test.tsx
- apps/web/src/App.test.tsx
- apps/web/src/components/QueryRunner.tsx
- apps/web/src/components/QueryRunner.test.tsx
- apps/web/src/components/student/StudentPlayableCaseSkeletonView.tsx
- apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx
- apps/web/tests/browser/case-001-live-smoke.spec.ts
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md
- docs/15-case-plans/Case-001-Existing-Data-Inventory.md
- docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md
- docs/15-case-plans/CASE-VETTING-CHECKLIST.md
- docs/00-ssot/SSOT-Case-Tier-System.md
- docs/00-ssot/SSOT-Case-Authoring.md
- docs/05-development-workflow/Case-Production-Workflow.md
- docs/05-development-workflow/Work-Package-Lifecycle.md
- docs/01-work-packages/WP-270-*.md
- docs/01-work-packages/WP-271-*.md
- docs/01-work-packages/WP-272-*.md
- apps/api/src/services/caseVerificationService.ts
- apps/api/src/routes/caseRoutes.ts
- apps/web/src/components/student/StudentSuspectTheoryPanel.tsx
- apps/web/src/studentCase.ts
- apps/web/src/features/investigationThreads/**
- database/01-SequelCityCrimesDB - Create DB.sql
- database/03-SequelCityCrimesDB - ForeignKeys.sql
- database/migrations/**
- scripts/**
- tools/**
- .codex/**
- package.json
- package-lock.json
- apps/api/package.json
- apps/web/package.json
- pnpm-lock.yaml
- yarn.lock

## Constraints

- Preserve Case 001 as gated and unreleased unless `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true"`.
- Treat M1-M2 as the only active Case 001 Tier 1 release-slice milestones in runtime/UI metadata.
- Do not implement M3-M6 or leave active M3/M4 affordances in the gated Case 001 flow.
- Do not make final culprit, suspect-verification, answer-key, mastermind, persistence, reset, or release-unlock changes.
- Preserve Case 004 behavior and test coverage.
- Preserve backend read-only SQL safety and restricted-table blocking.
- Preserve deterministic SQL-result evidence as the only Case 001 completion authority.
- Keep generated or refreshed graph artifacts free of temporary directories, trash folders, logs, or local-only run output.
- No new dependencies, package changes, migrations, schema changes, workflow-script changes, or skill changes.
- Keep edits scoped to the allowed files and record all validation evidence in `Code Results`.

## Required Behavior

- Update Case 001 backend supported milestone types, validator maps, and tests so the active gated release slice supports only:
  - `case-001-clocktower-report-located`
  - `case-001-report-interviews-located`
- Remove or disable active M3/M4 validator routing from the gated Case 001 runtime path. If helper functions for deferred milestones are left in place for future reuse, they must not be reachable from active Case 001 query-metadata routing or supported milestone types.
- Ensure the M1 validator matches only returned SQL rows containing the expected public `CrimeSceneReport` fields and required non-spoiler description tokens.
- Ensure the M2 validator matches only the complete expected report-linked `InterviewLog` bundle for the Case 001 clocktower report, excludes the protected Case 004 `ReportID`, and does not rely on SQL text, UI state, prompt text, or guessed values.
- Verify or adjust the fresh-build seed script so the M1 report row and M2 interview rows exist deterministically in `database/02-SequelCityCrimesDB - Insert Data.sql`. If the seed script is modified, update its version number and change date.
- Update frontend Case 001 constants and module contracts so visible milestones, feedback slices, Samuel steps, active leads, status counts, and query-assist tokens represent the two-step Tier 1 path and stop after M2.
- Keep the student query starter prompts broad enough to require learner narrowing; do not prefill the full answer-shaped M1 or M2 query.
- Keep the shared playable shell behind the existing gate and preserve component-memory-only behavior for this package unless the code already uses in-memory milestone state for the gated shell.
- Keep Case 001 query results visible to the learner for M1-M2, but do not expose backend milestone metadata fields such as `matchedRowCount` or `milestoneAdvanced` in student-facing UI.
- Update tests that currently assert M3/M4 active behavior so they instead assert M3/M4 are unsupported/deferred or absent from the active gated path.
- Update the opt-in browser smoke to validate the M1-M2 gated golden path and a final two-of-two completion state without expecting Case 001 release, persistence, suspect verification, or M3/M4 progression.
- Refresh tracked Understand graph artifacts after implementation and before audit.

## Acceptance Criteria

- [x] The active gated Case 001 runtime path contains exactly two active milestones: M1 public `CrimeSceneReport` lookup and M2 report-linked `InterviewLog` lookup.
- [x] M3/M4 Case 001 identity/roster milestones are no longer supported by active gated milestone evaluation, frontend visible milestones, feedback slices, active leads, or smoke expectations.
- [x] M1 and M2 deterministic validators still match expected returned rows and reject empty, partial, unrelated, UI-only, query-text-only, and protected Case 004 result sets.
- [x] Fresh-build database seed content for M1-M2 is present and aligned with validator expectations; if seed content changes, the SQL script version number and change date are updated.
- [x] The frontend gated Case 001 flow starts with broad learner-owned queries, advances in memory on M1 and M2 matched SQL results, displays a two-of-two completion state, and does not persist Case 001 progress.
- [x] Student-facing Case 001 UI does not render raw milestone metadata fields, answer-key data, suspect verification, final culprit identity, or hidden solution values.
- [x] Case 001 remains locked/unreleased by default and renders only when the explicit skeleton gate is enabled.
- [x] Case 004 behavior remains unchanged.
- [x] Related API, frontend, build, lifecycle helper, graph-readiness, graph-refresh, and diff checks are run or their omission is explicitly justified.
- [x] Understand graph artifacts are refreshed after implementation.
- [x] Validation evidence is recorded in `Code Results`.
- [x] No unrelated files changed

## Code Prompt

Implement WP-273 exactly as specified.

Context:
- WP-272 accepted Case 001 as a Tier 1/Foundations onboarding release slice with only M1-M2 active for release.
- M3-M6, suspect verification, answer-key data, database rebuild/version enforcement, persistence/reset, and release unlock are deferred future scope.
- Current source still contains prior M3/M4 Case 001 validator/UI/test paths. This package should align active runtime behavior with the accepted M1-M2 release slice.

Required implementation:
- Update backend Case 001 milestone support so only M1 and M2 are active supported gated milestones.
- Keep M1 and M2 validators deterministic and row-result based.
- Remove, disable, or make unreachable active M3/M4 evaluation routes from supported milestone normalization and default validator maps.
- Update frontend Case 001 constants/module/use-state flow so the gated path exposes exactly two active milestones, two SQL feedback slices, two Samuel steps, and two-of-two completion status.
- Keep learner query starters broad, not answer-prefilled.
- Keep Case 001 behind `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON`.
- Verify or update the base seed script M1-M2 data. If the seed script changes, update its version number and change date.
- Update focused tests and the opt-in browser smoke for the M1-M2 path.
- Refresh tracked Understand graph artifacts.
- Record Code Results and validation evidence in this WP.

Validation:
- Run `npm run test --workspace apps/api`.
- Run `npm run test --workspace apps/web`.
- Run `npm run build`.
- Run targeted `rg` checks proving active Case 001 runtime/UI/test paths no longer expose M3/M4 as supported active milestones and still expose M1/M2.
- Run targeted `rg` checks proving no active Case 001 answer-key, culprit, suspect-verification, release-unlock, or persistence scope was added.
- Run `scripts/check-understand-refresh-readiness.ps1` before and after graph refresh.
- Run `scripts/refresh-understand-graph.ps1`.
- Run `scripts/get-work-package-status.ps1 WP-273`.
- Run `scripts/get-work-package-validation-plan.ps1 WP-273`.
- Run `git diff --check`.
- Run the opt-in `case-001-live-smoke.spec.ts` only when the local API, database, and browser prerequisites are available; otherwise record the exact blocker and keep unit/build evidence complete.

Do not modify files outside the allowed list. Do not release Case 001, implement M3-M6, add persistence/reset, add suspect verification, add answer-key data, change Case 004 behavior, add migrations, change packages or lockfiles, change scripts, change SSOT/workflow docs, or introduce runtime AI behavior.

## Audit Prompt

Audit WP-273 with an adversarial stance.

Verify:
- The active gated Case 001 implementation path contains exactly M1-M2 and stops after two active milestones.
- Backend supported milestone ids, default validator routing, query execution metadata, frontend types, frontend visible milestones, feedback slices, Samuel steps, status counts, and browser smoke expectations are aligned around M1-M2.
- M3/M4 and all deferred M3-M6 surfaces are absent from active Case 001 runtime/UI routing or explicitly unsupported/deferred.
- M1/M2 validators remain deterministic, row-result based, and independent of query text, UI state, localStorage, AI output, prompt text, or free-text guesses.
- Database seed content for M1-M2 is deterministic and aligned with validator expectations; any seed-content change updated the SQL script version number and change date.
- Case 001 remains locked/unreleased by default and only accessible through the existing explicit skeleton gate.
- No suspect-verification, answer-key, culprit, mastermind, persistence/reset, release-unlock, migration, schema, dependency, package, script, skill, SSOT, workflow, or Case 004 behavior drift was introduced.
- Student-facing UI does not expose backend milestone metadata internals, answer-key data, hidden solution values, or final culprit identity.
- Tests and validation evidence match the touched surfaces, including clear handling of opt-in live smoke availability.
- Changed files stay inside the allowed list.
- Graph regeneration was performed and generated graph artifacts contain no transient trash/log/temp content.
- Understand output did not override SSOT, source, tests, or observed behavior.

Output:
- Verdict: PASS or FAIL
- Scope violations
- M1-M2 implementation defects
- Deferred-scope leakage
- Runtime/data/security boundary risks
- Test or validation gaps
- Drift risks

## Code Results

Implemented WP-273 as a gated Case 001 M1-M2 release-slice implementation bundle.

### File Changes

- Narrowed active Case 001 web milestone types, SQL feedback slices, Samuel steps, query-guide tokens, milestone counts, completion state, reset behavior, and next-draft progression to M1 `CrimeSceneReport` and M2 `InterviewLog`.
- Narrowed Case 001 API result-pattern and gated milestone evaluation surfaces to support only the M1 report and M2 interview validators; deferred M3/M4 opt-ins no longer produce active milestone metadata.
- Updated API, web, component, integration, and browser-smoke tests so M1-M2 is the active Case 001 slice and M3/M4 are deferred/unsupported.
- Refreshed tracked Understand graph artifacts after implementation.

### Validation

- PASS: `npm run test --workspace apps/api`.
- PASS: `npm run test --workspace apps/web`.
- PASS: `npm run build`.
- PASS: `npm run build --workspace apps/web`.
- PASS: targeted active-source `rg` check found no web/runtime Case 001 M3/M4 routing, labels, roster/identity query cards, or stale 1/4 and 3/4 milestone-count expectations in active Case 001 source paths.
- SKIPPED with blocker recorded: `$env:CASE_001_LIVE_SMOKE='1'; $env:VITE_ENABLE_CASE_001_PLAYABLE_SKELETON='true'; npm run test:browser --workspace apps/web -- case-001-live-smoke.spec.ts` skipped because the live API was unavailable at `http://127.0.0.1:3001/api/health/full` with `ECONNREFUSED 127.0.0.1:3001`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh reported `READY`.
- PASS: `scripts/refresh-understand-graph.ps1`; graph rebuilt with `filesScanned=657`, `nodes=1058`, `edges=401`, `layers=6`, `tourSteps=7`, and `Fingerprints baseline: 657 files`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh reported `READY`.
- PASS: `scripts/get-work-package-status.ps1 WP-273` reported no out-of-scope dirty files before Code Results were recorded.
- PASS: `scripts/get-work-package-validation-plan.ps1 WP-273` reported the planned validation surface and did not block audit readiness.
- PASS: `git diff --check` passed; only Git LF-to-CRLF working-copy warnings were emitted for modified source, test, and Understand JSON artifacts.
- PASS: `git status --short` showed only WP-273 allowed files changed or added after generated build outputs were restored.

## Audit Results

Verdict: PASS

The implementation of [WP-273](docs/01-work-packages/WP-273-case-001-tier-1-m1-m2-release-slice-implementation-bundle.md) successfully narrows the active gated Case 001 runtime and UI progression path to exactly **M1** (`case-001-clocktower-report-located`) and **M2** (`case-001-report-interviews-located`). Active routing, validation, guidance, feedback slices, visible milestones, and smoke assertions stop cleanly after two milestones, while former M3/M4 paths and deferred M3-M6 scope have been completely decoupled or explicitly asserted as unsupported.

---

### Scope Violations
* **None observed.**
* All modified files are strictly within the allowed list defined in [WP-273](docs/01-work-packages/WP-273-case-001-tier-1-m1-m2-release-slice-implementation-bundle.md#L60-L92):
  * `scripts/get-work-package-status.ps1 WP-273` confirmed 0 out-of-scope dirty files.
  * No package manifests (`package.json`), lockfiles (`pnpm-lock.yaml`, `package-lock.json`), database schemas, migrations, workflow scripts, or repository skills were altered.
  * No suspect-verification endpoints, answer keys, culprit resolution, persistence/reset storage, or default release unlock mechanisms were introduced.

---

### M1-M2 Implementation Defects
* **None observed.**
* **M1 Validator Determinism & Scope:** [`validateCase001ClocktowerReportLocated`](apps/api/src/services/case001ResultPatternService.ts#L60-L72) in [`case001ResultPatternService.ts`](apps/api/src/services/case001ResultPatternService.ts) deterministically validates returned rows against `CrimeID = 1080`, `ReportDate = 20230502`, `ReportCity = 'Sequel City'`, and non-spoiler text tokens (`"clocktower"`, `"ceremony"`, `"toast"`, `"bell sequence"`, `"suspected poisoning"`).
* **M2 Validator Determinism & Scope:** [`validateCase001ClocktowerReportInterviewsLocated`](apps/api/src/services/case001ResultPatternService.ts#L74-L87) validates report-linked rows for expected person IDs (`27590`, `50417`, `62764`), explicitly rejects empty `ReportID` or Case 004's protected `ReportID = 10975`, verifies transcript tokens per person, and enforces full coverage (`containsAllExpectedPersonIds`).
* **Row-Result Independence:** Both validators inspect only returned row objects. SQL query text, UI state, `localStorage`, AI prompts, and free-text inputs are non-authoritative and rejected when returned rows are missing or mismatched (verified in [`case001ResultPatternService.test.ts`](apps/api/src/services/case001ResultPatternService.test.ts)).
* **Progression Termination:** In [`useStudentCaseState.ts`](apps/web/src/useStudentCaseState.ts#L3790-L3825), completing M1 seeds the M2 starter query; completing M2 returns `null` for next draft queries, clamps Samuel steps at Step 2, leaves remaining active leads empty, and registers completion as `2 / 2`.
* **Database Alignment:** Deterministic seed fixtures for M1 (`CrimeSceneReport:11592`) and M2 (`InterviewLog:40305-40370`) are already present in [`database/02-SequelCityCrimesDB - Insert Data.sql`](database/02-SequelCityCrimesDB%20-%20Insert%20Data.sql). Because existing base script rows aligned with validator expectations, no seed changes were required.

---

### Deferred-Scope Leakage
* **None observed.**
* **API Routing:** In [`case001GatedMilestoneEvaluationService.ts`](apps/api/src/services/case001GatedMilestoneEvaluationService.ts#L23-L75), [`Case001SupportedMilestoneId`](apps/api/src/services/case001GatedMilestoneEvaluationService.ts#L24-L26) and [`DEFAULT_VALIDATORS`](apps/api/src/services/case001GatedMilestoneEvaluationService.ts#L69-L75) contain only M1 and M2. Former M3 (`case-001-witness-identities-resolved`) and M4 (`case-001-ceremony-roster-narrowed`) evaluation requests return `unsupported-milestone` with `evaluated: false`.
* **Query Route Transport:** In [`queryExecutionService.ts`](apps/api/src/services/queryExecutionService.ts#L165-L188), requests specifying milestone IDs outside M1/M2 return `undefined`, entirely omitting `caseMilestoneEvaluation` from the response body (tested in [`queryExecutionService.test.ts`](apps/api/src/services/queryExecutionService.test.ts#L324-L370) and [`queryRoutes.test.ts`](apps/api/src/routes/queryRoutes.test.ts#L179-L260)).
* **Frontend Web Types & Slices:** In [`apps/web/src/api/types.ts`](apps/web/src/api/types.ts#L125-L132) and [`studentCase001.ts`](apps/web/src/studentCase001.ts#L225-L342), types, boundaries, feedback slices, visible milestones, and Samuel briefing steps contain only M1 and M2.
* **Query-Assist Tokens:** `case001QueryGuide.tokens` in [`useStudentCaseState.ts`](apps/web/src/useStudentCaseState.ts#L4425-L4440) contains only table and column tokens relevant to M1 and M2 (`CrimeSceneReport`, `InterviewLog`, `ReportID`, `CrimeID`, `ReportDate`, `ReportCity`, `Sequel City`); all references to `PersonsOfInterest`, `EventSchedule`, and `EventRegistration` have been removed.

---

### Runtime / Data / Security Boundary Risks
* **Gate Enforcement:** Access to Case 001 remains strictly guarded by [`VITE_ENABLE_CASE_001_PLAYABLE_SKELETON`](apps/web/src/studentCase001.ts#L11). When disabled, [`getPlayableStudentCaseModule`](apps/web/src/studentCaseModule.ts#L211-L213) returns `null`, and backend execution disables milestone evaluation.
* **Student UI Isolation:** Student UI components ([`StudentPlayableCaseSkeletonView.tsx`](apps/web/src/components/student/StudentPlayableCaseSkeletonView.tsx)) expose only high-level authored mentor copy. Raw backend metadata fields (`matchedRowCount`, `milestoneAdvanced`, internal gate flags) and answer-key values are neither rendered nor stored in DOM or client storage (verified in [`case-001-live-smoke.spec.ts`](apps/web/tests/browser/case-001-live-smoke.spec.ts#L212-L213)).
* **No Persistence Leakage:** Case 001 state remains strictly in component memory (`persistence.strategy = "none"` in [`studentCase001.ts`](apps/web/src/studentCase001.ts#L418-L423)). No Case 001 entries are written to `localStorage`.

---

### Test or Validation Gaps
* **Unit & Integration Suite Pass:**
  * `npm run test --workspace apps/api` passed (all suites clean).
  * `npm run test --workspace apps/web` passed (17 files, 223 tests passed).
  * `npm run build` and `npm run build --workspace apps/web` succeeded without error.
* **Opt-In Live Smoke Handling:**
  * [`case-001-live-smoke.spec.ts`](apps/web/tests/browser/case-001-live-smoke.spec.ts) handles live backend availability gracefully with explicit skip classification when `127.0.0.1:3001` is offline.
  * *Cosmetic Annotation Note:* Line 160 of [`case-001-live-smoke.spec.ts`](apps/web/tests/browser/case-001-live-smoke.spec.ts#L160) specifies `type: "WP-254 blocker"` in the Playwright test annotation rather than `"WP-273 blocker"` (even though `formatBlocker` at Line 37 correctly prefixes `WP-273 live smoke blocker:`). This does not impact test execution, logic, or outcome.

---

### Drift Risks
* **Understand Graph Health:**
  * Tracked Understand graph artifacts were regenerated and validated via `scripts/check-understand-refresh-readiness.ps1` (status `READY`).
  * `.understand-anything/intermediate/scan-result.json` and `knowledge-graph.json` were audited for ephemeral trash, logs, or temporary directories; none exist.
  * Baseline fingerprint count matches the 657 scanned repository files.
* **Case 004 Stability:**
  * Case 004 suspect verification ([`caseVerificationService.ts`](apps/api/src/services/caseVerificationService.ts)), progression rules, gym/symphony threads, and full test suites remain completely untouched and passing.
* **Authoring Metadata Note:**
  * In [`studentCase001.ts`](apps/web/src/studentCase001.ts#L202), `CASE_001_FIRST_SQL_MILESTONE_BOUNDARY.runtimeStatus` retains `"boundary-only-not-implemented"` from previous planning drafts, whereas M2 reflects `"gated-non-progressing"`. Because active runtime milestone routing relies on `CASE_001_SQL_FEEDBACK_SLICES` and `evaluateCase001GatedMilestone`, this discrepancy has no runtime or behavioral consequence.

## Final Decision

Accepted by the human reviewer on 2026-09-08 after the recorded PASS audit. The reviewer explicitly authorized closeout, including handoff refresh, commit, and push.

The gated M1-M2 implementation satisfies the accepted scope. API/web tests and builds passed as recorded above; live smoke was skipped because the local API refused the connection. The two audit metadata notes are nonblocking and remain documented. Case 001 remains gated and unreleased, with persistence/reset and release unlock reserved for future work packages.
