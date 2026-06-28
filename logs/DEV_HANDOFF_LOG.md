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

## 2026-06-26 KST - Location Notification Kakao Map Primary Link

### User Request
- Real phone testing showed Kakao Map opens the accurate shared location.
- Change location-share push notifications from Naver-map-first back to Kakao-map-first.
- Rename user-facing map link labels from Naver map wording to Kakao Map wording.

### Reflected Work
- Changed `notifyGuardianLocationShared()` to select `kakaoMapUrl || naverMapUrl || "/"`.
- Stored notification history body now labels the selected link as `카카오맵 링크` when a Kakao URL exists.
- Changed in-app bell notification link labels so `map.kakao.com` displays `카카오맵`.
- Changed the notification action button label to `카카오맵 열기` for Kakao map URLs, while keeping Naver as a fallback.
- Kept both `kakao_map_url` and `naver_map_url` in the location-share DB model for admin/fallback use.

### Files Changed
- `lib/push.js`
- `app/notification-bell.js`
- `deliverables/LOCATION_SHARE_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors except expected Windows LF/CRLF warnings.

### Time Spent
- Kakao-map primary link switch, notification label cleanup, documentation, and build verification: about 15 minutes.

## 2026-06-25 KST - Location Notification Map Link Click Fix

### User Request
- The Naver map sharing link appears in the notification message, but it is not clickable.

### Root Cause
- Browser system push notifications do not make URLs in the notification body clickable.
- The app's in-dashboard bell notification list rendered `notification.body` as plain text, so stored Naver map URLs were also not clickable there.
- The service worker attempted to navigate existing app windows to the notification URL; for external map domains, opening a new window is more reliable.

### Reflected Work
- Changed location-share notification URL selection to Naver-first with Kakao fallback.
- Kept a stored map URL in the notification history body for audit/readback.
- Rendered URLs inside in-app bell notification bodies as clickable anchors.
- Added an explicit `지도 열기` button in each bell notification when `notification.url` exists.
- Stopped notification swipe/delete pointer handlers from swallowing link clicks.
- Updated the service worker cache version and changed external notification click URLs to open in a new browser window.

### Files Changed
- `lib/push.js`
- `public/sw.js`
- `app/notification-bell.js`
- `app/globals.css`
- `deliverables/LOCATION_SHARE_MANAGEMENT.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors except expected Windows LF/CRLF warnings.

### Time Spent
- Notification diagnosis, link rendering fix, service-worker click handling, documentation, and build verification: about 20 minutes.

## 2026-06-25 KST - Public QR Location Share And Admin Location Management

### User Request
- Add an administrator `위치공유관리` menu and page.
- Add a `위치공유` button to the public QR page so the finder can grant phone/browser location permission.
- Store the shared location, notify the guardian by push, and include a Kakao or Naver map link in the notification.
- Let administrators review shared-location history in a grid similar to the provided wireframe.

### Reflected Work
- Added a new `location_shares` Turso table and schema migration with share timestamp, QR, guardian, subject, finder contact, location memo, latitude, longitude, accuracy, Kakao map URL, Naver map URL, user-agent, and request IP snapshot.
- Added a public QR geolocation client button with optional finder contact and location description fields.
- Added `POST /api/find/[key]/location` to validate the QR and active service state, store the shared location, and send the guardian push notification when push is configured.
- Limited location sharing to enabled QR codes that have been activated by the owning guardian and are covered by an active paid service period.
- Added `notifyGuardianLocationShared` so guardian notification history and web-push payloads include map links.
- Added the admin sidebar menu item `위치공유 관리`.
- Added `/admin?section=locations` with search/date filters, a dense grid, selected row highlighting, and a right detail panel with map preview, Kakao/Naver links, coordinates, accuracy, safe phone, finder contact, and subject/guardian admin links.
- Updated global CSS using the existing admin master/detail style and public QR button style.
- Updated official deliverables, database schema documentation, and image prompt archive.

### Files Changed
- `lib/db.js`
- `lib/push.js`
- `app/api/find/[key]/location/route.js`
- `app/find/[key]/location-share-button.js`
- `app/find/[key]/page.js`
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/LOCATION_SHARE_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- `git diff --check` returned no whitespace errors except expected Windows LF/CRLF warnings.
- `npm run build` succeeded before deployment.
- Local Next dev server on port `3010` returned HTTP 200 for `/` and `/admin?section=locations`.
- `POST /api/find/__codex_missing_key__/location` returned HTTP 400 with `등록되지 않은 QR입니다.`, confirming the new API route loads and reaches QR validation.
- `agent-browser` CLI was not available in PATH, so browser visual automation could not be run in this environment.
- Full mobile geolocation permission flow still requires a real browser/device permission test after deployment.

### Time Spent
- DB/API/push/admin/public QR UI/CSS/documentation/build verification: about 40 minutes.

## 2026-06-25 KST - Admin Advertisement Grid Management

### User Request
- Change the administrator advertisement management screen from card layout to grid layout.
- Show advertisement number, managed subject, guardian, status, advertisement region, period, cost, and clicks.
- Add top buttons for advertisement approval, pause, resume, and detail view.
- Keep the design ready for future Meta Ads API integration.

### Reflected Work
- Replaced the admin advertisement card list with a grid/master-detail operations layout.
- Added advertisement search and status filtering for the admin ad section.
- Added selected-row URL state via `ad=<id>` and right-side detail display.
- Added admin-only status mutation action:
  - `approve` sets ad status to `active`.
  - `pause` sets ad status to `paused`.
  - `resume` sets ad status to `active`.
- Added disabled-button rules when the selected ad is not in a valid state for that action.
- Added `subject_ads.click_count` as a Meta reporting placeholder and bumped `DB_SCHEMA_VERSION` to 7.
- Updated Korean ad status labels:
  - `active` -> `광고중`
  - `paused` -> `정지중`
  - `ready` -> `승인대기`
  - `ended` -> `만료`
- Updated advertising and database deliverables plus the cumulative image prompt archive.

### Files Changed
- `lib/db.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/ADMIN_AD_GRID_MANAGEMENT.md`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors.

### Time Spent
- Admin ad grid conversion, DB placeholder, action wiring, responsive CSS, documentation, and build verification: about 35 minutes.

### Deployment
- GitHub commit: `c4288df Convert admin ads to grid management`
- Vercel production deployment: `https://zezari-q8466w9ph-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment state: Ready
- Production home check: HTTP 200.

### Notes For Next AI
- Meta Ads API is still not connected.
- Future integration should map Meta campaign approval/pause/resume calls to the new admin actions and periodically sync clicks into `subject_ads.click_count`.
- The current guardian-facing ad request flow still creates internal ad rows directly; admin approval is now available as an operations control.

## 2026-06-25 KST - Admin Missing Report Management Menu

### User Request
- Add a missing report menu to the administrator page.
- Show report date/time, managed subject, guardian, report status, advertisement status, and found status in a grid.

### Reflected Work
- Added `실종신고 관리` to the left administrator menu.
- Added `/admin?section=missing` as a recognized admin section.
- Added a missing report management grid with:
  - 신고일시
  - 대상자
  - 보호자
  - 신고상태
  - 광고상태
  - 발견여부
- Added integrated search by subject, guardian, phone, or email.
- Added report date start/end filters.
- Changed the dashboard recent `실종신고 현황` "더보기" link to open the new missing report management screen.
- Added `getAdminMissingReportsData` in `lib/db.js`.
- The current implementation derives missing reports from `subjects.status = '찾는중'` and latest `subject_ads` history because no dedicated `missing_reports` table exists yet.

### Files Changed
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADMIN_MISSING_REPORT_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors.

### Time Spent
- Menu wiring, query function, grid UI, responsive CSS, documentation, and build verification: about 30 minutes.

### Notes For Next AI
- If missing report lifecycle becomes more detailed, introduce a dedicated `missing_reports` table rather than continuing to infer reports from subject current status and latest advertisement history.

## 2026-06-24 KST - Naver New Key and Toss Live Key Transition

### User Request
- Keep the new Naver credentials already active in `.env.local`.
- Comment the previous Toss credentials and activate the commented Toss live credentials.
- Test the affected functions, push the documentation to GitHub, deploy to Vercel, and verify production.

### Reflected Work
- Preserved the active Naver Client ID/Secret without changing their values.
- Commented the previous active Toss Client/Secret lines in `.env.local`.
- Activated the Toss live Client/Secret lines in `.env.local`.
- Updated Vercel Production with the new Naver credentials and Toss live credentials.
- Updated Vercel Development with the new Naver credentials.
- Kept the existing Toss test credentials in Vercel Development so development payments remain non-live.
- Kept all credential values out of Git, logs, command output, and deliverables.

### Verification
- `npm run build` succeeded with the switched local environment.
- Local Naver provider exposure and redirect to `nid.naver.com` succeeded.
- The local Naver authorization URL used the newly configured Client ID.
- Toss live key format validation succeeded.
- A read-only Toss Payments API request authenticated successfully and returned the expected `404 NOT_FOUND_PAYMENT` for a nonexistent payment key.
- No payment approval, billing-key issuance, charge, cancellation, or refund was executed.
- Production root and `/api/auth/providers` returned HTTP 200.
- Production Naver sign-in redirected to `nid.naver.com` and used the newly configured Client ID.
- Vercel Sensitive variables cannot be read back through `vercel env pull`; their values were verified through successful update/deployment and runtime behavior instead.

### Deployment
- Vercel deployment: `https://zezari-171s2oo07-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment status: Ready

### Operational Notes
- A complete Naver login requires the Naver developer console to allow `https://zezari.vercel.app/api/auth/callback/naver`.
- A complete Toss production checkout must be performed manually by an authorized operator because it creates a real financial transaction.
- After the first controlled live payment, verify payment approval, order state, cancellation, refund, and settlement records.

### Time Spent
- Environment transition, safe credential validation, build, deployment, and production checks: about 35 minutes.

## 2026-06-24 KST - Collapsible Admin Sidebar Navigation

### User Request
- Move the administrator tabs from the top of the page to a vertical menu on the left.
- Allow the vertical menu to be hidden and shown again.

