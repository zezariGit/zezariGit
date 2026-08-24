Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DpsHome {
    if ($env:DEV_PROFILE_SWITCHER_HOME) {
        return [System.IO.Path]::GetFullPath($env:DEV_PROFILE_SWITCHER_HOME)
    }

    return Join-Path $env:LOCALAPPDATA 'DevProfileSwitcher'
}

function Get-DpsIsoTimestamp {
    return [DateTimeOffset]::Now.ToString('o')
}

function ConvertTo-DpsId {
    param(
        [Parameter(Mandatory)]
        [string]$Value
    )

    $id = $Value.Trim().ToLowerInvariant()
    $id = [regex]::Replace($id, '[^a-z0-9_-]+', '-')
    $id = $id.Trim('-')

    if (-not $id) {
        $id = 'profile-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
    }

    return $id
}

function ConvertTo-DpsPowerShellLiteral {
    param([AllowEmptyString()][string]$Value)
    return "'" + ($Value -replace "'", "''") + "'"
}

function Initialize-DpsStore {
    $home = Get-DpsHome
    foreach ($path in @(
        $home,
        (Join-Path $home 'accounts'),
        (Join-Path $home 'projects'),
        (Join-Path $home 'logs'),
        (Join-Path $home 'runtime')
    )) {
        [System.IO.Directory]::CreateDirectory($path) | Out-Null
    }

    return $home
}

function Write-DpsAuditLog {
    param(
        [Parameter(Mandatory)][string]$Action,
        [string]$ProjectId,
        [string]$AccountId,
        [string]$Result = 'success',
        [string]$Message = ''
    )

    $home = Initialize-DpsStore
    $record = [ordered]@{
        timestamp = Get-DpsIsoTimestamp
        action = $Action
        projectId = $ProjectId
        accountId = $AccountId
        result = $Result
        message = $Message
    }

    $line = $record | ConvertTo-Json -Compress
    Add-Content -LiteralPath (Join-Path $home 'logs\activity.jsonl') -Value $line -Encoding utf8
}

function Write-DpsJson {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)]$Value
    )

    $directory = Split-Path -Parent $Path
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
    $temporaryPath = "$Path.tmp"
    $Value | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $temporaryPath -Encoding utf8
    Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
}

function Read-DpsJson {
    param([Parameter(Mandatory)][string]$Path)
    return Get-Content -LiteralPath $Path -Raw -Encoding utf8 | ConvertFrom-Json
}

function Get-DpsDefaultCodexHome {
    if ($env:CODEX_HOME) {
        return [System.IO.Path]::GetFullPath($env:CODEX_HOME)
    }

    $userProfile = [Environment]::GetFolderPath('UserProfile')
    return Join-Path $userProfile '.codex'
}

function Get-DpsDefaultGitHubConfigDir {
    if ($env:GH_CONFIG_DIR) {
        return [System.IO.Path]::GetFullPath($env:GH_CONFIG_DIR)
    }

    return Join-Path $env:APPDATA 'GitHub CLI'
}

function New-DpsAccount {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$DisplayName,
        [string]$Id,
        [string]$GitName = '',
        [string]$GitEmail = '',
        [switch]$UseCurrent
    )

    $home = Initialize-DpsStore
    if (-not $Id) {
        $Id = ConvertTo-DpsId $DisplayName
    } else {
        $Id = ConvertTo-DpsId $Id
    }

    $accountDirectory = Join-Path $home "accounts\$Id"
    $profilePath = Join-Path $accountDirectory 'account.json'
    if (Test-Path -LiteralPath $profilePath) {
        throw "이미 존재하는 계정 묶음입니다: $Id"
    }

    [System.IO.Directory]::CreateDirectory($accountDirectory) | Out-Null
    $mode = if ($UseCurrent) { 'current' } else { 'isolated' }

    if ($UseCurrent) {
        $codexHome = Get-DpsDefaultCodexHome
        $githubConfigDir = Get-DpsDefaultGitHubConfigDir
        $vercelConfigDir = ''
        $browserDataDir = ''
    } else {
        $codexHome = Join-Path $accountDirectory 'codex'
        $githubConfigDir = Join-Path $accountDirectory 'github'
        $vercelConfigDir = Join-Path $accountDirectory 'vercel'
        $browserDataDir = Join-Path $accountDirectory 'browser'

        foreach ($path in @($codexHome, $githubConfigDir, $vercelConfigDir, $browserDataDir)) {
            [System.IO.Directory]::CreateDirectory($path) | Out-Null
        }
    }

    $now = Get-DpsIsoTimestamp
    $account = [ordered]@{
        schemaVersion = 1
        id = $Id
        displayName = $DisplayName.Trim()
        mode = $mode
        gitName = $GitName.Trim()
        gitEmail = $GitEmail.Trim()
        codexHome = $codexHome
        githubConfigDir = $githubConfigDir
        vercelConfigDir = $vercelConfigDir
        browserDataDir = $browserDataDir
        createdAt = $now
        updatedAt = $now
    }

    Write-DpsJson -Path $profilePath -Value $account
    Write-DpsAuditLog -Action 'account.create' -AccountId $Id
    return [pscustomobject]$account
}

