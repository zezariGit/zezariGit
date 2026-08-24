[CmdletBinding()]
param(
    [switch]$NoDesktopShortcut
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw 'PowerShell 7 이상에서 설치하세요.'
}

$codexCliLauncher = Join-Path $env:APPDATA 'npm\codex.cmd'
if (-not (Test-Path -LiteralPath $codexCliLauncher)) {
    Write-Host '독립 실행용 Codex CLI를 설치합니다...' -ForegroundColor Cyan
    & npm.cmd install -g '@openai/codex'
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $codexCliLauncher)) {
        throw 'Codex CLI 설치에 실패했습니다. npm 연결 상태를 확인하세요.'
    }
}

$installHome = Join-Path $env:LOCALAPPDATA 'DevProfileSwitcher'
$appDirectory = Join-Path $installHome 'app'
$windowsApps = Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps'
[System.IO.Directory]::CreateDirectory($appDirectory) | Out-Null

foreach ($fileName in @(
    'DevProfileSwitcher.psm1',
    'DevProfileSwitcher.ps1',
    'DevProfileSwitcher.Gui.ps1',
    'README.md'
)) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $fileName) -Destination (Join-Path $appDirectory $fileName) -Force
}

$commandPath = Join-Path $windowsApps 'dev.cmd'
$commandContent = @(
    '@echo off',
    ('pwsh.exe -NoLogo -ExecutionPolicy Bypass -File "{0}" %*' -f (Join-Path $appDirectory 'DevProfileSwitcher.ps1'))
)
Set-Content -LiteralPath $commandPath -Value $commandContent -Encoding ascii

$launcherSource = @'
using System;
using System.Diagnostics;
using System.IO;

public static class Program
{
    [STAThread]
    public static void Main()
    {
        string script = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DevProfileSwitcher.ps1");
        var startInfo = new ProcessStartInfo
        {
            FileName = "pwsh.exe",
            Arguments = "-NoLogo -WindowStyle Hidden -ExecutionPolicy Bypass -File \"" + script + "\" gui",
            UseShellExecute = false,
            CreateNoWindow = true
        };
        Process.Start(startInfo);
    }
}
'@

$exePath = Join-Path $appDirectory 'DevProfileSwitcher.exe'
try {
    if (Test-Path -LiteralPath $exePath) { Remove-Item -LiteralPath $exePath -Force }
    $compilerCandidates = @(
        'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe',
        'C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe'
    )
    $compiler = $compilerCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $compiler) { throw '.NET Framework C# 컴파일러를 찾을 수 없습니다.' }

    $launcherSourcePath = Join-Path $installHome 'DevProfileSwitcher.Launcher.cs'
    Set-Content -LiteralPath $launcherSourcePath -Value $launcherSource -Encoding utf8
    & $compiler /nologo /target:winexe "/out:$exePath" $launcherSourcePath
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $exePath)) {
        throw "C# 컴파일러 종료 코드: $LASTEXITCODE"
    }
    Remove-Item -LiteralPath $launcherSourcePath -Force -ErrorAction SilentlyContinue
} catch {
    Write-Warning "EXE 런처 생성에 실패했습니다. dev 명령은 정상 사용할 수 있습니다: $($_.Exception.Message)"
}

if (-not $NoDesktopShortcut) {
    $desktop = [Environment]::GetFolderPath('Desktop')
    $shortcutPath = Join-Path $desktop '개발환경 전환기.lnk'
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    if (Test-Path -LiteralPath $exePath) {
        $shortcut.TargetPath = $exePath
        $shortcut.WorkingDirectory = $appDirectory
    } else {
        $shortcut.TargetPath = (Get-Command pwsh.exe).Source
        $shortcut.Arguments = ('-NoLogo -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" gui' -f (Join-Path $appDirectory 'DevProfileSwitcher.ps1'))
        $shortcut.WorkingDirectory = $appDirectory
    }
    $shortcut.Description = '프로젝트별 GitHub, Vercel, DB, Codex 개발환경 전환'
    $shortcut.Save()
}

Import-Module (Join-Path $appDirectory 'DevProfileSwitcher.psm1') -Force
Initialize-DpsStore | Out-Null
$current = Initialize-DpsCurrentAccount

Write-Host ''
Write-Host '개발환경 전환기 설치 완료' -ForegroundColor Green
Write-Host "실행 명령: dev"
Write-Host "설치 위치: $appDirectory"
Write-Host "기본 계정: $($current.displayName)"
if (-not $NoDesktopShortcut) { Write-Host '바탕화면: 개발환경 전환기' }
