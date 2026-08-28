# codex-sandbox-helper-diagnosis-and-resolution

## Objective

Diagnose the repeated Codex sandbox helper setup failure in this workspace and either restore normal sandboxed command execution or record the exact external/runtime blocker with a safe operating policy.

## Scope

### In Scope
- Reproduce the sandbox helper failure with the smallest non-mutating commands available in this repository.
- Capture exact failure text, command context, shell, workspace root, current permission profile, and whether the failure affects reads, writes, `apply_patch`, or specific command classes.
- Inspect repository-local workflow docs and scripts for existing sandbox/escalation guidance.
- Inspect available local Codex/helper logs or configuration paths only when they are readable in the current environment and do not expose unrelated secrets.
- Determine whether the issue is repository-local, workspace path/permission related, Codex desktop/runtime related, or still unknown.
- Apply a narrow repository-local remediation only if the root cause is in repo-owned docs/scripts/skills or workspace configuration.
- Add a small diagnostic helper script or workflow document only if it materially improves future troubleshooting.
- Document the safe fallback policy for when sandbox setup fails: use escalation only for necessary, reviewed commands; do not disable sandbox globally as a default workaround.
- Refresh `END-OF-DAY-HANDOFF.md` at closeout with the sandbox state and any remaining operational caveat.
- Refresh tracked Understand graph artifacts only if implementation changes repo-local scripts, skills, or major workflow docs.

### Out of Scope
- Disabling Codex sandboxing globally as the default solution.
- Changing application runtime code, frontend code, backend code, database scripts, tests, package manifests, lockfiles, or dependencies.
- Modifying `.git/**`, repository history, remotes, branches, or credential state except through normal accepted-WP finalization later.
- Editing files outside this repository without explicit user approval during implementation.
- Reading or copying secrets, tokens, credential stores, private session payloads, or unrelated user-profile data.
- Installing, reinstalling, upgrading, or deleting Codex, plugins, Node, PowerShell, Git, or system components without explicit user approval.
- Adding broad shell wrappers that silently force escalation for normal work.
- Treating escalated execution as equivalent to a fixed sandbox.

## Impact Analysis

### Understand Status
- Graph available: Yes (`.understand-anything/knowledge-graph.json`, `fingerprints.json`, `meta.json`, and `intermediate/scan-result.json` exist).
- Baseline commit: `fac4b676c7e3d585194f063f4ecfc1a05da16df1` from `.understand-anything/meta.json` after WP-267 closeout.
- Freshness assessment: Current after WP-267 closeout and subsequent WP-268 graph refresh. Source inspection and observed command behavior remain authoritative for the sandbox failure.
- Analysis performed: Confirmed `main` tracks `origin/main` at `fac4b67`. Restored the WP-268 draft from the WP-267 isolation stash. Searched repository docs/scripts/skills for `sandbox`, `Codex`, `approval`, and `escalation`; existing guidance covered expected escalation for real Git commits but not repeated normal sandbox setup failures. Reproduced normal sandboxed command and `apply_patch` failures with `helper_unknown_error: setup refresh had errors`; equivalent escalated PowerShell controls succeeded. Inspected sandbox-specific local diagnostics without reading auth/config/session contents and found `setup_error.json` plus sandbox log evidence of an ACL failure on the repo-local `.codex` directory.

### Affected Architecture
- Layers: development workflow documentation, optional repository-local diagnostic tooling, Codex desktop operating procedure, WP planning/implementation ergonomics.
- Primary files/components: this WP, optional `docs/05-development-workflow/Codex-Sandbox-Troubleshooting.md`, optional `scripts/check-codex-sandbox-health.ps1`, optional focused script tests if a script is added, closeout handoff.
- Upstream consumers: human developer, Codex planning/implementation sessions, closeout/finalization flow, future agents encountering sandbox helper failures.
- Downstream dependencies: future WP implementation/audit reliability, scope safety, command approval friction, and accurate handoff between machines/sessions.

