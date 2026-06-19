# Developer Handoff Log

Project: REAL_QR_FIND

This file is the cumulative technical handoff log. It must be updated whenever requirements, implementation, source files, architecture, verification results, or next steps change.

## 2026-06-12 00:00 KST - Project Logging System Initialized

### User Request
- Act as a full-stack developer.
- Treat the previous QR project as a test project and start the real project from now.
- Manage all development source context in one log file so any developer or AI can continue from it.
- Create a separate presentation log file for the user.
- For every user request, cumulatively manage:
  - Requested content
  - Reflected/implemented content
  - Time spent
  - Official implementation deliverables
  - Diagram or image-generation prompts when visual assets are needed

### Reflected Work
- Created project operation rule file: `00_PROJECT_RULES.md`.
- Created technical handoff log: `logs/DEV_HANDOFF_LOG.md`.
- Created presentation progress log: `logs/PRESENTATION_PROGRESS_LOG.md`.
- Created deliverable index: `deliverables/README.md`.
- Created image prompt accumulation file: `deliverables/image_prompts/IMAGE_PROMPTS.md`.

### Implementation Notes
- All future development work should update this file first/alongside implementation.
- The presentation-facing summary should be maintained separately in `logs/PRESENTATION_PROGRESS_LOG.md`.
- Official outputs should be organized in `deliverables/`.

### Changed Files
- `00_PROJECT_RULES.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- File structure created in an empty repository.

### Next Actions
- Wait for the user's detailed requirements for the real QR people-finding project.
- After requirements arrive, create the first formal requirements deliverable.

## 2026-06-12 00:00 KST - GitHub/VSCode Account Check

### User Request
- Check whether VSCode/GitHub is configured with the `zezari` account.

### Checks Performed
- Checked global Git author configuration.
- Checked local Git repository configuration and remotes.
- Checked GitHub CLI authentication status.
- Checked VSCode user settings file at `%APPDATA%\Code\User\settings.json`.

### Results
- Current folder `c:\REAL_QR_FIND` is not yet a Git repository, so there is no local `.git` config and no remote URL.
- Global Git configuration is:
  - `user.name=soonsuboy`
  - `user.email=soonsuboy10@gmail.com`
- GitHub CLI command `gh auth status` failed because `gh` is not installed or not available in PATH.
- VSCode user settings do not contain a visible GitHub account setting.

### Conclusion
- Based on available command-line evidence, Git is not configured as `zezari`.
- VSCode's internal GitHub sign-in state cannot be fully confirmed from terminal output alone.
- To use `zezari` for this project, configure Git and/or VSCode GitHub authentication explicitly.

### Changed Files
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

## 2026-06-14 22:37 KST - QR Code Management And Public Find URL

### User Request
- Generate and manage about 30 QR codes and QR-linked unique strings in the database.
- Allow admins to view existing QR codes and unique strings.
- Allow admins to activate/deactivate each QR.
- Allow admins to generate any additional desired count of non-duplicated QR codes and strings using the same logic.
- Use the unique QR-linked strings as the last segment of the people-finding page URL.

### Reflected Work
- Added Turso table support for `qr_codes`.
- Added initial QR seeding logic to ensure at least 30 records.
- Added unique generation logic:
  - Admin-facing QR label: `ZRF-XXXX-XXXX`
  - Public URL key: `zrf-{unique-string}`
  - Public URL: `/find/{public_key}`
- Added admin QR management section:
  - `/admin?section=qr`
  - QR image preview
  - QR code label
  - Unique public string
  - Public find URL
  - Active/inactive state
  - Additional generation form
- Added admin server actions:
  - Generate QR codes
  - Activate/deactivate QR codes
- Added public find route:
  - `/find/[key]`
  - Unknown QR message
  - Inactive QR message
  - Active QR confirmation message
- Added `qrcode` package to generate scan-ready QR images.
- Updated PWA cache version to `zezari-v9`.
- Added official QR management deliverable and updated DB schema deliverable.

### Database Details
- New table: `qr_codes`
- Columns:
  - `id`
  - `code`
  - `public_key`
  - `target_url`
  - `is_active`
  - `created_at`
  - `updated_at`
- Indexes:
  - `idx_qr_codes_public_key`
  - `idx_qr_codes_active`
- Initial production/Turso seed result:
  - Created: `30`
  - Total: `30`
  - Active: `30`

### Files Changed
- `.env.example`
- `package.json`
- `package-lock.json`
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.
- Build output includes:
  - `/admin`
  - `/find/[key]`
- Turso QR seed script completed without printing secrets.
- Local production server verification:
  - `/find/{sample-active-key}` returned HTTP 200.
  - Active QR confirmation content was present.
  - `/admin?section=qr` returned HTTP 200 and showed the admin login gate while logged out.

### Time Spent
- QR schema, generation logic, admin UI, public find page, DB seeding, build checks, and documentation: approximately 45 minutes.

### Next Actions
- Connect QR codes to specific managed subjects.
- Add QR assignment/reassignment controls in admin or guardian information entry.
- Add the actual missing-person report/contact workflow to `/find/[key]`.
- Decide whether inactive QR should show a public support contact or only a generic disabled message.

### Completion Update
- GitHub commit:
  - `b3a15d3 Add QR code management`
- Vercel production deployment:
  - `https://zezari-jrx5s7ofz-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Vercel environment update:
  - Added `PUBLIC_APP_URL=https://zezari.vercel.app` to Production and Development.
- Production verification:
  - `/` returned HTTP 200.
  - `/admin?section=qr` returned HTTP 200 and showed the admin login gate while logged out.
  - `/find/{sample-active-key}` returned HTTP 200 and showed active QR confirmation content.
  - `/sw.js` includes cache version `zezari-v9`.
  - `/manifest.webmanifest` returned HTTP 200.

## 2026-06-14 22:50 KST - Add Additional Admin Email

### User Request
- Grant admin access to the user with email:
  - `soonsuboy10@gmail.com`

### Reflected Work
- Updated default admin email list in code:
  - `general@zezari.com`
  - `soonsuboy10@gmail.com`
- Updated `.env.example` to document both admin emails.
- Added Vercel `ADMIN_EMAILS` environment variable to:
  - Production
  - Development
- Environment value:
  - `general@zezari.com,soonsuboy10@gmail.com`

### Files Changed
- `lib/admin.js`
- `.env.example`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.

### Time Spent
- Admin access update, Vercel env update, build verification, and logging: approximately 10 minutes.

### Completion Update
- GitHub commit:
  - `6986c8f Add soonsuboy admin access`
- Vercel production deployment:
  - `https://zezari-4p4fvy3wz-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Production verification:
  - `/admin` returned HTTP 200 and shows the admin login gate when logged out.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.

## 2026-06-14 23:10 KST - Admin Role Management Tab

### User Request
- Add `관리자 관리` to the admin page alongside `보호자 관리` and `QR 관리`.
- Allow an admin to grant administrator role to registered users/guardians.

### Reflected Work
- Added DB-based administrator role:
  - `guardians.is_admin`
  - `1`: DB administrator
  - `0`: normal guardian
- Kept environment-based base admins:
  - `ADMIN_EMAILS`
  - Default code fallback emails remain `general@zezari.com` and `soonsuboy10@gmail.com`.
- Updated admin authorization:
  - Access is allowed when the Google login email is in `ADMIN_EMAILS`.
  - Access is also allowed when the logged-in guardian has `guardians.is_admin = 1`.
- Added admin page tab:
  - `/admin?section=admins`
  - Shows registered guardians.
  - Shows role badges: administrator, normal guardian, base admin, inactive user, subject count.
  - Allows granting/removing DB admin role.
  - Base admins are protected in the UI because their access is configured outside the DB.
- Updated dashboard admin link visibility so DB admins also see the admin link after login.
- Updated official deliverables and image prompt archive.

### Database Details
- Added column to Turso:
  - `guardians.is_admin INTEGER NOT NULL DEFAULT 0`
- Migration result:
  - Registered guardians: `4`
  - DB administrators after sync: `1`
  - Existing default admin record matched and was updated.

### Files Changed
- `lib/admin.js`
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/ADMIN_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.
- `git diff --check` completed with no whitespace errors.
- Local production server:
  - `/admin?section=admins` returned HTTP 200.
  - Logged-out users see the admin login gate.

### Time Spent
- DB role design, admin authorization update, admin-management UI, migration, verification, and documentation: approximately 35 minutes.

### Completion Update
- GitHub commit:
  - `7707d72 Add admin role management`
- Vercel production deployment:
  - `https://zezari-er1pv1m2t-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Production verification:
  - `/admin?section=admins` returned HTTP 200 and shows the admin login gate when logged out.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.

## 2026-06-15 00:00 KST - Google/Kakao/Naver Social Login Foundation

### User Request
- Current login/signup uses Google.
- Add Kakao and Naver login/signup too.
- Create matching login buttons with logos.
- Build the base structure so each platform works once the related keys are entered.

### Reflected Work
- Expanded NextAuth provider setup:
  - Google
  - Kakao
  - Naver
- Providers are registered conditionally:
  - A provider is enabled only when both client ID and client secret are present.
  - This prevents the app from breaking before Kakao/Naver keys are entered.
- Added social login button set:
  - Google logo button
  - Kakao logo/color button
  - Naver logo/color button