function Get-DpsAccounts {
    $home = Initialize-DpsStore
    $accounts = foreach ($file in Get-ChildItem -LiteralPath (Join-Path $home 'accounts') -Filter 'account.json' -File -Recurse -ErrorAction SilentlyContinue) {
        Read-DpsJson -Path $file.FullName
    }

    return @($accounts | Sort-Object displayName)
}

function Get-DpsAccount {
    param([Parameter(Mandatory)][string]$Id)
    $home = Initialize-DpsStore
    $path = Join-Path $home "accounts\$Id\account.json"
    if (-not (Test-Path -LiteralPath $path)) {
        throw "계정 묶음을 찾을 수 없습니다: $Id"
    }

    return Read-DpsJson -Path $path
}

function Set-DpsAccountIdentity {
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$GitName,
        [Parameter(Mandatory)][string]$GitEmail
    )

    $account = Get-DpsAccount -Id $Id
    $account.gitName = $GitName.Trim()
    $account.gitEmail = $GitEmail.Trim()
    $account.updatedAt = Get-DpsIsoTimestamp
    $home = Initialize-DpsStore
    Write-DpsJson -Path (Join-Path $home "accounts\$Id\account.json") -Value $account
    Write-DpsAuditLog -Action 'account.identity.update' -AccountId $Id
    return $account
}

function Invoke-DpsProcess {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory = '',
        [hashtable]$Environment = @{},
        [int]$TimeoutMilliseconds = 8000
    )

    $resolvedFilePath = $FilePath
    if (-not [System.IO.Path]::IsPathRooted($resolvedFilePath)) {
        $command = Get-Command $resolvedFilePath -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($command -and $command.Source) { $resolvedFilePath = $command.Source }
    }

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $resolvedFilePath
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true
    if ($WorkingDirectory) {
        $startInfo.WorkingDirectory = $WorkingDirectory
    }

    foreach ($argument in $Arguments) {
        $startInfo.ArgumentList.Add([string]$argument)
    }
    foreach ($entry in $Environment.GetEnumerator()) {
        $startInfo.Environment[$entry.Key] = [string]$entry.Value
    }

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $started = $process.Start()
    if (-not $started) {
        throw "프로세스를 실행하지 못했습니다: $FilePath"
    }

    $standardOutput = $process.StandardOutput.ReadToEndAsync()
    $standardError = $process.StandardError.ReadToEndAsync()
    $completed = $process.WaitForExit($TimeoutMilliseconds)
    if (-not $completed) {
        try { $process.Kill($true) } catch { }
        $process.WaitForExit()
    }

    return [pscustomobject]@{
        ExitCode = if ($completed) { $process.ExitCode } else { -1 }
        TimedOut = -not $completed
        Output = $standardOutput.GetAwaiter().GetResult().Trim()
        Error = $standardError.GetAwaiter().GetResult().Trim()
    }
}

function Invoke-DpsGit {
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string[]]$Arguments
    )

    return Invoke-DpsProcess -FilePath 'git.exe' -Arguments (@('-C', $Workspace) + $Arguments) -WorkingDirectory $Workspace -TimeoutMilliseconds 6000
}