### Reflected Work
- Added `app/admin/admin-workspace.js` as a client-side layout component.
- Moved all seven administrator sections into a left vertical navigation panel.
- Added an accessible icon button for hiding and expanding the menu.
- Stored the collapsed state in `localStorage`, so the preference survives reloads and section navigation.
- Preserved all existing section URLs, server-side data loading, forms, filters, and active-section behavior.
- Expanded the administrator shell maximum width to accommodate the navigation and work area.
- Added a responsive one-column layout below 860px so the menu does not reduce mobile content width.
- Added focus, hover, and reduced-motion styles consistent with the project CSS tokens.

### Verification
- `npm run build` succeeded twice, including after the responsive-order correction.
- Desktop expanded sidebar measured 216px and contained seven menu links.
- Desktop collapsed sidebar measured 56px and hid the menu links.
- Reload preserved the collapsed state.
- The `주문/배송` active menu state was correctly highlighted.
- Mobile placed content below the expanded menu and produced no horizontal overflow.
- Desktop expanded/collapsed and mobile screenshots were visually inspected; no clipping or overlap was found.
- Visual testing used a temporary local SQLite database, not the operating Turso database.
- The temporary database, test user, and screenshots were deleted after verification.
- The in-app browser connection was unavailable due to a runtime metadata error, so installed Chrome was controlled with Playwright as the fallback.

### Deliverable
- `deliverables/ADMIN_SIDEBAR_NAVIGATION.md`
- Includes implementation structure, behavior, test results, and a presentation image prompt.

### Time Spent
- Source review, implementation, responsive correction, authenticated visual verification, and documentation: about 35 minutes.

### GitHub and Production
- GitHub commit: `85e6e3b Add collapsible admin sidebar`
- Vercel deployment: `https://zezari-80jqysx8b-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment status: Ready

## 2026-06-24 KST - Administrator Operations Dashboard

### User Request
- Add a dashboard above Guardian Management in the administrator menu.
- Show cards for total members, managed subjects, active QR codes, missing reports, active ads, monthly revenue, product revenue, and subscription revenue.
- Follow the supplied screenshot for composition while keeping the project CSS style.

### Reflected Work
- Added Dashboard as the first administrator menu and default `/admin` section.
- Moved Guardian Management to the explicit `section=guardians` route and repaired guardian selection/return URLs.
- Added a month picker for revenue lookup.
- Added eight responsive metric cards using the existing government-style color and spacing tokens.
- Added `getAdminDashboardData()` with batched count and revenue queries.
- Defined an active QR as both administrator-enabled and user-activated.
- Defined an active missing report as a subject with status `찾는중`.
- Defined an active advertisement as `subject_ads.status = 'active'`.
- Split paid monthly order revenue into standalone product and subscription sales.
- Added unmatched latest subscription payments while preventing duplicate counting against subscription product orders.
- Calculated month boundaries using Korean time through SQLite `+9 hours` conversion.

### Verification
- `npm run build` succeeded.
- Isolated SQLite fixtures produced the exact expected eight metrics: 2 members, 3 subjects, 1 active QR, 1 missing report, 1 active ad, KRW 5,000 product revenue, KRW 36,900 subscription revenue, and KRW 41,900 monthly revenue.
- Changing the selected month to May 2026 produced KRW 7,000 monthly revenue.
- Dashboard was the active default menu and Guardian Management routing remained functional.
- Playwright/Chrome visual checks confirmed four desktop columns, one mobile column, and no horizontal overflow.
- The temporary database, administrator account, and screenshots were deleted after verification.

### Data Limitation
- Recurring subscription payment history is currently derived from paid subscription orders plus the latest unmatched subscription payment.
- A dedicated payment transaction ledger will be needed for multiple recurring billing cycles, cancellations, refunds, and settlement reconciliation.

### Deliverable
- `deliverables/ADMIN_DASHBOARD_METRICS.md`
- Includes metric definitions, implementation map, validation values, operational limits, and a presentation image prompt.

### Time Spent
- Data definition, implementation, route correction, isolated aggregate testing, visual verification, and documentation: about 45 minutes.

### GitHub and Production
- GitHub feature commit: `620e0dd Add administrator metrics dashboard`
- Vercel deployment: `https://zezari-kartwiqqy-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment status: Ready
- Authenticated production dashboard returned HTTP 200 and rendered all eight metric labels.

## 2026-06-24 KST - Administrator Dashboard Recent Status

### User Request
- Add a Recent Status section below the eight dashboard metric cards.
- Add five cards showing the latest four members, orders, QR activation requests, missing reports, and customer inquiries.
- Show the requested identifying text and date/time in each card.
- Add a More link below every card and connect it to the relevant screen when available.

### Reflected Work
- Added five recent-status cards below the operations metrics.
- Added recent guardian, order, pending QR activation, missing-report, and inquiry reads to the existing dashboard DB batch.
- Limited each recent query to four rows ordered newest first.
- Defined pending QR activation as an administrator-enabled matched QR without `activated_at` whose subject status is `QR활성화필요`.
- Used the latest paid order time as the QR request time, with QR/subject update time as fallback.
- Used the subject `updated_at` time as the current missing-report date because a separate report history table does not yet exist.
- Formatted recent timestamps in Korean time as `YYYY.MM.DD HH:mm`.
- Connected More links to Guardian Management, Orders/Shipping, QR Management, Advertisement Management, and Customer Inquiries.
- Raised DB schema version from 3 to 4 and added `customer_inquiries` plus its created-time index.
- Added a read-only Customer Inquiry administrator screen and sidebar menu item.

### Verification
- `npm run build` succeeded after all changes.
- Seeded five isolated records per recent category and confirmed only the newest four were rendered in descending order.
- Confirmed all five More destinations returned HTTP 200.
- Confirmed the Customer Inquiry page rendered all five seeded inquiries.
- Confirmed schema version 4.
- Playwright/Chrome screenshots verified five desktop columns, one mobile column, readable wrapping, and no horizontal overflow.
- Deleted the isolated database, test account, fixtures, and screenshots.

### Known Follow-up
- User-side inquiry submission is not implemented yet; the table and administrator read screen are ready for that future flow.
- A dedicated missing-report history table will be needed to preserve repeated report/closure events instead of using the subject's latest status update time.

### Deliverable
- `deliverables/ADMIN_DASHBOARD_RECENT_STATUS.md`
- Includes data definitions, routing, schema notes, verification, and a presentation image prompt.

### Time Spent
- Data mapping, schema preparation, UI, links, isolated five-record testing, responsive verification, and documentation: about 50 minutes.

### GitHub and Production
- GitHub feature commit: `68cbe18 Add admin dashboard recent status`
- Vercel deployment: `https://zezari-m5i4jao30-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment status: Ready
- Authenticated production dashboard and inquiry screen returned HTTP 200.
- Production Turso schema version 4 and `customer_inquiries` table were confirmed.

## 2026-06-24 KST - Split Guardian and Subject Administration

### User Request
- Split the combined Guardian Management screen into separate Guardian and Managed Subject menu sections.
- Guardian list columns: member number, name, phone, email, joined date, status.
- Guardian detail: shipping address, registered-subject link, subscription, payments, advertisements, administrator memo.
- Subject list columns: name, gender, birth date, guardian, status, QR status.
- Subject detail: basic information, guardian message, guardian voice, additional information.
- Follow the supplied screenshots for composition while keeping the project CSS style.

### Reflected Work
- Added `관리대상자 관리` directly after Guardian Management in the administrator sidebar.
- Rebuilt Guardian Management as a clickable master grid and a selected-guardian detail panel.
- Added guardian integrated search and active/inactive filtering.
- Displayed a stable short member number derived from the final eight characters of the existing guardian ID.
- Added shipping address, subject link, latest subscription snapshot, ten recent payments, ten recent ads, and internal memo sections.
- Added administrator-authorized memo save action with a 2,000-character limit.
- Added schema version 5 and `guardians.admin_memo` migration.
- Added a separate Managed Subject master grid and selected-subject detail panel.
- Added subject/guardian search, subject status filter, QR state filter, and guardian-specific linking.
- Added QR states for active, activation pending, inactive, and unassigned.
- Added subject photo, guardian link/contact, guardian message, audio player, photo filename, QR code/state/public link, and timestamps.
- Kept photo and voice blobs out of list queries; voice data loads only for the selected subject.

### Verification
- `npm run build` succeeded after the implementation and layout correction.
- Isolated DB migrated to schema version 5 and contained `admin_memo`.
- Guardian grid rendered six columns and two selectable rows without desktop inner overflow.
- Guardian detail rendered shipping, subject link, subscription, payment, advertisement, and memo information.
- Memo save returned HTTP 303, showed the success notice, and persisted to the isolated DB.
- Inactive guardian filtering returned one expected row.
- Subject grid rendered six columns and four QR-state variants without desktop inner overflow.
- Subject detail rendered guardian message, audio, photo filename, QR code, and guardian link.
- Inactive QR filtering returned one expected row.
- Desktop used two master/detail columns; mobile used one column with no page overflow.
- Temporary DB, credentials, fixtures, voice data, and screenshots were deleted.

### Deliverable
- `deliverables/ADMIN_GUARDIAN_SUBJECT_MANAGEMENT.md`
- Includes screen contracts, query boundaries, schema changes, validation, and two presentation image prompts.

### Time Spent
- Data design, schema migration, actions, two master/detail screens, filtering, visual correction, authenticated testing, and documentation: about 75 minutes.

### GitHub and Production
- GitHub feature commit: `aec4921 Split guardian and subject administration`
- Vercel deployment: `https://zezari-kuey3f4bf-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment status: Ready
- Authenticated production Guardian, Subject, and Orders screens returned HTTP 200.
- Production Turso schema version 5 and `guardians.admin_memo` were confirmed.

## 2026-06-23 KST - Legacy Kakao/Naver and Toss Integration

### User Request
- Use the legacy zezari site under `reference/` to integrate Kakao login, Naver login, and Toss Payments into the current Vercel app.
- Apply locally and test before production deployment.

