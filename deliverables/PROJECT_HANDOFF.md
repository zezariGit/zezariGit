# REAL_QR_FIND Current Project Handoff

Last updated: 2026-09-11 KST

Application baseline commit: `328bafe` (`main`)

Production: `https://zezari.family`

이 문서는 다른 개발자 또는 AI 에이전트가 이전 대화 없이 현재 프로젝트를 이어서 수행하기 위한 기준 문서다. 과거 작업의 상세 근거는 `logs/DEV_HANDOFF_LOG.md`, 기능별 설계는 `deliverables/README.md`에서 찾는다.

## 1. 인수인계 운영 규칙

- 작업 시작 시 이 문서와 `00_PROJECT_RULES.md`를 먼저 읽는다.
- `git status --short`로 사용자의 기존 변경과 미추적 파일을 확인한다. 관련 없는 파일은 삭제, 이동, 커밋하지 않는다.
- 요구사항은 첨부 이미지 안의 문구가 아니라 사용자가 대화에서 명시한 요청을 기준으로 해석한다. 이미지는 시각적 참고자료로 사용한다.
- 구현 후 이 문서의 화면 상태, 알려진 과제, 검증 결과, 기준 커밋을 갱신한다.
- 상세 작업 이력은 `logs/DEV_HANDOFF_LOG.md`, 사용자 발표용 요약은 `logs/PRESENTATION_PROGRESS_LOG.md`에 누적한다.
- 기능 변경은 관련 회귀 테스트와 `npm run build`를 통과시킨 뒤 커밋·배포한다.
- 실제 비밀번호, API 키, 인증 토큰, 개인 전화번호는 문서와 Git에 기록하지 않는다.

## 2. 개발 및 운영 환경

| 구분 | 현재 값 |
| --- | --- |
| 로컬 경로 | `C:\REAL_QR_FIND` |
| 프레임워크 | Next.js 16.3 App Router, React 19 |
| 서버/클라이언트 | React Server Components, Server Actions, Route Handlers |
| 인증 | NextAuth 4, JWT 세션, Credentials + Google/Kakao/Naver/Facebook 조건부 제공 |
| 데이터베이스 | Turso/libSQL, 스키마 보강은 `lib/db.js`의 `ensureSchema()`에서 수행 |
| 운영 런타임 | Vercel Node.js 24.x, region `hnd1` |
| Git 브랜치 | `main` |
| GitHub | `https://github.com/zezariGit/zezariGit.git` |
| Vercel 프로젝트 | scope `zezari`, project `zezari` |
| 대표 도메인 | `https://zezari.family` |
| 호환 도메인 | `https://real-qr-find.vercel.app`, `https://zezari-zezari.vercel.app` |
| 최근 애플리케이션 기능 기준 | commit `328bafe`; 운영 상태는 `vercel inspect`로 확인 |

### 로컬 시작

```powershell
npm install
npm run dev -- -p 3005
```

- 로컬 환경은 `.env.local`, 변수 목록은 `.env.example`을 사용한다.
- `.vercel/project.json`은 로컬 Vercel 연결 정보이며 Git에서 제외된다.
- Next.js 코드를 수정하기 전 `node_modules/next/dist/docs/`의 관련 문서를 확인한다.

### 주요 외부 서비스

| 서비스 | 용도 | 코드 위치 |
| --- | --- | --- |
| Turso | 회원, 대상자, QR, 결제, 광고, 알림 등 운영 데이터 | `lib/db.js` |
| NextAuth | 일반/SNS 로그인과 장기 로그인 세션 | `lib/auth.js` |
| SOLAPI | 휴대전화 인증번호 발송 | `lib/sms.js` |
| Toss Payments | 상품·구독·광고 결제 | `lib/toss-payments.js`, `app/api/payments/toss/` |
| Meta Marketing API | 실종 광고 생성·상태 동기화 | `lib/meta-marketing.js` |
| Web Push/VAPID | 보호자 알림 | `lib/push.js`, `public/sw.js` |
| Bizcall | 보호자 안심번호 연결 | `lib/bizcall.js` |
| Resend | 비활성 기본값의 이메일 인증 대체 경로 | `lib/email-verification.js` |

환경변수 이름은 `.env.example`을 기준으로 한다. 운영값은 Vercel 환경변수에서 관리하며 출력하거나 문서화하지 않는다.

