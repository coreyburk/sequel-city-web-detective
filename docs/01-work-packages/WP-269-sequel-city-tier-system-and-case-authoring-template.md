# sequel-city-tier-system-and-case-authoring-template

## Objective

Create a Sequel City case-tier authoring standard and reusable case-planning template so future cases can be designed, vetted, and implemented at varying skill/difficulty levels with less repeated planning churn.

## Scope

### In Scope
- Add a canonical Sequel City tier-system SSOT derived from the user-provided DataQuest tier model and reconciled with existing Sequel City progression/rank language.
- Update the existing case-authoring SSOT so every future playable case must declare a tier, difficulty-axis evidence, and deterministic completion contract before implementation.
- Update the existing detective rank/reward guide only where needed to defer tier authority to the new SSOT and resolve contradictions.
- Add a reusable case authoring plan template for future case plans under `docs/15-case-plans/`.
- Add a reusable case vetting checklist for pre-implementation and pre-release case review.
- Document how `Foundations` relates to the five-tier ladder.
- Document guidance for bundling case implementation WPs by tier to reduce audit/closeout churn without weakening review gates.
- Refresh tracked Understand graph artifacts after the SSOT/workflow documentation changes.

### Out of Scope
- Changing application runtime behavior, UI, API routes, services, database scripts, migrations, tests, package manifests, lockfiles, dependencies, or runtime AI behavior.
- Releasing Case 001 or changing its runtime gate.
- Implementing Case 001 M5/M6, suspect verification, persistence, reset behavior, database rebuild/version enforcement, or release unlock.
- Reclassifying every historical work package.
- Removing the existing work-package, audit, final-decision, handoff, or commit-helper gates.
- Creating a new external project-management system or installing orchestration dependencies.
- Treating the pasted DataQuest SSOT as directly authoritative for Sequel City without adapting project names, existing SSOT boundaries, and current rank-guide commitments.

## Impact Analysis

### Understand Status
- Graph available: Yes. `.understand-anything/knowledge-graph.json`, `.understand-anything/fingerprints.json`, `.understand-anything/meta.json`, and `.understand-anything/intermediate/scan-result.json` exist.
- Baseline commit: `fac4b676c7e3d585194f063f4ecfc1a05da16df1` from `.understand-anything/meta.json`.
- Freshness assessment: Usable with non-structural drift for planning. Current `HEAD` is `33b1e88`; the only accepted commit after the graph baseline is WP-268, which added sandbox-helper troubleshooting documentation/scripts and refreshed the graph artifacts in that same commit. The planned WP-269 implementation will change SSOT/progression/case-planning documentation, so graph regeneration is required after implementation.
- Analysis performed: Read the user-provided DataQuest tier SSOT reference, workflow SSOT, work-package lifecycle, Understand guidance, planning checklist, current handoff, graph metadata, `SSOT-Case-Authoring.md`, and `Detective-Rank-and-Reward-System-Guide.md`. Searched repo references for tier, difficulty, Foundations, completion criteria/signals, ambiguity, and red herring language. Confirmed existing Sequel City tier/rank language exists but is less strict than the DataQuest model and may conflict on ambiguity/red-herring allowances for lower tiers unless reconciled.

### Affected Architecture
- Layers: SSOT documentation, progression-design documentation, case-authoring planning documentation, work-package planning/audit guidance, Understand graph artifacts.
- Primary files/components: new tier-system SSOT, existing case-authoring SSOT, existing detective rank/reward guide, new case authoring template, new case vetting checklist, this WP, closeout handoff, and tracked Understand graph artifacts.
- Upstream consumers: future case authors, work-package planners, audit agents, human reviewers, future case-library/filtering work, future progression/rank implementation work.
- Downstream dependencies: future Case 001 M5/M6 planning, future new-case planning, future public case metadata work, future release-readiness reviews, future UI labels and filtering once runtime implementation is explicitly scoped.

### Regression Surface
- Related tests: no runtime tests should be required because this is documentation-only. Validation should use targeted `rg` checks, lifecycle helper checks, `git diff --check`, and Understand readiness/refresh commands.
- User workflows: creating new case plans, assigning case difficulty, vetting case scope before implementation, bundling case implementation WPs, auditing tier compliance, preserving deterministic completion rules.
- Security/data boundaries: no runtime AI; no spoiler exposure; no answer-key exposure; no database mutation; no broadening of restricted-data access; completion remains based on backend-approved SQL result evidence and deterministic checks when implemented.

