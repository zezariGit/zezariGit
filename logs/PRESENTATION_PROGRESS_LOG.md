# Presentation Progress Log

Project: REAL_QR_FIND

This file is the cumulative presentation-ready project log. It is written so the user can use it to prepare status reports or presentation material.

## 2026-06-12 - Project Start and Documentation System Setup

### Request
- Start the real QR people-finding project.
- Codex should act as a full-stack developer.
- Keep two cumulative logs:
  - A technical handoff log for developers and AI agents.
  - A presentation log for the user.
- Produce official implementation deliverables by development phase.
- Accumulate image-generation prompts for diagrams or visuals when needed.

### Reflected Content
- Created the project rules document.
- Created the technical handoff log.
- Created the presentation progress log.
- Created the official deliverables folder.
- Created the image prompt archive.

### Time Spent
- Initial setup: approximately 5 minutes.

### Output
- `00_PROJECT_RULES.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### Presentation Note
- The project now has a repeatable documentation system.
- Future requirements, implementation results, elapsed time, and outputs will be accumulated in these files.

## 2026-06-12 - VSCode/GitHub Account Check

### Request
- Check whether VSCode is configured with the GitHub account `zezari`.

### Reflected Content
- Checked global Git user settings.
- Checked whether the current project folder is a Git repository.
- Checked GitHub CLI login status.
- Checked VSCode user settings.

### Result
- The current project folder is not yet a Git repository.
- Global Git is currently set to:
  - Name: `soonsuboy`
  - Email: `soonsuboy10@gmail.com`
- GitHub CLI is not installed or not available from the terminal.
- VSCode settings did not show a visible GitHub account configuration.

### Time Spent
- Account check and log update: approximately 5 minutes.

### Output
- Updated `logs/DEV_HANDOFF_LOG.md`.
- Updated `logs/PRESENTATION_PROGRESS_LOG.md`.

### Presentation Note
- The current command-line Git identity is not `zezari`.
- Additional VSCode sign-in confirmation may be needed from the VSCode Accounts UI.

## 2026-06-12 - VSCode Profile Screenshot Clarification

### Request
- User showed a VSCode profile screenshot and asked whether it means the profile is set to `zezari`.

### Reflected Content
- Reviewed the screenshot context.
- Clarified the difference between VSCode GitHub profile login and terminal Git commit identity.

### Result
- The VSCode profile menu appears to show `zezariGit (GitHub)`.
- This means VSCode/Codex extension login appears to be using the `zezariGit` GitHub profile.
- However, terminal Git commit identity is still set to:
  - Name: `soonsuboy`
  - Email: `soonsuboy10@gmail.com`

### Time Spent
- Screenshot review and log update: approximately 3 minutes.

### Presentation Note
- VSCode login and Git commit author settings are separate.
- The project should set local Git identity before the first commit if commits must be associated with `zezari`.

## 2026-06-12 - Git Author Email Updated

### Request
- User provided the connected email `general@zezari.com` and asked to enter it directly in PowerShell.

### Reflected Content
- Updated global Git author name and email.

### Result
- Git global name is now `zezariGit`.
- Git global email is now `general@zezari.com`.

### Time Spent
- Git configuration update and verification: approximately 2 minutes.

### Presentation Note
- Future Git commits will use the `zezariGit / general@zezari.com` identity by default unless a project-specific Git setting overrides it.

## 2026-06-12 - GitHub Repository Connection

### Request
- User provided the repository URL `https://github.com/zezariGit/zezariGit.git`.
- User asked to apply the Git initialization and GitHub push script.

### Reflected Content
- Initialized the project folder as a Git repository.
- Created the first Git commit.
- Connected the project to the GitHub repository.
- Resolved an account mismatch in Windows Git credentials.
- Pushed the project to GitHub.

### Result
- The local project is now connected to GitHub.
- Branch `main` is tracking `origin/main`.
- The first project commit is available on the remote repository.

### Time Spent
- Repository initialization, authentication fix, push, and verification: approximately 15 minutes.

### Output
- GitHub remote:
  - `https://github.com/zezariGit/zezariGit.git`
- Initial commit:
  - `90dc4c7`
  - `Initial project setup`

### Presentation Note
- A Windows credential entry was still using the old `soonsuboy` account, which initially blocked the push.
- After updating Git Credential Manager to `zezariGit`, the project was successfully pushed to GitHub.

## 2026-06-12 - Vercel and Turso Connection Setup

### Request
- User said Vercel and Turso signup is complete and asked to connect them.

### Reflected Content
- Installed and logged in to Vercel CLI.
- Linked the local project folder to Vercel.
- Connected the GitHub repository to the Vercel project.
- Checked Turso CLI availability and Windows setup requirements.
- Prepared environment variable structure for Turso.

### Result
- Vercel connection is complete.
- Vercel account: `zezarigit`
- Vercel project: `real-qr-find`
- GitHub repository connected to Vercel: `zezariGit/zezariGit`
- Turso connection is pending because official Windows setup requires WSL and WSL is not currently installed.

### Time Spent
- Vercel installation, login, project link, Turso check, and documentation: approximately 20 minutes.

### Output
- `.gitignore`
- `.env.example`
- `deliverables/INTEGRATION_SETUP.md`
- Updated `deliverables/README.md`
- Updated project logs

### Presentation Note
- Hosting integration is ready through Vercel.
- Database integration path is prepared, but Turso requires either WSL setup or database credentials from the Turso dashboard.

## 2026-06-12 - Turso Environment Variable Setup

### Request
- User saved the Turso database URL and key in `env.txt`.
- User asked Codex to configure the environment variables.

### Reflected Content
- Read the Turso values from `env.txt`.
- Created local `.env.local`.
- Added the Turso variables to Vercel.
- Protected `env.txt` from Git commits by adding it to `.gitignore`.

### Result
- Local development has Turso environment variables configured.
- Vercel Production has Turso environment variables configured.
- Vercel Development has Turso environment variables configured.
- Vercel Preview is pending because Vercel requires a non-production preview branch or dashboard configuration.

### Time Spent
- Environment parsing, local setup, Vercel setup, verification, and documentation: approximately 10 minutes.

### Output
- Updated `.gitignore`.
- Updated `deliverables/INTEGRATION_SETUP.md`.
- Updated project logs.

### Presentation Note
- The database is now ready for local and production/development Vercel use.
- Secret values were intentionally excluded from Git and logs.

## 2026-06-12 - First Test Page

### Request
- Confirm whether GitHub, Vercel, and DB setup are complete.
- Create a simple page that prints `hellow zezari`.

### Reflected Content
- Confirmed GitHub connection.
- Confirmed Vercel connection.
- Confirmed Turso local, Production, and Development environment variable setup.
- Created a simple static web page.

### Result
- Added `public/index.html`.
- The page displays `hellow zezari`.
- Vercel build completed successfully.

### Time Spent
- Status check, page creation, build verification, and documentation: approximately 8 minutes.

### Output
- `public/index.html`
- Updated project logs.

### Presentation Note
- This is the first visible deployed screen for the project.
- It confirms that the project can move from local source code to Vercel deployment.

## 2026-06-12 - Public URL Renamed

### Request
- Change the public URL wording from `real-qr-find` to `zezari`.
- Confirm whether `zezari.com` can be used later.

### Reflected Content
- Renamed the Vercel project to `zezari`.
- Added the public alias `https://zezari.vercel.app`.
- Disabled Vercel deployment protection so the new URL opens publicly.
- Confirmed the page opens and displays `hellow zezari`.

### Result
- Current public URL:
  - `https://zezari.vercel.app`
- Previous URL still exists as an alias:
  - `https://real-qr-find.vercel.app`

### Time Spent
- Vercel project rename, alias setup, protection check, verification, and documentation: approximately 8 minutes.

### Future Domain Note
- `zezari.com` can be connected later if the domain is owned or controlled.
- It will require Vercel domain registration plus DNS setup at the domain provider.

## 2026-06-12 - Google Login Preparation

### Request
- Start the first feature: Google signup/login.
- Tell the user what information is needed from Google Cloud Console.
- User will write the needed values in `env.txt`.

### Reflected Content
- Defined the Google OAuth setup requirements.
- Created an authentication setup deliverable.
- Prepared the required redirect URLs for current Vercel URL and future custom domain.

### Required from Google Cloud
- Google OAuth Client ID.
- Google OAuth Client Secret.

### Required Console Settings
- App type: Web application.
- Production origin:
  - `https://zezari.vercel.app`
- Production redirect URI:
  - `https://zezari.vercel.app/api/auth/callback/google`
- Local origin:
  - `http://localhost:3000`
- Local redirect URI:
  - `http://localhost:3000/api/auth/callback/google`

### Time Spent
- OAuth setup review and documentation: approximately 8 minutes.

### Output
- `deliverables/AUTH_SETUP.md`
- Updated `deliverables/README.md`
- Updated project logs.

## 2026-06-12 - Google Login Implemented

### Request
- User completed Google Cloud Console setup and added the values to `env.txt`.
- User asked to create Google signup/login.

### Reflected Content
- Built the project as a Next.js app.
- Added Google login through NextAuth.
- Added a login page with:
  - Google login button
  - Logged-in user name/email display
  - Logout button
- Registered Google and NextAuth environment variables locally and in Vercel.
- Updated Vercel project settings from static/other to Next.js.

### Result
- Google login/signup implementation is now in the app.
- The callback route is:
  - `https://zezari.vercel.app/api/auth/callback/google`
- Local callback route is:
  - `http://localhost:3000/api/auth/callback/google`

### Time Spent
- Implementation, environment setup, build verification, Vercel project setting fix, and documentation: approximately 30 minutes.