- Disabled unconfigured provider buttons with setup-needed text.
- Updated login screen copy from Google-only to social-login language.
- Updated admin login gate to use the same social login button set.
- Updated session ID handling:
  - Existing Google users keep the same user key behavior.
  - Kakao/Naver users use provider-prefixed keys like `kakao:{id}` and `naver:{id}`.
- Added environment variable placeholders:
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
- Updated auth deliverable and image prompt archive.
- Updated PWA cache version to `zezari-v10`.

### Required Provider Callback URLs
- Google:
  - `https://zezari.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- Kakao:
  - `https://zezari.vercel.app/api/auth/callback/kakao`
  - `http://localhost:3000/api/auth/callback/kakao`
- Naver:
  - `https://zezari.vercel.app/api/auth/callback/naver`
  - `http://localhost:3000/api/auth/callback/naver`

### Files Changed
- `.env.example`
- `lib/auth.js`
- `app/auth-actions.js`
- `app/page.js`
- `app/admin/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/AUTH_SETUP.md`
- `deliverables/PWA_SETUP.md`
- `deliverables/ONBOARDING_FLOW.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.
- Local `/api/auth/providers` returned HTTP 200.
- Current local provider response includes Google only because Kakao/Naver keys are not configured yet.
- Local `/admin` login gate returned HTTP 200 and includes Google, Kakao, and Naver buttons.
- Kakao/Naver buttons show setup-needed state until their keys are configured.

### Time Spent
- Multi-provider auth setup, UI buttons, provider guards, docs, and verification: approximately 30 minutes.

### Next Actions
- User should provide Kakao/Naver client ID and client secret values in `env.txt`.
- Add those values to Vercel Production/Development environment variables.
- Confirm each provider dashboard has the production callback URL registered.
- Redeploy after provider keys are added.

### Completion Update
- GitHub commit:
  - `f834a3e Add Kakao and Naver login foundation`
- Vercel production deployment:
  - `https://zezari-qvparkrgz-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Production verification:
  - `/api/auth/providers` returned HTTP 200.
  - Google provider is active.
  - Kakao/Naver providers are not active yet because their credentials are not configured.
  - `/admin` returned HTTP 200 and includes Kakao/Naver login buttons.
  - Kakao/Naver buttons show setup-needed state.
  - `/sw.js` includes cache version `zezari-v10`.

## 2026-06-15 00:35 KST - Toss Payments Subscription Foundation

### User Request
- Connect Toss Payments for subscription payments and future advertisement payments.
- Use the Toss Payments v2 LLM quick reference documentation.
- Test keys are expected under `// tosspayments` in `env.txt`.
- First task:
  - Add a `구독결제하기` button next to the `현재 상태` text on the dashboard.
  - After payment completes, show `구독중`.

### Documentation Consulted
- Toss Payments LLM Quick Reference:
  - V2 is preferred by default.
  - Subscription/recurring/billing maps to auto-billing.
  - Secret key must stay server-only; client key is browser-only.
  - Server must finalize payment state.
- Toss Payments auto-billing guide:
  - Client calls `requestBillingAuth`.
  - Success redirect returns `authKey` and `customerKey`.
  - Server issues billing key with `/v1/billing/authorizations/issue`.
  - Server approves recurring payment with `/v1/billing/{billingKey}`.

### Reflected Work
- Added Toss Payments environment placeholders:
  - `TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`
  - `TOSS_SUBSCRIPTION_AMOUNT`
  - `TOSS_SUBSCRIPTION_ORDER_NAME`
- Added server-side Toss API helper:
  - `lib/toss-payments.js`
  - Supports `TOSS_CLIENT_KEY/TOSS_SECRET_KEY`
  - Also supports legacy aliases `TOSSPAYMENTS_CLIENT_KEY/TOSSPAYMENTS_SECRET_KEY`
- Added `subscriptions` table.
- Added subscription data to dashboard data loading.
- Added dashboard subscription button:
  - File: `app/toss-subscription-button.js`
  - Loads Toss V2 SDK from `https://js.tosspayments.com/v2/standard`
  - Calls prepare API
  - Starts billing auth with `payment.requestBillingAuth`
- Added prepare API:
  - `POST /api/payments/toss/subscription/prepare`
  - Requires login
  - Creates or reuses guardian subscription record
  - Returns client key only when Toss keys are configured
- Added redirect pages:
  - `/payments/toss/subscription/success`
  - `/payments/toss/subscription/fail`
- Success page server behavior:
  - Requires login.
  - Validates subscription by `customerKey`.
  - Calls Toss billing key issue API.
  - Calls Toss billing payment API for first subscription payment.
  - Marks subscription as `active`.
- Dashboard display behavior:
  - Not active: `구독결제하기`
  - Active: `구독중`
- Updated PWA cache version:
  - `zezari-v11`
- Added official deliverable:
  - `deliverables/TOSS_PAYMENTS_SETUP.md`

### Environment Note
- Masked scan of `env.txt` did not show Toss Payments variable names at runtime.
- The file may not have been saved, or variable names may not be in `KEY=value` format yet.
- Current code is ready for:
  - `TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`

### Database Details
- New table: `subscriptions`
- Migration result:
  - Existing subscriptions: `0`

### Files Changed
- `.env.example`
- `lib/db.js`
- `lib/toss-payments.js`
- `app/dashboard.js`
- `app/toss-subscription-button.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/payments/toss/subscription/success/page.js`
- `app/payments/toss/subscription/fail/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/TOSS_PAYMENTS_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/PWA_SETUP.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.
- Build output includes:
  - `/api/payments/toss/subscription/prepare`
  - `/payments/toss/subscription/success`
  - `/payments/toss/subscription/fail`
- Local production server checks:
  - Unauthenticated prepare API returned HTTP 401.
  - Fail page returned HTTP 200 and displayed the expected failure message.
- Actual Toss payment window was not tested because Toss keys were not visible in the loaded environment.

### Time Spent
- Toss docs review, subscription schema, server API, dashboard button, callback pages, migration, verification, and documentation: approximately 50 minutes.

### Next Actions
- Confirm `env.txt` is saved with Toss variables.
- Add Toss keys to Vercel Production/Development environment variables.
- Test billing auth with Toss test card flow.
- Add advertisement payment flow after subscription payment is confirmed.

### Completion Update
- GitHub commit:
  - `a550f63 Add Toss subscription payment foundation`
- Vercel production deployment:
  - `https://zezari-3ppmbunvm-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Production verification:
  - `POST /api/payments/toss/subscription/prepare` returned HTTP 401 while logged out.
  - `/payments/toss/subscription/fail` returned HTTP 200 and displayed the expected failure message.
  - `/sw.js` includes cache version `zezari-v11`.

## 2026-06-15 00:55 KST - Toss Test Keys Reflected

### User Request
- In `env.txt`, under `// tosspayments`, the first value is the client key and the second value is the secret key.
- Read those values and reflect them.
- These are test keys and should remain changeable later.

### Reflected Work
- Read `env.txt` without printing secret values.
- Interpreted Toss raw values as:
  - First value: `TOSS_CLIENT_KEY`
  - Second value: `TOSS_SECRET_KEY`
  - Third raw value: unused for the current subscription flow.
- Updated local `.env.local`:
  - `TOSS_CLIENT_KEY=***`
  - `TOSS_SECRET_KEY=***`
- Added encrypted Vercel environment variables:
  - Production:
    - `TOSS_CLIENT_KEY`
    - `TOSS_SECRET_KEY`
  - Development:
    - `TOSS_CLIENT_KEY`
    - `TOSS_SECRET_KEY`
- Redeployed production so the new Toss keys are active.

### Verification
- `npm run build` completed successfully after local env reflection.
- Vercel deployment completed:
  - `https://zezari-182hb05ms-zezari.vercel.app`
- Public alias updated:
  - `https://zezari.vercel.app`
- Production check:
  - `POST /api/payments/toss/subscription/prepare` returned HTTP 401 while logged out, which confirms the route is live and protected.

### Time Spent
- Local env reflection, Vercel env setup, deployment, verification, and logging: approximately 15 minutes.

### Future Change Rule
- To change Toss test/production keys later, update:
  - `.env.local` for local testing.
  - Vercel `TOSS_CLIENT_KEY` and `TOSS_SECRET_KEY` for deployed environments.
- No source code change is needed when only replacing keys.

## 2026-06-15 01:20 KST - Subscription Plans, Pause, Resume

### User Request
- After subscription, users should be able to pause/resume with buttons.
- Subscription service should offer 1-month, 3-month, and 6-month options.
- Admin should be able to configure prices for each option from the admin page.

### Reflected Work
- Added subscription plan table:
  - `subscription_plans`
  - Options: 1, 3, 6 months.
  - Default prices:
    - 1 month: `9900`
    - 3 months: `27000`
    - 6 months: `50000`
- Added admin payment management section:
  - `/admin?section=payments`
  - Menu label: `결제 관리`
  - Admin can edit option prices.
- Extended subscription records:
  - `plan_months`
  - `current_period_start`
  - `current_period_end`
  - `paused_at`
  - `resumed_at`
- Updated dashboard subscription UI:
  - Non-subscribed users choose 1/3/6 months and click `구독결제하기`.
  - Active subscribers see `구독중` and `일시정지`.
  - Paused subscribers see `일시정지중` and `재개`.
- Added user subscription status API:
  - `POST /api/subscription/status`
  - Requires login.
  - Accepts `pause` or `resume`.
