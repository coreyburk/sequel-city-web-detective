# streamlined-tier-1-case-production-workflow

## Objective

Formalize the low-churn development workflow for creating and vetting new Sequel City cases, with an immediate emphasis on keeping Case 001 and future onboarding cases within the Tier 1/Foundations contract.

## Scope

### In Scope

- Add a concise development-workflow document for case production that turns the current tier/template/checklist guidance into a repeatable operating lane.
- Define the "Best Low-Churn Improvements" as explicit workflow rules, not scattered conversational guidance.
- Establish a Tier 1/Foundations case-shaping gate that favors reducing or splitting oversized case ideas before reclassifying an intended onboarding case upward.
- Clarify how to move from case idea to authoring template, vetting checklist, implementation bundle, audit, and closeout with minimal repeated planning churn.
- Update existing workflow and case-authoring documentation only enough to point contributors to the new case-production workflow.
- Preserve WP-270 as paused decision work for Case 001 rather than implementing or revising it in this package.
- Refresh tracked Understand graph artifacts after workflow-documentation changes.

### Out of Scope

- Implementing WP-270 or making Case 001 tier/reclassification decisions.
- Reclassifying Case 001, editing the Case 001 plan, or changing Case 001 runtime behavior.
- Implementing Case 001 M5/M6 data, validators, UI feedback, persistence, suspect verification, release unlock, or database rebuild/version enforcement.
- Modifying app runtime code, API code, frontend code, database scripts, migrations, package manifests, lockfiles, or dependencies.
- Adding a project-management platform, external tracker, new orchestration dependency, or runtime AI behavior.
- Removing work-package planning, independent audit, human final decision, handoff refresh, or commit-helper closeout gates.
- Changing repo-local Codex skills or lifecycle scripts.

## Impact Analysis

### Understand Status

- Graph available: Yes. `.understand-anything/knowledge-graph.json`, `.understand-anything/fingerprints.json`, `.understand-anything/meta.json`, and `.understand-anything/intermediate/scan-result.json` exist.
- Baseline commit: `33b1e88812fef5da45c66d54c9deaff293f8fec8` from `.understand-anything/meta.json`.
- Freshness assessment: Structurally stale for workflow-documentation planning if graph relationships are treated as authoritative, because accepted WP-269 changed major case-authoring/tier SSOT documents and refreshed the graph artifacts in the same commit after the recorded baseline. The graph is still usable as a navigation aid for locating existing workflow and case-authoring files, and all conclusions must be verified against source documents.
- Analysis performed: Read the development workflow SSOT, work-package lifecycle, Understand guidance, planning checklist, contributor workflow guide, case-authoring SSOT, case-tier SSOT, recent WP-268/WP-269 records, graph metadata, changed paths since the graph baseline, and targeted references to `low-churn`, `case production`, `Tier 1`, `Foundations`, and bundle guidance.

### Affected Architecture

- Layers: development workflow documentation, SSOT case-authoring documentation, case-production planning documentation, work-package planning/audit guidance, Understand graph artifacts.
- Primary files/components: this WP, a new case-production workflow document under `docs/05-development-workflow/`, `Contributor-Workflow-Guide.md`, `SSOT-Case-Authoring.md`, closeout handoff, and tracked Understand graph artifacts.
- Upstream consumers: human developer, case authors, work-package planners, code agents, independent audit agents, future Case 001 corrective/planning work.
- Downstream dependencies: future Case 001 Tier 1 shaping work, future M5/M6 bundle planning, future case-authoring packages, future pre-release case vetting.

### Regression Surface

- Related tests: no runtime tests should be required because the intended implementation is documentation-only. Validation should use targeted `rg` checks, `scripts/get-work-package-status.ps1 WP-271`, `scripts/get-work-package-validation-plan.ps1 WP-271`, `scripts/check-understand-refresh-readiness.ps1`, `scripts/refresh-understand-graph.ps1`, and `git diff --check`.
- User workflows: selecting the next highest-ROI work, shaping Tier 1/Foundations cases, planning case implementation bundles, vetting case plans before implementation, preserving audit/closeout gates while reducing single-row/single-validator churn.
- Security/data boundaries: no runtime AI; no spoiler exposure; no answer-key exposure; no database mutation; no broadening restricted-data access; deterministic SQL-result authority remains unchanged.

### Graph Update Decision

- Regeneration required: Yes.
- Rationale: The planned implementation changes major development-workflow documentation and case-authoring SSOT guidance that future planning and audit agents will rely on. The originating WP should own the tracked graph refresh rather than deferring known drift.

## Files Allowed to Change

Allowed:

- docs/01-work-packages/WP-271-streamlined-tier-1-case-production-workflow.md
- docs/05-development-workflow/Case-Production-Workflow.md
- docs/05-development-workflow/Contributor-Workflow-Guide.md
- docs/00-ssot/SSOT-Case-Authoring.md
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- docs/01-work-packages/WP-270-*.md
- docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md
- docs/15-case-plans/Case-001-Existing-Data-Inventory.md
- docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md
- docs/15-case-plans/CASE-VETTING-CHECKLIST.md
- docs/00-ssot/SSOT-Case-Tier-System.md
- apps/**
- database/**
- migrations/**
- scripts/**
- tools/**
- .codex/**
- package.json
- package-lock.json
- apps/web/package.json
- apps/api/package.json

## Constraints

- Keep this package documentation-only except for the required Understand graph refresh.
- Preserve the existing work-package lifecycle and audit/acceptance gates.
- Do not make WP-270 decisions inside WP-271.
- Treat Case 001 as intended Tier 1/Foundations for workflow purposes, but do not edit its case plan or runtime implementation in this package.
- Make the workflow pragmatic and short enough to use during active case production.
- Prefer scope reduction or case splitting over upward tier reclassification when the product intent is an onboarding case.
- Do not weaken deterministic completion, SQL-result authority, spoiler boundaries, restricted-data boundaries, or release gates.
- Do not introduce new dependencies, scripts, skills, or external tooling.

## Required Behavior

- Add `docs/05-development-workflow/Case-Production-Workflow.md`.
- The new document must formalize the Best Low-Churn Improvements, including:
  - tier-first intake before implementation planning,
  - a Tier 1/Foundations hard gate,
  - a case-shape budget check against story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity,
  - a rule that intended onboarding cases should be reduced or split before being reclassified upward,
  - implementation bundle sizing by tier,
  - one audit per coherent case slice rather than per-row polish,
  - validation selection by touched surface,
  - database seed-script version/change-date documentation when database seed content changes,
  - closeout and handoff gates remaining mandatory.
- Update `Contributor-Workflow-Guide.md` so contributors can find and use the new case-production workflow from the normal development loop.
- Update `SSOT-Case-Authoring.md` so future case work points to the workflow document for production sequencing and low-churn bundle selection while keeping tier authority in `SSOT-Case-Tier-System.md`.
- Keep existing authoring template and vetting checklist files unchanged unless a later WP explicitly scopes updates to them.
- Refresh tracked Understand graph artifacts after documentation changes.

## Acceptance Criteria

- [ ] A new case-production workflow document exists under `docs/05-development-workflow/`.
- [ ] The workflow explicitly documents the Best Low-Churn Improvements as active project guidance.
- [ ] The workflow includes a Tier 1/Foundations shaping gate that treats oversized scope as a reduce/split problem before upward reclassification when the product intent is onboarding.
- [ ] The workflow maps case production from intake through template, checklist, implementation bundle, audit, acceptance, handoff, and commit.
- [ ] The workflow preserves all existing work-package, independent audit, human final decision, handoff, and commit-helper gates.
- [ ] The workflow references database seed-script version/change-date updates when database seed content changes.
- [ ] `Contributor-Workflow-Guide.md` links to the new workflow.
- [ ] `SSOT-Case-Authoring.md` points future case production to the new workflow without duplicating tier authority.
- [ ] No Case 001 plan, Case 001 runtime behavior, database scripts, app code, scripts, dependencies, or `.codex` files are modified.
- [ ] Understand graph artifacts are refreshed after implementation.
- [ ] Validation evidence is recorded in `Code Results`.
- [ ] No unrelated files changed.

## Code Prompt

Implement WP-271 exactly as specified.

Context:
- WP-270 is paused and must not be implemented or revised in this package.
- Case 001 is intended to remain a Tier 1/Foundations onboarding case unless a future explicit product decision changes that.
- WP-269 created the case-tier SSOT, authoring template, and vetting checklist. WP-271 should formalize the workflow that uses those artifacts with less churn.

Required implementation:
- Add `docs/05-development-workflow/Case-Production-Workflow.md`.
- Update `docs/05-development-workflow/Contributor-Workflow-Guide.md` to reference the new workflow.
- Update `docs/00-ssot/SSOT-Case-Authoring.md` to reference the new workflow for production sequencing and bundle selection.
- Refresh tracked Understand graph artifacts.
- Record Code Results and validation evidence in this WP.

Validation:
- Run targeted `rg` checks confirming the new workflow includes the low-churn rules, Tier 1/Foundations gate, reduce/split rule, bundle sizing, audit/closeout preservation, and database seed-script version/change-date reminder.
- Run `scripts/check-understand-refresh-readiness.ps1` before and after graph refresh.
- Run `scripts/refresh-understand-graph.ps1`.
- Run `scripts/get-work-package-status.ps1 WP-271`.
- Run `scripts/get-work-package-validation-plan.ps1 WP-271`.
- Run `git diff --check`.
- Record skipped runtime tests as intentionally not applicable for documentation-only scope.

Do not modify app code, database scripts, migrations, packages, lockfiles, scripts, `.codex`, Case 001 plan files, or WP-270.

## Audit Prompt

Audit WP-271 with an adversarial stance.

Verify:
- The package formalizes the Best Low-Churn Improvements in an actionable workflow document.
- The workflow is compatible with `SSOT-Case-Tier-System.md` and `SSOT-Case-Authoring.md`.
- The Tier 1/Foundations gate correctly favors reducing or splitting oversized onboarding cases before reclassifying them upward.
- The workflow preserves deterministic SQL-result authority, spoiler boundaries, restricted-data boundaries, and release gates.
- The workflow improves throughput without weakening work-package planning, independent audit, human final decision, handoff refresh, or commit-helper closeout.
- The database seed-script version/change-date reminder is present for future database seed-content packages.
- No files outside the allowed list were modified.
- No Case 001 plan/runtime files, database scripts, app code, scripts, dependencies, or `.codex` files were modified.
- Graph regeneration decision was followed and generated graph artifacts contain no transient trash/log content.
- Validation evidence matches the documentation-only scope.

Output:
- Verdict: PASS or FAIL
- Scope violations
- Workflow gaps
- Tier 1/Foundations risks
- Runtime/data boundary risks
- Drift risks

## Code Results

Implemented WP-271 as a documentation-only workflow improvement package.

### File Changes

- Added `docs/05-development-workflow/Case-Production-Workflow.md` as the standard low-churn operating lane for new case production.
- Updated `docs/05-development-workflow/Contributor-Workflow-Guide.md` so contributors can find the case-production workflow from the normal development loop and related workflow index.
- Updated `docs/00-ssot/SSOT-Case-Authoring.md` so future case production points to the workflow document for sequencing, Tier 1/Foundations shaping, bundle sizing, validation, audit, and closeout.
- Refreshed tracked Understand graph artifacts after the workflow-documentation changes.

### Workflow Results

- Formalized the Best Low-Churn Improvements as active project guidance.
- Added a Tier 1/Foundations gate covering story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity.
- Added the rule that intended onboarding cases should be reduced or split before upward reclassification unless the product decision explicitly changes the case out of onboarding scope.
- Documented the case-production lane from intake through tier gate, authoring template, vetting checklist, implementation WP, validation, audit, acceptance, handoff, commit, and push.
- Preserved work-package planning, independent audit when available, human final decision, handoff refresh, commit-helper finalization, and push.
- Added the future database seed-content reminder to update the SQL file version number and change date when `database/02-SequelCityCrimesDB - Insert Data.sql` changes.

### Validation

- PASS: targeted `rg` checks confirmed the new workflow includes the Best Low-Churn Improvements, Tier 1/Foundations gate, reduce/split rule, coherent-slice audit guidance, bundle sizing, closeout/handoff/commit-helper preservation, SQL-result authority, and database seed-script version/change-date reminder.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh reported `READY`.
- PASS: `scripts/refresh-understand-graph.ps1`; graph rebuilt with `filesScanned=655`, `nodes=1063`, `edges=408`, `layers=6`, `tourSteps=7`, and `Fingerprints baseline: 655 files`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh reported `READY`.
- PASS: `scripts/get-work-package-status.ps1 WP-271` reported no out-of-scope dirty files before Code Results were recorded.
- PASS: `scripts/get-work-package-validation-plan.ps1 WP-271` reported `NoAutomatedValidationExplained` and did not block audit readiness.
- PASS: `git diff --check` passed; only Git LF-to-CRLF working-copy warnings were emitted for modified Markdown and Understand JSON artifacts.
- PASS: `git status --short` showed only WP-271 allowed files changed or added.
- NOT RUN: runtime app/API/database tests; intentionally not applicable because WP-271 is documentation-only and does not modify runtime code, database scripts, migrations, packages, lockfiles, or scripts.

## Audit Results

### Verdict: PASS

Work Package WP-271 has been audited with an adversarial stance against all stated requirements, constraints, and SSOT contracts. The implementation strictly adheres to its documentation-only scope, introduces no drift or out-of-scope modifications, and formalizes the case-production workflow accurately.

---

### Verification Summary

1. **Formalization of Best Low-Churn Improvements**:
   - [`Case-Production-Workflow.md`](docs/05-development-workflow/Case-Production-Workflow.md#L9-L20) explicitly documents the 7 Low-Churn rules (tier-first intake, pre-implementation shaping, onboarding case reduction/splitting, coherent-slice bundling, single audit per coherent slice, proportional validation selection, and mandatory closeout/handoff gates).
   - Standard 9-step Case Production Lane is clearly mapped from intake to commit/push.
   - Bundle sizing guidelines by tier are established.

2. **Compatibility with SSOT Documents**:
   - Full compatibility with [`SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md) and [`SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md).
   - References added in [`Contributor-Workflow-Guide.md`](docs/05-development-workflow/Contributor-Workflow-Guide.md#L46-L48) and [`SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md#L38) point contributors to the workflow without duplicating or diluting tier/schema authority.

3. **Tier 1 / Foundations Gate**:
   - The 5-axis complexity gate (Story Steps: 1-2; SQL Scope: `SELECT`, `WHERE`, `ORDER BY`, `COUNT`, 1-2 tables; People/Entities: 2-3; Clues/Evidence: 2-3; Interpretation Complexity: no ambiguity/red herrings) aligns identically with the tier SSOT.
   - The gate explicitly mandates reducing or splitting oversized onboarding cases before considering any upward reclassification, requiring an explicit product decision for upward reclassification.

4. **Preservation of Authorities, Boundaries, and Gates**:
   - Reaffirms deterministic SQL-result evidence as the sole progression authority.
   - Explicitly rejects UI state, localStorage, AI output, query text, and guesses as completion authority.
   - Preserves spoiler boundaries, restricted-data boundaries, release gates, and all work-package lifecycle/audit/acceptance/handoff gates.

5. **Database Seed-Script Version & Change-Date Rules**:
   - Explicitly includes requirements to update the SQL version header and change date in [`database/02-SequelCityCrimesDB - Insert Data.sql`](database/02-SequelCityCrimesDB%20-%20Insert%20Data.sql) whenever database seed content changes, document row accounting, and validate clean rebuilds.

6. **Scope and File Boundaries**:
   - Only allowed files were created or modified ([`WP-271`](docs/01-work-packages/WP-271-streamlined-tier-1-case-production-workflow.md), [`Case-Production-Workflow.md`](docs/05-development-workflow/Case-Production-Workflow.md), [`Contributor-Workflow-Guide.md`](docs/05-development-workflow/Contributor-Workflow-Guide.md), [`SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md), and `.understand-anything/*`).
   - No Case 001 plan/runtime files, database scripts, application code, migrations, scripts, dependencies, or `.codex` skills were modified.
   - WP-270 decision work remains safely paused.

7. **Graph Regeneration & Artifact Cleanliness**:
   - Knowledge graph was refreshed via `scripts/refresh-understand-graph.ps1`.
   - `scripts/check-understand-refresh-readiness.ps1` confirms `READY` with 0 temporary directories, 0 trash directories, 0 log files, and 0 out-of-scope tracked artifact changes.

8. **Validation Evidence**:
   - Recorded evidence in [`WP-271`](docs/01-work-packages/WP-271-streamlined-tier-1-case-production-workflow.md#L204-L215) matches documentation-only scope, with explicit explanations for skipped runtime tests.

---

### Findings by Category

#### Scope Violations
- **None**. All changes strictly match the declared `Files Allowed to Change` list.

#### Workflow Gaps
- **None**. The workflow document completely covers the lifecycle from initial case idea intake to git push, including bundle sizing, validation tiering, and seed script management.

#### Tier 1 / Foundations Risks
- **None**. The reduce/split hierarchy prevents accidental onboarding scope creep and protects learner confidence.

#### Runtime / Data Boundary Risks
- **None**. Non-negotiable boundaries ensure runtime code, SQL safety, and answer-key protections remain unaltered.

#### Drift Risks
- **None**. Tracked Understand graph artifacts are synchronized with the commit baseline, and all references across documentation are consistent.
The audit of [WP-271](docs/01-work-packages/WP-271-streamlined-tier-1-case-production-workflow.md) is complete with a **PASS** verdict and no open risks or scope violations. 

The package is ready for final decision, handoff refresh, and closeout. Let me know if you would like to proceed with recording the audit results and closing out the work package!

## Final Decision

Accepted on 2026-08-28 after PASS audit and human closeout request. WP-271 is approved because it formalizes the low-churn case-production workflow, protects Case 001 and future onboarding cases as Tier 1/Foundations unless explicitly reclassified by product decision, preserves deterministic SQL-result authority and review gates, and keeps runtime/database/script scope unchanged.