function Get-DpsGitRemoteInfo {
    param([string]$RemoteUrl)

    $owner = ''
    $repository = ''
    if ($RemoteUrl -match 'github\.com[/:](?<owner>[^/]+)/(?<repo>[^/]+?)(?:\.git)?$') {
        $owner = $Matches.owner
        $repository = $Matches.repo -replace '\.git$', ''
    }

    return [pscustomobject]@{
        owner = $owner
        repository = $repository
    }
}

function Get-DpsEnvironmentMetadata {
    param([Parameter(Mandatory)][string]$Workspace)

    $files = @()
    $keys = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($file in Get-ChildItem -LiteralPath $Workspace -Force -File -Filter '.env*' -ErrorAction SilentlyContinue) {
        $files += $file.Name
        foreach ($line in Get-Content -LiteralPath $file.FullName -ErrorAction SilentlyContinue) {
            if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') {
                [void]$keys.Add($Matches[1])
            }
        }
    }

    $providers = [System.Collections.Generic.List[string]]::new()
    $allKeys = @($keys)
    if ($allKeys -match '^TURSO_') { $providers.Add('Turso') }
    if ($allKeys -match '^SUPABASE_|^NEXT_PUBLIC_SUPABASE_') { $providers.Add('Supabase') }
    if ($allKeys -match '^DATABASE_URL$|^POSTGRES_') { $providers.Add('PostgreSQL') }
    if ($allKeys -match '^FIREBASE_|^NEXT_PUBLIC_FIREBASE_') { $providers.Add('Firebase') }
    if ($allKeys -match '^MONGODB_') { $providers.Add('MongoDB') }

    return [pscustomobject]@{
        files = @($files | Sort-Object -Unique)
        keys = @($allKeys | Sort-Object -Unique)
        databaseProviders = @($providers | Sort-Object -Unique)
    }
}

function Get-DpsProjectMetadata {
    param([Parameter(Mandatory)][string]$Workspace)

    $resolvedWorkspace = [System.IO.Path]::GetFullPath($Workspace)
    if (-not (Test-Path -LiteralPath $resolvedWorkspace -PathType Container)) {
        throw "프로젝트 폴더를 찾을 수 없습니다: $resolvedWorkspace"
    }

    $insideGit = Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('rev-parse', '--is-inside-work-tree')
    $isGit = $insideGit.ExitCode -eq 0 -and $insideGit.Output -eq 'true'
    $remoteUrl = ''
    $localGitName = ''
    $localGitEmail = ''
    $effectiveGitName = ''
    $effectiveGitEmail = ''
    if ($isGit) {
        $remoteUrl = (Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('remote', 'get-url', 'origin')).Output
        $localGitName = (Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('config', '--local', '--get', 'user.name')).Output
        $localGitEmail = (Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('config', '--local', '--get', 'user.email')).Output
        $effectiveGitName = (Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('config', '--get', 'user.name')).Output
        $effectiveGitEmail = (Invoke-DpsGit -Workspace $resolvedWorkspace -Arguments @('config', '--get', 'user.email')).Output
    }
    $remoteInfo = Get-DpsGitRemoteInfo -RemoteUrl $remoteUrl

    $vercel = [ordered]@{
        linked = $false
        projectId = ''
        orgId = ''
    }
    $vercelProjectPath = Join-Path $resolvedWorkspace '.vercel\project.json'
    if (Test-Path -LiteralPath $vercelProjectPath) {
        try {
            $vercelProject = Read-DpsJson -Path $vercelProjectPath
            $vercel.linked = $true
            $vercel.projectId = [string]$vercelProject.projectId
            $vercel.orgId = [string]$vercelProject.orgId
        } catch { }
    }

    return [pscustomobject]@{
        workspace = $resolvedWorkspace
        git = [pscustomobject]@{
            isRepository = $isGit
            remoteUrl = $remoteUrl
            owner = $remoteInfo.owner
            repository = $remoteInfo.repository
            localName = $localGitName
            localEmail = $localGitEmail
            effectiveName = $effectiveGitName
            effectiveEmail = $effectiveGitEmail
        }
        vercel = [pscustomobject]$vercel
        environment = Get-DpsEnvironmentMetadata -Workspace $resolvedWorkspace
    }
}

