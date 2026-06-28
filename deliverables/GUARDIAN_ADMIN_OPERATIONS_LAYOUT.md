# Guardian Admin Operations Layout

## Purpose
- Rebuild the administrator guardian-management screen as an operations-style workspace matching the provided reference layout.
- Keep the screen consistent with the existing admin CSS system while increasing table density and adding live summary metrics.

## Implemented Scope
- Added top status cards:
  - Total guardians
  - New guardians today with yesterday comparison
  - Guardians with at least one registered subject
  - Guardians without registered subjects
- Expanded guardian search filters:
  - Search keyword
  - Guardian status
  - Guardian type
  - Signup date range
- Reworked the guardian list as a dense grid with:
  - Selection marker
  - Name and member number
  - Login identifier/provider
  - Phone
  - Birth date and age
  - Gender placeholder
  - Guardian status
  - Guardian type
  - Signup date
  - Detail action text
- Reworked the right detail panel with:
  - Avatar-style initial mark
  - Guardian profile header
  - Detail navigation links
  - Basic information list
  - Subject/subscription/payment/ad summary cards
  - Admin memo save form
  - Deactivation/reactivation action

## Data Rules
- Guardian type is derived from existing data:
  - `관리자`: guardian has admin authority
  - `VIP`: guardian has an active subscription
  - `일반`: no admin authority and no active subscription
- Guardian gender is displayed as `-` because there is no guardian gender field in the current schema.
- The search result keeps the existing 200-row server-side limit.
- Excel-compatible CSV export now includes login ID/provider, birth date, address, guardian type, status, and subject count.

## Files Changed
- `lib/db.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/README.md`
- `deliverables/image_prompts/IMAGE_PROMPTS.md`
- `logs/DEV_HANDOFF_LOG.md`
- `logs/PRESENTATION_PROGRESS_LOG.md`

## Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with only existing Windows line-ending warnings.
- Local dev route `http://localhost:3000/admin?section=guardians` returned 200.
- Production deployment succeeded.
- `https://zezari.vercel.app` returned 200.
- `https://zezari.vercel.app/admin?section=guardians` returned 200.
- Vercel error log scan found no errors for the deployment.
- Browser visual verification with Playwright could not run because the local Playwright browser binary was not installed.

## Notes
- Future page-size selection can be wired to URL parameters if real pagination is added.
- If guardian gender becomes required later, add a schema column and replace the current `-` placeholder.