- Updated Toss prepare API:
  - Accepts `planMonths`.
  - Resolves price server-side from `subscription_plans`.
  - Does not trust client-provided amount.
- Updated Toss success flow:
  - Uses selected plan name and DB amount.
  - Sets current subscription period based on selected months.
- Updated PWA cache version:
  - `zezari-v12`

### Important Behavior Note
- Pause/resume currently controls the app service state (`active`/`paused`).
- It does not delete Toss billing keys or unregister cards.
- Future recurring billing scheduler must respect `paused` before charging again.

### Database Migration Result
- Existing subscriptions: `1`
- Plans:
  - `{ months: 1, amount: 9900 }`
  - `{ months: 3, amount: 27000 }`
  - `{ months: 6, amount: 50000 }`

### Files Changed
- `lib/db.js`
- `app/dashboard.js`
- `app/toss-subscription-button.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/api/subscription/status/route.js`
- `app/payments/toss/subscription/success/page.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/TOSS_PAYMENTS_SETUP.md`
- `deliverables/PWA_SETUP.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.
- `git diff --check` completed with no whitespace errors.
- Build output includes:
  - `/api/subscription/status`
  - `/api/payments/toss/subscription/prepare`
  - Toss success/fail pages.
- Local production server checks:
  - `POST /api/subscription/status` returned HTTP 401 while logged out.
  - `POST /api/payments/toss/subscription/prepare` returned HTTP 401 while logged out.
  - `/admin?section=payments` returned HTTP 200 and showed the admin login gate while logged out.

### Time Spent
- Plan schema, admin pricing UI, user pause/resume, Toss prepare update, migration, verification, and documentation: approximately 45 minutes.

### Next Actions
- Test authenticated subscription payment with each plan option.
- Confirm paused subscriptions are excluded when future recurring billing scheduler is added.
- Add billing-key/card cancellation if the service needs full subscription cancellation rather than app-level pause.

### Completion Update
- GitHub commit:
  - `7e595ed Add subscription plans and pause resume`
- Vercel production deployment:
  - `https://zezari-9eawm8ulk-zezari.vercel.app`
- Public alias:
  - `https://zezari.vercel.app`
- Production verification:
  - `POST /api/subscription/status` returned HTTP 401 while logged out.
  - `POST /api/payments/toss/subscription/prepare` returned HTTP 401 while logged out.
  - `/admin?section=payments` returned HTTP 200 and showed the admin login gate while logged out.
  - `/sw.js` includes cache version `zezari-v12`.

## 2026-06-12 22:48 KST - Git Repository Initialized and Pushed to GitHub

### User Request
- User provided GitHub repository URL: `https://github.com/zezariGit/zezariGit.git`.
- User asked to apply the Git initialization, commit, remote connection, and push script if the URL is correct.

### Reflected Work
- Confirmed the URL is a valid GitHub repository URL format.
- Initialized `c:\REAL_QR_FIND` as a Git repository.
- Set default branch to `main`.
- Added all current project files.
- Created initial commit:
  - Commit: `90dc4c7`
  - Message: `Initial project setup`
- Added remote:
  - Name: `origin`
  - URL: `https://github.com/zezariGit/zezariGit.git`
- Pushed local `main` branch to `origin/main`.

### Authentication Issue and Resolution
- First push attempt failed:
  - GitHub rejected the push because Git used cached Windows/Git credentials for `soonsuboy`.
  - Error: `Permission to zezariGit/zezariGit.git denied to soonsuboy`.
- Checked Windows credential store and found:
  - `git:https://github.com`
  - User: `soonsuboy`
- Deleted the stale GitHub credential.
- Ran Git Credential Manager login for:
  - Username: `zezariGit`
- Verified Windows credential store now contains:
  - `git:https://github.com`
  - User: `zezariGit`
- Re-ran push successfully.

### Commands Run
- `git init -b main`
- `git add .`
- `git commit -m "Initial project setup"`
- `git remote add origin https://github.com/zezariGit/zezariGit.git`
- `git push -u origin main`
- `cmdkey /list`
- `cmdkey /delete:git:https://github.com`
- `git credential-manager github login --username zezariGit --device --force`
- `git ls-remote --heads origin main`

### Verification
- `origin/main` exists.
- Remote branch check returned:
  - `90dc4c7b0940e7afca953cd2951b22f705fe733c refs/heads/main`
- Local branch tracks `origin/main`.

### Current Git State
- Repository path: `c:\REAL_QR_FIND`
- Current branch: `main`
- Remote: `origin`
- Remote URL: `https://github.com/zezariGit/zezariGit.git`
- Git author:
  - `zezariGit`
  - `general@zezari.com`

### Changed Files
- `.git/` repository metadata created.
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit and push this log update so GitHub also contains the record of the GitHub connection process.

## 2026-06-12 23:00 KST - Vercel Connected and Turso Integration Prepared

### User Request
- User said Vercel and Turso signup is complete and asked to connect them.

### Checks Performed
- Checked whether Vercel CLI is installed.
- Checked whether Turso CLI is installed.
- Checked Node/npm availability.
- Checked WSL availability for Turso CLI.
- Checked Vercel login state after authentication.
- Checked Vercel project link metadata.

### Vercel Result
- Installed Vercel CLI globally with npm.
- Vercel CLI version: `54.12.2`.
- Logged in successfully.
- `vercel whoami` returns `zezarigit`.
- Linked local folder `c:\REAL_QR_FIND` to Vercel project:
  - Scope: `zezari-vercel-s-projects`
  - Project: `real-qr-find`
- Vercel connected the GitHub repository:
  - `https://github.com/zezariGit/zezariGit`
- Local Vercel metadata was created at `.vercel/project.json`.

### Turso Result
- Turso CLI is not currently installed.
- Official Turso docs state Windows CLI installation requires WSL.
- Current PC reports WSL is not installed.
- Turso connection is pending until either:
  - WSL is installed and Turso CLI auth is completed, or
  - User provides Turso database URL and auth token from the dashboard/API.

### Reflected Work
- Added `.gitignore` to prevent committing local secrets and Vercel local metadata.
- Added `.env.example` with expected Turso environment variable names.
- Added official integration deliverable:
  - `deliverables/INTEGRATION_SETUP.md`
- Updated deliverable index.

### Changed Files
- `.gitignore`
- `.env.example`
- `deliverables/INTEGRATION_SETUP.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `vercel --version` succeeded.
- `vercel login` completed successfully.
- `vercel whoami` returned `zezarigit`.
- `vercel link --yes --project real-qr-find` completed successfully.
- `.vercel/project.json` contains project metadata for `real-qr-find`.

### Next Actions
- Commit and push Vercel setup files/logs.
- For Turso, choose one:
  - Install WSL and continue Turso CLI setup.
  - Provide Turso database URL and auth token so environment variables can be configured.

## 2026-06-12 23:20 KST - Turso Environment Variables Configured from env.txt

### User Request
- User said they would create the database and save the URL/key values in `env.txt`.
- User asked whether Codex can configure environment variables from that file.

### Input File
- `env.txt` existed in the project root.
- It contained:
  - Turso libSQL database URL.
  - Turso auth token.
- The token is treated as a secret and must not be committed or written into logs.

### Reflected Work
- Added `env.txt` to `.gitignore`.
- Parsed `env.txt` for:
  - `TURSO_DATABASE_URL`
  - `TURSO_AUTH_TOKEN`
- Created local `.env.local`.
- Added Turso values to Vercel environment variables:
  - Production
  - Development
- Updated official integration deliverable.

### Vercel Preview Note
- Attempted to add Preview environment variables.
- Vercel CLI required a non-production Git branch for Preview.
- Attempting to use `main` was rejected because `main` is the Production branch.
- Preview variables remain pending until a separate preview branch exists or the values are added through the Vercel dashboard for Preview.

### Verification
- Local `.env.local` contains:
  - `TURSO_DATABASE_URL`
  - `TURSO_AUTH_TOKEN`
- `vercel env ls` shows encrypted values for:
  - `TURSO_DATABASE_URL` in Production and Development.
  - `TURSO_AUTH_TOKEN` in Production and Development.
- Database URL host:
  - `zezariturso-zezarigit.aws-ap-northeast-1.turso.io`

### Changed Files
- `.gitignore`
- `deliverables/INTEGRATION_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Security Notes
- Do not commit `env.txt`.
- Do not commit `.env.local`.
- Do not paste the Turso auth token into logs, commits, issues, or chat output.

## 2026-06-12 23:30 KST - Static Hello Page Added

### User Request
- User asked whether GitHub, Vercel, and DB setup are complete.
- If complete, user asked to create a simple page that outputs `hellow zezari`.

### Setup Status Confirmed
- GitHub:
  - Repository connected and push works.
  - Remote: `https://github.com/zezariGit/zezariGit.git`
- Vercel:
  - Project connected: `real-qr-find`
  - Account/scope available through Vercel CLI.
  - Vercel environment variables exist for Production and Development.
- Turso:
  - Local `.env.local` configured.
  - Vercel Production and Development variables configured.
  - Preview variables remain pending until a non-production preview branch or dashboard configuration is used.

### Reflected Work
- Added static Vercel-compatible page:
  - `public/index.html`
- The page displays:
  - `hellow zezari`

### Verification
- Ran `vercel pull --yes --environment production`.
- Ran `vercel build --yes`.
- Build completed successfully.

### Changed Files
- `public/index.html`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit and push the page.
- Confirm Vercel production URL after deployment.