function Save-DpsProject {
    param([Parameter(Mandatory)]$Project)
    $home = Initialize-DpsStore
    Write-DpsJson -Path (Join-Path $home "projects\$($Project.id).json") -Value $Project
}

function Import-DpsProject {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$DisplayName,
        [Parameter(Mandatory)][string]$AccountId,
        [string]$Id
    )

    $account = Get-DpsAccount -Id $AccountId
    $metadata = Get-DpsProjectMetadata -Workspace $Workspace
    if (-not $Id) { $Id = ConvertTo-DpsId $DisplayName } else { $Id = ConvertTo-DpsId $Id }

    $home = Initialize-DpsStore
    $projectPath = Join-Path $home "projects\$Id.json"
    if (Test-Path -LiteralPath $projectPath) {
        throw "이미 등록된 프로젝트입니다: $Id"
    }

    $now = Get-DpsIsoTimestamp
    $project = [ordered]@{
        schemaVersion = 1
        id = $Id
        displayName = $DisplayName.Trim()
        workspace = $metadata.workspace
        source = 'existing'
        accountId = $account.id
        git = $metadata.git
        vercel = $metadata.vercel
        environment = $metadata.environment
        createdAt = $now
        updatedAt = $now
    }

    Save-DpsProject -Project $project
    Write-DpsAuditLog -Action 'project.import' -ProjectId $Id -AccountId $account.id
    return [pscustomobject]$project
}

function New-DpsProject {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Workspace,
        [Parameter(Mandatory)][string]$DisplayName,
        [Parameter(Mandatory)][string]$AccountId,
        [string]$Id
    )

    $resolvedWorkspace = [System.IO.Path]::GetFullPath($Workspace)
    [System.IO.Directory]::CreateDirectory($resolvedWorkspace) | Out-Null
    $project = Import-DpsProject -Workspace $resolvedWorkspace -DisplayName $DisplayName -AccountId $AccountId -Id $Id
    $project.source = 'new'
    $project.updatedAt = Get-DpsIsoTimestamp
    Save-DpsProject -Project $project
    Write-DpsAuditLog -Action 'project.new' -ProjectId $project.id -AccountId $AccountId
    return $project
}

function Get-DpsProjects {
    $home = Initialize-DpsStore
    $projects = foreach ($file in Get-ChildItem -LiteralPath (Join-Path $home 'projects') -Filter '*.json' -File -ErrorAction SilentlyContinue) {
        Read-DpsJson -Path $file.FullName
    }
    return @($projects | Sort-Object displayName)
}

function Get-DpsProject {
    param([Parameter(Mandatory)][string]$Id)
    $home = Initialize-DpsStore
    $normalizedId = ConvertTo-DpsId $Id
    $path = Join-Path $home "projects\$normalizedId.json"
    if (-not (Test-Path -LiteralPath $path)) {
        throw "프로젝트를 찾을 수 없습니다: $Id"
    }
    return Read-DpsJson -Path $path
}

function Remove-DpsProject {
    param([Parameter(Mandatory)][string]$Id)
    $home = Initialize-DpsStore
    $project = Get-DpsProject -Id $Id
    Remove-Item -LiteralPath (Join-Path $home "projects\$($project.id).json") -Force
    Write-DpsAuditLog -Action 'project.remove' -ProjectId $project.id -AccountId $project.accountId
}

function Set-DpsProjectAccount {
    param(
        [Parameter(Mandatory)][string]$ProjectId,
        [Parameter(Mandatory)][string]$AccountId
    )

    $project = Get-DpsProject -Id $ProjectId
    $account = Get-DpsAccount -Id $AccountId
    $project.accountId = $account.id
    $project.updatedAt = Get-DpsIsoTimestamp
    Save-DpsProject -Project $project
    Write-DpsAuditLog -Action 'project.account.change' -ProjectId $project.id -AccountId $account.id
    return $project
}

function Get-DpsBrowserExecutable {
    $candidates = @(
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe')
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
    }
    return ''
}

