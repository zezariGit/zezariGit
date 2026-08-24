Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('dev-profile-switcher-' + [guid]::NewGuid().ToString('N'))
$storeRoot = Join-Path $testRoot 'store'
$workspace = Join-Path $testRoot 'workspace'
$env:DEV_PROFILE_SWITCHER_HOME = $storeRoot

try {
    [System.IO.Directory]::CreateDirectory($workspace) | Out-Null
    Set-Content -LiteralPath (Join-Path $workspace '.env.local') -Value @(
        'TURSO_DATABASE_URL=masked-for-test',
        'TURSO_AUTH_TOKEN=masked-for-test'
    ) -Encoding utf8

    & git.exe -C $workspace init | Out-Null
    & git.exe -C $workspace remote add origin 'https://github.com/example/stock.git'

    Import-Module (Join-Path $PSScriptRoot 'DevProfileSwitcher.psm1') -Force
    Initialize-DpsStore | Out-Null
    $current = New-DpsAccount -DisplayName 'Current Test' -Id 'current-test' -UseCurrent
    $isolated = New-DpsAccount -DisplayName 'Personal Test' -Id 'personal' -GitName 'tester' -GitEmail 'tester@example.com'
    $project = Import-DpsProject -Workspace $workspace -DisplayName 'Stock Test' -Id 'stock' -AccountId $isolated.id

    if ($project.git.owner -ne 'example') { throw 'GitHub owner detection failed.' }
    if ($project.git.repository -ne 'stock') { throw 'GitHub repository detection failed.' }
    if (@($project.environment.databaseProviders) -notcontains 'Turso') { throw 'Turso detection failed.' }
    if ((Get-DpsProject -Id 'stock').accountId -ne 'personal') { throw 'Account assignment failed.' }
    $savedProjectJson = Get-Content -LiteralPath (Join-Path $storeRoot 'projects\stock.json') -Raw
    if ($savedProjectJson -match 'masked-for-test') { throw 'Environment secret value leaked into the profile.' }

    $launchScript = Get-DpsLaunchScript -Project (Get-DpsProject -Id 'stock') -Account (Get-DpsAccount -Id 'personal') -NoCodex
    $launchContents = Get-Content -LiteralPath $launchScript -Raw
    if ($launchContents -notmatch 'CODEX_HOME') { throw 'Codex profile injection failed.' }
    if ($launchContents -notmatch 'GH_CONFIG_DIR') { throw 'GitHub profile injection failed.' }
    if ($launchContents -notmatch 'DEV_PROFILE_VERCEL_CONFIG') { throw 'Vercel profile injection failed.' }
    if ($launchContents -notmatch 'GIT_CONFIG_GLOBAL') { throw 'Git global identity isolation failed.' }
    if ($launchContents -notmatch 'DEV_PROFILE_VERCEL_CONNECTED') { throw 'Vercel child-process isolation failed.' }
    if ($launchContents -notmatch 'dev-profile-login-required') { throw 'Vercel fallback protection failed.' }
    if ($launchContents -notmatch 'gh auth git-credential') { throw 'GitHub credential isolation failed.' }
    if ($launchContents -notmatch '--unset-all credential\.https://github\.com\.helper') { throw 'GitHub credential cleanup failed.' }
    if ($launchContents -notmatch 'Env:TURSO_AUTH_TOKEN') { throw 'Parent environment sanitization failed.' }
    if ($launchContents -notmatch "TERM -eq 'dumb'") { throw 'Interactive terminal normalization failed.' }

    $isolatedGitConfig = Join-Path $storeRoot 'accounts\personal\gitconfig'
    if (-not (Test-Path -LiteralPath $isolatedGitConfig)) { throw 'Isolated Git config was not created.' }
    if ((& git.exe config --file $isolatedGitConfig --get user.name) -ne 'tester') { throw 'Isolated Git name was not saved.' }
    if ((& git.exe config --file $isolatedGitConfig --get user.email) -ne 'tester@example.com') { throw 'Isolated Git email was not saved.' }

    $project = Set-DpsProjectAccount -ProjectId 'stock' -AccountId $current.id
    if ($project.accountId -ne 'current-test') { throw 'Account switching failed.' }

    $newWorkspace = Join-Path $testRoot 'new-project'
    $newProject = New-DpsProject -Workspace $newWorkspace -DisplayName 'New Project' -Id 'new-project' -AccountId $isolated.id
    if (-not (Test-Path -LiteralPath $newWorkspace -PathType Container)) { throw 'New project folder creation failed.' }
    if ($newProject.source -ne 'new') { throw 'New project source type failed.' }

    Write-Host 'PASS: profile store, import, new project, secret filtering, launch isolation, and switching' -ForegroundColor Green
} finally {
    Remove-Item Env:DEV_PROFILE_SWITCHER_HOME -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $testRoot) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
