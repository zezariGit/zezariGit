# Authentication Setup

Project: REAL_QR_FIND

## Planned Provider
- Google login/signup as the first authentication provider.

## Planned Implementation
- Use a server-side OAuth flow.
- Recommended stack for implementation:
  - Next.js on Vercel
  - Auth.js/NextAuth-style Google provider
  - Turso for application data after login is confirmed

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

The user should add the following values to `env.txt`.

```text
// google oauth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Values Codex Can Generate
- `AUTH_SECRET` or `NEXTAUTH_SECRET` can be generated locally by Codex.
- The generated secret must be stored in `.env.local` and Vercel environment variables, not committed to Git.

## Security Notes
- Never commit Google client secrets.
- Keep `env.txt` ignored by Git.
- Keep `.env.local` ignored by Git.
- Do not paste OAuth secrets into logs or presentation files.
