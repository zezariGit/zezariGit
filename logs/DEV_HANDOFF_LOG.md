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

## 2026-06-29 KST - Subject Admin Operations Layout

### User Request
- Rebuild the administrator `대상자관리` page based on the provided operations-style reference.
- The right detail card should use in-card tabs like the guardian management detail card.
- Detail-card tabs with growing data should use internal scrollbars; applying this to every detail tab is acceptable.
- Apply the same all-tab scroll rule to the guardian management detail card as well.

### Reflected Work
- Rebuilt `SubjectManagementSection()` in `app/admin/page.js` as:
  - top subject status metrics
  - expanded search/filter area
  - dense left subject grid
  - right in-card tabbed detail panel
- Added subject filters for subscription state and registration date range.
- Added selected-subject QR image generation using the existing `qrcode` package.
- Expanded `getAdminSubjectsData()` in `lib/db.js` to return:
  - summary metrics
  - subscription status
  - selected guardian detail fields
  - selected subject orders
  - selected subject ads
  - synthesized subject activity history
- Changed the shared detail-tab CSS so every guardian and subject detail tab has a fixed-height internal scrollbar.
- Updated the guardian/subject admin deliverable.

### Files Changed
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADMIN_GUARDIAN_SUBJECT_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Direct Turso read check for the subject list joins succeeded without printing secrets.
- Direct Node import of `lib/db.js` was not usable because the project relies on Next.js extensionless module resolution; this did not affect the Next.js production build.

### Time Spent
- Data query expansion, subject admin UI rebuild, CSS, documentation, and local verification: about 50 minutes.

## 2026-06-29 KST - QR Admin Operations Layout

### User Request
- Rebuild the administrator QR management screen to match the provided reference.
- Consider additional right-detail-card screens as in-card tabs.
- Add horizontal scrolling for long QR numbers in the previous subject detail QR tab.
- Apply horizontal and vertical scrolling to the new QR detail card as well.

### Reflected Work
- Rebuilt `QrManagementSection()` in `app/admin/page.js` as:
  - top QR status metrics
  - expanded search/filter area
  - dense QR grid
  - right in-card tabbed QR detail panel
- Added QR detail tabs:
  - base QR information and memo
  - QR history timeline
  - QR management actions
- Added QR lifecycle fields and actions:
  - `lifecycle_status`
  - `discarded_at`
  - `admin_memo`
  - discard and restore action handling
- Expanded `getQrAdminData()` in `lib/db.js` for:
  - keyword search
  - lifecycle status filter
  - activation status/date filters
  - selected QR detail
  - QR activity history
- Updated QR matching behavior so assigning a subject marks QR as `in_use`, clearing a subject marks it as `unused`, and discarding clears assignment and deactivates the QR.
- Added horizontal scroll styling for long QR values and URLs.
- Updated `deliverables/QR_MANAGEMENT.md`.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/globals.css`
- `deliverables/QR_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `qr_codes` schema was safely extended with lifecycle and memo columns.
- Turso QR list join query succeeded without printing secrets.

### Time Spent
- QR admin data model, UI rebuild, CSS, documentation, and local verification: about 60 minutes.

## 2026-06-29 KST - Admin Order Shipping Detail Refresh

### User Request
- Update the administrator order management menu to match the provided reference.
- Put editable shipping information at the bottom of the right detail card.
- Let administrators enter carrier and tracking number.
- Let buyers confirm the tracking number from their My Page order history.

### Reflected Work
- Expanded admin order filters in `getAdminOrdersData()`:
  - product name
  - order start date
  - order end date
- Expanded order summary counts with cancellation and refund placeholders.
- Rebuilt the admin order management section as:
  - six top status cards
  - dedicated search panel
  - dense order grid
  - right detail card with order, subject, product, payment, shipping, and editable fulfillment sections
- Kept existing server-side validation:
  - paid orders only can move to preparing/shipped/delivered
  - shipped/delivered requires carrier and tracking number
- Added a buyer-facing shipping info block to `/account/billing` so the guardian can see carrier, tracking number, shipped date, and delivered date.
- Updated `deliverables/ADMIN_ORDER_GRID_MANAGEMENT.md`.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/account/billing/page.js`
- `app/globals.css`
- `deliverables/ADMIN_ORDER_GRID_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Source checks confirmed the order product/date filters and buyer shipping-info block are present.
- Production deployment succeeded on Vercel.
- The `https://zezari.vercel.app` alias was updated to the latest production deployment.
- Production HTTP checks returned 200:
  - `/`
  - `/admin?section=orders`
  - `/account/billing`
- Recent Vercel logs showed successful GET requests and no error entries.

### Time Spent
- Order admin UI refresh, filter/data updates, buyer tracking display, CSS, and documentation: about 45 minutes.

## 2026-06-29 KST - Admin Subscription Management Rebuild

### User Request
- Rebuild the administrator subscription-management menu to match the provided reference.
- The detail information card must have two tabs and must handle both vertical and horizontal scrolling.

### Reflected Work
- Added the `구독 관리` menu to the administrator left navigation.
- Added `/admin?section=subscriptions` as the admin subscription-management view.
- Added four subscription summary cards:
  - total subscriptions
  - active subscriptions
  - paused subscriptions
  - cancelled/refund-related subscriptions
- Added subscription search filters:
  - query
  - subscription product
  - subscription status
  - payment status
  - subscription period
- Rebuilt the subscription list as a dense grid with:
  - subscription number
  - subject and guardian
  - subscription product
  - subscription period
  - next payment date
  - amount
  - subscription status
  - payment status
  - detail action
- Added CSV export for the current subscription grid result.
- Added a right detail card with in-card tabs:
  - `기본정보`: subject information, subscription information, admin memo
  - `결제내역`: recent subscription payment/order history
- Added `subscriptions.admin_memo` for administrator-only subscription operation notes.
- Added scroll behavior for the subscription grid, detail card, tab panels, and long subscription/payment values.
- Added `deliverables/ADMIN_SUBSCRIPTION_MANAGEMENT.md`.
- Added a presentation image prompt for the subscription-management screen.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/admin/admin-workspace.js`
- `app/globals.css`
- `deliverables/ADMIN_SUBSCRIPTION_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `subscriptions.admin_memo` schema check succeeded.
- Turso subscription summary and subscription/order join query succeeded without printing secrets.

### Time Spent
- Subscription admin UI rebuild, data query work, schema extension, CSS, documentation, and local verification: about 55 minutes.

## 2026-06-29 KST - Admin Advertisement Detail Tabs Rebuild

### User Request
- Rebuild the administrator advertisement-management menu based on the provided reference.
- The detail card should contain three tabs and handle the content cleanly.

### Reflected Work
- Rebuilt `/admin?section=ads` into an operations-style layout:
  - top advertisement status and spend cards
  - search panel
  - dense advertisement grid
  - right detail card with in-card tabs
- Added advertisement summary cards:
  - active
  - review pending
  - review rejected
  - paused
  - ended
  - monthly advertisement cost
  - yearly advertisement cost
- Expanded advertisement filters:
  - query
  - advertisement status
  - review status
  - region
  - campaign date range
- Expanded grid columns to include review status, daily budget, total budget, budget progress, activation time, and selected-row control.
- Added detail tabs:
  - `기본 정보`: campaign status, review state, budget, region, period, Meta placeholders, creative preview, and admin memo
  - `광고 성과`: reach, impressions, clicks, CPC, CTR, spend, contact count
  - `지출 내역`: campaign spend row with payment-ledger link
- Added `subject_ads.admin_memo`, `impression_count`, `reach_count`, `contact_count`, and `spent_amount` as Meta API-ready fields.
- Added admin advertisement memo save action.
- Updated advertisement CSV export and documentation.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/globals.css`
- `deliverables/ADMIN_AD_GRID_MANAGEMENT.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `subject_ads` schema check succeeded.
- Turso advertisement summary and guardian/subject join query succeeded without printing secrets.

### Time Spent
- Advertisement admin UI rebuild, schema extension, action wiring, CSS, documentation, and local verification: about 60 minutes.

## 2026-06-29 KST - Admin Payment Management Detail And Refund Popup

### User Request
- Rebuild the administrator payment-management menu based on the provided reference.
- The detail card should include a cancel/refund button that opens a popup.

### Reflected Work
- Rebuilt `/admin?section=payments` into an operations-style payment screen:
  - top payment summary cards
  - search panel
  - dense payment grid
  - right payment detail card
  - cancel/refund popup form
- Added summary metrics:
  - total paid revenue
  - order revenue
  - subscription revenue
  - advertisement revenue
  - cancel/refund amount
- Expanded payment filters:
  - query
  - transaction type
  - payment status
  - payment date range
- Expanded grid columns to match the reference:
  - selection, order/subscription/ad number, transaction type, subject/guardian, transaction datetime, amount, payment status, and detail action.
- Added `payment_refunds` for administrator refund/cancel request records.
- Added `createAdminPaymentRefund()` and `createAdminPaymentRefundAction()`:
  - validates remaining refundable amount
  - records refund reason and amount
  - updates related product order, subscription, or advertisement state to cancelled/ended as an operations record
- Important: this implementation does not call the live Toss cancel/refund API yet. It intentionally records the administrator operation first; a direct Toss cancellation call should be attached only after explicit production approval and policy confirmation.
- Updated payment CSV export to include transaction type, product, refund amount, payment status, and transaction datetime.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/globals.css`
- `deliverables/ADMIN_PAYMENT_EXPORT_MANAGEMENT.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `payment_refunds` schema check succeeded.
- Turso order/subscription/ad payment summary query succeeded without printing secrets.

### Time Spent
- Payment admin UI rebuild, refund-record schema/action wiring, CSS, documentation, and local verification: about 55 minutes.

## 2026-06-30 KST - Admin Coupon Management

### User Request
- Add an administrator coupon-management menu and screen based on the provided reference image.

### Reflected Work
- Added `쿠폰 관리` to the administrator left navigation.
- Added `/admin?section=coupons` with:
  - search panel for query, discount type, and status
  - dense coupon grid
  - right coupon registration/edit card
  - `+ 새 쿠폰` entry flow
  - CSV export
- Added administrator coupon fields:
  - coupon number
  - coupon code
  - code mode: random generation or manual input
  - discount type: percent or fixed amount
  - discount value
  - description
  - validity period
  - minimum order amount
  - maximum discount amount
  - service scope
  - issue quantity
  - per-user limit
  - admin memo
  - status
- Added `coupons` table and `guardian_coupons.coupon_id`.
- Updated user coupon registration so `/account/coupons` validates coupon codes against the administrator coupon ledger before inserting `guardian_coupons`.
- Added issue-limit, active-status, and validity-date checks.
- Added `deliverables/ADMIN_COUPON_MANAGEMENT.md`.
- Added a presentation image prompt for the coupon-management screen.

### Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/admin/admin-workspace.js`
- `app/globals.css`
- `deliverables/ADMIN_COUPON_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `coupons` schema check succeeded.
- Turso `guardian_coupons.coupon_id` schema check succeeded.

### Time Spent
- Coupon admin UI, schema, registration validation, CSS, documentation, and local verification: about 50 minutes.

## 2026-06-30 KST - Admin Notification Management And Coupon Radio Spacing

### User Request
- Fix the coupon detail-card radio button label spacing because `랜덤생성 / 직접 입력` and `사용 가능 / 사용 불가능` text was clipped or overlapping.
- Add an administrator `알림 관리` menu and screen.
- The notification screen should let admins send push notifications/messages to registered guardians.
- `+ 새 메시지` should open a right-side popup/panel for composing and managing a message.

### Reflected Work
- Updated coupon form CSS so radio groups reserve enough horizontal spacing and labels do not overlap.
- Added `admin_messages` table and indexes for administrator message drafts/sent records.
- Added `알림 관리` to the administrator left menu.
- Added `/admin?section=notifications` with:
  - search filters for channel, status, keyword, and date range
  - dense message grid
  - CSV export
  - selected-message detail card
  - right-side new-message compose modal
  - save and send actions
- Added administrator message fields:
  - channel
  - target type
  - optional subject target
  - title
  - body
  - URL
  - draft/sent status
  - recipient/success/failure counts
- Added `notifyGuardiansFromAdmin()`:
  - creates guardian in-app notifications
  - sends browser push notifications to registered push subscriptions
  - counts push success/failure per recipient
- Updated `FormSubmitButton` so submit buttons can pass `name` and `value`, allowing one form to distinguish save/send commands.
- Added `deliverables/ADMIN_NOTIFICATION_MANAGEMENT.md`.
- Added a presentation image prompt for the notification-management screen.

### Files Changed
- `app/form-submit-button.js`
- `app/admin/actions.js`
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `lib/push.js`
- `deliverables/ADMIN_NOTIFICATION_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `admin_messages` schema check succeeded.
- Turso `admin_messages` count query succeeded without printing secrets.

### Time Spent
- Coupon spacing fix, admin notification UI, DB/action/push wiring, documentation, and local verification: about 55 minutes.

## 2026-06-30 KST - KakaoTalk Notification Channel And Message Templates

### User Request
- Add `카카오톡` as a delivery channel in administrator notification management.
- KakaoTalk messages should be sendable from the message screen.
- Add a `메시지 템플릿` administrator menu based on the provided reference image.
- Automatic messages should only allow title/body edits.

### Reflected Work
- Added `카카오톡` option to notification channel filters and compose/edit forms.
- Extended admin message sending so channel `kakao` is routed through a Kakao/Biz message API bridge.
- Added Kakao delivery environment variable support:
  - `KAKAO_MESSAGE_API_URL`
  - `KAKAO_MESSAGE_API_KEY` or `KAKAO_REST_API_KEY`
  - optional `KAKAO_MESSAGE_SENDER_KEY`
  - optional `KAKAO_MESSAGE_SENDER_NO`
- Kakao sends use guardian phone/safe-phone values from the selected recipients.
- If Kakao API configuration is missing, messages are still saved and guardian in-app notifications are created, but delivery is counted as failure.
- Added `message_templates` table and indexes.
- Added seeded message templates:
  - QR 미활성화 안내
  - 구독 / 갱신
  - 실종광고 종료
  - 취소/환불
- Added `/admin?section=message-templates` with:
  - search filters
  - dense template grid
  - CSV export
  - right detail/edit card
  - locked automatic-template behavior
- Added `saveAdminMessageTemplateAction()`.
- Updated `DB_SCHEMA_VERSION` from 11 to 12.
- Added `deliverables/ADMIN_MESSAGE_TEMPLATE_MANAGEMENT.md`.
- Updated notification deliverable and presentation image prompts.

### Files Changed
- `app/admin/actions.js`
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `lib/push.js`
- `deliverables/ADMIN_NOTIFICATION_MANAGEMENT.md`
- `deliverables/ADMIN_MESSAGE_TEMPLATE_MANAGEMENT.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `message_templates` schema check succeeded.
- Turso default message-template seed check returned 4 rows, including 1 KakaoTalk template.
- Local `/admin?section=notifications` returned HTTP 200.
- Local `/admin?section=message-templates` returned HTTP 200.

### Time Spent
- Kakao channel foundation, template management UI/schema/actions, documentation, DB verification, and local route verification: about 65 minutes.

## 2026-06-30 KST - Signup Phone Verification Server Integration

### User Request
- Replace temporary client-side phone verification during signup with the real signup verification flow modeled after the legacy `reference/wp` site.
- The legacy backup should be referenced, but secrets and unavailable plugin internals must not be copied into the app.

### Reference Finding
- `reference/wp` contains WordPress core and SQL data, but the MShop plugin source files are not present.
- `reference/wp.sql` confirms the legacy signup used MShop Members, MShop SMS, and MShop User Certification fields for required mobile phone certification.
- The current app reimplements the behavior in Next.js/Turso instead of porting unavailable PHP plugin code.

### Reflected Work
- Added `phone_verifications` table and indexes.
- Updated `DB_SCHEMA_VERSION` from 12 to 13.
- Added server APIs:
  - `POST /api/signup/phone/send`
  - `POST /api/signup/phone/verify`
- Added SMS adapter foundation using:
  - `SMS_PROVIDER`
  - `SMS_API_URL`
  - `SMS_API_KEY`
  - `SMS_API_SECRET`
  - `SMS_SENDER_NO`
  - development-only `SMS_DEV_BYPASS_CODE`
- Removed client-side generated test codes from direct signup and SNS signup completion.
- Direct signup and SNS signup completion now require a one-time `phoneVerificationToken`.
- Verification codes and verification tokens are stored as hashes only.
- Added `deliverables/AUTH_PHONE_VERIFICATION.md`.
- Updated authentication deliverables.

### Files Changed
- `app/auth-actions.js`
- `app/social-signup-completion.js`
- `app/api/signup/phone/send/route.js`
- `app/api/signup/phone/verify/route.js`
- `lib/db.js`
- `lib/sms.js`
- `deliverables/AUTH_PHONE_VERIFICATION.md`
- `deliverables/AUTH_SETUP.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Local temporary libSQL API scenario checks succeeded:
  - invalid phone rejected with 400.
  - verification send succeeded with development-only `SMS_DEV_BYPASS_CODE`.
  - wrong code rejected with 400.
  - correct code returned a 64-character verification token.
  - signup completion succeeded with a valid token.
  - token reuse/wrong-phone signup attempt was rejected with 400.
- GitHub commit: `b7ed5f6 Add server phone verification for signup`.
- GitHub push to `origin/main` succeeded.
- Vercel production deployment: `https://zezari-ql0y3boes-zezari.vercel.app`.
- Deployment status: Ready.
- Production alias `https://zezari.vercel.app` was reassigned to the new deployment after it was found pointing to an older deployment.
- Production checks:
  - `https://zezari.vercel.app` returned HTTP 200.
  - `POST /api/signup/phone/send` returned the expected validation error for an invalid phone number, confirming the new route is live.

### Time Spent
- Server verification API, DB schema, signup UI rewiring, SMS adapter, documentation, and local verification: about 55 minutes.

## 2026-06-30 KST - Signup Verification Code Layout Adjustment

### User Request
- The six phone verification code inputs wrap so the last input moves to the next line.
- Make all six inputs display on one line.
- Explain where `SMS_API_URL`, `SMS_API_KEY`, `SMS_API_SECRET`, and `SMS_SENDER_NO` should be obtained.

### Reflected Work
- Updated `.verification-code-row` from a five-column grid to a six-column grid.
- Reduced the verification input gap, radius, and font size so the six boxes fit on narrow mobile screens.
- Kept the same component markup so both direct signup and SNS signup completion inherit the fix.

### Files Changed
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Notes
- SMS credentials must come from the chosen SMS provider console.
- Recommended Korean providers to evaluate first are SOLAPI/CoolSMS, NHN Cloud SMS, or Naver Cloud SENS.

### Time Spent
- Layout correction, build verification, and provider guidance: about 15 minutes.

## 2026-07-07 KST - Product Design-Level Image And Detail Management

### User Request
- Product purchase currently reuses the same uploaded product image for every design option.
- Each design should be treated as a separate product design with its own image.
- Administrators should upload per-design images and per-design detail pages.
- The guardian product order flow should display and store the selected design.

### Reflected Work
- Added `product_designs` table and indexes.
- Updated `DB_SCHEMA_VERSION` from 13 to 14.
- Added `product_orders.design_id` while preserving legacy `design_index`.
- Added default design seeding for new product categories while preserving legacy compatibility.
- Extended product reads so `getProducts()` returns `product.designs`.
- Extended admin product management:
  - product representative image remains for product category selection.
  - each design can store name, description, option image, detail image, optional design price, active state, and sort order.
  - one blank new-design row was initially shown per product save.
- Extended shop checkout:
  - design picker now uses per-design option images.
  - preview step uses the selected design detail image.
  - Toss product and subscription prepare APIs now submit `designId`.
  - standalone product amount uses design-level price if present; otherwise product default price.
- Extended order/billing/admin reads to display selected design names and images where available.
- Added deliverable `deliverables/PRODUCT_DESIGN_CATALOG.md`.

### Files Changed
- `lib/db.js`
- `app/shop-checkout-client.js`
- `app/admin/page.js`
- `app/account/billing/page.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/api/products/orders/route.js`
- `app/globals.css`
- `deliverables/PRODUCT_DESIGN_CATALOG.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Direct Node ESM local DB smoke test was attempted, but this project's extensionless internal imports are resolved by Next/Turbopack and not by plain Node ESM. Build verification remains the authoritative check for this code path.

### Time Spent
- Product design schema, admin upload UI, shop order flow, display integration, documentation, and build verification: about 75 minutes.

## 2026-07-08 KST - Product Design Add Button And Checkbox Layout Fix

### User Request
- Admin product management checkboxes such as "사용자 화면에 노출" and image delete controls are too large and cause nearby text to overflow.
- Product design entry should not force four fixed design rows.
- Add a button that creates one design upload row at a time.
- The guardian product design picker should reflect the administrator-configured design count and images.

### Reflected Work
- Added `app/admin/product-admin-catalog-form.js` as a focused client component for the product catalog form.
- Replaced the always-visible blank design row with a `+ 디자인 추가` button.
- Each button click adds one new design row with thumbnail and detail-page upload controls.
- Scoped product-admin checkbox CSS so checkbox inputs are 16px instead of inheriting the global full-width input style.
- Added label wrapping rules so product/admin checkbox text no longer overflows.
- Changed product design seeding to one default name for new installs and filtered legacy empty seed placeholders from product reads.
- Updated the shop design picker so it renders only configured active designs; if no design is configured, it proceeds with the product representative image without displaying fake options.
- Updated `deliverables/PRODUCT_DESIGN_CATALOG.md`.

### Files Changed
- `app/admin/product-admin-catalog-form.js`
- `app/admin/page.js`
- `app/globals.css`
- `app/shop-checkout-client.js`
- `lib/db.js`
- `deliverables/PRODUCT_DESIGN_CATALOG.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Admin form extraction, add-design interaction, checkbox CSS fix, product design filtering, shop picker adjustment, and build verification: about 45 minutes.

## 2026-07-08 KST - Product Design Upload Server Error Fix

### User Request
- Adding a product design in the admin product management screen shows the generic server error page: `This page couldn't load`.

### Analysis
- Production logs for `POST /admin` showed `Body exceeded 1 MB limit`.
- The product admin Server Action was receiving newly uploaded image files and hidden fields containing existing product/design image data URLs.
- Because existing images are base64 strings, every save resent large image data even when the administrator did not change those images.

### Reflected Work
- Added `next.config.mjs` and configured Server Action `bodySizeLimit` to `8mb`.
- Removed hidden form fields that posted existing image data URLs from `ProductAdminCatalogForm`.
- Changed `setProductCatalogItem()` so it loads the current product and product-design image data from the database when no new file is uploaded.
- Kept the existing 1MB per-image validation in `fileToDataUrl()`.
- Updated `deliverables/PRODUCT_DESIGN_CATALOG.md` with upload behavior and limits.

