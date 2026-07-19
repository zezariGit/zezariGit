# Authentication Setup

Project: REAL_QR_FIND

## Planned Providers
- Google login/signup.
- Kakao login/signup.
- Naver login/signup.
- Facebook login/signup.

## Implementation Status
- Implemented.

## Implemented Stack
- Next.js on Vercel.
- NextAuth Credentials provider for guardian ID/password login.
- NextAuth OAuth providers:
  - Google
  - Kakao
  - Naver
  - Facebook
- JWT session strategy.
- Turso remains configured for application data after login is confirmed.
- Providers are registered only when both client ID and client secret are present in the environment.
- Facebook can use either `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` or the existing Meta app values `META_APP_ID` / `META_APP_SECRET`.

## Current Login Screen
- After the three-page onboarding flow, the logged-out user sees a compact login screen.
- Login screen elements:
  - Title: `로그인`
  - `아이디` input
  - `비밀번호` input
  - `자동로그인` checkbox
  - `비밀번호 찾기` helper action
  - Main `로그인` button
  - `또는` divider
  - SNS icon login row: Kakao, Naver, Google, Facebook
  - Bottom signup helper: `계정이 없으신가요? 회원가입`
- `자동로그인` currently remembers the guardian login ID only. Passwords are never saved in browser storage.
- `회원가입` opens the direct guardian signup flow:
  - Step 1: phone number verification.
  - Step 2: guardian basic information input.
  - Step 3: signup completion with `대상자 등록하기` and `대시보드 바로가기`.
- SNS first login also uses the same guardian signup completion flow when the account is not complete yet.
- When SNS provider data includes name or email, those values are prefilled in the signup information step.
- Existing complete guardians go directly to the dashboard after SNS login.
- Phone verification is implemented through server-issued SMS verification APIs. The screen no longer displays test codes.
- Production SMS delivery requires the SMS environment variables documented in `AUTH_PHONE_VERIFICATION.md`.
- Local development can use `SMS_DEV_BYPASS_CODE`; this bypass is disabled in production.
- Guardian ID/password login works after the guardian profile has saved `아이디` and `비밀번호`.

## Google Cloud Console Requirements

### OAuth Consent Screen
- App name:
  - `zezari`
- User support email:
  - Use the project owner's Google account email.
- Audience:
  - `External` for public Google accounts.
- Test users:
  - Add the Google accounts that will test login while the app is not fully published.
- Scopes:
  - `openid`
  - `email`
  - `profile`

### OAuth Client
- Application type:
  - `Web application`
- Suggested client name:
  - `zezari-web`

### Authorized JavaScript Origins
- Production:
  - `https://zezari.vercel.app`
- Local development:
  - `http://localhost:3000`
- Future custom domain:
  - `https://zezari.com`

### Authorized Redirect URIs
- Production:
  - `https://zezari.vercel.app/api/auth/callback/google`
- Local development:
  - `http://localhost:3000/api/auth/callback/google`
- Future custom domain:
  - `https://zezari.com/api/auth/callback/google`

## Values Needed in env.txt

The user added the following values to `env.txt`.

```text
// google oauth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

// kakao oauth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

// naver oauth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

// facebook oauth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

// or reuse existing Meta app values
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
```

## OAuth Callback URLs

### Google
- Production:
  - `https://zezari.vercel.app/api/auth/callback/google`
- Local development:
  - `http://localhost:3000/api/auth/callback/google`

### Kakao
- Production:
  - `https://zezari.vercel.app/api/auth/callback/kakao`
- Local development:
  - `http://localhost:3000/api/auth/callback/kakao`

### Naver
- Production:
  - `https://zezari.vercel.app/api/auth/callback/naver`
- Local development:
  - `http://localhost:3000/api/auth/callback/naver`

### Facebook
- Production:
  - `https://zezari.vercel.app/api/auth/callback/facebook`
- Local development:
  - `http://localhost:3000/api/auth/callback/facebook`
- Meta Developer Center notes:
  - Enable Facebook Login for the Meta app.
  - Add the production callback URL above to Valid OAuth Redirect URIs.
  - Add the local callback URL for local development tests when needed.
  - The app can keep using the Meta App ID and App Secret already configured for marketing API prework.

## Configured Environment Variables
- Local `.env.local`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` or `META_APP_ID` / `META_APP_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`
- Vercel Production:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` or `META_APP_ID` / `META_APP_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=https://zezari.vercel.app`
- Vercel Development:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` or `META_APP_ID` / `META_APP_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`

## Implemented Routes
- `/`
  - Shows login state.
  - Shows the onboarding flow first unless the user selected `다시보지 않기`.
  - Shows guardian ID/password login and Kakao, Naver, Google, Facebook icon buttons when logged out.
  - Supports direct signup view through the `회원가입` button or `/?signup=1`.
  - Buttons are disabled until the corresponding provider keys are configured.
  - Shows the guardian dashboard when logged in.
- `/api/signup/guardian`
  - Creates a guardian account before login.
  - Validates phone format, birth date, app ID format, password strength, duplicate app ID, duplicate phone, and required terms agreement.
  - Stores PBKDF2 password hash only; plaintext passwords are never stored.
- `/api/signup/complete`
  - Completes signup information for an already authenticated SNS user.
  - Uses the current session's guardian row and updates name, phone, birth date, email, app ID, password hash, phone verification timestamp, and required terms timestamps.
  - Rejects unauthenticated requests.
- `/api/auth/[...nextauth]`
  - Handles NextAuth routes.
  - Includes provider callback routes:
    - `/api/auth/callback/google`
    - `/api/auth/callback/kakao`
    - `/api/auth/callback/naver`
    - `/api/auth/callback/facebook`

## Security Notes
- Never commit OAuth client secrets.
- Keep `env.txt` ignored by Git.
- Keep `.env.local` ignored by Git.
- Do not paste OAuth secrets into logs or presentation files.