### Output
- Next.js app files under `app/`.
- Auth config under `lib/auth.js`.
- Updated `.env.example`.
- Updated `deliverables/AUTH_SETUP.md`.
- Updated project logs.

### Presentation Note
- The first real user-facing feature is now implemented: Google-based signup/login.
- A full OAuth click-through should be tested by the project owner in the browser.

### Completion Update
- GitHub commit:
  - `851ffa1 Implement Google authentication`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Page opens successfully.
  - Google login button appears.
  - Google authentication provider route is active.

## 2026-06-13 - App Install Support and Login UI Update

### Request
- Remove `hellow`.
- Add the Google logo to the Google login button.
- Make the website installable like an app on Chrome desktop and mobile.

### Reflected Content
- Updated the login screen branding to `zezari`.
- Added Google logo to the login button.
- Added web app manifest.
- Added service worker.
- Added app icons for installation.
- Added install prompt support for desktop Chrome and Android.
- Added iPhone home-screen guidance.

### Result
- The site is now prepared as an installable PWA.
- Users can install it from supported browsers and open it from the desktop or phone home screen.

### Time Spent
- UI update, PWA setup, icon generation, build verification, and documentation: approximately 25 minutes.

### Output
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `deliverables/PWA_SETUP.md`
- Updated project logs.

### Completion Update
- GitHub commit:
  - `b5ef241 Add PWA install support`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - `hellow` removed.
  - Google login text remains visible.
  - Manifest is available.
  - Service worker is available.
  - App icons are available.
  - Google login provider remains active.

## 2026-06-13 - Three-Page Service Introduction

### Request
- Add a three-page service introduction before the login screen.
- Make the pages swipe horizontally.
- Add `다시보지 않기` so the user can go directly to login later.

### Reflected Content
- Added an onboarding screen before login.
- Added three service pages:
  - QR 안심 서비스
  - 실종 발생 시 빠른 대응
  - 온라인 실종 공고
- Added swipe support on mobile.
- Added side-by-side phone panels on desktop.
- Added `다시보지 않기` using browser local storage.

### Result
- First-time logged-out users see the service introduction before login.
- Users who click `다시보지 않기` skip directly to the login screen on future visits from the same browser/device.

### Time Spent
- Onboarding UI, responsive layout, skip behavior, build verification, and documentation: approximately 25 minutes.

### Output
- `app/onboarding-gate.js`
- Updated `app/page.js`
- Updated `app/globals.css`
- Updated `public/sw.js`
- `deliverables/ONBOARDING_FLOW.md`

### Completion Update
- GitHub commits:
  - `6cc0bc2 Add onboarding before login`
  - `3f247d2 Render onboarding immediately`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Service introduction appears.
  - Three slide texts appear.
  - `다시보지 않기` appears.
  - `로그인 시작` appears.
  - Google login provider remains active.

## 2026-06-13 - Onboarding Flow Corrected

### Request
- User clarified that the onboarding should not show the capture-like three-phone layout.
- The service introduction should be three separate pages with images.
- Users should move from page 1 to page 2 to page 3, then reach the login page.
- `다시보지 않기` should immediately open the login page.

### Reflected Content
- Changed the onboarding to show one page at a time on both desktop and mobile.
- Removed the side-by-side desktop layout.
- Improved the visual design with one large illustration per page.
- Kept swipe and navigation controls.
- Kept `다시보지 않기` skip behavior.

### Result
- The onboarding now behaves as a true three-page intro before login.

### Time Spent
- Flow correction, CSS redesign, cache version update, and documentation: approximately 18 minutes.

### Completion Update
- GitHub commit:
  - `dfc60fb Correct onboarding to sequential pages`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Service introduction appears.
  - `다시보지 않기` appears.
  - Three slide titles appear.
  - Old side-by-side desktop layout was removed.
  - Google login remains active.

## 2026-06-13 - Guardian and Subject Management

### Request
- Treat logged-in users as guardians.
- Add guardian information entry/edit screen.
- Allow each guardian to register up to 4 target people.
- Allow photo upload per target.
- Save all information in the database.
- Let each guardian view and edit only their own information.

### Reflected Content
- Added Turso database tables for guardians and subjects.
- Added guardian profile form.
- Added target/person forms.
- Added photo upload support.
- Added edit support for saved information.
- Added server-side owner filtering by logged-in Google account.
- Added server-side maximum of 4 target people per guardian.
- Added password hashing so passwords are not stored as plaintext.

### Result
- After Google login, the user now sees a guardian dashboard.
- The guardian can save/update their own information.
- The guardian can add/update/delete their own target people.
- Subject information is stored in Turso.

### Time Spent
- DB schema, dashboard UI, server actions, photo upload, password hashing, build verification, and documentation: approximately 45 minutes.

### Output
- `app/dashboard.js`
- `app/actions.js`
- `lib/db.js`
- `lib/security.js`
- `deliverables/DATABASE_SCHEMA.md`

### Completion Update
- GitHub commit:
  - `38501f0 Add guardian and subject management`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Build succeeded.
  - Database schema was created in Turso.
  - Public page opens.
  - Google login remains active.
  - Logged-in dashboard should be checked after Google login.

## 2026-06-13 - Dashboard Status View

### Request
- After profile input is complete, logged-in guardians should go to a dashboard.
- The dashboard should show the guardian's four managed people.
- Each managed person should show their current status.
- User provided a reference dashboard capture.

### Reflected Content
- Added current status to managed people.
- Added dashboard view before the edit forms for completed guardian profiles.
- Added four management slots.
- Added status badges:
  - `문제없음`
  - `찾는중`
  - `QR활성화필요`
- Added quick action buttons similar to the reference.

### Result
- Completed guardians now land on a status dashboard after login.
- They can still edit guardian/subject information below the dashboard.

### Time Spent
- Dashboard flow update, DB status field, styling, and documentation: approximately 30 minutes.

### Completion Update
- GitHub commit:
  - `5d38213 Refine guardian status dashboard`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Build succeeded.
  - Subject status column exists in Turso.
  - Public page opens.
  - Google login remains active.
  - Latest PWA cache version is active.

## 2026-06-13 - Dashboard and Info Entry Split

### Request
- Separate the information entry screen from the dashboard.
- Style the information entry screen like the dashboard.
- Add a top-level menu with dashboard first, information entry second.

### Reflected Content
- Added top menu:
  - `대시보드`
  - `정보입력`
- Default logged-in screen is now the dashboard.
- Information forms are now only on the `정보입력` screen.
- If profile information is incomplete, the dashboard shows a prompt to move to information entry.

### Result
- Logged-in users now have two distinct screens:
  - Dashboard for status overview.
  - Information entry for profile and target-person edits.

### Time Spent
- Tab routing, screen separation, UI styling, cache update, and documentation: approximately 20 minutes.

### Completion Update
- GitHub commit:
  - `1e7fa08 Separate dashboard and info entry screens`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Build succeeded.
  - Public page opens.
  - Google login remains active.
  - Latest PWA cache version is active.

## 2026-06-13 - Admin Guardian Management

### Request
- Add an admin page.
- Allow admin to activate/deactivate guardians.
- Show guardians in a left-side grid.
- Show selected guardian's four managed people in a right-side grid.

### Reflected Content
- Added `/admin`.
- Added admin-only access based on Google login email.
- Added guardian active/inactive state.
- Added left guardian grid.
- Added right managed-person grid.
- Added activate/deactivate button.
- Inactive guardians now see a disabled-account notice.

### Result
- Admins can manage guardian activation and inspect each guardian's registered managed people.

### Time Spent
- Admin page, DB activation field, access control, UI styling, migration check, and documentation: approximately 35 minutes.

### Output
- `app/admin/page.js`
- `app/admin/actions.js`
- `lib/admin.js`
- `deliverables/ADMIN_SETUP.md`

### Completion Update
- GitHub commit:
  - `e244ebe Add admin guardian management`
- Production URL:
  - `https://zezari.vercel.app/admin`
- Verified:
  - Admin route opens.
  - Logged-out users see admin login gate.
  - Google login remains active.
  - Latest PWA cache version is active.

## 2026-06-14 - Gov Style Applied

### Request
- Apply the style from `css/gov-style.css` to all current pages.
- Make future pages use the same style.

### Reflected Content
- Connected `gov-style.css` globally.
- Updated existing custom UI classes to follow gov-style tokens.
- Applied the light-blue public-sector style to:
  - Login
  - Onboarding
  - Dashboard
  - Information entry
  - Admin page
- Updated PWA theme color.
- Added a style guide deliverable for future pages.

### Result
- The app now has a shared design base for current and future pages.

### Time Spent
- Global CSS integration, style overrides, PWA theme update, build verification, and documentation: approximately 25 minutes.

### Output
- `css/gov-style.css`
- `deliverables/UI_STYLE_GUIDE.md`
- Updated `app/layout.js`
- Updated `app/globals.css`
- Updated PWA metadata

### Completion Update
- GitHub commit:
  - `6259c7d Apply gov style globally`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Build succeeded.
  - Public page opens.
  - Admin page opens.
  - Latest PWA cache version is active.
  - Manifest theme color uses the gov-style blue.

## 2026-06-14 - QR Code Management

### Request
- Create about 30 QR codes and QR-linked unique strings.
- Store them in the database.
- Let admins view and activate/deactivate QR codes.
- Let admins generate more non-duplicated QR codes by desired count.
- Use the unique string as the final URL segment for the people-finding page.

### Reflected Content
- Added a new `qr_codes` database table.
- Seeded 30 initial active QR records.
- Added an admin QR management tab:
  - QR image
  - QR label
  - Unique string
  - Public find URL
  - Active/inactive status
  - Additional QR generation form
- Added the public route:
  - `/find/{unique-string}`
- Added active, inactive, and unknown QR display states.
- Added official QR management deliverable and presentation image prompt.