### Files Changed
- `next.config.mjs`
- `app/admin/product-admin-catalog-form.js`
- `lib/db.js`
- `deliverables/PRODUCT_DESIGN_CATALOG.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Production log analysis, form payload reduction, Server Action limit configuration, documentation, and build verification: about 25 minutes.

## 2026-07-08 KST - Product Admin Card Layout Isolation

### User Request
- After adding one design to a product in the admin product management screen, other product category cards such as bracelet, necklace, and keyring show a large blank space.
- A design added to one product should not affect the layout of other products.

### Analysis
- The product management screen uses a CSS grid for product cards.
- CSS grid items were stretching to the tallest card in the same row, and the card/form grid content stretched internally, creating visible blank space in cards with fewer design rows.

### Reflected Work
- Set `.product-admin-grid` to align items to the start.
- Set `.product-admin-card` to align itself and its internal grid content to the start.
- Set `.product-admin-form` content alignment to the start.
- Updated `deliverables/PRODUCT_DESIGN_CATALOG.md` with the admin layout behavior.

### Files Changed
- `app/globals.css`
- `deliverables/PRODUCT_DESIGN_CATALOG.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Layout analysis, CSS alignment fix, documentation, and build verification: about 15 minutes.

## 2026-07-08 KST - Checkout Coupon Discount Application

### User Request
- During guardian product/order payment, if the user has registered coupons, they should be able to select a coupon.
- The selected coupon's fixed or percentage discount should reduce the actual payment amount.

### Reflected Work
- Increased `DB_SCHEMA_VERSION` from 14 to 15.
- Extended `product_orders` with coupon tracking fields:
  - `subtotal_amount`
  - `discount_amount`
  - `guardian_coupon_id`
  - `coupon_id`
  - `coupon_code`
  - `coupon_name`
  - `coupon_discount_label`
- Updated `getGuardianCoupons()` to join the guardian coupon row with the admin coupon source row so checkout can access discount type, value, minimum order amount, maximum discount amount, service scope, and validity dates.
- Added server-side coupon validation and discount calculation in `saveProductOrderDraft()`.
- Supported coupon scopes:
  - `all`
  - `subscription`
  - product-specific scopes such as `sticker`, `bracelet`, `necklace`, `keyring`
  - `ad` is not applicable to product checkout.
- Updated Toss product and subscription prepare APIs to receive `couponId`.
- Returned server-calculated `subtotalAmount`, `discountAmount`, and final `amount` from prepare APIs.
- Added 0 KRW coupon order handling:
  - checkout skips Toss widget when final amount is 0.
  - success pages can complete `free=1` coupon orders internally.
- Marked coupons as used only after successful payment/order completion.
- Updated guardian billing history to show coupon discount amounts.
- Added coupon selection UI to the order-information step of `/shop`.
- Updated `deliverables/ADMIN_COUPON_MANAGEMENT.md`.

### Files Changed
- `lib/db.js`
- `app/shop/page.js`
- `app/shop-checkout-client.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/payments/toss/product/success/page.js`
- `app/payments/toss/subscription/success/page.js`
- `app/account/billing/page.js`
- `app/globals.css`
- `deliverables/ADMIN_COUPON_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with line-ending warnings only.
- Product order INSERT placeholder count was checked against the argument count after adding coupon columns.

### Time Spent
- Coupon data flow analysis, DB migration, checkout UI, server discount validation, 0 KRW completion path, billing display, documentation, and build verification: about 70 minutes.

## 2026-07-08 KST - Toss Widget Duplicate Agreement Fix After Coupon Change

### User Request
- After applying a coupon during checkout, the page remains in `결제수단 준비중`.
- Toss Payments shows an error similar to `하나의 약관 위젯만 사용할 수 있어요`.

### Analysis
- `ShopCheckoutClient` re-initialized and re-rendered Toss payment methods and agreement widgets every time `paymentAmount` changed.
- Coupon selection changes `paymentAmount`, so `renderAgreement()` was called again on the same checkout page.
- Toss Payments allows only one agreement widget per widget instance/page flow, so the duplicate render blocked the payment widget.

### Reflected Work
- Removed `paymentAmount` from the Toss widget initialization effect dependency.
- Added refs to keep the latest payment amount and the amount currently applied to the widget.
- Toss payment methods and agreement widgets now render once when entering the order step.
- Coupon, quantity, or plan amount changes now call `widgets.setAmount()` only.
- Added `clearTossWidgetContainers()` before a fresh widget render to avoid stale containers when returning to the order step.
- Updated `deliverables/ADMIN_COUPON_MANAGEMENT.md` with the widget behavior note.

### Files Changed
- `app/shop-checkout-client.js`
- `deliverables/ADMIN_COUPON_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Toss widget issue analysis, effect separation, container cleanup, documentation, and build verification: about 20 minutes.

## 2026-07-09 KST - Meta Marketing API Environment and Ad Button Connection

### User Request
- `.env.local` contains Meta access information under `#메타 접근 정보`.
- Reflect the Meta environment variables in Vercel and GitHub.
- Connect the next-step advertisement management buttons to Meta Marketing API calls.

### Reflected Work
- Added `lib/meta-marketing.js`:
  - Reads Meta credentials only on the server side.
  - Calls the Meta Graph API with `META_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID`.
  - Uses `META_APP_SECRET` for `appsecret_proof` when available.
  - Defaults `META_API_VERSION` to `v23.0`.
  - Defaults `META_CAMPAIGN_OBJECTIVE` to `OUTCOME_AWARENESS`.
- Connected admin advertisement status buttons:
  - `approve`: create a Meta campaign if `meta_campaign_id` is empty, otherwise set the campaign to `ACTIVE`.
  - `pause`: set the existing Meta campaign to `PAUSED`.
  - `resume`: set the existing Meta campaign to `ACTIVE`, creating one if no campaign ID exists.
- Connected guardian advertisement pause/resume/end actions to Meta status updates when an ad already has `meta_campaign_id`.
- Persisted returned campaign IDs to `subject_ads.meta_campaign_id`.
- Persisted integration status to `subject_ads.meta_status`.
- Bumped `DB_SCHEMA_VERSION` from `15` to `16`.
- Added defensive schema migrations for `subject_ads.meta_campaign_id` and `subject_ads.meta_status`.
- Updated advertising deliverables with the new integration scope and remaining next steps.

### Environment Handling
- Vercel Production and Development received populated Meta keys from `.env.local`:
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_ACCESS_TOKEN`
  - `META_AD_ACCOUNT_ID`
- `META_PAGE_ID` was skipped because it was not populated in `.env.local`.
- Preview env insertion was attempted, but Vercel CLI required branch-specific handling and did not persist Preview values in `vercel env ls preview`.
- GitHub repository secrets were not updated because GitHub CLI is not installed and no `GITHUB_TOKEN` is available in the shell environment.

### Verification
- `npm run build` succeeded.
- Safe Meta ad-account lookup succeeded against the configured ad account.
- Full campaign creation was intentionally not executed as a test to avoid creating an unwanted live Meta campaign object.

### Files Changed
- `lib/meta-marketing.js`
- `lib/db.js`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/ADMIN_AD_GRID_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Time Spent
- Meta env inspection, Vercel env update, Graph API adapter, admin/user ad action wiring, schema safeguard, safe account verification, documentation, and build verification: about 55 minutes.

## 2026-07-09 KST - Meta Campaign Approval Invalid Parameter Fix

### User Request
- Pressing `광고승인` in the admin advertisement grid shows `Invalid parameter code=100 type=OAuthException`.

### Analysis
- The Meta Campaign create request reached the Marketing API.
- Running a non-mutating validation request with `execution_options=["validate_only"]` exposed the real Meta error details:
  - `error_subcode = 4834011`
  - Meta required `is_adset_budget_sharing_enabled` to be explicitly true or false.
- The current first-stage integration creates only the campaign object and does not create campaign budget optimization/ad set budget sharing, so the correct explicit value is `false`.

### Reflected Work
- Added `is_adset_budget_sharing_enabled=false` to the campaign create request in `lib/meta-marketing.js`.
- Improved Meta error handling to include `error_user_title` and `error_user_msg` when Meta returns field-level guidance.
- Updated `deliverables/ADVERTISING_SETUP.md`.

### Verification
- `npm run build` succeeded.
- Meta campaign creation validation succeeded with `execution_options=["validate_only"]`.
- A live campaign creation test was not executed to avoid creating unnecessary Meta campaign objects.

### Files Changed
- `lib/meta-marketing.js`
- `deliverables/ADVERTISING_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Time Spent
- Error reproduction, Meta validation, parameter fix, build, documentation, and deployment preparation: about 20 minutes.

## 2026-07-10 KST - Map-Based Advertisement Region Selection

### User Request
- Replace manual text entry for the managed subject advertisement region.
- Let the guardian set the advertisement region through a map so the data can be used for Meta API location targeting.

### Analysis
- Meta location targeting for ad sets uses `geo_locations.custom_locations` with latitude, longitude, radius, and distance unit.
- Meta Targeting Search was checked, but the current token/app returned `API access blocked`, so the implementation does not rely on that endpoint for the user flow.
- The current production Meta integration creates and pauses/resumes campaigns only; ad set creation is still the next integration stage.

### Reflected Work
- Replaced the advertisement region text input in `app/ad-campaign-modal.js` with a map picker.
- The map picker loads Leaflet dynamically in the browser and does not require a project map API key.
- Guardians can:
  - click the map to choose an advertisement center point
  - use the browser's current location permission
  - choose a targeting radius of 1, 3, 5, 10, or 20 km
- Added hidden form fields for:
  - `region`
  - `regionLatitude`
  - `regionLongitude`
  - `regionRadiusKm`
- Server-side `createSubjectAd()` now validates map selection and stores latitude, longitude, radius, and source.
- Added `subject_ads` columns:
  - `region_latitude`
  - `region_longitude`
  - `region_radius_km`
  - `region_source`
- Bumped `DB_SCHEMA_VERSION` from `16` to `17`.
- Added `buildMetaCustomLocationTargeting()` in `lib/meta-marketing.js` to convert stored map data into Meta `custom_locations` targeting payloads for the future ad set creation step.
- Displayed selected radius/location data in:
  - guardian advertisement dashboard
  - admin advertisement detail card

### Files Changed
- `app/ad-campaign-modal.js`
- `app/account/ads/page.js`
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`
- `lib/meta-marketing.js`
- `deliverables/ADVERTISING_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with line-ending warnings only.

### Time Spent
- Meta targeting review, DB extension, map UI implementation, server validation, admin/user display updates, documentation, and build verification: about 60 minutes.

## 2026-07-10 KST - Meta API Access Blocked Approval Handling

### User Request
- After a guardian selects an advertisement region on the map, the admin `광고승인` button shows `API access blocked. code=200 type=OAuthException`.

### Analysis
- The error is returned by Meta before campaign creation and is not caused by the stored map latitude/longitude.
- A direct validation request to the campaign endpoint also returned `API access blocked`, so the current Meta app/token needs Meta-side API access/permission review before live campaign creation can succeed.
- The service should not block the internal admin approval workflow while Meta API access is pending.

### Reflected Work
- Preserved Meta error metadata in `lib/meta-marketing.js`:
  - `metaCode`
  - `metaType`
  - `metaSubcode`
- Added `isMetaApiAccessBlocked()`.
- Updated admin advertisement status sync so Meta OAuth code `200` access blocking:
  - does not throw to the UI
  - still saves the requested local status
  - stores `subject_ads.meta_status = meta_api_access_blocked`
- Updated guardian advertisement pause/resume/end sync with the same fallback.
- Added user-facing status labels:
  - `meta_api_access_blocked` -> `Meta 권한 승인 필요`
- Updated `deliverables/ADVERTISING_SETUP.md`.

### Files Changed
- `lib/meta-marketing.js`
- `lib/db.js`
- `app/admin/page.js`
- `app/ad-campaign-modal.js`
- `app/account/ads/page.js`
- `deliverables/ADVERTISING_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Error isolation, Meta validation check, local-state fallback, status labeling, documentation, and build verification: about 30 minutes.

## 2026-07-10 KST - Advertisement Preview and Payment-Entry Prework

### User Request
- Meta API keys/access are not ready yet, but prepare the ad request flow so the advertisement feature can be used quickly once keys are issued.
- In the guardian advertisement modal, change `광고신청저장` to `확인`.
- After map and date selection, show an advertisement preview in the popup before payment.
- The preview should resemble a missing-person poster:
  - managed subject photo
  - name, age, gender
  - guardian message
  - QR code
  - managed subject information page link
- Add a bottom `결제하기` button leading to a payment page.
- After payment completion in a future step, the same content should be image-captured and registered as a Meta advertisement creative.

### Reflected Work
- Updated `app/ad-campaign-modal.js`.
  - Split the modal into `setup` and `preview` steps.
  - Map/date/radius step now uses a `확인` button.
  - Preview step displays a missing-person ad poster with subject photo, subject info, guardian message, QR image, and target page link.
  - The preview submit button is now `결제하기`.
- Updated `app/page.js` so dashboard ad modal loads subject detail fields when `adSubject` is opened.
- Updated `lib/db.js`.
  - `createSubjectAd()` returns the created advertisement ID.
  - New ad requests now start with `status = ready`, not `active`, so unpaid/unapproved ads do not appear as already running.
  - Added `getGuardianAdCheckoutData()` for the payment-entry page.
- Updated `app/actions.js`.
  - After creating an ad request, redirect to `/ads/checkout/[id]`.
- Added `app/ads/checkout/[id]/page.js`.
  - Shows the same ad creative in an image-capture-ready DOM marked with `data-ad-creative="missing-person-payment"`.
  - Shows order summary, selected region, radius, period, daily rate, and amount.
  - Keeps the actual Toss ad payment button disabled until the external advertisement payment/API approval scope is complete.
- Updated CSS in `app/globals.css` for preview poster, checkout page, and mobile layout.
- Updated `deliverables/ADVERTISING_SETUP.md`.

### Important Next Step
- Wire actual Toss advertisement payment on `/ads/checkout/[id]`.
- On successful payment, capture the `data-ad-creative="missing-person-payment"` element as an image, store it, and pass it into the next Meta creative/ad creation flow.
- Current Meta campaign approval fallback still handles `API access blocked` by saving local state and setting `meta_api_access_blocked`.

### Files Changed
- `app/ad-campaign-modal.js`
- `app/ads/checkout/[id]/page.js`
- `app/actions.js`
- `app/page.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/ADVERTISING_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Modal flow change, ad preview UI, checkout-entry route, DB/action wiring, documentation, and build verification: about 45 minutes.

## 2026-07-10 KST - Ad Preview Copy and Map Location Search

### User Request
- In the advertisement preview, change:
  - `QR 안심 서비스 / QR코드로 관리대상 정보를 확인해 주세요.`
  - to `발견즉시 연락부탁드립니다 / qr을 스캔하시면 보호자에게 연락할 수 있습니다`.
- In the map-based advertisement region selector, add a search feature.
- Typing a place such as `논현동` should show related location results, and selecting one should move the map there.

### Reflected Work
- Updated advertisement preview copy in:
  - `app/ad-campaign-modal.js`
  - `app/ads/checkout/[id]/page.js`
- Added a location search UI to the advertisement map selector:
  - search input
  - search button
  - result status message
  - selectable result list
  - result selection updates the selected advertisement center and moves the map to zoom level 14
- Added `GET /api/maps/search`.
  - Server-side route calls OpenStreetMap Nominatim.
  - Searches are limited to Korea with Korean language preference.
  - No public browser-side API key is required.
- Added CSS for search input, result list, and mobile layout.
- Updated `deliverables/ADVERTISING_SETUP.md`.

### Notes
- Nominatim is appropriate for this no-key prework stage.
- If search volume grows, replace `/api/maps/search` internals with a contracted provider such as Kakao Local API, Naver Local/Map API, or Google Places without changing the modal UI contract.

### Files Changed
- `app/ad-campaign-modal.js`
- `app/ads/checkout/[id]/page.js`
- `app/api/maps/search/route.js`
- `app/globals.css`
- `deliverables/ADVERTISING_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Copy update, location search API/UI, CSS, documentation, and build verification: about 30 minutes.

## 2026-07-10 KST - Advertisement Checkout UI and Toss Payment Connection

### User Request
- Change the advertisement payment page to match the attached mobile layout:
  - title `온라인 광고`
  - cost guide
  - estimated impressions
  - notices
  - payment method section
  - bottom `결제하기` button
- Connect Toss Payments for advertisement checkout.

### Reflected Work
- Replaced `/ads/checkout/[id]` with a compact mobile payment page.
- Added `app/ad-payment-client.js`.
  - Loads Toss Payments v2 SDK.
  - Renders dedicated Toss widget containers:
    - `#ad-toss-payment-methods`
    - `#ad-toss-payment-agreement`
  - Uses separate container IDs from product checkout to prevent widget/agreement collision.
  - Calls the advertisement prepare API before `requestPayment()`.
- Added advertisement Toss API and callback routes:
  - `POST /api/payments/toss/ad/prepare`
  - `/payments/toss/ad/success`
  - `/payments/toss/ad/fail`
- Added `getTossAdCallbackUrls()` in `lib/toss-payments.js`.
- Extended `subject_ads` with advertisement payment fields and bumped `DB_SCHEMA_VERSION` from `17` to `18`:
  - `payment_method`
  - `toss_order_id`
  - `payment_key`
  - `paid_at`
- Added advertisement payment DB helpers:
  - `prepareSubjectAdPayment()`
  - `markSubjectAdPaid()`
  - `markSubjectAdPaymentFailedForGuardian()`
- Updated admin payment ledger mapping:
  - unpaid advertisement rows now show `pending`
  - paid advertisement rows show `paid`
  - payment number uses Toss order ID when available
  - payment method uses saved Toss method when available
- Updated documentation:
  - `deliverables/ADVERTISING_SETUP.md`
  - `deliverables/DATABASE_SCHEMA.md`

### Behavior Notes
- Successful advertisement payment stores payment details but keeps the advertisement `status = ready`.
- Admin approval remains the controlled step that moves an ad into running/Meta registration flow.
- The Toss payment confirmation is server-side through `confirmWidgetPayment()` before `paid_at` is saved.

### Files Changed
- `app/ad-payment-client.js`
- `app/ads/checkout/[id]/page.js`
- `app/api/payments/toss/ad/prepare/route.js`
- `app/payments/toss/ad/success/page.js`
- `app/payments/toss/ad/fail/page.js`
- `app/globals.css`
- `lib/db.js`
- `lib/toss-payments.js`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.

### Time Spent
- Advertisement payment UI, Toss prepare/success/fail routes, DB schema/payment ledger updates, documentation, and build verification: about 75 minutes.

## 2026-07-19 KST - Replace Apple Login Placeholder with Facebook Login

### User Request
- Replace the Apple button on the login screen with Facebook.
- Use the Meta Developer Center Facebook Login guide as reference.

### Reflected Work
- Added Facebook as a real NextAuth OAuth provider in `lib/auth.js`.
- The provider is enabled when either of these environment pairs is present:
  - `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`
  - `META_APP_ID` and `META_APP_SECRET`
- Replaced the Apple icon placeholder in `app/auth-actions.js` with a Facebook icon button.
- Kept the existing SNS button order as:
  - Kakao
  - Naver
  - Google
  - Facebook
- Added Facebook button styling in `app/globals.css`.
- Updated `deliverables/AUTH_SETUP.md` with Facebook callback URLs and environment variable notes.

### Behavior Notes
- The app uses NextAuth's server OAuth flow instead of a standalone browser-only Facebook SDK login, because the existing authentication/session architecture is NextAuth based.
- Meta Developer Center must allow this redirect URL before production login will complete:
  - `https://zezari.vercel.app/api/auth/callback/facebook`
- First-time Facebook users continue through the existing SNS signup completion flow with phone verification.

### Files Changed
- `lib/auth.js`
- `app/auth-actions.js`
- `app/globals.css`
- `deliverables/AUTH_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with line-ending warnings only.
- Vercel environment check confirmed `META_APP_ID` and `META_APP_SECRET` exist in Production and Development.
- GitHub push and Vercel production deploy are performed after this committed change.

### Time Spent
- Facebook provider/UI replacement and documentation: about 25 minutes.

## 2026-07-19 KST - Refresh Meta App Credentials in Vercel

### User Request
- Use the Meta Developer Center values saved in `.env.local` and continue configuration.

### Reflected Work
- Checked Meta environment-variable presence without printing any credential values.
- Confirmed the newly saved local values:
  - `META_APP_ID`
  - `META_APP_SECRET`
- Replaced `META_APP_ID` and `META_APP_SECRET` in the Vercel Production and Development environments.
- Kept all Meta secrets out of Git-tracked files and command output.

### Configuration Status
- Facebook Login credentials are ready for a fresh Vercel deployment.
- Local `.env.local` does not currently contain:
  - `META_ACCESS_TOKEN`
  - `META_AD_ACCOUNT_ID`
- Vercel has encrypted variables with those names, but sensitive values cannot be downloaded by the CLI for a local Graph API verification.
- A new access token and ad account ID must be added locally before the Meta Marketing API account-access test can be completed safely.

### Verification
- Vercel confirmed successful replacement of both Facebook Login variables in Production and Development.
- No secret value was printed or committed.

### Time Spent
- Credential presence validation and Vercel synchronization: about 10 minutes.

## 2026-07-22 KST - Production-Wide Read-Only Function Verification

### User Request
- Thoroughly test the overall functionality of the signed-in production service at `https://zezari.vercel.app`.

### Reflected Work
- Attempted to connect to the signed-in VS Code browser tab; the tab was not exposed as a controllable in-app browser.
- Completed the safe production verification available without reusing or extracting the user's authentication cookie:
  - public pages and auth provider endpoints
  - OAuth initiation for Google, Kakao, Naver, and Facebook
  - invalid credential rejection
  - unauthenticated API authorization boundaries
  - invalid-input validation
  - map search and coordinate response
  - PWA manifest, service worker, and icons
  - VAPID public key endpoint
  - local production build
  - Vercel runtime log review
  - Turso schema, aggregate counts, and referential-integrity queries
  - QR domain and privacy-state checks
  - product/order/coupon aggregate validation
- Created `deliverables/PRODUCTION_FUNCTION_TEST_2026-07-22.md`.

### Main Findings
- Production SMS provider variables are missing; completely new signup cannot finish real phone verification.
- Kakao administrator message delivery variables are missing; Web Push is configured but Kakao delivery is not.
- Only 2 of 17 active product designs have option images and none have uploaded detail images.
- Nineteen legacy orders have total amounts but no subtotal/discount backfill.
- `npm run lint` is obsolete because the project still uses removed `next lint` behavior on Next.js 16.
- Invalid QR notify and location APIs reject safely but return inconsistent 404/400 statuses.