## 3. 소스 구조

| 경로 | 역할 |
| --- | --- |
| `app/page.js` | 로그인, 회원가입, 온보딩, 대시보드, 개발 미리보기 진입 분기 |
| `app/dashboard.js` | 보호자 대시보드, 설정 팝업, 대상자 미리보기·등록·수정·완료 화면 |
| `app/managed-subject-carousel.js` | 대상자 3명 단위 페이지와 추가 슬롯 |
| `app/notification-bell.js` | 대시보드 알림 팝오버 |
| `app/account/` | 보호자 정보, 쿠폰함, 광고 대시보드, 결제·서비스 현황 |
| `app/missing-report/` | 실종 광고 대상자 선택 |
| `app/ad-campaign-modal.js` | 광고 지역·거리·기간 설정 |
| `app/ads/checkout/[id]/` | 광고 결제 화면 |
| `app/find/[key]/` | QR 발견자 공개 화면, 위치 공유, 안심번호, 음성 재생 |
| `app/admin/` | 보호자, 대상자, QR, 결제, 광고, 상품, 쿠폰, 알림 등 관리자 기능 |
| `app/actions.js` | 보호자 화면 Server Actions |
| `app/admin/actions.js` | 관리자 Server Actions |
| `lib/db.js` | DB 스키마, 조회, 저장, 상태 전환의 중심 모듈 |
| `app/globals.css`, `css/gov-style.css` | 화면 스타일과 공통 디자인 토큰 |
| `public/assets/` | 사용자 제공·확정 UI 이미지 |
| `scripts/` | 회귀 테스트 및 운영 증빙 도구 |

## 4. 화면별 요구사항 및 구현 상태

상태 표기: `완료`는 소스·빌드·배포 반영, `조건부`는 구현됐지만 외부 승인 또는 실제 기기 검증이 남은 항목이다.

### 인증 및 온보딩

| 화면 | 누적 요구사항과 현재 동작 | 상태 |
| --- | --- | --- |
| 로그인 | 일반 로그인, SNS 간편 로그인, 아이디 찾기, 비밀번호 찾기 제공. 화면 하단 개인정보취급방침 문구 제거. 사용자가 로그아웃하기 전까지 JWT 세션 유지와 앱 재실행 세션 복구 적용 | 완료 |
| 아이디 찾기 | 휴대전화 인증 후 가입 아이디 확인. 로그인 화면에서 진입 가능 | 완료 |
| 비밀번호 찾기 | 휴대전화 인증 후 새 비밀번호 입력. 조건 안내는 새 비밀번호 바로 아래 회색 한 줄, 일치 안내는 확인 입력 아래 표시. 완료 버튼 하단 인증완료 문구 제거 | 완료 |
| 회원가입 | 휴대전화 인증, 정보 입력, 약관 동의, 완료 화면 제공. 완료 버튼 하단 인증완료 문구 제거. 약관 간격과 체크박스 높이를 본문 글자에 맞춤 | 완료 |
| 온보딩 3단계 | 좌우 스와이프, 페이지 점, 다시 보지 않기, 마지막 로그인 버튼 이미지 적용. 로그인 버튼 원본 비율과 모서리가 잘리지 않도록 표시 | 완료 |

### 보호자 대시보드

| 화면/영역 | 누적 요구사항과 현재 동작 | 상태 |
| --- | --- | --- |
| 상단 | 종·톱니바퀴 아이콘 동일 크기와 수평 정렬. 최종 크기는 확대안에서 약 35% 축소. 인사는 이름 대신 `안녕하세요, 보호자님!` 고정 | 완료 |
| 대상자 목록 | 등록순으로 3명씩 세로 표시하고 페이지 단위 좌우 스와이프. 행 전체 선택 시 대상자 미리보기 이동 | 완료 |
| 대상자 추가 슬롯 | 0명은 빈 상태와 `대상자 추가하기`; 1~2명은 마지막 대상자 아래 `+`; 3명은 다음 페이지에 `+`; 4명 이상은 마지막 대상자 다음 위치에 `+`. 대상자가 있으면 빈 상태 문구 미표시 | 완료 |
| 현재 상태 | 제목 크기와 물음표 아이콘 확대. 물음표 선택 시 `대상자 현재 상태 안내` 바텀시트 표시 | 완료 |
| 상태 안내 | 제공 이미지 `public/assets/dashboard/subject-status-guide.png`를 그대로 표시 | 완료 |
| 주요 메뉴 | 실종 신고, 상품 구매, 고객지원(제자리 카카오톡 채널) 이동 | 완료 |
| 알림 팝오버 | 종 아래 팝오버, 외부 선택·뒤로가기 닫기, 최신순, 내부 스크롤, 미읽음 초록 점/연녹색 배경, 선택 시 읽음 처리만 수행 | 완료 |
| 알림 이벤트 | 안전(위치 공유·안심번호), 온라인 광고, 결제·상품 이벤트를 중복 없이 저장·전송. 관리자 알림 설정과 연동 | 완료 |

