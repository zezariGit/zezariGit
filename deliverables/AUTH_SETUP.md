# Authentication Setup

Project: REAL_QR_FIND

## Planned Provider
- Google login/signup as the first authentication provider.

## Implementation Status
- Implemented.

## Implemented Stack
- Next.js on Vercel.
- NextAuth Google provider.
- JWT session strategy.
- Turso remains configured for application data after login is confirmed.

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
```

## Configured Environment Variables
- Local `.env.local`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`
- Vercel Production:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=https://zezari.vercel.app`
- Vercel Development:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=http://localhost:3000`

## Implemented Routes
- `/`
  - Shows login state.
  - Shows Google login button when logged out.
  - Shows user name/email and logout button when logged in.
- `/api/auth/[...nextauth]`
  - Handles NextAuth routes.
  - Includes Google OAuth callback at `/api/auth/callback/google`.

## Security Notes
- Never commit Google client secrets.
- Keep `env.txt` ignored by Git.
- Keep `.env.local` ignored by Git.
- Do not paste OAuth secrets into logs or presentation files.