### Verification Highlights
- `npm run build`: passed.
- 22/22 expected DB tables present; DB schema version 18 matches source.
- No orphan or duplicate QR/guardian/subject/order records were found.
- All 30 stored QR targets use `zezari.vercel.app`.
- Google, Kakao, Naver, and Facebook OAuth initiation targets were correct.
- No 5xx response appeared in the Vercel logs generated during this test.

### Safety and Limitation
- No real payment, campaign approval, QR activation, message send, save, update, or delete was executed.
- Authenticated visual/button testing remains required because the signed-in VS Code browser session was not controllable by Codex.

### Time Spent
- Production HTTP/API, OAuth, database, configuration, log, and build verification plus reporting: about 45 minutes.

## 2026-07-24 KST - Unified Date Display and Admin Test Subscription Control

### User Request
- Simplify the subscription period in admin subscription management to year-month-day.
- Standardize date display across other pages.
- Let administrators assign a subscription plan, status, and period without payment for feature testing.

### Reflected Work
- Added `lib/date-format.js` as the shared Korea-time date formatting module.
  - Date: `YYYY-MM-DD`
  - Date and time: `YYYY-MM-DD HH:mm`
  - SQLite UTC timestamps are converted to `Asia/Seoul`.
  - Date-only values such as birth dates are preserved without timezone shifts.
- Replaced page-specific dotted and locale date formatting in:
  - admin management
  - guardian dashboard
  - account billing/coupons/ads
  - advertisement application and payment
  - missing report selection
  - public QR find page
  - product checkout
  - notification list
- Added `setSubscriptionAdminTest()` and `setSubscriptionAdminTestAction()`.
  - Admin authorization is checked on the server.
  - Supports 1, 3, and 6 month plans.
  - Supports active, ready, paused, expired, and cancelled statuses.
  - Active, paused, and expired statuses require both start and end dates.
  - Rejects incomplete, invalid, or reversed periods.
  - Stores the selected end date as the end of that day in Korea time.
  - Updates the subscription plan price but does not create a payment or order.
- Added the `테스트 구독 설정` form to the selected subscription detail card.
- Updated `deliverables/ADMIN_SUBSCRIPTION_MANAGEMENT.md`.

### Files Changed
- `lib/date-format.js`
- `lib/db.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `app/account/account-ui.js`
- `app/dashboard.js`
- `app/ad-campaign-modal.js`
- `app/ad-payment-client.js`
- `app/missing-report/missing-report-selector.js`
- `app/find/[key]/page.js`
- `app/shop-checkout-client.js`
- `app/notification-bell.js`
- `deliverables/ADMIN_SUBSCRIPTION_MANAGEMENT.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with line-ending warnings only.
- Date formatter checks:
  - ISO timestamp to `YYYY-MM-DD`
  - SQLite UTC timestamp to Korean `YYYY-MM-DD HH:mm`
  - Korean end-of-day input to UTC ISO storage
- Local `/admin?section=subscriptions` returned HTTP 200 and rendered the authorization screen.
- Authenticated visual verification could not be automated because no controllable in-app browser was connected.

### Time Spent
- Analysis, implementation, verification, documentation, and deployment preparation: about 35 minutes.

## 2026-07-24 KST - Installed PWA Notification Center, Sound, and App Badge

### User Request
- Deliver notifications to the Android or iPhone notification center when zezari is installed.
- Play a simple notification sound.
- Show the unread notification count on the installed app icon.

### Reflected Work
- Kept standards-based Web Push as the OS notification delivery mechanism.
- Added the complete unread guardian notification count to each push payload.
- Added foreground and service-worker Badging API synchronization.
- Updated the service worker to:
  - display a user-visible notification with `silent: false`
  - request the Android vibration pattern when supported
  - set the installed app badge count during background push handling
  - mark notifications read and clear the badge when an OS notification is clicked
  - clear displayed OS notifications when the in-app bell marks all messages read
  - close the matching OS notification after an in-app swipe deletion
- Updated the notification API to return both recent rows and the full unread count.
- Updated the in-app notification bell to keep its counter and the installed app badge synchronized after load, push, read, and delete operations.
- Added an iPhone Home Screen guidance state when push is unavailable in a normal browser tab.
- Added the Web App Manifest `id` field for stable installed-app identity.
- Bumped the service-worker cache from `zezari-v15` to `zezari-v16`.
- Documented that Web Push cannot choose a custom sound file; the operating system default notification sound is used.

### Files Changed
- `lib/db.js`
- `lib/push.js`
- `app/api/notifications/route.js`
- `app/notification-bell.js`
- `app/push-notification-button.js`
- `public/sw.js`
- `public/manifest.webmanifest`
- `deliverables/PUSH_NOTIFICATION_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Verification
- `npm run build` succeeded.
- `node --check public/sw.js` succeeded.
- Local `/sw.js` returned HTTP 200 and contained cache v16, app badge, and non-silent notification logic.
- Unauthenticated `/api/notifications` remained protected with HTTP 401.
- Real notification sound and launcher badge visibility require final checks on physical Android and iOS 16.4+ devices.

### Time Spent
- Platform research, implementation, verification, and documentation: about 35 minutes.

## 2026-07-24 KST - Android Push Delivery Incident And Device Reconnection

### User Report
- The installed Android app did not play a notification sound and no notification appeared in the notification center after sending from the web administrator screen.

### Production Evidence
- Vercel Production contains all three VAPID variables.
- Turso read-only diagnostics:
  - `push_subscriptions`: 0
  - distinct guardians with a registered endpoint: 0
  - latest admin Push batch: 9 recipients, 0 successes, 9 failures
  - recent stored guardian notifications had no matching device subscription

### Root Cause
- `PushNotificationButton` set the enabled state from `Notification.permission === "granted"` only.
- It did not verify that `PushManager.getSubscription()` returned a subscription or that the endpoint was saved in `push_subscriptions`.
- Once permission was granted, the disabled `푸시 알림 켜짐` button prevented the user from repairing the missing device registration.

### Reflected Work
- Rebuilt Push connection initialization.
  - Registers/updates the service worker.
  - Loads the current VAPID public key.
  - Replaces a subscription when its application server key differs.
  - Creates a missing browser subscription.
  - Upserts the endpoint to Turso before showing the connected state.
- Added automatic repair when the app opens with notification permission already granted.
- Changed the control to:
  - `푸시 알림 연결하기` before server-confirmed registration
  - `테스트 알림 보내기` after registration
- A manual connection immediately sends a real test Push.
- Added authenticated `POST /api/push/test`.
- Added structured server logs for subscription saves and Push provider delivery failures.
- Changed zero-success admin Push batches to `failed` and shows an error instead of a false success notice.

### Verification
- `npm run build` succeeded with the new `/api/push/test` route.
- Local VAPID public-key endpoint reported configured without exposing the key.
- Unauthenticated test Push request returned HTTP 401.
- Real Android delivery requires reopening the deployed app and completing one reconnect/test action.

### Files Changed
- `app/push-notification-button.js`
- `app/api/push/subscribe/route.js`
- `app/api/push/test/route.js`
- `app/admin/actions.js`
- `lib/db.js`
- `lib/push.js`
- `deliverables/PUSH_NOTIFICATION_SETUP.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### Time Spent
- Production diagnosis, implementation, verification, and documentation: about 35 minutes.

## 2026-07-24 KST - Finder Contact Added To Location Share Push

### User Request
- Show the finder phone number before the location in the guardian Push notification generated by the public subject location-share page.

### Root Cause
- `createLocationShareForFindPage()` already saved and returned `finderContact`.
- The location API did not pass `finderContact` to `notifyGuardianLocationShared()`, so the Push body only contained the location.

### Reflected Work
- Passed `share.finderContact` from `POST /api/find/[key]/location` to the Push delivery function.
- Changed the notification body format to:
  - `연락처: {발견자 전화번호} · 위치: {위치 설명}`
- Displays `연락처 미입력` when the optional finder contact is empty.
- Preserved the Kakao map URL as the notification click destination and in-app notification link.
- Updated `deliverables/LOCATION_SHARE_MANAGEMENT.md`.

### Verification
- `npm run build` succeeded.
- Existing location persistence, map links, and administrator history data were not changed.

### Time Spent
- Flow analysis, implementation, build verification, and documentation: about 10 minutes.

## 2026-07-24 KST - Public Guardian Voice Playback Button

### User Request
- Add a button to the managed subject public QR page that plays the guardian-recorded voice for emotional stabilization.

### Existing State
- `getFindPageDataByKey()` already returned `subjects.voice_data_url` and `voice_name`.
- The public page used a small browser-default `<audio controls>` element.

### Reflected Work
- Added client component `app/find/[key]/guardian-voice-player.js`.
- Replaced the native audio controls with a project-styled mobile playback button.
- Button states:
  - `보호자 음성 재생(심신안정용)`
  - `보호자 음성 일시정지`
- Added playing and error status messages.
- The button is rendered only when a guardian voice recording exists.
- Preserved the existing active QR, QR activation, and active subscription privacy gates.
- Created `deliverables/PUBLIC_GUARDIAN_VOICE_PLAYBACK.md`.

### Verification
- `npm run build` succeeded.
- Read-only Turso lookup found an eligible active QR with saved guardian voice.
- Local public page returned HTTP 200 and contained the requested playback button.
- No QR public key or personal data was printed during verification.

### Time Spent
- Source analysis, implementation, data-backed page verification, and documentation: about 20 minutes.

## 2026-07-24 KST - Public Guardian Voice Button Visibility Follow-up

### User Report
- The deployed public QR page did not show the newly added guardian voice playback button.

### Root Cause
- The production deployment was current.
- The checked subject `매칭테스트` had no saved `voice_data_url` or `voice_name`.
- The first implementation intentionally rendered the button only when a saved recording existed, which made the feature appear missing.

### Reflected Work
- The public managed-subject page now always renders the guardian voice playback button.
- When no recording exists, the button is disabled and `보호자 음성이 등록되지 않았습니다.` is displayed.
- When a recording exists, the existing play, pause, playing, and error states remain available.
- Updated `deliverables/PUBLIC_GUARDIAN_VOICE_PLAYBACK.md`.

### Time Spent
- Production data diagnosis, visibility improvement, verification, and deployment: about 15 minutes.

## 2026-07-24 KST - Product Design Detail Image Natural Ratio

### User Request
- Product design detail-page images are often very tall.
- Stop shrinking them into a fixed preview frame and display them according to the uploaded image ratio.

### Root Cause
- The guardian product preview forced detail images into `height: 96px`.
- The administrator detail-image preview forced a `4 / 3` aspect-ratio frame and stretched the image to the frame height.

### Reflected Work
- Kept product and design selection thumbnails in their existing fixed-size frames.
- Changed only detail-page images to fill the available width and use automatic height.
- Removed the short fixed-height user preview and the administrator `4 / 3` detail frame.
- Long vertical detail images now expand the page/card vertically without cropping or compressing their aspect ratio.
- Updated `deliverables/PRODUCT_DESIGN_CATALOG.md`.

### Time Spent
- Source analysis, CSS separation, responsive verification, documentation, and deployment: about 20 minutes.

## 2026-07-24 KST - QR Deactivation Subscription Period Credit

### User Request
- Let administrators activate or deactivate each subject QR from subject management.
- When an active subscription QR is inactive, preserve the inactive days by extending the subscription period.
- Ignore temporary inactive periods of one day or less.

### Architecture Decision
- `subscriptions` is guardian-level and one guardian can have multiple subjects.
- Changing the whole subscription status to `paused` would block every subject QR owned by that guardian.
- The implementation therefore records a QR-specific hold timer while leaving the guardian subscription active.

### Reflected Work
- Increased DB schema version to `19`.
- Added five QR hold fields for start, owning subscription, accumulated days, last credited days, and last completion time.
- Added deterministic hold-day calculation and end-date extension helpers.
- Deactivation starts timing only for an assigned QR with an active unexpired subscription.
- Reactivation credits `0` days through exactly 24 hours, then credits completed 24-hour days.
- Added idempotency conditions so repeated activation cannot extend the same hold twice.
- Added QR activation controls and hold status to the subject-management QR tab.
- Added the hold status to QR-management details and subject activity history.
- QR discard, subject deletion, unmatching, and reassignment clear hold ownership data.
- Created `deliverables/QR_SUBSCRIPTION_HOLD.md` and updated related deliverables.

### Verification
- Boundary calculation tests passed:
  - 23:59 = 0 days
  - 24:00 = 0 days
  - 24:00:01 = 1 day
  - 47:00 = 1 day
  - 48:00 = 2 days
- `npm run build` succeeded.
- `git diff --check` succeeded.

### Time Spent
- Data-model analysis, implementation, concurrency guard, UI, tests, documentation, and deployment: about 55 minutes.

## 2026-07-24 KST - Bizcall 050 Safe Phone Integration

### User Request
- Show the guardian's contact phone as a Bizcall safe number on the managed-subject public page.
- Use the attached `Bizcall 서비스 [안심번호] HTTPS 연동규격서_v_1_29(2024).pdf`.
- Prepare the integration against the guardian's currently configured Bizcall account.

### Source And Specification Analysis
- Visually reviewed the PDF and extracted all 20 pages for parameter-level inspection.
- Confirmed HTTPS POST, UTF-8, form-urlencoded request bodies, and JSON responses.
- Confirmed `/link/auto_mapp.do` for automatic unused 050 assignment.
- Confirmed `/link/set_vn.do` for existing 050 registration, remapping, and release.
- Confirmed the authentication rule: MD5 over `iid + target number`, then Base64 encoding.
- The PDF provides relative API paths only. The contract-specific API base URL and Interface ID must come from the Bizcall account.

### Reflected Work
- Added `lib/bizcall.js` as the server-only Bizcall adapter.
- Added API configuration validation, request timeout, result-code mapping, phone normalization, safe-number formatting, and credential-free error handling.
- Increased DB schema version to `20`.
- Added guardian fields for safe-number state, provider, successful sync time, and last error.
- Added automatic safe-number assignment after direct signup and SNS signup completion.
- Added automatic remapping when the guardian's contact phone changes.
- Replaced the guardian's manual safe-number input with a read-only issuance status.
- Added an administrator `안심번호 발급/재연결` action to guardian details.
- Changed the public QR query to return a safe number only while its status is `active`.
- Added a click-to-call `tel:` link for an active 050 number.
- Provider configuration failures never fall back to the guardian's private phone.

### Environment Variables
- `BIZCALL_ENABLED`
- `BIZCALL_API_BASE_URL`
- `BIZCALL_INTERFACE_ID`
- `BIZCALL_TIMEOUT_MS`
- No Bizcall credential or account value is committed to source control.

### Deliverables
- `deliverables/BIZCALL_SAFE_PHONE_INTEGRATION.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- `npm run build` succeeded after the implementation.
- PDF API pages were rendered and visually checked.
- Bizcall adapter mock verification passed for POST path, form content type, phone normalization, MD5/Base64 auth, and 050 display formatting.
- Turso migrated to schema version `20` and contains all five `safe_phone*` columns.
- An eligible local QR public page returned HTTP 200, displayed `안심번호 준비중`, and did not contain either formatted or digits-only private phone data.
- Live issuance remains pending until the contract-specific API base URL and Interface ID are available in local/Vercel environment variables.

### Time Spent
- Specification analysis, privacy design, implementation, UI/admin workflow, build verification, and documentation: about 45 minutes.

## 2026-07-24 KST - Administrator Phone Verification Bypass

### User Report
- An already registered administrator was sent to the phone verification signup screen.
- Administrators should be able to sign in without phone verification.

### Root Cause
- The account existed and had `guardians.is_admin = 1`.
- Its optional guardian login ID, password hash, and phone fields were empty.
- `GuardianDashboard` evaluated guardian profile completeness before treating administrator authority as a completed-login exception.

### Reflected Work
- Administrator authority is now evaluated first.
- Accounts recognized by `ADMIN_EMAILS` or `guardians.is_admin = 1` are treated as complete for the post-login screen gate.
- Administrators bypass `SocialSignupCompletion` and its phone verification screen.
- Normal guardians still require all existing signup fields and phone verification.
- Inactive administrator accounts remain blocked by the existing activation check.
- Updated `deliverables/AUTH_PHONE_VERIFICATION.md` and the cumulative image prompt archive.

### Time Spent
- Account-state diagnosis, gate correction, verification, documentation, and deployment: about 15 minutes.

## 2026-07-24 KST - Privacy-Minimized Public Subject Page

### User Request
- Remove the public `보호자에게 알리기` button.
- Remove guardian name, email, and address from the managed-subject page, leaving only the safe number.
- Remove finder phone and location-description inputs, leaving only `위치공유`.
- Change the subject photo from a small circle to an approximately 1.7-times larger rounded rectangle.

### Reflected Work
- Removed guardian name, email, and address from both the public QR query and rendered page.
- Kept the active Bizcall 050 safe number as the only guardian contact information, including click-to-call.
- Removed the standalone guardian-notification button from the public page.
- Simplified location sharing to send browser latitude, longitude, and accuracy after device permission.
- Prevented new location notifications from showing the obsolete `연락처 미입력` text.
- Enlarged the subject photo from 112px to 190px and changed it to a responsive 4:5 rounded portrait frame.
- Updated QR, location-share, user-manual, and image-prompt deliverables.

### Verification
- `npm run build` completed successfully.
- `git diff --check` reported no whitespace errors.
- A data-backed active QR page returned HTTP 200.
- The rendered HTML contained `안심번호`, `위치공유`, and the portrait class.
- The rendered HTML did not contain the selected guardian's name, email, address, `보호자에게 알리기`, `발견자 연락처`, or `위치 설명`.
- A missing-key location request still returned the expected HTTP 400 QR validation response.
- No in-app browser session was available for screenshot automation, so responsive layout was verified from generated HTML and CSS constraints.

### Time Spent
- Privacy review, public-page implementation, responsive styling, verification, documentation, and deployment: about 25 minutes.

## 2026-07-24 KST - Advertisement Payment Pricing Management

### User Request
- Add an administrator `광고결제 관리` menu.
- Configure a price per selected billing-day unit.
- Configure a default advertising radius and an extra price per radius unit above the default.
- Fix guardian advertisement start date to today and let the guardian select only the end date.
- Recalculate and explain the price after location and radius selection.

### Reflected Work
- Added a dedicated admin pricing screen with billing-day, base-price, default-radius, extra-radius unit, and extra-radius price fields.
- Added a shared pure pricing module used by the guardian modal, server advertisement creation, and Toss checkout breakdown.
- Implemented `billing blocks × (base price + extra radius units × extra price)`.
- Fixed start date to current KST on the server and limited the advertising period to 365 days.
- Generated guardian radius select options from the administrator's default radius and extra unit.
- Added period/range breakdowns to the application modal and checkout page.
- Added pricing snapshots and payment-preparation amount verification for new advertisements.
- Migrated Turso to schema version `21`.

### Verification
- `npm run build` succeeded.
- Formula test: 2 days, 7km, 1-day/10,000 KRW, 5km default, 2km/10,000 KRW returned 40,000 KRW.
- Turso schema version and all new `ad_settings`/`subject_ads` pricing columns were verified.
- Default stored policy is 1 day, 10,000 KRW, 5km default, and 10,000 KRW per extra 2km.

### Deliverables
- `deliverables/AD_PRICING_MANAGEMENT.md`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- Advertisement pricing image-generation prompt accumulated.

### Time Spent
- Pricing analysis, database migration, administrator/user UI, server validation, checkout integration, testing, documentation, and deployment: about 45 minutes.

## 2026-07-24 KST - User Privacy Policy Page

### User Request
- Use the existing `zezari.com` privacy policy as a reference and add an equivalent page to REAL_QR_FIND.
- Add a `개인정보취급방침` link at the bottom of the user main page.

### Reflected Work
- Added the `/privacy` route with a current-implementation privacy policy rather than copying obsolete service behavior.
- Documented membership, SNS login, phone verification, guardian and subject records, QR disclosure, products, subscriptions, payments, shipping, location sharing, push notifications, and advertising data.
- Clarified that the public QR page does not expose guardian name, email, address, or raw phone number and uses the Bizcall 050 safe number.
- Added processing-provider information for Vercel, Turso/libSQL, SNS providers, Toss Payments, Bizcall, SMS delivery, Meta Marketing API, and browser push.
- Added a shared footer link below both anonymous onboarding/login and authenticated guardian dashboard views.
- Added responsive table scrolling, compact mobile navigation, and project gov-style tokens.

### Deliverables
- `deliverables/PRIVACY_POLICY_PAGE.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Verification
- `npm run build` succeeded and generated `/privacy` as a static route.
- Local `/privacy` and `/` responses returned HTTP 200.
- The privacy response contains the policy title, effective date, and privacy contact address.
- The anonymous home response contains the `개인정보취급방침` label and `/privacy` link.
- Desktop 1440×1200 and mobile 390×844 screenshots were visually checked.
- `.env.local` secret values were not found in the policy page or its deliverable.
- `git diff --check` succeeded.
- GitHub `main` received commit `4a699dc` (`Add privacy policy page`).
- Vercel production deployment `dpl_5tj68FcHarqWekzm35PsLicp3Z7V` reached `READY`.
- `https://zezari.vercel.app/privacy` and the production home page returned HTTP 200; the production home response contains the policy link.

### Time Spent
- Source-policy comparison, implementation-data review, page and footer implementation, responsive styling, documentation, testing, and deployment: about 25 minutes.

## 2026-07-24 KST - Administrator Payment Pass

### User Request
- Show a `결제패스` button to administrators on every checkout page.
- Allow product, subscription, and advertisement flows to proceed to their completed state without a real payment during testing.

### Reflected Work
- Added the administrator-only button to standalone product, subscription-product, and advertisement checkout screens.
- Kept subject, shipping address, coupon, subscription, and advertisement validation active during bypass processing.
- Added server-side administrator authorization to all three payment preparation APIs.
- Reused the existing product-order, prepaid-subscription, and advertisement payment completion functions.
- Stored the payment method as `관리자 결제패스` with synthetic `admin-pass-*` payment keys.
- Added `is_test_payment` to product orders and advertisements and increased the DB schema version to `22`.
- Excluded test transactions from admin revenue totals, monthly comparisons, and revenue trend data while retaining them in operational grids.
- Added tailored completion-page messages for bypassed transactions.

