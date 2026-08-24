# 개발 계정 통합 전환 프로그램 설계

## 1. 목적

제자리와 새로운 프로젝트의 개발 계정을 섞지 않고, 프로젝트 하나를 선택하면 그 프로젝트 전용 GitHub, Vercel, Codex, VS Code, 브라우저와 환경변수 작업공간을 한 번에 여는 Windows 프로그램을 만든다.

가칭은 `Dev Profile Switcher`이며, 사용자 화면에서는 `개발 프로젝트 전환기`로 표시한다.

## 2. 아주 쉬운 개념

프로젝트마다 전용 서랍을 하나씩 만든다고 생각한다.

- `제자리` 서랍: zezariGit, Vercel zezari, Turso 운영 DB, 제자리 Google/Meta 계정
- `신규 프로젝트` 서랍: 새 GitHub, 새 Vercel, 새 DB, 새 Google 계정

사용자가 `제자리로 열기`를 누르면 제자리 서랍에 연결된 VS Code, 터미널, 브라우저와 Codex가 열린다. `신규 프로젝트로 열기`를 누르면 완전히 분리된 새 서랍이 열린다.

## 3. 중요한 한계

- 최초 계정 생성, 약관 동의, 비밀번호 입력, MFA와 휴대폰 인증은 사용자가 공급자 화면에서 한 번 수행해야 한다.
- 프로그램은 비밀번호를 자동 입력하거나 브라우저 쿠키를 복사하지 않는다.
- 한 번 로그인해 둔 뒤에는 각 프로필의 인증 저장소를 분리하여 다음 실행부터 한 번에 전환한다.
- 이미 열려 있는 VS Code, 터미널, 브라우저는 그대로 유지된다. 전환은 새로 실행하는 프로그램에만 적용한다.
- Codex CLI와 IDE 확장은 `CODEX_HOME`으로 분리할 수 있다. Codex 데스크톱 앱 계정 자체가 별도 프로필을 공식 지원하지 않는 경우에는 수동 로그인 또는 별도 Windows 사용자 계정이 필요하다.

## 4. 전환 대상

| 대상 | 분리 방법 | 자동화 수준 |
|---|---|---|
| Git 작성자 | 저장소별 `user.name`, `user.email` | 완전 자동 |
| GitHub CLI | 프로젝트별 `GH_CONFIG_DIR` | 최초 로그인 후 자동 |
| Git Push | 프로젝트별 SSH 키와 GitHub 호스트 별칭 | 최초 키 등록 후 자동 |
| Vercel CLI | 프로젝트별 `--global-config` 경로 | 최초 로그인 후 자동 |
| Vercel 프로젝트 | 저장소의 `.vercel/project.json` | 연결 후 자동 |
| Turso/DB | 프로젝트별 환경변수와 비밀정보 참조 | 자동 |
| Codex CLI/IDE | 프로젝트별 `CODEX_HOME`, Codex profile | 최초 로그인 후 자동 |
| VS Code | `--user-data-dir`, `--extensions-dir`, `--profile` | 자동 |
| Google/Kakao/Naver/Meta 콘솔 | 전용 Chrome 또는 Edge 브라우저 프로필 | 최초 로그인 후 자동 실행 |
| Google Cloud CLI | 명명된 gcloud configuration | CLI 설치 후 자동 |
| Toss/Solapi/Bizcall/Resend | 전용 브라우저 프로필과 비밀번호 관리자 | 콘솔 열기 자동, 로그인은 사용자 |

현재 PC에는 Codex, Git, GitHub CLI, Vercel CLI와 VS Code가 설치되어 있다. Turso CLI와 Google Cloud CLI는 설치되어 있지 않으므로 1차 버전에서는 Turso를 환경변수 방식으로 처리한다.

## 5. 프로그램 화면

### 홈

- 프로젝트 카드: 제자리, 신규 프로젝트 A 등
- 계정 연결 상태: GitHub, Vercel, Codex, DB, 브라우저
- `전환 후 열기` 버튼
- `연결 확인` 버튼
- `새 프로젝트 프로필` 버튼

### 새 프로필 마법사

1. 프로젝트명과 폴더 선택
2. Git 이름·이메일 입력
3. GitHub 로그인 또는 기존 연결 선택
4. Vercel 로그인과 Team/Project 선택
5. DB 종류와 환경변수 연결
6. Codex 전용 로그인 공간 생성
7. VS Code와 브라우저 전용 공간 생성
8. 연결 테스트 후 저장

### 실행 결과

- 전용 VS Code 창
- 전용 PowerShell 터미널
- 전용 개발자 콘솔 브라우저
- 필요 시 Codex CLI 또는 IDE 확장
- 선택한 프로젝트 폴더

## 6. 내부 구조

비밀값이 없는 설정만 일반 파일로 저장한다.

```text
%LOCALAPPDATA%\DevProfileSwitcher\
  profiles\
    zezari\
      profile.json
      gh\
      vercel\
      codex\
      vscode-user\
      vscode-extensions\
    next-project\
      ...
  logs\
```

