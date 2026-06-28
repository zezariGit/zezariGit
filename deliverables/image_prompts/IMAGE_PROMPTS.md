# Image Generation Prompts

This file accumulates prompts for diagrams, visual assets, and presentation images needed for the REAL_QR_FIND project.

## 2026-06-12 - Initial Project Concept Visual

### Purpose
- Presentation image for the start of a real QR-based people-finding project.

### Prompt
Create a clean professional system-concept illustration for a project named "REAL_QR_FIND". Show a QR code connecting a finder, a protected user profile, location/contact workflow, and an administrator dashboard. The style should be modern, trustworthy, civic-tech inspired, with clear Korean public-service presentation aesthetics. Use blue, green, white, and neutral gray tones. Avoid cartoon style. Include abstract flow arrows, mobile phone UI, database/security shield, and notification elements. No real personal data.

### Notes
- Use this only as a concept image, not as a final UI design.

## 2026-06-14 - QR Generation And Find URL Flow

### Purpose
- Presentation diagram for the QR code lifecycle now implemented in the admin system.

### Prompt
Create a professional Korean civic-tech flow diagram for "REAL_QR_FIND" showing an administrator generating unique QR codes, storing QR labels and URL-safe public keys in a secure database, printing or distributing QR codes, and a finder scanning a QR that opens a public URL like `/find/{unique-key}`. Include active/inactive status controls, a database table concept, QR image cards, and a mobile find page. Use the same public-service visual style as a Korean government web service: clean white surfaces, blue accents, green success states, red inactive warning states, and clear arrows. Avoid real personal data and avoid cartoon exaggeration.

### Notes
- Use for presentation material explaining how QR records connect to public people-finding URLs.

## 2026-06-14 - Admin Role Management Flow

### Purpose
- Presentation diagram for managing administrators from registered guardian users.

### Prompt
Create a clean Korean public-service style system diagram for "REAL_QR_FIND" administrator role management. Show Google login leading to registered guardian users, a database field `guardians.is_admin`, and an admin page tab labeled "관리자 관리" where an existing admin grants or revokes administrator role for a guardian. Also show environment-based base admins as protected access outside the database. Use white cards, blue civic-tech accents, green enabled states, and neutral gray database/security icons. Avoid real personal information.

### Notes
- Use for explaining the difference between base admins from environment variables and DB-admin users granted through the admin page.

## 2026-06-15 - Multi-Provider Social Login

### Purpose
- Presentation diagram for Google, Kakao, and Naver login support.

### Prompt
Create a clean Korean public-service style architecture diagram for "REAL_QR_FIND" social login. Show three login buttons with recognizable Google, Kakao, and Naver brand colors, each connecting through OAuth callbacks to `/api/auth/callback/google`, `/api/auth/callback/kakao`, and `/api/auth/callback/naver`. Show NextAuth issuing a session, then the app loading the guardian dashboard and Turso database profile. Include a note that providers are enabled when client ID and client secret environment variables are configured. Use white surfaces, blue civic-tech accents, and simple secure-auth icons. Avoid real personal data.

### Notes
- Use when presenting the expanded login/signup foundation.

## 2026-06-15 - Toss Payments Subscription Flow

### Purpose
- Presentation diagram for the first Toss Payments subscription payment flow.

### Prompt
Create a clean Korean civic-tech architecture diagram for "REAL_QR_FIND" Toss Payments subscription billing. Show a logged-in guardian dashboard with a "구독결제하기" button next to "현재 상태", the browser loading Toss Payments V2 SDK with a client key, card billing authentication, redirect to success/fail URLs, server-side secret key API calls to issue a billing key and approve the first subscription payment, and the Turso `subscriptions` table updating to `구독중`. Use white cards, public-service blue accents, Toss Payments blue, secure server/database icons, and clear arrows. Avoid real card data, real secrets, or personal information.

### Notes
- Use for explaining why the secret key stays on the server and why subscription status is updated only after server-side Toss API success.

## 2026-06-15 - Subscription Plans And Pause Resume

### Purpose
- Presentation diagram for subscription option pricing and user pause/resume.