### Reference Findings
- `reference/wp.tar.gz` contains WordPress core, but `wp-content` is an external symlink and plugin PHP sources are absent.
- `reference/wp.sql` contains active plugin and configuration records.
- Social login came from `mshop-members-s2`; Kakao used client ID only with `profile_nickname`, while Naver used client ID and secret.
- Toss came from the WooCommerce PGALL gateway in production mode with card, bank transfer, and virtual account enabled.
- The dump contains production credentials and personal data, so `reference/` was added to `.gitignore`.
- Added `.vercelignore` after verifying that Vercel CLI does not reliably inherit the local Git exclusion for an untracked reference dump.

### Reflected Work
- Added provider-specific environment requirements; Kakao no longer incorrectly requires a client secret.
- Added Kakao public-client token authentication and the legacy `profile_nickname` scope.
- Copied Kakao/Naver credentials from the dump to local `.env.local` without printing values.
- Added standalone Toss card, bank transfer, and virtual account selections; subscriptions remain card billing only.
- Added server-side payment method allowlists.
- Added guardian ownership checks for product orders and subscriptions.
- Added expected order ID, amount, Toss approved amount, and `DONE` status validation.
- Added idempotent success-page handling and restricted order paid updates to pending states.

### Verification
- `npm run build` succeeded after integration.
- Local providers endpoint returned credentials, Google, Kakao, and Naver.
- Kakao sign-in generated `kauth.kakao.com`, scope `profile_nickname`, callback `/api/auth/callback/kakao`.
- Naver sign-in generated `nid.naver.com`, callback `/api/auth/callback/naver`.
- In-app browser startup failed in the managed Windows sandbox, so DOM screenshot testing was unavailable.
- Approved temporary Turso tests confirmed `TRANSFER` and `VIRTUAL_ACCOUNT` order preparation, rejected an unsupported method with HTTP 400, and removed both temporary orders (`remainingTests=0`).
- Cross-guardian product-order and subscription callback attempts were blocked before any Toss approval request.
- Added Kakao and Naver configuration to Vercel Production and Development without exposing values.
- Production providers endpoint exposes credentials, Google, Kakao, and Naver; Kakao and Naver redirect to their official authorization hosts.
- Clean production deployment `https://zezari-2rut2jo77-zezari.vercel.app` was built from 94 application files with the reference dump excluded.

### Deployment
- GitHub commit: `6fb9a79 Harden social auth and Toss payment flows`
- Production alias: `https://zezari.vercel.app`

### Files Changed
- `.gitignore`
- `.env.example`
- `lib/auth.js`
- `lib/db.js`
- `app/shop-checkout-client.js`
- `app/payments/toss/product/success/page.js`
- `app/payments/toss/subscription/success/page.js`
- `deliverables/REFERENCE_AUTH_TOSS_INTEGRATION.md`
- `.vercelignore`

## 2026-06-20 KST - Keep Admin Order Tab Visible

### User Report
- The administrator could not see the newly added order/shipping tab.

### Root Cause and Fix
- The tab existed in authenticated production HTML, but the admin navigation used horizontal overflow and placed the tab near the right edge.
- Moved `주문/배송` to the second menu position immediately after `보호자 관리`.
- Replaced horizontal scrolling with an auto-fitting grid so every admin tab wraps and remains visible at narrow widths.

### Verification and Deployment
- Local and Vercel production builds succeeded.
- Authenticated production admin HTML returned HTTP 200.
- Verified `주문/배송` exists and appears between `보호자 관리` and `QR 관리`.
- GitHub commit: `7dae21c Keep admin order tab visible`
- Vercel deployment: `https://zezari-gsj4yjnj4-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`

## 2026-06-20 KST - Admin Order and Shipping Management

### User Request
- Add standard shopping-mall administration capabilities such as order lookup, delivery processing, and tracking-number entry.

### Reflected Work
- Added an `주문/배송` admin section.
- Added order summary counts, integrated keyword search, payment filters, and fulfillment filters.
- Added order, product, guardian, subject, recipient, full shipping address, payment, and timestamp views.
- Separated payment state from fulfillment state.
- Added fulfillment states: pending, preparing, shipped, delivered, and cancelled.
- Added carrier, tracking number, internal admin memo, shipped time, and delivered time controls.
- Blocks shipping processing before payment completion.
- Requires carrier and tracking number for shipped or delivered states.
- Automatically changes paid orders to fulfillment `preparing`.
- Creates guardian bell notifications when an order is shipped or delivered.
- Added shipping status and tracking information to the guardian billing history.
- Added recipient name and phone snapshots to newly created orders.

### Database
- Schema version increased to `3`.
- Added `fulfillment_status`, `recipient_name`, `recipient_phone`, `carrier`, `tracking_number`, `admin_memo`, `shipped_at`, and `delivered_at` to `product_orders`.

### Files Changed
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/account/billing/page.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADMIN_ORDER_SHIPPING.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- Local and Vercel production builds succeeded.
- Authenticated local admin order page returned HTTP 200 and rendered shipping controls.
- Temporary paid order server-action test returned HTTP 303 and saved fulfillment status, carrier, tracking number, and memo.
- Temporary order was deleted; remaining test rows were `0`.
- Guardian billing history rendered shipping status.
- Production public and authenticated admin pages returned HTTP 200.
- Production DB schema version is `3` and all shipping columns exist.
- In-app browser was unavailable, so visual screenshot inspection could not be performed.

### Deployment
- GitHub commit: `16302dd Add admin order and shipping management`
- Vercel production deployment: `https://zezari-ozrcklodp-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`

## 2026-06-20 KST - Kakao Address Search Fix and Detail Address Support

### User Request
- Fix the address search button that did not respond.
- Add a separate detail-address input.
- Carry both the base address and detail address into product-order shipping information.

### Root Cause
- The postcode component checked and instantiated `window.kakao.Postcode`.
- The Kakao postcode bundle exposes the service as `window.daum.Postcode`, so the old readiness check never succeeded.
- The previous popup flow could also be blocked in mobile browsers or an installed PWA after asynchronous script loading.

### Reflected Work
- Corrected the postcode namespace to `window.daum.Postcode`.
- Replaced the popup window with a modal containing the postcode service's embedded search UI.
- Added script preloading, a 10-second timeout, retry cleanup, loading text, and a user-facing load error.
- Added a separate detail-address field and moved focus to it after selecting a base address.
- Added `guardians.address_detail` and `product_orders.shipping_address_detail` with schema version `2`.
- Connected detail-address persistence to guardian profile save and display.
- Pre-filled checkout shipping fields from the guardian's saved base/detail address.
- Passed both address values through subscription and standalone Toss payment preparation routes and stored them in the order draft.
- Displayed the combined address on My Page and the activated public QR page.

### Files Changed
- `app/kakao-postcode-address.js`
- `app/dashboard.js`
- `app/shop-checkout-client.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `lib/db.js`

### Verification
- `npm run build` succeeded locally and on Vercel.
- `git diff --check` passed with only existing CRLF warnings.
- Local app and Kakao postcode bundle both returned HTTP 200.
- Authenticated guardian HTML contained the address-search button and `addressDetail` field.
- Turso schema version is `2`; both detail-address columns exist.
- Production public and authenticated guardian pages returned HTTP 200.
- In-app browser was unavailable, so visual click automation was replaced with build, script, authenticated HTML, and DB checks.

### Deployment
- GitHub commit: `6a456f1 Fix Kakao address search and detail fields`
- Vercel production deployment: `https://zezari-qy3k3xtve-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`

## 2026-06-19 KST - Product Shop Flow And Admin Product Catalog

### User Request
- Remove the dashboard `구독결제하기` button and top subscription period/price select box.
- Connect the existing dashboard `상품 구매` button to a new product page.
- Build a product selection page based on the supplied screenshots, using the screenshots as structure references only and keeping the project's existing CSS language.
- Products should be based on images uploaded by an admin.
- After selecting a product, users choose a target subject and subscription period.
- Standalone product purchase should be selectable only by already-subscribed customers.

### Reflected Work
- Removed the dashboard top subscription payment/select UI from `StatusDashboard`.
- Changed the dashboard `상품 구매` quick action to `/shop`.
- Added product catalog tables:
  - `products`
  - `product_orders`
- Seeded default product rows:
  - 스티커
  - 팔찌
  - 목걸이
  - 키링
- Added admin product management:
  - product image upload
  - product name/description
  - standalone unit price
  - active/hidden toggle
  - display sort order
- Added `/shop` product selection page.
- Added product checkout/detail client:
  - design choice placeholders
  - quantity stepper
  - target subject selection
  - subscription period selection
  - standalone purchase tab gated by active subscription
- Updated subscription prepare API so `/shop` subscription checkout records product selection as a `product_orders` row with `subscription_pending`.
- Added standalone product order API:
  - `POST /api/products/orders`
  - stores `standalone_requested` only when the guardian has an active subscription.
- Added project-style CSS for shop and admin product catalog screens.
- Updated local user manual index and database schema deliverable.

### Files Changed
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/api/products/orders/route.js`
- `app/dashboard.js`
- `app/globals.css`
- `app/shop/page.js`
- `app/shop-checkout-client.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- `lib/db.js`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `git diff --check` passed.
- `npm run build` succeeded.
- Temporary local production server on port `3001` returned HTTP 200 for:
  - `/`
  - `/shop`

### Deployment
- GitHub commit:
  - `a10b693 Unify guardian tab styling`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-fmjo05wud-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/shop` returned HTTP 200.
- Build output includes:
  - `/shop`
  - `/api/products/orders`
- Temporary local production server on port `3001` returned HTTP 200 for:
  - `http://127.0.0.1:3001/shop`
  - `http://127.0.0.1:3001/admin?section=products`
- Temporary verification server was stopped after route checks.

### Deployment
- GitHub commit:
  - `8cfd778 Add product shop flow`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-31xgubkr0-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/shop` returned HTTP 200.
- `https://zezari.vercel.app/admin?section=products` returned HTTP 200.

## 2026-06-19 KST - Product Order Steps And QR Activation Gate