### Regression Surface
- Related tests:
  - If only documentation changes: `git diff --check` plus targeted `rg` checks for the new sandbox guidance.
  - If a diagnostic script is added: run the script in dry-run/non-mutating mode and add or run the closest existing PowerShell script test pattern if practical.
  - If workflow docs or repo-local skills are changed: `scripts/check-understand-refresh-readiness.ps1`, `scripts/refresh-understand-graph.ps1`, `scripts/check-understand-refresh-readiness.ps1`, and `git diff --check`.
- User workflows: normal Codex repository inspection, file edits, WP creation, `apply_patch`, test/build command execution, accepted-WP commit-helper execution.
- Security/data boundaries: sandbox remains the preferred default guardrail; escalated commands require command-specific justification; no secrets or unrelated user data may be collected; external repair actions require explicit user approval.

### Graph Update Decision
- Regeneration required: Conditional.
- Rationale: If the implementation only creates this WP and records operational findings, no graph refresh is required. If implementation changes repo-local scripts, skills, or major workflow docs, graph regeneration is required and tracked graph artifacts are allowed below.

## Files Allowed to Change

Allowed:

- docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md
- docs/05-development-workflow/Codex-Sandbox-Troubleshooting.md
- docs/00-ssot/END-OF-DAY-HANDOFF.md
- scripts/check-codex-sandbox-health.ps1
- scripts/tests/test-codex-sandbox-health.ps1
- .understand-anything/knowledge-graph.json
- .understand-anything/fingerprints.json
- .understand-anything/meta.json
- .understand-anything/intermediate/scan-result.json

Do Not Modify:

- apps/**
- database/**
- docs/00-ssot/SSOT-*.md
- docs/01-work-packages/WP-267-case-001-ceremony-roster-m4-data-validator.md
- docs/15-case-plans/**
- .codex/skills/**
- scripts/run-work-package.ps1
- scripts/work-package/**
- scripts/commit-work-package.ps1
- package.json
- package-lock.json
- apps/web/package.json
- apps/api/package.json
- .git/**

## Constraints

- Keep the sandbox as the preferred default safety boundary.
- Do not remove, bypass, or globally disable sandboxing as the resolution unless the human explicitly asks after reviewing findings.
- Use only non-mutating reproduction commands until the root cause is understood.
- Avoid collecting secrets, auth tokens, private prompts, unrelated logs, or broad user-profile data.
- Any outside-repository repair action must be explicitly approved by the user during implementation.
- Any diagnostic script must be read-only by default and must not alter Codex configuration, environment variables, permissions, Git state, or repo files except when tests deliberately write to a temp fixture.
- Do not broaden normal repo workflow to auto-escalate every command; escalation remains a per-command fallback for this failure state.
- Preserve unrelated WP-267 planning work in the dirty worktree.

## Required Behavior

- The implementer records a reproducible sandbox failure matrix with at least:
  - one read command attempted without escalation,
  - one non-mutating Git/status command attempted without escalation,
  - one file-edit path or `apply_patch` attempt if safe,
  - the same or equivalent checks with escalation only as a control.
- The implementer identifies the best current classification: repository-local, workspace path/permissions, Codex desktop/runtime/helper, approval-policy, or unknown.
- If a repository-local fix is found, implement it within the allowed files and verify it.
- If the issue is outside repository control, record the exact blocker and recommended user action without pretending the sandbox is fixed.
- The final guidance distinguishes expected escalation for known Git index writes from abnormal escalation caused by sandbox setup failure.
- Documentation or scripts, if added, explain how to troubleshoot without exposing secrets or disabling guardrails.
- Closeout handoff records the resulting sandbox state and operational caveat.

## Acceptance Criteria

- [ ] The WP records the observed error string `helper_unknown_error: setup refresh had errors` and the context in which it occurs.
- [ ] The implementation captures a minimal reproduction matrix for sandboxed vs escalated behavior.
- [ ] The root-cause classification is documented with evidence, or the remaining unknown is explicitly bounded.
- [ ] If a repo-owned remediation is possible, it is implemented within the allowed files and verified.
- [ ] If remediation is external to the repo/Codex runtime, the blocker and user action are recorded instead of disabling sandboxing.
- [ ] Any new diagnostic script is read-only by default and has focused validation.
- [ ] Any new documentation clearly says fixing the sandbox is preferred over removing it.
- [ ] Expected Git commit-helper escalation remains documented separately from abnormal sandbox helper failure.
- [ ] No app, database, dependency, package, lockfile, Case 001/004, release, persistence, or runtime behavior changes are made.
- [ ] WP-267 remains untouched.
- [ ] Graph regeneration is performed only if triggered by script, skill, or major workflow-doc changes; otherwise the no-refresh rationale is recorded.
- [ ] `git diff --check` passes.
- [ ] No unrelated files changed.

## Code Prompt

Implement WP-268 exactly as specified.

Scope:
- Only modify the allowed files.

Required implementation shape:
- Reproduce and document the sandbox helper failure using minimal non-mutating commands.
- Inspect repository-local workflow guidance and any safe local Codex/helper diagnostic surfaces available in this environment.
- Classify the failure and either fix the repo-owned cause or record the external/runtime blocker.
- Add a read-only diagnostic helper script or troubleshooting doc only if it materially improves future recovery.
- Keep sandboxing as the default preferred guardrail and keep escalated execution as a temporary, justified workaround.
- Preserve WP-267 and all app/database/runtime scope.

Verification:
- Always run `git diff --check`.
- If a script is added, run its non-mutating/default mode and any focused script test added for it.
- If workflow docs or scripts are changed, run `scripts/check-understand-refresh-readiness.ps1`, `scripts/refresh-understand-graph.ps1`, and `scripts/check-understand-refresh-readiness.ps1`; otherwise record why graph refresh was not required.

Return:
- Exact reproduction matrix.
- Root-cause classification and evidence.
- Exact file changes.
- Validation results.
- Remaining sandbox/runtime caveats.

## Audit Prompt

Audit WP-268 with an adversarial stance.

Verify:
- All acceptance criteria are satisfied.
- No files outside the allowed list were modified.
- WP-267 was not modified.
- The diagnosis distinguishes expected Git index escalation from abnormal sandbox setup failure.
- The work does not disable or recommend globally disabling sandboxing as the default fix.
- Any outside-repository or Codex runtime remediation is recorded as requiring explicit user approval unless already approved.
- Any diagnostic script is read-only by default and does not collect secrets or alter configuration.
- The recorded reproduction matrix is concrete enough for a future session or machine handoff.
- Graph regeneration decision was followed.
- Validation evidence matches the changed files.

Output:
- Verdict: PASS or FAIL
- Scope violations
- Diagnostic evidence gaps
- Safety risks
- Remaining blocker assessment
- Drift risks

## Code Results

Implemented WP-268 as a bounded diagnosis and repository-local troubleshooting aid.

### Reproduction Matrix

| Check | Sandboxed result | Escalated control | Evidence |
| --- | --- | --- | --- |
| Read-only shell command: `Get-Location` | Failed before process launch: `helper_unknown_error: setup refresh had errors` | PASS: returned `D:\GitHub-Repos\SequelCityWeb` | Failure came from unified exec setup, not command logic. |
| Non-mutating Git command: `git status --short` | Failed before process launch: `helper_unknown_error: setup refresh had errors` | PASS: reported only untracked WP-268 before implementation | Confirms Git read/status commands are affected. |
| Read-only file command: `Get-Content docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md | Select-Object -First 1` | Failed before process launch: `helper_unknown_error: setup refresh had errors` | PASS: returned the WP title | Confirms repository file reads are affected. |
| File edit path: no-op `apply_patch` against WP-268 title | Failed before file read: `fs sandbox helper failed with status exit code: 1: windows sandbox failed: helper_unknown_error: setup refresh had errors` | Escalated PowerShell file writes worked for allowed WP-268 files | Confirms patch tooling is also blocked by sandbox helper setup. |

### Root-Cause Classification

Classification: `workspace-acl-on-repo-local-codex-directory`.

Evidence:
- `C:\Users\cburk\.codex\.sandbox\setup_error.json` contains `code: helper_unknown_error` and `message: setup refresh had errors`.
- Today's sandbox log records: `deny ACE failed on D:\GitHub-Repos\SequelCityWeb\.codex: SetNamedSecurityInfoW failed for D:\GitHub-Repos\SequelCityWeb\.codex: 5`.
- Win32 error `5` is access denied.
- Workspace root ACL owner: `NEUMONT\Cburk`.
- Repo-local `.codex` ACL owner: `BURKG7\CodexSandboxOffline`.
- Escalated controls succeed, so PowerShell, Git, and repository path access are not generally broken.

Conclusion: this is not an application/runtime-code defect and not an approval-policy issue. The best-supported cause is stale or incompatible Windows ownership/ACL metadata on the repo-local `.codex` directory, surfaced through the Codex desktop Windows sandbox setup helper. A repo-tracked code fix is not available because the failing operation is filesystem ACL metadata outside Git content.

### File Changes

- Added `docs/05-development-workflow/Codex-Sandbox-Troubleshooting.md` with the safe operating policy, observed failure signature, diagnostic workflow, and remediation guidance.
- Added `scripts/check-codex-sandbox-health.ps1`, a read-only diagnostic that reports setup error state, relevant sandbox log evidence, workspace/repo `.codex` ACL ownership metadata, safety flags, classification, and recommended action.
- Added `scripts/tests/test-codex-sandbox-health.ps1` with fixture-based validation for failure and healthy classifications without touching real Codex configuration.
- Updated this WP with the observed reproduction matrix, classification, validation evidence, and graph-refresh result.
- Refreshed tracked Understand graph artifacts because workflow documentation and a script were added.

### Validation

- PASS: `scripts/check-codex-sandbox-health.ps1` reported `SandboxHelperSetupFailureDetected`, classification `workspace-acl-on-repo-local-codex-directory`, repo `.codex` owner `BURKG7\CodexSandboxOffline`, and the same `helper_unknown_error: setup refresh had errors` setup error.
- PASS: `scripts/tests/test-codex-sandbox-health.ps1`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` before graph refresh.
- PASS: `scripts/refresh-understand-graph.ps1`; graph rebuilt with `filesScanned=649`, `nodes=1057`, `edges=408`, `layers=6`, `tourSteps=7`, and `Fingerprints baseline: 649 files`.
- PASS: `scripts/check-understand-refresh-readiness.ps1` after graph refresh.
- PASS: targeted `rg` checks confirmed the troubleshooting doc, diagnostic script, test, and WP record include the helper error string, safe no-global-disable policy, read-only diagnostic behavior, commit-helper escalation distinction, and `workspace-acl-on-repo-local-codex-directory` classification.
- PASS: `git diff --check` (only Git LF-to-CRLF working-copy warnings were emitted).
- PASS: official OpenAI documentation search was performed for the exact helper error; no official page documenting this error/remediation was found, so no official fix is claimed.

### Remaining Sandbox Runtime Caveat

Normal sandboxed execution is still blocked in this workspace. The repo now documents and detects the condition, but it does not silently repair ACLs, disable sandboxing, reinstall Codex, or modify out-of-repo configuration.

Recommended user action: restart Codex and retry a minimal sandboxed read. If the error persists, explicitly approve a filesystem ACL repair or fresh-clone/recreate strategy for the repo-local `.codex` directory after preserving required `.codex/skills` content.

Until that repair is approved and verified, continue using per-command escalation only for necessary reviewed commands. Do not treat escalation as a sandbox fix.

## Audit Results
Verdict: PASS

### Scope Violations
- **None detected.**
- All modified and untracked files strictly adhere to the allowed files list in [WP-268](docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md):
  - [`docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md`](docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md)
  - [`docs/05-development-workflow/Codex-Sandbox-Troubleshooting.md`](docs/05-development-workflow/Codex-Sandbox-Troubleshooting.md)
  - [`scripts/check-codex-sandbox-health.ps1`](scripts/check-codex-sandbox-health.ps1)
  - [`scripts/tests/test-codex-sandbox-health.ps1`](scripts/tests/test-codex-sandbox-health.ps1)
  - [`.understand-anything/knowledge-graph.json`](.understand-anything/knowledge-graph.json)
  - [`.understand-anything/fingerprints.json`](.understand-anything/fingerprints.json)
  - [`.understand-anything/meta.json`](.understand-anything/meta.json)
  - [`.understand-anything/intermediate/scan-result.json`](.understand-anything/intermediate/scan-result.json)
- [WP-267](docs/01-work-packages/WP-267-case-001-ceremony-roster-m4-data-validator.md) was committed cleanly in HEAD (`fac4b67`) and is untouched in the working tree.
- No changes were made to `apps/**`, `database/**`, dependencies, manifests, lockfiles, or product runtime logic.

---

### Diagnostic Evidence Gaps
- **None detected.**
- **Error signature:** Exact error `helper_unknown_error: setup refresh had errors` was captured and verified across `setup_error.json` and sandbox logs.
- **Root-cause evidence:** Log analysis identified Win32 error code `5` (`Access is denied`) on `SetNamedSecurityInfoW` for `D:\GitHub-Repos\SequelCityWeb\.codex` during deny ACE application.
- **Ownership discrepancy:** Confirmed that workspace root owner is `NEUMONT\Cburk` while `D:\GitHub-Repos\SequelCityWeb\.codex` owner is `BURKG7\CodexSandboxOffline`.
- **Reproduction matrix:** Concrete matrix recorded for 4 command categories (`Get-Location`, `git status --short`, `Get-Content`, and `apply_patch`), distinguishing failure before process launch under sandbox from successful execution under escalated controls.
- **Git escalation distinction:** Guidance explicitly differentiates abnormal sandbox helper failures from expected escalation required for `.git/index.lock` writes during work package commit finalization.

---

### Safety Risks
- **No global bypass:** Neither the documentation nor the scripts recommend or apply global disablement of sandboxing; sandboxing is maintained as the primary security boundary.
- **Read-only diagnostic tooling:** [`scripts/check-codex-sandbox-health.ps1`](scripts/check-codex-sandbox-health.ps1) is strictly read-only, makes no permission or configuration edits, does not invoke commands through the failing helper, and does not inspect credentials, auth tokens, sessions, or private prompt payloads.
- **Explicit user approval boundary:** External remediation (e.g., Windows ACL reset or `.codex` recreation) is explicitly documented as requiring user authorization and prior backup of repo-local [`.codex/skills`](.codex/skills).

---

### Remaining Blocker Assessment
- **Status:** Sandboxed command execution remains blocked in this local workspace until Windows filesystem ACLs on the repo-local `.codex` folder are reconciled or recreated.
- **Remediation path:** 
  1. Restart Codex desktop and test a minimal sandboxed read.
  2. If the error persists, run [`scripts/check-codex-sandbox-health.ps1`](scripts/check-codex-sandbox-health.ps1).
  3. With explicit user approval, repair ownership/ACLs on `D:\GitHub-Repos\SequelCityWeb\.codex` (ensuring [`.codex/skills`](.codex/skills) is preserved).
- **Temporary operating policy:** Continue using per-command escalation only for reviewed, necessary operations; escalation is treated strictly as a workaround, not a fix.

---

### Drift Risks
- **Understand graph:** Tracked artifacts updated and validated via [`scripts/check-understand-refresh-readiness.ps1`](scripts/check-understand-refresh-readiness.ps1) (status: `READY`).
- **Whitespace / Line endings:** `git diff --check` passed cleanly.
- **Handoff alignment:** [`docs/00-ssot/END-OF-DAY-HANDOFF.md`](docs/00-ssot/END-OF-DAY-HANDOFF.md) currently holds the WP-267 closed state and is ready for the standard handoff refresh upon WP-268 closeout.
The background tasks have concluded and all verification checks are complete. The adversarial audit verdict for [WP-268](docs/01-work-packages/WP-268-codex-sandbox-helper-diagnosis-and-resolution.md) remains **PASS**.

## Final Decision

Accepted on 2026-08-28 after PASS audit and human closeout request.