### Prompt
Create a clean Korean public-service style product flow diagram for "REAL_QR_FIND" subscription management. Show an admin page tab "결제 관리" where an administrator edits prices for 1개월, 3개월, and 6개월 plans. Show a guardian dashboard "현재 상태" area with a plan selector, "구독결제하기", "구독중", "일시정지", "일시정지중", and "재개" states. Include a Turso `subscription_plans` table and `subscriptions` table, plus a Toss Payments billing-key payment flow. Use white surfaces, civic blue accents, Toss blue, green active states, yellow paused states, and clear arrows. Avoid real payment data or secrets.

### Notes
- Use for explaining that plan prices are controlled by admin and service pause/resume is separate from billing-key deletion.

## 2026-06-15 - Subject QR Matching And Guardian Push Alert

### Purpose
- Presentation diagram for matching one QR code to each managed subject and sending guardian push alerts from the public find page.

### Prompt
Create a clean Korean public-service style system flow diagram for "REAL_QR_FIND" showing a guardian with up to four managed subjects, each subject matched to one unique QR code. Show a finder scanning `/find/{unique-key}`, viewing the managed subject profile and guardian contact information, then pressing "보호자에게 알리기". Show the server sending a Web Push notification to the logged-in guardian's installed web app with the message "{관리대상 이름}을 찾았습니다". Include Turso tables `subjects`, `guardians`, `qr_codes`, and `push_subscriptions`, with arrows showing one subject to one QR assignment. Use white surfaces, civic blue accents, green active states, and clear privacy/security symbols. Avoid real personal information.

### Notes
- Use for explaining the one-subject-one-QR assignment rule and the push notification path from public QR page to guardian device.

## 2026-06-15 - Admin QR Filtering And Manual Matching

### Purpose
- Presentation diagram for the administrator's QR filtering and manual QR-to-subject matching controls.

### Prompt
Create a clean Korean public-service style admin workflow diagram for "REAL_QR_FIND" QR management. Show an admin page with filters for "전체/매칭됨/미매칭" and "전체/활성/비활성", QR cards with QR image, unique code, URL, active state, assigned guardian, and assigned managed subject. Show controls for "매칭 저장", "매칭 변경", "매칭 해제", and "활성화/비활성화". Include a Turso database relationship where one QR can be assigned to one managed subject, and changing a match moves the subject away from the old QR. Use white surfaces, civic blue accents, green active states, red inactive states, and clear database arrows. Avoid real personal data.

### Notes
- Use for explaining the manual operations administrators can perform after QR generation.

## 2026-06-15 - QR Search Matching And Guardian QR Download

### Purpose
- Presentation diagram for improved QR matching search and guardian-side assigned QR visibility.

### Prompt
Create a clean Korean public-service style product workflow diagram for "REAL_QR_FIND" showing an admin QR management page where each QR card has a "대상 조회" search flow. Show the admin typing guardian name/email and managed subject name, viewing only unmatched managed subjects, selecting one, and assigning it to the QR. Show that already matched subjects do not appear until "매칭 해제" is used. Also show QR images being clickable/downloadable in the admin page and visible/downloadable in the guardian user screen for matched subjects. Use white surfaces, civic blue accents, green matched states, gray unmatched states, red inactive states, and Turso database relationship arrows. Avoid real personal data.

### Notes
- Use for presenting the reason search replaced the large select box.

## 2026-06-15 - QR Matching Modal UX

### Purpose
- Presentation or UI design reference for the cleaner modal-based QR matching workflow.

### Prompt
Create a polished Korean public-service admin UI mockup for "REAL_QR_FIND" QR management. Show QR cards with clean aligned text, QR image, active/inactive state, and simple action buttons. For an unmatched QR card, show only a "매칭대상 조회" button. When clicked, show a centered modal overlay with the background dimmed and disabled. Inside the modal, show guardian search input, managed subject search input, a "조회" button, and a list of only unmatched managed subjects with "선택 매칭" buttons. For a matched QR card, hide the matching lookup button and show only "매칭 해제". Use restrained Korean government-style UI, white panels, civic blue accents, green active states, red inactive states, clear spacing, and no overflowing text. Avoid real personal data.

