# QR Management Deliverable

Project: REAL_QR_FIND / zezari

## Purpose
- Manage QR codes as database records.
- Connect each QR code to a unique URL-safe string.
- Use the unique string as the final URL segment for the public people-finding page.

## Implemented Flow
1. Admin opens `/admin?section=qr`.
2. The system ensures at least 30 QR records exist.
3. Admin can view:
   - QR image
   - QR label code
   - Unique public string
   - Public finding URL
   - Active/inactive status
4. Admin can activate or deactivate each QR.
5. Admin can generate additional unique QR codes by entering a desired count.
6. Public QR URLs resolve to:
   - `/find/{public_key}`

## Database
- Table: `qr_codes`
- Unique fields:
  - `code`
  - `public_key`
- Status field:
  - `is_active`

## URL Rule
- Production base URL:
  - `https://zezari.vercel.app`
- Finding URL pattern:
  - `https://zezari.vercel.app/find/{public_key}`
- The final URL segment is the `public_key`.

## Current Public Page Behavior
- Unknown key: shows an unregistered QR message.
- Inactive key: shows a disabled QR message.
- Active key: confirms the QR is valid and active.
- Subject matching, missing-person report intake, and guardian notification are reserved for the next implementation stage.

## Admin Controls
- Initial seed: 30 active QR records.
- Additional creation: 1 to 200 records per request.
- Duplicate prevention:
  - The server checks both `code` and `public_key` before insert.
  - Generation retries on collision.

## Files
- `lib/db.js`
- `app/admin/page.js`
- `app/admin/actions.js`
- `app/find/[key]/page.js`
- `app/globals.css`
- `deliverables/DATABASE_SCHEMA.md`

## Verification
- Local production build passed.
- Turso `qr_codes` table created.
- 30 initial QR records inserted.
- Public route `/find/[key]` is included in the Next.js build output.