### Deliverables
- `deliverables/ADMIN_PAYMENT_PASS.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- Administrator payment-pass image prompt accumulated.

### Verification
- `npm run build` succeeded with all product, subscription, advertisement, and success routes.
- Anonymous `adminPass: true` requests to all three preparation APIs returned HTTP 401.
- Each preparation API contains a second server-side administrator role check that returns HTTP 403 for authenticated non-admin users.
- Turso schema version `22` and both `is_test_payment` columns were applied and verified.
- Existing rows were verified to have valid `0` or `1` test-payment flags.
- Real-revenue aggregate queries using `is_test_payment = 0` executed successfully.
- `git diff --check` succeeded.
- GitHub main push and Vercel production deployment are completed as part of this task.

### Time Spent
- Payment-flow analysis, server authorization, completion integration, revenue isolation, UI, testing, documentation, and deployment: about 40 minutes.

## 2026-07-24 KST - Meta Advertisement End-to-End Publishing

### User Request
- Verify the uncommented Meta credentials in `.env.local` and apply valid values to Vercel.
- Publish the missing-person advertisement with the guardian-selected period, location radius, and generated preview image through the Meta Marketing API.
- Test the integration.

### Reflected Work
- Verified secrets without printing their values.
- Confirmed that the token is valid, matches the configured app, includes `ads_management`, and can access the active KRW/Asia-Seoul ad account.
- Updated the four populated Meta secrets in Vercel Production.
- Added browser-side 1080px JPEG capture of the final missing-person poster before advertisement checkout.
- Added `subject_ad_creatives` so large creative images are stored separately from advertisement grid rows.
- Expanded Meta persistence with campaign, ad set, creative, ad, image hash, publication error, and publication timestamp fields.
- Implemented Meta image upload, paused campaign creation, ad set creation with lifetime budget/schedule/custom-location targeting, Page-backed creative creation, ad creation, and final activation.
- Propagated pause/resume/end commands to the campaign, ad set, and ad.
- Added administrator creative preview and Meta object diagnostics.
- Added a hard preflight requirement for `META_PAGE_ID` before any production campaign is created.

### Environment Finding
- `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, and `META_AD_ACCOUNT_ID` are populated and valid.
- `META_PAGE_ID` is empty.
- The configured ad account returns zero `promote_pages`, and the token returns zero accessible Pages.
- A Facebook Page must be connected to the ad account and its numeric ID added before creative/ad publication can complete.
- The authenticated in-app browser surface was not exposed to this coding session, so console values were verified through the Graph API rather than copied from the visible browser.

### Verification
- `npm run build` succeeded.
- Turso schema version `23` and six new Meta ID/error columns were applied.
- A disposable image upload succeeded.
- A disposable paused campaign and paused ad set with 3km custom-location targeting, schedule, and lifetime budget succeeded.
- The test campaign was deleted and the test image was removed; no active delivery or spend occurred.
- Local home returned HTTP 200.
- Unauthenticated creative-image access returned HTTP 403.
- Full creative/ad creation was correctly not attempted because the required Page is not connected.
- GitHub `main` received commit `02dd260` (`Implement Meta ad publishing pipeline`).
- Vercel production deployment `dpl_8Zro5FbdhuCNC7Vv1nzVRevNsogR` reached `READY`.
- `https://zezari.vercel.app/` and `/privacy` returned HTTP 200, while anonymous creative-image access returned HTTP 403.

### Deliverables
- `deliverables/META_AD_PUBLISHING.md`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Time Spent
- Meta credential and permission validation, safe write testing, image capture, database migration, full publishing implementation, documentation, and deployment preparation: about 65 minutes.

## 2026-07-24 KST - Meta Business Connection Audit

### User Request
- Inspect the Meta Business Settings opened in the in-app browser and confirm the overall connection state.

### Audit Result
- The coding browser connection still exposed zero in-app tabs, so the visible Business Settings page could not be clicked directly.
- The configured Graph API identity and ad account are readable.
- The ad account is active, uses KRW and Asia/Seoul, and has no disable reason.
- One ad-account user is connected.
- No Facebook Page is connected as a promotable Page.
- No user Page or Instagram account is visible to the current token.
- `META_PAGE_ID` remains empty.
- The current token has `ads_management` and `pages_manage_ads`, but not `pages_show_list` or `business_management`.
- The ad account API reports no funding source/payment method.
- One active campaign exists, but it has zero ad sets and zero ads; no spend, impressions, or clicks were returned.

### Required Follow-up
- Connect or create the official Facebook Page in the Business Portfolio.
- Assign the Page and ad account to the operating user/system user with advertising permission.
- Add an ad-account payment method.
- Reissue the token with Page-list and business-management permissions.
- Set `META_PAGE_ID` locally and in Vercel, then run a paused creative/ad publication test.

### Deliverable
- Updated `deliverables/META_AD_PUBLISHING.md`.

### Time Spent
- Browser connection retry, Graph API asset/permission/payment/campaign audit, and documentation: about 15 minutes.

## 2026-07-24 KST - Meta App Asset Screenshot Check

### User Request
- Confirm whether the Facebook Page was connected based on the supplied Meta Business Settings screenshot.

### Result
- The screenshot shows the `qr-find-ads` Meta app connected to the `ZEZARI` ad account.
- It does not show a Facebook Page connected to the ad account.
- A fresh Graph API check still returned zero promotable Pages, zero user Pages, zero Instagram accounts, and no `META_PAGE_ID`.
- The required next menu is `계정 > 페이지`; add/select the Page there and connect the `ZEZARI` ad account as an asset.

### Time Spent
- Screenshot interpretation, Graph API recheck, and documentation: about 5 minutes.

## 2026-07-24 KST - Meta Real Ad Account and Page Publishing Setup

### User Request
- Use the connected Meta Business and Developer Center browser tabs to complete the settings required for advertisements requested by the production site.

### Reflected Work
- Confirmed the Business Portfolio `제자리zezari`, Facebook Page `제자리`, real ad account `ZEZARI`, and app `qr-find-ads`.
- Assigned the Page, real ad account, and app to the existing `Conversions API System User`.
- Added Facebook Login to the Meta app, enabling standard Page permission definitions.
- Generated a non-expiring system-user token with `ads_management`, `ads_read`, and `business_management`.
- Replaced the sandbox ad account with the real ad account and populated `META_PAGE_ID`.
- Updated `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, and `META_PAGE_ID` in local `.env.local` and Vercel Production without logging secret values.
- Removed the deprecated Meta creative field `standard_enhancements`.

### Verification
- Real ad-account read passed; the account is active, KRW, Asia/Seoul, and has funding-source data.
- Disposable image upload, PAUSED campaign, PAUSED ad set, and Page-backed creative creation all passed.
- Final PAUSED ad creation reached Meta and was blocked only by anti-discrimination policy acknowledgement subcode `2859024`.
- All disposable campaign, ad set, creative, and image resources were deleted immediately. No delivery or spend occurred.
- `npm run build` succeeded.

### Remaining Operator Action
- A business operator must personally review and accept Meta's anti-discrimination policy. This is a legal acknowledgement and was not accepted by the development agent.
- After acceptance, rerun the PAUSED ad creation test and deploy the verified source.

### Deliverable
- Updated `deliverables/META_AD_PUBLISHING.md`.

### Time Spent
- Meta browser configuration, system-user credential rotation, real-account API verification, compatibility fix, safe write test, cleanup, and documentation: about 45 minutes.

## 2026-07-24 KST - Meta Active Advertisement Delivery Verification

### User Request
- After accepting Meta's anti-discrimination policy, publish a test advertisement and confirm that it is actually listed as delivering.

### Test Configuration
- Real ad account: `ZEZARI`.
- Facebook Page: `제자리`.
- Synthetic connectivity creative using the application icon and production-site destination.
- Seoul center, 1km radius, age 18+.
- Lifetime budget capped at KRW 2,000.

### Verification
- Image, campaign, ad set, Page-backed creative, and ad creation all succeeded.
- Campaign ID: `120255991903620550`.
- Ad-set ID: `120255991907990550`.
- Creative ID: `1746203396451350`.
- Ad ID: `120255991909750550`.
- Campaign, ad set, and ad activation calls all returned success.
- The ad progressed from `IN_PROCESS` to `PENDING_REVIEW` and then `ACTIVE`.
- Meta Ads Manager displayed the selected test ad as `활동 중`.
- No API issue, policy warning, or review rejection was returned.
- The test was paused immediately after live-state confirmation; campaign and ad set are retained for audit.
- No impressions or spend were reported before the pause.

### Result
- Meta Marketing API production publication is fully operational for administrator-approved advertisements.
- No remaining Page, ad-account, funding-source, system-user, policy, or creative-schema blocker remains.

### Deliverable
- Updated `deliverables/META_AD_PUBLISHING.md`.

### Time Spent
- Policy confirmation, active advertisement creation, review polling, Ads Manager verification, safe pause, and documentation: about 15 minutes.

## 2026-07-24 KST - Site Advertisement AD-50934FB359 Publication Check

### User Request
- Confirm how to determine whether the advertisement requested and approved through the service was published to Meta.

### Database Result
- Advertisement ID: `50934fb3-5958-41f1-add9-9f6cd2d80986`.
- Service status: `active`.
- Meta status: `ad_active`.
- Meta last error: empty.
- Meta campaign, ad-set, creative, and ad IDs are all stored.

### Meta Result
- Campaign `120255992127740550`: `ACTIVE`.
- Ad set `120255992128520550`: `ACTIVE`.
- Ad `120255992129580550`: `ACTIVE`.
- No API issue or review rejection was returned.
- Scheduled start: 2026-07-24 22:41:50 KST.
- Scheduled end: 2026-07-24 23:59:59 KST.
- Lifetime budget: KRW 10,000.
- Ads Manager displayed `예약됨` because the check occurred before the scheduled start.
- Insights were empty before the start time, which is expected.

### Operational Check
- Before start: confirm the ad switch is on and delivery is `예약됨`.
- After start: confirm delivery changes to `활동 중`.
- Final delivery evidence is non-zero impressions/reach/spend in Ads Manager or Graph insights.

### Time Spent
- Service DB lookup, Meta Graph status comparison, Ads Manager verification, and documentation: about 10 minutes.

## 2026-07-24 KST - City Labels, Separate Meta Budget, and Automatic Publication

### User Request
- Replace raw GPS coordinate labels with an approximate city/district name.
- Publish a paid guardian advertisement without waiting for administrator approval.
- Keep the guardian payment as service revenue and calculate the Meta budget separately from location, radius, and duration.

### Implementation
- Extended `/api/maps/search` with reverse geocoding for map clicks and current-location selection.
- New advertisement region labels store Korean city/district text without appended coordinates.
- Added `lib/meta-ad-budget.js` with configurable region-tier, radius, and duration calculation.
- Added separate guardian payment and Meta budget fields to `ad_settings` and `subject_ads`.
- Updated Meta ad-set creation to use only `meta_budget_amount` as `lifetime_budget`.
- Added payment-complete automatic publication with a five-minute claim guard.
- Payment remains completed when Meta fails; the advertisement becomes `meta_publish_failed`.
- Renamed the administrator action to `광고발행 재시도` and retained it as recovery tooling.
- Updated guardian checkout and administrator grids to distinguish payment revenue from Meta budget.

### Database
- Increased schema version from `23` to `24`.
- Migrated the production Turso schema.
- Preserved existing advertisement budgets as `legacy` snapshots without changing Meta IDs or delivery status.
- Reverse-geocoded six existing coordinate-style advertisement labels to Korean city/district text without changing their targeting coordinates.

### Verification
- `npm run build` passed.
- Nominatim forward and reverse Korean city labels passed.
- Meta budget formula cases for Seoul, Busan, and Chuncheon passed.
- Production Turso schema and defaults were verified.
- Existing production advertisement region labels no longer expose coordinate text.
- GitHub commit `e8780f3` was pushed to `main`.
- Vercel production deployment `dpl_hbiQeiAkWHhjohBNnGKtUr13ML5S` reached `READY`.
- `https://zezari.vercel.app` and the production reverse-geocoding API returned HTTP 200.
- Vercel error-log scan returned no runtime errors for the new deployment.
- No real payment or new Meta delivery was created during this change.

### Deliverables
- Added `deliverables/META_AD_AUTOMATION.md`.
- Updated `deliverables/META_AD_PUBLISHING.md`.
- Updated `deliverables/AD_PRICING_MANAGEMENT.md`.
- Updated `deliverables/DATABASE_SCHEMA.md`.

### Time Spent
- Analysis, implementation, migration, formula/API checks, and documentation: about 35 minutes.

## 2026-07-24 KST - Mobile Meta Destination And Guardian Advertisement Link

### User Request
- Add a direct managed-subject page link to Meta advertisements because a mobile viewer cannot scan a QR shown on the same phone.
- Let the guardian open the published advertisement from the advertisement dashboard.

### Implementation
- Added the managed-subject URL to the Meta primary text while retaining the existing `LEARN_MORE` CTA destination.
- Added the same URL as visible text to the browser-captured missing-person poster.
- Added a Meta Graph lookup for `preview_shareable_link` and `creative.effective_object_story_id`.
- Added `meta_preview_url` and `meta_story_id` to `subject_ads`.
- Added `관리대상 페이지` and `광고 피드 보기` links to the authenticated guardian advertisement dashboard.
- Updated the dashboard guidance to reflect automatic publication immediately after payment.
- Preview-link retrieval failure is non-blocking and does not interrupt advertisement delivery.

### Database
- Increased schema version from `24` to `25`.
- Migrated production Turso with the two new Meta-link columns.
- Backfilled both existing advertisements that had Meta ad IDs; no new advertisement or spend was created.

### Verification
- `npm run build` passed.
- `git diff --check` passed before documentation updates.
- Meta Graph returned shareable preview links for both backfill candidates.
- Production Turso reports schema version `25` and two stored preview links.

### Deliverables
- Added `deliverables/META_AD_LINK_ACCESS.md`.
- Updated Meta publishing, database schema, deliverable index, and image-prompt archive.

### Time Spent
- Source analysis, implementation, production migration, backfill, build verification, and documentation: about 25 minutes.

### Deployment
- GitHub `main` commit: `3ea5728`.
- Vercel production deployment: `dpl_GYbMdYEbe3JZdBPVwBTSHenPzZ6a`.
- Production alias: `https://zezari.vercel.app`.
- Home and `/account/ads` returned HTTP 200 after alias assignment.
- A fresh unauthenticated browser correctly returned to onboarding; authenticated button rendering remains protected by the guardian session.

## 2026-07-25 KST - Advertisement Feed Link In Managed-Subject Modal

### User Request
- Show `광고 피드 보기` beside pause and end controls when a guardian opens an already-running advertisement from a managed-subject dashboard card.

### Implementation
- Added the latest advertisement's `meta_preview_url` to the guardian dashboard subject query as `ad_meta_preview_url`.
- Added a new-tab `광고 피드 보기` link to the active advertisement control row.
- The button is rendered only when Meta has returned and stored a shareable preview URL.
- Matched the existing project button sizing and responsive wrapping behavior.

### Verification
- `npm run build` passed.
- `git diff --check` passed.
- Existing production advertisement records already contain Meta preview URLs, so no DB migration is required.

### Deliverables
- Updated `deliverables/META_AD_LINK_ACCESS.md`.
- Added the cumulative presentation image prompt.

### Time Spent
- Source review, implementation, build verification, and documentation: about 10 minutes.

### Deployment
- GitHub `main` commit: `076a658`.
- Vercel production deployment: `dpl_CQQj6jK9k4pEAW1b8aNCMGDBPzt7`.
- `https://zezari.vercel.app` and `/?tab=dashboard` returned HTTP 200 after alias assignment.

## 2026-07-30 KST - Guardian-First Product And Zodiac Design Selection

### User Request
- Replace the product-card-first purchase flow with subject, product, and design select boxes.
- Provide seven exact product choices, including three product combinations.
- Provide all twelve Korean zodiac animals as design choices.

### Implementation
- Replaced the `/shop` category grid with a single checkout client that begins with `나의 관리대상`, `상품`, and `디자인` selects.
- Added bracelet-and-necklace, necklace-and-keyring, and bracelet-and-necklace-and-keyring as real catalog products.
- Added product-specific zodiac design rows for all seven products while preserving existing product, design, and order data.
- Added a compact selected product/design summary and retained quantity, subscription/standalone mode, preview, shipping, coupon, Toss payment, and administrator payment-pass flows.
- The shop limits product choices to the seven requested slugs and design choices to active zodiac names.

### Database
- Increased schema version from `25` to `26`.
- Migrated production Turso before deployment.
- Verified seven required products and twelve active zodiac designs for every product.
- Default standalone prices: 5,000원 for single products, 10,000원 for two-item combinations, and 15,000원 for the three-item combination.

### Verification
- `npm run build` passed after the core implementation.
- Production catalog verification returned seven products with `zodiacCount: 12` each.
- No existing order or uploaded image was deleted.

### Deliverables
- Added `deliverables/SHOP_PRODUCT_SELECTION.md`.
- Updated product catalog, database schema, deliverable index, and image-prompt archive.

### Time Spent
- Analysis, implementation, production catalog migration, build verification, and documentation: about 30 minutes.

### Deployment
- GitHub `main` commit: `87c43a7`.
- Vercel production deployment: `dpl_GumWVzpyDT6dXpverJ1Lgihznztj` (`READY`).
- Assigned `https://zezari.vercel.app` to the deployment and verified HTTP 200 for the home and `/shop` routes.
- The automated in-app browser had no zezari login session, so direct `/shop` access correctly returned to the onboarding screen. Authenticated shop UI behavior is covered by the production build and catalog/API contract verification above.

## 2026-07-30 KST - Product Purchase Includes Continuing QR Service

### User Request
- Remove the period-pass and standalone-product purchase choices from the shop.
- Buying a product should allow continued use of the managed-subject QR page without a separate pass purchase.

### Implementation
- Removed purchase-mode tabs and 1/3/6-month choices from the guardian shop.
- Checkout now charges the selected product/design unit price multiplied by quantity.
- Kept preview, shipping address, coupon, Toss widget, administrator payment pass, delivery, and QR activation flows.
- New completed orders create `product_lifetime` QR service access. Before product QR activation the service is `ready`; after activation it is `active` without an expiry date.
- Public QR page and location-sharing access checks now recognize active `product_lifetime` access.
- Updated guardian billing pages to show `계속 이용`; product-based access cannot enter period pause/resume behavior.
- Disabled the removed standalone order/payment preparation APIs with HTTP 410 for cached clients.
- Updated administrator order labels and revenue aggregation so new service-included orders remain product sales.

### Database
- Increased schema version from `26` to `27`.
- Added `subscriptions.access_type`, defaulting to `periodic` for backward compatibility.
- Existing subscription rows were retained as `periodic`; no product, design, order, or payment data was deleted.

### Verification
- `npm run build` passed.
- `git diff --check` passed before documentation finalization.
- Local Next.js runtime migrated production Turso to schema version `27`.
- Verified the `access_type` column and confirmed the existing subscription row remained `periodic`.
- A public `/find/{key}` request returned HTTP 200 after migration.

### Deliverables
- Added `deliverables/PRODUCT_INCLUDED_QR_SERVICE.md`.
- Updated shop selection, database schema, deliverable index, and image-prompt archive.

### Time Spent
- Analysis, implementation, DB migration, compatibility checks, build verification, and documentation: about 25 minutes.

### Deployment
- GitHub `main` commit: `10514ab`.
- Vercel production deployment: `dpl_8R2gi56J4EdM2xLVMsBfsn5NxkCW` (`READY`).
- Assigned `https://zezari.vercel.app` to the deployment.
- Production home, `/shop`, and a public `/find/{key}` route returned HTTP 200.
- Removed standalone order and payment preparation APIs both returned HTTP 410 in production.

## 2026-07-30 KST - Authenticated Production Browser Test

### User Request
- Use the administrator account already signed in to the Codex in-app browser and carefully test the production service from guardian pages through every administrator page.

### Test Coverage
- Tested 12 guardian/public areas: dashboard, notification bell, guardian information, subject information, My Page, billing, coupons, payment methods, advertisement dashboard, shop and checkout preparation, missing-report advertisement preparation, public QR, and privacy policy.
- Tested all 17 administrator menus and the collapsible sidebar: dashboard, guardians, subjects, QR, orders, subscriptions, payments, coupons, products, advertisements, advertisement pricing, missing reports, location shares, notifications, message templates, inquiries, and administrators.
- Verified PWA manifest and service worker HTTP 200 responses.
- Kept the production test read-only. No payment, refund, advertisement publication, message send, save, delete, activation, role change, or device-permission request was executed.

### Main Findings
- Payment-management revenue cards and the dashboard monthly revenue use different source/eligibility rules and displayed inconsistent totals.
- Recent bulk push records showed 1 success and 9 failures out of 10 recipients.
- The admin dashboard divides all inactive QR inventory by registered subjects, producing an inactive-QR percentage above 100%.
- The customer-inquiry admin list exists, but there is no user inquiry submission flow yet.
- Duplicate-looking guardian email records, browser password autofill in the password-change field, legacy Meta/order wording, and product-admin rendering weight require follow-up review.

### Verification
- No server-error page, blank page, or critical authenticated UI failure appeared during the browser pass.
- Guardian shop product/design selection, coupon recalculation, Toss widget rendering, Kakao address search, map region search, public QR privacy layout, administrator grids, detail tabs, and sidebar collapse all worked.
- Production `/manifest.webmanifest` and `/sw.js` returned HTTP 200.

### Deliverables
- Added `deliverables/PRODUCTION_AUTHENTICATED_BROWSER_TEST_2026-07-30.md`.
- Updated `deliverables/README.md`.

### Time Spent
- Authenticated browser exploration, source comparison, risk classification, and documentation: about 70 minutes.

### Deployment
- GitHub `main` commit: `727b526`.
- Vercel production deployment: `dpl_BbPaYAGxaiPi1Beb9dx31bxPX8K2` (`READY`).
- Assigned `https://zezari.vercel.app` to the deployment and verified HTTP 200 for the home and privacy-policy routes.

## 2026-07-30 KST - Custom Production Domain `zezari.family`

### User Request
- Connect the newly purchased Vercel domain `zezari.family` to the REAL_QR_FIND project.
- Keep `https://zezari.vercel.app` accessible and verify whether both URLs can coexist.

### Implementation
- Verified Vercel registration, Vercel nameservers, active CDN, and automatically renewed wildcard/root SSL certificate.
- Connected `zezari.family` to the existing `zezari` Vercel project without removing `zezari.vercel.app`.
- Updated production `NEXTAUTH_URL` and `PUBLIC_APP_URL` to `https://zezari.family`.
- Updated source fallbacks, Meta destination URL, map API user agent, metadata base, and environment example.
- Migrated all 40 `qr_codes.target_url` rows to `https://zezari.family/find/{public_key}` without changing QR codes, public keys, or subject assignments.
- Retained the Vercel domain so previously printed QR codes remain usable.

