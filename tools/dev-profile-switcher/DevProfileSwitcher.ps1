[CmdletBinding()]
param(
    [Parameter(Position = 0)][string]$Command = 'gui',
    [Parameter(Position = 1)][string]$Name = '',
    [Parameter(Position = 2)][string]$Path = '',
    [string]$Account = 'current',
    [string]$GitName = '',
    [string]$GitEmail = '',
    [switch]$NoCodex
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'DevProfileSwitcher.psm1') -Force

function Write-Usage {
    @'
개발환경 전환기

가장 쉬운 사용법
  dev                 GUI 열기
  dev stock           STOCK 계정으로 Codex 실행
  dev zezari          ZEZARI 계정으로 Codex 실행

프로젝트 등록
  dev import stock C:\project\stock -Account personal
  dev new sample C:\project\sample -Account personal

계정 관리
  dev accounts
  dev account-add personal -GitName myname -GitEmail me@example.com
  dev login personal all

확인
  dev list
  dev status stock
'@ | Write-Host
}

Initialize-DpsStore | Out-Null
Initialize-DpsCurrentAccount | Out-Null

try {
    switch ($Command.ToLowerInvariant()) {
        'gui' {
            & (Join-Path $PSScriptRoot 'DevProfileSwitcher.Gui.ps1')
        }
        'help' { Write-Usage }
        '--help' { Write-Usage }
        '-h' { Write-Usage }
        'list' {
            Get-DpsProjects | Select-Object id, displayName, accountId, workspace | Format-Table -AutoSize
        }
        'accounts' {
            Get-DpsAccounts | Select-Object id, displayName, mode, gitName, gitEmail | Format-Table -AutoSize
        }
        'account-add' {
            if (-not $Name) { throw '계정 묶음 이름을 입력하세요.' }
            New-DpsAccount -DisplayName $Name -Id $Name -GitName $GitName -GitEmail $GitEmail | Format-List
            Write-Host "`n계정 연결: dev login $Name all" -ForegroundColor Cyan
        }
        'import' {
            if (-not $Name -or -not $Path) { throw '사용법: dev import 프로젝트명 프로젝트경로 -Account 계정묶음' }
            Import-DpsProject -DisplayName $Name -Id $Name -Workspace $Path -AccountId $Account | Format-List
            Write-Host "`n등록되었습니다. 실행: dev $Name" -ForegroundColor Green
        }
        'new' {
            if (-not $Name -or -not $Path) { throw '사용법: dev new 프로젝트명 프로젝트경로 -Account 계정묶음' }
            New-DpsProject -DisplayName $Name -Id $Name -Workspace $Path -AccountId $Account | Format-List
            Write-Host "`n생성되었습니다. 실행: dev $Name" -ForegroundColor Green
        }
        'login' {
            if (-not $Name) { throw '사용법: dev login 계정묶음 [all|github|vercel|codex]' }
            $service = if ($Path) { $Path } else { 'all' }
            Start-DpsAccountLogin -AccountId $Name -Service $service
            Write-Host '계정 연결 창을 열었습니다.' -ForegroundColor Green
        }
        'browser' {
            if (-not $Name) { throw '사용법: dev browser 계정묶음' }
            Open-DpsAccountBrowser -AccountId $Name
        }
        'status' {
            if (-not $Name) { throw '사용법: dev status 프로젝트명' }
            Get-DpsProjectStatus -ProjectId $Name | Format-Table -AutoSize -Wrap
        }
        'terminal' {
            if (-not $Name) { throw '사용법: dev terminal 프로젝트명' }
            Start-DpsProject -ProjectId $Name -NoCodex | Out-Null
        }
        default {
            Start-DpsProject -ProjectId $Command -NoCodex:$NoCodex | Out-Null
        }
    }
} catch {
    Write-Host "오류: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
