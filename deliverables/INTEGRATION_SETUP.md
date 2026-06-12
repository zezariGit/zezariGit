# Integration Setup

Project: REAL_QR_FIND

## Vercel

### Status
- Connected.

### Local CLI
- Vercel CLI version: `54.12.2`
- Logged-in Vercel account: `zezarigit`

### Linked Project
- Vercel project name: `zezari`
- Vercel scope: `zezari-vercel-s-projects`
- GitHub repository connected by Vercel:
  - `https://github.com/zezariGit/zezariGit`
- Current public Vercel URL:
  - `https://zezari.vercel.app`
- Previous public Vercel URL:
  - `https://real-qr-find.vercel.app`

### Local Metadata
- Vercel created `.vercel/project.json` locally.
- `.vercel/` is ignored by Git because it is local machine/project-link metadata.

### Deployment Protection
- SSO deployment protection was disabled so `https://zezari.vercel.app` can be accessed publicly.

### Future Custom Domain
- `zezari.com` can be connected later if the domain is owned or controlled by the project owner.
- Required future steps:
  - Add `zezari.com` in the Vercel project domain settings.
  - Configure DNS records at the domain registrar or DNS provider.
  - Wait for DNS propagation and Vercel certificate issuance.

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
