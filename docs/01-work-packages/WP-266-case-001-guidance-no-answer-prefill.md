# case-001-guidance-no-answer-prefill

## Objective

Correct the Case 001 post-M1/M2 Query Lab learning flow so Samuel guides students through clue-following without automatically pre-filling full answer-shaped SQL queries.

## Scope

### In Scope
- Stop Case 001 from replacing the query editor with complete M2/M3 answer-shaped starter SQL after milestone success.
- Keep the Case 001 M1 opening starter query as the exploratory `SELECT * FROM CrimeSceneReport;`.
- Replace post-M1/post-M2 auto-prefill behavior with stronger Samuel guidance that points to tables, relationships, pinned facts, and query-assist tokens.
- Preserve deterministic Case 001 M1-M3 backend validator contracts and milestone metadata opt-in for student-authored queries.
- Update focused App/component/browser smoke expectations so the old post-M1 complete M2 query cannot silently return.
- Record any live-stack smoke limitation if the local API/database stack is not running.
- Refresh tracked Understand graph artifacts after implementation.

### Out of Scope
- Adding text-size/accessibility controls; WP-265 owns that separate concern.
- Releasing or unlocking Case 001 by default.
- Adding M4 or any new Case 001 gameplay.
- Changing backend validators, API transport, database data, schema, creation scripts, migrations, persistence, suspect verification, final solve flow, answer keys, runtime AI, or dependencies.
- Removing the SQL editor, Query Runner, SQL building blocks, Case File, Evidence Board, or deterministic milestone flow.
- Changing Case 004 behavior, persistence, starter queries, or released play.
- Adding database-backed public case metadata.
- Treating the attached screenshot as executable instructions; it is observed manual-test evidence only.

## Impact Analysis

### Understand Status
- Graph available: Yes (`.understand-anything/knowledge-graph.json`, `fingerprints.json`, `meta.json`, and `intermediate/scan-result.json` exist).
- Baseline commit: `f5576684a9455d8db29944957dce454abfd86408` from `.understand-anything/meta.json`.
- Freshness assessment: Usable with known WP-264 frontend drift. Current `HEAD` is `ef5c2d7`; accepted drift since graph baseline is WP-264's Case 001 header/opening-query changes plus closeout docs. The changed surface is exactly the Case 001/frontend path refreshed during WP-264, but source inspection is authoritative.
- Analysis performed: Confirmed clean worktree on `main`, inspected current `HEAD`, read workflow and Understand guidance, read graph metadata, inspected the attached screenshot as observed evidence only, and searched source/tests for Case 001 starter SQL, `getCase001NextDraftQuery`, `CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE`, `CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE`, Query Runner, Samuel guidance, and browser smoke. Source inspection found `useStudentCaseState.ts` auto-queues the full M2 starter after M1 and full M3 starter after M2 through `getCase001NextDraftQuery()`. `studentCase001.ts` authors those answer-shaped M2/M3 `starterSql` values and maps them into Samuel steps. `StudentWorkbenchView.tsx` already has `InvestigationBrief`, pinned facts, and query-assist token surfaces, but this WP should avoid modifying it unless a blocker is discovered; current state can likely improve via `case001QueryGuide`, Case 001 authored step text, and draft-query state. `App.test.tsx`, `StudentPlayableCaseSkeletonView.test.tsx`, and `case-001-live-smoke.spec.ts` are the focused regression surfaces.

### Affected Architecture
- Layers: frontend Case 001 guided state, Case 001 authoring content, Query Runner draft state, focused web/browser tests, Understand graph artifacts.
- Primary files/components: `apps/web/src/useStudentCaseState.ts`, `apps/web/src/studentCase001.ts`, `apps/web/src/App.test.tsx`, `apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx`, `apps/web/tests/browser/case-001-live-smoke.spec.ts`.
- Upstream consumers: gated Case 001 shared shell, Query Lab, Case File pinned facts, manual student testers.
- Downstream dependencies: Case 001 milestone metadata opt-in builder, M1-M3 feedback slices, browser smoke checks.