`profile.json` 예시:

```json
{
  "id": "zezari",
  "displayName": "제자리",
  "workspace": "C:\\REAL_QR_FIND",
  "gitName": "zezariGit",
  "gitEmail": "general@zezari.com",
  "githubOwner": "zezariGit",
  "vercelScope": "zezari",
  "vercelProject": "zezari",
  "vscodeProfile": "ZEZARI",
  "browserProfile": "ZEZARI 개발"
}
```

토큰, 비밀번호, API 키와 복구코드는 `profile.json`에 저장하지 않는다. Windows Credential Manager, DPAPI 또는 조직용 비밀번호 관리자에 저장하고 설정 파일에는 비밀 항목 이름만 둔다.

## 7. 전환 동작

1. 선택한 프로필의 폴더와 도구 설치 상태를 검사한다.
2. 현재 열려 있는 다른 프로필 창이 있으면 사용자에게 알린다.
3. Windows 전체 환경변수를 변경하지 않고 새 프로세스에만 프로필 환경을 주입한다.
4. Git 저장소의 작성자와 원격 저장소를 검증한다.
5. `GH_CONFIG_DIR`, Vercel global config, `CODEX_HOME`, VS Code user-data 경로를 각각 선택한다.
6. 전용 브라우저 프로필, VS Code와 PowerShell을 실행한다.
7. `gh auth status`, Vercel 사용자, Git 이메일, 프로젝트 연결과 필수 환경변수 존재 여부를 확인한다.
8. 실패한 서비스만 `로그인 필요`로 표시하고 나머지는 정상 실행한다.

## 8. 보안 원칙

- 쿠키·토큰 파일을 프로젝트 사이에 복사하지 않는다.
- 비밀번호를 프로그램 화면이나 로그에 기록하지 않는다.
- 환경변수 값은 화면에서 기본 마스킹한다.
- 프로필 실행 환경은 자식 프로세스에만 적용하고 Windows 전역 설정을 오염시키지 않는다.
- Git Push 전에 원격 저장소 소유자와 Git 이메일이 선택한 프로필과 맞는지 검사한다.
- Vercel 배포 전에 Team과 Project가 맞는지 검사한다.
- 다른 프로젝트 운영 DB로 연결된 상태에서는 경고 후 배포를 중단한다.
- 모든 전환과 실패는 비밀값 없이 감사 로그에 기록한다.

## 9. 구현 기술 권장안

### 1단계: 검증용 MVP

- PowerShell 7
- JSON 프로필
- Windows Credential Manager 또는 DPAPI
- 투명하게 확인 가능한 명령형 실행기

먼저 제자리와 테스트 프로젝트 두 개로 전환이 안전한지 검증한다.

### 2단계: 사용하기 쉬운 실행 프로그램

- .NET 8 WPF
- 단일 Windows EXE 배포
- 카드형 프로젝트 선택, 연결 상태와 설정 마법사
- 내부에서는 검증된 PowerShell 모듈을 호출

Electron보다 Windows 계정 저장소와 프로세스 실행을 다루기 쉽고 설치 용량이 작아 .NET WPF를 우선한다.

## 10. 단계별 개발 계획

1. 프로필 파일 형식과 비밀정보 저장 인터페이스 확정
2. Git·GitHub·Vercel·VS Code 프로필 전환 MVP
3. Codex `CODEX_HOME` 분리와 로그인 검증
4. 프로젝트별 DB·환경변수 연결 및 오배포 차단
5. 브라우저 프로필 실행과 공급자 콘솔 바로가기
6. 연결상태 진단·감사로그·복구 기능
7. WPF 화면과 단일 EXE 패키징
8. 제자리/테스트 프로젝트 교차 전환 및 보안 테스트

## 11. 완료 기준

- 제자리와 테스트 프로젝트가 서로 다른 GitHub, Vercel, DB, Codex와 브라우저 계정으로 열린다.
- 한 프로필에서 다른 프로필의 토큰이나 쿠키를 사용하지 않는다.
- 잘못된 GitHub 저장소, Vercel 프로젝트 또는 운영 DB로 Push/배포하려 하면 차단한다.
- 최초 로그인 이후에는 프로젝트 카드의 `전환 후 열기` 한 번으로 개발 환경이 열린다.
- 프로그램 삭제 후에도 공급자 계정 비밀번호와 토큰이 평문 파일로 남지 않는다.

## 12. 설계 근거

- Codex는 사용자 설정, 인증, 로그와 세션 상태의 루트를 `CODEX_HOME`으로 지정할 수 있다.
- Codex CLI와 IDE 확장은 사용자 설정, 프로젝트 설정과 `--profile` 구성을 공유한다.
- GitHub CLI는 `GH_CONFIG_DIR`로 인증 설정 저장 위치를 분리할 수 있다.
- Vercel CLI는 `--global-config`로 계정 설정 저장 위치를 분리할 수 있다.
- VS Code는 `--user-data-dir`, `--extensions-dir`, `--profile`로 프로젝트 전용 실행 환경을 열 수 있다.
