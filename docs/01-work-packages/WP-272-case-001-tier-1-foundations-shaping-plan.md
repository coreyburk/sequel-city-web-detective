# case-001-tier-1-foundations-shaping-plan

## Objective

Reshape the Case 001 authoring plan so its intended released onboarding path is explicitly Tier 1/Foundations-compliant, reducing or splitting the current oversized six-milestone direction before any M5/M6 implementation work proceeds.

## Scope

### In Scope

- Apply `SSOT-Case-Tier-System.md` and `Case-Production-Workflow.md` to Case 001 as an intended Tier 1/Foundations onboarding case.
- Update `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md` to remove the contradiction between `Foundations` and the current six-milestone, six-table, red-herring-heavy direction.
- Define the reduced Tier 1/Foundations release slice for Case 001, including story-step budget, SQL scope, people/entities, clues/evidence, interpretation complexity, and completion contract.
- Split M3-M6 material into clearly deferred future expansion/sequel scope unless the implementation can reduce it into the Tier 1 budget without changing runtime code or database data.
- Replace M5/M6 as the next implementation target with the next coherent Tier 1/Foundations implementation bundle.
- Preserve Case 001 as locked/unreleased and author-only until later scoped implementation and release packages.
- Refresh tracked Understand graph artifacts after the case-plan documentation change.
- Keep the paused WP-270 draft in `stash@{0}` untouched; WP-272 should supersede its premise rather than edit the stashed draft.

### Out of Scope

- Implementing or reviving WP-270.
- Reclassifying Case 001 upward as Tier 2, Tier 3, Tier 4, or Tier 5.
- Modifying application runtime code, frontend UI, API routes, backend services, tests, database scripts, migrations, package manifests, lockfiles, dependencies, scripts, or runtime AI behavior.
- Implementing M5/M6 data rows, validators, API metadata transport, UI feedback, persistence, reset behavior, suspect verification, answer-key data, database rebuild/version enforcement, or release unlock.
- Assigning or exposing final culprit identity, answer-key rows, hidden solution values, final solve rationale, or final submit text.
- Changing `SSOT-Case-Tier-System.md`, `Case-Production-Workflow.md`, `CASE-AUTHORING-TEMPLATE.md`, or `CASE-VETTING-CHECKLIST.md`.
- Editing `docs/15-case-plans/Case-001-Existing-Data-Inventory.md`; it is read-only evidence for this package.
- Reclassifying Case 004 or rewriting historical completed work packages.

## Impact Analysis

### Understand Status

- Graph available: Yes. `.understand-anything/knowledge-graph.json`, `.understand-anything/fingerprints.json`, `.understand-anything/meta.json`, and `.understand-anything/intermediate/scan-result.json` exist.
- Baseline commit: `ec005bdebd72810105e0dcc6914c4fb687548cf7` from `.understand-anything/meta.json`.
- Freshness assessment: Usable with non-structural drift for Case 001 planning. Current `HEAD` is `cb5cec2`, the accepted WP-271 commit that added the case-production workflow and refreshed tracked graph artifacts in the same commit. The graph contains the relevant Case 001 plan, data inventory, tier SSOT, and case-production workflow nodes, but source documents remain authoritative.
- Analysis performed: Read the WP planning skill, planning checklist, development workflow SSOT, work-package lifecycle, Understand guidance, WP-271 case-production workflow, Case 001 authoring plan, Case 001 existing-data inventory, tier SSOT, graph metadata, recent commits, and paused WP-270 stash diff. Targeted source searches confirmed the current Case 001 plan still declares `Foundations` while also requiring six planned SQL milestones, six table families, joins through M5, M5/M6 future scope, and up to two major red herrings. That conflicts with the Tier 1/Foundations gate unless the plan is reduced or split.

### Affected Architecture

- Layers: case-authoring documentation, tier-compliance planning, future Case 001 implementation planning, work-package planning/audit guidance, Understand graph artifacts.
- Primary files/components: `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md`, this WP, closeout handoff, and tracked Understand graph artifacts.
- Upstream consumers: human reviewer, case authors, future Case 001 implementation WP planners, audit agents, code agents.
- Downstream dependencies: future Tier 1/Foundations Case 001 implementation bundle, any deferred M3-M6 expansion/sequel case planning, later persistence/reset/verification/release-readiness packages.

### Regression Surface

