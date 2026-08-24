# REAL_QR_FIND 계정 접근 대장

## 중요 보안 규칙

**비밀번호, API 키, 토큰, MFA 복구코드는 이 문서·GitHub·개발 로그·채팅에 기록하지 않는다.**

비밀번호는 Bitwarden, 1Password 등 조직용 비밀번호 관리자에 보관하고 아래 `비밀번호 관리자 항목명`만 동일하게 사용한다. 실제 계정값을 별도 파일로 내보낼 경우 프로젝트 밖의 암호화 저장소에 두며, `private/`, `*.credentials.local.*`, `*.passwords.local.*`은 Git에서 제외된다.

## 확인된 기본 소유정보

- GitHub 계정: `zezariGit`
- Git 설정 이메일: `general@zezari.com`
- Vercel Team/Project: `zezari / zezari`
- Vercel 배포 사용자 식별자: `zezarigit`
- Turso 조직 식별자: `zezarigit`
- 애플리케이션 관리자 계정 목록: Vercel `ADMIN_EMAILS`와 DB `guardians.is_admin`에서 관리

## 2026-08-24 운영 계정 점검 요약

- 확인된 계정 식별자: GitHub `zezariGit`, Vercel Team/Project `zezari / zezari`, Vercel 사용자 `zezarigit`, Turso 조직 `zezarigit`.
- 확인된 운영 도메인: `zezari.family`; 도메인과 DNS는 Vercel Team `zezari`에서 관리한다.
- 공급자 콘솔에서 직접 확인해야 하는 로그인 ID: Google Cloud, Kakao Developers, Naver Developers, Meta, Toss Payments, Solapi, Bizcall, Resend.
- 위 공급자 로그인 ID·비밀번호·MFA·복구수단은 Git 문서가 아니라 `ZEZARI 운영` 비밀번호 관리자에 기록한다.
- NextAuth, Web Push, 위치정보 암호화, 지도 검색은 별도 사람이 로그인하는 서비스 계정이 아니라 Vercel 환경변수 또는 공개 API 정책으로 운영한다.

## 계정 접근대장

