# Integration Setup

Project: REAL_QR_FIND

## Vercel

### Status
- Connected.

### Local CLI
- Vercel CLI version: `54.12.2`
- Logged-in Vercel account: `zezarigit`

### Linked Project
- Vercel project name: `real-qr-find`
- Vercel scope: `zezari-vercel-s-projects`
- GitHub repository connected by Vercel:
  - `https://github.com/zezariGit/zezariGit`

### Local Metadata
- Vercel created `.vercel/project.json` locally.
- `.vercel/` is ignored by Git because it is local machine/project-link metadata.

## Turso

### Status
- Pending.

### Current Blocker
- Turso CLI is not installed.
- Official Turso Windows CLI setup requires WSL.
- This PC currently reports that WSL is not installed.

### Required Environment Variables
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### Recommended Next Path
1. Install WSL on Windows.
2. Install Turso CLI inside WSL using the official install script.
3. Authenticate with Turso.
4. Create the production database for this project.
5. Create a database auth token.
6. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to:
   - Local `.env.local`
   - Vercel project environment variables

### Alternative Path
- Use the Turso dashboard or Platform API to create the database and token, then provide:
  - Database URL
  - Auth token
- After that, the values can be added to Vercel with:
  - `vercel env add TURSO_DATABASE_URL`
  - `vercel env add TURSO_AUTH_TOKEN`

## Notes
- Do not commit real secrets.
- Use `.env.example` only for variable names.
- Store actual values in local `.env.local` and Vercel environment variables.
