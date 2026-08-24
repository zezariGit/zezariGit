Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Get-Command Get-DpsProjects -ErrorAction SilentlyContinue)) {
    Import-Module (Join-Path $PSScriptRoot 'DevProfileSwitcher.psm1') -Force
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic

[System.Windows.Forms.Application]::EnableVisualStyles()

function Show-DpsMessage {
    param([string]$Message, [string]$Title = '개발환경 전환기', [System.Windows.Forms.MessageBoxIcon]$Icon = 'Information')
    [System.Windows.Forms.MessageBox]::Show($Message, $Title, 'OK', $Icon) | Out-Null
}

function Show-DpsAccountPicker {
    $picker = [System.Windows.Forms.Form]::new()
    $picker.Text = '개발 계정 선택'
    $picker.Size = [System.Drawing.Size]::new(520, 390)
    $picker.StartPosition = 'CenterParent'
    $picker.FormBorderStyle = 'FixedDialog'
    $picker.MaximizeBox = $false
    $picker.MinimizeBox = $false
    $picker.Font = [System.Drawing.Font]::new('Malgun Gothic', 10)

    $title = [System.Windows.Forms.Label]::new()
    $title.Text = '이 프로젝트에서 사용할 개발 계정을 선택하세요.'
    $title.Location = [System.Drawing.Point]::new(24, 22)
    $title.AutoSize = $true
    $title.Font = [System.Drawing.Font]::new('Malgun Gothic', 12, [System.Drawing.FontStyle]::Bold)
    $picker.Controls.Add($title)

    $hint = [System.Windows.Forms.Label]::new()
    $hint.Text = "기존 프로젝트는 '현재 PC 개발계정'을 선택하면 지금 설정을 그대로 사용합니다."
    $hint.Location = [System.Drawing.Point]::new(24, 56)
    $hint.Size = [System.Drawing.Size]::new(460, 45)
    $hint.ForeColor = [System.Drawing.Color]::DimGray
    $picker.Controls.Add($hint)

    $accountsList = [System.Windows.Forms.ListBox]::new()
    $accountsList.Location = [System.Drawing.Point]::new(24, 105)
    $accountsList.Size = [System.Drawing.Size]::new(460, 135)
    foreach ($account in Get-DpsAccounts) {
        $accountsList.Items.Add([pscustomobject]@{ Text = "$($account.displayName)  [$($account.mode)]"; Id = $account.id }) | Out-Null
    }
    $accountsList.DisplayMember = 'Text'
    if ($accountsList.Items.Count -gt 0) { $accountsList.SelectedIndex = 0 }
    $picker.Controls.Add($accountsList)

    $newButton = [System.Windows.Forms.Button]::new()
    $newButton.Text = '새 계정 묶음 만들기'
    $newButton.Location = [System.Drawing.Point]::new(24, 255)
    $newButton.Size = [System.Drawing.Size]::new(190, 42)
    $picker.Controls.Add($newButton)

    $selectButton = [System.Windows.Forms.Button]::new()
    $selectButton.Text = '선택'
    $selectButton.Location = [System.Drawing.Point]::new(294, 255)
    $selectButton.Size = [System.Drawing.Size]::new(90, 42)
    $selectButton.BackColor = [System.Drawing.Color]::FromArgb(20, 20, 20)
    $selectButton.ForeColor = [System.Drawing.Color]::White
    $picker.Controls.Add($selectButton)

    $cancelButton = [System.Windows.Forms.Button]::new()
    $cancelButton.Text = '취소'
    $cancelButton.Location = [System.Drawing.Point]::new(394, 255)
    $cancelButton.Size = [System.Drawing.Size]::new(90, 42)
    $picker.Controls.Add($cancelButton)

    $picker.Tag = $null
    $selectButton.Add_Click({
        if ($accountsList.SelectedItem) {
            $picker.Tag = $accountsList.SelectedItem.Id
            $picker.DialogResult = 'OK'
            $picker.Close()
        }
    })
    $cancelButton.Add_Click({ $picker.DialogResult = 'Cancel'; $picker.Close() })
    $newButton.Add_Click({
        $displayName = [Microsoft.VisualBasic.Interaction]::InputBox('새 계정 묶음 이름을 입력하세요.', '새 개발 계정', '개인 개발계정')
        if (-not $displayName.Trim()) { return }
        $gitName = [Microsoft.VisualBasic.Interaction]::InputBox('Git 커밋에 사용할 이름을 입력하세요. 나중에 입력해도 됩니다.', 'Git 이름', '')
        $gitEmail = [Microsoft.VisualBasic.Interaction]::InputBox('Git 커밋에 사용할 이메일을 입력하세요. 나중에 입력해도 됩니다.', 'Git 이메일', '')
        try {
            $account = New-DpsAccount -DisplayName $displayName -GitName $gitName -GitEmail $gitEmail
            $picker.Tag = $account.id
            $picker.DialogResult = 'OK'
            $picker.Close()
            $openSignup = [System.Windows.Forms.MessageBox]::Show(
                '새 계정 가입 또는 로그인을 위해 전용 브라우저를 열까요?',
                '새 개발 계정',
                'YesNo',
                'Question'
            )
            if ($openSignup -eq 'Yes') {
                Open-DpsAccountBrowser -AccountId $account.id -Urls @(
                    'https://accounts.google.com/signup',
                    'https://github.com/signup',
                    'https://vercel.com/signup',
                    'https://chatgpt.com/auth/login',
                    'https://app.turso.tech/'
                )
            }
        } catch {
            Show-DpsMessage $_.Exception.Message '새 개발 계정' 'Error'
        }
    })

    if ($picker.ShowDialog() -eq 'OK') { return [string]$picker.Tag }
    return ''
}

Initialize-DpsStore | Out-Null
Initialize-DpsCurrentAccount | Out-Null

$form = [System.Windows.Forms.Form]::new()
$form.Text = '개발환경 전환기'
$form.Size = [System.Drawing.Size]::new(920, 610)
$form.MinimumSize = [System.Drawing.Size]::new(820, 560)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [System.Drawing.Color]::FromArgb(245, 246, 248)
$form.Font = [System.Drawing.Font]::new('Malgun Gothic', 10)

$header = [System.Windows.Forms.Panel]::new()
$header.Dock = 'Top'
$header.Height = 84
$header.BackColor = [System.Drawing.Color]::FromArgb(15, 23, 42)
$form.Controls.Add($header)

$title = [System.Windows.Forms.Label]::new()
$title.Text = '개발환경 전환기'
$title.Location = [System.Drawing.Point]::new(26, 16)
$title.AutoSize = $true
$title.ForeColor = [System.Drawing.Color]::White
$title.Font = [System.Drawing.Font]::new('Malgun Gothic', 18, [System.Drawing.FontStyle]::Bold)
$header.Controls.Add($title)

$subtitle = [System.Windows.Forms.Label]::new()
$subtitle.Text = '프로젝트를 선택하면 해당 GitHub · Vercel · DB · Codex 환경으로 새 창을 엽니다.'
$subtitle.Location = [System.Drawing.Point]::new(29, 51)
$subtitle.AutoSize = $true
$subtitle.ForeColor = [System.Drawing.Color]::LightGray
$header.Controls.Add($subtitle)

$projectList = [System.Windows.Forms.ListBox]::new()
$projectList.Location = [System.Drawing.Point]::new(24, 108)
$projectList.Size = [System.Drawing.Size]::new(300, 360)
$projectList.Anchor = 'Top,Bottom,Left'
$projectList.DisplayMember = 'displayName'
$form.Controls.Add($projectList)

$detailsPanel = [System.Windows.Forms.Panel]::new()
$detailsPanel.Location = [System.Drawing.Point]::new(344, 108)
$detailsPanel.Size = [System.Drawing.Size]::new(540, 360)
$detailsPanel.Anchor = 'Top,Bottom,Left,Right'
$detailsPanel.BackColor = [System.Drawing.Color]::White
$detailsPanel.BorderStyle = 'FixedSingle'
$form.Controls.Add($detailsPanel)

$projectTitle = [System.Windows.Forms.Label]::new()
$projectTitle.Location = [System.Drawing.Point]::new(24, 20)
$projectTitle.AutoSize = $true
$projectTitle.Font = [System.Drawing.Font]::new('Malgun Gothic', 16, [System.Drawing.FontStyle]::Bold)
$detailsPanel.Controls.Add($projectTitle)

$projectDetails = [System.Windows.Forms.TextBox]::new()
$projectDetails.Location = [System.Drawing.Point]::new(24, 64)
$projectDetails.Size = [System.Drawing.Size]::new(488, 180)
$projectDetails.Anchor = 'Top,Left,Right'
$projectDetails.Multiline = $true
$projectDetails.ReadOnly = $true
$projectDetails.BorderStyle = 'None'
$projectDetails.BackColor = [System.Drawing.Color]::White
$projectDetails.Font = [System.Drawing.Font]::new('Malgun Gothic', 10)
$detailsPanel.Controls.Add($projectDetails)

$startButton = [System.Windows.Forms.Button]::new()
$startButton.Text = 'Codex로 개발 시작'
$startButton.Location = [System.Drawing.Point]::new(24, 275)
$startButton.Size = [System.Drawing.Size]::new(220, 48)
$startButton.Anchor = 'Bottom,Left'
$startButton.BackColor = [System.Drawing.Color]::FromArgb(20, 20, 20)
$startButton.ForeColor = [System.Drawing.Color]::White
$startButton.FlatStyle = 'Flat'
$detailsPanel.Controls.Add($startButton)

$terminalButton = [System.Windows.Forms.Button]::new()
$terminalButton.Text = '터미널만 열기'
$terminalButton.Location = [System.Drawing.Point]::new(254, 275)
$terminalButton.Size = [System.Drawing.Size]::new(125, 48)
$terminalButton.Anchor = 'Bottom,Left'
$detailsPanel.Controls.Add($terminalButton)

$checkButton = [System.Windows.Forms.Button]::new()
$checkButton.Text = '연결 확인'
$checkButton.Location = [System.Drawing.Point]::new(389, 275)
$checkButton.Size = [System.Drawing.Size]::new(123, 48)
$checkButton.Anchor = 'Bottom,Right'
$detailsPanel.Controls.Add($checkButton)

$importButton = [System.Windows.Forms.Button]::new()
$importButton.Text = '기존 프로젝트 가져오기'
$importButton.Location = [System.Drawing.Point]::new(24, 490)
$importButton.Size = [System.Drawing.Size]::new(210, 46)
$importButton.Anchor = 'Bottom,Left'
$form.Controls.Add($importButton)

$newProjectButton = [System.Windows.Forms.Button]::new()
$newProjectButton.Text = '새 프로젝트 만들기'
$newProjectButton.Location = [System.Drawing.Point]::new(244, 490)
$newProjectButton.Size = [System.Drawing.Size]::new(190, 46)
$newProjectButton.Anchor = 'Bottom,Left'
$form.Controls.Add($newProjectButton)

$connectButton = [System.Windows.Forms.Button]::new()
$connectButton.Text = '선택 계정 연결'
$connectButton.Location = [System.Drawing.Point]::new(444, 490)
$connectButton.Size = [System.Drawing.Size]::new(170, 46)
$connectButton.Anchor = 'Bottom,Left'
$form.Controls.Add($connectButton)

$browserButton = [System.Windows.Forms.Button]::new()
$browserButton.Text = '계정 브라우저'
$browserButton.Location = [System.Drawing.Point]::new(624, 490)
$browserButton.Size = [System.Drawing.Size]::new(160, 46)
$browserButton.Anchor = 'Bottom,Left'
$form.Controls.Add($browserButton)

function Get-SelectedProject {
    if ($projectList.SelectedItem) { return $projectList.SelectedItem }
    return $null
}

function Update-ProjectDetails {
    $project = Get-SelectedProject
    if (-not $project) {
        $projectTitle.Text = '프로젝트를 등록하세요'
        $projectDetails.Text = "기존 프로젝트 가져오기 또는 새 프로젝트 만들기를 선택하세요."
        foreach ($button in @($startButton, $terminalButton, $checkButton, $connectButton, $browserButton)) { $button.Enabled = $false }
        return
    }

    $account = Get-DpsAccount -Id $project.accountId
    $providers = @($project.environment.databaseProviders)
    $projectTitle.Text = $project.displayName
    $projectDetails.Text = @(
        "프로젝트 경로  $($project.workspace)",
        "계정 묶음      $($account.displayName)",
        "GitHub         $(if ($project.git.owner) { "$($project.git.owner)/$($project.git.repository)" } else { '연결 정보 없음' })",
        "Git 작성자     $(if ($account.gitEmail) { "$($account.gitName) <$($account.gitEmail)>" } else { '설정 필요' })",
        "Vercel         $(if ($project.vercel.linked) { '프로젝트 연결됨' } else { '프로젝트 연결 확인 필요' })",
        "Database       $(if ($providers.Count) { $providers -join ', ' } else { '환경변수 확인 필요' })",
        "Codex 모드     $($account.mode)"
    ) -join [Environment]::NewLine
    foreach ($button in @($startButton, $terminalButton, $checkButton, $connectButton, $browserButton)) { $button.Enabled = $true }
}

function Refresh-Projects {
    $selectedId = if ($projectList.SelectedItem) { $projectList.SelectedItem.id } else { '' }
    $projectList.Items.Clear()
    foreach ($project in Get-DpsProjects) { $projectList.Items.Add($project) | Out-Null }
    if ($projectList.Items.Count -gt 0) {
        $index = 0
        for ($i = 0; $i -lt $projectList.Items.Count; $i++) {
            if ($projectList.Items[$i].id -eq $selectedId) { $index = $i; break }
        }
        $projectList.SelectedIndex = $index
    }
    Update-ProjectDetails
}

$projectList.Add_SelectedIndexChanged({ Update-ProjectDetails })
$startButton.Add_Click({
    $project = Get-SelectedProject
    if ($project) { Start-DpsProject -ProjectId $project.id | Out-Null }
})
$terminalButton.Add_Click({
    $project = Get-SelectedProject
    if ($project) { Start-DpsProject -ProjectId $project.id -NoCodex | Out-Null }
})
$checkButton.Add_Click({
    $project = Get-SelectedProject
    if (-not $project) { return }
    $form.Cursor = 'WaitCursor'
    try {
        $rows = Get-DpsProjectStatus -ProjectId $project.id
        $message = ($rows | ForEach-Object { "[$($_.Status)] $($_.Name)`r`n$($_.Detail)" }) -join "`r`n`r`n"
        Show-DpsMessage $message "$($project.displayName) 연결 확인"
    } catch {
        Show-DpsMessage $_.Exception.Message '연결 확인 오류' 'Error'
    } finally {
        $form.Cursor = 'Default'
    }
})
$importButton.Add_Click({
    $folderDialog = [System.Windows.Forms.FolderBrowserDialog]::new()
    $folderDialog.Description = '기존 프로젝트 폴더를 선택하세요.'
    if ($folderDialog.ShowDialog() -ne 'OK') { return }
    $defaultName = Split-Path $folderDialog.SelectedPath -Leaf
    $displayName = [Microsoft.VisualBasic.Interaction]::InputBox('프로젝트 표시 이름을 입력하세요.', '기존 프로젝트 가져오기', $defaultName)
    if (-not $displayName.Trim()) { return }
    $accountId = Show-DpsAccountPicker
    if (-not $accountId) { return }
    try {
        Import-DpsProject -Workspace $folderDialog.SelectedPath -DisplayName $displayName -AccountId $accountId | Out-Null
        Refresh-Projects
        Show-DpsMessage "등록했습니다.`r`n앞으로 dev $(($displayName.ToLowerInvariant() -replace '[^a-z0-9_-]+','-').Trim('-')) 명령으로 실행할 수 있습니다."
    } catch {
        Show-DpsMessage $_.Exception.Message '프로젝트 가져오기 오류' 'Error'
    }
})
$newProjectButton.Add_Click({
    $displayName = [Microsoft.VisualBasic.Interaction]::InputBox('새 프로젝트 이름을 입력하세요.', '새 프로젝트', '')
    if (-not $displayName.Trim()) { return }
    $folderDialog = [System.Windows.Forms.FolderBrowserDialog]::new()
    $folderDialog.Description = '새 프로젝트를 만들 상위 폴더를 선택하세요.'
    if ($folderDialog.ShowDialog() -ne 'OK') { return }
    $folderName = ($displayName.ToLowerInvariant() -replace '[^a-z0-9_-]+', '-').Trim('-')
    if (-not $folderName) { $folderName = 'new-project' }
    $workspace = Join-Path $folderDialog.SelectedPath $folderName
    $accountId = Show-DpsAccountPicker
    if (-not $accountId) { return }
    try {
        New-DpsProject -Workspace $workspace -DisplayName $displayName -AccountId $accountId | Out-Null
        Refresh-Projects
        Show-DpsMessage "새 프로젝트 폴더와 전환 프로필을 만들었습니다.`r`n$workspace"
    } catch {
        Show-DpsMessage $_.Exception.Message '새 프로젝트 오류' 'Error'
    }
})
$connectButton.Add_Click({
    $project = Get-SelectedProject
    if (-not $project) { return }
    try {
        Start-DpsAccountLogin -AccountId $project.accountId -Service all
        Show-DpsMessage 'GitHub → Vercel → Codex 순서로 연결하는 창을 열었습니다.'
    } catch {
        Show-DpsMessage $_.Exception.Message '계정 연결' 'Warning'
    }
})
$browserButton.Add_Click({
    $project = Get-SelectedProject
    if ($project) { Open-DpsAccountBrowser -AccountId $project.accountId }
})

Refresh-Projects
[void]$form.ShowDialog()
