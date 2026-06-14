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