function New-DpsBrowserLauncher {
    param([Parameter(Mandatory)]$Account)

    if ($Account.mode -eq 'current') { return '' }
    $browserExecutable = Get-DpsBrowserExecutable
    if (-not $browserExecutable) { return '' }

    $home = Initialize-DpsStore
    $launcher = Join-Path $home "accounts\$($Account.id)\browser.cmd"
    $content = @(
        '@echo off',
        ('start "" "{0}" --user-data-dir="{1}" "%~1"' -f $browserExecutable, $Account.browserDataDir)
    )
    Set-Content -LiteralPath $launcher -Value $content -Encoding ascii
    return $launcher
}

function Open-DpsAccountBrowser {
    param(
        [Parameter(Mandatory)][string]$AccountId,
        [string[]]$Urls = @('https://accounts.google.com/', 'https://github.com/', 'https://vercel.com/', 'https://chatgpt.com/')
    )

    $account = Get-DpsAccount -Id $AccountId
    $browserExecutable = Get-DpsBrowserExecutable
    foreach ($url in $Urls) {
        if ($account.mode -eq 'isolated' -and $browserExecutable) {
            Start-Process -FilePath $browserExecutable -ArgumentList @("--user-data-dir=$($account.browserDataDir)", $url) | Out-Null
        } else {
            Start-Process $url | Out-Null
        }
    }
    Write-DpsAuditLog -Action 'account.browser.open' -AccountId $AccountId
}

function Get-DpsLaunchScript {
    param(
        [Parameter(Mandatory)]$Project,
        [Parameter(Mandatory)]$Account,
        [switch]$NoCodex
    )

    $home = Initialize-DpsStore
    $runtimeDirectory = Join-Path $home "runtime\$($Project.id)"
    [System.IO.Directory]::CreateDirectory($runtimeDirectory) | Out-Null
    $scriptPath = Join-Path $runtimeDirectory 'launch.ps1'

    $workspaceLiteral = ConvertTo-DpsPowerShellLiteral $Project.workspace
    $projectIdLiteral = ConvertTo-DpsPowerShellLiteral $Project.id
    $projectNameLiteral = ConvertTo-DpsPowerShellLiteral $Project.displayName
    $accountIdLiteral = ConvertTo-DpsPowerShellLiteral $Account.id
    $accountNameLiteral = ConvertTo-DpsPowerShellLiteral $Account.displayName
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("`$ErrorActionPreference = 'Continue'")
    $lines.Add("`$env:DEV_PROFILE_PROJECT = $projectIdLiteral")
    $lines.Add("`$env:DEV_PROFILE_ACCOUNT = $accountIdLiteral")

    if ($Account.mode -eq 'isolated') {
        $lines.Add("`$env:CODEX_HOME = $(ConvertTo-DpsPowerShellLiteral $Account.codexHome)")
        $lines.Add("`$env:GH_CONFIG_DIR = $(ConvertTo-DpsPowerShellLiteral $Account.githubConfigDir)")
        $lines.Add("`$env:DEV_PROFILE_VERCEL_CONFIG = $(ConvertTo-DpsPowerShellLiteral $Account.vercelConfigDir)")
        $browserLauncher = New-DpsBrowserLauncher -Account $Account
        if ($browserLauncher) {
            $lines.Add("`$env:BROWSER = $(ConvertTo-DpsPowerShellLiteral $browserLauncher)")
        }
        $lines.Add('function global:vercel {')
        $lines.Add('    $vercelArgs = @($args) + @(''--global-config'', $env:DEV_PROFILE_VERCEL_CONFIG)')
        $lines.Add('    & npx.cmd vercel @vercelArgs')
        $lines.Add('}')
    }

    foreach ($environmentKey in @($Project.environment.keys)) {
        if ($environmentKey -match '^[A-Za-z_][A-Za-z0-9_]*$') {
            $lines.Add("Remove-Item -LiteralPath $(ConvertTo-DpsPowerShellLiteral "Env:$environmentKey") -ErrorAction SilentlyContinue")
        }
    }

    $lines.Add("Set-Location -LiteralPath $workspaceLiteral")
    if ($Account.gitName) {
        $lines.Add("& git.exe config --local user.name $(ConvertTo-DpsPowerShellLiteral $Account.gitName)")
    }
    if ($Account.gitEmail) {
        $lines.Add("& git.exe config --local user.email $(ConvertTo-DpsPowerShellLiteral $Account.gitEmail)")
    }
    if ($Account.mode -eq 'isolated' -and $Project.git.remoteUrl -match 'github\.com') {
        $lines.Add("& git.exe config --local credential.https://github.com.helper ''")
        $lines.Add("& git.exe config --local --add credential.https://github.com.helper '!gh auth git-credential'")
        $lines.Add("& git.exe config --local credential.https://github.com.useHttpPath true")
    }

    $lines.Add("`$Host.UI.RawUI.WindowTitle = 'DEV - ' + $projectNameLiteral")
    $lines.Add("Write-Host ''")
    $lines.Add("Write-Host ('프로젝트: ' + $projectNameLiteral) -ForegroundColor Cyan")
    $lines.Add("Write-Host ('계정 묶음: ' + $accountNameLiteral) -ForegroundColor Cyan")
    $lines.Add("Write-Host ('경로: ' + $workspaceLiteral)")
    $lines.Add("Write-Host '현재 창에만 계정 설정이 적용되었습니다.' -ForegroundColor DarkGray")
    $lines.Add("Write-Host ''")

    if (-not $NoCodex) {
        $lines.Add("if (Get-Command codex -ErrorAction SilentlyContinue) { & codex } else { Write-Warning 'Codex CLI를 찾을 수 없습니다.' }")
    }

    Set-Content -LiteralPath $scriptPath -Value $lines -Encoding utf8
    return $scriptPath
}