### External Provider Follow-up
- Google, Kakao, Naver, and Facebook consoles must allow the new `https://zezari.family/api/auth/callback/{provider}` callback URLs.
- The old Vercel callback URLs should remain registered while both domains are supported.

### Verification
- `npm run build` passed.
- `git diff --check` passed.
- Verified the domain in the Vercel dashboard and CLI.
- Verified 40 custom-domain QR target rows and zero old-domain rows after migration.

### Deliverables
- Added `deliverables/CUSTOM_DOMAIN_SETUP.md`.
- Updated the deliverable index and cumulative image prompt archive.

### Time Spent
- Domain inspection, configuration, QR migration, source update, verification, and documentation: about 25 minutes.

### Deployment
- GitHub `main` commit: `3b996c7`.
- Vercel production deployment: `dpl_PrQLdYZpbRUYdPWxUrEpyHraihpD` (`READY`).
- `https://zezari.family` and `https://zezari.vercel.app` resolve to the same deployment.
- Both domains returned HTTPS 200 for home and public QR paths; the custom-domain privacy, manifest, and service-worker routes also returned HTTPS 200.
- The authentication provider API returned all configured providers and host-matching callback URLs on both domains.

## 2026-07-31 KST - Google And Naver Custom-Domain OAuth Callbacks

### User Request
- Configure Google and Naver login callback URLs directly in the signed-in provider consoles for the new `zezari.family` domain.

### Implementation
- Updated the active Google OAuth web client with the `https://zezari.family` JavaScript origin and Google callback.
- Preserved the existing `zezari.vercel.app` and localhost Google entries.
- Changed the Naver application's primary service URL to `https://zezari.family`.
- Added the custom-domain Naver callback while preserving the Vercel-domain callback.
- Did not expose or copy provider secrets into source control or documentation.

### Verification
- Google opened the account chooser with `redirect_uri=https://zezari.family/api/auth/callback/google` and no redirect mismatch.
- Naver opened the `zezari` consent screen with `redirect_uri=https://zezari.family/api/auth/callback/naver` and no callback error.
- Reopened both provider settings and confirmed the saved custom-domain and compatibility-domain entries.
- Naver remains in development mode, so public login requires Naver review approval; registered app members can test now.

### Deliverables
- Added `deliverables/OAUTH_CALLBACK_SETUP.md`.
- Updated `deliverables/CUSTOM_DOMAIN_SETUP.md`, the deliverable index, and the cumulative image prompt archive.

### Time Spent
- Provider-console inspection, callback registration, live OAuth entry verification, and documentation: about 15 minutes.

## 2026-07-31 KST - Dynamic Administrator Product Catalog

### User Request
- Record the remaining non-Google social login work for later.
- Keep the existing design management, but let administrators manage the products shown in the guardian purchase select box, including name, price, and a long detail-page image.

### Implementation
- Added a cumulative social-login follow-up checklist; Google is complete, while Naver, Kakao, and Facebook remain deferred verification items.
- Increased the DB schema version to 28 and added product-level detail image data/name columns.
- Added an administrator new-product form with name, price, order, description, visibility, representative image, and long detail image.
- New products receive the existing 12 zodiac design rows automatically so the design select remains consistent.
- Extended existing product editors with product-level detail image upload, preview, removal, and corrected `상품 가격` wording.
- Preserved all existing product-design rows and zodiac design selection behavior.
- Removed the fixed seven-slug shop filter so every active administrator-managed product appears in the purchase select box.
- Added an on-demand product detail image API to prevent all long images from being embedded in the initial product list.
- Updated the guardian preview to preserve long-image aspect ratio and show an additional design-detail section when present.

### Verification
- `npm run build` passed with the new `/api/products/[id]/detail` route.
- `git diff --check` passed.
- Local detail endpoint returned the expected 404 for a product without a detail image and produced no server error.
- A temporary inactive product with a 1px PNG verified the on-demand detail endpoint returned HTTP 200, `image/png`, and the exact 68-byte payload; the temporary row was removed immediately.
- Turso schema inspection confirmed `detail_image_data_url` and `detail_image_name`; the existing seven products remained active.

### Deliverables
- Added `deliverables/DYNAMIC_PRODUCT_CATALOG.md`.
- Added `deliverables/FOLLOW_UP_TASKS.md`.
- Updated the deliverable index and cumulative image prompt archive.

### Time Spent
- Source analysis, schema/API/admin/shop implementation, build, DB verification, and documentation: about 30 minutes.

### Production Verification And Deployment
- GitHub `main` commit: `cf5928b`.
- Vercel production deployment: `dpl_APPQHV7Suscu1kNS5bK21mkJGtCv` (`READY`).
- Assigned `https://zezari.vercel.app` to the same deployment as `https://zezari.family`; both home routes returned HTTP 200.
- Authenticated admin product management displayed the new-product form, product-level long detail upload, visibility control, and unchanged design editors.
- Inserted a temporary active product with 12 zodiac designs, confirmed it appeared in the guardian product select box, and confirmed selection updated its 12,300 KRW price and description.
- Removed all temporary product/design rows and confirmed the catalog returned to seven total and seven active products.

## 2026-07-31 KST - Administrator Product Grid And Detail Editor

### User Request
- Redesign administrator product management as a grid for the products shown in the guardian select box.
- Allow administrators to edit product name and price and upload both a product thumbnail and a long detail-page image.

### Implementation
- Replaced the repeated large product-card layout with a dense product grid showing thumbnail, name, price, visibility, order, and detail-page status.
- Added a fixed right-side editor that changes immediately when a grid row is selected.
- Split the editor into `상품 정보` and `디자인 관리` tabs while preserving every existing product-specific design row and image field.
- Added internal horizontal and vertical scrolling so large catalogs, many designs, and long detail images do not expand or shift neighboring products.
- Moved new-product registration into the same detail panel and retained name, price, description, order, visibility, thumbnail, and long detail-page uploads.
- Updated new-product creation to return the created product ID and reopen that exact product after saving.
- Kept the guardian `/shop` catalog contract unchanged: active products appear by administrator sort order with their saved price and media.

### Verification
- `npm run build` passed with all 26 application routes generated.
- `git diff --check` passed.
- Browser verification and production deployment results are recorded below after release.

### Deliverables
- Updated `deliverables/DYNAMIC_PRODUCT_CATALOG.md`.
- Updated the cumulative presentation prompt archive.

### Time Spent
- Existing-flow review, grid/detail editor implementation, responsive styling, build verification, and documentation: about 25 minutes.

### Production Verification And Deployment
- GitHub `main` commit: `571a773`.
- Vercel production deployment: `dpl_7YtMvwc4KVPGNPtT4TWsAfoBHFEX` (`READY`).
- Assigned both `https://zezari.family` and compatibility alias `https://zezari.vercel.app`; home and administrator product routes returned HTTP 200.
- Authenticated production administrator view displayed seven products in the new dense grid.
- At a 1440px test viewport, the grid and the 360px detail editor were side by side with zero overlap; both provided independent scrolling.
- Selecting `팔찌` updated the right editor to `팔찌`, 5,000 KRW, checked the correct row, and preserved `product=product-bracelet` in the URL without page navigation.
- The design tab displayed all twelve bracelet zodiac designs inside the fixed panel scroll area.
- The new-product command displayed name, price, visibility, thumbnail upload, and long detail-page upload without writing production data.
- The guardian shop retained all seven active product options and twelve zodiac designs; administrator and shop console error scans were clean.

## 2026-07-31 KST - Naver Passwordless Signup And Review Resubmission

### User Request
- Re-implement Naver login based on the current rejected review.
- Explain that the earlier application's member data is not migrated or shared.
- Remove the separate password request from Naver first signup.
- Capture the corrected flow and submit a Naver re-review request.

### Implementation
- Removed login ID and password inputs from all social first-signup forms.
- Updated the server completion action so Google, Kakao, Naver, and Facebook accounts do not create or require a service password.
- Preserved credential-signup password validation and existing password hashes.
- Added provider-specific first-signup guidance stating that Naver users sign in without a separate ID or password.
- Updated dashboard completion checks and guardian information editing for social accounts.
- Preserved both production Naver callbacks and added a temporary localhost callback for isolated review verification.

### Review Submission
- Entered the required explanation that the old and new applications are independent member systems and that application changes have no user-identification issue.
- Marked the submitted screenshot as covering email, name, and phone usage.
- Selected `네이버 로그인을 통한 신규 회원 가입에 적용`.
- Uploaded three sanitized screenshots covering the login button, phone verification, and passwordless information-entry screen.
- Submitted the re-review request; Naver Developer status changed from `승인거부` to `검수요청` on 2026-07-31.

### Verification
- Actual Naver OAuth consent and registered localhost callback completed.
- Isolated database flow reached Naver phone verification and the passwordless profile step.
- The profile screen contained no login ID or password input.
- `npm run build` passed.
- `git diff --check` passed before the functional commit.

### Deliverables
- Added `deliverables/NAVER_LOGIN_REVIEW_RESUBMISSION.md`.
- Added sanitized review screenshots under `deliverables/naver-review/`.
- Updated the follow-up checklist, deliverable index, and cumulative image prompt archive.

### Time Spent
- Rejection analysis, source changes, OAuth verification, screenshot preparation, provider-console submission, and documentation: about 50 minutes.

## 2026-07-31 KST - Bizcall Safe Phone Feasibility And Account Readiness Review

### User Request
- Review the attached Bizcall HTTPS integration specification.
- Check the signed-in Bizcall partner account.
- Determine whether a guardian's saved phone can be represented by a safe number on the public managed-subject page.

### Findings
- Confirmed that Bizcall does not rewrite the guardian's real phone number. It assigns an available 050 virtual number and maps that number to the guardian's destination phone.
- Confirmed `/link/auto_mapp.do` for automatic assignment and `/link/set_vn.do` for remapping or release.
- Confirmed the existing `lib/bizcall.js` adapter implements the required POST form, number normalization, MD5/Base64 authentication value, and JSON result handling.
- Confirmed the current account dashboard reports 100 total virtual numbers and 5 assigned numbers, with 050 number management available.
- Confirmed neither local `.env.local` nor Vercel currently contains the Bizcall API base URL or Interface ID environment variables.

### Conclusion
- The required safe-phone flow is technically supported and the application code is prepared.
- Live automatic issuance is not active until Bizcall provides the contract-specific HTTPS API base URL and Interface ID and those values are registered as server-only environment variables.
- No real phone number, password, or API credential was copied into source code or logs.

### Deliverable
- Updated `deliverables/BIZCALL_SAFE_PHONE_INTEGRATION.md` with the account and environment readiness result.

### Time Spent
- Specification review, source comparison, signed-in account inspection, environment-name audit, and documentation: about 15 minutes.

## 2026-08-01 KST - Location-Based Service Business Plan And HWP Deliverables

### User Request
- Complete the remaining location-based service business plan based on the HWPX form in `reference`.
- Add an editable HWP deliverable in addition to the existing documentation work.

### Reference And Source Review
- Parsed `reference/위치기반서비스 사업계획서(양식).hwpx` without modifying it and retained its four main chapters and three attachments.
- Compared the template requirements with the live location flow in `app/find/[key]/location-share-button.js`, `app/api/find/[key]/location/route.js`, `lib/db.js`, `lib/push.js`, the privacy policy, and the existing location-management deliverable.
- Verified the current 2026 location-information protection standard, enforcement decree safeguards, and business-reporting basis through official National Law Information Center sources.
- Used confirmed company information from the public privacy page and did not copy any environment secret, token, or API key.

### Deliverables Created
- Full Korean source manuscript with business status, service scenario, location data flow, safeguards, equipment, management guidelines, evidence checklist, and filing checklist.
- Actual Hancom HWP file, standard HWPX file, A4 PDF, and Word editing copy.
- Five deterministic diagrams: protection organization, service scenario, data flow, safeguard architecture, and major equipment layout.
- Reproducible generators for DOCX, Hancom-import HTML, and HWP/HWPX/PDF conversion.
- A local README describing files, regeneration steps, validation, and required pre-filing work.

### Accuracy And Compliance Boundary
- Existing HTTPS, QR/service validation, location-share persistence, Kakao-map push links, safe-phone exposure rules, and administrator history were documented as implemented.
- Separate service consent records, a legally scoped use/provision ledger, automatic raw-coordinate deletion, coordinate-at-rest protection evidence, and administrator access audit logs were explicitly marked as required before filing.
- Business type, employee/financial information, designated staff, actual cloud regions, contracts, and endpoint-device security evidence remain evidence-backed confirmation items.

### Verification
- HWP reopened successfully and contained every major section; binary signature matched an OLE Hancom document.
- HWPX contained valid package content, one body section, five embedded images, all major sections, and no secret markers.
- PDF was generated by Hancom Office as A4, 19 pages; every page was rasterized and visually reviewed at full resolution.
- Word editing copy contains A4 sections, 11 Heading 1, 45 Heading 2, 17 Heading 3 entries, five inline diagrams, and table geometry with matching table/grid/cell widths.
- The PDF and HWPX text scans contained no known environment secret names or values.

### Time Spent
- Template analysis, legal/source comparison, manuscript drafting, diagram and multi-format generation, two visual QA passes, structural audits, and documentation: about 45 minutes.

### GitHub And Production Deployment
- GitHub `main` document commit: `d4d0f84`.
- Vercel production deployment: `dpl_8HFijjJ1nW9XZ6bevdiC1mb47ygr` (`READY`).
- The deployment URL, `https://zezari.family`, and `https://zezari.vercel.app` each returned HTTP 200.
## 2026-08-01 - Advertisement Distance And Duration Option Catalog

### Requirement
- Replace guardian map/start/end-date advertisement setup with managed-subject, distance, and duration choices.
- Show a final selection summary before payment.
- Replace the old administrator ad-pricing form with independent distance and duration grids that support add, update, delete, and visibility settings.
- Seed the exact distance and duration labels shown in the supplied references.

### Implementation
- Added `ad_distance_options` and `ad_duration_options` with active state, sort order, descriptions, and independently editable prices.
- Seeded 10km, 20km, 40km, 80km, nationwide and 1, 3, 7, 14, 30-day choices.
- Rebuilt the guardian modal into distance, duration, and summary/payment steps.
- Radius choices request the device's current location only when the guardian continues; nationwide uses the Meta `KR` country target without requesting coordinates.
- Added selected option snapshots and `coverage_type` to `subject_ads`; new requests use pricing version 3 while legacy versions remain valid.
- Guardian amount is the duration price plus the distance surcharge. Meta budget remains separately calculated.
- Rebuilt administrator ad-payment management as two scrollable editable grids.
- Updated checkout and guardian ad history labels for the new option names.

### Verification
- `npm run build`: passed.
- `git diff --check`: passed.
- New advertisement INSERT placeholder count: 30, matching the 30 bound values.
- Live Toss payment and live Meta publication were intentionally not executed during automated verification.

### Deliverable
- `deliverables/AD_DISTANCE_DURATION_OPTIONS.md`

### Time Spent
- Analysis, schema and compatibility design, administrator/user UI implementation, pricing validation, build, and documentation: about 45 minutes.

### Production Verification And Deployment
- GitHub `main` implementation commits: `6db5e1c`, `b1f985f`, `a4a5b6e`.
- Vercel production deployment: `dpl_2vcUBe5XWsZMZATPkfgea6GpvteP` (`READY`).
- Verified the signed-in administrator page displays five distance rows and five duration rows with add, delete, active-state, price, and save controls.
- Verified the guardian flow on production: subject selection -> five distance choices -> five duration choices -> selection summary and payment amount.
- Nationwide plus three days produced the expected snapshots and amount: duration 30,000 KRW + distance 100,000 KRW = 130,000 KRW.
- Browser console error log was empty during the verified flow.
- Live payment and Meta publication were not executed because they can incur real charges.

## 2026-08-01 KST - Advertisement Option Save Area Layout Fix

### User Request
- Fix the administrator advertisement-payment page where the save button occupied the row and the guidance sentence wrapped one Korean character per line.

### Root Cause And Implementation
- The shared `.action` class applies `width: 100%`; inside the horizontal flex save bar this consumed the available width and collapsed the sibling paragraph to its minimum content width.
- Replaced the save bar with an explicit `minmax(0, 1fr) + 220-320px` grid.
- Added Korean word-preserving wrapping to the guidance text and retained a one-column mobile layout.

### Verification
- `npm run build`: passed.
- `git diff --check`: passed.
- Distance and duration grid markup and server save action were not changed.

### Time Spent
- Cause analysis, responsive CSS correction, build, and documentation: about 10 minutes.

### Production Verification And Deployment
- GitHub `main` implementation commit: `d75d81c`.
- Vercel production deployment: `dpl_5v5SL9g748esp5w1fHvf1WkBPq4o` (`READY`).
- At a 1280px operating viewport, the save area measured 637px for the guidance and 320px for the button; the guidance remained on one line.
- Document client width and scroll width both measured 1265px, confirming no page-level horizontal overflow.
- Visual inspection confirmed the guidance and button are separated and aligned; browser console errors were empty.

## 2026-08-01 KST - Bizcall 24-Hour Shared Safe-Phone Pool

### User Requirement
- Avoid the cost of assigning one permanent Bizcall 050 number to every guardian.
- Pre-register approximately 10 to 20 safe numbers and assign one to a guardian when a valid managed-subject QR page is opened.
- Keep each mapping for about 24 hours, prevent concurrent duplicate use, and reclaim the oldest mapping when the pool is full.
- Add administrator number-grid management, detail/history, manual release, guardian search, and manual assignment.

### Architecture Decision
- Replaced new permanent guardian provisioning with a server-managed lease pool.
- Uses Bizcall `/link/auto_expire_update.do` with the selected virtual number and `expire_hour=24`; manual release continues to use `/link/set_vn.do`.
- Keeps legacy `guardians.safe_phone*` columns only for migration compatibility. Public QR pages no longer read those columns.
- Assigns only for active, guardian-activated, subject-matched QR pages covered by active period or product-included service access.
- Reuses the guardian's valid lease, then prefers an available number, then recycles the oldest active lease.
- Adds a 30-second per-guardian lock and per-number version claim to prevent duplicate mappings under concurrent QR requests.

### Source Changes
- `lib/bizcall.js`: added explicit-number 24-hour lease API adapter.
- `lib/db.js`: schema version 31; added `safe_phone_pool`, `safe_phone_assignment_history`, and `safe_phone_assignment_locks`; added allocation, expiry, oldest-recycle, manual assignment/release/delete, guardian-phone-change release, and admin query logic.
- `app/admin/page.js`, `app/admin/actions.js`, `app/admin/admin-workspace.js`: added `안심번호 관리` master-detail screen and protected server actions.
- `app/find/[key]` data source: public access now receives only the current pool number or no number; private guardian phone is never returned as fallback.
- `app/dashboard.js`, `app/actions.js`: changed guardian-facing wording from permanent issuance to QR-access 24-hour assignment.
- `app/globals.css`: added responsive status cards, grids, detail/history, and manual-match styling.

### Administrator Workflow
- Register a contracted 050 number and optional admin memo.
- Filter/search the pool and inspect current guardian, subject, match time, expiry, recent access, provider sync, and errors.
- Search a guardian by name, phone, or email and manually assign the selected number for 24 hours.
- Manually release a current mapping, delete a released number, review history, and download CSV.
- The screen displays a configuration warning until the Bizcall API base URL and Interface ID are available on the server.

### Privacy And Failure Rules
- Raw guardian phone remains server-only and is not rendered by the public page.
- Provider/configuration failure shows `안심번호 준비중`; there is no raw-phone fallback.
- Provider credentials, interface ID values, real guardian phones, and contracted 050 numbers are not recorded in this log.

### Verification
- `npm run build`: passed after the pool, lock, public-query, and administrator UI changes.
- `git diff --check`: passed before documentation and will be rerun before deployment.
- Actual Bizcall mapping/call testing remains externally dependent on `BIZCALL_API_BASE_URL`, `BIZCALL_INTERFACE_ID`, and registered pool numbers.

### Deliverables
- `deliverables/BIZCALL_SAFE_PHONE_POOL.md`
- Updated `deliverables/BIZCALL_SAFE_PHONE_INTEGRATION.md`, `DATABASE_SCHEMA.md`, `QR_MANAGEMENT.md`, `USER_MANUAL.md`, `README.md`, and `image_prompts/IMAGE_PROMPTS.md`.

### Time Spent
- Specification review, legacy-flow replacement, concurrency design, DB/server/UI implementation, build, and documentation: about 55 minutes.

### GitHub And Production Verification
- GitHub `main` implementation commit: `4bdedec`.
- Vercel source deployment: `dpl_AXUTHXVngivxsxT2MMMngVwzzpfa` (`READY`).
- `https://zezari.family` and `https://zezari.vercel.app` were aligned to the new deployment and returned HTTP 200.
- Authenticated production verification confirmed the new menu, zero-state pool grid, configuration warning, responsive layout, and no browser console errors.
- An active public QR page showed `안심번호 준비중` while omitting guardian name, raw phone, email, and address.
- No contracted 050 number was added and no Bizcall call was made because the required server API base URL and Interface ID are not configured.

## 2026-08-02 KST - Public QR Safe-Phone Mapping Failure Diagnosis

### User Requirement
- Opening a managed-subject page through either its QR code or direct link must immediately connect an unmapped Bizcall 050 number to the guardian's contact number.
- The public page must display the connected 050 number instead of `안심번호 준비중`.

### Root Cause
- The public request reached the shared-pool allocation code, selected pool rows, and then failed before the provider mapping call because local and Vercel environments had no `BIZCALL_INTERFACE_ID`.
- Production pool rows recorded the missing Bizcall configuration as their latest error. No raw guardian phone was returned to the browser.
- The signed-in Bizcall portal showed that available virtual numbers remain, so pool capacity was not the cause.
- A read-only request confirmed the standard API host responds at `https://api.050bizcall.co.kr`.
- The portal member login ID is not the API Interface ID; using it returned Bizcall result code 2. No mapping request was made with that invalid value.

### Source Changes
- `lib/bizcall.js`: added the verified standard API host as the default while retaining the environment override for contract-specific hosts.
- `lib/db.js`: validates Bizcall configuration before claiming a new pool row, preventing missing credentials from changing an otherwise reusable number to `failed`.
- Existing valid 24-hour assignments are reused before configuration validation, so a temporary environment issue does not hide an already connected safe number.
- `app/admin/page.js`: changed the configuration status to identify the one remaining required value as the Delphicom-issued Interface ID and to distinguish it from the portal login ID.
- `.env.example` and Bizcall deliverables were updated without storing credentials, contracted numbers, or raw guardian phones.