### Result
- Admins can now manage QR code inventory from the admin page.
- QR codes now point to a stable public people-finding URL pattern.
- The project is ready for the next stage: assigning QR codes to managed people and adding report/contact flow.

### Time Spent
- QR DB design, unique generation, admin UI, public page, seeding, verification, and documentation: approximately 45 minutes.

### Output
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/find/[key]/page.js`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`

### Verification
- Local build succeeded.

### Completion Update
- GitHub commit:
  - `6986c8f Add soonsuboy admin access`
- Production URL:
  - `https://zezari.vercel.app/admin`
- Verified:
  - Admin page opens.
  - Google login provider remains available.

## 2026-06-14 - Admin Role Management

### Request
- Add `관리자 관리` to the admin page.
- Let an admin grant administrator role to registered guardian users.

### Reflected Content
- Added a new admin menu tab:
  - `관리자 관리`
- Added DB admin role field:
  - `guardians.is_admin`
- Admin access now works through either:
  - Environment admin email list.
  - DB admin role granted to a registered guardian.
- The admin management screen lists registered users and lets admins grant or revoke DB admin role.
- Base admins configured by environment are protected from role removal in the UI.

### Result
- 관리자 페이지에서 보호자 사용자에게 관리자 권한을 직접 부여할 수 있게 되었습니다.
- 앞으로 새 운영자가 가입하면 기존 관리자가 화면에서 관리자 역할을 줄 수 있습니다.

### Time Spent
- DB role field, admin authorization, admin UI, migration, verification, and documentation: approximately 35 minutes.

### Output
- `app/admin/page.js`
- `app/admin/actions.js`
- `lib/db.js`
- `lib/admin.js`
- `deliverables/ADMIN_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`

### Verification
- Local build succeeded.
- Turso migration succeeded:
  - Registered users: 4
  - DB admins: 1
- Local `/admin?section=admins` route returned HTTP 200 and showed the login gate while logged out.

### Completion Update
- GitHub commit:
  - `7707d72 Add admin role management`
- Production URL:
  - `https://zezari.vercel.app/admin?section=admins`
- Verified:
  - Production admin-management route opens.
  - Logged-out users see the admin login gate.
  - Google login provider remains available.

## 2026-06-15 - Kakao/Naver Social Login Foundation

### Request
- Add Kakao and Naver login/signup in addition to Google.
- Show matching logo buttons.
- Prepare the base so login works once each platform key is entered.

### Reflected Content
- Added Google/Kakao/Naver provider foundation.
- Added three social login buttons:
  - Google
  - Kakao
  - Naver
- Providers activate automatically when both client ID and client secret are configured.
- Kakao/Naver buttons remain visible but disabled until their keys are entered.
- Updated the login screen and admin login gate from Google-only to social-login wording.
- Added environment variable placeholders and callback URL documentation.

### Result
- The app is ready for Kakao and Naver OAuth credentials.
- Once keys are entered and deployed, users can sign up/login through Kakao or Naver.

### Time Spent
- Provider setup, button UI, environment documentation, build verification, and logs: approximately 30 minutes.

### Output
- `lib/auth.js`
- `app/auth-actions.js`
- `app/page.js`
- `app/admin/page.js`
- `deliverables/AUTH_SETUP.md`

### Verification
- Local build succeeded.
- Current provider API shows Google only because Kakao/Naver credentials are not configured yet.
- Login gate displays Google, Kakao, and Naver buttons.

### Completion Update
- GitHub commit:
  - `f834a3e Add Kakao and Naver login foundation`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Production auth provider API opens.
  - Google provider is active.
  - Kakao/Naver buttons are visible but disabled until credentials are added.
  - PWA cache version updated to `zezari-v10`.

## 2026-06-15 - Toss Payments Subscription Button

### Request
- Start Toss Payments integration for subscription payment and future advertisement payment.
- First, add a subscription payment button next to `현재 상태` on the dashboard.
- After payment completes, show `구독중`.

### Reflected Content
- Added Toss Payments subscription payment foundation.
- Added `구독결제하기` button next to the dashboard `현재 상태` title.
- Added `구독중` status badge after successful subscription payment.
- Added server-side Toss API flow:
  - Billing key issue.
  - First subscription billing approval.
  - DB status update to active.
- Added success/fail redirect pages.
- Added subscription database table.
- Added Toss Payments setup deliverable.

### Result
- The dashboard now has the subscription payment entry point.
- The backend is ready to store subscription state and mark a guardian as subscribed after server-side Toss payment success.
- Toss keys still need to be visible in environment variables before the real test payment window can be opened.

### Time Spent
- Toss docs review, DB schema, button UI, API routes, callback pages, migration, verification, and documentation: approximately 50 minutes.

### Output
- `app/toss-subscription-button.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/payments/toss/subscription/success/page.js`
- `app/payments/toss/subscription/fail/page.js`
- `lib/toss-payments.js`
- `deliverables/TOSS_PAYMENTS_SETUP.md`

### Verification
- Local build succeeded.
- Turso `subscriptions` table was created.
- Prepare API requires login.
- Fail redirect page opens.
- Toss payment window was not tested because Toss keys were not detected in the saved environment.

### Completion Update
- GitHub commit:
  - `a550f63 Add Toss subscription payment foundation`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Subscription prepare API is deployed and requires login.
  - Toss fail page opens.
  - PWA cache version updated to `zezari-v11`.

## 2026-06-15 - Toss Test Keys Reflected

### Request
- In `env.txt`, under `// tosspayments`, use the first value as the Toss client key and the second value as the Toss secret key.
- Reflect those test keys so they can be changed later.

### Reflected Content
- Applied the first Toss value as `TOSS_CLIENT_KEY`.
- Applied the second Toss value as `TOSS_SECRET_KEY`.
- Updated local `.env.local`.
- Added both keys to Vercel Production and Development as encrypted environment variables.
- Redeployed production.

### Result
- The deployed app now has Toss Payments test keys configured.
- The subscription payment button can proceed to the Toss flow for logged-in users.
- Future key changes only require replacing environment variable values.

### Time Spent
- Environment reflection, Vercel setup, redeployment, and verification: approximately 15 minutes.

### Verification
- Local build succeeded.
- Production prepare API remains protected and returns login-required while logged out.

## 2026-06-15 - Subscription Options And Pause Resume

### Request
- Users should be able to pause/resume after subscribing.
- Subscription service should support:
  - 1 month
  - 3 months
  - 6 months
- Admin should be able to configure prices for each option in the admin page.

### Reflected Content
- Added 1/3/6-month subscription options.
- Added administrator price management:
  - `/admin?section=payments`
  - `결제 관리`
- Added user dashboard controls:
  - Plan selector before payment.
  - `구독결제하기`.
  - `구독중`.
  - `일시정지`.
  - `일시정지중`.
  - `재개`.
- Added DB support for subscription plan prices and subscription periods.
- Updated Toss payment preparation so price is loaded from the server-side database.

### Result
- Subscription pricing can now be changed from the admin page.
- Users can control app-level subscription pause/resume from the dashboard.
- The app is ready to test payment for 1/3/6-month options.

### Time Spent
- Plan pricing schema, admin UI, dashboard controls, Toss prepare update, migration, verification, and docs: approximately 45 minutes.

### Output
- `subscription_plans` DB table.
- `app/api/subscription/status/route.js`
- Updated dashboard subscription component.
- Updated admin payment-management screen.

### Verification
- Local build succeeded.
- Turso migration succeeded:
  - 1 existing subscription.
  - 3 subscription plans seeded.
- Local unauthenticated APIs return login-required.
- Local admin payment route opens and shows login gate while logged out.

### Completion Update
- GitHub commit:
  - `7e595ed Add subscription plans and pause resume`
- Production URL:
  - `https://zezari.vercel.app`
- Verified:
  - Subscription status API is deployed and requires login.
  - Subscription prepare API is deployed and requires login.
  - Admin payment route opens and requires admin login.
  - PWA cache version updated to `zezari-v12`.
- Turso seed result:
  - 30 total QR records
  - 30 active QR records
- Local public QR URL returned HTTP 200 and displayed the active QR confirmation.
- Admin QR URL returned HTTP 200 and showed the login gate while logged out.

### Completion Update
- GitHub commit:
  - `b3a15d3 Add QR code management`
- Production URL:
  - `https://zezari.vercel.app`
- Verified in production:
  - Main page opens.
  - Admin QR tab URL opens and shows the admin login gate when logged out.
  - A sample active QR finding URL opens.
  - PWA cache version was updated to `zezari-v9`.

## 2026-06-14 - Additional Admin Email

### Request
- Give admin access to:
  - `soonsuboy10@gmail.com`

### Reflected Content
- Added `soonsuboy10@gmail.com` to the default admin email list.
- Added Vercel `ADMIN_EMAILS` for Production and Development with both admin emails.
- Updated environment example documentation.

### Result
- Users logged in with `soonsuboy10@gmail.com` can access the admin page after the new production deployment.

### Time Spent
- Admin setting update, environment configuration, build verification, and documentation: approximately 10 minutes.

### Verification
- Local build succeeded.
## 2026-06-15 - 저장/조회 피드백 전역 적용

### 요구내용
- 저장하거나 조회할 때 완료된 느낌이 없다.
- 하단에 `저장되었습니다`, `수정되었습니다`, `필수값을 입력해주세요` 같은 메시지가 필요하다.
- 조회할 때 프로그래스바가 필요하다.
- 전체 화면에 적용한다.