## 2026-06-12 23:40 KST - Vercel Public URL Changed to zezari.vercel.app

### User Request
- User asked to change the URL wording from `real-qr-find` to `zezari`.
- User asked whether it can later be changed to `zezari.com`.

### Reflected Work
- Renamed Vercel project:
  - From: `real-qr-find`
  - To: `zezari`
- Added alias:
  - `https://zezari.vercel.app`
- Disabled Vercel SSO deployment protection for the project so the new Vercel URL can be accessed publicly.
- Pulled Vercel project settings so local `.vercel/project.json` reflects project name `zezari`.

### Verification
- `https://zezari.vercel.app` returns HTTP 200.
- Response contains `hellow zezari`.
- Vercel alias list shows:
  - `zezari.vercel.app`

### Custom Domain Note
- `zezari.com` can be connected later if the user owns or controls the domain.
- Future steps will be:
  - Add `zezari.com` to the Vercel project domains.
  - Configure DNS records at the domain registrar/DNS provider.
  - Wait for DNS and SSL certificate activation.

### Changed Files
- `deliverables/INTEGRATION_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit and push this documentation update.

## 2026-06-12 23:50 KST - Google Login Setup Requirements Defined

### User Request
- User asked to start with Google signup/login.
- User asked what is needed from Google Cloud Console.
- User said they will write the required information into `env.txt`.

### Research/Reference
- Checked official Google OAuth documentation for web server applications and OAuth client redirect URI requirements.
- Relevant sources:
  - `https://developers.google.com/identity/protocols/oauth2/web-server`
  - `https://support.google.com/cloud/answer/15549257`

### Implementation Direction
- Use server-side Google OAuth flow.
- Recommended implementation target:
  - Next.js on Vercel
  - Auth.js/NextAuth-style Google provider
- Planned callback path:
  - `/api/auth/callback/google`

### Required Google Cloud Console Values
- OAuth Client ID.
- OAuth Client Secret.

### Required Google Cloud Console Settings
- OAuth consent screen:
  - App name: `zezari`
  - Audience: `External`
  - Scopes: `openid`, `email`, `profile`
  - Add test users while app is in testing mode.
- OAuth client:
  - Type: `Web application`
  - Authorized JavaScript origins:
    - `https://zezari.vercel.app`
    - `http://localhost:3000`
    - Future: `https://zezari.com`
  - Authorized redirect URIs:
    - `https://zezari.vercel.app/api/auth/callback/google`
    - `http://localhost:3000/api/auth/callback/google`
    - Future: `https://zezari.com/api/auth/callback/google`

### env.txt Format Requested
- User should add:
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`

### Changed Files
- `deliverables/AUTH_SETUP.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Wait for user to add Google OAuth values to `env.txt`.
- Then configure local and Vercel environment variables.
- Generate an app auth secret if needed.
- Implement the Google login/signup page and callback flow.

## 2026-06-12 23:55 KST - Google Login/Signup Implemented

### User Request
- User said `env.txt` was updated and Google Cloud Console setup was complete.
- User asked to build Google signup/login.

### Input Values
- `env.txt` contains:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - Existing Turso database URL/token
- Secrets were not printed into logs or committed.

### Reflected Work
- Converted the project from a static HTML page to a Next.js app.
- Installed dependencies:
  - `next`
  - `react`
  - `react-dom`
  - `next-auth`
- Implemented NextAuth Google provider.
- Added server auth route:
  - `app/api/auth/[...nextauth]/route.js`
- Added shared auth config:
  - `lib/auth.js`
- Added app pages/styles:
  - `app/layout.js`
  - `app/page.js`
  - `app/auth-actions.js`
  - `app/globals.css`
- Removed the previous static page:
  - `public/index.html`
- Generated `NEXTAUTH_SECRET`.
- Configured local `.env.local`.
- Added Vercel Production and Development environment variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Changed Vercel project framework setting from `Other` to `Next.js`.

### Verification
- `npm run build` completed successfully.
- Vercel environment variable list shows encrypted Google/NextAuth variables for Production and Development.
- Vercel project settings now show:
  - Framework Preset: `Next.js`
  - Output Directory: `Next.js default`
- Deployed with Vercel remote build because local prebuilt deployment on Windows failed on symlink creation.

### Known Notes
- In-app browser tool was unavailable in this session, so verification used build output and HTTP checks.
- Full end-to-end Google login requires the user to click through Google OAuth in a browser.
- Vercel Preview variables remain pending until a non-production branch or dashboard configuration is used.

### Changed Files
- `.env.example`
- `package.json`
- `package-lock.json`
- `app/api/auth/[...nextauth]/route.js`
- `app/auth-actions.js`
- `app/globals.css`
- `app/layout.js`
- `app/page.js`
- `lib/auth.js`
- `public/index.html` removed
- `deliverables/AUTH_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit and push implementation.
- Deploy production.
- User should test Google login from `https://zezari.vercel.app`.

### Completion Update
- Implementation commit:
  - `851ffa1 Implement Google authentication`
- Production deployment:
  - Deployment URL: `https://zezari-gztjdwm13-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- HTTP verification:
  - `https://zezari.vercel.app` returned HTTP 200.
  - Home response contains `hellow zezari`.
  - Home response contains `Continue with Google`.
  - `https://zezari.vercel.app/api/auth/providers` returned HTTP 200.
  - Providers response includes Google provider and callback URL:
    - `https://zezari.vercel.app/api/auth/callback/google`

## 2026-06-13 00:10 KST - Login UI Updated and PWA Install Support Added

### User Request
- User confirmed Google login works.
- User asked to remove `hellow`.
- User asked to add the Google logo to the Google login button.
- User asked to make the web page installable like Chrome's install feature and usable from desktop/mobile home-screen icons.

### Reflected Work
- Removed `hellow zezari` heading and replaced it with `zezari` branding.
- Added a simple app mark.
- Added Google logo SVG inside the Google login button.
- Changed login copy to Korean.
- Added installable PWA support:
  - Web app manifest.
  - Service worker.
  - PNG app icons at 192px and 512px.
  - Maskable 512px icon.
  - Desktop/Android install prompt button using `beforeinstallprompt`.
  - iOS home-screen guidance because iOS does not allow JavaScript-triggered installation.
- Excluded `/api/auth` routes from service worker handling to avoid interfering with Google OAuth.

### Changed Files
- `app/auth-actions.js`
- `app/globals.css`
- `app/layout.js`
- `app/page.js`
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `deliverables/PWA_SETUP.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.

### Next Actions
- Deploy to Vercel.
- Verify manifest, service worker, icons, home page, and provider route on `https://zezari.vercel.app`.

### Completion Update
- Implementation commit:
  - `b5ef241 Add PWA install support`
- Production deployment:
  - Deployment URL: `https://zezari-8xspdijhb-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- HTTP verification:
  - Home page returned HTTP 200.
  - Home page no longer contains `hellow`.
  - Home page contains `zezari`.
  - Home page contains Google login text.
  - Home page links `manifest.webmanifest`.
  - `/manifest.webmanifest` returned HTTP 200.
  - `/sw.js` returned HTTP 200.
  - `/sw.js` contains auth-route exclusion for `/api/auth`.
  - `/icons/icon-192.png` returned HTTP 200 with `image/png`.
  - `/icons/icon-512.png` returned HTTP 200 with `image/png`.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.

## 2026-06-13 00:40 KST - Three-Page Onboarding Added Before Login

### User Request
- User provided a reference image showing three phone-style service introduction pages.
- User asked to show three pages that can be swiped before the login screen.
- User asked that clicking `다시보지 않기` should take the user directly to the login screen in the future.

### Reflected Work
- Added client onboarding gate:
  - `app/onboarding-gate.js`
- Login page now wraps the login panel with onboarding for logged-out users only.
- Added three service introduction slides:
  - `01 QR로 연결되는 안심 서비스`
  - `02 실종 발생 시 빠른 대응`
  - `03 온라인 실종 공고`
- Mobile behavior:
  - Horizontal slide track.
  - Touch swipe support.
  - Previous/Next controls.
  - Final button: `로그인 시작`.
- Desktop behavior:
  - Shows all three phone-style panels side by side.
  - Shows `로그인 시작` button.
- Added `다시보지 않기` behavior:
  - Stores `zezari:onboarding:hidden=true` in localStorage.
  - Immediately displays the login screen.
  - Skips onboarding on future visits from the same browser/device.
- Updated service worker cache version:
  - From `zezari-v1` to `zezari-v2`.

### Changed Files
- `app/onboarding-gate.js`
- `app/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/ONBOARDING_FLOW.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.

### Next Actions
- Commit and push.
- Deploy to Vercel.
- Verify production page, login screen, and auth provider route.

### Completion Update
- Implementation commits:
  - `6cc0bc2 Add onboarding before login`
  - `3f247d2 Render onboarding immediately`