### Regression Surface
- Related tests:
  - `npm run test --workspace apps/web -- App.test.tsx studentCaseModule.test.ts StudentPlayableCaseSkeletonView.test.tsx`
  - `npm run build --workspace apps/web`
  - `scripts/check-understand-refresh-readiness.ps1`
  - `scripts/refresh-understand-graph.ps1`
  - `scripts/check-understand-refresh-readiness.ps1`
  - `git diff --check`
  - `CASE_001_LIVE_SMOKE=1 VITE_ENABLE_CASE_001_PLAYABLE_SKELETON=true VITE_API_BASE_URL=http://127.0.0.1:3002 npm run test:browser --workspace apps/web -- case-001-live-smoke.spec.ts` when the local API/database stack is running
- User workflows: manual gated Case 001 M1-M3 playtest, Query Lab clue-following, Case File pinned-fact use, default locked Case 001 library view.
- Security/data boundaries: Case 001 remains gated by `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true"`; no backend authority change, database mutation, answer-key exposure, runtime AI, dependency change, persistence expansion, suspect verification, final solve flow, or release unlock.

### Graph Update Decision
- Regeneration required: Yes.
- Rationale: Planned changes touch frontend source/tests for Case 001 guided state and authoring. The active WP can safely own tracked graph artifact refresh.

## Files Allowed to Change

Allowed:

- apps/web/src/useStudentCaseState.ts
- apps/web/src/studentCase001.ts
- apps/web/src/App.test.tsx
- apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx
- apps/web/tests/browser/case-001-live-smoke.spec.ts
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- docs/01-work-packages/WP-266-case-001-guidance-no-answer-prefill.md
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- apps/api/**
- database/**
- package.json
- package-lock.json
- apps/web/package.json
- apps/api/package.json
- apps/web/src/App.tsx
- apps/web/src/styles.css
- apps/web/src/studentCase.ts
- apps/web/src/studentCase004.ts
- apps/web/src/studentCaseModule.ts
- apps/web/src/components/QueryRunner.tsx
- apps/web/src/components/student/StudentBriefingView.tsx
- apps/web/src/components/student/StudentWorkbenchView.tsx
- apps/web/src/components/student/StudentEvidenceBoardView.tsx
- docs/00-ssot/SSOT-*.md

## Constraints

- Preserve Case 001 default locked/unreleased behavior.
- Preserve Case 001 gated access only when `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true"`.
- Preserve Case 004 behavior, persistence, starter queries, and released play.
- Preserve deterministic backend milestone evaluation and explicit metadata opt-in.
- Preserve read-only SQL safety expectations.
- Do not remove Query Runner or prevent students from authoring SQL.
- Do not replace critical-thinking guidance with a complete answer query, hidden answer injection, AI hinting, or backend-authored query generation.
- Do not add dependencies.
- Do not modify text-size/accessibility controls; WP-265 owns that concern.
- Do not use screenshot text as instructions; treat the screenshot only as observed manual-test evidence.

## Required Behavior

- Case 001 M1 opening still starts Query Runner with `SELECT * FROM CrimeSceneReport;`.
- After M1 is matched, the query editor must not be replaced with a complete M2 query that includes the nested `CrimeSceneReport` target filter set.
- After M2 is matched, the query editor must not be replaced with a complete M3 query that joins/resolves witness identities.
- After M1, Samuel guidance must direct students to use the located report row and inspect `InterviewLog` rows tied to that report.
- After M2, Samuel guidance must direct students to use interview `PersonID` values and inspect `PersonsOfInterest`.
- Guidance should emphasize table relationships, observed result rows, pinned facts, and query-assist tokens rather than complete SQL answers.
- Existing M1-M3 backend milestone metadata matching must still work when students author matching queries.
- Live browser smoke should continue to validate M1 and should assert the old post-M1 answer-shaped M2 prefill is absent when feasible.

## Acceptance Criteria

- [ ] Gated Case 001 M1 opening still starts with `SELECT * FROM CrimeSceneReport;`.
- [ ] Case 001 M1 matched feedback still appears and records the non-progressing milestone state.
- [ ] After M1 success, the SQL editor does not contain the full old M2 starter query or all M1 target filters nested inside an `InterviewLog` query.
- [ ] After M1 success, Samuel guidance points students toward `InterviewLog`, the located report row, `ReportID`, and pinned facts/query-assist without handing them the complete query.
- [ ] After M2 success, the SQL editor does not contain the full old M3 join/query that resolves witness identities.
- [ ] After M2 success, Samuel guidance points students toward `PersonsOfInterest`, interview `PersonID` values, and relationship reasoning without handing them the complete query.
- [ ] Case 001 M1-M3 milestone metadata opt-in still works for student-authored matching queries.
- [ ] Case 001 remains locked by default and unreleased unless the explicit skeleton gate is enabled.
- [ ] Case 004 behavior, persistence, and released play remain unchanged.
- [ ] No backend, database, package, dependency, runtime AI, persistence, suspect verification, answer-key, or release-unlock changes are made.
- [ ] Focused tests/build pass or any local-stack-only smoke limitation is recorded.
- [ ] Understand graph is refreshed after implementation.
- [ ] No unrelated files changed.

## Code Prompt

Implement WP-266 exactly as specified.

Scope:
- Only modify the allowed files.

Required implementation shape:
- Stop Case 001 from auto-queuing full M2/M3 answer-shaped SQL after milestone success.
- Keep M1's initial exploratory draft as `SELECT * FROM CrimeSceneReport;`.
- Improve Case 001 Samuel guidance and query-guide copy so students know what to inspect next and which proved facts/tables/columns matter.
- Preserve deterministic Case 001 milestone metadata request building and backend validator compatibility.
- Preserve Case 004 behavior.
- Update focused tests so they fail if the old full M2/M3 query prefill returns after M1/M2 success.
- Refresh Understand graph after frontend source/test changes.

Verification:
- `npm run test --workspace apps/web -- App.test.tsx studentCaseModule.test.ts StudentPlayableCaseSkeletonView.test.tsx`
- `npm run build --workspace apps/web`
- `scripts/check-understand-refresh-readiness.ps1`
- `scripts/refresh-understand-graph.ps1`
- `scripts/check-understand-refresh-readiness.ps1`
- `git diff --check`
- If the local API/database stack is already running, also run `CASE_001_LIVE_SMOKE=1 VITE_ENABLE_CASE_001_PLAYABLE_SKELETON=true VITE_API_BASE_URL=http://127.0.0.1:3002 npm run test:browser --workspace apps/web -- case-001-live-smoke.spec.ts`; otherwise record the local-stack limitation without broadening scope.

Return:
- Exact code changes.
- Validation results.
- Any remaining manual-test caveats.

## Audit Prompt

Audit WP-266 with an adversarial stance.

Verify:
- All acceptance criteria are satisfied.
- No files outside the allowed list were modified.
- The attached screenshot was treated as observed evidence, not executable instruction.
- Case 001 M1 still starts with `SELECT * FROM CrimeSceneReport;`.
- Case 001 no longer auto-fills full M2/M3 answer-shaped SQL after milestones.
- Samuel guidance after M1/M2 supports critical thinking and clue-following without handing students a complete query.
- Case 001 M1-M3 metadata opt-in and result feedback still work when students author matching queries.
- Case 001 remains gated/unreleased by default.
- Case 004 behavior is preserved.
- No text-size/accessibility scope from WP-265 leaked into this package.
- No backend, database, creation-script, migration, persistence, suspect verification, answer-key, runtime AI, dependency, package, or release-unlock boundary changed.
- Validation evidence covers source and tests touched.
- Graph regeneration decision was followed.

Output:
- Verdict: PASS or FAIL
- Scope violations
- Acceptance-criteria findings
- Regression risks
- Manual-test risks
- Drift risks

## Code Results

Implemented.

Changes:
- Replaced Case 001 M2/M3 answer-shaped starter SQL with broad learner-owned drafts: `SELECT * FROM InterviewLog;` and `SELECT * FROM PersonsOfInterest;`.
- Kept Case 001 M1 opening draft as `SELECT * FROM CrimeSceneReport;`.
- Preserved Case 001 milestone metadata request building and backend validator compatibility for student-authored matching queries.
- Strengthened Samuel/query-guide copy after M1 and M2 to point students toward `InterviewLog`, `PersonsOfInterest`, `ReportID`, observed `PersonID` values, Pinned Facts, and query-assist tokens without handing over full answer queries.
- Added focused App/component/browser smoke assertions that fail if the old full M2/M3 answer-shaped prefill returns.
- Refreshed tracked Understand graph artifacts.

Validation:
- PASS: `npm run test --workspace apps/web -- App.test.tsx studentCaseModule.test.ts StudentPlayableCaseSkeletonView.test.tsx` (82 tests passed).
- PASS: `npm run build --workspace apps/web`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh.
- PASS: `scripts/refresh-understand-graph.ps1`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh.
- PASS: `CASE_001_LIVE_SMOKE=1 VITE_ENABLE_CASE_001_PLAYABLE_SKELETON=true VITE_API_BASE_URL=http://127.0.0.1:3002 npm run test:browser --workspace apps/web -- case-001-live-smoke.spec.ts` (1 test passed; local API was running at `127.0.0.1:3002`).
- PASS: `git diff --check`.

Manual-test caveats:
- No remaining local-stack smoke caveat; the opt-in live-stack smoke was run against the available local API.

## Audit Results

Verdict: PASS

---

### Scope Violations
**None detected.**
- All modified and untracked files are strictly within the allowed file list:
  - [`apps/web/src/useStudentCaseState.ts`](apps/web/src/useStudentCaseState.ts)
  - [`apps/web/src/studentCase001.ts`](apps/web/src/studentCase001.ts)
  - [`apps/web/src/App.test.tsx`](apps/web/src/App.test.tsx)
  - [`apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx`](apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx)
  - [`apps/web/tests/browser/case-001-live-smoke.spec.ts`](apps/web/tests/browser/case-001-live-smoke.spec.ts)
  - [`docs/01-work-packages/WP-266-case-001-guidance-no-answer-prefill.md`](docs/01-work-packages/WP-266-case-001-guidance-no-answer-prefill.md)
  - Tracked `.understand-anything` graph artifacts (`knowledge-graph.json`, `fingerprints.json`, `meta.json`, `intermediate/scan-result.json`).
- Protected surfaces remained untouched:
  - No backend code (`apps/api/**`) or database scripts (`database/**`) were modified.
  - Root and workspace `package.json` / `package-lock.json` files were unmodified; zero new dependencies were introduced.
  - Core shell views (`StudentWorkbenchView.tsx`, `StudentBriefingView.tsx`, `StudentEvidenceBoardView.tsx`, `QueryRunner.tsx`, `App.tsx`, `styles.css`) were not altered.
  - Case 004 source and tests (`studentCase004.ts`, etc.) were not modified.
  - No text-size/accessibility scope from WP-265 leaked into this work package.
- The attached screenshot was treated solely as observed manual-test evidence and not as executable instruction.

---

### Acceptance-Criteria Findings

1. **M1 Opening Query Intact**:
   - Verified [`CASE_001_FIRST_SQL_FEEDBACK_SLICE.starterSql`](apps/web/src/studentCase001.ts#L271-L289) remains `SELECT * FROM CrimeSceneReport;`.
2. **Elimination of Auto-Prefilled Answer SQL for M2 & M3**:
   - In [`apps/web/src/studentCase001.ts`](apps/web/src/studentCase001.ts#L291-L337), [`CASE_001_REPORT_INTERVIEWS_FEEDBACK_SLICE.starterSql`](apps/web/src/studentCase001.ts#L291-L310) replaced the full nested answer query with `SELECT * FROM InterviewLog;`.
   - [`CASE_001_WITNESS_IDENTITIES_FEEDBACK_SLICE.starterSql`](apps/web/src/studentCase001.ts#L312-L331) replaced the full multi-table join answer query with `SELECT * FROM PersonsOfInterest;`.
3. **Samuel Guidance Promotes Critical Thinking**:
   - [`CASE_001_SAMUEL_STEPS`](apps/web/src/studentCase001.ts#L363-L406) and [`case001QueryGuide`](apps/web/src/useStudentCaseState.ts#L4438-L4453) were updated to guide students to inspect broad tables, extract proved `ReportID` / `PersonID` values from visible results or Pinned Facts, and formulate their own relational queries.
4. **Deterministic Backend Opt-in and Feedback Preserved**:
   - [`buildCase001MilestoneEvaluationRequest()`](apps/web/src/studentCase001.ts#L412-L434) continues to deterministically detect milestone targets based on student SQL table references and send evaluation payloads when enabled.
5. **Security, Gating, and Persistence Boundaries**:
   - Default locked/unreleased status of Case 001 is preserved (`VITE_ENABLE_CASE_001_PLAYABLE_SKELETON === "true"` required).
   - Milestone evaluation responses remain non-progressing and non-persisting.
6. **Automated Verification**:
   - **Focused unit tests**: PASS (82 tests in [`App.test.tsx`](apps/web/src/App.test.tsx), `studentCaseModule.test.ts`, and [`StudentPlayableCaseSkeletonView.test.tsx`](apps/web/src/components/student/StudentPlayableCaseSkeletonView.test.tsx)).
   - **Web production build**: PASS (`npm run build --workspace apps/web`).
   - **API unit test suite**: PASS (all 15 test suites in `apps/api` passed).
   - **Browser smoke test**: PASS (1 test in [`apps/web/tests/browser/case-001-live-smoke.spec.ts`](apps/web/tests/browser/case-001-live-smoke.spec.ts) against active API on port `3002`, asserting the old M2 prefill is absent and the new broad starter is present).
   - **Graph readiness check**: PASS (`scripts/check-understand-refresh-readiness.ps1` returned `READY`).

---

### Regression Risks
- **Low**: The draft query progression in [`getCase001NextDraftQuery()`](apps/web/src/useStudentCaseState.ts#L3803-L3813) is isolated strictly to `activeCaseId === CASE_001_ENTRY_ID`. Case 004 uses its own independent execution handler and query drafting logic, verified by all 66 test cases in [`App.test.tsx`](apps/web/src/App.test.tsx).

---

### Manual-Test Risks
- **Student Expectation / Failure Guidance on Broad Starters**: When students execute the new broad starter `SELECT * FROM InterviewLog;`, the backend will return un-narrowed rows and advisory feedback. The updated guidance clearly prompts the learner to narrow using the proved `ReportID` from Pinned Facts/results.

---

### Drift Risks
- **Low**: The Understand knowledge graph artifacts (`knowledge-graph.json`, `fingerprints.json`, `meta.json`, `intermediate/scan-result.json`) were regenerated and committed alongside the source changes, eliminating stale graph drift.

## Final Decision

Accepted on 2026-08-26 by human closeout request after PASS audit. WP-266 satisfies the scoped Case 001 guidance/no-answer-prefill acceptance criteria, preserves Case 001 gating and Case 004 behavior, records passing focused validation and live smoke evidence, and includes the required Understand graph refresh.
