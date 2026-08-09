param(
  [string]$SourcePath = "C:\REAL_QR_FIND\reference\위치기반 서비스 사업계획서\[작성 필요]위치기반서비스_사업계획서.docx",
  [string]$OutputPath = "C:\REAL_QR_FIND\deliverables\location-service\REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.docx"
)

$ErrorActionPreference = "Stop"
$word = $null
$document = $null

function Add-Paragraph {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][string]$Text,
    [int]$Style = -1,
    [int]$SpaceAfter = 6
  )
  $range = $Document.Content
  $range.Collapse(0)
  $range.InsertAfter($Text)
  $range.Style = $Style
  $range.Font.Name = "맑은 고딕"
  $range.Font.NameFarEast = "맑은 고딕"
  $range.Font.Size = switch ($Style) {
    -63 { 22 }
    -2 { 16 }
    -3 { 11 }
    default { 10 }
  }
  $range.ParagraphFormat.LineSpacingRule = 0
  $range.ParagraphFormat.SpaceAfter = $SpaceAfter
  $range.InsertParagraphAfter()
}

function Add-Table {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][object[][]]$Rows
  )
  $range = $Document.Content
  $range.Collapse(0)
  $table = $Document.Tables.Add($range, $Rows.Count, $Rows[0].Count)
  $table.Borders.Enable = 1
  $table.AllowAutoFit = $true
  $table.AutoFitBehavior(2)
  for ($row = 0; $row -lt $Rows.Count; $row++) {
    for ($column = 0; $column -lt $Rows[$row].Count; $column++) {
      $table.Cell($row + 1, $column + 1).Range.Text = [string]$Rows[$row][$column]
    }
  }
  $table.Range.Font.Name = "맑은 고딕"
  $table.Range.Font.NameFarEast = "맑은 고딕"
  $table.Range.Font.Size = 8
  $table.Range.ParagraphFormat.SpaceAfter = 0
  $table.Range.ParagraphFormat.LineSpacingRule = 0
  $table.Rows.Item(1).Range.Bold = 1
  $table.Rows.Item(1).Range.Font.Size = 9
  $table.Rows.Item(1).Shading.BackgroundPatternColor = 15132390
  $after = $Document.Content
  $after.Collapse(0)
  $after.InsertParagraphAfter()
}

function Add-EvidenceImage {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Caption,
    [switch]$PageBreakBefore
  )
  if ($PageBreakBefore) {
    $breakRange = $Document.Content
    $breakRange.Collapse(0)
    $breakRange.InsertBreak(7)
  }
  Add-Paragraph -Document $Document -Text $Caption -Style -3 -SpaceAfter 4
  $range = $Document.Content
  $range.Collapse(0)
  $shape = $Document.InlineShapes.AddPicture($Path, $false, $true, $range)
  if ($shape.Width -gt 470) {
    $ratio = 470 / $shape.Width
    $shape.Width = 470
    $shape.Height = $shape.Height * $ratio
  }
  if ($shape.Height -gt 560) {
    $ratio = 560 / $shape.Height
    $shape.Height = 560
    $shape.Width = $shape.Width * $ratio
  }
  $range = $Document.Content
  $range.Collapse(0)
  $range.InsertParagraphAfter()
}

