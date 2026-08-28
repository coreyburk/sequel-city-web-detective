[CmdletBinding()]
param(
    [string]$ProjectRoot,
    [string]$CodexHome,
    [string]$SandboxDirectory,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

function Resolve-DefaultProjectRoot {
    return Split-Path -Path $PSScriptRoot -Parent
}

function ConvertTo-SafeDisplayPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $null
    }

    try {
        return (Resolve-Path -LiteralPath $Path -ErrorAction Stop).Path
    } catch {
        return $Path
    }
}

function Read-SetupError {
    param([string]$SandboxPath)

    $path = Join-Path $SandboxPath 'setup_error.json'
    if (-not (Test-Path -LiteralPath $path)) {
        return $null
    }

    try {
        return Get-Content -Raw -LiteralPath $path | ConvertFrom-Json
    } catch {
        return [pscustomobject]@{
            code = 'unreadable_setup_error'
            message = $_.Exception.Message
        }
    }
}

function Get-LatestSandboxLog {
    param([string]$SandboxPath)

    if (-not (Test-Path -LiteralPath $SandboxPath)) {
        return $null
    }

    return Get-ChildItem -LiteralPath $SandboxPath -Filter 'sandbox*.log' -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

function Get-RelevantLogLines {
    param(
        [System.IO.FileInfo]$LogFile,
        [string]$NeedlePath
    )

    if ($null -eq $LogFile) {
        return @()
    }

    $escapedNeedle = [regex]::Escape($NeedlePath)
    $patterns = @(
        'setup refresh had errors',
        'helper_unknown_error',
        'SetNamedSecurityInfoW failed',
        'deny ACE failed',
        $escapedNeedle
    )

    $combined = ($patterns -join '|')
    return @(Select-String -LiteralPath $LogFile.FullName -Pattern $combined -AllMatches | Select-Object -Last 12 | ForEach-Object { $_.Line })
}

function Get-AclSummary {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return [pscustomobject]@{
            exists = $false
            path = $Path
            owner = $null
            accessRulesProtected = $null
        }
    }

    try {
        $acl = Get-Acl -LiteralPath $Path
        return [pscustomobject]@{
            exists = $true
            path = ConvertTo-SafeDisplayPath $Path
            owner = $acl.Owner
            accessRulesProtected = $acl.AreAccessRulesProtected
        }
    } catch {
        return [pscustomobject]@{
            exists = $true
            path = ConvertTo-SafeDisplayPath $Path
            owner = $null
            accessRulesProtected = $null
            error = $_.Exception.Message
        }
    }
}

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Resolve-DefaultProjectRoot
}
$ProjectRoot = ConvertTo-SafeDisplayPath $ProjectRoot

if ([string]::IsNullOrWhiteSpace($CodexHome)) {
    $CodexHome = Join-Path $env:USERPROFILE '.codex'
}
$CodexHome = ConvertTo-SafeDisplayPath $CodexHome

if ([string]::IsNullOrWhiteSpace($SandboxDirectory)) {
    $SandboxDirectory = Join-Path $CodexHome '.sandbox'
}
$SandboxDirectory = ConvertTo-SafeDisplayPath $SandboxDirectory

$repoCodexPath = Join-Path $ProjectRoot '.codex'
$setupError = Read-SetupError -SandboxPath $SandboxDirectory
$latestLog = Get-LatestSandboxLog -SandboxPath $SandboxDirectory
$relevantLogLines = Get-RelevantLogLines -LogFile $latestLog -NeedlePath $repoCodexPath
$projectAcl = Get-AclSummary -Path $ProjectRoot
$repoCodexAcl = Get-AclSummary -Path $repoCodexPath
$currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

$hasSetupError = $null -ne $setupError
$hasRepoCodexDenyAceError = @($relevantLogLines | Where-Object {
    $_ -match 'deny ACE failed' -and $_ -match [regex]::Escape($repoCodexPath)
}).Count -gt 0
$hasSetNamedSecurityInfoError = @($relevantLogLines | Where-Object {
    $_ -match 'SetNamedSecurityInfoW failed' -and $_ -match ': 5'
}).Count -gt 0

$status = 'NoSandboxSetupFailureDetected'
$classification = 'not-reproduced-by-log-inspection'
$recommendedAction = 'Prefer normal sandboxed commands. Use escalation only for commands that genuinely require it.'

if ($hasSetupError -or $hasRepoCodexDenyAceError -or $hasSetNamedSecurityInfoError) {
    $status = 'SandboxHelperSetupFailureDetected'
    $classification = 'codex-desktop-runtime-helper-or-workspace-acl'
    $recommendedAction = 'Do not disable sandboxing globally. Restart Codex first; if the same error persists, repair the repo-local .codex directory ownership/ACL or recreate that directory only after explicit user approval and after preserving required repo-local skill content.'
}

if ($hasRepoCodexDenyAceError -and $hasSetNamedSecurityInfoError) {
    $classification = 'workspace-acl-on-repo-local-codex-directory'
}

$result = [pscustomobject]@{
    status = $status
    classification = $classification
    projectRoot = $ProjectRoot
    shell = 'PowerShell'
    currentIdentity = $currentIdentity
    codexHome = $CodexHome
    sandboxDirectory = $SandboxDirectory
    setupError = $setupError
    latestSandboxLog = if ($null -ne $latestLog) { $latestLog.FullName } else { $null }
    projectAcl = $projectAcl
    repoCodexAcl = $repoCodexAcl
    evidence = [pscustomobject]@{
        hasSetupError = $hasSetupError
        hasRepoCodexDenyAceError = $hasRepoCodexDenyAceError
        hasSetNamedSecurityInfoError = $hasSetNamedSecurityInfoError
        relevantLogLines = $relevantLogLines
    }
    safety = [pscustomobject]@{
        readOnly = $true
        changesPermissions = $false
        readsSecrets = $false
        disablesSandbox = $false
    }
    recommendedAction = $recommendedAction
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
    exit 0
}

Write-Output "Codex sandbox health: $($result.status)"
Write-Output "Classification: $($result.classification)"
Write-Output "Project root: $($result.projectRoot)"
Write-Output "Current identity: $($result.currentIdentity)"
Write-Output "Repo .codex owner: $($result.repoCodexAcl.owner)"
if ($null -ne $result.setupError) {
    Write-Output "Setup error: $($result.setupError.code): $($result.setupError.message)"
}
if ($result.evidence.hasRepoCodexDenyAceError) {
    Write-Output "Evidence: latest sandbox log reports deny ACE failure for repo-local .codex."
}
Write-Output "Safety: read-only=$($result.safety.readOnly); changesPermissions=$($result.safety.changesPermissions); disablesSandbox=$($result.safety.disablesSandbox)"
Write-Output "Recommended action: $($result.recommendedAction)"