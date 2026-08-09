param(
  [string]$OutputDirectory = "C:\REAL_QR_FIND\deliverables\location-service\evidence"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$json = node --env-file=.env.local scripts/collect-infrastructure-evidence.mjs | Out-String
if ($LASTEXITCODE -ne 0) { throw "Infrastructure evidence collection failed." }
$data = $json | ConvertFrom-Json

function Format-Bytes([double]$Value) {
  return "{0:N2} MB" -f ($Value / 1MB)
}

function Save-EvidenceCard {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Provider,
    [Parameter(Mandatory)][string]$Title,
    [Parameter(Mandatory)][string]$Subtitle,
    [Parameter(Mandatory)][object[]]$Rows,
    [Parameter(Mandatory)][string]$Source
  )

  $bitmap = New-Object System.Drawing.Bitmap 1500, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F6F9"))

  $navy = [System.Drawing.ColorTranslator]::FromHtml("#071B33")
  $blue = [System.Drawing.ColorTranslator]::FromHtml("#236FA1")
  $line = [System.Drawing.ColorTranslator]::FromHtml("#CAD7E2")
  $muted = [System.Drawing.ColorTranslator]::FromHtml("#52616F")
  $white = [System.Drawing.Color]::White
  $black = [System.Drawing.ColorTranslator]::FromHtml("#111827")
  $green = [System.Drawing.ColorTranslator]::FromHtml("#16794A")

  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush $navy), 0, 0, 1500, 122)
  $titleFont = New-Object System.Drawing.Font("Malgun Gothic", 30, [System.Drawing.FontStyle]::Bold)
  $providerFont = New-Object System.Drawing.Font("Malgun Gothic", 16, [System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font("Malgun Gothic", 16)
  $labelFont = New-Object System.Drawing.Font("Malgun Gothic", 18, [System.Drawing.FontStyle]::Bold)
  $valueFont = New-Object System.Drawing.Font("Malgun Gothic", 18)
  $statusFont = New-Object System.Drawing.Font("Malgun Gothic", 14, [System.Drawing.FontStyle]::Bold)
  $sourceFont = New-Object System.Drawing.Font("Consolas", 13)

  $graphics.DrawString($Title, $titleFont, [System.Drawing.Brushes]::White, 55, 27)
  $providerSize = $graphics.MeasureString($Provider, $providerFont)
  $providerX = 1415 - [int]$providerSize.Width
  $graphics.DrawString($Provider, $providerFont, (New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#9FD4F3"))), $providerX, 46)

  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush $white), 45, 150, 1410, 650)
  $graphics.DrawRectangle((New-Object System.Drawing.Pen $line, 2), 45, 150, 1410, 650)
  $graphics.DrawString($Subtitle, $subtitleFont, (New-Object System.Drawing.SolidBrush $muted), 80, 178)
  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#E8F6EE"))), 1250, 174, 150, 42)
  $graphics.DrawString("운영 확인", $statusFont, (New-Object System.Drawing.SolidBrush $green), 1272, 182)

  $rowTop = 238
  $rowHeight = [math]::Floor(520 / $Rows.Count)
  for ($index = 0; $index -lt $Rows.Count; $index++) {
    $top = $rowTop + ($index * $rowHeight)
    if ($index % 2 -eq 0) {
      $graphics.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F8FAFC"))), 72, $top, 1356, $rowHeight)
    }
    $graphics.DrawLine((New-Object System.Drawing.Pen $line, 1), 72, $top + $rowHeight, 1428, $top + $rowHeight)
    $graphics.DrawString([string]$Rows[$index].Label, $labelFont, (New-Object System.Drawing.SolidBrush $blue), 95, $top + 20)
    $valueRect = New-Object System.Drawing.RectangleF 390, ($top + 14), 1000, ($rowHeight - 18)
    $graphics.DrawString([string]$Rows[$index].Value, $valueFont, (New-Object System.Drawing.SolidBrush $black), $valueRect)
  }

  $graphics.DrawString("확인 출처", $providerFont, (New-Object System.Drawing.SolidBrush $muted), 55, 825)
  $graphics.DrawString($Source, $sourceFont, (New-Object System.Drawing.SolidBrush $black), 175, 828)
  $graphics.DrawString(("생성시각 {0:yyyy-MM-dd HH:mm:ss} KST / 인증키·토큰·시크릿 값 제외" -f [DateTime]::Now), $statusFont, (New-Object System.Drawing.SolidBrush $muted), 925, 832)

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-EvidenceCard `
  -Path (Join-Path $OutputDirectory "04-vercel-project-deployment.png") `
  -Provider "VERCEL" `
  -Title "Vercel 운영 논리 서버 확인" `
  -Subtitle "REAL_QR_FIND 운영 배포의 프로젝트·런타임·리전·도메인 확인 결과" `
  -Rows @(
    @{ Label = "프로젝트"; Value = "$($data.vercel.projectName) / $($data.vercel.projectId)" },
    @{ Label = "프레임워크"; Value = "$($data.vercel.framework), $($data.vercel.runtime)" },
    @{ Label = "운영 배포"; Value = "$($data.vercel.deploymentId) / $($data.vercel.deploymentStatus)" },
    @{ Label = "함수 리전"; Value = "$($data.vercel.functionRegion) (Washington, D.C., USA)" },
    @{ Label = "운영 도메인"; Value = $data.vercel.domains },
    @{ Label = "활용 기능"; Value = "글로벌 CDN, HTTPS/TLS, Next.js SSR·API, PWA 정적자원, 인증·QR·결제·위치공유 처리" }
  ) `
  -Source "vercel inspect https://zezari.family / .vercel/project.json"

Save-EvidenceCard `
  -Path (Join-Path $OutputDirectory "05-turso-database-status.png") `
  -Provider "TURSO / LIBSQL" `
  -Title "Turso 운영 데이터베이스 확인" `
  -Subtitle "인증 토큰과 원본 연결 문자열을 제외한 운영 DB 메타데이터" `
  -Rows @(
    @{ Label = "서비스 유형"; Value = $data.turso.provider },
    @{ Label = "호스트"; Value = $data.turso.host },
    @{ Label = "주 리전"; Value = "$($data.turso.regionCode) (Tokyo, Japan)" },
    @{ Label = "DB 엔진"; Value = "SQLite $($data.turso.sqliteVersion) / libSQL 원격 접속" },
    @{ Label = "스키마"; Value = "REAL_QR_FIND schema $($data.turso.schemaVersion), 업무 테이블 $($data.turso.tableCount)개" },
    @{ Label = "논리 용량"; Value = "$(Format-Bytes $data.turso.logicalBytes) ($($data.turso.pageCount) pages x $($data.turso.pageSize) bytes)" },
    @{ Label = "활용 기능"; Value = "회원·관리대상·QR·주문·결제·광고·알림·위치정보 암호문·취급대장·접근기록 저장" }
  ) `
  -Source "libSQL read-only metadata query / TURSO_DATABASE_URL host masking"

Save-EvidenceCard `
  -Path (Join-Path $OutputDirectory "06-github-repository-deployment.png") `
  -Provider "GITHUB" `
  -Title "GitHub 소스·배포이력 저장소 확인" `
  -Subtitle "운영 소스 형상관리와 Vercel 자동 배포 연결 확인 결과" `
  -Rows @(
    @{ Label = "저장소"; Value = $data.github.repository },
    @{ Label = "운영 브랜치"; Value = $data.github.branch },
    @{ Label = "확인 커밋"; Value = "$($data.github.commit) / 누적 $($data.github.commitCount) commits" },
    @{ Label = "최근 변경"; Value = $data.github.lastCommit },
    @{ Label = "배포 연동"; Value = $data.github.deploymentIntegration },
    @{ Label = "비밀정보 제외"; Value = ".env.local Git 제외 확인: $($data.github.envIgnored) / 운영 비밀값은 Vercel 환경변수로 분리" }
  ) `
  -Source "git remote / git log / git check-ignore .env.local"

$json | Set-Content -Path (Join-Path $OutputDirectory "infrastructure-evidence.json") -Encoding utf8