| 서비스 | 로그인·관리 URL | 계정 식별자 | 권한/용도 | 비밀번호 관리자 항목명 | MFA | 복구수단 | 최종 확인 |
|---|---|---|---|---|---|---|---|
| GitHub | [github.com/login](https://github.com/login) | `zezariGit`, 연락 이메일 `general@zezari.com` | 저장소 소유·Push | `ZEZARI / GitHub / zezariGit` | 확인 필요 | 확인 필요 | 2026-08-19 Push 가능 |
| Vercel | [vercel.com/zezari](https://vercel.com/zezari) | Team `zezari`, 사용자 `zezarigit` | 배포·도메인·환경변수 | `ZEZARI / Vercel / zezarigit` | 확인 필요 | 확인 필요 | 2026-08-19 CLI 접근 가능 |
| Turso | [app.turso.tech/zezarigit](https://app.turso.tech/zezarigit) | 조직 `zezarigit` | 운영 DB·토큰 | `ZEZARI / Turso / zezarigit` | 확인 필요 | 확인 필요 | DB 연동 설정 확인 |
| Google Cloud | [console.cloud.google.com](https://console.cloud.google.com/) | 비밀번호 관리자에서 확인 | Google OAuth | `ZEZARI / Google Cloud / OAuth` | 필수 | 확인 필요 | Google 로그인 운영 확인 |
| Kakao Developers | [developers.kakao.com](https://developers.kakao.com/console/app) | 비밀번호 관리자에서 확인 | Kakao OAuth | `ZEZARI / Kakao Developers` | 권장 | 확인 필요 | 운영 검증 필요 |
| Naver Developers | [developers.naver.com](https://developers.naver.com/apps/) | 비밀번호 관리자에서 확인 | Naver OAuth·검수 | `ZEZARI / Naver Developers` | 권장 | 확인 필요 | 검수 결과 확인 필요 |
| Meta Business | [business.facebook.com](https://business.facebook.com/) | Business·시스템 사용자 정보는 관리자 콘솔 확인 | Facebook OAuth·광고 자산 | `ZEZARI / Meta Business` | 필수 | 확인 필요 | 광고 발행 이력 있음 |
| Meta Developers | [developers.facebook.com/apps](https://developers.facebook.com/apps/) | 앱 `qr-find-ads` 관련 계정 | 앱·OAuth·Marketing API | `ZEZARI / Meta Developers / qr-find-ads` | 필수 | 확인 필요 | 키 설정됨 |
| Toss Payments | [developers.tosspayments.com](https://developers.tosspayments.com/) | 상점 계정은 비밀번호 관리자에서 확인 | 결제 키·거래·환불 | `ZEZARI / Toss Payments` | 필수 | 확인 필요 | 운영 결제 설정됨 |
| Solapi | [console.solapi.com](https://console.solapi.com/dashboard) | 계정은 비밀번호 관리자에서 확인 | SMS 키·발신번호·잔액 | `ZEZARI / Solapi` | 필수 | 확인 필요 | SMS 활성 |
| Bizcall | [partners.050bizcall.co.kr](https://partners.050bizcall.co.kr/) | 회원사 계정은 비밀번호 관리자에서 확인 | 050 번호·매핑·API 설정 | `ZEZARI / Bizcall Partner` | 권장 | 확인 필요 | API 설정됨 |
| Resend | [resend.com](https://resend.com/) | 계정은 비밀번호 관리자에서 확인 | 이메일 도메인·API 키 | `ZEZARI / Resend` | 필수 | 확인 필요 | 현재 기능 비활성 |
| 도메인 | [Vercel Domains](https://vercel.com/zezari/~/domains) | Team `zezari` | `zezari.family` 갱신·DNS | `ZEZARI / Domain / zezari.family` | Vercel MFA 연계 | 확인 필요 | 운영 연결됨 |

`확인 필요` 항목은 실제 공급자 콘솔에서 확인한 뒤 날짜와 담당자를 갱신한다. 개인 이메일이나 휴대폰 번호를 Git 추적 문서에 추가하지 않는다.

## 비밀번호 관리자 권장 구조

공유 보관함 이름: `ZEZARI 운영`

각 항목 필수 필드:

- 서비스명
- 로그인 URL
- 로그인 ID
- 비밀번호
- MFA 방식과 TOTP
- 복구 이메일·전화번호
- 복구코드 첨부 위치
- 계정 소유자와 보조 관리자
- 관련 Vercel 환경변수 이름
- 마지막 로그인 확인일
- 마지막 비밀번호·키 변경일
- 계약·결제 담당자

## 권한 운영 기준

1. GitHub, Vercel, Turso, Google, Meta, Toss는 최소 2명의 복구 가능한 운영자를 둔다.
2. 관리자 개인 계정을 공유하지 않고 각자 계정을 초대한다.
3. MFA를 지원하는 모든 서비스에서 MFA를 활성화한다.
4. 퇴사·외주 종료 즉시 계정 접근, GitHub 권한, Vercel Team, Turso 토큰, 공급자 앱 역할을 회수한다.
5. 공용 비밀번호를 변경하면 비밀번호 관리자와 이 문서의 최종 확인일만 갱신한다.
6. API 키는 비밀번호 관리자와 Vercel에만 저장하고 소스·문서에는 환경변수 이름만 남긴다.

## 분실·침해 대응

1. 해당 서비스 계정을 잠그거나 세션을 모두 로그아웃한다.
2. 비밀번호와 API 키를 새로 발급한다.
3. Vercel Production·Development 환경변수를 모두 교체한다.
4. 재배포 후 로그인, SMS, 결제, 광고, 안심번호 등 영향 기능을 테스트한다.
5. GitHub·Vercel·공급자 감사로그에서 비정상 접근을 확인한다.
6. 사고일시, 영향, 조치, 키 폐기 여부를 `logs/DEV_HANDOFF_LOG.md`에 값 없이 기록한다.