### 반영내용
- 공통 제출 버튼 컴포넌트 추가.
- 버튼 클릭 후 처리 중에는 버튼 내부에 진행바 표시.
- 저장/수정/삭제/매칭/상태변경 완료 후 하단 토스트 메시지 표시.
- 서버 처리 실패 시 에러형 하단 토스트 표시.
- 사용자 화면과 관리자 화면 모두 토스트 표시 연결.
- QR 필터와 QR 매칭대상 조회 같은 조회 폼에도 진행바 적용.

### 산출물
- `app/form-submit-button.js`
- `app/status-toast.js`
- `deliverables/QR_MANAGEMENT.md`

### 검증
- 로컬 빌드 성공.

### 반영 시간
- 공통 컴포넌트, 서버 액션 리다이렉트, 버튼 교체, 스타일/문서 반영: 약 30분.

## 2026-06-15 - QR 매칭 모달 UX 정리

### 요구내용
- QR 카드 안의 보호자 조회/관리대상 조회 텍스트와 정렬이 지저분하다.
- 미매칭 QR에는 `매칭대상 조회` 버튼만 보여준다.
- 버튼 클릭 시 팝업을 띄워 미매칭 관리대상을 검색/선택한다.
- 팝업이 떠 있는 동안 메인 화면은 선택되지 않게 비활성화한다.
- 여러 팝업이 동시에 열려 헷갈리지 않게 한다.
- 매칭된 QR에는 `매칭대상 조회`를 숨기고 `매칭 해제`만 보여준다.
- 텍스트가 삐져나오는 부분은 인식되는 대로 개선한다.

### 반영내용
- QR 카드 내부 검색 폼 제거.
- 미매칭 QR 카드에 `매칭대상 조회` 버튼 추가.
- `assignQr` 기준 단일 모달 팝업으로 매칭 대상 검색 흐름 변경.
- 모달 배경 오버레이로 메인 화면 비활성화 효과 적용.
- 모달 안에서 보호자/관리대상 검색 후 미매칭 대상만 선택 가능.
- 매칭된 QR은 `매칭 해제`만 노출.
- QR 카드 그리드 폭, 버튼 정렬, 텍스트 줄바꿈/넘침 방지 CSS 개선.

### 검증
- 로컬 빌드 성공.

### 반영 시간
- UX 변경, 스타일 보정, 문서/로그 반영: 약 25분.

## 2026-06-15 - QR 매칭 검색 및 보호자 QR 확인 개선

### 요구내용
- QR 관리에서 관리대상 매칭 시 selectbox 대신 조회 버튼 방식으로 개선한다.
- 보호자 이름/관리대상 이름으로 조회해서 선택할 수 있게 한다.
- 이미 매칭된 관리대상은 조회되지 않아야 한다.
- 매칭 해제해야만 다시 조회될 수 있어야 한다.
- QR 관리에서 QR 이미지를 누르면 다운로드되게 한다.
- 매칭된 QR 코드를 보호자 사용자 화면에서도 확인할 수 있게 한다.

### 반영내용
- QR 카드별 `대상 조회` 검색 폼 추가.
- 검색 조건:
  - 보호자 이름/이메일
  - 관리대상 이름
- 검색 결과는 미매칭 관리대상만 표시.
- 검색 결과마다 `선택 매칭` 버튼 제공.
- QR 이미지를 클릭하면 `{QR코드}.png`로 다운로드되게 개선.
- 보호자 정보입력 화면의 관리대상 카드에 배정 QR 이미지, QR 코드, 활성 상태, 찾기 URL 표시.
- 보호자 대시보드 목록에도 QR 코드명을 표시.

### 산출물
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### 검증
- 로컬 빌드 성공.
- Turso 미매칭 대상 조회 성공.
- 현재 관리대상 2명은 모두 QR 매칭 상태라 미매칭 조회 결과는 0건.
- 보호자 관리대상 QR 조인 조회 성공:
  - QR 코드/공개키가 포함된 관리대상 2건 확인.

### 반영 시간
- 구현, 빌드, DB 검증, 문서/로그 반영: 약 35분.

## 2026-06-15 - QR 필터 및 수동 매칭 기능 추가

### 요구내용
- QR 관리에서 관리대상과 매칭된 QR을 필터링해서 볼 수 있게 한다.
- 활성/비활성 QR도 필터링할 수 있게 한다.
- 관리자가 수동으로 QR 매칭, 변경, 해제를 할 수 있게 한다.

### 반영내용
- QR 관리 상단에 필터 추가:
  - 매칭상태: 전체 / 관리대상 매칭됨 / 관리대상 미매칭
  - 활성상태: 전체 / 활성 / 비활성
- QR 통계 표시 확장:
  - 활성
  - 비활성
  - 매칭
  - 미매칭
- 각 QR 카드에 관리대상 선택 박스 추가.
- 각 QR 카드에 `매칭 저장` 또는 `매칭 변경` 버튼 추가.
- 이미 매칭된 QR에는 `매칭 해제` 버튼 추가.
- 관리대상을 다른 QR에 매칭하면 이전 QR 배정은 자동 해제되도록 처리.

### 산출물
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### 검증
- 로컬 빌드 성공.
- Turso 기준 QR 통계 조회 성공:
  - 전체 30개
  - 활성 30개
  - 비활성 0개
  - 매칭 2개
  - 미매칭 28개
  - 관리대상 선택 옵션 2개
- GitHub 반영:
  - `23381c1 Add QR admin filters and manual matching`
- 운영 배포 완료:
  - `https://zezari.vercel.app`
- 운영 경로 확인:
  - `/admin?section=qr&match=matched&active=active` 정상 응답.
  - 서버 오류 문구 없음.

### 반영 시간
- 구현, DB 조회 검증, 문서/로그 반영: 약 25분.

## 2026-06-15 - QR 관리 페이지 서버 오류 수정

### 요구내용
- QR 관리 페이지로 들어가면 `This page couldn't load` 서버 오류가 발생한다.

### 원인
- QR 관리 목록 조회 SQL에서 `created_at` 컬럼명을 테이블명 없이 사용했다.
- QR, 보호자, 관리대상 테이블이 모두 `created_at`을 가지고 있어 DB가 어떤 컬럼인지 판단하지 못했다.

### 반영내용
- QR 관리 목록 정렬 기준을 `q.created_at`, `q.code`로 명확히 지정했다.

### 검증
- 오류 SQL 재현 확인.
- 수정 SQL 실행 성공:
  - QR 30건 조회 성공.
- 로컬 빌드 성공.
- GitHub 반영:
  - `826b239 Fix QR admin query ordering`
- 운영 배포 완료:
  - `https://zezari.vercel.app`
- 운영 경로 확인:
  - `/` 정상 응답.
  - `/admin?section=qr` 비로그인 상태에서 관리자 로그인 화면 정상 응답.

### 반영 시간
- 원인 확인, 수정, 검증, 로그 기록: 약 10분.

## 2026-06-15 - QR/푸시 기능 운영 배포 완료

### 배포 결과
- GitHub 커밋:
  - `d263b87 Add subject QR matching and guardian push alerts`
- 운영 배포 URL:
  - `https://zezari.vercel.app`

### 운영 확인
- 공개 QR 페이지 접속 성공.
- `보호자에게 알리기` 버튼 표시 확인.
- 보호자 정보 영역 표시 확인.
- 푸시 공개키 API 설정 완료 확인.
- 알림 API 정상 응답 확인.
- 서비스워커 `zezari-v13` 및 푸시 핸들러 반영 확인.

### 참고
- 현재 푸시 전송 수는 0건이다.
- 이유: 보호자가 실제 기기/브라우저에서 `푸시 알림 켜기`를 아직 누르지 않았기 때문이다.

## 2026-06-15 - QR별 관리대상 매칭 및 보호자 푸시 알림

### 요구내용
- QR을 찍으면 연결되는 페이지에 보호자가 등록한 관리대상 정보가 나오게 한다.
- 관리대상별로 QR 코드를 매칭한다.
- 보호자 1명당 관리대상 최대 4명이므로 보호자당 최대 4개 QR이 배정될 수 있다.
- QR 접근 페이지에서 관리대상 정보와 보호자 연락처, 주소 등 기본정보를 보여준다.
- `보호자에게 알리기` 버튼을 눌러 로그인되어 있는 보호자에게 `{관리대상 이름}을 찾았습니다` 푸시 메시지를 보낸다.

### 반영내용
- 관리대상 저장 시 자동으로 미배정 QR 1개를 배정하도록 구현.
- 기존 관리대상 1명에게 기존 QR 1개를 마이그레이션으로 배정.
- 공개 QR 페이지를 실제 대상자/보호자 정보 표시 화면으로 확장.
- 공개 QR 페이지에 `보호자에게 알리기` 버튼 추가.
- 보호자 대시보드에 `푸시 알림 켜기` 버튼 추가.
- 브라우저 Web Push 구독 정보를 DB에 저장하는 API 추가.
- QR 알림 API가 보호자의 등록된 기기로 푸시 알림을 보내도록 구현.
- 관리자 QR 화면에서 각 QR의 배정 보호자/관리대상을 확인할 수 있게 개선.
- Vercel 운영/개발 환경에 VAPID 푸시 키 등록 완료.