### External Dependency
- Real mapping and call verification remain blocked until Delphicom provides the contract's `BIZCALL_INTERFACE_ID` and it is added to local/Vercel server environments.
- Once that value is present, the next eligible QR/link request retries a failed or available pool row and calls `/link/auto_expire_update.do` with a 24-hour expiry.

### Verification
- `npm run build`: passed with all 26 generated routes and the dynamic `/find/[key]` route.
- `git diff --check`: passed.
- With no Interface ID configured, configuration status now reports only `BIZCALL_INTERFACE_ID` as missing while resolving the standard API host from the server default.
- GitHub `main` implementation commit: `e2da700`.
- Vercel production deployment: `dpl_BjpPx24rqTTPHTQvXvAd2i2CLyvf` (`READY`).
- `https://zezari.family`, `https://zezari.vercel.app`, and the Vercel production alias returned HTTP 200 with matching response sizes.
- An eligible live QR page returned HTTP 200, kept private guardian fields absent, and correctly remained at `안심번호 준비중` because the external Interface ID is still unavailable.

### Time Spent
- Production DB diagnosis, portal and specification verification, API-host validation, source correction, and documentation: about 40 minutes.

## 2026-08-03 KST - Fixed-Template Missing-Person Meta Creative

### User Requirement
- Replace the current captured missing-person advertisement with the exact form in `reference/실종광고 양식.png`.
- Place the managed-subject photo in the left frame, QR in the lower blank, name/age/gender in the right fields, and guardian message in the yellow field.
- Deploy the change and verify an actual Meta advertisement.

### Source Changes
- Added the supplied 1080 x 1350 template as `public/assets/missing-ad-template.png`.
- Rebuilt the on-screen preview in `app/ad-campaign-modal.js` and `app/globals.css` as fixed overlays on the supplied form.
- Replaced responsive DOM screenshot generation with deterministic browser Canvas composition at 1080 x 1350.
- Added cover-cropped subject photo rendering, contained QR rendering, fitted identity text, and bounded multi-line guardian-message rendering.
- Added shared mobile-number sanitization for both the poster message and Meta primary text so a guardian message cannot expose a raw `010` number outside the safe-phone flow.
- Removed the no-longer-needed `html-to-image` dependency.
- Preserved the existing payment, stored-creative, automatic Meta publishing, and clickable managed-subject URL flow.

### Verification
- `npm run build`: passed.
- `git diff --check`: passed.
- Confirmed there are no remaining `html-to-image` source or dependency references.
- GitHub implementation commits: `bdb51f3` and `8163aa6`.
- Vercel production deployment `dpl_FjdF448eUcsWWy8Jn1ukteRzxuwZ`: `READY`.
- `https://zezari.family`, `https://zezari.vercel.app`, and the public template asset returned HTTP 200.
- Real Meta smoke-test resources: campaign `120256212491970550`, ad set `120256212492220550`, creative `2055151212544843`, ad `120256212493240550`.
- Meta Graph verification confirmed the exact uploaded 1080 x 1350 template image, the subject-page destination URL, and sanitized primary text.
- Campaign and ad-set effective status reached `PAUSED`; the ad remained configured `PAUSED` while review was pending. No delivery or spend was initiated.

### Deliverable
- `deliverables/MISSING_AD_TEMPLATE_CREATIVE.md`

### Time Spent
- Template analysis, deterministic image composition, privacy safeguard, responsive preview, builds, deployment, and real paused Meta verification: about 75 minutes.

## 2026-08-03 KST - Legacy WordPress Solapi/SMS Audit

### User Requirement
- Inspect `reference/wp` for a Solapi API implementation used to send signup verification codes.

### Findings
- The extracted directory contains WordPress core only and has no `wp-content`, plugin, or theme source.
- The adjacent `reference/wp.tar.gz` contains 3,228 archived paths but no `wp-content` or plugin files.
- `reference/wp.sql` confirms the legacy site used `mshop-sms-s2` and `mshop-user-certification-s2`, including phone-certification form and field identifiers.
- Exact SQL and source searches returned zero `solapi`, `coolsms`, Solapi API host, CoolSMS API host, or related API-key configuration matches.
- No reusable SMS provider request code or credentials were found. The legacy provider cannot be identified as Solapi from the available backup.

### Impact
- The current generic SMS adapter cannot be configured from the WordPress backup.
- A new Solapi API key, API secret, and registered sender number must be issued in the current Solapi account, then connected to the existing Next.js verification API.
- No key, secret, phone number, or database credential was copied into source or documentation during this audit.

### Time Spent
- Source tree, archive index, and sanitized SQL metadata inspection: about 20 minutes.

## 2026-08-03 KST - Resend Email Verification Replaces Signup SMS

### User Requirement
- Replace signup SMS verification with email verification using Resend and Next.js API Route Handlers on Vercel.
- Keep the existing SMS implementation in source, but hide and disable it instead of deleting it.

### Source Changes
- Added the Resend SDK and `lib/email-verification.js` server adapter with HTML/text verification messages.
- Added `POST /api/signup/email/send` and `POST /api/signup/email/verify`.
- Added `email_verifications` and `guardians.email_verified_at`; schema version increased from 31 to 32.
- Added hashed 6-digit codes, 3-minute code expiry, 15-minute one-time tokens, five-send hourly limits, and five-attempt validation limits.
- Changed direct and first-time SNS signup screens to verify email first; phone remains a required unverified contact field.
- Changed final direct/SNS signup APIs to consume the email token and reject browser-only verification state.
- Preserved `lib/sms.js`, phone verification DB functions, and phone routes. The routes now return HTTP 410 unless `SIGNUP_SMS_VERIFICATION_ENABLED=true`.
- Added backward compatibility so existing completed phone-verified accounts are not forced through signup again.

### Environment
- Added documented variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `EMAIL_DEV_BYPASS_CODE`, and `SIGNUP_SMS_VERIFICATION_ENABLED=false`.
- Neither local nor Vercel environments contained a Resend key before this work.
- After account-owner terms acceptance, Vercel Marketplace free resource `zezari-email` was provisioned for `zezari.family` in `ap-northeast-1` and connected to Production and Development.
- Vercel created encrypted `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` variables. The server derives `제자리 <auth@zezari.family>` from the integration domain unless an explicit sender override is configured.

### Verification
- `npm run build`: passed on Next.js 16.2.11; 28 generated pages and both email routes were present.
- Isolated local DB/API flow passed: send, wrong-code rejection, token issuance, missing-token rejection, successful signup, and SMS HTTP 410.
- Mobile 390 x 844 browser check passed: email-first copy, six code boxes on one row, hidden SMS copy, and no Next.js error overlay.
- `EMAIL_DEV_BYPASS_CODE` was used only with `NODE_ENV=development` and an isolated local database.
- Patched Next.js 16.2.9 to 16.2.11 and NextAuth 4.24.14 to 4.24.15, removing the direct framework/auth advisories shown by npm audit.
- Three indirect high findings remain in Next.js-bundled PostCSS/Sharp packages; npm currently offers no compatible forward patch and suggests an invalid major downgrade, so no forced audit rewrite was applied.
- Vercel Marketplace installation ID: `icfg_39wGQplk4oNBFX5gPEU9IvrS`; resource ID: `ir_EOjjWxWWpqteSZVa`.
- GitHub production commit: `d2b7836` (`feat: replace signup SMS with Resend email verification`).
- Vercel production deployment `dpl_CkVxJSMgepWKW9mg3BirYDj8eoZb`: `READY`.
- `https://zezari.family` and `https://zezari.vercel.app` returned HTTP 200 after deployment.
- A production `POST /api/signup/email/send` request to Resend's official `delivered@resend.dev` test recipient returned HTTP 200 with `devMode:false`, confirming the live route used Resend instead of the development bypass.
- Production `POST /api/signup/phone/send` returned HTTP 410 with the email-verification guidance, confirming the preserved SMS route is disabled.
- Production browser verification confirmed the email-first signup screen, six code boxes on one row, and zero captured console errors.

### Deliverable
- `deliverables/AUTH_EMAIL_VERIFICATION.md`

### Time Spent
- Architecture, DB/API/UI implementation, dependency setup, isolated testing, mobile verification, and documentation: about 65 minutes.

## 2026-08-03 KST - Meta Missing-Person Ad Delivery Verification

### User Requirement
- Confirm whether Meta ad `ZEZARI AD-2B5B7E67EC 나하하 서울특별시 송파구 가락1동` is live and receiving impressions on Facebook.

### Verification
- Confirmed the ad in Ads Manager account `604475922197751` and cross-checked it through Meta Graph API v23.0 using the configured server credential without exposing the credential.
- Campaign `120256218502040550`: `ACTIVE` / effective status `ACTIVE`.
- Ad set `120256218502490550`: `ACTIVE` / effective status `ACTIVE`; scheduled from `2026-08-03 19:41:36 KST` through `2026-08-09 23:59:59 KST`; lifetime budget KRW 67,200.
- Ad `120256218503930550`: `ACTIVE` / configured status `ACTIVE` / effective status `ACTIVE`.
- Verification time was `2026-08-03 19:33:58 KST`, before the scheduled start time.
- Meta Insights returned no rows, so impressions, reach, clicks, and spend had not started at verification time. The ad was approved/configured for delivery but was not yet actually exposed.

### Time Spent
- Ads Manager inspection, Graph API status/insights verification, and documentation: about 10 minutes.

## 2026-08-03 KST - Administrator-Controlled Ad Margin and Meta Budget

### User Requirement
- Determine whether a KRW 70,000 guardian payment caused the KRW 67,200 Meta budget.
- Let administrators set a service margin percentage in Advertisement Payment Management and use it to allocate future Meta budgets.

### Analysis
- The existing KRW 67,200 was not calculated by subtracting 4% from the payment. It came from the independent legacy formula: Seoul capital multiplier, 10km radius, and seven days.
- The identical 4% difference was coincidental.

### Source Changes
- Added `ad_settings.meta_margin_percent` with a 4% default and administrator validation from 0% through 90%.
- Added a margin-rate setting and live KRW 70,000 example to `/admin?section=ad-pricing`.
- Added `calculateMetaBudgetFromPayment()`: Meta lifetime budget is the guardian payment less the stored margin percentage.
- Added nullable `subject_ads.meta_margin_percent` and budget version 3 so every new ad keeps the margin used when requested.
- Updated the guardian preview, payment summary, administrator detail, and CSV output with the stored margin and budget.
- Preserved existing paid and active advertisements without recalculation; budget versions 1 and 2 continue using their stored amounts.

### Verification
- `npm run build`: passed with 28 routes.
- `git diff --check`: passed.
- Formula checks: KRW 70,000 at 4% gives KRW 67,200; at 20% gives KRW 56,000.
- Isolated local DB: schema version 33, default margin 4%, and `subject_ads.meta_margin_percent` confirmed.
- GitHub implementation commit: `4cfcb15`.
- Vercel production deployment `dpl_9VQxMiuLMpYTZ5eBEwiAZ3zZSxaK`: `READY`.
- Production Turso migration verified: schema version 33, default margin 4%, and per-ad margin column present.
- Existing Meta ad `120256218503930550` remained unchanged at guardian amount KRW 70,000, Meta budget KRW 67,200, budget version 2, and NULL margin snapshot.
- The in-app browser had a Meta session but no zezari administrator session, so the production admin URL correctly returned the administrator login screen; authenticated admin visual interaction was not available in that browser session.

### Deliverable
- `deliverables/ADMIN_AD_MARGIN_BUDGET.md`

### Time Spent
- Formula analysis, DB/UI implementation, compatibility safeguards, and isolated verification: about 50 minutes.

## 2026-08-03 KST - Solapi SMS Signup and Guardian Phone Reverification

### User Requirement
- Restore signup verification from Resend email to SMS.
- Use the signed-in Solapi account for production SMS delivery.
- Require SMS verification every time a guardian changes the contact phone number.
- Preserve the email implementation in source while hiding and disabling it.
- Configure Vercel, push to GitHub, deploy, and test the live service.

### Implementation
- Added the official `solapi` Node.js SDK and a server-only sending adapter in `lib/sms.js`.
- Activated SMS by default with `SIGNUP_SMS_VERIFICATION_ENABLED=true`; disabled email routes with `SIGNUP_EMAIL_VERIFICATION_ENABLED=false` and HTTP 410 responses.
- Restored the six-digit SMS-first flow for direct signup and first-time SNS signup while preserving SNS name/email prefill.
- Added `GuardianPhoneVerification` to the guardian information screen. A changed contact number cannot be saved without an authenticated, guardian-bound verification token.
- Added the `guardian_phone_change` purpose, duplicate-phone rejection, one-time token consumption, and `phone_verified_at` refresh.
- Increased DB schema version from 33 to 34 and added `guardian_id` and `provider_message_id` to `phone_verifications`.
- Ordered the existing-DB migration so columns are added before the guardian index is created.
- Kept the Resend package, routes, DB table, and Vercel variables as a disabled rollback path.

### Solapi and Vercel Configuration
- Created a dedicated Solapi server API credential and used the verified active sender number.
- Stored `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_SENDER_NUMBER`, and both verification feature flags as encrypted Vercel Production and Development variables.
- No credential value was written to Git, logs, or deliverables.
- The Vercel serverless environment has no fixed outbound IP, so the Solapi credential permits all IPs and is protected by server-only storage.

### Verification
- `npm run build`: passed on Next.js 16.2.11 with 28 generated routes.
- `git diff --check`: passed; only expected Windows line-ending notices were reported.
- Schema 33 migration fixture upgraded to version 34 with both new columns and `idx_phone_verifications_guardian` present.
- Isolated direct-signup API flow passed: invalid number rejection, send, wrong-code rejection, verification token issuance, successful signup, and token reuse rejection.
- Authenticated guardian phone-change flow passed: send, verify, save, changed current number display, and unverified save rejection.
- Email send route returned HTTP 410 while disabled.
- Mobile browser layout showed all six verification inputs on one row.
- Solapi real API test completed with one success and zero failures in the provider message log.
- `npm audit --omit=dev` still reports three existing high indirect findings through Next.js-bundled PostCSS/Sharp; npm offers only an invalid Next.js 9.3.3 downgrade, so no forced rewrite was applied.

### Deliverables
- `deliverables/AUTH_PHONE_VERIFICATION.md`
- `deliverables/SOLAPI_SMS_PHONE_VERIFICATION.md`
- Updated `deliverables/AUTH_EMAIL_VERIFICATION.md`, `deliverables/AUTH_SETUP.md`, `deliverables/README.md`, and `.env.example`.

### Time Spent
- Solapi setup, DB/API/UI implementation, real/isolated verification, migration hardening, documentation, and release work: about 75 minutes.

### Release Result
- GitHub commit `8172f65` (`feat: restore Solapi SMS verification`) was pushed to `main`.
- Vercel production deployment `dpl_HGbV2Y5p79PHwwu5moLiSZYJrQ2m` reached `READY` and was aliased to `https://zezari.family`.
- `https://zezari.family` and `https://zezari.vercel.app` both returned HTTP 200.
- Production Turso reached schema version 34 with `guardian_id`, `provider_message_id`, and `idx_phone_verifications_guardian` present.
- Production email verification returned HTTP 410, while invalid SMS input returned HTTP 400 after schema initialization.
- Production browser verification confirmed the SMS-first signup copy, six code boxes on one row, no horizontal overflow, and no Next.js error overlay.
- Follow-up detected that the manually managed `zezari.vercel.app` alias still pointed to a two-day-old deployment even though it returned HTTP 200.
- Reassigned `zezari.vercel.app` to the latest READY deployment and verified HTTP 410 for disabled email verification, HTTP 400 for invalid SMS input, and the guardian `인증번호 받기` control on the authenticated screen.

## 2026-08-08 KST - Bizcall On-Demand Safe-Phone Assignment

### User Requirement
- Do not reserve or preload 100 Bizcall numbers in the application.
- Assign a temporary safe number only when a finder actually chooses to call a guardian.
- Allow provider inventory to grow beyond 100 numbers without source changes or local-number registration.
- Apply the contract coloring and guardian announcement, update Vercel, deploy, and run a real integration test.

### Implementation
- Replaced QR-page-load allocation with `POST /api/find/[key]/safe-phone` from a client call button.
- Added Bizcall `/link/auto_expire_mapp.do` provider-side automatic selection with a one-hour expiry.
- Applied the contract coloring and announcement through `/link/set_vn.do`, then reconfirmed expiry through `/link/auto_expire_update.do`.
- Corrected Bizcall authentication to Base64-encode the MD5 hexadecimal text expected by the live account.
- Added request rate limiting, a per-guardian concurrency lock, valid-lease reuse, provider-full handling, and compensation release after partial failure.
- Converted `safe_phone_pool` into provider-returned observed state with `allocation_source`; it is no longer application inventory.
- Added `safe_phone_call_requests` with a non-reversible requester hash and no raw IP or guardian phone.
- Updated the public page so page views allocate nothing and the real guardian phone is never a fallback.
- Reworked the administrator safe-phone page into automatic assignment status, history, CSV, and emergency release controls.
- Increased Turso schema version from 34 to 35.

### Verification
- `npm run build`: passed with the new dynamic safe-phone API route.
- `git diff --check`: passed apart from expected Windows line-ending notices.
- Production Turso schema migration reached version 35 with the new column and request table.
- Active QR page returned HTTP 200, displayed the call-time button, omitted the old pending-number state, and generated no call request on page view.
- Live Bizcall test completed automatic assignment, coloring/announcement application, and expiry update.
- The controlled test placed no telephone call and immediately released the number in both Bizcall and Turso.
- No provider credential, contract ID, private phone, or assigned number was written to source logs or deliverables.
- Public-screen verification found a guardian message containing a directly typed phone number; public find data now replaces phone-shaped text with the safe-phone button guidance while preserving the authenticated source record.

### Deliverables
- `deliverables/BIZCALL_SAFE_PHONE_POOL.md`
- `deliverables/BIZCALL_ON_DEMAND_CALL_ASSIGNMENT.md`
- Updated `deliverables/DATABASE_SCHEMA.md`, `QR_MANAGEMENT.md`, `USER_MANUAL.md`, `README.md`, and `image_prompts/IMAGE_PROMPTS.md`.

### Time Spent
- Specification and portal analysis, API authentication diagnosis, DB/API/UI implementation, real controlled verification, and documentation: about 85 minutes.

### Release Result
- GitHub implementation commit `8b1f978` was pushed to `main`.
- Vercel production deployment `dpl_2oQUBGrRSUxueNoRGCrU7PNzcNRN` reached `READY`.
- The latest deployment was assigned to both `https://zezari.family` and `https://zezari.vercel.app`.
- Both domains and an eligible public QR page returned HTTP 200.
- The production safe-phone API returned HTTP 200, completed a real provider assignment, and the controlled number was immediately released in Bizcall and Turso without placing a call.
- Production Turso remained at schema version 35 and the final assignment source was recorded as `provider_auto`.
- Production browser verification confirmed the call-time button and phone-shaped guardian-message redaction.

## 2026-08-08 KST - Admin Subject QR Manual Test Activation

### User Requirement
- Add an administrator control in Subject Management detail view to activate a subject QR without a product purchase.
- Allow manual end-to-end testing of the public QR flow.

### Implementation
- Added `구매 없이 QR 수동 활성화` and reversible `수동 활성화 해제` controls to the subject detail QR tab.
- Added server-side administrator authorization and QR/subject ownership validation.
- Added `qr_codes.activation_source` and raised the DB schema version from 35 to 36.
- Implemented a subject-specific `admin_test` override without creating or modifying orders, payments, subscriptions, or revenue.
- Connected the override to public subject information, on-demand safe-phone requests, and location sharing.
- Preserved normal purchase activation as `guardian_purchase` and blocked test activation from overwriting it.
- Cleared activation timestamps and sources when a QR is unassigned, rematched, or discarded.

### Verification
- `npm run build`: passed on Next.js 16.2.11 with all 28 routes generated.
- `git diff --check`: passed apart from expected Windows line-ending notices.
- Verified the UI only shows activation for a pending QR or deactivation for an `admin_test` QR.
- Verified public access checks recognize only the selected QR's `admin_test` source and do not grant guardian-wide subscription access.

### Deliverables
- `deliverables/ADMIN_SUBJECT_QR_MANUAL_ACTIVATION.md`
- Updated `deliverables/QR_MANAGEMENT.md`.

### Time Spent
- Data model, server action, administrator UI, public-flow integration, verification, and documentation: about 25 minutes.

### Release Result
- GitHub commit `4b8a8c9` (`feat: add admin QR test activation`) was pushed to `main`.
- Vercel production deployment `dpl_64vzmo6sKREkz61S4ZgNgo2m7Pth` reached `READY`.
- The deployment was assigned to both `https://zezari.family` and `https://zezari.vercel.app`.
- The deployment URL, both production domains, and a matched public QR route returned HTTP 200.
- Production Turso migrated from schema version 35 to 36 and includes `qr_codes.activation_source`.

## 2026-08-09 KST - Location Information Security Controls and Filing Supplement

### User Requirement
- Address the location-based service business-plan review checklist with real application security controls.
- Separate location manager and handler duties, enforce authentication controls, and maintain use/provision/access ledgers.
- Prepare updated DOCX/PDF evidence without exposing secrets.

### Implementation
- Added three-failure credential lockout for 15 minutes and applied the existing 8-16 character letter/number/special-character rule to password changes.
- Added AES-256-GCM encryption for latitude, longitude, accuracy, and location description; the key is stored separately from source and DB.
- Added explicit consent version/time storage, request throttling, 24-hour raw-location expiry, automatic destruction, and destruction ledger entries.
- Added staged location roles: system automation, location manager, location handler, and ordinary administrator. All-stage permission is no longer granted to every role.
- Added hash-chained permission history, use/provision/destruction ledger, and access/export/authentication logs.
- Added administrator `위치정보 보안` screen and permission-checked CSV exports.
- Added HTTPS/HSTS, frame, MIME, referrer, and browser-permission response headers.
- Updated the privacy policy and public location-consent UI.
- Raised Turso schema version from 36 to 37.

### Verification
- Next.js 16.3.0 production build and whitespace checks passed.
- `npm audit --omit=dev` returned zero vulnerabilities after refreshing the compatible dependency lockfile.
- Invalid login testing confirmed lockout after three failures and a 15-minute lock period.
- Encryption round trip confirmed ciphertext versioning and plaintext restoration only with the configured key.
- Location API rejected requests without the current consent version.
- The administrator security screen displayed encryption status, staged permissions, destruction ledger, and protected export controls.
- Existing location records older than the new 24-hour raw retention period were destroyed during migration; 16 destruction entries were recorded.
- The security supplement PDF was rendered page by page and checked for table, screenshot, and Korean text clipping.