### 대상자 정보

| 화면 | 누적 요구사항과 현재 동작 | 상태 |
| --- | --- | --- |
| 미리보기 | 뒤로가기, 대상자 정보, 전화·위치 공유·112·음성 영역, 보호자가 전하고픈 말 표시. 제공 이미지 자산을 배치하되 각 버튼 기능은 독립 유지. 보호자 메시지는 DB 입력값 출력 | 완료 |
| 미리보기 제한 | 보호자 화면의 전화·문자는 발견자 화면과 같은 모양이지만 비활성. 음성 미등록 시 음성 영역 자체를 숨김 | 완료 |
| 등록 | 사진 촬영/앨범 선택, 이름·생년월일·성별, 필수 200자 메시지, 선택 30초 음성 녹음. 녹음 중 등록 비활성, 필수값 유효 시 등록 활성 | 완료 |
| iOS 녹음 등록 | iOS 녹음 Blob 처리와 제출 안정화로 녹음 후 정보 초기화 없이 사진·입력·음성을 함께 저장하도록 보완 | 조건부: 실제 iOS 기기 회귀 권장 |
| 수정 | 기존 사진 표시·교체, 생년월일 드롭다운, 메시지·음성 재생/재녹음/삭제, 유효 필수값에서 수정 완료 | 완료 |
| 수정 화면 디자인 | 메시지와 음성 위치 교체, 제목을 `보호자가 전하고픈 말`로 변경, 안내 문구 크기·굵기 통일, 성별 `남성/여성`, 연락처 수정 안내를 최하단 한 줄로 표시 | 완료 |
| 등록 완료 | 제공된 QR 완료 이미지, 지정된 두 줄 안내, 상품 구매/대시보드 버튼 아이콘 삭제 및 텍스트 중앙 정렬 | 완료 |

### 설정 및 계정

| 화면 | 누적 요구사항과 현재 동작 | 상태 |
| --- | --- | --- |
| 설정 팝업 | 보호자 정보, 쿠폰함, 광고 대시보드, 결제 및 서비스 현황, 서비스 소개, 이용약관, 개인정보처리방침. 메뉴 간격 확대 및 로그아웃 위치 상향 | 완료 |
| 관리자 메뉴 | 관리자에게만 목록 마지막에 `관리자 화면` 표시 | 완료 |
| 보호자 정보 | 이름·생년월일 입력 테두리 통일. 유효한 변경이 있을 때만 수정 완료 활성, 원래 값 복원 시 비활성 | 완료 |
| 휴대전화 변경 | 일반 보호자는 3분 인증 필수. 관리자는 관리자 권한 확인 후 인증번호 없이 변경 가능 | 완료 |
| 아이디/SNS 표시 | 아이디 입력값은 그대로 표시하고, SNS 계정은 입력창 아래 `구글/네이버/카카오 로그인` 정보 표시. 일반 아이디 변경은 형식·중복확인 후 유효 | 완료 |
| 비밀번호 변경 | 현재 비밀번호 확인 후 새 비밀번호 입력 가능. 불일치 시 오류, 입력 초기화 및 영역 접힘. 새 비밀번호 정책과 확인 일치 시 변경 가능. 회원가입과 동일한 눈 아이콘 사용 | 완료 |
| 쿠폰함 | 코드 등록, 사용 가능/완료 목록, 사용완료 회색 스타일, 빈 목록 유지. 공백만 미입력 오류이며 길이와 무관하게 틀린 코드는 `유효하지 않은 쿠폰 코드입니다.` 표시 | 완료 |

