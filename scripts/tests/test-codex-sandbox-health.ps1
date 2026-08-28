$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Path $PSScriptRoot -Parent
$projectRoot = Split-Path -Path $scriptRoot -Parent
$checkerPath = Join-Path $projectRoot 'scripts/check-codex-sandbox-health.ps1'
$tempRoot = Join-Path $env:TEMP ('sequel-city-codex-sandbox-health-test-' + [guid]::NewGuid().ToString('N'))

function Assert-Equal {
    param(
        [Parameter(Mandatory = $true)][object]$Actual,
        [Parameter(Mandatory = $true)][object]$Expected,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($Actual -ne $Expected) {
        throw "$Message Expected '$Expected' but got '$Actual'."
    }
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Assert-ScriptParses {
    param([Parameter(Mandatory = $true)][string]$Path)

    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($Path, [ref]$null, [ref]$parseErrors) | Out-Null
    if ($parseErrors -and $parseErrors.Count -gt 0) {
        $formattedErrors = $parseErrors | ForEach-Object { $_.Message } | Out-String
        throw "Script has parse errors at $Path`n$formattedErrors"
    }
}

try {
    Assert-ScriptParses -Path $checkerPath

    $fixtureProject = Join-Path $tempRoot 'repo'
    $fixtureCodexHome = Join-Path $tempRoot 'codex-home'
    $fixtureSandbox = Join-Path $fixtureCodexHome '.sandbox'
    $fixtureRepoCodex = Join-Path $fixtureProject '.codex'
    New-Item -ItemType Directory -Path $fixtureRepoCodex -Force | Out-Null
    New-Item -ItemType Directory -Path $fixtureSandbox -Force | Out-Null

    Set-Content -LiteralPath (Join-Path $fixtureSandbox 'setup_error.json') -Value '{"code":"helper_unknown_error","message":"setup refresh had errors"}'
    $logLine = "[2026-08-28T14:47:13.282441700+00:00] deny ACE failed on $fixtureRepoCodex`: SetNamedSecurityInfoW failed for $fixtureRepoCodex`: 5"
    Set-Content -LiteralPath (Join-Path $fixtureSandbox 'sandbox.2026-08-28.log') -Value $logLine

    $jsonText = & $checkerPath -ProjectRoot $fixtureProject -CodexHome $fixtureCodexHome -SandboxDirectory $fixtureSandbox -Json
    $result = $jsonText | ConvertFrom-Json

    Assert-Equal -Actual $result.status -Expected 'SandboxHelperSetupFailureDetected' -Message 'Fixture should detect setup failure.'
    Assert-Equal -Actual $result.classification -Expected 'workspace-acl-on-repo-local-codex-directory' -Message 'Fixture should classify repo-local .codex ACL failure.'
    Assert-Equal -Actual $result.setupError.code -Expected 'helper_unknown_error' -Message 'Fixture should report helper error code.'
    Assert-Equal -Actual $result.setupError.message -Expected 'setup refresh had errors' -Message 'Fixture should report helper error message.'
    Assert-True -Condition ([bool]$result.safety.readOnly) -Message 'Script must report read-only behavior.'
    Assert-True -Condition (-not [bool]$result.safety.changesPermissions) -Message 'Script must not change permissions.'
    Assert-True -Condition (-not [bool]$result.safety.disablesSandbox) -Message 'Script must not disable sandboxing.'
    Assert-True -Condition ([bool]$result.evidence.hasRepoCodexDenyAceError) -Message 'Fixture should detect repo .codex deny ACE evidence.'

    $healthyProject = Join-Path $tempRoot 'healthy-repo'
    $healthyCodexHome = Join-Path $tempRoot 'healthy-codex-home'
    $healthySandbox = Join-Path $healthyCodexHome '.sandbox'
    New-Item -ItemType Directory -Path (Join-Path $healthyProject '.codex') -Force | Out-Null
    New-Item -ItemType Directory -Path $healthySandbox -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $healthySandbox 'sandbox.2026-08-28.log') -Value 'setup refresh: processed 3 write roots (read roots delegated); errors=[]'

    $healthyJson = & $checkerPath -ProjectRoot $healthyProject -CodexHome $healthyCodexHome -SandboxDirectory $healthySandbox -Json
    $healthyResult = $healthyJson | ConvertFrom-Json
    Assert-Equal -Actual $healthyResult.status -Expected 'NoSandboxSetupFailureDetected' -Message 'Healthy fixture should not report setup failure.'
    Assert-Equal -Actual $healthyResult.safety.readsSecrets -Expected $false -Message 'Script must not read secrets.'

    Write-Output 'PASS check-codex-sandbox-health diagnostics remain read-only and classify fixture failures.'
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}