### Deliverables
- `deliverables/location-service/LOCATION_SECURITY_COMPLIANCE.md`
- `deliverables/location-service/REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.docx`
- `deliverables/location-service/REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.pdf`
- `deliverables/location-service/evidence/*.png`
- `scripts/generate-location-security-doc.ps1`

### Time Spent
- Reference review, security/data implementation, administrator UI, tests, evidence capture, and document generation: about 120 minutes.

### Operational Evidence Still Required
- Vercel/Turso account, region, invoice, backup/encryption and firewall/WAF screens.
- TLS certificate detail with at least one month remaining at filing time.
- Administrator PC antivirus, OS update, screen lock, MFA, personnel designation, education, and inspection records.

### Release Result
- GitHub implementation commit `d4bedc7` was pushed to `main`.
- Vercel production deployment `dpl_AtAreJjMqyi1AjNmUNA6v9WEP2g1` reached `READY`.
- The deployment was assigned to both `https://zezari.family` and `https://zezari.vercel.app`; home, privacy, admin entry, and an active public QR route returned HTTP 200.
- Production responses included HSTS, MIME sniffing, frame, referrer, and geolocation permission headers.
- Unauthenticated security-ledger export returned HTTP 401 and location submission without explicit consent returned HTTP 400.
- Production Turso reported schema version 37, all seven security tables, and 16 expired raw-location destruction records.

## 2026-08-09 KST - Production Major Equipment Inventory and Evidence

### User Requirement
- Complete business-plan section 4 with the actual REAL_QR_FIND infrastructure configuration.
- Extract reliable Vercel, Turso, and GitHub operating data and provide filing-ready captures where possible.

### Implementation
- Classified the service as a managed-cloud logical-server architecture with no company-owned physical server.
- Documented Vercel as the web/application logical server: project `zezari`, Next.js 16.3.0, Node.js 24.x, READY production deployment, and Function region `iad1`.
- Documented Turso as the database logical server: libSQL/SQLite 3.47.0, `aws-ap-northeast-1`, schema 37, 37 business tables, and 6.68 MB logical size.
- Documented GitHub as the source/change/deployment-history repository: `zezariGit/zezariGit`, `main`, Vercel production deployment linkage, and `.env.local` exclusion.
- Separated administrator PC/network equipment, user-owned smartphones, and external APIs from the core logical servers.
- Added a filing note that the current Vercel Function and Turso DB are in the United States and Japan respectively, requiring cross-border disclosure and region-alignment review.
- Added a reusable metadata collector and a redacted evidence-image generator. No API key, token, secret, or original Turso host was printed.
- Updated section 4.1, section 4.2, the supplemental DOCX/PDF, and the location-service deliverable index.

### Verification
- Confirmed the Vercel project, production deployment ID/status, domains, runtime, and Function region from local project metadata and `vercel inspect`.
- Confirmed Turso region, database engine, schema version, table count, page count, page size, and logical size using read-only metadata queries.
- Confirmed GitHub remote, branch, commit snapshot, deployment relationship, and `.env.local` ignore status from Git metadata.
- Rendered the 56-page PDF and visually checked the major-equipment table and all six evidence pages for clipping, overlap, and orphaned captions.
- Confirmed that evidence JSON and images contain no credential values.

### Deliverables
- `deliverables/location-service/MAJOR_EQUIPMENT_INVENTORY.md`
- `deliverables/location-service/REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.docx`
- `deliverables/location-service/REAL_QR_FIND_위치기반서비스_사업계획서_보안보완본.pdf`
- `deliverables/location-service/evidence/04-vercel-project-deployment.png`
- `deliverables/location-service/evidence/05-turso-database-status.png`
- `deliverables/location-service/evidence/06-github-repository-deployment.png`
- `scripts/collect-infrastructure-evidence.mjs`
- `scripts/generate-infrastructure-evidence.ps1`

### Time Spent
- Infrastructure inspection, official-source verification, redacted evidence generation, document revision, and visual QA: about 55 minutes.

### Filing Follow-up
- Replace or supplement the generated CLI/API evidence with signed-in provider account and billing captures when filing guidance requires provider-native screenshots.
- Attach current TLS certificate details, Vercel/Turso invoices, backup/encryption confirmation, administrator PC security evidence, and administrator MFA evidence.

### Release Result
- GitHub commit `a04fcbe` (`docs: document production infrastructure`) was pushed to `main`.
- Vercel production deployment `dpl_AHxyf7e7YPsbpD6RbATeL9eUYKAa` reached `READY` with Function region `iad1`.
- Both `https://zezari.family` and `https://zezari.vercel.app` were assigned to the deployment and returned HTTP 200.

## 2026-08-10 KST - Location Encryption Evidence Capture

### User Requirement
- Show the encrypted location columns and two or three encrypted-value samples in the in-app browser for filing evidence.

### Verification and Implementation
- Queried the production-connected Turso database without exposing credentials or decrypted coordinates.
- Confirmed 16 `location_shares` records, with all 16 already destroyed by the retention policy and no active ciphertext remaining.
- Created a local evidence page listing the four encrypted columns and three non-identifying ciphertext samples generated by the same AES-256-GCM implementation and configured key.
- Clearly labeled the samples as synthetic evidence values that were not inserted into the database.
- Kept guardian, subject, IP, contact, address, and decrypted location information out of the evidence.

### Deliverables
- `deliverables/location-service/evidence/07-location-encryption-evidence.html`
- `deliverables/location-service/evidence/07-location-encryption-evidence.png`

### Time Spent
- Read-only DB verification, safe sample generation, evidence-page creation, and visual capture: about 15 minutes.

## 2026-08-14 KST - Cloud Account and Logical Server Evidence

### User Requirement
- Capture the signed-in cloud account and service screens from the in-app browser.

### Implementation and Verification
- Captured the Vercel team/project overview after the user explicitly approved dismissing the 2FA recommendation prompt.
- Verified Vercel team `zezariVercel`, Hobby plan, project `zezari`, production status `Ready`, domains `zezari.family` and `real-qr-find.vercel.app`, GitHub source `zezariGit/zezariGit`, and production branch `main`.
- Captured the Turso Cloud database overview showing account `zezarigit`, Free plan, group `default`, database `zezariturso`, and active database status.
- Excluded environment variables, API tokens, database credentials, billing details, payment methods, and personal contact information from the captures.

### Deliverables
- `deliverables/location-service/evidence/08-turso-account-database.png`
- `deliverables/location-service/evidence/09-vercel-account-project.png`

### Time Spent
- Signed-in account inspection, popup handling, redacted-scope capture, and evidence logging: about 15 minutes.

## 2026-08-14 KST - Vercel Hosting Account and Provider Evidence

### User Requirement
- Confirm whether Vercel is the hosting service and capture the hosting account screen with service-provider information.

### Implementation and Verification
- Confirmed that Vercel is the web application hosting and production deployment service for the current architecture.
- Captured the signed-in Vercel project overview showing team `zezariVercel`, Hobby plan, project `zezari`, production deployment `Ready`, domains `zezari.family` and `real-qr-find.vercel.app`, and source branch `main`.
- Captured Vercel's official Terms of Service identifying the service provider as `Vercel Inc.`.
- Captured the official notice address stated in the Terms of Service: `440 N Barranca Ave #4133, Covina, CA 91723`.
- Excluded environment variables, access tokens, payment methods, and personal account credentials from the evidence.

### Deliverables
- `deliverables/location-service/evidence/10-vercel-hosting-account.png`
- `deliverables/location-service/evidence/11-vercel-service-provider-info.png`
- `deliverables/location-service/evidence/12-vercel-service-provider-address.png`

### Time Spent
- Account verification, official provider-document inspection, safe capture, and evidence logging: about 10 minutes.

### Publication
- GitHub commit `1b0eac8` was pushed to `main`.
- Vercel production deployment `dpl_2yrLpXeDUGBr9mDiRULsT572CSsh` reached `READY`; `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200.

## 2026-08-14 KST - Location Use, Provision, and Disclosure Ledgers

### User Requirement
- Automatically retain electronic location use/provision confirmation records with subject, acquisition route, provided service, recipient, and use time.
- Record location-data-subject viewing or notice handling with handler, requester, purpose, and time.

### Implementation
- Reused the automatic `location_use_ledger` flow generated by every public QR location-share and guardian notification result.
- Updated the administrator screen to show the requested five-column use/provision format.
- Added schema version 38 and append-only `location_disclosure_ledger` with handler, requester, purpose, notice type, result, timestamp, and chained integrity hashes.
- Added a protected administrator form for recording view/notice handling facts and CSV export for both ledgers.
- Kept raw coordinates out of both ledgers and recorded ledger access/export operations in `location_access_logs`.

### Deliverable and Verification
- `deliverables/location-service/LOCATION_USE_PROVISION_LEDGER.md`
- `npm run build`: passed.
- `git diff --check`: passed.

### Time Spent
- Source inspection, schema/action/UI implementation, documentation, and build verification: about 25 minutes.

### Publication
- GitHub commit `1e73260` was pushed to `main`.
- Vercel deployment `dpl_5Efa3B3MRgnADyqLUWkZgY4Ge7eG` reached `READY`.
- `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200.

## 2026-08-14 KST - Production Location Ledger Verification

### User Requirement
- Verify that the location share submitted from public key `zrf-kbg9hhmcsn7rm3` was stored in the production database and capture evidence.

### Read-only Production Verification
- Confirmed schema version 38 and the `location_disclosure_ledger` table.
- Confirmed a new `location_shares` row at `2026-08-14 16:11:51 KST` with a 24-hour retention deadline.
- Confirmed raw latitude and longitude compatibility columns contain `0`, while latitude, longitude, accuracy, and address ciphertext fields are populated.
- Confirmed one automatic `collect` ledger row and one `provide` ledger row; both completed successfully.
- Confirmed the provision row's `previous_hash` equals the collection row's `entry_hash`, preserving the ledger chain.
- Excluded coordinates, guardian details, DB URL, and authentication tokens from the evidence.

### Deliverables
- `deliverables/location-service/evidence/13-location-ledger-production-evidence.html`
- `deliverables/location-service/evidence/13-location-ledger-production-evidence.png`

### Time Spent
- Production read-only query, privacy-safe evidence composition, and browser capture: about 15 minutes.

## 2026-08-14 KST - Server and Administrator PC Security Evidence

### User Requirement
- Determine whether security software on the managed server and administrator PC can be verified.

### Verification
- Confirmed Windows 11 Pro with Windows Defender registered and active.
- Confirmed Defender antivirus, real-time protection, behavior monitoring, network inspection, and downloaded-file scanning are enabled.
- Confirmed Windows Firewall is enabled for Domain, Private, and Public profiles.
- Confirmed current Defender engine/signature metadata; quick scan age was six days and no completed full scan was recorded.
- Confirmed Vercel is managed infrastructure without customer OS/antivirus visibility; official Vercel evidence documents platform firewall, DDoS mitigation, continuous cloud-security scanning, SOC 2 Type 2, and ISO 27001:2022 controls.

### Deliverables
- `deliverables/location-service/SECURITY_PROGRAM_EVIDENCE.md`
- `deliverables/location-service/evidence/14-admin-pc-security-evidence.html`
- `deliverables/location-service/evidence/14-admin-pc-security-evidence.png`
- `deliverables/location-service/evidence/15-vercel-managed-security-evidence.png`

### Time Spent
- Local security inspection, official provider verification, and evidence capture: about 15 minutes.

## 2026-08-14 KST - External Tester Maintenance Request Sheet

### User Requirement
- Create a Google Sheets maintenance request form for the project owner and external testers.
- Let testers attach screenshots and describe the current situation and requested result.

### Implementation
- Created the native Google Sheet `REAL_QR_FIND 유지보수 요청서`.
- Added a 22-column request ledger covering test environment, screen/URL, screenshot link, issue details, reproduction steps, expected result, requirement, severity, priority, status, developer response, completion date, and retest result.
- Added dropdowns for request type, severity, priority, workflow status, and retest result.
- Added frozen headers, a native filterable table, status color rules, a completed example row, a writing guide, and a code-definition tab.
- Added privacy guidance requiring masking of phone numbers, addresses, emails, and faces and prohibiting passwords, authentication codes, and API keys.
- Granted `general@zezari.com` editor access and verified the sheet visually in Google Sheets.

### Deliverable
- Google Sheet: https://docs.google.com/spreadsheets/d/1i8gbKgnTgBiMXSaEFXrTn7u7iv9YxA8q6G3DqJRubu4/edit
- `deliverables/MAINTENANCE_REQUEST_SHEET.md`

### Time Spent
- Form design, Google Sheets construction, validation, visual verification, and documentation: about 20 minutes.

## 2026-08-14 KST - Production Source Security Hardening

### User Requirement
- Audit the currently deployed source for security weaknesses while excluding `reference/`.
- Remediate findings without materially changing existing features.

### Audit Findings
- No vulnerable production npm dependencies were reported.
- Stored image upload paths accepted all `image/*` MIME types, allowing an executable SVG risk.
- Push subscription endpoints needed an allowlist before being used by the push sender.
- Verification sends needed requester-based rate limits, and one-time tokens needed atomic consumption.
- Public guardian notification and map-search routes needed abuse limits.
- Admin CSV exports could interpret user-controlled values as spreadsheet formulas.
- Admin return paths accepted network-path URLs, and legacy notification links required client-side defense.

### Implementation
- Restricted image and audio formats, verified raster file signatures, and stopped trusting hidden existing-media fields.
- Added push endpoint and key validation, safe notification URL normalization, public API and verification request limits.
- Made email/SMS verification token consumption atomic and required the production NextAuth secret for verification hashing.
- Increased PBKDF2 to 310,000 iterations while retaining compatibility with existing hashes.
- Required active status for DB administrators and explicitly enabled secure production cookies.
- Protected admin redirects and CSV exports, added partial CSP and supporting browser security headers.
- Added no-store headers to sensitive signup, notification, push, and location responses.
- Added `npm run security:check` and the security review deliverable.

### Verification
- `npm audit --omit=dev --json`: 0 vulnerabilities.
- `npm run security:check`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Local production HTTP check: home 200 with CSP/HSTS/nosniff; unauthenticated notifications 401 with no-store.
- Git ignore and tracked-secret pattern checks passed.

### Deliverable
- `deliverables/SECURITY_HARDENING_REVIEW_2026-08-14.md`

### Time Spent
- Source audit, remediation, regression checks, documentation, and local verification: about 40 minutes.

### Publication
- Security source commit `a034371` was pushed to GitHub `main`.
- Vercel production deployment `dpl_73DwtxGAFjb6ZzGM1NgcyiVYXtKm` reached `READY`.
- Reassigned the legacy `zezari.vercel.app` alias to the current production deployment.
- `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200 with CSP, HSTS, and nosniff headers.
- Production notifications returned unauthenticated HTTP 401 with `Cache-Control: no-store`; no production error logs were found in the post-deploy scan.

## 2026-08-19 KST - Operations Architecture, Service, and Account Register

### User Requirement
- Summarize and maintain the completed project architecture across Vercel, Turso DB, GitHub, and the local workspace.
- Include connected services such as Bizcall safe phone, Solapi verification, Toss Payments, Meta advertisements, OAuth, and Push.
- Manage account login and password information for future operations and handoff.

### Security Decision
- Did not record plaintext passwords, API keys, access tokens, MFA recovery codes, or environment-variable values in Git, logs, or deliverables.
- Designed the account register to hold login URLs, known account identifiers, owners, MFA/recovery status, and password-manager item names only.
- Added Git ignore patterns for local credential notes and password-manager exports.

### Verified Metadata
- Git remote: `zezariGit/zezariGit`, branch `main`; local Git identity `zezariGit / general@zezari.com`.
- Vercel Team/Project: `zezari / zezari`, Node.js 24, current Production deployment Ready.
- Turso host: `zezariturso-zezarigit.aws-ap-northeast-1.turso.io`; URL and token are present without exposing values.
- Confirmed 37 application tables across members, subjects/QR, commerce, ads, notifications, safe phone, location security, and audit domains.
- Confirmed encrypted Vercel environment-variable entries for Turso, OAuth, Solapi, Toss, Meta, Bizcall, VAPID, and location encryption.
- Current verification mode: Solapi SMS enabled; Resend email verification disabled and retained as a fallback.

### Deliverables
- `deliverables/operations/OPERATIONS_ARCHITECTURE.md`
- `deliverables/operations/SERVICE_CONFIGURATION_REGISTER.md`
- `deliverables/operations/ACCOUNT_ACCESS_REGISTER.md`
- Updated `deliverables/README.md` and `.gitignore`.

### Time Spent
- Metadata inspection, service/code mapping, architecture and access-register authoring, and security review: about 35 minutes.

## 2026-08-19 KST - Black Dashboard Style Preview

### User Requirement
- Review `reference/제자리 서비스_와이어프레임 (최신).pdf` and prepare a black-themed dashboard preview before changing the live application CSS.
- Keep the preview separate so layout, spacing, colors, and responsive behavior can be reviewed first.

### Reflected Work
- Rendered and visually reviewed the complete one-page wireframe and isolated the dashboard information structure.
- Created an independent static preview with the wireframe's guardian greeting, primary tabs, subject status list, and three main actions.
- Replaced the former purple primary color with black, white, and neutral gray while preserving green, amber, and red only for status meaning.
- Added PC and 390px mobile comparison views, responsive behavior, tab selection, and subject row selection.

### Verification
- Desktop browser render completed with 18 interactive buttons and no console warnings or errors.
- Mobile 390px render completed with no horizontal overflow (`bodyScrollWidth = bodyClientWidth = 390`).
- Tab switching and selected-subject state were verified.

### Deliverables
- `deliverables/previews/BLACK_DASHBOARD_STYLE_PREVIEW.html`
- `deliverables/previews/BLACK_DASHBOARD_STYLE_PREVIEW.png`
- `deliverables/previews/BLACK_DASHBOARD_STYLE_PREVIEW_MOBILE.png`

### Scope and Time Spent
- Reference review, preview authoring, desktop/mobile render checks, and interaction verification: about 25 minutes.
- Preview only. No production application source, GitHub branch, or Vercel deployment was changed.

## 2026-08-19 KST - Production Black Theme and Guardian Dashboard Navigation

### User Requirement
- Apply the approved black CSS preview to the live application.
- Remove the visible dashboard, guardian information, and subject information tabs.
- Show three subjects per current-status page and expose later subjects by horizontal swipe.
- Add a plus button after the last subject that opens the hidden subject-information route.
- Keep guardian editing accessible from the My Page information-edit link.

### Reflected Work
- Replaced the shared gov-style primary, information, background, border, focus, browser-theme, and PWA-theme colors with black and neutral gray tokens.
- Added a black user app bar with brand, notification, and My Page controls.
- Removed the visible three-tab menu while preserving guardian and subject edit routes.
- Added dashboard-return navigation to hidden edit screens.
- Grouped subjects in pages of three inside a touch-friendly `scroll-snap` horizontal carousel.
- Added the subject `+` action only below the final group and only while fewer than four subjects are registered.
- Updated My Page guardian, address, and subject edit links to the preserved edit anchors.
- Removed the redundant dashboard subject-summary panel.

### Verification
- `npm run build`: passed.
- `npm run security:check`: passed.
- `git diff --check`: no whitespace errors.
- Local production browser checks passed at desktop and 390px mobile widths with no console errors or horizontal page overflow.

### Deliverable and Time Spent
- `deliverables/USER_DASHBOARD_BLACK_THEME.md`
- Implementation, responsive styling, build/security checks, and browser verification: about 45 minutes.

### Publication
- Source commit `e10ba48` was pushed to GitHub `main`.
- Vercel production deployment `dpl_CCwZ8K3wtehLEkmuFUXYxyC91Z5f` reached `READY`.
- Reassigned `zezari.vercel.app` to the same current production deployment.
- `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200 with theme color `#111111` and HSTS.
- Authenticated production verification confirmed zero visible top tabs, three subject cards, the subject-add button, and the preserved guardian/subject edit routes.
- No production error logs were found in the post-deployment scan.

## 2026-08-19 KST - Dashboard Header, Carousel Indicator, and Unlimited Subjects

### User Requirement
- Remove the black dashboard app bar and the `Z 제자리` brand while returning the notification bell to the upper-left position.
- Keep My Page available in the upper-right corner.
- Make missing report, product purchase, and My Page quick actions use the same visual treatment.
- Add page dots below the subject carousel and darken the dot for the current swipe page.
- Remove the guardian limit of four subjects and allow continued subject registration.

### Reflected Work
- Removed the dashboard app-bar markup and restored independent upper-left notification and upper-right My Page controls.
- Removed the first quick-action special case so all three buttons share the white background, black border, and black icon/text style.
- Added `app/managed-subject-carousel.js`, which tracks horizontal scroll position, updates the active page dot, and supports dot-button navigation.
- Kept three subjects per carousel page and made the subject-add button permanently available on the final page.
- Removed the four-subject guard from `saveSubject()` and always render one blank subject-registration form after existing subjects.
- Removed the maximum-four guidance, `/4` counters, and the administrator `/4명` badge.

### Verification and Time Spent
- `npm run build`: passed.
- `npm run security:check`: passed.
- `git diff --check`: no whitespace errors.
- Local production server returned without browser console warnings or errors.
- Implementation, regression review, documentation, and local verification: about 30 minutes.

