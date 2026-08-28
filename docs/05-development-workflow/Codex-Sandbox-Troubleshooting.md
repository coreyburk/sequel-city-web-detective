# Codex Sandbox Troubleshooting

## Purpose

This guide documents how to inspect Codex sandbox helper failures in this repository without disabling the sandbox or collecting secrets.

Use it when normal sandboxed command execution fails before a command starts, especially with:

```text
helper_unknown_error: setup refresh had errors
```

## Preferred Policy

Fix the sandbox when practical. Do not remove or globally disable sandboxing as the default response.

When the helper fails before command execution, use per-command escalation only as a temporary, reviewed workaround for necessary repository work. Keep the escalation justification tied to the exact command being run.

This abnormal helper failure is separate from expected escalation for accepted work-package commits. The commit helper writes `.git/index.lock`, so real finalization commits may need escalation even when normal sandboxed reads and tests work.

## Read-Only Diagnostic Script

Run:

```powershell
scripts/check-codex-sandbox-health.ps1
```

For machine-readable output:

```powershell
scripts/check-codex-sandbox-health.ps1 -Json
```

The script is read-only. It reports:

- project root and current Windows identity
- Codex sandbox setup error metadata, if present
- latest sandbox log lines matching setup-refresh or ACL failure patterns
- owner metadata for the workspace root and repo-local `.codex` directory
- whether the evidence points to a repo-local `.codex` ACL condition

The script does not:

- change permissions or ownership
- edit Codex configuration
- disable sandboxing
- run external commands through the sandbox
- read auth files, tokens, session databases, or unrelated user-profile data

## Current Failure Signature

In the observed BurkG7 workspace on 2026-08-28, sandboxed commands failed before process launch. Examples included read-only commands such as `Get-Location`, `git status --short`, `Get-Content ... | Select-Object -First 1`, and an `apply_patch` no-op.

Escalated controls for equivalent commands succeeded.

The local sandbox setup error file contained:

```json
{
  "code": "helper_unknown_error",
  "message": "setup refresh had errors"
}
```

The current sandbox log showed the concrete failing operation:

```text
deny ACE failed on D:\GitHub-Repos\SequelCityWeb\.codex: SetNamedSecurityInfoW failed for D:\GitHub-Repos\SequelCityWeb\.codex: 5
```

Win32 error `5` is access denied. In the same workspace, the repository root owner was the normal developer account, while the repo-local `.codex` directory owner was `BURKG7\CodexSandboxOffline`. That supports classifying the observed failure as a workspace ACL problem on the repo-local `.codex` directory, surfaced through the Codex desktop Windows sandbox helper.

## Recommended Remediation Path

1. Restart the Codex desktop session and retry a minimal sandboxed read command.
2. If the failure persists, run `scripts/check-codex-sandbox-health.ps1` and review the reported status and classification.
3. If the script reports a repo-local `.codex` ACL/ownership condition, preserve any required repo-local skill content under `.codex/skills` before changing filesystem metadata.
4. Repair ownership/ACLs for the repo-local `.codex` directory only with explicit user approval. This may require Windows administrative rights or a fresh clone depending on machine policy.
5. Retry minimal sandboxed reads and `apply_patch` after repair.

Do not delete `.codex`, reinstall Codex, alter global Codex config, or change Windows account permissions as an unreviewed workaround.

## Safe Fallback While Blocked

If the sandbox helper still fails and work must continue:

- prefer the smallest command that answers the immediate question
- use escalation with a concrete justification
- avoid broad or persistent escalation rules
- do not run destructive filesystem, dependency, database, network, or credential-affecting commands unless the user explicitly approves that action
- record the limitation in the active work package and handoff

## Reproduction Matrix Template

Record at least these checks in the active work package:

| Check | Sandboxed result | Escalated control | Notes |
| --- | --- | --- | --- |
| Read-only shell command | error or output | output | e.g. `Get-Location` |
| Non-mutating Git command | error or output | output | e.g. `git status --short` |
| Read-only file command | error or output | output | e.g. `Get-Content <wp> | Select-Object -First 1` |
| File edit path | error or output | output or not run | e.g. no-op `apply_patch`; do not use destructive edits |

A sandbox failure is not fixed until normal sandboxed commands run successfully without escalation.