### Notes
- Use for refining the QR management UX and explaining why only one modal should be open at a time.

## 2026-06-15 - Subject Advertisement Modal And Admin Pricing

### Purpose
- Presentation diagram for subject-level advertisement requests, daily-rate pricing, and future Meta API integration.

### Prompt
Create a clean Korean public-service style product and system workflow diagram for "REAL_QR_FIND" advertisement management. Show a guardian dashboard with four managed subject cards, each having an "광고" button. Show one centered modal overlay with the background dimmed and disabled, containing advertising region, start date, end date, calculated days, admin daily rate, and total estimated amount. Show active advertisement controls "일시정지", "광고 재개", and "광고끝내기". On the admin side, show an "광고 관리" tab where the daily advertising unit price is edited and a grid lists user advertisement progress by guardian, managed subject, region, period, amount, status, and Meta API pending state. Include Turso tables `ad_settings` and `subject_ads`, plus a future Meta API box connected by dashed arrows. Use restrained Korean government-style UI, white panels, civic blue accents, green active states, yellow paused states, red ended states, and no real personal data.

### Notes
- Use when explaining that the current implementation prepares internal ad status and pricing before Meta API credentials are connected.

## 2026-06-20 - Admin Order And Shipping Operations

### Purpose
- Presentation diagram for the e-commerce order and delivery workflow added to REAL_QR_FIND.

### Prompt
Create a clean Korean public-service style admin operations diagram for "REAL_QR_FIND". Show a customer completing a Toss payment, an order moving through the states "결제 확인 전", "배송 준비", "배송 중", and "배송 완료", and an administrator using a dense order management screen to search orders, filter payment and delivery states, review product and recipient information, select a Korean carrier, enter a tracking number, and save an internal memo. Show automatic shipped and delivered timestamps and a bell notification sent to the guardian when delivery begins or completes. Include the Turso `product_orders` table with fulfillment status, carrier, tracking number, recipient snapshot, admin memo, shipped time, and delivered time. Use restrained civic blue, green success, amber pending, and red cancelled states, white work surfaces, compact operational layout, and no real personal data.

### Notes
- Use for presenting the separation between payment status and fulfillment status.

## 2026-06-23 - Legacy OAuth And Toss Migration

### Purpose
- Presentation diagram for migrating the legacy zezari WordPress authentication and payment configuration into REAL_QR_FIND.

### Prompt
Create a clean Korean civic-tech system migration diagram for "REAL_QR_FIND". On the left, show a legacy WordPress site using mshop-members OAuth for Kakao and Naver and a WooCommerce Toss Payments gateway. In the center, show a secure migration layer that extracts only configuration names and encrypted environment values while explicitly excluding the WordPress SQL dump, production secrets, and personal data from Git. On the right, show the Next.js app at zezari.vercel.app using NextAuth callbacks for Kakao and Naver, social signup profile completion, and Toss Payments SDK v2 flows for card billing subscriptions plus card, bank transfer, and virtual account product purchases. Include server-side checks for guardian ownership, order ID, amount, payment status, and idempotency. Use restrained blue, green, amber, and red status colors, white work surfaces, compact architecture labels, and no real credentials or personal data.

### Notes
- Use when explaining what was migrated from configuration and what was intentionally not copied.

## 2026-06-24 - Prepaid QR Pass Payment And Activation

### Purpose
- Presentation diagram for the one-time Toss payment, subject-specific QR activation, renewal, pause/resume, expiry, and privacy flow.

### Prompt
Create a polished Korean civic-tech flow diagram for "REAL_QR_FIND" prepaid QR safety passes. Show a guardian selecting a managed subject and a 1, 3, or 6 month pass, completing one-time payment through Toss Payments Widget, receiving a QR product, scanning the exact QR assigned to the ordered subject, and starting the pass only after QR activation. Add renewal extending from the current expiry date, pause freezing the remaining period, resume extending the expiry by the paused duration, and expired or paused states hiding all personal information on the public QR page. Include Next.js, Toss Payments confirm API, Turso tables `product_orders`, `subscriptions`, `subjects`, and `qr_codes`, plus server checks for guardian ownership, order ID, amount, payment status, and subject-to-QR match. Use white work surfaces, civic blue, green active, amber ready or paused, red expired, compact Korean labels, and no real credentials or personal information.