### User Request
- The right-side capture area on the product selection detail screen was only an explanation for standalone purchase; remove it from the default screen and show it only when standalone purchase is selected.
- After product selection, `다음` should show a product detail/preview page using the admin-uploaded product image/design.
- Change the preview button text from `결제하기` to `주문정보입력`.
- After `주문정보입력`, show shipping address and payment-method selection, then proceed with actual Toss payment.
- After payment completion, show an order-complete page.
- After the user receives the physical product, scanning its QR should open the target page; if the guardian is logged in, the page should show a QR activation button.
- The subscription period should start only after QR activation.
- QR public pages must hide managed-subject information until the QR code has been activated by the guardian.

### Reflected Work
- Rebuilt `ShopCheckoutClient` into a multi-step flow:
  - configure product/design/quantity/subject/period
  - product preview
  - order information and payment method
  - Toss payment request
- Standalone purchase details now appear only when the user selects the standalone purchase tab.
- Standalone purchase remains disabled unless `subscription.status === active`.
- Added Toss product payment flow:
  - `POST /api/payments/toss/product/prepare`
  - `/payments/toss/product/success`
  - `/payments/toss/product/fail`
  - server-side `confirmPayment` using Toss Payments confirm API.
- Subscription checkout from `/shop` now saves product order data and returns success URL containing `productOrderId`.
- Subscription payment from shop marks subscription as `ready` and product order as `paid_waiting_activation`; it does not start the subscription period immediately.
- Added QR activation state:
  - `qr_codes.activated_at`
- Added product order fields:
  - `design_index`
  - `shipping_address`
  - `payment_method`
  - `toss_order_id`
  - `payment_key`
  - `paid_at`
  - `activated_at`
- Added guardian QR activation server action:
  - `activateQrAction`
  - `activateQrForGuardian`
- Public QR page behavior changed:
  - inactive admin QR still shows unavailable state.
  - unassigned QR still shows unmatched state.
  - assigned but not guardian-activated QR hides subject/guardian information.
  - owning logged-in guardian sees the activation button.
  - activated QR shows the managed subject and guardian response information.
- Finder push notification API now rejects QR codes that are not guardian-activated.
- Updated database schema and user manual local deliverables.

### Files Changed
- `app/actions.js`
- `app/api/find/[key]/notify/route.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `app/payments/toss/product/fail/page.js`
- `app/payments/toss/product/success/page.js`
- `app/payments/toss/subscription/success/page.js`
- `app/shop/page.js`
- `app/shop-checkout-client.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- `lib/db.js`
- `lib/toss-payments.js`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `git diff --check` passed.
- `npm run build` succeeded.
- Build output includes:
  - `/api/payments/toss/product/prepare`
  - `/payments/toss/product/success`
  - `/payments/toss/product/fail`
  - `/find/[key]`
  - `/shop`
- Temporary local production server on port `3001` returned HTTP 200 for:
  - `/shop`
  - `/payments/toss/product/fail`
  - `/admin?section=products`
- Browser payment flow could not be fully completed in this session because Toss checkout requires interactive external payment approval.

### Deployment
- GitHub commit:
  - `332206a Add staged product payment and QR activation`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-4vta9rbcd-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/shop` returned HTTP 200.
- `https://zezari.vercel.app/payments/toss/product/fail` returned HTTP 200.
- `https://zezari.vercel.app/admin?section=products` returned HTTP 200.

## 2026-06-19 KST - Unify Guardian User Tab Styles

### User Request
- The user-facing tabs `대시보드`, `보호자정보`, and `관리대상정보` have inconsistent styling.
- Unify all three tabs using the `관리대상정보` style as the baseline.
- On the dashboard, make managed subject photos about 1.7x larger.

### Reflected Work
- Added CSS overrides so the dashboard status panel, guardian information panel, summary/setup panels, and subject information heading share the same card style:
  - `width: min(100%, 760px)`
  - `var(--radius-md)` radius
  - `0.5px` project border
  - `var(--shadow-card)` card shadow
  - left-aligned card headers matching subject edit cards
- Removed the remaining phone-mockup feel from the dashboard status panel by overriding the heavy border and narrow width.
- Increased dashboard managed subject photo size from the earlier ~48-58px range to ~82-88px depending on viewport.
- Updated managed subject cards to use wider grid columns and larger card height so the larger photo fits cleanly.
- Added mobile-specific alignment so enlarged photos and action buttons do not overflow.

### Files Changed
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `git diff --check` passed.
- `npm run build` succeeded.

## 2026-06-19 KST - My Page Corner Icon And Guardian Notification Inbox

### User Request
- Remove My Page from the main user tab menu.
- Place a person-shaped My Page icon at the top-right of the user screen.
- Show a hover tooltip saying `마이페이지` on the person icon.
- Place a bell icon at the top-left of the user screen.
- Show push notification messages from the bell icon.
- Keep the bell and person icon visually opposed: bell on the left, person on the right.

### Reflected Work
- Removed the visible `마이페이지` tab from the guardian menu.
- Kept the three main user tabs:
  - `대시보드`
  - `보호자정보`
  - `관리대상정보`
- Added top utility controls for completed/active guardian accounts:
  - left: bell icon notification panel.
  - right: person icon My Page launcher.
- Added CSS hover tooltip for the person icon using `data-tooltip="마이페이지"`.
- Changed My Page to open as a modal overlay through `?panel=my`.
- Kept old `?tab=my` URL compatibility by opening the same My Page overlay on the dashboard.
- Reused `ModalScrollLock` so the background page is not selectable/scrollable while My Page is open.
- Added `app/notification-bell.js`:
  - loads recent guardian notifications from `/api/notifications`.
  - shows unread count.
  - opens a notification popover.
  - marks notifications read when opened.
  - refreshes when the service worker receives a push message.
- Added `/api/notifications`:
  - `GET`: return logged-in guardian notification messages.
  - `POST { action: "mark-read" }`: mark logged-in guardian notifications as read.
- Added `guardian_notifications` DB table:
  - stores title/body/url/read state per guardian.
- Updated push send flow:
  - when a finder clicks `보호자에게 알리기`, the server stores an in-app notification before Web Push delivery.
  - Web Push payload includes notification metadata.
  - the service worker broadcasts `ZEZARI_PUSH_MESSAGE` to open app windows.
- Changed dashboard quick action `내 정보` to open `/?tab=dashboard&panel=my`.
- Updated service worker cache name to `zezari-v14`.

### Files Changed
- `app/dashboard.js`
- `app/page.js`
- `app/notification-bell.js`
- `app/api/notifications/route.js`
- `app/globals.css`
- `lib/db.js`
- `lib/push.js`
- `public/sw.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/PUSH_NOTIFICATION_SETUP.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- UI restructuring, notification storage/API/service-worker wiring, documentation, and build verification: approximately 40 minutes.

### Deployment
- GitHub commit:
  - `7c98dd4 Move my page to corner actions and add notification inbox`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-itn02cnr3-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.
- `https://zezari-itn02cnr3-zezari.vercel.app` returned HTTP 200.
- `https://zezari.vercel.app/api/notifications` returned HTTP 401 when unauthenticated, confirming the notification inbox API is session-protected.

## 2026-06-19 KST - Direct Guardian Signup Flow

### User Request
- For first-time visitors who are not signed up, add a signup process like the provided reference.
- Signup process:
  - phone verification.
  - guardian basic information input.
  - signup completion.
- Push the work to GitHub automatically after implementation.

### Reflected Work
- Added a direct signup mode inside the logged-out auth panel.
- The `회원가입` button now opens the signup flow instead of only showing an 안내 message.
- Added direct route support for `/?signup=1` to open the signup screen after onboarding is skipped.
- Signup step 1:
  - phone number input.
  - test-mode verification code request.
  - five-digit verification input.
  - verification timer display.
- Signup step 2:
  - guardian name.
  - birth date.
  - verified phone number.
  - app login ID.
  - app password.
  - required privacy/service agreement checkboxes.
- Signup step 3:
  - completion screen.
  - `대상자 등록하기` signs in and moves to `/?tab=info#subjects-info`.
  - `대시보드 바로가기` signs in and moves to `/?tab=dashboard`.
- Added `POST /api/signup/guardian`.
- Added guardian DB fields:
  - `birth_date`
  - `phone_verified_at`
  - `terms_privacy_agreed_at`
  - `terms_service_agreed_at`
- Added `createGuardianSignup` server-side validation:
  - required fields.
  - phone format.
  - birth date format.
  - login ID format.
  - strong password.
  - duplicate login ID.
  - duplicate phone.
  - required terms agreement.
- Passwords continue to be stored only as PBKDF2 hashes.
- Guardian dashboard completeness no longer requires email, because the new reference signup flow does not collect email.
- Guardian profile editing now preserves/edits guardian birth date.

### Files Changed
- `app/page.js`
- `app/auth-actions.js`
- `app/api/signup/guardian/route.js`
- `app/dashboard.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/AUTH_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- `deliverables/user_manual_screenshots/signup_phone_step.png`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Local `http://localhost:3000/?signup=1` returned HTTP 200.
- Playwright screenshot found `.signup-card` and captured the phone verification screen.
- Screenshot saved at `deliverables/user_manual_screenshots/signup_phone_step.png`.
- `POST /api/signup/guardian` with missing values returned HTTP 400 with a Korean validation message.

### Important Limitation
- Phone verification is currently test mode: the verification code is displayed in the page message.
- Before real production identity verification, connect an SMS provider and move code generation/verification to server-side storage.

### Time Spent
- Signup UI/API/schema implementation, build, screenshot check, API validation, and documentation/log update: approximately 55 minutes.

### Deployment
- GitHub commit:
  - `f6dad88 Add direct guardian signup flow`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-aoit7tb7g-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/?signup=1` loaded the signup screen and `.signup-card` was found.
- Production screenshot captured at `.next/prod-signup-phone-step.png`.
- `POST https://zezari.vercel.app/api/signup/guardian` with missing values returned HTTP 400 with a Korean validation message.

## 2026-06-19 KST - SNS First Login Signup Completion

### User Request
- Direct signup currently asks for signup information only when the `회원가입` button is pressed.
- When a user presses an SNS simple-login button, first-time users should also enter signup information.
- If the SNS provider returns values such as name, prefill those fields.
- Existing signed-up users should go directly to the dashboard.

### Reflected Work
- Added authenticated SNS signup completion screen:
  - `app/social-signup-completion.js`