### 산출물
- `deliverables/PUSH_NOTIFICATION_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### 검증
- 로컬 빌드 성공.
- 공개 QR 찾기 페이지 HTTP 200 확인.
- `보호자에게 알리기` 버튼 표시 확인.
- 푸시 공개키 API 설정 완료 확인.
- 알림 API는 정상 응답했으며, 현재 등록된 보호자 푸시 기기가 없어 전송 수는 0건.

### 반영 시간
- 설계, 구현, DB 마이그레이션, 환경변수 등록, 검증, 문서화: 약 45분.

## 2026-06-15 - 관리대상별 광고 기능 기반 구현

### 요구내용
- 대시보드의 관리대상별로 `광고` 버튼을 추가한다.
- 버튼 클릭 시 팝업을 띄우고, 팝업이 열려있는 동안 메인 화면은 비활성화한다.
- 팝업에서 광고기간과 광고지역을 사용자가 설정한다.
- 지정한 기간과 관리자 설정 일 단가에 따라 광고 금액을 산정한다.
- 광고중 상태에서는 `일시정지`, `광고끝내기` 기능을 제공한다.
- 관리자페이지에 광고탭을 추가한다.
- 관리자 광고탭에서 일자별 광고단가를 설정한다.
- 관리자 광고탭에서 사용자별 광고 진행사항을 그리드로 조회한다.
- Meta API는 추후 정보 수령 후 연동한다.

### 반영내용
- `ad_settings` 테이블 추가:
  - 광고 일 단가 관리.
  - 기본값 10,000원.
- `subject_ads` 테이블 추가:
  - 관리대상별 광고지역, 광고기간, 일수, 일 단가, 총액, 상태 저장.
  - Meta API 연동용 `meta_campaign_id`, `meta_status` 예약 필드 추가.
- 사용자 대시보드 개선:
  - 각 관리대상 카드에 `광고` 버튼 추가.
  - 광고 신청/관리 모달 추가.
  - 모달에서 기간 변경 시 예상 금액 즉시 계산.
  - 광고중/일시정지 상태에 따라 일시정지, 재개, 종료 버튼 표시.
- 관리자페이지 개선:
  - `광고 관리` 탭 추가.
  - 광고 일 단가 저장 폼 추가.
  - 사용자별 광고 진행사항 그리드 추가.
- 기존 저장/조회 피드백 패턴 유지:
  - 버튼 진행 상태.
  - 하단 완료/오류 메시지.

### 산출물
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`

### 검증
- 로컬 빌드 성공.
- Turso 광고 테이블 생성 확인.
- 기본 광고 일 단가 10,000원 확인.
- 현재 광고 진행 데이터 0건 확인.
- 운영 배포 완료:
  - `https://zezari.vercel.app`
- 운영 경로 확인:
  - `/` 정상 응답.
  - `/admin?section=ads` 정상 응답.

### 반영 시간
- 설계, 구현, DB 확인, 문서/로그 반영: 약 35분.

## 2026-06-16 - 팝업 공통 닫기 버튼 및 배경 스크롤 잠금 개선

### 요구내용
- 모든 팝업의 닫기 버튼을 아래쪽에 구현한다.
- 광고 팝업이 떠 있을 때 휴대폰 터치로 뒤쪽 메인화면이 스크롤되지 않게 한다.
- 팝업이 떠 있을 때 뒤쪽 메인화면 버튼도 눌리지 않게 한다.
- 현재 팝업뿐 아니라 향후 만들어질 팝업에도 공통적으로 적용한다.

### 반영내용
- 공통 팝업 스크롤 잠금 컴포넌트 `ModalScrollLock` 추가.
- 팝업이 열리면 현재 스크롤 위치를 유지한 채 body를 고정하도록 구현.
- 팝업 표면 밖의 모바일 `touchmove` 이벤트를 차단하도록 구현.
- 공통 팝업 CSS 클래스 추가:
  - `.modal-backdrop`
  - `.modal-surface`
  - `.modal-footer`
  - `.modal-close-button`
- 광고 팝업 닫기 버튼을 하단으로 이동.
- QR 매칭 팝업 닫기 버튼을 하단으로 이동.
- 향후 팝업 구현 규칙을 `deliverables/UI_STYLE_GUIDE.md`에 기록.

### 산출물
- `deliverables/UI_STYLE_GUIDE.md`

### 검증
- 로컬 빌드 성공.
- `/` HTTP 200 확인.
- `/admin?section=qr&assignQr=test` HTTP 200 확인.
- 운영 배포 완료:
  - `https://zezari.vercel.app`
- 운영 경로 확인:
  - `/` 정상 응답.
  - `/admin?section=qr&assignQr=test` 정상 응답.

### 반영 시간
- 구현, 검증, 문서/로그 반영: 약 20분.

## 2026-06-16 - 모바일 대시보드 관리대상 카드 정렬 개선

### 요구내용
- 모바일 대시보드에서 관리대상 카드가 비대칭으로 보인다.
- 카드 내 요소를 대칭이 맞게 정렬한다.

### 반영내용
- 모바일 전용 카드 레이아웃을 조정했다.
- 카드 상단은 사진과 관리대상 정보를 2열로 배치했다.
- 카드 하단은 상태 배지와 광고 버튼을 같은 폭의 2열로 배치했다.
- 모바일 카드 padding, gap, 사진 크기를 조정해 카드별 정렬 기준을 통일했다.
- 빈 슬롯 카드의 상태 배지도 전체 폭 기준으로 정렬되도록 보정했다.

### 산출물
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.
- `/` HTTP 200 확인.
- 운영 배포 완료:
  - `https://zezari.vercel.app`
- 운영 경로 확인:
  - `/` 정상 응답.

### 반영 시간
- 구현, 검증, 로그 반영: 약 15분.

## 2026-06-16 - 사용자 통합 설명서 생성

### 요구내용
- 지금까지 관리된 요청사항과 반영내역 관리 파일, 전체 소스, 결과물을 기준으로 사용자 설명서를 만든다.
- 화면, 버튼 기능, 조회 데이터 설명을 포함한다.
- 보호자 사용자와 관리자 사용자가 모두 이해할 수 있는 통합 설명서로 만든다.
- Google Docs 문서로 만든다.

### 반영내용
- Google Docs 문서 `REAL_QR_FIND 사용자 통합 설명서`를 생성했다.
- 설명서에 다음 내용을 정리했다.
  - 서비스 개요와 사용 환경.
  - Google/Kakao/Naver 로그인 구조.
  - 앱 설치와 온보딩 흐름.
  - 보호자 대시보드와 정보입력 화면.
  - 관리대상 등록/수정/삭제, 사진 업로드, 상태 표시.
  - 구독 결제, 일시정지, 재개.
  - 광고 신청/관리 기반 기능.
  - QR 찾기 공개 페이지와 보호자 알림.
  - 관리자 보호자 관리, QR 관리, 관리자 관리, 결제 관리, 광고 관리.
  - 저장/조회 진행 표시와 하단 완료/오류 메시지.
  - 주요 데이터 항목 설명.
- 로컬 산출물 `deliverables/USER_MANUAL.md`를 추가해 Google Docs 링크와 유지관리 기준을 남겼다.
- 민감한 환경변수와 키 값은 문서에 포함하지 않았다.

### 산출물
- Google Docs:
  - https://docs.google.com/document/d/1DdcqFv79lcAj4eCuiXaOTsJmpTKWtvBRErWJsoAidEM
