# REAL_QR_FIND 서비스 설정 대장

## 관리 원칙

- 이 문서에는 환경변수 이름과 설정 위치만 기록한다.
- 값, 비밀번호, 토큰, 복구코드는 기록하지 않는다.
- 현재 상태는 2026-08-19의 로컬 키 존재 여부, Vercel 암호화 변수 목록, 소스와 기존 운영 테스트 기록을 대조한 결과다.
- `설정됨`은 키가 존재한다는 뜻이며 공급자 계약·심사·잔액·권한까지 보장하지 않는다.

## 서비스 인벤토리

| 서비스 | 용도 | 현재 상태 | 관리 콘솔 | 핵심 환경변수 | 코드 위치 |
|---|---|---|---|---|---|
| GitHub | 소스·이력·배포 트리거 | 운영 | [저장소](https://github.com/zezariGit/zezariGit) | 없음 | 전체 저장소 |
| Vercel | Next.js 호스팅·도메인·서버리스·환경변수 | 운영 | [프로젝트](https://vercel.com/zezari/zezari) | Vercel Environments | `.vercel/project.json`, `next.config.mjs` |
| Turso | 운영 libSQL DB | 설정됨·운영 | [Turso](https://app.turso.tech/zezarigit) | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | `lib/db.js` |
| NextAuth | 세션·일반/SNS 로그인 | 운영 | Vercel | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAILS` | `lib/auth.js` |
| Google OAuth | Google 로그인 | 운영 확인 완료 | [Google Cloud](https://console.cloud.google.com/apis/credentials) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `lib/auth.js` |
| Kakao OAuth | Kakao 로그인 | 키 설정됨·운영 검증 필요 | [Kakao Developers](https://developers.kakao.com/console/app) | `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`(선택), `KAKAO_SCOPE` | `lib/auth.js` |
| Naver OAuth | Naver 로그인 | 키 설정됨·검수 결과 확인 필요 | [Naver Developers](https://developers.naver.com/apps/) | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | `lib/auth.js` |
| Facebook OAuth | Facebook 로그인 | Meta 키 설정됨·운영 검증 필요 | [Meta Developers](https://developers.facebook.com/apps/) | `META_APP_ID`, `META_APP_SECRET` 또는 `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | `lib/auth.js` |
| Solapi | 회원가입·연락처 변경 SMS 인증번호 | 활성·설정됨 | [Solapi](https://console.solapi.com/dashboard) | `SIGNUP_SMS_VERIFICATION_ENABLED`, `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_SENDER_NUMBER` | `lib/sms.js`, 가입 API |
| Resend | 이메일 인증 예비 경로 | 비활성·Vercel 키 보관 | [Resend](https://resend.com/) | `SIGNUP_EMAIL_VERIFICATION_ENABLED`, `RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN`, `RESEND_FROM_EMAIL` | `lib/email-verification.js` |
| Toss Payments | 상품·광고·서비스 결제 승인 | 설정됨·운영 | [Toss Payments](https://developers.tosspayments.com/) | `TOSS_WIDGET_CLIENT_KEY`, `TOSS_WIDGET_SECRET_KEY` | `lib/toss-payments.js`, 결제 API·성공 페이지 |
| Meta Marketing API | 실종광고 자동 발행·상태 제어·피드 링크 | 설정됨·실광고 확인 이력 있음 | [Meta Ads Manager](https://adsmanager.facebook.com/) | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_APP_SECRET`, `META_PAGE_ID`, `META_API_VERSION` | `lib/meta-marketing.js` |
| Bizcall | 통화 요청 시 050 안심번호 임시 배정 | 활성·설정됨 | [Bizcall Partner](https://partners.050bizcall.co.kr/) | `BIZCALL_ENABLED`, `BIZCALL_API_BASE_URL`, `BIZCALL_INTERFACE_ID`, `BIZCALL_COLORING_ID`, `BIZCALL_ANNOUNCEMENT_ID`, `BIZCALL_ON_DEMAND_LEASE_HOURS` | `lib/bizcall.js`, 공개 안심번호 API |
| Web Push | 보호자 기기 Push·앱 배지 | 설정됨 | Vercel·브라우저 | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `lib/push.js`, Push API, `public/sw.js` |
| 위치정보 보호 | 위치 암호화·감사 해시·보존기간 | 활성·설정됨 | Vercel | `LOCATION_DATA_ENCRYPTION_KEY`, `LOCATION_AUDIT_HASH_KEY`(권장 분리), `LOCATION_RAW_RETENTION_HOURS` | `lib/location-security.js`, `lib/db.js` |
| 지도 | 지역 검색·발견 위치 링크 | 운영 | Nominatim, Kakao Map | 별도 검색 키 없음 | 지도 검색 API, 위치공유 로직 |

## OAuth 콜백 기준

대표 도메인 기준 콜백 주소:

- Google: `https://zezari.family/api/auth/callback/google`
- Kakao: `https://zezari.family/api/auth/callback/kakao`
- Naver: `https://zezari.family/api/auth/callback/naver`
- Facebook: `https://zezari.family/api/auth/callback/facebook`

기존 링크 호환 기간에는 `https://zezari.vercel.app/api/auth/callback/{provider}`도 공급자 콘솔에서 유지 여부를 확인한다.

## Vercel 환경변수 점검 결과

- Production과 Development에 Turso, OAuth, Solapi, Toss, Meta, Bizcall, VAPID 핵심 변수가 암호화 상태로 등록되어 있다.
- 이메일 인증은 `SIGNUP_EMAIL_VERIFICATION_ENABLED=false` 기준의 예비 경로다.
- SMS 인증은 `SIGNUP_SMS_VERIFICATION_ENABLED=true` 기준의 현재 가입 인증 경로다.
- Toss의 현재 소스는 `TOSS_WIDGET_CLIENT_KEY`, `TOSS_WIDGET_SECRET_KEY`를 사용한다. 구형 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`는 호환·정리 대상 여부를 별도로 판단한다.
- `LOCATION_AUDIT_HASH_KEY`가 없으면 위치 암호화키 또는 NextAuth 시크릿을 감사 해시 키로 사용한다. 장기 운영에서는 별도 키를 만들어 분리하는 것을 권장한다.

## 키 변경 시 영향

| 키 | 변경 영향 | 변경 기준 |
|---|---|---|
| `NEXTAUTH_SECRET` | 전체 로그인 세션 무효화, 인증 토큰 해시 영향 | 침해 의심 또는 계획된 점검창 |
| `TURSO_AUTH_TOKEN` | 앱의 DB 접속 중단 가능 | 새 토큰 등록 후 구 토큰 폐기 |
| OAuth Client Secret | 해당 SNS 로그인 중단 가능 | 공급자 콘솔과 Vercel 동시 교체 |
| Toss Secret Key | 결제 승인 중단 가능 | 테스트 결제 후 운영 전환 |
| Meta Access Token | 광고 발행·상태 변경 중단 가능 | 만료일·권한 월 1회 확인 |
| Solapi API Secret | SMS 인증 중단 가능 | 발송 테스트 후 구 키 폐기 |
| VAPID 키 | 기존 기기 Push 구독 재등록 필요 | 침해 시에만 교체 권장 |
| Bizcall IID·설정 | 050 배정·해제 중단 가능 | 공급자와 확인 후 교체 |
| 위치 암호화키 | 기존 위치 암호문 복호화 불가 | 마이그레이션 없이 변경 금지 |

## 정기 점검

- 매월: Vercel 오류 로그, Meta 토큰·광고계정, Solapi 잔액·발신번호, Bizcall 번호 가용성
- 분기: 관리자·공급자 계정 MFA와 복구수단, Turso·Vercel 접근자, API 키 불필요 권한
- 반기: OAuth 콜백, 결제 실거래·환불 흐름, DB 복구 절차, Push 재등록 흐름
- 즉시: 인력 변경, 키 노출, 비정상 결제·광고·문자 발송 발견 시 키 회전과 접근 회수