- Incomplete logged-in guardians now see the signup completion flow before dashboard navigation.
- Existing complete guardians continue to see the dashboard immediately.
- SNS-provided guardian name and email are used as initial values in the information input step.
- Added authenticated signup completion API:
  - `POST /api/signup/complete`
- Added DB helper:
  - `completeGuardianSignup(session, payload)`
- The completion API updates the current SNS guardian row with:
  - name
  - phone
  - birth date
  - email
  - app login ID
  - PBKDF2 password hash
  - phone verification timestamp
  - required terms timestamps
- Duplicate app ID and duplicate phone checks exclude the current guardian row.
- The first-step back button signs out and returns to the login page, avoiding a loop back into the same incomplete signup page.

### Files Changed
- `app/dashboard.js`
- `app/social-signup-completion.js`
- `app/api/signup/complete/route.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/AUTH_SETUP.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Build output includes `POST /api/signup/complete` route.

### Important Limitation
- SNS signup completion still uses test-mode phone verification until a real SMS provider is connected.

### Time Spent
- Authenticated SNS signup completion implementation, build verification, and documentation/log update: approximately 35 minutes.

### Deployment
- GitHub commit:
  - `3763156 Require signup completion after SNS login`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-fyig126f5-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.
- Unauthenticated `POST https://zezari.vercel.app/api/signup/complete` returned HTTP 401 with `로그인이 필요합니다.`

## 2026-06-19 KST - Split User Info Tabs And Subject Registration QR Completion

### User Request
- In the user page information area, separate guardian information and managed subject information.
- Tabs should become:
  - dashboard
  - guardian information
  - managed subject information
- Redesign the managed subject input screen like the attached reference.
- Allow guardians to enter memo/message per managed subject.
- Allow guardians to record and save guardian voice audio per managed subject.
- When a new managed subject is registered, match an unmatched QR already stored in DB and show a registration-complete page.
- When editing an existing managed subject, do not show the QR registration-complete page.

### Reflected Work
- Changed main user tabs:
  - `/?tab=dashboard`
  - `/?tab=guardian`
  - `/?tab=subjects`
- Kept compatibility for old `/?tab=info` by mapping it to guardian information.
- Split the previous combined info screen into:
  - `GuardianInfoTab`
  - `SubjectsInfoTab`
- Redesigned managed subject form as a mobile phone-style registration card.
- Added subject fields:
  - guardian message/memo
  - guardian voice recording data URL
  - guardian voice recording file/display name
- Added client component:
  - `app/subject-voice-recorder.js`
- Added browser MediaRecorder-based voice recording UI:
  - record
  - stop
  - playback
  - clear newly recorded audio
- Updated subject save logic:
  - new subject insert stores memo/audio and assigns one QR.
  - existing subject update stores memo/audio but returns to the subject tab without showing QR completion.
  - assigned QR metadata is returned from `assignQrToSubject`.
- Added subject registration complete screen:
  - shows assigned QR image/code.
  - shows `상품 구매하기`.
  - shows `대시보드 이동하기`.
- Updated public QR find page:
  - shows guardian message when present.
  - plays guardian recorded audio when present.
- Updated DB schema handling:
  - `subjects.guardian_message`
  - `subjects.voice_data_url`
  - `subjects.voice_name`

### Files Changed
- `app/actions.js`
- `app/dashboard.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `app/page.js`
- `app/subject-voice-recorder.js`
- `lib/db.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Build output still includes `/find/[key]`.
- Build output still includes the auth and signup API routes.

### Notes
- Existing product rule remains guardian max 4 subjects. The attached mockup said max 3, but the established project requirement has been max 4.
- Voice recording uses browser `MediaRecorder`; unsupported browsers show an in-page message.
- Voice data is stored as an audio data URL with a 2.5MB server-side limit.

### Time Spent
- Tab split, subject UI redesign, audio recording, QR completion flow, public QR update, build verification, and documentation/log update: approximately 70 minutes.

### Deployment
- GitHub commit:
  - `82d5d31 Split user info tabs and add subject QR completion`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-7wwfatpt5-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.
- `https://zezari.vercel.app/find/test-public-key` returned HTTP 200.

## 2026-06-19 KST - Subject Edit Form Style Fix

### User Request
- The managed subject edit page does not need to follow the mockup phone style.
- Current styling made name, birth date, and current status values display incorrectly and difficult to edit.
- Remove the unnecessary top notch decoration above `대상자 수정`.

### Reflected Work
- Existing subject edit cards now use a normal card style instead of the phone-shaped registration card.
- Removed the phone notch decoration from existing subject edit cards.
- Kept the phone-style card only for new subject registration.
- Fixed target field CSS where `font-size: 0` was inherited by inputs/selects.
- Explicitly set input/select/textarea font size and line height for the managed subject form.

### Files Changed
- `app/dashboard.js`
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Style diagnosis, scoped CSS/component fix, build verification, and logs: approximately 15 minutes.

## 2026-06-19 KST - My Page Tab And Subject Form Style Unification

### User Request
- Make new subject registration use the same style as subject edit.
- Move `로그아웃` and `푸시 알림 켜짐` controls into a new My Page.
- Build My Page in a structure similar to the attached reference, while following the current project CSS style.

### Reflected Work
- Added a fourth user tab:
  - `/?tab=my`
- Updated tab parsing to support `my`.
- Removed push notification and logout controls from the dashboard header.
- Added `MyPageTab` with:
  - profile avatar placeholder.
  - guardian information summary.
  - primary managed subject summary.
  - subscription/payment status summary.
  - push notification setting.
  - admin page shortcut for admins.
  - customer support/menu links.
  - logout button.
- Changed dashboard quick action `내 정보` to open `/?tab=my`.
- Changed new subject registration form to use the same normal card style as subject edit.
- Removed phone-shaped registration card styling from the new subject form while keeping the QR registration-complete screen unchanged.
- Updated My Page CSS using existing project tokens and restrained card/list styling.

### Files Changed
- `app/page.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Tab update, My Page UI, subject form style unification, build verification, and logs: approximately 35 minutes.

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

## 2026-06-19 KST - Login Redesign GitHub Push And Production Alias Fix

### User Request
- Confirm whether the login redesign was pushed to GitHub.
- The online production page did not appear to reflect the local changes.

### Reflected Work
- Confirmed the login redesign was still local before this step.
- Created Git commit:
  - `8c1b307 Redesign login screen`
- Pushed `main` to GitHub:
  - `https://github.com/zezariGit/zezariGit.git`
- Ran production Vercel deployment directly.
- New production deployment:
  - `https://zezari-4l8f3rrua-zezari.vercel.app`
- Found that `https://zezari.vercel.app` still pointed to an older deployment.
- Reassigned production alias:
  - `https://zezari.vercel.app` now points to `zezari-4l8f3rrua-zezari.vercel.app`.

### Verification
- Vercel production build succeeded.
- Playwright opened `https://zezari.vercel.app` with onboarding skipped.
- `.login-card` was found on the production page.
- Production screenshot captured at `.next/prod-login-redesign.png`.

### Time Spent
- Git push, production deployment, alias correction, and verification: approximately 15 minutes.
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

## 2026-06-19 KST - My Page Style Alignment Rule

### User Request
- My Page currently feels visually inconsistent with the rest of the project.
- Future screenshots should be used as layout/structure references only.
- Final styling should follow the project's current CSS system instead of copying screenshot visuals literally.

### Reflected Work
- Restyled the My Page panel to match the project card/panel language:
  - wider content panel
  - project primary border and card shadow
  - lighter section dividers
  - softer primary-colored profile avatar
  - project-colored section headings
  - aligned information rows
  - hover states for menu links
- Added mobile responsive handling so My Page rows collapse cleanly on narrow screens.
- Recorded the screenshot interpretation rule for future UI work.

### Files Changed
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `git diff --check` passed.
- `npm run build` succeeded.
- Local `http://127.0.0.1:3000/?panel=my` returned HTTP 200.
- Local `http://127.0.0.1:3000/admin` returned HTTP 200.
- In-app browser verification was attempted, but the Browser plugin reported `iab` unavailable in this session.

### Deployment
- GitHub commit:
  - `0ef97f1 Align my page with project style`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-d7jkov9xq-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/admin` returned HTTP 200.

## 2026-06-19 KST - Kakao Postcode Guardian Address Input

### User Request
- Use Kakao Postcode service in the guardian information page so guardians can search and input their address.
- User supplied Kakao Postcode guide URL:
  - `https://postcode.map.kakao.com/guide?utm_source=chatgpt.com#usage`

### Source Notes
- Official Kakao Postcode guide says the service does not require a key, has no usage limit, and can be loaded with `postcode.v2.js`.
- The implementation uses the official `new kakao.Postcode({ oncomplete }).open()` flow.

### Reflected Work
- Added client component:
  - `app/kakao-postcode-address.js`
- The component lazily loads Kakao's postcode script only when the user clicks `주소 검색`.
- On address selection, the component fills the existing guardian `address` form field with:
  - postcode
  - road/jibun base address
  - optional extra road address text when available
- The user can still manually edit the same address input to add detail address text.
- Integrated the component into `GuardianForm` on the guardian information tab.
- Added project-style CSS for the address search row, button, helper text, and mobile layout.
- Updated the user manual local index coverage note.

### Files Changed
- `app/kakao-postcode-address.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `git diff --check` passed.
- `npm run build` succeeded.
- Local `http://127.0.0.1:3000/` returned HTTP 200.
- Local `http://127.0.0.1:3000/?tab=guardian` returned HTTP 200.
- Browser popup interaction with Kakao Postcode could not be visually exercised in this session because the in-app browser was unavailable.