- Production deployment:
  - Deployment URL: `https://zezari-exlbx4f2k-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- HTTP verification:
  - Home page returned HTTP 200.
  - Home page contains `서비스 소개`.
  - Home page contains `다시보지 않기`.
  - Home page contains slide text for all three slides.
  - Home page contains `로그인 시작`.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.

## 2026-06-13 00:55 KST - Onboarding Changed to Sequential Pages

### User Request
- User clarified the onboarding was wrong because it looked like the provided capture image.
- User wants three separate pages/images that the user moves through from left to right.
- After the three pages, the login page should appear.
- `다시보지 않기` should go directly to the login page.
- CSS should look polished.

### Reflected Work
- Removed desktop behavior that showed all three phone-style panels side by side.
- Reworked onboarding into one slide/page at a time on all screen sizes.
- Kept horizontal swipe support and previous/next controls.
- Kept `다시보지 않기` localStorage skip behavior.
- Updated visual styling to a cleaner app-style onboarding card:
  - One large illustration per page.
  - Centered title/body.
  - Progress dots.
  - Cleaner desktop/mobile responsive layout.
- Updated service worker cache version:
  - From `zezari-v2` to `zezari-v3`.

### Changed Files
- `app/onboarding-gate.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/ONBOARDING_FLOW.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Build, deploy, and verify production response.

### Completion Update
- Implementation commit:
  - `dfc60fb Correct onboarding to sequential pages`
- Production deployment:
  - Deployment URL: `https://zezari-cvmyjq6is-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Home page returned HTTP 200.
  - Home page contains `서비스 소개`.
  - Home page contains `다시보지 않기`.
  - Home page contains all three slide titles.
  - Side-by-side desktop-only marker `desktop-start` is no longer present.
  - `/sw.js` returned HTTP 200 and contains `zezari-v3`.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.
  - In-app browser was unavailable in this environment, so final visual verification used build and HTTP checks.

## 2026-06-13 01:20 KST - Guardian and Subject Management Implemented

### User Request
- Logged-in users are guardians.
- A guardian information entry/edit screen is needed.
- One guardian can enter up to 4 target/subject people.
- Each subject can have a photo uploaded.
- Subject fields:
  - Name
  - Birth date
  - Gender
- Guardian fields:
  - Name
  - ID
  - Password
  - Phone number for contact
  - Email
- All data should be saved to DB and queryable anytime.
- Logged-in users should only query their own data.
- Entered information should be editable.

### Reflected Work
- Added Turso DB client dependency:
  - `@libsql/client`
- Added auth callbacks to persist a Google user key in the session.
- Added database layer:
  - `lib/db.js`
- Added password hashing helper:
  - `lib/security.js`
- Added server actions:
  - `app/actions.js`
- Added guardian dashboard:
  - `app/dashboard.js`
- Updated home page:
  - Logged-out users see onboarding/login.
  - Logged-in users see guardian/subject dashboard.
- Added DB schema deliverable:
  - `deliverables/DATABASE_SCHEMA.md`

### Database Tables
- `guardians`
- `subjects`

### Security/Access Notes
- Guardian profile is keyed by the logged-in Google user ID/email.
- Subject queries and mutations are scoped by the logged-in guardian's DB ID.
- Passwords are stored as PBKDF2 hashes, not plaintext.
- Subject uploads are limited to image files up to 1MB.
- Subject photos are currently stored as data URLs in Turso.
- Server logic prevents creating more than 4 subjects per guardian.

### Verification
- `npm run build` completed successfully.
- Turso schema initialization was run and verified.
- Turso contains tables:
  - `guardians`
  - `subjects`

### Changed Files
- `package.json`
- `package-lock.json`
- `.env.example`
- `lib/auth.js`
- `lib/security.js`
- `lib/db.js`
- `app/actions.js`
- `app/dashboard.js`
- `app/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit, push, deploy to Vercel.
- Verify production dashboard after Google login.

### Completion Update
- Implementation commit:
  - `38501f0 Add guardian and subject management`
- Production deployment:
  - Deployment URL: `https://zezari-kwgq7gfi8-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Turso schema was initialized and verified locally against the configured DB.
  - Production home page returned HTTP 200.
  - Production logged-out page still shows onboarding, which is expected.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.
  - `/sw.js` returned HTTP 200 and includes cache version `zezari-v4`.
  - Full dashboard CRUD requires an authenticated browser session and should be tested manually after Google login.

## 2026-06-13 01:45 KST - Logged-In Guardian Dashboard Refined

### User Request
- If guardian input is completed or already exists, login should lead to a dashboard.
- Dashboard should show the four managed subjects entered by the logged-in guardian.
- Each managed subject should show current status.
- User provided a dashboard reference capture.

### Reflected Work
- Added subject status field:
  - `문제없음`
  - `찾는중`
  - `QR활성화필요`
- Updated Turso schema handling to create/add `subjects.status`.
- Updated subject save/edit form to include current status.
- Updated logged-in dashboard behavior:
  - Incomplete guardian profile shows information-entry mode.
  - Completed guardian profile shows dashboard first.
  - Dashboard displays four management slots.
  - Registered subjects show photo/name/birth date/status.
  - Empty slots are shown as unregistered.
- Added quick dashboard actions:
  - `실종신고`
  - `상품 구매`
  - `내 정보`
- Updated dashboard CSS to better match the reference flow.
- Updated service worker cache version:
  - `zezari-v5`

### Changed Files
- `app/dashboard.js`
- `app/globals.css`
- `lib/db.js`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/ONBOARDING_FLOW.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Build, migrate Turso, deploy, and verify production routes.

### Completion Update
- Implementation commit:
  - `5d38213 Refine guardian status dashboard`
- Production deployment:
  - Deployment URL: `https://zezari-bpd5z5tm9-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Turso `subjects` table includes `status` column.
  - Production home page returned HTTP 200.
  - Production logged-out page still shows onboarding, as expected.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.
  - `/sw.js` returned HTTP 200 and includes cache version `zezari-v5`.
  - Authenticated dashboard visual/CRUD should be manually checked in browser after Google login.

## 2026-06-13 02:05 KST - Dashboard and Info Entry Screens Separated

### User Request
- Separate the information entry screen and dashboard.
- Make the information entry screen visually similar to the dashboard.
- Add top-level menu navigation with order:
  - Dashboard first
  - Information entry second

### Reflected Work
- Added query-based tab routing:
  - `/?tab=dashboard`
  - `/?tab=info`
- Default logged-in view is `대시보드`.
- Added top menu:
  - `대시보드`
  - `정보입력`
- Moved guardian/subject forms into the `정보입력` tab only.
- Dashboard tab now shows:
  - Status dashboard if guardian profile is complete.
  - Setup prompt with link to `정보입력` if profile is incomplete.
- Quick action links now route to `정보입력` anchors.
- Improved info-entry panel styling.
- Updated service worker cache version:
  - `zezari-v6`

### Changed Files
- `app/page.js`
- `app/dashboard.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Build, deploy, and verify public routes.

### Completion Update
- Implementation commit:
  - `1e7fa08 Separate dashboard and info entry screens`
- Production deployment:
  - Deployment URL: `https://zezari-l9i9p838x-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Production home page returned HTTP 200.
  - Production logged-out page still shows onboarding, as expected.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.
  - `/sw.js` returned HTTP 200 and includes cache version `zezari-v6`.
  - Authenticated tab navigation should be manually checked after Google login.

## 2026-06-13 02:35 KST - Admin Guardian Management Page Added

### User Request
- Add an admin page.
- Admin should be able to activate/deactivate guardians.
- Show guardians in a grid on the left.
- When a guardian is clicked, show that guardian's four managed subjects in a grid on the right.

### Reflected Work
- Added admin access helper:
  - `lib/admin.js`
- Added admin route:
  - `app/admin/page.js`
- Added admin server action:
  - `app/admin/actions.js`
- Added admin DB functions:
  - Guardian list with subject counts.
  - Selected guardian subject lookup.
  - Guardian active/inactive update.
- Added `guardians.is_active` DB column.
- Added inactive guardian handling in user dashboard.
- Added admin link for admin sessions in the user dashboard header.
- Added admin UI styling:
  - Left guardian grid.
  - Right selected guardian and subject grid.
  - Activation/deactivation controls.
- Added deliverable:
  - `deliverables/ADMIN_SETUP.md`
- Updated service worker cache version:
  - `zezari-v7`

### Access Control
- Admin access requires Google login.
- Admin emails are read from `ADMIN_EMAILS`.
- Default admin email if env is unset:
  - `general@zezari.com`

### Verification
- Turso `guardians` table includes `is_active`.
- `npm run build` completed successfully.
- Build output includes `/admin` route.

### Changed Files
- `.env.example`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/dashboard.js`
- `app/globals.css`
- `lib/admin.js`
- `lib/db.js`
- `public/sw.js`
- `deliverables/ADMIN_SETUP.md`
- `deliverables/README.md`
- `deliverables/DATABASE_SCHEMA.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- Commit, push, deploy to Vercel.
- Verify `/admin` route and auth provider route in production.

### Completion Update
- Implementation commit:
  - `e244ebe Add admin guardian management`
