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
- Connected for local development and Vercel Production/Development environments.

### Database
- Database URL host:
  - `zezariturso-zezarigit.aws-ap-northeast-1.turso.io`

### Required Environment Variables
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### Configured Locations
- Local `.env.local`
- Vercel Production
- Vercel Development

### Preview Environment Note
- Vercel CLI rejected adding Preview variables to the `main` branch because `main` is the Production branch.
- Preview variables should be added later when a non-production preview branch exists, or through the Vercel dashboard for all Preview branches.

## Notes
- Do not commit real secrets.
- Use `.env.example` only for variable names.
- Store actual values in local `.env.local`, user-local `env.txt`, and Vercel environment variables.
- `env.txt` and `.env.local` are ignored by Git.
