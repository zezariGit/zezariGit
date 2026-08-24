# 개발환경 전환기

프로젝트별 GitHub, Vercel, DB, Codex 계정을 섞지 않고 새 PowerShell 창에만 적용하는 Windows 도구다.

## 설치

```powershell
pwsh -ExecutionPolicy Bypass -File C:\REAL_QR_FIND\tools\dev-profile-switcher\Install-DevProfileSwitcher.ps1
```

설치 후 새 터미널을 열고 `dev`를 실행하면 GUI가 열린다. 바탕화면의 `개발환경 전환기` 바로가기도 사용할 수 있다.

## 가장 쉬운 사용법

```powershell
dev stock
dev zezari
```

선택한 프로젝트의 계정 묶음을 새 창에 적용하고 Codex CLI를 실행한다. 현재 열려 있는 다른 프로젝트 창의 환경은 변경하지 않는다.

분리 계정의 GitHub 저장소는 해당 창의 GitHub CLI 인증만 사용한다. 상위 터미널에 남은 DB/API 환경변수는 제거하여 프로젝트의 `.env.local`이 우선하도록 한다.

## 기존 프로젝트

GUI에서 `기존 프로젝트 가져오기`를 누르고 폴더와 계정 묶음을 선택한다. `현재 PC 개발계정`을 선택하면 기존 CLI와 Codex 로그인을 그대로 사용한다.

```powershell
dev import stock C:\soonsuboy_dev_project\stock -Account current
```

## 새 프로젝트

GUI에서 `새 프로젝트 만들기`를 선택한다. 기존 계정 묶음을 고르거나 `새 계정 묶음 만들기`를 선택할 수 있다.

새 계정은 GitHub, Vercel, Codex의 최초 로그인과 MFA를 사용자가 한 번 완료해야 한다. 프로그램은 비밀번호, 토큰, 브라우저 쿠키를 복사하거나 일반 JSON 파일에 저장하지 않는다.

## 연결 확인

```powershell
dev status stock
```

Git 원격 저장소, Git 작성자, GitHub CLI, Vercel CLI, Codex 로그인, DB 환경변수 연결 여부를 확인한다. 환경변수 값은 표시하지 않는다.

## 저장 위치

```text
%LOCALAPPDATA%\DevProfileSwitcher\
  accounts\
  projects\
  logs\
  runtime\
```

프로필에는 경로와 연결 상태만 저장한다. 프로젝트의 `.env.local` 값은 가져오거나 복제하지 않는다.