### Notes
- Use when explaining why the service no longer requires an automatic-billing contract and how public QR privacy follows the paid period.

## 2026-06-25 - Admin Advertisement Grid Management

### Purpose
- Presentation diagram for the admin advertisement grid, selected-row operations, and future Meta Ads API readiness.

### Prompt
Create a clean Korean civic-tech admin UI diagram for "REAL_QR_FIND" advertisement management. Show a left admin sidebar, an advertisement daily-rate panel, a dense advertisement grid with columns "광고 번호, 관리대상, 보호자, 상태, 광고지역, 광고기간, 광고비, 클릭수", top action buttons "광고승인, 광고정지, 광고재개, 광고상세정보", and a right detail panel with Meta API placeholders for campaign ID, API status, and click count. Use white surfaces, civic blue accents, green advertising, amber paused, gray expired states, compact Korean labels, and no real personal data.

### Notes
- Use when presenting the conversion from card-style advertisement management to a grid-style operations screen for future Meta Ads API control.

## 2026-06-25 - Admin Missing Report Management

### Purpose
- Presentation diagram for the new administrator missing report management menu and grid.

### Prompt
Create a clean Korean civic-tech admin UI diagram for "REAL_QR_FIND" missing report management. Show a left admin sidebar with "실종신고 관리" selected, a date-range filter for "신고일시", a search input, and a dense grid with columns "신고일시, 대상자, 보호자, 신고상태, 광고상태, 발견여부". Include example status chips for "신고 접수", "광고 진행 중", "발견 완료", "종료 완료", advertisement chips "광고중/정지중/만료", and found state chips "미발견/발견/미확인". Use white work surfaces, civic blue accents, red missing, green found, amber paused, gray completed states, compact Korean labels, and no real personal data.

### Notes
- Use when explaining how the admin can monitor online missing reports separately from advertisement management.

## 2026-06-25 - Public QR Location Share And Admin Location Management

### Purpose
- Presentation diagram for QR finder location sharing, guardian push map links, and administrator location-share history management.

### Prompt
Create a clean Korean civic-tech admin and public QR workflow diagram for "REAL_QR_FIND" location sharing. Show a finder scanning `/find/{QR key}`, pressing "위치공유", granting mobile location permission, and sending a guardian push notification with Kakao and Naver map links. Show the administrator left sidebar with "위치공유 관리" selected, a date/search filter, a dense grid with columns "공유일시, 대상자, 보호자, 발견자 연락처, 주소, 위도, 경도", and a right detail panel with a map preview and coordinates. Include Turso table `location_shares`, Web Push, and privacy notes that raw guardian phone numbers are not exposed. Use white work surfaces, civic blue accents, purple location pins, green successful share states, compact Korean labels, and no real personal data.

### Notes
- Use when explaining that QR finders can share location only after browser permission and that administrators can audit the history without exposing the guardian's raw private phone number.

## 2026-06-26 - Admin Payment Ledger And Excel Exports

### Purpose
- Presentation diagram for the administrator payment ledger and Excel-compatible downloads across admin grids.

### Prompt
Create a clean Korean civic-tech admin UI diagram for "REAL_QR_FIND" payment and operations export management. Show a left admin sidebar with "결제 관리" selected, a top filter row with "통합 검색", a category select for "전체/이용권/상품/광고", a purple "조회" button, a reset button, and an "엑셀 다운로드" button. Show a dense payment ledger grid with columns "결제번호, 보호자, 대상자, 구분, 결제수단, 결제금액, 결제일". Add small connected callouts showing that the same Excel-compatible CSV export exists on 보호자 관리, 관리대상자 관리, QR 관리, 주문/배송, 광고 관리, 실종신고 관리, 위치공유 관리, and 고객문의 grids. Include Turso data sources `product_orders` and `subject_ads`, and note that ad payment rows are prepared for future external ad payment/API integration. Use white work surfaces, civic blue table headers, restrained purple action buttons, compact Korean labels, and no real personal data.

