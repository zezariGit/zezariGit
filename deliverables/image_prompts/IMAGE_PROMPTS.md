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