- Production deployment:
  - Deployment URL: `https://zezari-qfrnwer3f-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Build output includes `/admin`.
  - Turso `guardians` table includes `is_active`.
  - `/admin` returned HTTP 200 and shows admin login gate when not signed in.
  - `/api/auth/providers` returned HTTP 200 and includes Google provider.
  - `/sw.js` returned HTTP 200 and includes cache version `zezari-v7`.
  - Admin authenticated behavior should be manually checked after signing in as an admin email.

## 2026-06-14 21:00 KST - Gov Style Applied Globally

### User Request
- Use `css/gov-style.css` as a reference.
- Apply the same style to all existing pages.
- Make the style apply to future pages as well.

### Reflected Work
- Imported `css/gov-style.css` globally from `app/layout.js`.
- Kept `app/globals.css` for app-specific layouts.
- Added integration overrides so existing custom classes use gov-style tokens:
  - Login page
  - Onboarding
  - Guardian dashboard
  - Information entry screen
  - Admin page
  - PWA install UI
- Updated PWA theme colors:
  - `public/manifest.webmanifest`
  - `app/layout.js` viewport theme color
- Updated service worker cache version:
  - `zezari-v8`
- Added UI style guide deliverable:
  - `deliverables/UI_STYLE_GUIDE.md`

### Changed Files
- `css/gov-style.css`
- `app/layout.js`
- `app/globals.css`
- `public/manifest.webmanifest`
- `public/sw.js`
- `deliverables/UI_STYLE_GUIDE.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` completed successfully.

### Next Actions
- Commit, push, deploy, and verify production routes.

### Completion Update
- Implementation commit:
  - `6259c7d Apply gov style globally`
- Production deployment:
  - Deployment URL: `https://zezari-k7egom0ut-zezari.vercel.app`
  - Public alias: `https://zezari.vercel.app`
- Verification:
  - `npm run build` completed successfully.
  - Production home page returned HTTP 200 and shows onboarding.
  - `/admin` returned HTTP 200 and shows admin login gate.
  - `/sw.js` returned HTTP 200 and includes cache version `zezari-v8`.
  - `/manifest.webmanifest` returned HTTP 200 and includes theme color `#2e86c1`.

### Verification
- Commands completed:
  - `git config --global --get user.name`
  - `git config --global --get user.email`
  - `git config --local --get user.name`
  - `git config --local --get user.email`
  - `git remote -v`
  - `gh auth status`
  - Read VSCode settings JSON

### Next Actions
- If the user wants, initialize this folder as a Git repository and configure it to use the `zezari` identity.
- If GitHub authentication is needed, install/use GitHub CLI or sign in through VSCode Accounts.

## 2026-06-12 00:00 KST - VSCode Profile Screenshot Clarification

### User Request
- User provided a VSCode screenshot showing the profile/account menu and asked whether it indicates `zezari`.

### Updated Finding
- The screenshot shows VSCode/Codex extension profile/account as `zezariGit (GitHub)`.
- This means the VSCode UI login profile appears to be connected to the `zezariGit` GitHub account.
- Previous terminal checks remain valid but refer to a different layer:
  - Git global commit identity: `soonsuboy / soonsuboy10@gmail.com`
  - GitHub CLI: unavailable
  - Current folder: not yet a Git repository

### Important Distinction
- VSCode GitHub profile/login controls extension access, settings sync, and GitHub-connected features in VSCode.
- Git global/local config controls the name and email written into Git commits.
- These can be different at the same time.

### Conclusion
- VSCode profile appears to be logged in as `zezariGit (GitHub)`.
- Git commit identity is still currently configured as `soonsuboy`.
- Before committing source code for this real project, configure either global or local Git identity according to the desired GitHub account.

### Changed Files
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Next Actions
- When a Git repository is initialized, set the local Git identity for this project if the user wants commits to show the `zezari` identity.

## 2026-06-12 00:00 KST - Global Git Identity Updated

### User Request
- User stated that `general@zezari.com` is the email connected to the `zezari` account and asked to enter it directly in PowerShell.

### Reflected Work
- Updated global Git author identity:
  - `user.name=zezariGit`
  - `user.email=general@zezari.com`

### Commands Run
- `git config --global user.name "zezariGit"`
- `git config --global user.email "general@zezari.com"`
- Verified with:
  - `git config --global --get user.name`
  - `git config --global --get user.email`

### Result
- Global Git identity now resolves to:
  - `zezariGit`
  - `general@zezari.com`

### Important Note
- This is a global Git setting for the Windows user profile.
- The current project folder is still not a Git repository yet.
- When the repository is initialized, this global identity will be used by default unless local repository config overrides it.

### Changed Files
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`
## 2026-06-15 21:45 KST - Global Save/Search Feedback

### User Request
- When saving or querying, there is no clear sense that the action completed.
- Show bottom messages such as:
  - `저장되었습니다`
  - `수정되었습니다`
  - `필수값을 입력해주세요`
- Add progress bars when querying.
- Apply this across the app.

### Reflected Work
- Added shared client component:
  - `app/form-submit-button.js`
  - Uses `useFormStatus` to show pending state and an inline progress bar.
- Added shared client component:
  - `app/status-toast.js`
  - Shows fixed bottom success/error messages.
  - Auto-hides after a short delay.
- Updated user server actions:
  - guardian save redirects with success/error notice.
  - subject save redirects with success/error notice.
  - subject delete redirects with success/error notice.
- Updated admin server actions:
  - guardian activation.
  - QR generation.
  - QR active/inactive.
  - QR match/unmatch.
  - admin role update.
  - subscription price update.
- Updated major forms/buttons to use the shared submit button.
- Added inline progress bars for query forms such as QR filters and QR modal search.
- Added bottom toast rendering on:
  - home/user dashboard page.
  - admin page.
- Added CSS for:
  - `.pending-button`
  - `.button-progress`
  - `.status-toast`

### Files Changed
- `app/form-submit-button.js`
- `app/status-toast.js`
- `app/actions.js`
- `app/admin/actions.js`
- `app/page.js`
- `app/dashboard.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Notes
- Browser-native required fields still prevent submission before server action runs.
- Server-side validation failures that reach server actions now redirect with error-style notice where handled.

## 2026-06-15 21:25 KST - QR Matching Modal UX Cleanup

### User Request
- Current `보호자 조회` / `관리대상 조회` text and alignment in QR cards is not clean.
- Change QR matching logic:
  - For unmatched QR, show only `[매칭대상 조회]`.
  - Clicking it opens a popup.
  - Popup searches unmatched managed subjects and lets admin select one.
  - While popup is open, main screen should be disabled visually.
  - Avoid multiple popups/search panels.
  - For matched QR, hide the lookup button and show only `매칭 해제`.
- Improve overflowing/misaligned text where noticed.

### Reflected Work
- Replaced inline QR-card search fields with a single modal workflow.
- Unmatched QR cards show `매칭대상 조회`.
- Matched QR cards show only `매칭 해제` for matching control.
- Modal search includes:
  - guardian name/email input.
  - managed subject name input.
  - unmatched subject result list.
  - `선택 매칭` action.
- Main screen is covered by modal backdrop while the modal is open.
- Only one modal can be represented because the state is held in one `assignQr` query parameter.
- Added safer text wrapping/min-width rules and wider QR card grid to reduce text overflow.
- Kept QR image download behavior.
- Kept guardian-side assigned QR display.

### Files Changed
- `lib/db.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Notes
- No DB migration required.
- The modal is server-rendered through query parameters rather than client-only state, so refresh/back navigation remains predictable.

## 2026-06-15 21:05 KST - QR Match Search, Download, Guardian QR Visibility

### User Request
- In QR management, the subject select box will become difficult as users grow.
- Replace it with a button/search flow to find guardians and managed subjects by name.
- Already matched managed subjects must not appear in search results.
- A matched subject should appear only after its QR match is cleared.
- Clicking a QR image in QR management should download it.
- Matched QR codes should also be visible to the guardian in the user screen.

### Reflected Work
- Replaced the large QR subject select box with a per-QR search flow:
  - guardian name/email input.
  - managed subject name input.
  - `대상 조회` button.
  - search results shown only for the selected QR card.
- Search result rules:
  - only subjects with no current QR match are returned.
  - already matched subjects are excluded by `LEFT JOIN qr_codes ... WHERE q.id IS NULL`.
  - a subject becomes searchable again only after `매칭 해제`.
- Added `선택 매칭` buttons for each search result.
- Kept `매칭 해제` and active/inactive controls.
- Added QR image download in admin QR cards:
  - click the QR image to download `{QR코드}.png`.
- Added guardian-side QR visibility:
  - dashboard/status list shows assigned QR code.
  - information screen subject card shows QR image, QR code, active state, find URL, and image download link.
- Updated dashboard subject query to include assigned QR metadata.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Turso unmatched subject search succeeded:
  - unmatched candidates: 0
  - this is expected because the current 2 subjects are already matched.
- Turso guardian subject QR join succeeded:
  - 2 subject rows returned with QR code/public key.

### Notes
- No DB migration required.
- The uploaded attachment folder remains untracked.

## 2026-06-15 20:45 KST - QR Admin Filtering And Manual Matching

### User Request
- In QR management, add filters to view:
  - QR codes matched with managed subjects.
  - active/inactive QR codes.
- Add manual QR matching features:
  - assign
  - change
  - clear/unmatch

### Reflected Work
- Added QR admin filters:
  - `match=all|matched|unmatched`
  - `active=all|active|inactive`
- Added QR stats:
  - total
  - active
  - inactive
  - matched
  - unmatched
  - filtered count
- Added subject option list to QR admin data.
- Added admin server action:
  - `setQrSubjectAction`
- Added DB function:
  - `setQrSubject`
- Manual matching behavior:
  - selecting a subject and saving assigns that subject to the selected QR.
  - if that subject was already assigned to another QR, the previous QR is cleared first.
  - `매칭 해제` clears `guardian_id` and `subject_id` on the QR.
- Updated QR admin cards with:
  - matching select box.
  - `매칭 저장` / `매칭 변경` button.
  - `매칭 해제` button for assigned QR codes.

### Files Changed
- `lib/db.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Turso QR stats query succeeded:
  - total QR: 30
  - active QR: 30
  - inactive QR: 0
  - matched QR: 2
  - unmatched QR: 28
  - subject options: 2
