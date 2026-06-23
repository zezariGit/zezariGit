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
