# Official Deliverables

This folder stores official implementation outputs for the REAL_QR_FIND project.

## Deliverable Policy
- Requirements documents, architecture notes, API designs, database designs, screen plans, test reports, release notes, and deployment notes should be stored here.
- Each development phase should create or update a deliverable when meaningful.
- Visual material prompts should be stored under `image_prompts/`.

## Current Deliverables
- `image_prompts/IMAGE_PROMPTS.md`: cumulative prompt archive for diagrams and generated visuals.
- `INTEGRATION_SETUP.md`: Vercel and Turso integration status and setup guide.
- `AUTH_SETUP.md`: Google login/signup setup requirements and environment variable plan.
- `AUTH_SESSION_PERFORMANCE.md`: canonical-domain login policy, 90-day active session refresh, Vercel/Turso region correction, and production timing evidence.
- `AUTH_PHONE_VERIFICATION.md`: active Solapi SMS verification for signup and guardian phone changes, one-time token rules, DB schema, and operations.
- `AUTH_EMAIL_VERIFICATION.md`: disabled Resend email-code fallback retained for controlled rollback.
- `PWA_SETUP.md`: installable web app setup for desktop and mobile.
- `ONBOARDING_FLOW.md`: three-page service introduction and skip behavior.
- `DATABASE_SCHEMA.md`: Turso schema for guardians and subjects.
- `ADMIN_SETUP.md`: admin page access, guardian activation, and subject lookup behavior.
- `UI_STYLE_GUIDE.md`: gov-style design base and future page styling rules.
- `QR_MANAGEMENT.md`: QR generation, unique URL strings, admin activation, and public find URL behavior.
- `QR_EXTERNAL_SALES_ONBOARDING.md`: administrator-selected store-sale QR reservation, two-hour signup claim, mandatory first-subject registration, and exact scanned-QR matching.
- `QR_SUBSCRIPTION_HOLD.md`: subject-level QR activation controls, 24-hour grace rule, and subscription end-date credit logic.
- `TOSS_PAYMENTS_SETUP.md`: Toss Payments subscription payment foundation and callback flow.
- `ADMIN_PAYMENT_PASS.md`: admin-only product, subscription, and advertisement payment bypass with server authorization and test-revenue isolation.
- `PREPAID_PASS_PAYMENT.md`: one-time Toss payment, QR-based pass activation, renewal, pause/resume, expiry, and privacy rules.
- `PUSH_NOTIFICATION_SETUP.md`: guardian browser push registration and QR find-page notification flow.
- `PUBLIC_GUARDIAN_VOICE_PLAYBACK.md`: public QR page guardian voice playback button, states, access conditions, and privacy notes.
- `BIZCALL_SAFE_PHONE_INTEGRATION.md`: Bizcall 050 issuance/remapping flow, guardian sync states, privacy rules, and server-only environment variables.
- `BIZCALL_SAFE_PHONE_POOL.md`: call-time Bizcall auto assignment, one-hour expiry, concurrency controls, privacy, administrator history, and real API verification.
- `BIZCALL_ON_DEMAND_CALL_ASSIGNMENT.md`: concise handoff pointer for the active provider-managed allocation architecture.
- `PRIVACY_POLICY_PAGE.md`: user-facing privacy policy route, footer-link placement, current data handling scope, and maintenance rules.
- `ADVERTISING_SETUP.md`: dashboard subject advertisement modal, admin daily rate, advertisement progress foundation, and Meta API preparation.
- `META_AD_PUBLISHING.md`: browser-captured ad creative, Meta image/campaign/ad-set/creative/ad publishing flow, readiness checks, and remaining Page requirement.
- `META_AD_AUTOMATION.md`: Korean city-label targeting, guardian-revenue/Meta-budget separation, automatic post-payment publication, and retry behavior.
- `META_AD_LINK_ACCESS.md`: mobile-friendly managed-subject destination links, Meta shareable preview storage, and guardian dashboard access.
- `AD_PRICING_MANAGEMENT.md`: administrator billing-day/radius price policy, guardian date/radius quote flow, server calculation, and Toss amount validation.
- `AD_DISTANCE_DURATION_OPTIONS.md`: administrator-managed distance/duration option grids and the guardian distance, duration, summary, and payment flow.
- `ADMIN_AD_MARGIN_BUDGET.md`: administrator margin-rate setting, guardian-payment-based Meta lifetime budget, per-ad snapshots, and legacy budget compatibility.
- `ADMIN_DASHBOARD_OPERATIONS_REVAMP.md`: operations-style admin dashboard with overview cards, trend chart, recent tables, order/ad/subscription/sales panels.
- `GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`: operations-style guardian management screen with status cards, extended filters, dense grid, detail panel, and CSV export additions.
- `ADMIN_AD_GRID_MANAGEMENT.md`: admin advertisement grid, selected-row actions, detail panel, click-count schema placeholder, and Meta API readiness.
- `ADMIN_MISSING_REPORT_MANAGEMENT.md`: admin missing-report menu, date/search filters, status mapping, and grid behavior.
- `LOCATION_SHARE_MANAGEMENT.md`: public QR location-share button, guardian push map links, `location_shares` table, and admin location-share grid/detail management.
- `ADMIN_SUBSCRIPTION_MANAGEMENT.md`: admin subscription grid, search filters, two-tab detail card, admin memo storage, and scroll behavior.
- `ADMIN_PAYMENT_EXPORT_MANAGEMENT.md`: admin payment ledger grid, product/pass/ad payment data source, and Excel-compatible CSV exports for admin grids.
- `PRODUCT_DESIGN_CATALOG.md`: product design-level image/detail-page management, order design linkage, and admin/user shop flow.
- `DYNAMIC_PRODUCT_CATALOG.md`: administrator-managed purchase products, dynamic selectbox linkage, and on-demand long detail-page images.
- `SHOP_PRODUCT_SELECTION.md`: guardian-first product purchase flow with seven product combinations and twelve zodiac design options.
- `PRODUCT_INCLUDED_QR_SERVICE.md`: product-price checkout with automatic continuing QR service access and legacy period-subscription compatibility.
- `PRODUCTION_AUTHENTICATED_BROWSER_TEST_2026-07-30.md`: authenticated production browser test across guardian, public QR, purchase, advertising, and all administrator screens.
- `CUSTOM_DOMAIN_SETUP.md`: `zezari.family` production-domain setup, dual-domain compatibility, QR migration, and OAuth callback checklist.
- `OAUTH_CALLBACK_SETUP.md`: Google and Naver dual-domain callback registration, live provider-entry verification, and Naver review-state note.
- `NAVER_LOGIN_REVIEW_RESUBMISSION.md`: Naver rejection fixes, passwordless first-signup flow, review screenshots, submitted explanation, and re-review status.
- `FOLLOW_UP_TASKS.md`: cumulative deferred work checklist, including remaining Naver, Kakao, and Facebook production login verification.
- `location-service/`: 공식 HWPX 양식 순서를 반영한 위치기반서비스 사업계획서 원고, HWP·HWPX·PDF·DOCX, 보호조직·데이터흐름·설비 구조도와 재생성 안내.
- `location-service/LOCATION_SECURITY_COMPLIANCE.md`: 위치정보 암호화, 자동 파기, 단계별 최소권한, 취급대장·접근기록과 제출 증빙 대응표.
- `location-service/MAJOR_EQUIPMENT_INVENTORY.md`: Vercel·Turso·GitHub 운영 메타데이터로 작성한 주요설비와 설치장소 제출 기재안.
- `location-service/REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.docx|pdf`: 기존 사업계획서에 보안 검토 요청사항과 구현 화면을 누적한 제출 검토본.
- `ADMIN_COUPON_MANAGEMENT.md`: admin coupon ledger, discount conditions, issue limits, status management, and user coupon registration validation.
- `ADMIN_NOTIFICATION_MANAGEMENT.md`: admin notification/message grid, right-side compose panel, push delivery action, and delivery result tracking.
- `ADMIN_MESSAGE_TEMPLATE_MANAGEMENT.md`: admin message template grid, locked automatic templates, push/KakaoTalk channel settings, and template seed data.
- `USER_MANUAL.md`: Google Docs user manual link, coverage, and maintenance rule.
- `MAINTENANCE_REQUEST_SHEET.md`: Google Sheets maintenance request template, tester workflow, status definitions, and privacy rules.
- `SECURITY_HARDENING_REVIEW_2026-08-14.md`: 운영 소스 보안 점검 범위, 취약점 개선 조치, 검증 결과와 잔여 운영 과제.
- `operations/OPERATIONS_ARCHITECTURE.md`: Vercel·Turso·GitHub 구조, 외부 서비스 연결, 배포·장애 대응·백업 기준을 정리한 운영 총괄 문서.
- `operations/SERVICE_CONFIGURATION_REGISTER.md`: OAuth, Solapi, Toss Payments, Meta, Bizcall, Push 등 서비스별 환경변수와 운영상태 대장.
- `operations/ACCOUNT_ACCESS_REGISTER.md`: 로그인 URL, 계정 식별자, MFA·복구·비밀번호 관리자 항목을 관리하는 무비밀 접근대장.
- `operations/DEVELOPMENT_PROFILE_SWITCHER_DESIGN.md`: 프로젝트별 GitHub·Vercel·DB·Codex·VS Code·브라우저 계정을 한 번에 분리 실행하는 Windows 전환 프로그램 설계.
- `operations/DEVELOPMENT_PROFILE_SWITCHER_IMPLEMENTATION.md`: PowerShell GUI, Windows EXE, `dev` 명령, 기존/신규 프로젝트 등록, 계정 분리와 실제 ZEZARI·STOCK 설정 사용 설명서.
- `USER_DASHBOARD_BLACK_THEME.md`: 검정색 공통 테마, 상단 탭 제거, 3명 단위 가로 스와이프와 관리대상 추가 진입 구조.
- `USER_DASHBOARD_SUBJECT_PREVIEW.md`: 대시보드 단일 상태 판정, 보호자 전용 대상자 미리보기·수정 경로, 마이페이지 대상자 메뉴 제거와 아이콘 개편.
- `USER_GREEN_THEME_INTERACTIONS.md`: 초록색 공통 디자인 토큰, 고객지원 퀵 버튼, 상태 배지별 상품구매·QR 활성화 이동, 알림 상세 범용 이동 버튼 제거 규칙.
- `GLOBAL_GREEN_DESIGN_SYSTEM.md`: 전 화면에 적용하는 확정 초록·중립·상태 HEX 값, 서체, 포커스, 카드·입력창·버튼과 모바일 검증 기준.
- `IMAGE_UPLOAD_MANAGEMENT.md`: 보호자·관리대상 사진의 DB 기반 용량 제한, 관리자 설정, 서버 검증, 사용자 초과파일 알림과 팝업 성능 개선.
- `SHOP_LOADING_PERFORMANCE.md`: 상품구매 진입의 중복 DB 조회 제거, Base64 이미지 지연 로드, 전용 이미지 캐시 경로와 성능 계측 결과.
- Current UI feedback pattern: submit buttons show inline progress bars, and server actions show bottom status messages via `notice` query parameters.

## Planned Deliverables
- Requirements specification
- System architecture document
- Database schema document
- API specification
- UI/UX screen flow
- Security and privacy checklist
- Test plan and test report
- Deployment guide
