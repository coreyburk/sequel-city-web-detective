# Contributor Workflow Guide

## Purpose

This guide explains the standard contributor workflow for continuing development on Sequel City Web after the application is already installed, runnable, and validated. It defines how to use work packages, code agents, audit agents, final decisions, and disciplined commits so project changes stay reviewable and safe.

## Audience

- contributors continuing feature, bug fix, documentation, or corrective work
- reviewers validating work package outputs
- maintainers who need consistent project history and acceptance records

## Prerequisites

- the project is already installed and runnable
- you can pull from the repository and push to your branch
- you understand the relevant project constraints before starting work
- you are prepared to work through a documented work package before making changes

## High-Level Development Loop

Use this loop for each accepted unit of work:

1. Pull the latest changes from the remote branch you are working from.
2. Check `git status` and confirm you understand any existing local changes before starting.
3. Create a new work package for the task you are about to perform.
4. Complete the work package impact analysis, using `$sequel-city-wp-planning` or targeted Understand queries when appropriate.
5. Execute the code agent and audit agent using the work package prompts and the appropriate runner mode.
6. Review the results, changed files, impact assumptions, and any warnings or failures.
7. Update the `Final Decision` section in the work package with the accepted outcome.
8. Commit the accepted work as one cohesive change set.
9. Push the branch so the accepted work package and its implementation are available for review.

When starting or resuming a work package, run `scripts/get-agentic-workflow-status.ps1 -WorkPackage <work-package>` for a read-only snapshot of git state, lifecycle status, validation-plan state, closeout readiness, and Understand refresh readiness. Use `-Json` when a future development-time orchestration tool needs machine-readable state, and use `-SkipUnderstandReadiness` only when the local environment should not probe Understand readiness.

To preview the next likely workflow step without executing it, run `scripts/get-agentic-workflow-decision.ps1 -WorkPackage <work-package>`. The decision router is advisory and dry-run only: it consumes the status bundle, recommends the next allowed action, and does not run implementation, audit, acceptance, handoff refresh, commit, push, external calls, or graph refresh.

When the next step remains unclear, run `scripts/get-work-package-status.ps1 <work-package>` before implementation, audit, or finalization. The checker is read-only and reports lifecycle state, dirty-file scope, parsed final decision, and the next recommended action.

When validation coverage is unclear, run `scripts/get-work-package-validation-plan.ps1 <work-package>` before implementation or audit. The checker is read-only and reports related tests, planned verification commands, recorded validation evidence, and missing validation-plan findings.

Before audit closeout or accepted-WP finalization, run `scripts/check-work-package-closeout.ps1 <work-package>`. The preflight is read-only and reports whether the WP is `ReadyForAudit`, `ReadyForAcceptance`, `ReadyForFinalization`, or `Blocked`. It reports placeholder-only or missing planning sections by exact section name; do not manually rewrite a package merely because an old template lead-in remains above concrete content.

When a WP is ready for closeout, use clear trigger wording such as `Close out WP-178`, `AGY audit is complete. Close out WP-178`, or `Review, update, commit, push, and refresh handoff`. Those phrases should invoke the repo-local closeout/handoff skill, which coordinates audit review, scoped corrections, final decision, required handoff refresh, commit-helper finalization, and push.

For new case production, use [Case Production Workflow](./Case-Production-Workflow.md) before planning implementation packages. That workflow turns the case-tier SSOT, authoring template, and vetting checklist into the standard low-churn lane for tier-first intake, Tier 1/Foundations shaping, bundle sizing, validation selection, audit, and closeout.

## Branch And Pull Guidance

- start from the correct branch and pull before creating a new work package
- confirm `git remote -v` still shows the canonical `origin` URL before normal branch work on a machine-transition clone
- if the clone still points at the previous GitHub repository path, run `git remote set-url origin https://github.com/coreyburk/sequel-city-web.git` before the next pull or push
- do not begin new work on stale local history
- keep each accepted work package cohesive so the resulting branch history is understandable
- if a branch contains unrelated unfinished work, resolve that state before starting another accepted work package
- at machine-switch time, refresh `docs/00-ssot/END-OF-DAY-HANDOFF.md` from `docs/00-ssot/END-OF-DAY-HANDOFF-TEMPLATE.md` so the live handoff reflects current state instead of older completed WPs

## Work Package Overview

A work package is the project's required unit of planned and reviewed development work. It defines scope, allowed files, constraints, acceptance criteria, execution prompts, tool results, and the final acceptance record. Every meaningful change should be grounded in a work package so the project can distinguish requested work from rejected or deferred work.

For the full lifecycle, see [Work Package Lifecycle](./Work-Package-Lifecycle.md).

For cross-module, architecture, database, security-boundary, or case-progression work, complete the `Impact Analysis` section before implementation. The repository-local `$sequel-city-wp-planning` skill can inspect the Understand graph, propose affected files and tests, and create the next WP. Its output remains advisory and must be checked against source and SSOT.