### Publication
- Source commit `6b44e6f` was pushed to GitHub `main`.
- Vercel production deployment `dpl_JBjTqZM91duksEqaTNUz7TbmCfbK` reached `READY`.
- Reassigned `zezari.vercel.app` to the same deployment.
- Authenticated production verification used an account with four subjects and confirmed two carousel pages, two page dots, active-dot switching, and the always-available fifth-subject registration form.
- Confirmed the notification bell at upper left, My Page at upper right, no app bar or brand, and identical styling for all three quick actions.
- `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200 with HSTS; no post-deployment production error logs were found.

## 2026-08-19 KST - Single-Subject Registration and My Page Edit List

### User Requirement
- Show only one blank form when adding a new subject instead of listing every registered subject on the subject-information page.
- Edit one selected subject at a time.
- Move the subject editing entry points into My Page and grow the list as subjects are registered.
- Do not implement subject-name search.

### Reflected Work
- Added the `editSubject` query parameter and owner-scoped subject selection in the existing dashboard data set.
- Changed the subject-information route to render exactly one form: a blank form for new registration or the selected subject form for editing.
- Replaced the former primary-subject summary in My Page with a full subject list showing image, name, status, gender, birth date, and an edit chevron.
- Added a persistent `대상자 추가` action below the My Page list and updated the dashboard plus action and empty-shop link to the new-registration route.
- Preserved the selected subject route after edit success or validation error, and return to the updated My Page list after deletion.
- No subject-name search control or search data path was added.

### Verification and Time Spent
- `npm run build`: passed.
- `npm run security:check`: passed.
- `git diff --check`: no whitespace errors.
- Implementation, routing review, responsive styling, documentation, and local regression checks: about 25 minutes.

### Publication
- Source commit `f90f21c` was pushed to GitHub `main`.
- Vercel production deployment `dpl_B6kFRmmSZoems2y91V2LxzJZAFkF` reached `READY`, and `zezari.vercel.app` was reassigned to it.
- Authenticated 390px production verification confirmed four My Page subject rows, zero subject-search inputs, one blank new-subject form, and one selected-subject edit form.
- No mobile horizontal overflow or browser console warnings/errors were found.

## 2026-08-19 KST - Unassigned QR External-Sales Signup And Exact Subject Matching

### User Requirement
- Add regular signup and Google, Kakao, Naver, and Facebook signup actions to the unassigned QR page.
- Keep the existing SMS phone verification and guardian-information steps.
- Require at least one managed subject after signup.
- When signup starts from an unassigned QR, connect that exact QR to the first newly registered subject.
- Preserve normal signup behavior that assigns one remaining unassigned QR.

### Reflected Work
- Added `POST /api/qr-claim/start` and an HTTP-only `zezari_qr_signup_claim` cookie.
- Applied the shared hashed-identity public API limiter at 10 claim starts per 10 minutes.
- Added DB schema version 39 with hashed claim, claim expiry, and claim-start columns on `qr_codes`.
- Reserved the scanned QR for two hours and excluded active reservations from ordinary oldest-unassigned-QR allocation.
- Added atomic exact-QR assignment conditions and compensating subject deletion when exact matching fails.
- Added regular signup, existing-member login, and four SNS signup buttons to the public unassigned QR screen.
- Preserved Solapi phone verification for regular and SNS signup and removed dashboard bypass actions from new-member completion screens.
- Forced non-admin guardians with zero subjects into the one-subject registration route.
- Added a scanned-QR waiting banner and a distinct exact-QR completion message.

### Verification
- `npm run build`: passed.
- `npm run security:check`: passed.
- `npm run test:qr-claim`: exact reserved-QR assignment and normal allocation reservation exclusion passed on an isolated libSQL database.
- `git diff --check`: no whitespace errors.
- Production Turso schema version 39 and all three `signup_claim_*` columns confirmed.
- Desktop and 375px mobile browser verification confirmed all six entry actions, equal button widths, and no horizontal overflow.
- A stale localhost NextAuth cookie emitted a development-only JWT decryption warning; the public page correctly rendered unauthenticated and this does not affect the production-domain session cookie.

### Deliverable And Time Spent
- `deliverables/QR_EXTERNAL_SALES_ONBOARDING.md`
- `scripts/qr-signup-claim-regression.mjs`
- Flow analysis, DB design, implementation, automated checks, and responsive verification: about 55 minutes.

### Publication
- Source commit `8e4ec29` was pushed to GitHub `main`.
- Vercel production deployment `dpl_C8R2trr5mD6Wz9nLJpwFTeMoPNVU` reached `READY`.
- Reassigned `zezari.vercel.app` to the same production deployment.
- `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app` returned HTTP 200 with HSTS and rendered all regular/SNS signup actions on an unassigned QR page.
- Production 375px browser verification confirmed six enabled entry buttons, no horizontal overflow, and no browser console warnings or errors.
- Production invalid-key API verification returned HTTP 409 without creating a reservation.

## 2026-08-19 KST - Administrator-Selected Store-Sale QR Reservation

### User Requirement
- Let administrators designate an active unassigned QR as `QR선점 - 스토어판매용` from the QR detail management tab.
- Keep the reservation control disabled for already assigned QR codes.
- Allow a store-sale reserved QR to be matched only through its public QR page, signup or login, and mandatory new-subject registration.
- Keep normal signup allocation from consuming store-sale reserved QR inventory.

### Reflected Work
- Bumped the DB schema to version 40 and added `store_sale_reserved` and `store_sale_reserved_at` to `qr_codes`.
- Added administrator reserve/release action with server-side checks for assignment, lifecycle, and active state.
- Added store-sale state to the QR list, detail badges, basic information, management tab, activity timeline, status summary, and CSV export.
- Disabled the reserve control for assigned, discarded, or inactive QR rows and hid manual matching while the QR remains store-sale reserved.
- Blocked crafted administrator manual-match requests for reserved QR codes until reservation release.
- Limited `POST /api/qr-claim/start` and active browser claims to administrator-reserved QR codes.
- Excluded persistent store-sale reservations from normal oldest-unassigned-QR allocation even when no browser has started signup.
- Required both the persistent administrator reservation and the two-hour browser claim in the atomic exact-QR assignment.
- Cleared both reservation layers after successful assignment and cleared them on manual lifecycle transitions where the QR leaves the external-sale pool.
- Unselected unassigned QR pages now show status guidance only; signup and SNS actions appear only on store-sale reserved QR pages.

### Verification And Deliverables
- `npm run test:qr-claim`: passed unselected-claim rejection, exact selected-QR assignment, reservation cleanup, and normal-allocation exclusion.
- `npm run build`: passed.
- `npm run security:check`: passed.
- `git diff --check`: passed before documentation updates.
- Isolated schema-version-40 libSQL browser verification confirmed that an unselected QR renders zero signup actions while a store-sale reserved QR renders six enabled regular/SNS/login actions.
- 375px verification confirmed six equal-width buttons, no horizontal overflow, and no browser console warnings/errors.
- Updated `deliverables/QR_EXTERNAL_SALES_ONBOARDING.md`, deliverables index, and image-generation prompt.
- Analysis, schema work, implementation, and automated verification: about 40 minutes.

### Publication
- Feature commit `856e221` was pushed to GitHub `main`.
- Vercel production deployment `dpl_7wxBumdJTvT7oHcMLktnLBdxYd4J` reached `READY`; `zezari.vercel.app` was reassigned to the same deployment.
- Production Turso migrated to schema version 40 and both `store_sale_reserved` columns were confirmed.
- A conditionally selected production test QR rendered all six signup/login actions on `zezari.family`, `zezari.vercel.app`, and `real-qr-find.vercel.app`; all returned HTTP 200 with HSTS.
- The selected QR claim API returned HTTP 200 and one HTTP-only claim cookie.
- The test QR was immediately restored to its original unselected state with all claim fields cleared; the public page then hid signup actions and the claim API returned HTTP 409.
- No production subject, guardian, order, payment, or permanent QR assignment was created during verification.

## 2026-08-20 KST - Image Upload Policy And Popup Responsiveness

### User Requirement
- Confirm the current guardian and managed-subject photo upload limits.
- Add an administrator image-upload menu that can change both limits and apply them to actual uploads.
- Alert users with the configured limit when an oversized file is selected.
- Close the notification and My Page popups when the backdrop is clicked or touched.
- Open My Page faster.
- Correct the vertically stretched close button in the mobile missing-ad modal.

### Existing State Found
- Managed-subject photos used the default `fileToDataUrl()` server limit of 1MB.
- Guardian photo upload did not exist, so there was no guardian-photo limit.
- My Page opened through a query-string navigation that reran dashboard data loading and generated QR images for every subject.
- The mobile ad backdrop stretched the grid container to the viewport and distributed unused height across auto rows, stretching the footer and close control.

### Reflected Work
- Bumped the DB schema to version 41 and added `image_upload_settings` with separate guardian and subject byte limits.
- Seeded both limits at 1MB and allowed administrators to set integer values from 1MB to 4MB.
- Added `이미지업로드 관리` to the administrator sidebar with a two-setting form and shared success/error notices.
- Added guardian photo columns, guardian profile uploader, authenticated image response route, and My Page avatar display.
- Added reusable client file-size validation with a configured-MB alert and input reset.
- Kept authoritative server MIME signature and size validation for guardian and managed-subject photos.
- Replaced My Page server navigation with an immediate client overlay and preloaded the small subscription record in the dashboard batch.
- Limited QR data-URL generation to the selected advertisement/edit/registration subject instead of every dashboard subject.
- Added outside pointer and Escape dismissal to Notification and My Page popups.
- Forced advertisement modal grid rows to content height and constrained the close button to a normal inline control on mobile.

### Verification
- `npm run build`: passed, including `/api/guardians/me/photo`.
- `npm run security:check`: passed.
- Isolated libSQL migration confirmed schema version 41, both guardian photo columns, and 1,048,576-byte defaults for both upload types.
- Local 375px browser check found no horizontal overflow on the application shell.
- `git diff --check`: passed before documentation updates.

### Deliverable And Time Spent
- `deliverables/IMAGE_UPLOAD_MANAGEMENT.md`
- DB/UI analysis, implementation, build, schema test, and responsive inspection: about 50 minutes.

## 2026-08-20 KST - Shop Entry Performance Optimization

### User Requirement
- Determine why opening the product-purchase screen takes about three to five seconds.
- Improve the transition without changing product selection, coupon, order, or payment behavior.

### Existing State Found
- `/shop` loaded every active product and design Base64 image into the initial server-component payload.
- Production data contained about 3.3MB of inline catalog image text.
- Direct production Turso probes took about 1.1 seconds for products and 1.4 seconds for designs containing those images.
- `getGuardianCoupons()` called `getDashboardData()` internally while the shop page already called it separately, duplicating guardian and common-setting reads.
- The dynamic route had no route-level loading UI.

### Reflected Work
- Added `getShopProducts()` with lightweight image flags and a single Turso metadata batch.
- Added `getShopPageData()` to batch the minimal guardian, subject, and coupon records without duplicate dashboard reads.
- Added cached image routes for product thumbnails and design thumbnails/details.
- Changed the shop client to construct versioned image URLs instead of receiving Base64 source strings.
- Added an immediate `/shop` loading skeleton while preserving all existing selection, coupon, Toss, and administrator payment-pass logic.

### Verification And Deliverable
- Production Turso metadata probe returned 7 products and 101 designs in about 0.44 seconds with a 33KB JSON payload.
- Local product and design image routes returned HTTP 200 with their expected image MIME types.
- `npm run build`: passed with all three new image routes and `/shop`.
- `npm run security:check`: passed.
- `git diff --check`: passed before documentation updates.
- `deliverables/SHOP_LOADING_PERFORMANCE.md`
- Investigation, implementation, performance probe, build, and route verification: about 35 minutes.

## 2026-08-20 KST - Shop Server Error And Google OAuth Return Fix

### User Requirement
- Fix the production server-error screen shown after pressing `상품 구매` and verify the signed-in flow on `zezari.family`.
- Remove the extra-looking login/callback step after a Google session expires.

### Root Cause
- The lightweight shop query introduced during the performance optimization selected `guardians.postal_code`, but the production guardian schema stores postal text inside `address` and has no `postal_code` column.
- Social login without an explicit callback reused the current URL. Logging out from `?panel=my` therefore returned Google login to that same query and reopened My Page, which looked like an extra intermediate login screen.

### Reflected Work
- Removed the nonexistent `postal_code` field from `getShopPageData()`.
- Set all SNS login and logout callbacks to the application root by default.
- Added a NextAuth sign-in page override and a server redirect callback that permits only relative paths or the current origin; invalid or external callback URLs return to the root.

### Verification And Publication
- `npm run build`, `npm run security:check`, and `git diff --check`: passed.
- GitHub `main` commit `246ee0d` pushed.
- Vercel deployment `dpl_5KFMofPfVnHzo1XjzJNeR11g6kTE` reached `READY` and was aliased to `zezari.family`.
- Authenticated production transition to `/shop`: about 0.73 seconds; product, subject, design, quantity, price, and next-step controls rendered.
- Product/design change to `팔찌&목걸이 / 소` updated the summary correctly.
- Production function logs showed `/shop` HTTP 200 without the previous LibSQL exception.
- Google logout returned to `https://zezari.family/`; one Google button click plus account selection returned directly to the root dashboard with no reopened My Page or second application login button.
- Investigation, correction, deployment, and production browser verification: about 25 minutes.

## 2026-08-23 KST - Google Login Performance And Active Session Retention

### User Requirement
- Determine why Google login takes a long time.
- Keep signed-in users logged in instead of asking them to authenticate again shortly afterward.

### Root Cause
- Vercel Functions ran in `iad1` while Turso ran in `aws-ap-northeast-1`; the OAuth callback immediately loaded dashboard data over a long-distance server-to-database path.
- The application used the default JWT session duration and did not refresh an active session in the browser.
- The canonical and legacy domains had independent host cookies, so switching hosts could appear to end a valid login.

### Reflected Work
- Configured production functions for `hnd1` and confirmed deployed function outputs in that region.
- Set production `NEXTAUTH_URL` and `PUBLIC_APP_URL` to `https://zezari.family`.
- Added an explicit configurable 90-day JWT/session maximum age.
- Added a non-blocking session refresh on app open, every six hours, and on meaningful focus/online returns.
- Added permanent legacy-host redirects and reassigned `zezari.vercel.app` to the latest production deployment.

### Verification And Publication
- `npm run build`, `npm run security:check`, and `git diff --check`: passed before documentation updates.
- GitHub `main` feature commit `327b7ab` pushed.
- Vercel production deployment `dpl_8WbNSVKiNcvvdmvE1aVwcFxuVE9y` reached `READY`.
- Dashboard visible time improved from about 2,865ms to about 568ms.
- Google chooser opened in about 2,135ms; existing-account selection returned directly to the dashboard in about 3,436ms without a second app login screen.
- `/shop` and dashboard navigation retained the authenticated session.
- `zezari.vercel.app/shop` redirected to `zezari.family/shop` and retained login.
- `deliverables/AUTH_SESSION_PERFORMANCE.md` created and `deliverables/AUTH_SETUP.md` updated.
- Investigation, implementation, deployment, and production verification: about 40 minutes.

## 2026-08-24 KST - Development And Operations Account Inventory Review

### User Requirement
- Enumerate every external login required to develop and operate ZEZARI, including Google, Kakao, Facebook, GitHub, and Vercel.

### Review Result
- Rechecked the operations architecture, service configuration register, account access register, and active Git remote.
- Classified accounts into source/hosting/database/domain, SNS OAuth, and messaging/payment/advertising/safe-phone/email providers.
- Confirmed GitHub `zezariGit`, Vercel `zezari / zezari` with user `zezarigit`, Turso organization `zezarigit`, and the `zezariGit/zezariGit` Git remote.
- Kept passwords, API keys, tokens, MFA secrets, and recovery codes out of Git and logs; unknown provider login IDs remain marked for verification in the password manager.
- Updated `deliverables/operations/ACCOUNT_ACCESS_REGISTER.md` with the 2026-08-24 audit summary.
- Review and documentation: about 10 minutes.

## 2026-08-24 KST - Development Profile Switcher Design

### User Requirement
- Design an easy executable that switches all development accounts together when moving from ZEZARI to another project.
- Include Codex/OpenAI, GitHub, Vercel, database, Google and other provider-console access.
- Explain the design before implementation.

### Review And Decisions
- Confirmed Codex, Git, GitHub CLI, Vercel CLI and VS Code are installed; Turso CLI and gcloud are not installed.
- Confirmed supported isolation controls: Codex `CODEX_HOME` and profiles, GitHub CLI `GH_CONFIG_DIR`, Vercel `--global-config`, and VS Code user-data/profile directories.
- Chose isolated child-process workspaces instead of changing global Windows accounts or copying browser cookies and tokens.
- Defined a one-time interactive login followed by one-click project launch model.
- Recommended a PowerShell/JSON MVP followed by a .NET 8 WPF single-EXE application.
- Added security gates for Git identity, remote owner, Vercel scope/project and production DB mismatch.
- No executable or source implementation was performed in this design-only step.

### Deliverable And Time Spent
- `deliverables/operations/DEVELOPMENT_PROFILE_SWITCHER_DESIGN.md`
- Research, local tool inspection, architecture and documentation: about 25 minutes.

## 2026-08-24 KST - Development Environment Account Switcher Implementation

### User Requirement
- Build the account-switching program rather than stopping at the design.
- Existing projects must retain their current development environment.
- New projects must select an existing development account bundle or create an isolated new bundle.
- Keep daily usage as simple as possible for a Codex CLI workflow.

### Reflected Work
- Added a PowerShell 7 WinForms GUI, a compiled Windows EXE launcher, a desktop shortcut and the `dev` command.
- Separated project profiles from reusable account bundles.
- Added existing-project scanning for GitHub remotes, Git identity, Vercel links, environment variable names and DB providers without reading secret values into profile storage.
- Added new-project folder/profile creation and existing/new account selection.
- Added per-account Codex `CODEX_HOME`, GitHub `GH_CONFIG_DIR`, Vercel global config and isolated browser data directories.
- Added project-only Git identity, GitHub credential-helper isolation, parent environment sanitization and project `.env.local` precedence.
- Added local connection diagnostics and secret-free JSONL audit logs.
- Installed the program under `%LOCALAPPDATA%\DevProfileSwitcher`, created `dev.cmd`, `DevProfileSwitcher.exe` and the desktop shortcut.

### Actual Profiles
- Registered `zezari` at `C:\REAL_QR_FIND` with the current development account bundle.
- Registered `stock` at `C:\soonsuboy_dev_project\stock` with isolated `stock-personal` storage.
- Recovered the STOCK Git identity from its commit history and applied `soonsuboy <soonsuboy10@gmail.com>` locally.
- STOCK Turso variables were detected; STOCK GitHub CLI, Vercel and Codex require one-time login through `dev login stock-personal all`.

### Verification And Deliverables
- Automated profile-store, import, new-project, secret-filtering, launch-isolation and switching tests passed.
- GUI launch and ZEZARI/STOCK project rendering verified.
- ZEZARI Codex, Vercel and Turso detection passed; STOCK isolated login-required states were reported without hanging.
- `tools/dev-profile-switcher/`
- `deliverables/operations/DEVELOPMENT_PROFILE_SWITCHER_IMPLEMENTATION.md`
- Implementation, installation, profile migration and verification: about 45 minutes.

## 2026-08-24 KST - Profile Switcher Launch Error Correction

### User Report
- After pressing `Codex로 개발 시작` for STOCK, the terminal showed a Git credential helper multiple-value error and reported that Codex CLI could not be found.
- Asked whether the account environment had actually changed.

### Root Cause
- The project path, account ID, Codex home, GitHub config and Vercel config had changed correctly, but Git helper values were appended on every launch.
- Only the Microsoft Store Codex app's internal executable was discoverable in the Codex-hosted process. A normal Windows terminal did not have an independent Codex CLI, and direct execution of the Store resource failed with OS error code 5.
- The Codex-hosted parent process could also pass `TERM=dumb`, which disables the interactive TUI in the new terminal.

### Correction
- Clear repository-local GitHub credential helper values before installing exactly one reset helper and one profile-scoped `gh auth git-credential` helper.
- Installed official `@openai/codex` CLI `0.149.1` globally and changed the switcher to prefer `%APPDATA%\npm\codex.cmd`.
- Updated the installer to install the independent official CLI automatically when absent.
- Removed inherited `TERM=dumb` in the child development terminal.
- Added visible Codex, GitHub and Vercel profile paths to the launch banner.

### Verification
- ZEZARI `CODEX_HOME` reports `Logged in using ChatGPT`.
- STOCK isolated `CODEX_HOME` reports `Not logged in`, as expected before first personal-account login.
- Actual `dev stock` launch reached the Codex `Sign in with ChatGPT` selection screen without the previous Git or executable errors.
- Git helper count stabilized at two intentional entries and no longer grows across launches.
- Correction, installation and actual terminal verification: about 20 minutes.

## 2026-08-24 KST - STOCK Child-Process Account Isolation Correction

### User Report
- A Codex session opened for the STOCK project still reported the global Git identity as `zezariGit <general@zezari.com>` and the Vercel CLI account as `zezarigit`.
- Asked whether the ZEZARI environment was still leaking into STOCK.

### Findings
- STOCK repository-local Git identity and all recent commit authors were already `soonsuboy <soonsuboy10@gmail.com>`; only the PC-global diagnostic still showed ZEZARI.
- STOCK Codex used the isolated `CODEX_HOME` and was signed in with `soonsuboy10@gmail.com`.
- STOCK GitHub CLI and Vercel isolated stores had not completed their one-time logins.
- A parent-shell PowerShell `vercel` function is not inherited by the subprocesses that Codex opens, so direct child `npx vercel` commands could see the PC default Vercel login.
- Missing `ADMIN_EMAILS` is an application authorization setting, not evidence of development-account leakage.

### Correction
- Added one Git global config file per isolated account and injected it through `GIT_CONFIG_GLOBAL`.
- Propagated only the isolated Vercel token to child Codex processes through `VERCEL_TOKEN`.
- Added a login-required protection value so an unconnected profile cannot fall back to another Vercel account.
- Added visible Git/Vercel connection state to the launch banner.
- Added project metadata synchronization before launch and status checks.

### Verification
- STOCK global and effective Git name/email both resolve to `soonsuboy <soonsuboy10@gmail.com>`.
- STOCK Codex login is active in its isolated home.
- STOCK GitHub and Vercel report login required and do not reuse ZEZARI credentials.
- PowerShell parser and automated profile-switcher regression tests passed.
- Analysis, correction, installation and verification: about 25 minutes.

## 2026-08-24 KST - ZEZARI Development Account Login Verification

### User Requirement
- Confirm that the active development environment is logged in with the ZEZARI accounts rather than the STOCK accounts.

### Verification And Action
- Confirmed workspace `C:\REAL_QR_FIND` and Git remote `https://github.com/zezariGit/zezariGit.git`.
- Confirmed global/effective Git author `zezariGit <general@zezari.com>`.
- Reconnected GitHub CLI through device authorization and verified the authenticated user `zezariGit`.
- Confirmed Vercel CLI user `zezarigit`, Codex ChatGPT login `soonsuboy10@gmail.com`, and Turso environment metadata.
- Confirmed GitHub remote HEAD access succeeds.
- Login verification and GitHub CLI reconnection: about 5 minutes.

## 2026-08-24 KST - Subject Registration Header Simplification

### User Requirement
- Remove the existing dashboard, management, panel heading, helper text, and new-item badge from the new subject registration view.
- Replace them with one clear title and two-line explanation based on the supplied reference layout.

### Implementation
- New registration now displays `대상자 정보 등록` as the single page title.
- Added the requested explanation about registering a protected subject and using the information after a QR scan.
- Removed the duplicated `대상자 등록` headings, `신규` badge, and legacy management description from the registration flow.
- Kept the edit flow distinct with `대상자 정보 수정` and its existing edit-only guidance.

### Verification
- `npm run build` passed.
- Implementation and verification: about 10 minutes.