- `deliverables/USER_MANUAL.md`
- `deliverables/README.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- Google Docs 커넥터로 문서를 다시 읽어 제목, 본문, 주요 장 제목 스타일 적용을 확인했다.
- 현재 구현된 화면과 버튼 기준으로 설명서를 구성했다.
- 미구현 또는 설정 필요 항목은 준비/설정 필요 상태로 구분했다.

### 반영 시간
- 소스/로그 검토, 설명서 작성, Google Docs 생성, 검증, 산출물/로그 반영: 약 35분.

## 2026-06-16 - 사용자 설명서 실제 화면 스크린샷 추가

### 요구내용
- 사용자 설명서에 화면, 버튼, 주요 기능별 실제 화면 스크린샷을 넣는다.

### 반영내용
- 로컬 앱을 실행해 실제 화면을 캡처했다.
- Google Docs 설명서에 `21. 실제 화면 예시` 섹션을 추가했다.
- 다음 화면 이미지를 삽입했다.
  - 온보딩 첫 화면.
  - 소셜 로그인 화면.
  - 관리자 로그인 화면.
  - 미매칭 QR 공개 화면.
  - 매칭 완료 QR 공개 화면 개인정보 가림본.
- 매칭 완료 QR 화면은 보호자 연락처와 관리대상 정보가 노출될 수 있어 민감 영역을 가린 이미지로 삽입했다.
- 원본 및 삽입용 스크린샷 파일은 `deliverables/user_manual_screenshots/`에 저장했다.

### 산출물
- Google Docs:
  - https://docs.google.com/document/d/1DdcqFv79lcAj4eCuiXaOTsJmpTKWtvBRErWJsoAidEM
- `deliverables/USER_MANUAL.md`
- `deliverables/user_manual_screenshots/`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- Google Docs 커넥터로 문서를 다시 읽어 `21. 실제 화면 예시` 섹션과 이미지 5개가 삽입된 것을 확인했다.
- 캡션 5개가 문서에 표시되는 것을 확인했다.

### 남은 사항
- 보호자 대시보드와 관리자 내부 탭 화면은 실제 로그인 세션이 필요하므로, 로그인된 브라우저 상태에서 추가 캡처가 필요하다.

### 반영 시간
- 캡처, 개인정보 가림, Google Docs 이미지 삽입, 검증, 로그 반영: 약 35분.

## 2026-06-16 - QR 공개 페이지 안심번호 적용

### 요구내용
- QR 페이지에서 보호자의 실제 전화번호가 그대로 노출되지 않게 한다.
- 보호자 전화번호를 안심번호 방식으로 보여주고 싶다.

### 반영내용
- 보호자 테이블에 `safe_phone` 안심번호 컬럼을 추가했다.
- 기존 DB에도 `safe_phone` 컬럼이 자동 추가되도록 스키마 보정 로직을 반영했다.
- 보호자 정보입력 화면에 선택 입력값 `안심번호`를 추가했다.
- QR 공개 페이지에서 실제 전화번호 `phone`을 더 이상 조회하지 않도록 수정했다.
- QR 공개 페이지의 `연락처` 표시를 `안심번호`로 변경했다.
- 안심번호가 아직 없으면 `안심번호 준비중`으로 표시한다.
- Google Docs 사용자 설명서에도 원 전화번호 비공개 및 안심번호 표시 기준을 반영했다.

### 산출물
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/QR_MANAGEMENT.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.
- Turso `guardians.safe_phone` 컬럼 존재 확인.
- 로컬 QR 공개 페이지 정상 응답 확인.
- QR 공개 페이지에서 `안심번호`와 `안심번호 준비중` 표시 확인.
- QR 공개 페이지에서 기존 `연락처` 라벨이 표시되지 않는 것 확인.

### 남은 사항
- 실제 전화 연결이 되는 안심번호는 통신사/ARS/안심번호 사업자 연동이 필요하다.
- 현재 반영은 실제 번호를 공개하지 않는 앱 기반 개인정보 보호 구조다.

### 반영 시간
- 스키마, 화면, QR 공개 페이지, 검증, 문서/로그 반영: 약 30분.

## 2026-06-19 - 로그인/가입 화면 리디자인

### 요구내용
- 3페이지 서비스 소개 이후 첨부 예시와 같은 로그인/가입 화면을 보여준다.
- 아이디, 비밀번호, 자동로그인, 비밀번호 찾기, 로그인 버튼, SNS 아이콘, 회원가입 문구를 구성한다.

### 반영내용
- 메인 로그인 화면을 예시 이미지와 유사한 모바일 중심 레이아웃으로 변경했다.
- 보호자가 저장한 아이디/비밀번호로 로그인할 수 있도록 Credentials 로그인 구조를 추가했다.
- Kakao, Naver, Google은 기존 SNS 로그인 흐름을 아이콘 버튼으로 표시한다.
- Apple 아이콘은 UI 자리만 준비했으며 실제 OAuth 연동은 추후 작업 항목이다.
- 자동로그인은 비밀번호를 저장하지 않고 아이디만 기억하는 방식으로 구현했다.
- 필수값 누락, 로그인 실패, 비밀번호 찾기 준비중, 회원가입 안내 메시지를 화면에서 보여준다.

### 산출물
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

### 검증
- 로컬 빌드 성공.
- 로컬 메인 페이지 정상 응답 확인.
- 모바일 화면 기준 로그인 화면 스크린샷 캡처 완료.

### 반영 시간
- 구현, 빌드 검증, 화면 캡처, 문서/로그 반영: 약 35분.

## 2026-06-19 - 로그인 화면 운영 배포 반영

### 요구내용
- GitHub에 푸시했는지 확인한다.
- 운영 페이지에 새 로그인 화면이 반영되지 않은 원인을 확인한다.

### 반영내용
- 로컬 변경사항이 아직 GitHub/Vercel에 올라가지 않은 상태임을 확인했다.
- 로그인 리디자인 변경사항을 커밋하고 GitHub `main`에 푸시했다.
- Vercel production 배포를 직접 실행했다.
- `zezari.vercel.app` 별칭이 이전 배포를 보고 있어 새 배포로 다시 연결했다.

### 산출물
- GitHub commit:
  - `8c1b307 Redesign login screen`
- Production deployment:
  - `https://zezari-4l8f3rrua-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 검증
- Vercel 운영 빌드 성공.
- `https://zezari.vercel.app`에서 새 로그인 화면 요소 `.login-card` 확인.
- 운영 화면 캡처 성공.

### 반영 시간
- GitHub 푸시, 운영 배포, 별칭 수정, 검증: 약 15분.

## 2026-06-19 - 최초 방문자 회원가입 플로우 추가

### 요구내용
- 회원가입하지 않은 최초 방문자가 첨부 예시와 같은 과정을 거쳐 가입 정보를 입력하게 한다.
- 단계는 휴대폰 인증, 기본정보 입력, 회원가입 완료로 구성한다.
- 구현 후 GitHub에도 자동 푸시한다.

### 반영내용
- 로그인 화면의 `회원가입` 버튼을 누르면 회원가입 화면으로 전환되게 했다.
- `/?signup=1` 주소로도 회원가입 화면을 직접 열 수 있게 했다.
- 휴대폰 인증 화면을 추가했다.
  - 휴대폰 번호 입력.
  - 인증코드 받기.
  - 5자리 인증번호 입력.
  - 남은 시간 표시.
- 기본정보 입력 화면을 추가했다.
  - 이름.
  - 생년월일.
  - 인증된 휴대폰 번호.
  - 아이디.
  - 비밀번호.
  - 개인정보 수집 및 이용 동의.
  - 서비스 이용 약관 동의.
- 회원가입 완료 화면을 추가했다.
  - 대상자 등록하기.
  - 대시보드 바로가기.
- 로그인 전 보호자 계정을 생성하는 API를 추가했다.
- 보호자 DB에 생년월일, 휴대폰 인증 완료 시각, 필수 약관 동의 시각을 저장하도록 확장했다.
- 새 회원가입 화면은 이메일을 받지 않으므로, 대시보드 사용 완료 기준에서 이메일 필수 조건을 제외했다.

### 산출물
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

### 검증
- 로컬 빌드 성공.
- 로컬 회원가입 화면 정상 응답 확인.
- 회원가입 휴대폰 인증 화면 스크린샷 캡처 완료.
- 회원가입 API 필수값 검증 메시지 확인.

### 남은 사항
- 현재 휴대폰 인증은 테스트 모드이며, 실제 문자 발송은 SMS 사업자 연동이 필요하다.

### 반영 시간
- 화면/API/DB/문서/검증 반영: 약 55분.

### 운영 반영
- GitHub commit:
  - `f6dad88 Add direct guardian signup flow`
- Vercel production deployment:
  - `https://zezari-aoit7tb7g-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- `https://zezari.vercel.app/?signup=1`에서 회원가입 화면 확인.
- 회원가입 API 필수값 검증 응답 확인.

## 2026-06-19 - SNS 최초 로그인 회원가입 정보 입력 적용

### 요구내용
- 현재는 `회원가입` 버튼을 눌렀을 때만 가입정보를 입력받는다.
- Kakao, Naver, Google 등 SNS 간편로그인을 눌렀을 때도 최초 가입자라면 가입정보를 입력받게 한다.
- SNS에서 넘어온 이름/이메일 등이 있으면 미리 채운다.
- 이미 가입된 사용자는 대시보드로 바로 이동한다.

### 반영내용
- SNS 로그인 후 보호자 정보가 미완성인 경우 대시보드 대신 회원가입 정보 입력 화면을 먼저 보여주게 했다.
- SNS에서 생성된 보호자 이름과 이메일을 기본정보 입력 화면에 미리 채운다.
- 가입정보가 이미 완성된 보호자는 기존처럼 바로 대시보드로 이동한다.
- 로그인된 SNS 사용자의 가입정보를 저장하는 API를 추가했다.
- 현재 SNS 보호자 레코드에 휴대폰, 생년월일, 아이디, 비밀번호 해시, 약관동의, 휴대폰 인증시각을 저장한다.
- 뒤로가기 버튼은 로그인 화면으로 돌아갈 수 있도록 로그아웃 처리한다.

### 산출물
- `app/dashboard.js`
- `app/social-signup-completion.js`
- `app/api/signup/complete/route.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/AUTH_SETUP.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.
- 빌드 결과에서 `/api/signup/complete` 라우트 생성 확인.

### 남은 사항
- SNS 가입완성 플로우의 휴대폰 인증도 현재는 테스트 모드이며 실제 문자 발송은 SMS 사업자 연동이 필요하다.

### 반영 시간
- 구현, 빌드 검증, 문서/로그 반영: 약 35분.

### 운영 반영
- GitHub commit:
  - `3763156 Require signup completion after SNS login`
- Vercel production deployment:
  - `https://zezari-fyig126f5-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 로그인되지 않은 상태에서 SNS 가입완성 API 호출 시 401 응답 확인.

## 2026-06-19 - 사용자 정보 탭 분리 및 대상자 QR 등록완료 화면

### 요구내용
- 사용자페이지의 정보입력에서 보호자정보와 관리대상정보를 분리한다.
- 탭을 대시보드, 보호자정보, 관리대상정보로 구성한다.
- 관리대상정보 입력 화면을 첨부 화면처럼 구성한다.
- 관리대상별로 보호자가 메모/메시지를 입력할 수 있게 한다.
- 관리대상별로 보호자의 음성을 녹음하고 저장할 수 있게 한다.
- 신규 관리대상 등록 시 DB에 있는 미매칭 QR을 매칭하고 등록완료 페이지를 띄운다.
- 기존 관리대상 수정 시에는 등록완료 페이지를 보여주지 않는다.

### 반영내용
- 사용자 탭을 3개로 분리했다.
  - 대시보드
  - 보호자정보
  - 관리대상정보
- 기존 `tab=info`는 보호자정보 탭으로 호환 처리했다.
- 관리대상 등록/수정 화면을 모바일 폰 카드 형태로 개편했다.
- 관리대상별 보호자 메시지 입력란을 추가했다.
- 관리대상별 보호자 음성녹음 기능을 추가했다.
  - 녹음
  - 정지
  - 재생
  - 새 녹음 삭제
- 신규 관리대상 저장 시 자동 QR 매칭 후 등록완료 화면을 표시한다.
- 기존 관리대상 수정 시에는 관리대상정보 탭으로 돌아가며 완료 화면은 표시하지 않는다.
- QR 공개 페이지에서 보호자 메시지와 음성녹음을 표시/재생하게 했다.
- 대상자 DB에 메시지와 음성 저장 컬럼을 추가했다.

### 산출물
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

### 검증
- 로컬 빌드 성공.
- `/find/[key]` 공개 QR 페이지 라우트 빌드 포함 확인.

