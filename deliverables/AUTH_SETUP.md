# Authentication Setup

Project: REAL_QR_FIND

## Planned Providers
- Google login/signup.
- Kakao login/signup.
- Naver login/signup.

## Implementation Status
- Implemented.

## Implemented Stack
- Next.js on Vercel.
- NextAuth OAuth providers:
  - Google
  - Kakao
  - Naver
- JWT session strategy.
- Turso remains configured for application data after login is confirmed.
- Providers are registered only when both client ID and client secret are present in the environment.

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

## Configured Environment Variables
- Local `.env.local`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`
- Vercel Production:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=https://zezari.vercel.app`
- Vercel Development:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`

## Implemented Routes
- `/`
  - Shows login state.
  - Shows Google, Kakao, and Naver login buttons when logged out.
  - Buttons are disabled until the corresponding provider keys are configured.
  - Shows the guardian dashboard when logged in.
- `/api/auth/[...nextauth]`
  - Handles NextAuth routes.
  - Includes provider callback routes:
    - `/api/auth/callback/google`
    - `/api/auth/callback/kakao`
    - `/api/auth/callback/naver`

## Security Notes
- Never commit OAuth client secrets.
- Keep `env.txt` ignored by Git.
- Keep `.env.local` ignored by Git.
- Do not paste OAuth secrets into logs or presentation files.