function Start-DpsProject {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$ProjectId,
        [switch]$NoCodex,
        [switch]$Wait
    )

    $project = Get-DpsProject -Id $ProjectId
    $account = Get-DpsAccount -Id $project.accountId
    if (-not (Test-Path -LiteralPath $project.workspace -PathType Container)) {
        throw "프로젝트 폴더를 찾을 수 없습니다: $($project.workspace)"
    }

    $launchScript = Get-DpsLaunchScript -Project $project -Account $account -NoCodex:$NoCodex
    $arguments = @('-NoLogo', '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $launchScript)
    $process = Start-Process -FilePath 'pwsh.exe' -ArgumentList $arguments -WorkingDirectory $project.workspace -PassThru
    Write-DpsAuditLog -Action 'project.start' -ProjectId $project.id -AccountId $account.id
    if ($Wait) { $process.WaitForExit() }
    return $process
}

function Start-DpsAccountLogin {
    param(
        [Parameter(Mandatory)][string]$AccountId,
        [ValidateSet('all', 'github', 'vercel', 'codex')][string]$Service = 'all'
    )

    $account = Get-DpsAccount -Id $AccountId
    if ($account.mode -eq 'current') {
        throw '현재 PC 계정 묶음은 기존 전역 로그인을 그대로 사용합니다. 별도 로그인이 필요하면 새 계정 묶음을 만드세요.'
    }

    $home = Initialize-DpsStore
    $runtimeDirectory = Join-Path $home "runtime\account-$($account.id)"
    [System.IO.Directory]::CreateDirectory($runtimeDirectory) | Out-Null
    $scriptPath = Join-Path $runtimeDirectory 'login.ps1'
    $browserLauncher = New-DpsBrowserLauncher -Account $account
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("`$Host.UI.RawUI.WindowTitle = '계정 연결 - $($account.displayName -replace "'", "''")'")
    $lines.Add("`$env:CODEX_HOME = $(ConvertTo-DpsPowerShellLiteral $account.codexHome)")
    $lines.Add("`$env:GH_CONFIG_DIR = $(ConvertTo-DpsPowerShellLiteral $account.githubConfigDir)")
    if ($browserLauncher) { $lines.Add("`$env:BROWSER = $(ConvertTo-DpsPowerShellLiteral $browserLauncher)") }
    $lines.Add("Write-Host '계정 묶음: $($account.displayName -replace "'", "''")' -ForegroundColor Cyan")
    $lines.Add("Write-Host '비밀번호와 인증번호는 이 프로그램에 저장되지 않습니다.' -ForegroundColor DarkGray")

    if ($Service -in @('all', 'github')) {
        $lines.Add("Write-Host ''; Write-Host '[1] GitHub 연결' -ForegroundColor Yellow")
        $lines.Add("if (Get-Command gh -ErrorAction SilentlyContinue) { & gh auth login } else { Write-Warning 'GitHub CLI가 없습니다.' }")
    }
    if ($Service -in @('all', 'vercel')) {
        $lines.Add("Write-Host ''; Write-Host '[2] Vercel 연결' -ForegroundColor Yellow")
        $lines.Add("if (Get-Command npx.cmd -ErrorAction SilentlyContinue) { & npx.cmd vercel login --global-config $(ConvertTo-DpsPowerShellLiteral $account.vercelConfigDir) } else { Write-Warning 'Vercel CLI를 실행할 npx가 없습니다.' }")
    }
    if ($Service -in @('all', 'codex')) {
        $lines.Add("Write-Host ''; Write-Host '[3] Codex/OpenAI 연결' -ForegroundColor Yellow")
        $lines.Add("if (Get-Command codex -ErrorAction SilentlyContinue) { & codex login } else { Write-Warning 'Codex CLI가 없습니다.' }")
    }
    $lines.Add("Write-Host ''; Write-Host '계정 연결 창을 닫아도 됩니다.' -ForegroundColor Green")
    $lines.Add('Read-Host ''Enter를 누르면 종료합니다''')
    Set-Content -LiteralPath $scriptPath -Value $lines -Encoding utf8

    Start-Process -FilePath 'pwsh.exe' -ArgumentList @('-NoLogo', '-ExecutionPolicy', 'Bypass', '-File', $scriptPath) | Out-Null
    Write-DpsAuditLog -Action 'account.login.start' -AccountId $account.id -Message $Service
}

function Test-DpsVercelCredentials {
    param([Parameter(Mandatory)]$Account)

    try {
        $npmRootResult = Invoke-DpsProcess -FilePath 'npm.cmd' -Arguments @('root', '-g') -TimeoutMilliseconds 4000
        if ($npmRootResult.ExitCode -ne 0 -or -not $npmRootResult.Output) { return $false }

        $authModule = Join-Path $npmRootResult.Output 'vercel\node_modules\@vercel\cli-auth\credentials-store.js'
        $configModule = Join-Path $npmRootResult.Output 'vercel\node_modules\@vercel\cli-config\dist\cli-config.js'
        if (-not (Test-Path -LiteralPath $authModule) -or -not (Test-Path -LiteralPath $configModule)) { return $false }

        $nodeScript = @'
const auth = require(process.argv[1]);
const config = require(process.argv[2]);
const requested = process.argv[3] || '';
const directory = requested || config.getGlobalPathConfig();
try {
  const credentials = auth.readCliAuthConfig(directory);
  process.stdout.write(credentials && credentials.token ? 'connected' : 'missing');
} catch (_) {
  process.stdout.write('missing');
}
'@
        $requestedDirectory = if ($Account.mode -eq 'isolated') { [string]$Account.vercelConfigDir } else { '' }
        $probe = Invoke-DpsProcess -FilePath 'node.exe' -Arguments @('-e', $nodeScript, $authModule, $configModule, $requestedDirectory) -TimeoutMilliseconds 4000
        return $probe.ExitCode -eq 0 -and $probe.Output -eq 'connected'
    } catch {
        return $false
    }
}

function Get-DpsProjectStatus {
    param([Parameter(Mandatory)][string]$ProjectId)

    $project = Get-DpsProject -Id $ProjectId
    $account = Get-DpsAccount -Id $project.accountId
    $metadata = Get-DpsProjectMetadata -Workspace $project.workspace
    $checks = [System.Collections.Generic.List[object]]::new()

    $checks.Add([pscustomobject]@{
        Name = '프로젝트 폴더'
        Status = if (Test-Path -LiteralPath $project.workspace) { '정상' } else { '오류' }
        Detail = $project.workspace
    })
    $checks.Add([pscustomobject]@{
        Name = 'GitHub 저장소'
        Status = if ($metadata.git.remoteUrl) { '정상' } else { '확인 필요' }
        Detail = if ($metadata.git.remoteUrl) { $metadata.git.remoteUrl } else { '원격 저장소 없음' }
    })
    $identityMatches = $true
    if ($account.gitEmail) { $identityMatches = $metadata.git.effectiveEmail -eq $account.gitEmail }
    $checks.Add([pscustomobject]@{
        Name = 'Git 작성자'
        Status = if (-not $account.gitEmail) { '설정 필요' } elseif ($identityMatches) { '정상' } else { '전환 시 적용' }
        Detail = if ($account.gitEmail) { "$($account.gitName) <$($account.gitEmail)>" } else { '계정 묶음에서 이름과 이메일을 설정하세요.' }
    })

    $codexAuth = Join-Path $account.codexHome 'auth.json'
    $checks.Add([pscustomobject]@{
        Name = 'Codex/OpenAI'
        Status = if (Test-Path -LiteralPath $codexAuth) { '연결됨' } else { '로그인 필요' }
        Detail = $account.codexHome
    })

    $githubHosts = Join-Path $account.githubConfigDir 'hosts.yml'
    $checks.Add([pscustomobject]@{
        Name = 'GitHub CLI'
        Status = if (Test-Path -LiteralPath $githubHosts) { '연결됨' } else { '로그인 필요' }
        Detail = $account.githubConfigDir
    })

    $vercelConnected = Test-DpsVercelCredentials -Account $account
    $vercelDetail = if ($vercelConnected) { 'Windows 자격 증명에 안전하게 저장됨' } else { '로그인 필요' }
    $checks.Add([pscustomobject]@{
        Name = 'Vercel CLI'
        Status = if ($vercelConnected) { '연결됨' } else { '로그인 필요' }
        Detail = $vercelDetail
    })

    $dbProviders = @($metadata.environment.databaseProviders)
    $checks.Add([pscustomobject]@{
        Name = 'Database'
        Status = if ($dbProviders.Count -gt 0) { '연결정보 있음' } else { '확인 필요' }
        Detail = if ($dbProviders.Count -gt 0) { $dbProviders -join ', ' } else { '지원 DB 환경변수를 찾지 못했습니다.' }
    })

    Write-DpsAuditLog -Action 'project.status' -ProjectId $project.id -AccountId $account.id
    return @($checks)
}

function Initialize-DpsCurrentAccount {
    $existing = Get-DpsAccounts | Where-Object id -eq 'current' | Select-Object -First 1
    if ($existing) {
        $expectedCodexHome = Get-DpsDefaultCodexHome
        $expectedGitHubConfig = Get-DpsDefaultGitHubConfigDir
        if ($existing.codexHome -ne $expectedCodexHome -or $existing.githubConfigDir -ne $expectedGitHubConfig) {
            $existing.codexHome = $expectedCodexHome
            $existing.githubConfigDir = $expectedGitHubConfig
            $existing.updatedAt = Get-DpsIsoTimestamp
            $storeRoot = Initialize-DpsStore
            Write-DpsJson -Path (Join-Path $storeRoot 'accounts\current\account.json') -Value $existing
            Write-DpsAuditLog -Action 'account.current.migrate' -AccountId 'current'
        }
        return $existing
    }

    $gitName = ''
    $gitEmail = ''
    try {
        $gitName = (Invoke-DpsProcess -FilePath 'git.exe' -Arguments @('config', '--global', '--get', 'user.name')).Output
        $gitEmail = (Invoke-DpsProcess -FilePath 'git.exe' -Arguments @('config', '--global', '--get', 'user.email')).Output
    } catch { }

    return New-DpsAccount -DisplayName '현재 PC 개발계정' -Id 'current' -GitName $gitName -GitEmail $gitEmail -UseCurrent
}

Export-ModuleMember -Function @(
    'Get-DpsHome',
    'Initialize-DpsStore',
    'Initialize-DpsCurrentAccount',
    'New-DpsAccount',
    'Get-DpsAccounts',
    'Get-DpsAccount',
    'Set-DpsAccountIdentity',
    'Get-DpsProjectMetadata',
    'Import-DpsProject',
    'New-DpsProject',
    'Get-DpsProjects',
    'Get-DpsProject',
    'Remove-DpsProject',
    'Set-DpsProjectAccount',
    'Start-DpsProject',
    'Start-DpsAccountLogin',
    'Open-DpsAccountBrowser',
    'Get-DpsProjectStatus',
    'Get-DpsLaunchScript'
)