### 남은 사항
- 브라우저가 MediaRecorder를 지원하지 않으면 음성녹음이 제한된다.
- 음성 파일은 현재 데이터 URL로 저장하며 서버 저장 제한은 2.5MB다.
- 기존 프로젝트 기준인 보호자당 최대 4명 제한은 유지했다.

### 반영 시간
- 탭 분리, 화면 개편, 음성녹음, QR 등록완료, 공개 QR 표시, 문서/로그 반영: 약 70분.

### 운영 반영
- GitHub commit:
  - `82d5d31 Split user info tabs and add subject QR completion`
- Vercel production deployment:
  - `https://zezari-7wwfatpt5-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 QR 공개 페이지 샘플 경로 정상 응답 확인.

## 2026-06-19 - 대상자 수정 화면 스타일 오류 수정

### 요구내용
- 대상자 수정 화면은 첨부 화면과 같은 폰 스타일일 필요가 없다.
- 현재 이름, 생년월일, 현재상태 값이 제대로 보이지 않고 입력도 어렵다.
- `대상자 수정` 글자 위의 불필요한 노치 디자인을 제거한다.

### 반영내용
- 기존 대상자 수정 카드는 일반 카드 스타일로 변경했다.
- 신규 대상자 등록 카드에만 폰 스타일을 유지했다.
- 대상자 수정 카드의 상단 노치 디자인을 제거했다.
- 입력 필드 글자 크기 상속 문제를 수정해 이름, 생년월일, 현재상태 값이 보이도록 했다.

### 산출물
- `app/dashboard.js`
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.

### 반영 시간
- 원인 확인, 화면/CSS 수정, 빌드 검증, 로그 반영: 약 15분.

## 2026-06-19 - 마이페이지 추가 및 대상자 등록/수정 스타일 통일

### 요구내용
- 대상자 등록 화면도 대상자 수정 화면과 같은 스타일로 맞춘다.
- 로그아웃, 푸시알림켜짐 버튼을 마이페이지로 이동한다.
- 첨부 이미지와 유사한 정보 요약형 마이페이지를 만든다.
- 스타일은 현재 프로젝트 CSS 기준을 따른다.

### 반영내용
- 사용자 탭에 `마이페이지`를 추가했다.
- 헤더에 있던 푸시 알림 버튼과 로그아웃 버튼을 마이페이지로 이동했다.
- 마이페이지에 보호자 정보 요약을 추가했다.
- 마이페이지에 대표 관리대상 정보 요약을 추가했다.
- 마이페이지에 결제/구독 상태, 푸시 알림, 관리자 페이지 바로가기, 고객지원 메뉴, 로그아웃을 구성했다.
- 대시보드의 `내 정보` 바로가기는 마이페이지로 연결했다.
- 대상자 신규 등록 화면도 수정 화면과 같은 일반 카드 스타일로 변경했다.
- 신규 등록 후 QR 등록완료 화면은 기존대로 유지했다.

### 산출물
- `app/page.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.

### 반영 시간
- 탭 추가, 마이페이지 UI 구성, 대상자 폼 스타일 통일, 빌드 검증, 로그 반영: 약 35분.

## 2026-06-19 - 마이페이지 상단 아이콘 분리 및 알림함 추가

### 요구내용
- 마이페이지를 탭에 놓지 않고 화면 오른쪽 위 사람 모양 아이콘으로 배치한다.
- 사람 모양 아이콘에 마우스를 올리면 `마이페이지` 설명이 보이게 한다.
- 화면 왼쪽 위에는 종 모양 아이콘을 배치한다.
- 종 아이콘에서 푸시알림으로 오는 메시지를 확인할 수 있게 한다.

### 반영내용
- 사용자 탭은 `대시보드`, `보호자정보`, `관리대상정보` 3개로 재정리했다.
- 마이페이지는 우측 상단 사람 아이콘 클릭 시 오버레이로 열리게 했다.
- 기존 `?tab=my` 주소는 호환을 위해 대시보드에서 마이페이지 오버레이를 열도록 유지했다.
- 좌측 상단 종 아이콘에 알림 목록, 읽지 않은 알림 수, 새로고침 기능을 추가했다.
- `보호자에게 알리기` 푸시 메시지를 `guardian_notifications` 테이블에 저장하도록 했다.
- 열린 앱 화면은 서비스워커 푸시 수신 시 알림 목록을 갱신한다.

### 산출물
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

### 검증
- 로컬 빌드 성공.

### 반영 시간
- UI 위치 변경, 알림 저장/조회 API, 서비스워커 연동, 문서/로그 반영: 약 40분.

### 운영 반영
- GitHub commit:
  - `7c98dd4 Move my page to corner actions and add notification inbox`
- Vercel production deployment:
  - `https://zezari-itn02cnr3-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 알림 API는 비로그인 상태에서 401을 반환해 로그인 보호가 적용된 것을 확인.

## 2026-06-19 - 마이페이지 스타일 정렬 기준 반영

### 요구내용
- 마이페이지가 프로젝트 전체 CSS와 어울리도록 수정한다.
- 향후 첨부 캡처는 화면 구성만 참고하고, 실제 스타일은 프로젝트 CSS를 기준으로 적용한다.

### 반영내용
- 마이페이지의 좁은 팝업 느낌을 줄이고 프로젝트 카드형 패널 스타일로 정리했다.
- 두꺼운 검은 구분선과 검은 아바타를 제거하고, 프로젝트 포인트 컬러와 얇은 테두리 기준으로 변경했다.
- 보호자 정보, 대상자 정보, 부가 정보, 고객지원 영역의 행 정렬과 링크 스타일을 통일했다.
- 모바일 화면에서 정보 행이 한 줄로 압축되어 삐져나오지 않도록 반응형 처리를 추가했다.
- 앞으로 캡처 이미지는 구성 참고용으로만 보고, 최종 화면은 프로젝트 공통 CSS 기준을 따른다는 기준을 기록했다.

### 산출물
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- CSS 차이 검사 통과.
- 로컬 빌드 성공.
- 로컬 메인 화면과 관리자 화면 HTTP 200 응답 확인.
- 인앱 브라우저 검증은 현재 세션에서 브라우저가 비활성 상태라 진행하지 못했다.

### 운영 반영
- GitHub commit:
  - `0ef97f1 Align my page with project style`
- Vercel production deployment:
  - `https://zezari-d7jkov9xq-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 관리자 페이지 정상 응답 확인.

### 반영 시간
- 마이페이지 CSS 정리, 반응형 보정, 로그 반영: 약 15분.

## 2026-06-19 - 카카오 우편번호 보호자 주소 입력 연동

### 요구내용
- 카카오 우편번호 서비스를 사용해서 보호자 정보에서 주소를 입력받고 싶다.

### 반영내용
- 보호자 정보 화면의 주소 입력 영역에 `주소 검색` 버튼을 추가했다.
- 버튼 클릭 시 카카오 우편번호 검색 팝업이 열리도록 구성했다.
- 사용자가 검색 결과를 선택하면 우편번호와 기본주소가 기존 보호자 주소 입력값에 자동 반영된다.
- 보호자는 자동 반영된 주소 뒤에 상세주소를 직접 이어서 입력할 수 있다.
- 별도 API 키 없이 카카오 공식 우편번호 스크립트를 필요할 때만 불러오도록 구현했다.
- 모바일에서는 주소 입력칸과 검색 버튼이 세로로 배치되도록 반응형 스타일을 적용했다.

### 산출물
- `app/kakao-postcode-address.js`
- `app/dashboard.js`
- `app/globals.css`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- CSS 차이 검사 통과.
- 로컬 빌드 성공.
- 로컬 메인 화면 정상 응답 확인.
- 로컬 보호자 정보 탭 정상 응답 확인.
- 카카오 우편번호 팝업의 실제 선택 동작은 현재 세션에서 브라우저가 비활성 상태라 직접 시각 검증하지 못했다.

### 운영 반영
- GitHub commit:
  - `f9e049e Add Kakao postcode address search`
- Vercel production deployment:
  - `https://zezari-i1mxasybm-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 관리자 페이지 정상 응답 확인.

### 반영 시간
- 공식 가이드 확인, 주소 검색 컴포넌트 추가, 보호자 폼 연결, 스타일/로그 반영: 약 25분.

## 2026-06-19 - 상품 선택 페이지 및 관리자 상품 관리 추가

### 요구내용
- 대시보드에서 `구독결제하기` 버튼과 상단 구독 기간/가격 선택 박스를 제거한다.
- 기존 `상품 구매` 버튼을 새 상품 선택 페이지로 연결한다.
- 상품 선택 화면은 첨부 화면의 구성만 참고하고, 스타일은 프로젝트 CSS 기준으로 만든다.
- 상품은 관리자가 업로드한 이미지로 구성한다.
- 상품 선택 후 대상자를 선택하고, 구독기간을 선택하면 기간별 구독 결제로 진행한다.
- 상품 단독 구매는 이미 구독중인 고객만 선택할 수 있게 한다.

### 반영내용
- 대시보드 현재 상태 상단의 구독 결제 UI를 제거했다.
- 대시보드 `상품 구매` 버튼을 `/shop`으로 연결했다.
- `/shop` 상품 선택 페이지를 추가했다.
- 상품 선택 후 상세 화면에서 디자인, 수량, 대상자, 구독기간을 선택할 수 있게 구성했다.
- 상품 단독 구매 탭은 구독중 상태에서만 선택 가능하게 제한했다.
- 관리자 페이지에 `상품 관리` 메뉴를 추가했다.
- 관리자는 상품명, 설명, 이미지, 단독 구매 가격, 노출 여부, 정렬 순서를 관리할 수 있다.
- `products`, `product_orders` 테이블을 추가하고 기본 상품 4종을 시드하도록 구성했다.
- 구독 결제 준비 시 상품/대상자/수량 선택값을 주문 초안으로 저장하도록 했다.
- 상품 단독 구매 요청 저장 API를 추가했다.

### 산출물
- `app/shop/page.js`
- `app/shop-checkout-client.js`
- `app/api/products/orders/route.js`
- `app/api/payments/toss/subscription/prepare/route.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/dashboard.js`
- `app/globals.css`
- `lib/db.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.
- 빌드 결과에서 `/shop` 및 `/api/products/orders` 라우트 생성 확인.
- 별도 로컬 빌드 서버에서 `/shop` HTTP 200 응답 확인.
- 별도 로컬 빌드 서버에서 `/admin?section=products` HTTP 200 응답 확인.