### Graph Update Decision
- Regeneration required: Yes.
- Rationale: The planned implementation changes SSOT and progression/case-planning documentation that future work-package planning and audits will rely on. Include tracked graph artifacts in this WP so the originating package owns the known documentation-structure refresh.

## Files Allowed to Change

Allowed:

- docs/01-work-packages/WP-269-sequel-city-tier-system-and-case-authoring-template.md
- docs/00-ssot/SSOT-Case-Tier-System.md
- docs/00-ssot/SSOT-Case-Authoring.md
- docs/00-ssot/SSOT-Index.md
- docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md
- docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md
- docs/15-case-plans/CASE-VETTING-CHECKLIST.md
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- apps/**
- database/**
- migrations/**
- package.json
- package-lock.json
- pnpm-lock.yaml
- yarn.lock
- scripts/**
- docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md
- docs/15-case-plans/Case-001-Existing-Data-Inventory.md
- .codex/**

## Constraints

- Preserve the existing work-package lifecycle, independent audit, human final decision, handoff refresh, and commit-helper gates.
- Keep the new tier standard Sequel City-specific; do not leave DataQuest naming as project authority.
- Treat investigation complexity as the primary difficulty driver and SQL syntax novelty as secondary.
- Preserve deterministic completion as the default rule for Tiers 1-4.
- Do not authorize runtime AI, MCP filtering implementation, app UI changes, progression implementation, database changes, or release behavior.
- Avoid exposing culprit identity, answer-key rows, hidden solution values, or final solve paths.
- Keep `Foundations` explicitly mapped as either Tier 1 or a pre-tier/on-ramp track; do not leave it ambiguous.
- Do not weaken existing Case 004 provisional placement unless the new SSOT explicitly records how and why it remains provisional.
- Keep templates reusable for future cases instead of making them Case 001-only.

## Required Behavior

- Create `docs/00-ssot/SSOT-Case-Tier-System.md` as the canonical Sequel City tier authority.
- The tier SSOT must define five mandatory axes for case tier compliance:
  - story steps,
  - SQL scope,
  - people/entities,
  - clues/evidence,
  - interpretation complexity.
- The tier SSOT must define completion criteria and completion signal requirements, including that query results, not query text or free-text explanations, drive completion.
- The tier SSOT must define Tier 1 through Tier 5 using Sequel City terminology and the existing rank ladder:
  - Tier 1: Junior Data Analyst,
  - Tier 2: Senior Data Analyst,
  - Tier 3: Data Inspector,
  - Tier 4: Data Detective,
  - Tier 5: Director of Data Integrity.
- The tier SSOT must define prohibited ambiguity/red-herring boundaries by tier. It must resolve the lower-tier inconsistency by making Tiers 1-3 deterministic and non-ambiguous; if distractors are allowed, they must be clearly resolvable and not counted as major red herrings.
- The tier SSOT must include a summary progression table suitable for future case planning and audit checks.
- Update `SSOT-Case-Authoring.md` so every future case plan must declare tier compliance against the five axes and completion contract before broad implementation.
- Update `Detective-Rank-and-Reward-System-Guide.md` so the rank guide references the new tier SSOT as tier authority rather than keeping conflicting standalone tier definitions.
- Add `docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md` with reusable sections for case identity, declared tier, axis budget, evidence path, story steps/milestones, SQL concept coverage, data fixtures, validators, guidance, persistence/reset, suspect verification, release criteria, and future WP sequence.
- Add `docs/15-case-plans/CASE-VETTING-CHECKLIST.md` with pre-implementation and pre-release checks for tier compliance, deterministic completion, SQL-result authority, clue fairness, data coherence, restricted-data/spoiler boundaries, and bundling guidance.
- Include bundling guidance that recommends larger coherent implementation slices by tier while preserving auditability:
  - Tier 1 or Foundations: whole case or large case slice when practical,
  - Tiers 2-3: two to three story steps per implementation WP when coherent,
  - Tiers 4-5: thread-sized or evidence-web slices, not single-row polish.
- Refresh Understand graph artifacts after documentation changes.

## Acceptance Criteria

- [ ] A new Sequel City tier-system SSOT exists and is project-specific, not a pasted DataQuest document.
- [ ] The new SSOT makes investigation complexity the primary difficulty driver.
- [ ] The new SSOT defines the five mandatory axes and Tier 1-5 contracts.
- [ ] The new SSOT defines deterministic completion criteria/signals and query-result authority.
- [ ] `Foundations` is explicitly mapped to the tier system.
- [ ] Existing rank-guide tier language is reconciled with the new SSOT and no longer conflicts on lower-tier ambiguity/red-herring rules.
- [ ] `SSOT-Case-Authoring.md` requires future cases to declare tier-axis compliance and completion contracts.
- [ ] Reusable case authoring template and vetting checklist files are added.
- [ ] The documentation recommends larger coherent case-authoring implementation bundles without removing audit, final decision, handoff, or commit gates.
- [ ] No runtime app, database, dependency, package, migration, script, runtime AI, or Case 001 implementation changes are made.
- [ ] Understand graph artifacts are refreshed after implementation.
- [ ] Validation evidence is recorded in `Code Results`.
- [ ] No unrelated files changed.

## Code Prompt

Implement WP-269 exactly as specified.

Use the pasted DataQuest tier SSOT as reference material, but adapt it to Sequel City Web Detective and reconcile it with existing repo authority:

- `docs/00-ssot/SSOT-Case-Authoring.md`
- `docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md`
- `docs/15-case-plans/Case-001-Clocktower-Poisoning-Plan.md`
- `docs/15-case-plans/Case-001-Existing-Data-Inventory.md`

Required implementation:

- Add `docs/00-ssot/SSOT-Case-Tier-System.md`.
- Update `docs/00-ssot/SSOT-Case-Authoring.md`.
- Update `docs/00-ssot/SSOT-Index.md` if needed so the new SSOT is discoverable.
- Update `docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md` only enough to defer tier authority to the new SSOT and remove contradictions.
- Add `docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md`.
- Add `docs/15-case-plans/CASE-VETTING-CHECKLIST.md`.
- Refresh tracked Understand graph artifacts.
- Record Code Results and validation evidence in this WP.

Validation:

- Run targeted searches proving the new SSOT/template/checklist include tier axes, deterministic completion, query-result authority, Foundations mapping, and bundling guidance.
- Run `scripts/check-understand-refresh-readiness.ps1` before and after graph refresh.
- Run `scripts/refresh-understand-graph.ps1`.
- Run `git diff --check`.
- Record any skipped runtime tests as intentionally not applicable for documentation-only scope.

Do not modify app code, database scripts, migrations, packages, lockfiles, scripts, `.codex`, Case 001 implementation files, or runtime AI behavior.

## Audit Prompt

Audit WP-269 with an adversarial stance.

Verify:

- The new tier SSOT is Sequel City-specific and does not leave DataQuest branding as project authority.
- The tier standard is compatible with existing Sequel City rank terminology and does not create conflicting tier definitions.
- Investigation complexity is clearly primary over SQL syntax novelty.
- The five mandatory axes are present and auditable.
- Completion contracts require deterministic SQL result evidence and do not accept query text, free text, UI state, localStorage, AI output, or narrative intent as completion authority.
- `Foundations` is explicitly mapped and not left ambiguous.
- Lower-tier ambiguity/red-herring rules are internally consistent.
- The case authoring template and vetting checklist are reusable for future cases, not Case 001-only.
- Bundling guidance improves throughput without weakening audit, human final decision, handoff refresh, or commit-helper closeout gates.
- No files outside the allowed list were modified.
- No app, database, migration, dependency, script, package, runtime AI, or Case 001 implementation behavior changed.
- Graph regeneration decision was followed and generated graph artifacts contain no transient trash/log content.
- Validation evidence matches the changed documentation-only scope.
- Understand output did not override SSOT, source, user-provided reference material, tests, or observed behavior.

Output:

- Verdict: PASS or FAIL
- Scope violations
- SSOT conflicts
- Tier-contract gaps
- Template/checklist omissions
- Runtime boundary risks
- Drift risks

## Code Results

Implemented WP-269 as a documentation-only tier-system and case-authoring workflow package.

### File Changes

- Added `docs/00-ssot/SSOT-Case-Tier-System.md` as the canonical Sequel City case-tier authority.
- Updated `docs/00-ssot/SSOT-Case-Authoring.md` so future case plans must declare tier classification, five-axis compliance, completion criteria, completion signal, and implementation bundle strategy.
- Updated `docs/00-ssot/SSOT-Index.md` so the new case-tier SSOT is discoverable from the SSOT navigation and governance references.
- Updated `docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md` to keep rank/reward/badge/promotion language while deferring tier contracts to `SSOT-Case-Tier-System.md`.
- Added `docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md` for future case plans.
- Added `docs/15-case-plans/CASE-VETTING-CHECKLIST.md` for pre-implementation and pre-release case review.
- Refreshed tracked Understand graph artifacts after the SSOT/progression/case-planning documentation changes.

### Tier-System Results

- Defined investigation complexity as the primary difficulty driver and SQL syntax novelty as secondary.
- Defined five mandatory tier axes: story steps, SQL scope, people/entities, clues/evidence, and interpretation complexity.
- Defined Tier 1 through Tier 5 using the existing rank ladder: Junior Data Analyst, Senior Data Analyst, Data Inspector, Data Detective, and Director of Data Integrity.
- Mapped `Foundations` as a pre-release/on-ramp label for cases designed at or below Tier 1 complexity.
- Preserved deterministic completion for Tiers 1 through 4 and required auditable SQL result evidence for Tier 5 evaluation frameworks.
- Reconciled lower-tier ambiguity/red-herring rules by prohibiting major red herrings and unresolved ambiguity for Foundations and Tiers 1 through 3 while allowing clearly resolvable distractors.
- Added bundle guidance that favors whole-case or large-slice WPs for Foundations/Tier 1, two-to-three-step WPs for Tiers 2-3, and thread/evidence-web WPs for Tiers 4-5.

### Validation

- PASS: targeted `rg` checks confirmed the new SSOT, case-authoring SSOT update, rank guide update, template, and checklist include the required tier axes, deterministic completion, query-result authority, Foundations mapping, and bundle guidance.
- PASS: targeted `rg` check for old conflicting rank-guide tier phrases found no remaining matches for `Official Tier Definitions`, `Tier 2 Case Standards`, `Tier 3 Case Standards`, `limited ambiguity`, `early contradictions`, or `moderate red herrings` in the rank guide/tier SSOT authority surface.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh reported `READY`.
- PASS: `scripts/refresh-understand-graph.ps1`; graph rebuilt with `filesScanned=653`, `nodes=1061`, `edges=408`, `layers=6`, `tourSteps=7`, and `Fingerprints baseline: 653 files`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh reported `READY`.
- PASS: `scripts/get-work-package-status.ps1 WP-269` reported no out-of-scope dirty files.
- PASS: `git diff --check` passed; only Git LF-to-CRLF working-copy warnings were emitted.
- NOT RUN: runtime app/API/database tests; intentionally not applicable because WP-269 is documentation-only and does not modify runtime code, database scripts, migrations, packages, lockfiles, or scripts.

## Audit Results

Verdict: PASS
---

### Scope Violations

- **None observed.**
- Only allowed files were modified or added:
  - [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md) (Created)
  - [`docs/00-ssot/SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md) (Updated)
  - [`docs/00-ssot/SSOT-Index.md`](docs/00-ssot/SSOT-Index.md) (Updated)
  - [`docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md`](docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md) (Updated)
  - [`docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md`](docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md) (Created)
  - [`docs/15-case-plans/CASE-VETTING-CHECKLIST.md`](docs/15-case-plans/CASE-VETTING-CHECKLIST.md) (Created)
  - [`docs/01-work-packages/WP-269-sequel-city-tier-system-and-case-authoring-template.md`](docs/01-work-packages/WP-269-sequel-city-tier-system-and-case-authoring-template.md) (Created)
  - [`.understand-anything/knowledge-graph.json`](.understand-anything/knowledge-graph.json), [`.understand-anything/fingerprints.json`](.understand-anything/fingerprints.json), [`.understand-anything/meta.json`](.understand-anything/meta.json), [`.understand-anything/intermediate/scan-result.json`](.understand-anything/intermediate/scan-result.json) (Refreshed)
- No runtime code in `apps/`, database scripts in `database/`, migrations in `migrations/`, script tooling in `scripts/`, package manifests/lockfiles, or `.codex/` files were touched.

---

### SSOT Conflicts

- **None observed.**
- **Project Identity & Brand Authority:** The new SSOT [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md) correctly establishes Sequel City / Sequel Detective authority. Zero residual DataQuest branding or authority exists in active docs.
- **Single Source of Truth for Tiers:** [`docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md`](docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md) was refactored to explicitly defer all tier definitions and tier design standards to [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md), maintaining rank titles (`Junior Data Analyst`, `Senior Data Analyst`, `Data Inspector`, `Data Detective`, `Director of Data Integrity`), badges, and commendation vocabulary without duplicate or divergent tier contracts.
- **Index Alignment:** [`docs/00-ssot/SSOT-Index.md`](docs/00-ssot/SSOT-Index.md) accurately indexes and summarizes [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md).

---

### Tier-Contract Gaps

- **None observed.**
- **Investigation Complexity over SQL Syntax:** Explicitly established in Section 2 of [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md) and required across all templates and checklists. Advanced SQL concepts (e.g., CTEs, window functions) are optional/upper-tier and never required for lower-tier completion.
- **Five Mandatory Axes Defined & Enforced:**
  1. *Story Steps* (1-2 for T1/Foundations $\rightarrow$ 2-3 for T2 $\rightarrow$ 3-5 for T3 $\rightarrow$ 5-8 for T4 $\rightarrow$ 8-12+ for T5)
  2. *SQL Scope* (1-2 tables for T1 $\rightarrow$ 2-3 tables for T2 $\rightarrow$ 3-4 tables for T3 $\rightarrow$ 5-6 tables for T4 $\rightarrow$ 6-8+ tables for T5)
  3. *People and Entities* (2-3 for T1 $\rightarrow$ 4-5 for T2 $\rightarrow$ 5-7 for T3 $\rightarrow$ 7-10 for T4 $\rightarrow$ 10-15+ for T5)
  4. *Clues and Evidence* (2-3 for T1 $\rightarrow$ 3-5 for T2 $\rightarrow$ 5-8 for T3 $\rightarrow$ 8-12 for T4 $\rightarrow$ 12-20+ for T5)
  5. *Interpretation Complexity* (No ambiguity/red herrings for Foundations/T1-T3 $\rightarrow$ Limited & resolvable for T4 $\rightarrow$ Permitted under evaluation framework for T5)
- **Deterministic SQL-Result Completion Authority:** Strictly enforced in [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md) (lines 52-64), [`docs/00-ssot/SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md) (lines 73-75), [`docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md`](docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md) (lines 37-48), and [`docs/15-case-plans/CASE-VETTING-CHECKLIST.md`](docs/15-case-plans/CASE-VETTING-CHECKLIST.md) (lines 22-26). Query text, free text, UI state, localStorage, AI output, and narrative assertions are explicitly barred as completion authorities.
- **Foundations Explicit Mapping:** Mapped as an on-ramp/pre-release label strictly bounded at or below Tier 1 complexity.
- **Ambiguity & Red-Herring Consistency:** Prohibits major red herrings and narrative ambiguity for Foundations and Tiers 1-3, allowing only clearly and deterministically resolvable distractors.

---

### Template / Checklist Omissions

- **None observed.**
- [`docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md`](docs/15-case-plans/CASE-AUTHORING-TEMPLATE.md) provides an end-to-end, reusable blueprint for future cases (identity, tier compliance table across the 5 axes, deterministic completion contracts, evidence path, milestone mappings, entity inventories, fixture plans, distractor fairness, guidance pacing, persistence/reset, suspect verification/evaluation, automated validation, bundling plan, and release criteria).
- [`docs/15-case-plans/CASE-VETTING-CHECKLIST.md`](docs/15-case-plans/CASE-VETTING-CHECKLIST.md) provides comprehensive, reusable pre-implementation and pre-release gates.
- Neither file contains hardcoded Case 001-only assumptions.

---

### Runtime Boundary Risks

- **None.**
- The package is strictly documentation and metadata.
- No runtime AI, LLMs, MCP services, or external APIs were introduced or enabled.
- Case 001 runtime implementation and release gates remain untouched and gated.
- Case 004 protected rows and released behavior are preserved.
- Graph generation was executed cleanly with `check-understand-refresh-readiness.ps1` reporting `READY` (0 trash directories, 0 log files, 0 temp directories, 653 scanned files).

---

### Drift Risks

- **Mitigated.**
- Prior conflicting tier and red-herring wording in [`docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md`](docs/14-progression-design/Detective-Rank-and-Reward-System-Guide.md) has been replaced with explicit pointers to [`docs/00-ssot/SSOT-Case-Tier-System.md`](docs/00-ssot/SSOT-Case-Tier-System.md).
- Case authoring and case vetting workflows are now standardized across [`docs/00-ssot/SSOT-Case-Authoring.md`](docs/00-ssot/SSOT-Case-Authoring.md) and [`docs/15-case-plans/`](docs/15-case-plans/).
- Implementation bundling guidelines (Tier 1 whole/large slices, Tiers 2-3 2-3 story steps, Tiers 4-5 thread/evidence webs) preserve independent work package lifecycle, audit, human final decision, handoff refresh, and commit-helper gates.
The audit of **WP-269** is complete with a **PASS** verdict. Let me know if you would like to proceed with recording the audit findings in the work package or need any further verifications.

## Final Decision

Accepted on 2026-08-28 after PASS audit and human closeout request. WP-269 is approved because it establishes a Sequel City-specific case-tier SSOT, reconciles rank-guide authority, adds reusable case authoring and vetting templates, preserves deterministic SQL-result completion boundaries, and keeps runtime/database/package scope unchanged.