### Deployment
- GitHub commit:
  - `f9e049e Add Kakao postcode address search`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-i1mxasybm-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/admin` returned HTTP 200.

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

## 2026-06-20 KST - Account Billing, Coupons, Payment Methods, and Ad Dashboard

### User Request
- Add a new page linked from My Page for `결제 및 구독 현황`.
- Add `쿠폰함` to My Page and create the coupon page.
- Add `결제수단` to My Page and allow users to pre-enter payment method display information.
- Add `광고 대시보드` to My Page and create the ad dashboard page.
- Use the uploaded screenshots as structure references only; keep styling aligned with the project's existing CSS.

### Reflected Work
- Added account routes:
  - `/account/billing`
  - `/account/coupons`
  - `/account/payment-methods`
  - `/account/ads`
- Added shared account UI helpers in `app/account/account-ui.js`.
- Updated My Page `부가 정보` to link to:
  - payment/subscription status
  - coupon box
  - payment methods
  - ad dashboard
- Added DB tables:
  - `guardian_coupons`
  - `guardian_payment_methods`
- Added DB query/mutation functions for:
  - guardian billing and recent product order history
  - guardian coupons
  - guardian payment method display metadata
  - guardian ad dashboard rows
- Added server actions:
  - `registerCouponAction`
  - `savePaymentMethodAction`
- Payment method handling intentionally stores only safe display metadata:
  - provider
  - nickname
  - last 4 digits
  - default flag
  - no full card number, CVC, or raw payment credentials
- The ad dashboard reads existing `subject_ads` data and exposes filters for all/running/done.
- Added project-token-based CSS for all new account pages.

### Files Changed
- `app/account/account-ui.js`
- `app/account/billing/page.js`
- `app/account/coupons/page.js`
- `app/account/payment-methods/page.js`
- `app/account/ads/page.js`
- `app/actions.js`
- `app/dashboard.js`
- `app/globals.css`
- `lib/db.js`

### Verification
- `npm run build` succeeded locally.
- `git diff --check` passed, with only existing CRLF conversion warnings from Git.
- Local protected routes returned expected unauthenticated redirects:
  - `/account/billing` -> `/`
  - `/account/coupons` -> `/`
  - `/account/payment-methods` -> `/`
  - `/account/ads` -> `/`
- In-app browser verification could not be used because the Browser plugin reported `iab` unavailable in this session.

### Deployment
- GitHub commit:
  - `f78ae48 Add account billing and utility pages`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-hojnijdb8-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- Protected account routes returned expected unauthenticated redirects:
  - `https://zezari.vercel.app/account/billing` -> `/`
  - `https://zezari.vercel.app/account/coupons` -> `/`
  - `https://zezari.vercel.app/account/payment-methods` -> `/`
  - `https://zezari.vercel.app/account/ads` -> `/`

## 2026-06-20 KST - Online Missing Report Selector

### User Request
- Dashboard `실종신고` currently moves to `관리대상정보`; replace it with a dedicated online missing report page.
- Create a target selection screen based on the provided reference.
- Replace existing subject state set with four states:
  - `상품구매필요`
  - `QR활성화필요`
  - `안전`
  - `찾는중`
- Implement behavior by subject state:
  - `상품구매필요`: cannot select; show alert and product purchase link guidance.
  - `QR활성화필요`: cannot select; show alert explaining QR activation is required.
  - `안전`: move to online missing ad flow, reusing existing Meta ad request modal.
  - `찾는중`: move to ad dashboard.

### Reflected Work
- Added protected route:
  - `/missing-report`
- Added client selector component:
  - `app/missing-report/missing-report-selector.js`
- Dashboard quick action `실종신고` now links to `/missing-report`.
- Subject status options in the subject form are now:
  - `상품구매필요`
  - `QR활성화필요`
  - `안전`
  - `찾는중`
- Old `문제없음` status is normalized to `안전` in display helpers and in schema startup migration.
- New subjects default to `상품구매필요`.
- Product payment completion transitions eligible subjects from `상품구매필요` to `QR활성화필요`.
- QR activation transitions eligible subjects to `안전`.
- Admin and public QR pages now display normalized status labels.
- Added project-style CSS for the missing report page and `상품구매필요` status badge.

### Files Changed
- `app/missing-report/page.js`
- `app/missing-report/missing-report-selector.js`
- `app/dashboard.js`
- `app/admin/page.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `lib/db.js`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded locally.
- `git diff --check` passed, with only existing CRLF conversion warnings from Git.
- Local `http://localhost:3001/` returned HTTP 200.
- Local `http://localhost:3001/missing-report` returned expected unauthenticated redirect to `/`.
- In-app browser verification was not available in this session.

### Deployment
- GitHub commit:
  - `710c79d Add online missing report selector`
- GitHub push:
  - `main` pushed to `https://github.com/zezariGit/zezariGit.git`
- Vercel production deployment:
  - `https://zezari-cixce9b8q-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- `https://zezari.vercel.app/` returned HTTP 200.
- `https://zezari.vercel.app/missing-report` returned expected unauthenticated redirect to `/`.

## 2026-06-20 KST - Page Navigation Performance Investigation

### User Request
- Investigate why navigation between pages and dashboard tabs feels globally slow.

### Findings
- Dashboard tabs and many internal controls use plain `<a>` links.
  - Each click performs a full document navigation instead of retaining the current dashboard state.
  - Personalized pages are returned with `Cache-Control: private, no-cache, no-store` and `X-Vercel-Cache: MISS`, so every navigation reaches the server.
- `getDashboardData()` is used as a broad shared loader by the home page, shop, missing report, billing, coupon, payment method, and ad pages.
  - It always queries guardian, subjects, QR, recent ad, subscription, plans, and ad settings.
  - Subscription, plan, and ad-rate queries are currently sequential.
- Subject rows are read with `SELECT s.*`.
  - Photos and voice recordings are stored as base64 strings in Turso and fetched on every dashboard-data request.
  - Current measured largest guardian payload: 3 subjects, about 593,509 JSON characters.
  - Aggregate media size: photo base64 518,666 characters; voice base64 72,587 characters.
- Turso measurements from the current environment:
  - Initial guardian lookup/connection: about 1,199 ms.
  - Warm sequential dashboard query set: about 187 ms.
  - First subject join query: about 299 ms; warm subject join query: about 74-77 ms.
- `ensureSchema()` performs runtime DDL/migration/seeding on each cold serverless instance.
  - The normal cold path includes one schema batch, multiple `PRAGMA` checks, a status migration update, and eight sequential seed writes.
  - This adds avoidable remote DB round trips before real page data is read.
- Production response headers show Korean ingress at `icn1` while the server function executes in `iad1`.
  - This adds long-distance latency before authenticated DB work starts.
- QR generation is not a primary bottleneck.
  - Three QR images measured about 5 ms warm and about 17 ms on the first local run.
- Static assets are secondary:
  - Built CSS is about 91 KB.
  - Built JavaScript chunks total about 718 KB, but browser caching reduces repeat transfer impact.

### Ranked Root Causes
1. Full document navigation for dashboard tabs and internal links.
2. Base64 photo/voice data included in broad `SELECT s.*` queries for pages that do not need it.
3. Runtime schema migration/seeding during serverless cold starts.
4. Multiple independent Turso queries executed sequentially.
5. Vercel server function running in `iad1` for primarily Korean users.

### Recommended Fix Order
1. Convert dashboard tab changes to client-side state or Next.js `Link` navigation and add route loading feedback.
2. Split page-specific DB loaders and select only required columns; exclude voice/photo base64 from summary pages.
3. Move images and recordings to object storage and keep only URLs/thumbnails in Turso.
4. Move schema migration/seeding to a deploy-time migration command.
5. Batch or parallelize independent dashboard queries.
6. Align Vercel function and Turso primary/read region close to Korean users.

### Verification
- Production anonymous home TTFB measured about 0.24-0.30 seconds across repeated requests, with one protected-route outlier near 0.56 seconds.
- Production cache headers confirmed personalized dynamic responses are not CDN cached.
- No application source was changed during this investigation.
- In-app browser was unavailable, so authenticated click-to-render timing could not be captured directly.

## 2026-06-20 KST - Authenticated Navigation Performance Optimization

### User Request
- Implement source changes for the previously identified navigation performance causes.
- Push changes to GitHub and deploy them to Vercel production.

### Reflected Work
- Replaced primary internal dashboard, account, shop, missing-report, and admin anchors with Next.js `Link`.
  - Prevents full CSS/JavaScript document boot on internal navigation.
  - Enables App Router prefetch for visible navigation links.
- Added `app/loading.js` and route loading progress styles.
- Refactored `getDashboardData(session, options)`:
  - Pages request only subjects/subscription/plans/ad settings they actually need.
  - Subject detail fields such as voice recordings are omitted from summary pages.
  - Guardian, subject, subscription, plan, and ad-rate reads are sent through one Turso `batch` call when needed.
- Removed subject photo base64 from common dashboard/admin/ad/billing/missing-report queries.
- Added authenticated, owner/admin-checked photo route:
  - `/api/subjects/[id]/photo`
  - `Cache-Control: private, max-age=86400, immutable`
  - UI uses versioned photo URLs based on `subjects.updated_at`.
- Subject updates now preserve existing photo/voice data from DB when no replacement upload is supplied.
- Added `schema_meta` version marker (`DB_SCHEMA_VERSION = 1`).
  - Cold serverless instances perform one version lookup.
  - Full DDL/PRAGMA/seed migration runs only when the stored schema version is behind.
- Added guardian-only query options to save, subscription, ad, notification, coupon, and payment-method actions.

### Files Changed
- `app/api/subjects/[id]/photo/route.js`
- `app/loading.js`
- `app/page.js`
- `app/dashboard.js`
- `app/globals.css`
- `app/shop/page.js`
- `app/missing-report/page.js`
- `app/missing-report/missing-report-selector.js`
- `app/account/account-ui.js`
- `app/account/billing/page.js`
- `app/account/ads/page.js`
- `app/admin/page.js`
- `lib/db.js`

### Performance Measurements
- Subject/common data payload:
  - before: about 593,509 JSON characters for 3 subjects
  - after: about 3,262 characters
  - reduction: about 99.4%
- Warm dashboard DB read:
  - before: about 187 ms
  - after option filtering/parallel read: about 41 ms
  - reduction: about 78%
- Final Turso batch read:
  - about 40-42 ms warm
  - about 2,176 JSON characters in the focused benchmark
- Local authenticated production build:
  - dashboard HTML about 21 KB
  - guardian tab HTML about 18 KB
  - guardian tab response about 47 ms
  - warm dashboard responses about 94-136 ms after initial request