### 광고 대시보드 및 실종 광고

| 화면/기능 | 누적 요구사항과 현재 동작 | 상태 |
| --- | --- | --- |
| 광고 목록 | 최신순 카드, 전체/진행 중/광고 완료 필터. 진행 중 필터에 `광고 검토 중`과 `진행 중` 포함 | 완료 |
| 광고 카드 | 포스터, 대상자, 지역, 기간, 금액, 도달 수, 상태 표시. 검토 중 도달 수는 `-` | 완료 |
| 상태별 버튼 | 검토 중과 완료는 버튼 없음. 진행 중은 `추가/종료`. 추가는 같은 대상자의 새 광고 설정, 종료는 환불 불가 확인 후 완료 전환 | 완료 |
| 실종신고 대상자 선택 | `/missing-report`에서 안전 상태 대상자를 선택하고 다음을 누르면 기존 광고 설정 모달로 이동. `HomePage -> GuardianDashboard -> DashboardTab -> AdCampaignModal`로 대상자와 새 광고 여부를 전달 | 완료 |
| 광고 설정 | 기존 거리·위치 범위 선택, 기간 선택, 선택 요약, 광고 이미지 미리보기, 결제 화면 이동을 재사용. 이 단계에서는 Meta API를 호출하지 않음 | 완료 |
| 관리자 상태 테스트 | 관리자 결제패스 광고는 Meta를 호출하지 않고 `광고 검토 중`으로 생성. 결제 완료 화면에서 광고 상태 테스트로 이동하고 관리자만 `진행 중` 전환 가능. 이후 기존 종료 기능으로 `광고 완료` 검증 가능 | 완료 |
| 실제 Meta 광고 | 일반 결제 광고는 기존 Meta 자동 발행 경로 유지 | 조건부: Meta 앱 권한·검수 승인 필요 |

### 관리자 및 운영 기능

| 영역 | 현재 동작 | 상태 |
| --- | --- | --- |
| 보호자 관리 | 보호자·대상자 조회/수정, 관리자에 의한 보호자 휴대전화번호 직접 수정 | 완료 |
| 탈퇴 처리 | 탈퇴 회원의 휴대전화번호를 제거하여 재사용 가능하도록 처리 | 완료 |
| 운영 그리드 | 상세 패널이 있는 보호자·상품·결제·쿠폰 등 목록은 행 전체 선택 및 키보드 선택 지원 | 완료 |
| QR/상품/결제/구독 | QR 생성·활성화·배정, 상품·디자인 관리, 결제/구독/배송/환불 관련 운영 기능 제공 | 완료 |
| 광고/알림 | 광고 가격·거리·기간·예산, 광고 상태, 관리자 알림·메시지 템플릿 관리 | 완료 |

관리자 세부 범위는 `deliverables/ADMIN_*.md`, 광고 세부 범위는 `deliverables/AD*.md` 및 `deliverables/META_*.md`를 참고한다.

### 공개 QR 발견자 화면

- `/find/[key]`에서 QR 상태와 연결 대상자를 확인한다.
- 보호자 안심번호 전화, 위치 공유, 발견 알림, 보호자 메시지, 등록된 경우 음성 재생을 제공한다.
- 위치정보 암호화·보관·접근·파기 정책은 `deliverables/location-service/LOCATION_SECURITY_COMPLIANCE.md`를 기준으로 한다.

## 5. 광고 상태 테스트 절차

Meta 권한 승인 전에도 관리자 계정으로 대시보드 상태를 검증할 수 있다.

1. 대시보드에서 `실종 신고`를 선택한다.
2. 안전 상태 대상자를 선택하고 지역·거리·기간을 설정한다.
3. 광고 결제 화면에서 관리자 전용 결제패스를 사용한다.
4. 결제 완료 화면의 `광고 상태 테스트하기`를 선택한다.
5. 광고 대시보드에서 `광고 검토 중`, 도달 수 `-`, 버튼 미표시, 진행 중 필터 포함을 확인한다.
6. 관리자 테스트 패널의 `진행 중으로 전환`을 선택한다.
7. 카드가 `진행 중`과 `추가/종료` 버튼을 표시하는지 확인한다.
8. `종료` 선택 후 환불 불가 확인 팝업을 거쳐 `광고 완료` 및 완료 필터를 확인한다.

