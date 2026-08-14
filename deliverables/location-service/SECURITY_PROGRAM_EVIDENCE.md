# 서버·관리자 PC 보안프로그램 확인

## 관리자 PC

- 운영체제: Microsoft Windows 11 Pro
- 등록 백신: Windows Defender
- Defender 서비스, 바이러스 백신, 실시간 보호, 행동 모니터링, 네트워크 검사, 다운로드 파일 검사: 활성
- Windows 방화벽 Domain, Private, Public 프로필: 활성
- 보안 인텔리전스: 확인 당일 업데이트 상태
- 빠른 검사: 6일 전
- 전체 검사: 완료 기록 없음

제출 전 Defender 업데이트 후 빠른 검사와 전체 검사를 수행하고 Windows 보안 앱의 검사 완료 화면을 추가 캡처한다.

## Vercel 관리형 서버

Vercel Function과 Edge 인프라는 관리형 클라우드이므로 고객이 서버 OS에 접속하여 백신 프로세스나 설치 프로그램 목록을 확인할 수 없다. 서버 측 증빙은 Vercel의 공식 보안·컴플라이언스 자료와 프로젝트 방화벽 설정을 사용한다.

Vercel 공식 자료에서 확인되는 통제:

- SOC 2 Type 2
- ISO 27001:2022
- 플랫폼 방화벽과 DDoS 완화
- HTTPS 및 데이터 암호화
- 클라우드 보안 상태 관리 도구를 통한 지속적 스캔과 경고
- Infrastructure as Code 기반 변경통제

## 증빙 파일

- `evidence/14-admin-pc-security-evidence.html`
- `evidence/14-admin-pc-security-evidence.png`
- `evidence/15-vercel-managed-security-evidence.png`

## 주의사항

- 관리자 PC의 전체 검사 미실시 상태는 보완이 필요하다.
- Vercel 관리형 인프라의 내부 백신 제품명이나 개별 서버 검사 결과를 서비스 이용자가 직접 확인할 수 있다고 표현하지 않는다.
- 제출 시 Vercel 공식 보안 문서, 인증서와 프로젝트 Firewall 화면을 함께 첨부한다.