- GitHub commit:
  - `23381c1 Add QR admin filters and manual matching`
- Production deployment:
  - `https://zezari-8i1pmuv6h-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`
- Production route checks:
  - `/admin?section=qr&match=matched&active=active` returned HTTP 200 while logged out and showed the admin login gate.
  - Server error text was not present.
  - `/` returned HTTP 200.

### Notes
- No database migration required; this uses existing `qr_codes.guardian_id` and `qr_codes.subject_id`.
- The uploaded screenshot folder under `.codex-remote-attachments/` remains untracked and was not included.

## 2026-06-15 20:30 KST - Fix QR Admin Server Error

### User Request
- User reported that opening the QR management page shows a Next.js server error page:
  - `This page couldn't load`
  - `A server error occurred. Reload to try again.`

### Root Cause
- `getQrAdminData()` joins:
  - `qr_codes q`
  - `subjects s`
  - `guardians g`
- The SQL ordered by unqualified `created_at`.
- Multiple joined tables contain `created_at`, so SQLite/Turso returned:
  - `ambiguous column name: created_at`

### Fix
- Updated QR admin query ordering from:
  - `ORDER BY created_at DESC, code ASC`
- To:
  - `ORDER BY q.created_at DESC, q.code ASC`

### Files Changed
- `lib/db.js`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- Direct Turso SQL reproduction confirmed the original failure.
- Direct Turso SQL after the fix succeeded:
  - `rows=30`
- `npm run build` succeeded.
- GitHub commit:
  - `826b239 Fix QR admin query ordering`
- Production deployment:
  - `https://zezari-cysx2egfr-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`
- Production route checks:
  - `/` returned HTTP 200.
  - `/admin?section=qr` returned HTTP 200 when logged out and showed the admin login gate.

### Notes
- No database migration required.
- The uploaded screenshot under `.codex-remote-attachments/` was not added to Git.
- The actual QR admin data query was verified directly against Turso because the page requires an authenticated admin session.

## 2026-06-15 20:18 KST - Deployment Completion For Subject QR Push Alerts

### Completion Update
- GitHub commit:
  - `d263b87 Add subject QR matching and guardian push alerts`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel deployment:
  - `https://zezari-i4cugzoy3-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/find/{assigned-public-key}` returned HTTP 200.
- Production find page includes `보호자에게 알리기`.
- Production find page includes guardian information section.
- `https://zezari.vercel.app/api/push/public-key` returned HTTP 200.
- Push configuration is active and public key is present.
- Production notify API returned HTTP 200 with `sent=0`, `total=0`.
  - Expected because no guardian browser/device has registered push subscription yet.
- `https://zezari.vercel.app/sw.js` returned HTTP 200.
- Service worker includes cache version `zezari-v13` and push handler.

### Verification Limitation
- In-app browser automation was attempted but the Browser plugin reported `iab` unavailable in this session.
- Build, local HTTP, DB migration, Vercel environment, deployment, and production HTTP checks completed successfully.

## 2026-06-15 20:09 KST - Subject-Matched QR Find Page And Guardian Push Notification

### User Request
- QR scan page should show the guardian's registered managed subject.
- QR codes should be matched per managed subject.
- One guardian can register up to 4 subjects, therefore up to 4 assigned QR codes per guardian.
- The public QR page should show subject information plus guardian contact/address/basic information.
- Add a `보호자에게 알리기` button that sends a push notification to the logged-in guardian with `{관리대상 이름}을 찾았습니다`.

### Reflected Work
- Added guardian address storage:
  - `guardians.address`
  - dashboard guardian profile form address field.
- Added subject-to-QR assignment:
  - `qr_codes.guardian_id`
  - `qr_codes.subject_id`
  - unique index on `qr_codes.subject_id`.
- Updated subject save/delete logic:
  - saving a subject assigns one available QR.
  - if no unassigned QR exists, the server generates one and assigns it.
  - deleting a subject releases its QR assignment.
- Updated admin QR management:
  - QR cards now show assigned guardian and assigned managed subject.
- Updated public QR find page:
  - unknown QR, inactive QR, unassigned QR, and assigned QR states.
  - assigned QR page shows subject name/photo/birth date/gender/status.
  - assigned QR page shows guardian name/phone/email/address.
  - added `보호자에게 알리기` action.
- Added Web Push support:
  - browser push registration button on the guardian dashboard.
  - VAPID public-key API.
  - push subscription save API.
  - public QR notify API.
  - service worker push and notification-click handlers.
- Added Vercel environment variables:
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`

### Files Changed
- `.env.example`
- `package.json`
- `package-lock.json`
- `lib/db.js`
- `lib/push.js`
- `app/dashboard.js`
- `app/push-notification-button.js`
- `app/find/[key]/page.js`
- `app/find/[key]/notify-button.js`
- `app/api/push/public-key/route.js`
- `app/api/push/subscribe/route.js`
- `app/api/find/[key]/notify/route.js`
- `app/admin/page.js`
- `app/globals.css`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/PUSH_NOTIFICATION_SETUP.md`
- `deliverables/PWA_SETUP.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Database Migration Result
- Columns added:
  - `guardians.address`
  - `qr_codes.guardian_id`
  - `qr_codes.subject_id`
- Table added:
  - `push_subscriptions`
- Existing subjects found: 1
- Existing subjects newly assigned to QR: 1
- QR total: 30
- QR assigned: 1
- QR unassigned: 29
- Push subscriptions: 0

### Verification
- `npm run build` succeeded.
- Local `/find/{assigned-public-key}` returned HTTP 200.
- Local find page contained `보호자에게 알리기`.
- Local `/api/push/public-key` returned configured public key.
- Local notify API returned HTTP 200 with `sent=0`, `total=0`.
  - This is expected until a guardian enables push notifications from a browser/app.
- Local `/sw.js` includes cache version `zezari-v13` and push handler.

### Notes For Next AI
- Do not print or commit `.env.local`; VAPID keys are secrets except the public key.
- Public QR pages now intentionally expose selected subject and guardian contact fields. Before real personal-data launch, add consent, field-level visibility controls, and notify endpoint rate limiting.
- Guardian must click `푸시 알림 켜기` once on each device/browser before push can be delivered.

## 2026-06-15 23:39 KST - Subject Advertisement Foundation

### User Request
- Add an `(광고)` button per managed subject on the guardian dashboard.
- Clicking the button should open a popup/modal and disable the main screen behind it.
- Modal should let the guardian set advertisement period and advertisement region.
- Amount should be calculated from the configured daily rate and selected period.
- Running ads should support pause and end controls.
- Add an admin advertisement tab.
- Admin should set the daily advertisement unit price.
- Admin should view user advertisement progress in a grid.
- Meta API credentials/details will be provided later; prepare the internal foundation first.

### Reflected Work
- Added DB tables:
  - `ad_settings`
  - `subject_ads`
- Added default advertising daily rate:
  - `10000` KRW
- Extended dashboard data query with latest ad state per subject.
- Added server-side ad actions:
  - create subject ad
  - pause subject ad
  - resume subject ad
  - end subject ad
- Added dashboard per-subject `광고` button.
- Added client modal with:
  - region input
  - start/end date inputs
  - inclusive day count
  - daily rate
  - calculated total amount
  - active/paused state controls
- Added admin `광고 관리` tab.
- Added admin daily-rate form.
- Added admin ad progress grid.
- Reserved Meta API fields:
  - `meta_campaign_id`
  - `meta_status`

### Files Changed
- `lib/db.js`
- `app/actions.js`
- `app/dashboard.js`
- `app/ad-campaign-modal.js`
- `app/page.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Database Verification
- Turso advertising schema creation verified.
- Current values:
  - `ad_settings.default.daily_rate`: `10000`
  - `subject_ads` row count: `0`

### Verification
- `npm run build` succeeded.
- Local `http://localhost:3000/` returned HTTP 200.
- Local `http://localhost:3000/admin?section=ads` returned HTTP 200 and showed the admin login gate when unauthenticated.
- In-app browser verification was attempted, but the Browser plugin reported `iab` unavailable in this session.

### Deployment
- GitHub commit:
  - `72d32ec Add subject advertising management foundation`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-3n7rdvupv-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.

## 2026-06-19 KST - Login/Signup Screen Redesign And Credentials Login

### User Request
- After the three-page service introduction, show a login/signup screen like the provided reference image.
- Required visible elements:
  - `로그인` title.
  - ID and password inputs.
  - Auto-login checkbox and forgot-password action.
  - Purple primary login button.
  - `또는` divider.
  - Kakao, Naver, Google, Apple SNS icons.
  - `계정이 없으신가요? 회원가입`.

### Reflected Work
- Replaced the logged-out social-only home panel with `LoginAuthPanel`.
- Added a NextAuth Credentials provider for guardian ID/password login.
- Added database helper `authenticateGuardianCredentials(loginId, password)`.
- Kept Google/Kakao/Naver OAuth login available as icon buttons.
- Added Apple icon as a prepared UI placeholder; Apple OAuth backend is not connected yet.
- `자동로그인` remembers only the login ID in browser storage. Passwords are not saved locally.
- Added inline status messages for missing required values, login failure, forgot-password preparation, and signup guidance.
- Added compact mobile-first CSS matching the provided reference layout.