관리자 테스트 광고는 `is_test_payment=1`, `meta_status=test_*`로 구분되며 Meta API에 발행되지 않는다. 실제 사용자 결제 광고와 매출 집계는 기존 운영 규칙을 따른다.

## 6. 로컬 미리보기 주소

미리보기 파라미터는 개발 환경에서만 활성화된다.

| 화면 | 주소 |
| --- | --- |
| 대시보드 | `http://localhost:3005/?preview=dashboard` |
| 대상자 없는 대시보드 | `http://localhost:3005/?preview=dashboard-empty` |
| 알림 팝오버 | `http://localhost:3005/?preview=dashboard-notifications` |
| 설정 팝업 | `http://localhost:3005/?preview=settings` |
| 실종 광고 설정 | `http://localhost:3005/?preview=ad-campaign` |
| 대상자 미리보기 | `http://localhost:3005/?preview=subject-preview` |
| 대상자 등록 | `http://localhost:3005/?preview=subject-registration` |
| 대상자 수정 | `http://localhost:3005/?preview=subject-edit` |
| 대상자 등록 완료 | `http://localhost:3005/?preview=subject-registration-complete` |
| 보호자 정보 | `http://localhost:3005/account/profile?preview=1` |
| SNS 보호자 정보 | `http://localhost:3005/account/profile?preview=1&provider=google` |
| 쿠폰함 | `http://localhost:3005/account/coupons?preview=1` |
| 광고 대시보드 | `http://localhost:3005/account/ads?preview=1&testAd=preview-review` |
| 광고 진행 필터 | `http://localhost:3005/account/ads?status=running&preview=1&testAd=preview-review` |
| 광고 완료 필터 | `http://localhost:3005/account/ads?status=done&preview=1` |

## 7. 테스트 명령

### 필수 공통

```powershell
npm run build
npm run security:check
git diff --check
```

### 기능별 회귀 테스트

| 명령 | 범위 |
| --- | --- |
| `npm run test:login-ui` | 로그인 UI |
| `npm run test:login-id-recovery` | 아이디 찾기 |
| `npm run test:password-reset` | 비밀번호 재설정 API/DB |
| `npm run test:password-reset-ui` | 비밀번호 재설정 UI |
| `npm run test:signup-phone-ui` | 회원가입 휴대전화 단계 |
| `npm run test:signup-profile-ui` | 회원가입 정보·약관 단계 |
| `npm run test:social-link` | SNS 계정 연결 |
| `npm run test:onboarding` | 온보딩 |
| `npm run test:dashboard-ui` | 보호자 대시보드 |
| `npm run test:notifications` | 알림 팝오버·이벤트 |
| `npm run test:subject-flow` | 대상자 등록·수정·미리보기 |
| `npm run test:guardian-profile-ui` | 보호자 정보 |
| `npm run test:coupon-registration` | 쿠폰 등록 오류 분류 |
| `npm run test:ad-dashboard` | 광고 상태·필터·버튼·테스트 전환 |
| `npm run test:admin-phone-otp` | 관리자 휴대전화 인증 예외 |
| `npm run test:admin-grid` | 관리자 행 전체 선택 |
| `npm run test:push` | Push 구독·아이콘·서비스 워커 |
| `npm run test:qr-claim` | 외부 판매 QR 선점·가입 연결 |
| `npm run test:sms-provider` | SOLAPI 응답 처리 |

DB를 변경하거나 실제 SMS·결제·Meta 요청을 발생시키는 운영 검증은 테스트 대상과 부작용을 확인한 뒤 진행한다.

## 8. GitHub 및 Vercel 배포 절차

```powershell
git status --short
git diff --check
npm run build
git add -- <이번 작업 파일만>
git commit -m "<작업 내용>"
git push origin main
vercel --prod --yes
vercel inspect <deployment-url>
curl.exe -sS -o NUL -w "%{http_code}" -L https://zezari.family/
```

- 사용자의 관련 없는 변경이나 미추적 파일을 커밋하지 않는다.
- 배포 성공 기준은 Vercel `READY`, 대표 도메인 HTTP 200, 관련 화면 확인이다.
- 배포 직후 가능하면 `vercel logs <deployment-url> --level error --since 1h`로 오류를 확인한다.
- 최근 애플리케이션 배포 기준은 이 문서 상단의 커밋과 배포 ID를 갱신한다.