When a planned change is already known to require an Understand graph refresh, include the tracked graph artifacts in that same WP unless the scope cannot safely own generated graph output. Use a separate graph-refresh WP for unplanned prior drift, graph repair, or earlier packages that did not or could not include graph artifacts.

For agentic development workflow evaluation, see [Agentic Development Workflow Evaluation](./Agentic-Development-Workflow-Evaluation.md). That document treats agent tooling as development-process support only; it does not authorize runtime AI or replacement of human final acceptance.

For OpenAI Agents SDK readiness, see [OpenAI Agents SDK Orchestration Readiness](./OpenAI-Agents-SDK-Orchestration-Readiness.md). That document treats the SDK as a future development-time orchestration candidate only; it does not authorize dependency installation, runtime AI, external data transmission, or bypassing the current work-package gates.

## Code Agent Role

The code agent (Codex or Claude) is the implementation agent for the work package. Its role is to:

- read the work package instructions carefully
- make only the allowed changes
- report concrete implementation results
- surface blockers, limitations, or scope concerns when they occur

Code agent output belongs in the `Code Results` section of the work package record.

For execution modes and result handling, see [Code Agent And Audit Execution Guide](./Codex-Gemini-Execution-Guide.md).

## Audit Agent Role

The audit agent (AntiGravity preferred when available, Gemini as legacy/alternate) is the independent review agent for the work package. Its role is to:

- inspect the accepted or proposed changes
- validate scope compliance
- identify regressions, omissions, or prompt issues
- provide a pass, fail, or warning-oriented review record

Audit output belongs in the `Audit Results` section of the work package record.

Use the repo-local `sequel-city-audit-runner-contracts` skill when preparing, interpreting, or recording AntiGravity audits, blocked external audits, or self-audit fallback. Self-audit is not independent review and must be labeled as fallback evidence.

AGY audits are explicit because they can send work-package prompt and repository context to an external service. Prefer `scripts/audit-work-package.ps1 <work-package> -AllowExternalAudit` for audit-only requests after the human authorizes external audit data sharing for the repository state. The wrapper delegates to `scripts/run-work-package.ps1 -Execute Audit -AuditAgent AntiGravity`; without `-AllowExternalAudit`, the runner records a blocked audit result and does not invoke AGY.

Before audit or finalization, keep the working tree isolated to the active work package. The runner and commit helper compare current dirty files with the active WP's `Allowed:` list. If unrelated files are present, audit/finalization stops before invoking an auditor or staging a commit. Use `-AllowMixedWorktree` only when the mixed state is intentional and explicitly reviewed.

## Review And Acceptance Expectations

- review both implementation output and audit output before accepting work
- verify that changed files remain within the allowed scope
- confirm the worktree is isolated to the active work package before independent audit and finalization
- run `scripts/check-work-package-closeout.ps1 <work-package>` and resolve any `Blocked` result before committing
- confirm that acceptance criteria are actually satisfied, not just partially addressed
- record the project decision in `Final Decision`, including whether the work was accepted, deferred, rejected, or requires follow-up
- if tool output is incomplete or environment-limited, do not treat that as accepted completion without an explicit decision
- if independent audit is blocked, record the blocker and label any local review as self-audit before making an explicit human decision

## Commit And Push Expectations

- commit only after the `Final Decision` reflects accepted work
- create one cohesive commit per accepted work package
- include the work package documentation updates in the same commit as the accepted implementation when applicable
- do not push ambiguous or partially accepted work as if it were complete
- refresh `docs/00-ssot/END-OF-DAY-HANDOFF.md` during every accepted-WP commit/push closeout so the live handoff does not lag behind repository history
- ensure packages expected to close out include `docs/00-ssot/END-OF-DAY-HANDOFF.md` as closeout-only scope before the handoff refresh
- if work is intentionally blocked or deferred, document that state clearly before deciding whether a commit is appropriate
- use the repo's multi-line commit format: imperative title, blank line, then concrete change bullets
- do not use one-line Conventional Commit headers for accepted work package closeout in this repo
- prefer `scripts/commit-work-package.ps1` to preview and create the final accepted-WP commit

For commit format expectations, see [Commit Message Guide](./Commit-Message-Guide.md).

## Related Workflow Documents

- [Case Production Workflow](./Case-Production-Workflow.md)
- [Work Package Lifecycle](./Work-Package-Lifecycle.md)
- [Code Agent And Audit Execution Guide](./Codex-Gemini-Execution-Guide.md)
- [Commit Message Guide](./Commit-Message-Guide.md)
- [Prompt Formatting Guidelines](./Prompt-Formatting-Guidelines.md)
- [Understand Codebase Analysis](./Understand-Codebase-Analysis.md)
- [Agentic Development Workflow Evaluation](./Agentic-Development-Workflow-Evaluation.md)
- [OpenAI Agents SDK Orchestration Readiness](./OpenAI-Agents-SDK-Orchestration-Readiness.md)