### Notes
- Use when presenting payment ledger operations and the reason CSV export was added across administrator grids.

## 2026-06-28 - Admin Navy Sidebar Navigation

### Purpose
- Presentation visual for the redesigned administrator left navigation menu.

### Prompt
Create a Korean admin console UI mockup for "REAL_QR_FIND" showing a dark navy left sidebar like an operational control panel. At the top, show a shield icon and the title "제자리 관리자". Below it, show vertical menu items with crisp white line icons and Korean labels: 대시보드, 보호자 관리, 대상자 관리, QR 관리, 주문 관리, 결제 관리, 상품 관리, 광고 관리, 실종신고 관리, 위치공유 관리, 고객 문의, 관리자 관리. The selected menu "대시보드" has a purple background and subtle light border. At the bottom of the sidebar, show two quick actions: "사용자 화면" and "로그아웃". Also show a small collapse toggle and a second miniature state where the menu is hidden and the main workspace becomes wider. Use compact SaaS admin styling, white workspace panels, public-service trust tone, no real personal data, 16:9 presentation slide.

### Notes
- Use when explaining that the admin menu kept its hide/show behavior while adopting a stronger operations-menu style.

## 2026-06-28 - Admin Operations Dashboard Revamp

### Purpose
- Presentation visual for the redesigned operations-focused administrator dashboard.

### Prompt
Create a Korean operations dashboard UI mockup for "REAL_QR_FIND". At the top, show the title "현황" and five large white cards with thick black borders and bold black icons. Card 1 shows 전체 보호자 and 전체 대상자. Card 2 shows 신규 보호자 and 신규 대상자 with 전일 대비 notes. Card 3 shows 활성 QR and 미활성 QR with percentage notes. Card 4 shows 광고 진행중 and 광고 심사반려. Card 5 shows 일 매출 and 월 매출. In the center, show a recent 30-day line chart for 매출, 주문, and 위치공유 activity with a yellow memo box explaining the graph. Below, show compact tables for 신규 가입자, 신규 주문, 최근 활동 알림, and 주의 대상 현황. At the bottom, show 주문 현황 flow, 최근 실종 광고 table, 광고 진행 도넛 chart, 구독 현황 도넛 chart, and 매출 현황 table. Use a clean Korean SaaS admin style, white background, black table borders, restrained purple/blue/yellow accents, no real personal data, 16:9 presentation slide.

### Notes
- Use when explaining the shift from simple metric cards to a dense operations dashboard.

## 2026-06-29 - Guardian Admin Operations Layout

### Purpose
- Presentation visual for the redesigned administrator guardian-management screen.

### Prompt
Create a Korean SaaS admin console UI mockup for "REAL_QR_FIND" guardian management. Show a left admin sidebar and a white operations workspace. At the top of the guardian page, show four thick-border summary cards titled "전체 보호자", "신규 보호자", "대상자 등록", and "대상자 미등록" with bold black icons and compact count notes. Below, show a search panel with fields "검색어", "상태", "구분", and "가입일" date range, plus "초기화" and purple "검색" buttons. The main area is split into a wide dense grid and a right detail panel. The grid columns are "선택, 이름, 아이디, 연락처, 생년월일, 성별, 보호자상태, 보호자 구분, 가입일, 관리" with colored status cells for 일반, 휴면, VIP, and 관리자. The right detail panel shows a circular profile initial, guardian name/member number, status pill, tabs "기본정보, 대상자, 구독/주문, 광고, 활동 내역", a basic information list, small summary cards for 대상자/구독/결제/광고, an admin memo box, and action buttons "탈퇴 처리" and "저장". Use the existing REAL_QR_FIND admin style: white panels, thin gray grid lines, restrained purple actions, black headings, compact Korean labels, and no real personal data.

### Notes
- Use when presenting the guardian-management screen conversion from a simple master-detail list to an operations-grade grid and detail workspace.