## 9. 알려진 외부 과제 및 검증 경계

- Meta: 실제 광고 발행은 앱 검수, Marketing API 권한, 광고계정·페이지 연결과 유효한 토큰이 필요하다. 관리자 테스트 광고는 이를 우회해 UI 상태만 검증한다.
- Naver: 재검수 승인 후 비회원 최초 가입과 재로그인을 운영에서 확인해야 한다.
- Kakao: 대표 도메인 콜백과 최초 가입·재로그인 운영 검증이 필요하다.
- Facebook: 운영 콜백, 권한, 앱 모드와 최초 가입·재로그인 검증이 필요하다.
- iOS: 음성 등록 안정화 코드는 반영됐지만 Safari/PWA 실제 기기에서 권한 허용, 30초 녹음, 저장 후 재생을 다시 확인하는 것이 좋다.
- Push: 운영체제 알림 차단, 집중 모드, 브라우저 데이터 삭제는 웹 앱에서 강제로 복구할 수 없다. iOS Push는 홈 화면 설치가 필요하다.
- 실제 결제, 문자 발송, 광고 종료, 개인정보 수정은 운영 데이터를 바꾸므로 자동 검증에서 임의 실행하지 않는다.

상세 대기 항목은 `deliverables/FOLLOW_UP_TASKS.md`를 함께 갱신한다.

## 10. 최근 핵심 변경 이력

| 커밋 | 내용 |
| --- | --- |
| `328bafe` | 실종신고 대상자 선택 후 기존 거리·기간 광고 설정 화면 연결 복구 |
| `dd1218e` | Meta 독립 관리자 광고 상태 테스트와 광고 대시보드 검증 |
| `8aa8114` | 짧은 오입력도 유효하지 않은 쿠폰 코드로 분류 |
| `766f16c` | 보호자 아이디 유지 및 하단 SNS 로그인 정보 표시 |
| `1ffe259` | 현재 비밀번호 확인 기반 보호자 비밀번호 변경 |
| `f2938af` | 설정 메뉴 간격과 로그아웃 위치 조정 |
| `1977c55` | iOS 대상자 음성 등록 저장 안정화 |
| `9d02494` | 대상자 수정 폼 순서·문구·가독성 개선 |
| `bc26cdc` | 대상자 미리보기 뒤로가기 추가 |
| `3aea2cc` | 대상자 미리보기 제공 이미지 재배치와 실제 메시지 출력 |
| `1dba265` | 대상자 수별 대시보드 추가 슬롯 배치 |
| `36b3e24` | 회원가입 약관 체크박스 높이 축소 |
| `4b109e2` | 비밀번호 찾기 안내 배치 수정 |
| `6fe8935` | 탈퇴 번호 정리 및 관리자 보호자 번호 수정 |
| `3ad108b` | 설정의 관리자 화면 메뉴 추가 |
| `ad4ebcf` | 관리자 본인 휴대전화 무인증 수정 |
| `5cc5911` | 로그인 아이디 찾기 및 세션 유지 개선 |
| `6272582` | 광고 대시보드 카드·필터·종료 확인 구현 |
| `57fc569` | 알림 팝오버와 이벤트 알림 구현 |
| `5277fc6` | 보호자 대시보드 개편 |

## 11. 다음 에이전트 체크리스트

1. 사용자 최신 요청과 이 문서의 상태가 충돌하면 최신 요청을 우선한다.
2. 관련 화면과 서버 동작을 먼저 읽고 기존 패턴을 유지한다.
3. 첨부 이미지를 사용하라는 요청은 원본 파일을 `public/assets/`의 의미 있는 경로로 복사해 사용하고 비율·잘림을 브라우저에서 확인한다.
4. 인증·권한·결제·개인정보 변경은 서버에서 다시 검증한다.
5. 기능별 테스트와 빌드, 모바일/데스크톱 화면을 확인한다.
6. 변경 파일만 커밋하고 GitHub/Vercel 요청이 있으면 배포 결과까지 확인한다.
7. 이 문서와 두 누적 로그를 갱신해 다음 작업자에게 상태를 넘긴다.