### 운영 반영
- GitHub commit:
  - `8cfd778 Add product shop flow`
- Vercel production deployment:
  - `https://zezari-31xgubkr0-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 상품 선택 페이지 정상 응답 확인.
- 운영 관리자 상품 관리 페이지 정상 응답 확인.

### 반영 시간
- DB 모델, 관리자 상품 관리, 사용자 상품 선택 화면, 결제 준비 연결, 문서/로그 반영: 약 70분.

## 2026-06-19 - 상품 주문 단계화 및 QR 활성화 게이트 적용

### 요구내용
- 상품 선택 후 화면에서 상품 단독구매 설명 영역은 기본 화면에서 제거한다.
- 상품 단독구매 설명은 `상품 단독 구매`를 눌렀을 때만 보이게 한다.
- `다음` 버튼을 누르면 선택한 상품의 상세/미리보기 페이지가 나오게 한다.
- 상세/미리보기 페이지의 버튼은 `결제하기`가 아니라 `주문정보입력`으로 표시한다.
- 주문정보입력 후 배송지와 결제방법을 선택하고 실제 Toss 결제를 진행한다.
- 결제 완료 후 주문 완료 페이지를 보여준다.
- 상품 수령 후 QR을 스캔하면 보호자가 로그인된 경우 QR 활성화 버튼을 제공한다.
- QR 활성화 시 실제 구독기간이 시작되게 한다.
- 활성화되지 않은 QR 공개 페이지에서는 관리대상 정보가 보이지 않게 한다.

### 반영내용
- 상품 구매 화면을 `선택 -> 미리보기 -> 주문정보입력/결제 -> 완료` 단계로 재구성했다.
- 상품 단독 구매 요약/설명은 단독 구매 탭을 선택했을 때만 표시되도록 변경했다.
- 상품 미리보기 화면에 관리자 업로드 상품 이미지를 기반으로 한 주문 미리보기를 추가했다.
- `주문정보입력` 버튼을 추가하고, 다음 단계에서 배송지와 결제방법을 입력받도록 했다.
- Toss 일반 상품 결제 준비/성공/실패 라우트를 추가했다.
- 구독 결제 성공 시 바로 구독기간을 시작하지 않고 `ready` 상태로 보관하도록 했다.
- QR 코드에 보호자 활성화 시각 `activated_at`을 추가했다.
- 보호자가 상품 수령 후 QR 페이지에서 활성화하면 QR 공개와 구독기간 시작이 동시에 처리되도록 했다.
- 활성화 전 QR 공개 페이지는 대상자/보호자 정보를 숨기고 안내 화면만 보여주도록 변경했다.
- 활성화 전 QR에서는 보호자에게 알리기 API도 호출되지 않게 제한했다.

### 산출물
- `app/shop-checkout-client.js`
- `app/api/payments/toss/product/prepare/route.js`
- `app/payments/toss/product/success/page.js`
- `app/payments/toss/product/fail/page.js`
- `app/payments/toss/subscription/success/page.js`
- `app/find/[key]/page.js`
- `app/api/find/[key]/notify/route.js`
- `app/actions.js`
- `app/globals.css`
- `lib/db.js`
- `lib/toss-payments.js`
- `deliverables/DATABASE_SCHEMA.md`
- `deliverables/USER_MANUAL.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- CSS 차이 검사 통과.
- 로컬 빌드 성공.
- 빌드 결과에서 상품 결제 준비/성공/실패 라우트와 `/shop`, `/find/[key]` 라우트 생성 확인.
- 별도 로컬 빌드 서버에서 `/shop`, `/payments/toss/product/fail`, `/admin?section=products` HTTP 200 응답 확인.
- Toss 결제창 최종 승인 단계는 외부 결제 상호작용이 필요해 자동 완료 검증하지 못했다.

### 운영 반영
- GitHub commit:
  - `332206a Add staged product payment and QR activation`
- Vercel production deployment:
  - `https://zezari-4vta9rbcd-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 상품 선택 페이지 정상 응답 확인.
- 운영 상품 결제 실패 페이지 정상 응답 확인.
- 운영 관리자 상품 관리 페이지 정상 응답 확인.

### 반영 시간
- 구매 단계 재구성, Toss 상품 결제 라우트, QR 활성화 정책, 공개 페이지 정보 보호, 문서/로그 반영: 약 80분.

## 2026-06-19 - 사용자 탭 스타일 통일 및 대시보드 사진 확대

### 요구내용
- 사용자 페이지의 `대시보드`, `보호자정보`, `관리대상정보` 탭 스타일이 서로 달라 보인다.
- 세 탭의 스타일을 `관리대상정보` 기준으로 통일한다.
- 대시보드 관리대상 사진을 현재보다 약 1.7배 크게 보이게 한다.

### 반영내용
- 대시보드 현재상태 패널, 보호자정보 패널, 관리대상정보 헤더/카드의 폭과 카드 스타일을 통일했다.
- 대시보드의 기존 휴대폰 목업 느낌을 줄이고 관리대상정보와 같은 카드형 패널로 정리했다.
- 보호자정보 화면도 같은 카드 폭, 테두리, 그림자, 헤더 정렬 기준을 따르도록 변경했다.
- 대시보드 관리대상 사진 영역을 확대했다.
- 사진 확대에 맞춰 관리대상 카드의 그리드 폭, 최소 높이, 모바일 정렬을 보정했다.

### 산출물
- `app/globals.css`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- CSS 차이 검사 통과.
- 로컬 빌드 성공.
- 별도 로컬 빌드 서버에서 메인 페이지와 상품 페이지 HTTP 200 응답 확인.

### 운영 반영
- GitHub commit:
  - `a10b693 Unify guardian tab styling`
- Vercel production deployment:
  - `https://zezari-fmjo05wud-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 운영 검증
- 운영 메인 페이지 정상 응답 확인.
- 운영 상품 페이지 정상 응답 확인.

### 반영 시간
- 사용자 탭 공통 스타일 정리, 대시보드 사진 확대, 반응형 보정, 로그 반영: 약 20분.

## 2026-06-20 - 마이페이지 계정 관리 메뉴 확장

### 요구내용
- 마이페이지에 `결제 및 구독 현황` 링크를 추가하고 새 페이지를 만든다.
- 마이페이지에 `쿠폰함`을 추가하고 쿠폰 등록/조회 화면을 만든다.
- 마이페이지에 `결제수단`을 추가하고 사용자가 결제수단 표시 정보를 미리 입력할 수 있게 한다.
- 마이페이지에 `광고 대시보드` 항목을 추가하고 광고 상태를 조회할 수 있는 페이지를 만든다.
- 첨부 화면은 구성만 참고하고, 스타일은 현재 프로젝트의 CSS 기준으로 통일한다.

### 반영내용
- 마이페이지 부가 정보에 다음 링크를 추가했다.
  - 결제 및 구독 현황
  - 쿠폰함
  - 결제수단
  - 광고 대시보드
- `/account/billing` 페이지를 추가해 관리대상별 구독 상태와 최근 상품 결제 내역을 조회할 수 있게 했다.
- `/account/coupons` 페이지를 추가해 쿠폰 번호 등록, 사용가능 쿠폰, 사용완료 쿠폰 영역을 구성했다.
- `/account/payment-methods` 페이지를 추가해 카드사/별칭/끝 4자리/기본 여부 같은 안전한 표시 정보만 저장하도록 했다.
- `/account/ads` 페이지를 추가해 광고 전체/광고중/광고완료 필터와 광고 카드 목록을 구성했다.
- 쿠폰과 결제수단 표시 정보를 DB로 관리하기 위해 `guardian_coupons`, `guardian_payment_methods` 테이블을 추가했다.
- 전체 화면은 기존 카드형 패널, 버튼, 테두리, 색상 토큰을 사용해 프로젝트 스타일로 맞췄다.

### 산출물
- `app/account/account-ui.js`
- `app/account/billing/page.js`
- `app/account/coupons/page.js`
- `app/account/payment-methods/page.js`
- `app/account/ads/page.js`
- `app/actions.js`
- `app/dashboard.js`
- `app/globals.css`
- `lib/db.js`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

### 검증
- 로컬 빌드 성공.
- CSS 차이 검사 통과.
- 로컬 환경에서 새 계정 보호 라우트가 비로그인 상태에서 `/`로 정상 이동하는 것 확인.
- 운영 배포 후 메인 페이지 HTTP 200 확인.
- 운영 환경에서 새 계정 보호 라우트가 비로그인 상태에서 `/`로 정상 이동하는 것 확인.

### 운영 반영
- GitHub commit:
  - `f78ae48 Add account billing and utility pages`
- Vercel production deployment:
  - `https://zezari-hojnijdb8-zezari.vercel.app`
- Production alias:
  - `https://zezari.vercel.app`

### 반영 시간
- 마이페이지 링크 추가, 계정 하위 페이지 4개 생성, DB 스키마/액션 추가, 스타일 정리, 배포/검증: 약 45분.