- Related tests: no runtime tests should be required because this package is documentation/case-plan-only. Validation should include targeted `rg` checks, lifecycle helper checks, `scripts/check-understand-refresh-readiness.ps1`, `scripts/refresh-understand-graph.ps1`, and `git diff --check`.
- User workflows: Case 001 case shaping, selecting the next highest-ROI implementation bundle, avoiding M5/M6 work that would lock in an oversized onboarding case, preserving low-churn case production.
- Security/data boundaries: no spoiler exposure; no answer-key exposure; no restricted-table broadening; no database mutation; no runtime AI; no progression-authority changes; no Case 001 release behavior change.

### Graph Update Decision

- Regeneration required: Yes.
- Rationale: The planned implementation materially updates the Case 001 authoring plan, which is used by future case implementation planning and audits. The originating WP should include tracked graph artifacts and refresh them after implementation.

## Files Allowed to Change

Allowed:

- docs/01-work-packages/WP-272-case-001-tier-1-foundations-shaping-plan.md
- docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- docs/01-work-packages/WP-270-*.md
- docs/15-case-plans/Case-001-Existing-Data-Inventory.md
- docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md
- docs/15-case-plans/CASE-VETTING-CHECKLIST.md
- docs/00-ssot/SSOT-Case-Tier-System.md
- docs/05-development-workflow/Case-Production-Workflow.md
- docs/00-ssot/SSOT-Case-Authoring.md
- docs/14-progression-design/**
- apps/**
- database/**
- migrations/**
- package.json
- package-lock.json
- pnpm-lock.yaml
- yarn.lock
- scripts/**
- tools/**
- .codex/**

## Constraints

- Treat Case 001 as intended Tier 1/Foundations unless a future human product decision explicitly reclassifies it upward.
- Reduce or split oversized scope instead of preserving the six-milestone plan as the onboarding case.
- Preserve deterministic SQL-result completion authority.
- Preserve Case 001 locked/unreleased behavior.
- Preserve spoiler boundaries: do not name the final culprit, answer-key row, final solution, or final submit text.
- Do not change data, validators, runtime gating, UI behavior, tests, scripts, packages, or dependencies.
- Keep future implementation recommendations concrete but avoid implementing them.
- Keep M3-M6 future scope clearly separated from the Tier 1/Foundations release slice.
- Keep changed files inside the allowed list.

## Required Behavior

- Update `Case-001-Clocktower-Poisoning-Plan.md` to state that Case 001 is intended as a Tier 1/Foundations onboarding case.
- Replace the current six-milestone playable end-state framing with a reduced Tier 1/Foundations release slice.
- Add or update a tier-axis compliance section that fits all five axes:
  - story steps: 1 to 2 linear steps,
  - SQL scope: 1 to 2 tables, basic `SELECT`, `WHERE`, `ORDER BY`, or simple `COUNT`,
  - people/entities: 2 to 3 meaningful people/entities,
  - clues/evidence: 2 to 3 clear evidence items,
  - interpretation complexity: no ambiguity, no major red herrings, no unresolved contradictions.
- Add a completion contract for the reduced release slice based on SQL result evidence and deterministic validation, without requiring final culprit verification if that would exceed Tier 1.
- Move M3-M6, DriversLicense narrowing, final opportunity transcript, suspect verification, answer-key data, and release unlock into deferred expansion/sequel or future higher-tier scope.
- Remove or rewrite major red-herring language so the Tier 1/Foundations slice has only clear, directly resolvable evidence.
- Update the SQL milestone table or add an explicit release-slice table so M1-M2 are the active Tier 1 path and M3-M6 are marked deferred or split out.
- Update the future WP sequence so the next coherent implementation package is the Tier 1/Foundations release-slice bundle, not M5/M6.
- Record what happened to the paused WP-270 premise in the plan or WP Code Results: superseded by WP-272 planning, not implemented.
- Refresh Understand graph artifacts after implementation.
- Record Code Results and validation evidence in this WP.

## Acceptance Criteria

- [ ] Case 001 is explicitly shaped as Tier 1/Foundations in the case plan.
- [ ] The case plan no longer presents six milestones as the Tier 1/Foundations playable release path.
- [ ] The five tier axes are recorded for the reduced Case 001 release slice and all fit Tier 1/Foundations.
- [ ] M3-M6 are clearly deferred, split, or marked future expansion/sequel scope rather than next implementation work.
- [ ] M5/M6 are no longer the next high-ROI implementation bundle for the onboarding release slice.
- [ ] The reduced completion contract uses deterministic SQL result evidence and does not rely on query text, UI state, localStorage, AI output, prompt text, free-text guesses, or final suspect verification.
- [ ] Major red-herring language is removed from the active Tier 1/Foundations slice or rewritten as directly resolvable evidence/distractor language.
- [ ] Case 001 remains locked/unreleased and author-only until later scoped implementation/release WPs.
- [ ] No runtime app, database, migration, package, lockfile, script, runtime AI, answer-key, suspect-verification, or release behavior changes are made.
- [ ] Understand graph artifacts are refreshed after implementation.
- [ ] Validation evidence is recorded in `Code Results`.
- [ ] No unrelated files changed.

## Code Prompt

Implement WP-272 exactly as specified.

Context:
- WP-270 is paused in `stash@{0}` and should not be revived or edited.
- WP-270's premise was too broad because it treated upward reclassification as likely. WP-272 supersedes that premise by treating Case 001 as intended Tier 1/Foundations and requiring reduction or splitting instead.
- Use `docs/05-development-workflow/Case-Production-Workflow.md` and `docs/00-ssot/SSOT-Case-Tier-System.md` as the governing workflow and tier authorities.

Required implementation:
- Update `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md` only.
- Keep the plan author-only and non-runtime-authoritative.
- State that Case 001's release target is Tier 1/Foundations.
- Reduce the active release slice to fit Tier 1/Foundations.
- Move M3-M6, M5/M6, suspect verification, answer-key data, release unlock, and any higher-complexity material into deferred expansion/sequel or future higher-tier scope.
- Add or update tier-axis compliance, completion contract, milestone/scope tables, red-herring/fairness language, and future WP sequence.
- Refresh tracked Understand graph artifacts.
- Record Code Results and validation evidence in this WP.

Validation:
- Run targeted `rg` checks proving the Case 001 plan includes Tier 1/Foundations release target, all five tier axes, reduced M1-M2 active release slice, deterministic SQL-result completion contract, M3-M6 deferred/split scope, no active major red-herring allowance, and revised next implementation sequence.
- Run targeted `rg` checks proving the old contradictory six-milestone Foundations framing is removed or explicitly marked as superseded/deferred.
- Run `scripts/check-understand-refresh-readiness.ps1` before and after graph refresh.
- Run `scripts/refresh-understand-graph.ps1`.
- Run `scripts/get-work-package-status.ps1 WP-272`.
- Run `scripts/get-work-package-validation-plan.ps1 WP-272`.
- Run `git diff --check`.
- Record runtime tests as intentionally not applicable because this is documentation/case-plan-only.

Do not modify app code, database scripts, migrations, packages, lockfiles, scripts, SSOT files, workflow docs, template/checklist files, `.codex`, Case 001 implementation files, answer-key data, suspect verification behavior, release gates, or WP-270.

## Audit Prompt

Audit WP-272 with an adversarial stance.

Verify:
- Case 001 is shaped as Tier 1/Foundations instead of being upward-reclassified.
- The plan no longer presents six milestones, six table families, M5/M6, or major red herrings as the active Tier 1/Foundations release path.
- The five tier axes are present and each fits `SSOT-Case-Tier-System.md`.
- The completion contract is explicit, deterministic, and based on SQL result evidence rather than query text, free text, UI state, localStorage, AI output, prompt intent, or final suspect verification.
- M3-M6, DriversLicense narrowing, final opportunity transcript, suspect verification, answer-key data, database rebuild/version enforcement, and release unlock are deferred or split into later scope.
- The next implementation recommendation is a coherent Tier 1/Foundations release-slice package, not M5/M6.
- The plan remains compatible with `Case-Production-Workflow.md` and `SSOT-Case-Authoring.md`.
- No files outside the allowed list were modified.
- No app, database, migration, dependency, package, script, runtime AI, answer-key, suspect-verification, or release behavior changed.
- WP-270 remained untouched in the stash/worktree.
- Graph regeneration decision was followed and generated graph artifacts contain no transient trash/log content.
- Validation evidence matches the documentation-only scope.

Output:
- Verdict: PASS or FAIL
- Scope violations
- Tier 1/Foundations defects
- Completion-contract gaps
- Deferred-scope leakage
- Runtime/spoiler boundary risks
- Drift risks

## Code Results

Implemented WP-272 as a documentation/case-plan-only shaping package.

### File Changes

- Updated `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md` so Case 001 remains `Foundations` with a `Tier 1: Junior Data Analyst` onboarding release target.
- Added a Tier 1 Foundations compliance section covering story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity.
- Replaced the old active six-milestone playable framing with a reduced two-milestone M1-M2 release slice.
- Added a deterministic completion contract based on SQL result evidence for the public report and linked interview set.
- Split M3-M6, `DriversLicense` narrowing, ceremony roster work, final opportunity transcript, suspect verification, answer-key data, and release unlock into deferred expansion/sequel scope.
- Rewrote red-herring and fairness guidance so the active Tier 1/Foundations release slice prohibits major red herrings and unresolved ambiguity.
- Updated guidance, validation, and future WP sequence so the next implementation target is the Tier 1 release-slice bundle, not M5/M6.
- Refreshed tracked Understand graph artifacts after the case-plan documentation change.

### WP-270 Disposition

- WP-270 remains untouched in `stash@{0}`.
- WP-272 supersedes WP-270's upward-reclassification premise by treating Case 001 as intended Tier 1/Foundations and reducing/splitting oversized scope.

### Validation

- PASS: targeted `rg` checks confirmed the Case 001 plan includes the Tier 1 release target, Tier 1 Foundations compliance section, all five tier axes, two active SQL milestones, active M1-M2 release-slice status, deterministic SQL-result completion contract, deferred M3-M6 scope, prohibited major red herrings, and revised future WP sequence.
- PASS: targeted negative `rg` checks found no remaining old active-release claims for `six planned SQL milestones`, `Use Query Lab to run the six`, `SQL milestones | 6`, `Required table families | 6`, `Major red herring 1`, `Major red herring 2`, `2 maximum`, `all six milestone query shapes`, `Case 001 evidence bundle 3`, or `M5-M6 plus validators`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh reported `READY`.
- PASS: `scripts/refresh-understand-graph.ps1`; graph rebuilt with `filesScanned=656`, `nodes=1064`, `edges=408`, `layers=6`, `tourSteps=7`, and `Fingerprints baseline: 656 files`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh reported `READY`.
- PASS: `scripts/get-work-package-status.ps1 WP-272` reported no out-of-scope dirty files before Code Results were recorded.
- PASS: `scripts/get-work-package-validation-plan.ps1 WP-272` reported the planned documentation/case-plan validation surface and did not block audit readiness.
- PASS: `git diff --check` passed; only Git LF-to-CRLF working-copy warnings were emitted for modified Markdown and Understand JSON artifacts.
- PASS: `git status --short` showed only WP-272 allowed files changed or added.
- PASS: `git stash list` confirmed the paused WP-270 draft remains in `stash@{0}`.
- NOT RUN: runtime app/API/database tests; intentionally not applicable because WP-272 is documentation/case-plan-only and does not modify runtime code, database scripts, migrations, packages, lockfiles, scripts, answer-key data, suspect verification behavior, or release gates.

## Audit Results

### Audit Report: WP-272

**Verdict: PASS**

---

### Audit Checklist Verification

| Verification Item | Status | Evidence / Notes |
|---|---|---|
| **Tier 1 / Foundations Shaping** | **PASS** | [`Case-001-Clocktower-Poisoning-Plan.md`](docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md#L29-L30) explicitly sets `Track: Foundations` and `Release tier target: Tier 1: Junior Data Analyst onboarding slice`. Upward reclassification into Tiers 2-5 is explicitly avoided by reducing and splitting the case scope. |
| **No Active 6-Milestone / 6-Table Framing** | **PASS** | The active playable release path is reduced to 2 SQL milestones (`case-001-clocktower-report-located` and `case-001-report-interviews-located`) across 2 table families (`CrimeSceneReport` and `InterviewLog`). Former M3-M6 and joins (0 joins on golden path) are removed from the active path. |
| **Five Tier Axes Compliance** | **PASS** | All five mandatory tier axes are declared in [`Case-001-Clocktower-Poisoning-Plan.md`](docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md#L80-L90) and strictly fit [`SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md#L81-L96):<br>1. *Story steps:* 2 linear steps.<br>2. *SQL scope:* 1-2 tables (`CrimeSceneReport`, `InterviewLog`), `SELECT`, `WHERE`, `ORDER BY`, 0 joins.<br>3. *People/entities:* 2-3 meaningful entities (1 public incident, up to 3 interviewees as evidence context).<br>4. *Clues/evidence:* 2-3 clear evidence items (report, linked interviews, crowd vs. record observation).<br>5. *Interpretation complexity:* Direct evidence discovery only, 0 major red herrings, no unresolved contradictions. |
| **Deterministic Completion Contract** | **PASS** | Explicitly defined in [`Case-001-Clocktower-Poisoning-Plan.md`](docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md#L163-L187). Completion requires backend-approved SQL result evidence locating the public report and linked interviews. Query text, free text, UI state, `localStorage`, AI output, prompt intent, and final suspect verification are explicitly excluded as completion authorities. |
| **Deferred Scope Partitioning** | **PASS** | M3-M6, `DriversLicense` attribute narrowing, ceremony roster (`EventSchedule`/`EventRegistration`), final opportunity transcript, suspect verification, `CaseAnswerKey` data, database rebuild/version enforcement, and release unlock are clearly categorized as deferred expansion/sequel scope. |
| **Next Implementation Recommendation** | **PASS** | The future WP sequence in [`Case-001-Clocktower-Poisoning-Plan.md`](docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md#L326-L337) prioritizes the coherent Tier 1 M1-M2 release-slice implementation bundle and explicitly halts M5/M6 implementation until an intentional expansion WP is scoped. |
| **SSOT & Workflow Compatibility** | **PASS** | Compatible with [`Case-Production-Workflow.md`](docs/05-development-workflow/Case-Production-Workflow.md) low-churn production lanes and [`SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md) authoring contracts (all 12 required sections present and structured). |
| **File Modification Boundaries** | **PASS** | Only allowed files were modified or created (`WP-272`, `Case-001-Clocktower-Poisoning-Plan.md`, and tracked `.understand-anything/` graph artifacts). |
| **Runtime & Behavior Invariance** | **PASS** | Zero changes to `apps/**`, `database/**`, `migrations/**`, dependencies, lockfiles, scripts, runtime AI, answer-key data, suspect verification, or release status (Case 001 remains locked/gated). |
| **WP-270 Isolation** | **PASS** | Paused WP-270 draft remains untouched in `stash@{0}`. |
| **Understand Graph Artifacts** | **PASS** | Graph artifacts were regenerated cleanly via [`refresh-understand-graph.ps1`](scripts/refresh-understand-graph.ps1). [`check-understand-refresh-readiness.ps1`](scripts/check-understand-refresh-readiness.ps1) confirms `READY` with 0 trash directories, 0 log files, and 0 temporary directories. |
| **Validation Evidence** | **PASS** | Validation evidence in [`WP-272-case-001-tier-1-foundations-shaping-plan.md`](docs/01-work-packages/WP-272-case-001-tier-1-foundations-shaping-plan.md#L215-L228) precisely matches documentation-only scope with targeted positive/negative regex checks, graph readiness checks, diff checks, and documented rationales for skipping runtime tests. |

---

### Detailed Findings

#### 1. Scope Violations
- **None.** All changes are strictly confined to the allowed documentation and Understand metadata paths. No application, database, migration, test, or workflow scripts were altered.

#### 2. Tier 1 / Foundations Defects
- **None.** The plan satisfies the Tier 1 limits across all five mandatory axes without residual ambiguity or oversized expectations.

#### 3. Completion-Contract Gaps
- **None.** The completion contract is fully deterministic and anchored to backend-approved SQL query result sets for M1 and M2. It explicitly prohibits non-authoritative signals (such as prompt text, UI state, `localStorage`, or free-text guessing).

#### 4. Deferred-Scope Leakage
- **None.** M3 (`PersonsOfInterest` join), M4 (`EventSchedule`/`EventRegistration` ceremony roster), M5 (`DriversLicense` candidate narrowing), M6 (final opportunity transcript), suspect verification, answer-key additions, and database rebuild/version enforcement are cleanly isolated under deferred/future expansion headings and removed from the active milestone tables.

#### 5. Runtime / Spoiler Boundary Risks
- **None.** The authoring plan does not leak final culprit identities, secret answer keys, or hidden solution values. Case 001 remains behind the `VITE_ENABLE_CASE_001_PLAYABLE_SKELETON` development gate and is archive-locked for general release.

#### 6. Drift Risks
- **None.** The case plan directly aligns with [`SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md), [`SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md), and [`Case-Production-Workflow.md`](docs/05-development-workflow/Case-Production-Workflow.md). Tracked Understand graph artifacts have been refreshed and synchronized with `HEAD`.

## Final Decision

Accepted on 2026-08-30 after PASS audit and human closeout request. WP-272 is approved because it reshapes Case 001 as an intended Tier 1/Foundations onboarding release slice, reduces the active path to M1-M2, defers M3-M6 and suspect-verification complexity into future expansion scope, preserves deterministic SQL-result authority, and keeps runtime/database/script/release behavior unchanged.