- Photo API:
  - authenticated JPEG response succeeded
  - private one-day immutable cache header confirmed

### Verification
- `npm run build` succeeded after both optimization stages.
- `git diff --check` passed with only existing CRLF warnings.
- New `/api/subjects/[id]/photo` route is present in the Next.js build.
- Unauthenticated photo request returned HTTP 401.
- Authenticated local dashboard and photo requests returned HTTP 200.
- Existing schema was marked at version `1` in Turso.
- In-app browser was unavailable, so visual click testing was replaced with authenticated HTTP/session tests.

### Deployment
- GitHub commits:
  - `d02c8f7 Optimize authenticated navigation performance`
  - `4a5c16b Batch dashboard database reads`
- Final Vercel production deployment:
  - `https://zezari-ri40e4t5m-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- Authenticated dashboard HTML remained about 21 KB.
- Warm authenticated dashboard total response measured about 0.42-0.73 seconds.
- Cold first authenticated request remained around 2.7 seconds because the Vercel function still executes in `iad1`.
- Function-region relocation was not forced because the current project plan's region eligibility could not be verified safely through the CLI.

## 2026-06-20 KST - Swipe to Delete Notifications

### User Request
- Allow users to delete messages in the bell notification list by swiping either left or right.

### Reflected Work
- Replaced static notification rows with `SwipeNotificationItem` pointer-gesture rows.
- Supports both left and right swipe directions.
- Preserves vertical page/list scrolling with `touch-action: pan-y` and tracks horizontal movement only after direction detection.
- Swipe behavior:
  - movement is visually clamped while dragging
  - 72px or more commits deletion
  - shorter movement returns the row to its original position
  - deletion animates the row out in the swipe direction
- Added red delete background shown behind the moving row on either side.
- Added optimistic client removal.
  - If the API fails, the notification is restored in chronological order and an error message is displayed.
- Added authenticated `DELETE /api/notifications` handling.
- Added `deleteGuardianNotification(session, notificationId)`.
  - Delete query includes both notification ID and authenticated guardian ID.
  - A guardian cannot delete another guardian's notification.
- Added reduced-motion CSS handling.

### Files Changed
- `app/notification-bell.js`
- `app/api/notifications/route.js`
- `app/globals.css`
- `lib/db.js`

### Verification
- `npm run build` succeeded.
- `git diff --check` passed with only existing CRLF warnings.
- Local authenticated temporary notification DELETE returned HTTP 200.
- Local DB verification returned `remaining=0`.
- In-app browser was unavailable, so visual drag automation could not be performed.

### Deployment
- GitHub commit:
  - `597700e Add swipe to delete notifications`
- Vercel production deployment:
  - `https://zezari-piy5bot3y-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### Production Verification
- Authenticated production temporary notification DELETE returned HTTP 200.
- Production DB verification returned `remaining=0`.
- Test notification was removed immediately after verification.

## 2026-06-24 KST - Administrator Order and Shipping Grid

### User Request
- Replace the large order cards in the order/shipping tab with a grid.
- Select an order in the grid and enter/save carrier, tracking number, memo, and other details.

### Reflected Work
- Rebuilt the screen as a left order grid and right selected-order detail panel.
- Added grid columns for order number, guardian/subject, product, amount, payment state, fulfillment state, and order date.
- Made each complete grid row selectable and persisted the selected order in the `order` URL query.
- Added product, payment, recipient, base-address, and detail-address views to the detail panel.
- Kept the existing fulfillment server action and exposed status, carrier, tracking number, and multiline administrator memo inputs in one form.
- Extended `getAdminOrdersData` and the order URL builder so search/filter state and selected order survive saving.
- Applied a two-column desktop layout, a one-column layout below 1200px, and an internally scrollable mobile grid.
- No schema change was required.

### Files Changed
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADMIN_ORDER_GRID_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Three temporary orders rendered in a seven-column grid.
- Selecting an order changed the URL and loaded matching detail-address and tracking data.
- Saved shipped status, Hanjin carrier, tracking number, and administrator memo; verified all values in the local test DB.
- Confirmed unpaid orders expose only pending and cancelled fulfillment states.
- Confirmed the shipped filter returned two matching orders.
- Confirmed desktop and mobile layouts have no page-level horizontal overflow.

### Time Spent
- Analysis, UI/data changes, responsive adjustments, save-path testing, and documentation: about 35 minutes.

### Deliverable
- `deliverables/ADMIN_ORDER_GRID_MANAGEMENT.md`
- Includes screen/data contracts, save rules, verification, and a presentation image-generation prompt.

### Deployment
- GitHub feature commit: `b3715ec Rebuild order shipping admin as grid`
- Vercel production deployment: `https://zezari-h8yvds49o-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment state: Ready

### Production Verification
- Authenticated `https://zezari.vercel.app/admin?section=orders` returned HTTP 200.
- Production HTML contains the order grid, seven grid headings, and selected-order detail panel.

## 2026-06-24 KST - Toss Payments Live Payment Widget Integration

### User Request
- Use the two new keys below the Toss payment-widget section in `.env.local` to implement real Toss Payments checkout.

### Reflected Work
- Activated the new local keys as `TOSS_WIDGET_CLIENT_KEY` and `TOSS_WIDGET_SECRET_KEY` without exposing their values.
- Preserved the existing Toss client/secret pair exclusively for subscription billing.
- Added authenticated `GET /api/payments/toss/widget/config`.
- Added a deterministic hashed Toss customer key that does not expose the guardian identifier.
- Replaced the manually built standalone payment-method radio list with Toss SDK V2 payment-method and agreement widgets.
- Product checkout now uses `widgets.setAmount()`, `renderPaymentMethods()`, `renderAgreement()`, and `widgets.requestPayment()`.
- Product preparation stores `WIDGET` as the pending method and keeps the latest base/detail shipping address.
- Product success confirmation now uses the widget secret key and writes the actual Toss payment method after approval.
- Kept server-side order ID, amount, status, and ownership verification before approval.
- Registered both widget variables in Vercel Production and Development environments.

### Files Changed
- `app/api/payments/toss/widget/config/route.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/payments/toss/product/success/page.js`
- `app/shop-checkout-client.js`
- `app/globals.css`
- `lib/toss-payments.js`
- `lib/db.js`
- `deliverables/TOSS_PAYMENT_WIDGET_LIVE_INTEGRATION.md`
- `.env.local` updated locally and remains ignored by Git

### Verification
- `npm run build` succeeded and included the widget config API route.
- Live widget configuration returned HTTP 200 with a valid widget client-key type and hashed customer key.
- Toss payment methods and required agreement rendered through real SDK iframes on a 430px viewport.
- Checkout button became enabled after widget readiness and the page had no horizontal overflow.
- Product prepare API created a temporary pending order with method `WIDGET`, amount 5,000 KRW, and detail address.
- Temporary order and isolated DB were removed.
- No live card/account information was entered and no financial transaction was submitted during automated verification.

### Time Spent
- Key separation, widget UI, server confirmation path, local SDK testing, Vercel environment setup, and documentation: about 55 minutes.

### Deliverable
- `deliverables/TOSS_PAYMENT_WIDGET_LIVE_INTEGRATION.md`

### Deployment
- GitHub feature commit: `2abfee9 Integrate Toss live payment widget`
- Vercel production deployment: `https://zezari-1ms1dpbib-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment state: Ready

### Production Verification
- Authenticated production widget config returned HTTP 200 and recognized the live payment-widget key type.
- Toss payment-method and required-agreement frames rendered on the production shop page.
- The production checkout button enabled after widget readiness.
- No production order was created and no financial transaction was submitted during verification.

## 2026-06-24 KST - Toss Automatic Billing To Prepaid Pass Conversion

### User Request
- Proceed with option 2: remove the automatic-billing dependency and implement 1, 3, and 6 month one-time pass payments through the Toss payment widget.
- Start the first paid period when the guardian activates the ordered subject's QR, extend renewals from the current end date, preserve time during pause, and hide public QR personal information after expiry.

### Reflected Work
- Removed billing-key issue and automatic billing API paths from the subscription checkout.
- Unified both pass and standalone product checkout on the Toss Payments Widget V2 one-time payment flow.
- Added server-side pass completion with guardian ownership, order ID, amount, Toss status, and idempotent order-state validation.
- A new pass is stored as `ready` until the ordered subject's QR is activated.
- Restricted activation to the managed subject selected in the paid order; another subject's QR is rejected before any QR or subscription mutation.
- Active and paused renewals extend from the stored period end with calendar-month end clamping.
- Pause/resume now extends the expiry by the actual paused duration.
- Expired active rows and active rows without an end date normalize to `expired`.
- Public QR pages hide subject and guardian personal information for ready, paused, expired, failed, and missing-pass states.
- Added pass status controls and explicit non-auto-renewal guidance to the account billing page.
- Updated schema version to 6 and renamed plan labels while retaining admin-set prices.
- Kept the legacy `billing_key` column for compatibility but clear it in new payment and activation paths.

### Files Changed
- `lib/db.js`
- `lib/toss-payments.js`
- `app/shop-checkout-client.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/payments/toss/subscription/success/page.js`
- `app/payments/toss/subscription/fail/page.js`
- `app/payments/toss/product/fail/page.js`
- `app/find/[key]/page.js`
- `app/account/billing/page.js`
- `app/account/account-ui.js`
- `app/account/subscription-controls.js`
- `app/api/subscription/status/route.js`
- `app/dashboard.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/actions.js`
- `app/globals.css`
- `app/toss-subscription-button.js` removed
- `deliverables/PREPAID_PASS_PAYMENT.md`

### Verification
- `npm run build` succeeded.
- Seven prepaid lifecycle DB scenarios passed.
- Five QR target and expiry privacy boundary scenarios passed.
- Real Toss payment-method and agreement frames rendered locally without submitting a payment.
- Checkout had no horizontal overflow at 1440px and 390px.
- Expired QR output contained no subject name, guardian name, safe phone, or address.
- QR activation, pause, and resume UI flows completed against an isolated local database.
- No financial transaction was submitted.

### Time Spent
- Payment conversion, period rules, privacy hardening, responsive/browser verification, edge-case fixes, and documentation: about 75 minutes.

### Deliverable
- `deliverables/PREPAID_PASS_PAYMENT.md`
- Includes state transitions, security rules, test evidence, operations checklist, and image-generation prompt.

### Deployment
- GitHub feature commit: `c786b3d Convert subscriptions to prepaid QR passes`
- Vercel production deployment: `https://zezari-aio9zrzb1-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment state: Ready