try {
  $outputDirectory = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($SourcePath, $false, $true)
  $document.SaveAs2($OutputPath, 16)

  $end = $document.Content
  $end.Collapse(0)
  $end.InsertBreak(7)

  Add-Paragraph -Document $document -Text "보안 관련 검토 요청사항 보완서" -Style -63 -SpaceAfter 12
  Add-Paragraph -Document $document -Text "본 보완서는 2026년 8월 9일 기준 REAL_QR_FIND 운영 소스에 실제 구현된 위치정보 보호조치와 별도 제출이 필요한 운영 증빙을 구분하여 정리한다. 본문과 내용이 다른 경우 본 보완서의 구현 현황을 우선 적용한다." -Style -1

  Add-Paragraph -Document $document -Text "1. 검토 요청사항 반영 현황" -Style -2
  Add-Table -Document $document -Rows @(
    @("검토 항목", "반영 내용", "상태"),
    @("식별·인증", "개별 계정, PBKDF2-SHA-256 비밀번호 해시, 가입·변경 시 조합 규칙 검증", "구현"),
    @("로그인 실패 제한", "동일 로그인 식별자 3회 연속 실패 시 15분 잠금, 성공 시 초기화", "구현·시험"),
    @("단계별 권한", "시스템 자동수집 / 위치정보관리책임자 / 위치정보취급자 / 일반관리자 분리", "구현"),
    @("저장 암호화", "위도·경도·정확도·위치설명 AES-256-GCM 암호화, 키 분리 보관", "구현"),
    @("취급대장", "수집·제공·파기 사실과 대상·경로·수신자·목적·시각·결과 자동 기록", "구현"),
    @("접근기록", "인증·열람·내보내기·권한변경 기록, 연속 HMAC 해시", "구현"),
    @("자동 파기", "수집 후 24시간 경과 시 좌표 암호문·지도 URL·위치설명 삭제 및 파기대장 기록", "구현"),
    @("외부 증빙", "Vercel/Turso 계정·Invoice·방화벽, TLS 인증서, 관리자 PC 백신·업데이트", "운영자 첨부 필요")
  )

  Add-Paragraph -Document $document -Text "2.1 서비스 시나리오" -Style -2
  Add-Paragraph -Document $document -Text "① 발견자가 관리대상의 QR 또는 공개 링크로 접속한다. ② 서버가 QR 활성화, 관리대상 매칭 및 서비스 상태를 검증한다. ③ 발견자가 수집항목·목적·지정 보호자 제공·24시간 보유기간을 확인하고 별도 동의한다. ④ 브라우저와 단말 운영체제가 위치 권한을 요청한다. ⑤ 동의와 권한이 확인된 경우에만 위도·경도·정확도를 HTTPS로 전송한다. ⑥ 서버는 좌표 범위와 시간당 요청 한도를 검증한 뒤 AES-256-GCM 암호문으로 저장한다. ⑦ 카카오맵 링크를 일시 생성하여 지정 보호자에게 푸시로 제공하고 수집·제공 사실을 취급대장에 기록한다. ⑧ 권한 있는 취급자의 열람·내보내기는 접근기록에 남는다. ⑨ 수집 후 24시간이 지나면 원본 좌표 암호문과 지도 URL을 자동 파기한다." -Style -1

  Add-Paragraph -Document $document -Text "2.2 위치정보 데이터 흐름도" -Style -2
  Add-Table -Document $document -Rows @(
    @("단계", "처리 주체", "처리", "저장·출력"),
    @("1", "발견자", "QR 접근 및 별도 동의", "동의버전·시각·비식별 요청자"),
    @("2", "브라우저·OS", "Geolocation API로 단발성 위치 산출", "위도·경도·정확도"),
    @("3", "Vercel Next.js API", "QR·좌표·요청한도 검증", "정상 요청 또는 오류"),
    @("4", "암호화 모듈", "AES-256-GCM 암호화", "좌표 암호문·인증태그"),
    @("5", "Turso/libSQL", "암호문과 동의·취급대장 저장", "원본 IP·지도 URL 미저장"),
    @("6", "Web Push", "일시 생성 카카오맵 링크 제공", "지정 보호자 알림"),
    @("7", "취급자", "직무권한 검증 후 제한적 열람", "접근사실·무결성 해시"),
    @("8", "자동 파기", "24시간 만료 원본 삭제", "파기 사실만 대장 보존")
  )

  Add-Paragraph -Document $document -Text "3.2 위치정보의 기술적 보호조치 내역" -Style -2
  Add-Table -Document $document -Rows @(
    @("항목", "조치 내역", "증빙"),
    @("식별 및 인증", "ID/PW 및 SNS 개별계정, 비밀번호 조합 규칙, 3회 실패 시 15분 접근 제한", "로그인·보안관리 화면"),
    @("단계별 접근통제", "자동수집과 사람계정 분리, 관리책임자만 파기·내보내기·권한관리", "취급자 권한표"),
    @("저장 암호화", "위치 필드 AES-256-GCM, 암호키는 Vercel Secret으로 DB·소스와 분리", "보안관리·DB 암호문"),
    @("구간 암호화", "HTTPS/TLS, HSTS, nosniff, referrer·permissions 정책", "인증서·응답헤더"),
    @("접근기록", "인증·열람·내보내기·권한변경 자동 기록, 최소 1년 보존 정책", "접근기록 그리드"),
    @("취급대장", "수집·제공·파기 확인자료 자동 기록, 실제 좌표 제외", "취급대장 그리드"),
    @("파기", "24시간 만료 시 좌표·암호문·지도 URL 삭제, 파기 로그 생성", "파기 현황·대장"),
    @("보안프로그램", "의존성 취약점 점검과 배포검증, 관리자 PC 백신·OS 자동업데이트", "빌드 결과·현장 캡처")
  )

  Add-Paragraph -Document $document -Text "3.4 단계별 접근 권한 제한" -Style -2
  Add-Table -Document $document -Rows @(
    @("구분", "수집", "이용/열람", "보호자 제공", "파기", "내보내기", "권한관리"),
    @("시스템 자동처리", "O", "O", "O", "O", "-", "-"),
    @("위치정보관리책임자", "-", "O", "O", "O", "O", "O"),
    @("위치정보취급자", "-", "O", "O", "-", "-", "-"),
    @("일반 관리자", "-", "-", "-", "-", "-", "-")
  )
  Add-Paragraph -Document $document -Text "모든 직무를 O로 통일하지 않는다. 자동수집은 사람 계정과 분리하고, 취급자는 업무상 필요한 이용·제공 권한만 가진다. 권한 부여·변경·말소 이력은 대상자, 수행자, 사유, 변경 전·후 값과 무결성 해시를 포함하여 5년 이상 보존한다." -Style -1

  Add-Paragraph -Document $document -Text "4.1 주요설비내역" -Style -2
  Add-Table -Document $document -Rows @(
    @("구분", "장비항목·현재규격·활용기능"),
    @("1", "Vercel Cloud 웹·애플리케이션 논리서버: 프로젝트 zezari, Next.js 16.3.0, Node.js 24.x, Production READY, Function iad1. 글로벌 CDN·HTTPS·PWA·SSR 및 인증·QR·결제·광고·위치공유 API 처리"),
    @("2", "Turso Cloud DB 논리서버: libSQL/SQLite 3.47.0, aws-ap-northeast-1, 스키마 37, 업무 테이블 37개, 논리용량 6.68 MB. 회원·QR·업무데이터·위치 암호문·동의·취급대장·접근기록 저장"),
    @("3", "GitHub Cloud 형상·배포이력 저장소: zezariGit/zezariGit, main. 소스·변경이력·배포 기준점과 Vercel Production 자동 배포 연동, .env.local 저장소 제외"),
    @("4", "관리자 업무용 PC·사업장 네트워크: 관리자 로그인, 권한·대장·민원·사고대응. 실제 모델·OS·자산번호·설치주소·백신·화면잠금 자료는 운영자 첨부"),
    @("5", "발견자·보호자 스마트폰: QR 스캔, 단발성 GPS 위치 산출, Web Push 수신. 회사 보유 설비가 아닌 이용자 소유 외부 단말")
  )

  Add-Paragraph -Document $document -Text "4.2 설치장소 및 확인서류" -Style -2
  Add-Paragraph -Document $document -Text "자체 물리 서버는 없고 Vercel·Turso·GitHub 관리형 클라우드의 논리설비를 사용한다. 현재 Vercel Function은 iad1(Washington, D.C., USA), Turso DB는 aws-ap-northeast-1(Tokyo, Japan)이다. 국외 처리·이전 고지와 서버·DB 리전 정렬 여부를 검토한다. 제출 시 Vercel 프로젝트·도메인·기능·Invoice, Turso 데이터베이스·리전·백업·Invoice, GitHub 저장소 권한 화면을 첨부한다. 별도 IDC 계약서가 없으면 제공자명과 이용 기능이 확인되는 계정정보·청구 화면으로 대체한다. 관리자 PC와 네트워크 장비는 실제 모델·설치주소·백신·업데이트·화면잠금 자료를 첨부하며 비밀키와 토큰은 마스킹한다." -Style -1

  Add-Paragraph -Document $document -Text "5. 구현 증빙 화면" -Style -2
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\01-location-security-dashboard.png" -Caption "[증빙 1] 위치정보 보안관리: 암호화·자동파기·권한표·취급대장·접근기록"
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\02-admin-social-login.png" -Caption "[증빙 2] 관리자 식별 및 인증 화면" -PageBreakBefore
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\03-location-consent.png" -Caption "[증빙 3] 발견자 위치정보 별도 동의 화면" -PageBreakBefore
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\04-vercel-project-deployment.png" -Caption "[증빙 4] Vercel 프로젝트·운영배포·Function 리전 확인" -PageBreakBefore
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\05-turso-database-status.png" -Caption "[증빙 5] Turso 운영 DB·리전·스키마·논리용량 확인" -PageBreakBefore
  Add-EvidenceImage -Document $document -Path "C:\REAL_QR_FIND\deliverables\location-service\evidence\06-github-repository-deployment.png" -Caption "[증빙 6] GitHub 저장소·운영 브랜치·배포연동 확인" -PageBreakBefore

  $end = $document.Content
  $end.Collapse(0)
  $end.InsertBreak(7)
  Add-Paragraph -Document $document -Text "6. 제출 전 운영자 첨부자료" -Style -2
  Add-Paragraph -Document $document -Text "① 제출일 기준 유효기간이 1개월 이상 남은 zezari.family TLS 인증서 상세 ② Vercel 프로젝트 계정·도메인·Firewall/WAF 또는 플랫폼 보안 화면과 Invoice ③ Turso 계정·DB 리전·백업·저장 암호화 공식 확인자료와 Invoice ④ 값이 마스킹된 Vercel 환경변수 목록 ⑤ 관리자 PC 백신·최근 업데이트·OS 자동업데이트·화면잠금 ⑥ GitHub·Vercel·Turso 관리자 MFA ⑦ 위치정보관리책임자·취급자 지정서, 보안서약서, 연간 교육·자체검사 기록" -Style -1

  $document.Save()
  $pdfPath = [System.IO.Path]::ChangeExtension($OutputPath, ".pdf")
  $document.ExportAsFixedFormat($pdfPath, 17)
}
finally {
  if ($document) { $document.Close($false) }
  if ($word) { $word.Quit() }
  if ($document) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
  if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