### Files Changed
- `app/page.js`
- `app/auth-actions.js`
- `app/globals.css`
- `lib/auth.js`
- `lib/db.js`
- `deliverables/AUTH_SETUP.md`
- `deliverables/USER_MANUAL.md`
- `deliverables/user_manual_screenshots/login_redesign.png`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Local `http://localhost:3000` returned HTTP 200.
- Mobile viewport screenshot `375x667` captured successfully.
- Screenshot saved at `deliverables/user_manual_screenshots/login_redesign.png`.

### Notes
- Guardian ID/password login works after the guardian profile has saved `아이디` and `비밀번호`.
- First-time signup remains SNS-first in the current product flow.
- Apple login requires future Apple OAuth provider setup and environment values.

### Time Spent
- Implementation, build verification, screenshot review, and documentation/log update: approximately 35 minutes.
- `https://zezari.vercel.app/admin?section=ads` returned HTTP 200.
- Unauthenticated admin ads route showed the admin login gate.

## 2026-06-16 KST - Integrated User Manual Created

### User Request
- Create a user manual from the continuously maintained request/reflection logs, source code, and official deliverables.
- Include screen explanations, button functions, and queried/saved data descriptions.
- Produce the manual as a Google Docs document.
- Exclude sensitive values from `env.txt`, `.env.local`, and other secret-bearing files.

### Reflected Work
- Created Google Docs document:
  - `REAL_QR_FIND 사용자 통합 설명서`
  - `https://docs.google.com/document/d/1DdcqFv79lcAj4eCuiXaOTsJmpTKWtvBRErWJsoAidEM`
- Built the manual from:
  - `logs/DEV_HANDOFF_LOG.md`
  - `logs/PRESENTATION_PROGRESS_LOG.md`
  - existing files in `deliverables/`
  - implementation source in `app/` and `lib/`
- Documented the current user and admin flows:
  - social signup/login
  - PWA installation
  - onboarding
  - guardian dashboard
  - guardian and managed subject information entry
  - subscription payment
  - advertisement foundation
  - public QR find page
  - QR matching/download/activation
  - admin guardian, QR, role, payment, and advertisement management
  - shared progress indicators and bottom status messages
- Added local deliverable index:
  - `deliverables/USER_MANUAL.md`
- Updated deliverable index:
  - `deliverables/README.md`

### Files Changed
- `deliverables/USER_MANUAL.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- Google Docs connector readback confirmed:
  - native Google Doc title is `REAL_QR_FIND 사용자 통합 설명서`
  - document content was inserted
  - main title uses `TITLE`
  - section headings use `HEADING_1`
  - key sections such as guardian dashboard, QR management, admin management, FAQ, and maintenance rules are present
- Sensitive environment values were not read into or copied into the manual.

### Time Spent
- Source/log review, manual composition, Google Docs creation, connector readback verification, and local documentation updates: approximately 35 minutes.

### Notes For Next AI
- The Google Docs document is now the primary user-facing manual.
- Keep `deliverables/USER_MANUAL.md` as the local pointer and maintenance note.
- Future feature work should update the Google Docs manual when user-visible screens, buttons, or data behavior change.

## 2026-06-16 KST - User Manual Screenshot Examples Added

### User Request
- Add actual screen screenshots to the user manual for screens, buttons, and major features.

### Reflected Work
- Started local Next.js dev server for capture:
  - `http://localhost:3000`
- Installed Playwright Chromium browser binaries outside the repository cache so screenshots could be captured.
- Captured actual local UI screenshots into:
  - `deliverables/user_manual_screenshots/01_onboarding.png`
  - `deliverables/user_manual_screenshots/02_admin_login.png`
  - `deliverables/user_manual_screenshots/03_public_qr_unregistered.png`
  - `deliverables/user_manual_screenshots/04_login.png`
  - `deliverables/user_manual_screenshots/05_public_qr_unmatched.png`
  - `deliverables/user_manual_screenshots/06_public_qr_matched_redacted.png`
- Inserted the following selected screenshots into the Google Docs manual under `21. 실제 화면 예시`:
  - onboarding first screen
  - social login screen
  - admin login screen
  - public QR unmatched state
  - public QR matched state with private information redacted
- Did not insert the raw matched QR screenshot because it may contain subject and guardian private information.
- Deleted the raw matched QR screenshot after generating the redacted copy so private information is not retained in the deliverables folder.

### Files Changed
- `deliverables/USER_MANUAL.md`
- `deliverables/user_manual_screenshots/`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- Playwright captured the screenshots from the running local app.
- Google Docs connector readback confirmed:
  - `21. 실제 화면 예시` heading exists.
  - five image objects were inserted as `inlineObjectElement`.
  - captions are present for all five inserted screenshots.

### Limitations
- The in-app Browser plugin reported `Browser is not available: iab`, so Playwright CLI was used as the fallback capture path.
- Guardian dashboard and authenticated admin tab screenshots were not captured because they require a real logged-in guardian/admin browser session.

### Time Spent
- Screenshot capture, privacy redaction, Google Docs image insertion, verification, and logging: approximately 35 minutes.

### Notes For Next AI
- Meta API is not connected yet.
- Advertisement payment is not connected yet.
- Current `subject_ads.status` values used by UI are `active`, `paused`, `ready`, and `ended`.
- A subject cannot create another running ad while it has a `ready`, `active`, or `paused` ad.

## 2026-06-16 KST - Public QR Safe Phone Privacy

### User Request
- Do not expose the guardian's real phone number on the QR public page.
- Use a safe/relay phone number concept instead.

### Reflected Work
- Added `guardians.safe_phone` to the database schema.
- Updated schema migration logic so existing Turso databases receive `safe_phone` if missing.
- Added optional `안심번호` input to the guardian information form.
- Updated `/find/[key]` public QR page:
  - no longer selects `guardians.phone`.
  - shows `안심번호` instead of `연락처`.
  - displays `guardians.safe_phone` when present.
  - displays `안심번호 준비중` when no safe number has been issued.
- Updated official schema and QR management deliverables.
- Updated Google Docs user manual wording for public QR phone privacy.

### Files Changed
- `lib/db.js`
- `app/dashboard.js`
- `app/find/[key]/page.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Turso `guardians.safe_phone` column exists.
- Local public QR page returned HTTP 200.
- Local public QR page includes `안심번호` and `안심번호 준비중`.
- Local public QR page no longer includes the `연락처` label.

### Important Limitation
- This is the privacy-safe application foundation. A real callable safe number still requires integration with a telecom/ARS/safe-number provider that issues relay numbers and forwards calls to the guardian's private phone number.

### Time Spent
- Schema update, public QR privacy change, form update, verification, and documentation: approximately 30 minutes.

## 2026-06-16 KST - Shared Modal Close Placement And Background Scroll Lock

### User Request
- Move close buttons to the lower area for all popups.
- When the advertisement popup is open, prevent the mobile background page from scrolling by touch.
- While a popup is open, background buttons and links should not be clickable.
- Apply this commonly to all popups and future popups.

### Reflected Work
- Added shared client component:
  - `app/modal-scroll-lock.js`
- `ModalScrollLock` behavior:
  - adds `modal-open` to `html` and `body`.
  - fixes the body at the current scroll position.
  - disables document/body scroll.
  - blocks `touchmove` outside `[data-modal-surface]`.
  - restores the original scroll position when the popup closes.
- Updated current popups:
  - advertisement modal
  - QR matching modal
- Moved current popup close buttons from header to lower `.modal-footer`.
- Added shared modal classes:
  - `.modal-backdrop`
  - `.modal-surface`
  - `.modal-footer`
  - `.modal-close-button`
- Updated `deliverables/UI_STYLE_GUIDE.md` with future modal/popup guidance.

### Files Changed
- `app/modal-scroll-lock.js`
- `app/ad-campaign-modal.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/UI_STYLE_GUIDE.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Local `http://localhost:3000/` returned HTTP 200.
- Local `http://localhost:3000/admin?section=qr&assignQr=test` returned HTTP 200 and showed the admin login gate when unauthenticated.
- In-app browser verification was attempted, but the Browser plugin reported `iab` unavailable in this session.

### Deployment
- GitHub commit:
  - `e6d2176 Add shared modal scroll lock`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-b5zfen3my-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.
- `https://zezari.vercel.app/admin?section=qr&assignQr=test` returned HTTP 200.
- Unauthenticated admin route showed the admin login gate.

## 2026-06-16 KST - Mobile Dashboard Managed Card Alignment

### User Request
- On mobile dashboard, managed subject cards are visually asymmetric.
- Align the cards so the layout is balanced and consistently ordered.

### Reflected Work
- Updated mobile-only dashboard card CSS under `@media (max-width: 560px)`.
- Managed subject cards now use:
  - top row: photo column + subject information column.
  - bottom row: status badge + advertisement button in two equal columns.
- Increased mobile card padding/gap for consistent spacing.
- Set mobile photo size to `58px`.
- Made status badge and advertisement button full-width within their equal action columns.
- Added empty-card fallback alignment for the direct status badge case.

### Files Changed
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Local `http://localhost:3000/` returned HTTP 200.
- In-app browser verification was attempted, but the Browser plugin reported `iab` unavailable in this session.

### Deployment
- GitHub commit:
  - `a8e2234 Align mobile dashboard subject cards`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-bowlbyf11-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.