### Production Verification
- Production home and dynamic find check returned HTTP 200.
- Unauthenticated widget config correctly returned HTTP 401.
- Authenticated account billing showed the prepaid pass heading and explicit non-auto-renewal copy.
- Authenticated widget config returned HTTP 200 with configured widget keys and a hashed customer key.
- The live Toss payment-method and agreement frames both rendered and the payment button became enabled.
- Turso schema version 6 and the 1, 3, and 6 month pass labels were confirmed.
- No production order was created and no financial transaction was submitted.

### Production Verification
- `https://zezari.vercel.app` returned HTTP 200.

## 2026-06-26 KST - Admin Payment Ledger And Excel-Compatible Grid Exports

### User Request
- Add an admin `결제 관리` page that shows a grid with payment number, guardian, subject, category, payment method, amount, and payment date.
- Add Excel download to each admin grid.

### Reflected Work
- Added `getAdminPaymentsData()` in `lib/db.js`.
- The payment ledger combines completed `product_orders` rows and current `subject_ads` amount rows.
- Product orders are split into `상품` and `이용권` categories.
- Advertisement rows are displayed as `광고` and use `광고 결제 준비` as the payment method until the external ad/payment API is connected.
- Updated the admin `결제 관리` section to show:
  - search by payment number, guardian, phone, email, subject, category, and method
  - category filter for all/product/pass/ad
  - grid columns requested by the user
  - existing pass price management below the ledger
- Added `app/admin/export-button.js`, a reusable client CSV downloader.
- Added Excel-compatible CSV export buttons to admin list/grid views:
  - payment ledger
  - guardians
  - subjects
  - QR codes
  - admin users
  - products
  - orders
  - ads
  - missing reports
  - location shares
  - inquiries
- Added shared CSS for heading action buttons, export buttons, payment filters, and payment grid columns.

### Files Changed
- `app/admin/page.js`
- `app/admin/export-button.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADMIN_PAYMENT_EXPORT_MANAGEMENT.md`
- `deliverables/README.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` passed with only Windows line-ending warnings.

### Time Spent
- Payment query, admin grid, reusable CSV export, per-grid export mapping, CSS, documentation, and build verification: about 45 minutes.

### Deliverable
- `deliverables/ADMIN_PAYMENT_EXPORT_MANAGEMENT.md`

## 2026-06-28 KST - Admin Sidebar Visual Refresh

### User Request
- Restyle the left admin management menu to match the attached dark sidebar reference.
- Keep the existing hide/collapse behavior.
- Move `로그아웃` and `사용자 화면` into the left management menu.

### Reflected Work
- Updated `app/admin/admin-workspace.js`:
  - changed the sidebar title to `제자리 관리자`
  - added line icons to each admin menu item
  - moved `사용자 화면` and `로그아웃` into a bottom quick-actions area
  - preserved the localStorage-backed collapsed menu behavior
- Updated `app/admin/page.js`:
  - removed duplicate header-right `사용자 화면` and logout controls from the admin content header
- Updated `app/auth-actions.js`:
  - made `LogoutButton` accept optional `className` and `children` while keeping the existing default behavior
- Updated `app/globals.css`:
  - changed the admin sidebar to a dark navy operations menu
  - added purple active-state styling, white icon/text styling, bottom actions, and responsive/collapsed rules
- Updated admin sidebar deliverable and image prompt archive.

### Files Changed
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/auth-actions.js`
- `app/globals.css`
- `deliverables/ADMIN_SIDEBAR_NAVIGATION.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Sidebar structure, icon set, CSS styling, duplicate header action cleanup, documentation, and build verification: about 25 minutes.

### Deliverable
- `deliverables/ADMIN_SIDEBAR_NAVIGATION.md`

## 2026-06-28 KST - Admin Operations Dashboard Revamp

### User Request
- Change the admin dashboard to match the attached operations-style reference.
- Treat the change as both visual and functional.

### Reflected Work
- Expanded `getAdminDashboardData()` in `lib/db.js`.
- Added real data for:
  - total guardians and total subjects
  - today's new guardians and subjects with yesterday comparison
  - active and inactive QR counts
  - active ads and rejected ad-review count
  - daily revenue, monthly revenue, previous-period comparison
  - product, subscription, ad, refund, and net revenue
  - order fulfillment status counts
  - ad status counts
  - subscription status counts
  - operational risk counts
  - recent 30-day trend data
  - recent guardians, orders, notifications, missing reports, inquiries, and ads
- Rebuilt `AdminDashboardSection()` in `app/admin/page.js`.
- Added:
  - five thick-border overview cards
  - recent 30-day SVG trend chart
  - recent status tables
  - order status flow
  - recent missing-ad table
  - ad and subscription donut panels
  - sales summary table
- Added dashboard-specific CSS in `app/globals.css` for cards, tables, chart, donut panels, and responsive layouts.
- Added official deliverable and image-generation prompt.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/ADMIN_DASHBOARD_OPERATIONS_REVAMP.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Direct Node import verification was blocked by Next.js extensionless ESM import resolution outside the Next runtime.

### Time Spent
- Data aggregation, dashboard JSX, CSS, documentation, and build verification: about 60 minutes.

### Deliverable
- `deliverables/ADMIN_DASHBOARD_OPERATIONS_REVAMP.md`

## 2026-06-28 KST - Admin Dashboard Recent Notification Truncation

### User Request
- In the admin dashboard recent status area, the recent activity notification content becomes too tall when the body contains long text or map URLs.
- Show only up to 10 characters and display the rest as `...`.

### Reflected Work
- Updated `AdminDashboardSection()` in `app/admin/page.js`.
- Added `truncateText()` helper and applied it only to the `최근 활동 알림 > 내용` column.
- Preserved the full notification body in the cell `title` tooltip for quick operator reference.
- Added `.dashboard-cell-ellipsis` CSS to prevent long notification text from expanding the row height.

### Files Changed
- `app/admin/page.js`
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- Production deployment succeeded.
- `https://zezari.vercel.app` returned 200.
- `https://zezari.vercel.app/admin` returned 200.
- Vercel error log scan found no errors for the deployment.

### Time Spent
- Notification display adjustment and log update: about 10 minutes.

## 2026-06-29 KST - Guardian Admin Operations Layout

### User Request
- Change the guardian-management screen to match the provided operations-style reference.
- Include top status cards, search filters, a dense guardian grid, and a right-side detail panel.

### Reflected Work
- Expanded `getAdminData()` in `lib/db.js`.
- Added guardian-management summary counts:
  - total guardians
  - active/inactive guardians
  - new guardians today and yesterday
  - guardians with registered subjects
  - guardians without registered subjects
  - total subjects
- Added guardian filters:
  - keyword
  - status
  - derived guardian type
  - signup date range
- Rebuilt `GuardianManagementSection()` in `app/admin/page.js`.
- Added:
  - four status cards
  - operations-style search panel
  - dense guardian grid
  - color-coded guardian status/type cells
  - right detail panel with profile, detail links, base information, subject/subscription/payment/ad summaries, admin memo, and deactivation/reactivation action
- Added guardian-specific responsive CSS in `app/globals.css`.
- Expanded guardian CSV export columns.
- Added official deliverable and image-generation prompt.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Local dev route `http://localhost:3000/admin?section=guardians` returned 200.
- Playwright visual verification could not run because the browser binary is not installed in this environment.
- Production deployment succeeded.
- `https://zezari.vercel.app` returned 200.
- `https://zezari.vercel.app/admin?section=guardians` returned 200.
- Vercel error log scan found no errors for the deployment.

### Time Spent
- Data query expansion, screen rebuild, CSS, deliverable/log updates, and local verification: about 55 minutes.

### Deliverable
- `deliverables/GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`

## 2026-06-29 KST - Guardian Detail In-Card Tabs

### User Request
- The top items in the guardian detail card are tabs, not page navigation links.
- Clicking each tab should switch the detail information inside the same card.
- The attached image shows the expected per-tab card content.

### Reflected Work
- Replaced the guardian detail panel tab links with in-card CSS radio tabs in `app/admin/page.js`.
- Added tab panels for:
  - base guardian information
  - managed subjects
  - subscriptions/orders/payments
  - advertisements
  - activity history
- Expanded `getAdminData()` in `lib/db.js` to include:
  - subject gender, created date, and QR state
  - order fulfillment, quantity, plan months, and activation data
  - advertisement daily rate, click count, meta fields, and days
  - recent guardian notifications for activity history
- Added tab, card, subject, order, ad, and activity timeline CSS in `app/globals.css`.
- Updated the guardian admin deliverable.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Local dev route `http://localhost:3000/admin?section=guardians` returned 200.
- Production deployment succeeded.
- `https://zezari.vercel.app` returned 200.
- `https://zezari.vercel.app/admin?section=guardians` returned 200.
- Vercel error log scan found no errors for the deployment.

### Time Spent
- In-card tab conversion, query expansion, CSS, documentation, and local verification: about 35 minutes.

## 2026-06-29 KST - Guardian Detail Tab Scroll Areas

### User Request
- The `구독/주문` and `활동 내역` tabs inside the guardian detail card can accumulate many records.
- Keep those tabs in a fixed-size area with an internal scrollbar so the whole admin screen does not stretch downward.

### Reflected Work
- Added fixed-height scroll handling in `app/globals.css` for:
  - `.guardian-orders-panel`
  - `.guardian-activity-panel`
- Added styled scrollbar tracks/thumbs and `overscroll-behavior: contain` so scrolling stays inside the selected detail tab.
- Added a smaller fixed height for mobile widths.
- Updated the guardian admin deliverable to record the tab scrolling rule.

### Files Changed
- `app/globals.css`
- `deliverables/GUARDIAN_ADMIN_OPERATIONS_LAYOUT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.

### Time Spent
- CSS layout stabilization, documentation, and local verification: about 10 minutes.
