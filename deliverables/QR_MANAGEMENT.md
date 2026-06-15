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
   - Assigned guardian
   - Assigned managed subject
   - Active/inactive status
4. Admin can filter QR records by:
   - all/matched/unmatched
   - all/active/inactive
5. Admin can activate or deactivate each QR.
6. Admin can manually assign, change, or clear a QR-to-subject match.
   - Instead of a full select box, unmatched QR cards show one `매칭대상 조회` button.
   - The button opens one modal popup for guardian/subject search.
   - The modal disables the main screen visually while open so multiple card-level searches do not compete for attention.
   - Admin can search by guardian name/email and managed subject name inside the modal.
   - Search results only include subjects that are not currently matched to any QR.
   - A subject already matched to a QR appears only after its existing match is cleared.
   - Matched QR cards hide `매칭대상 조회` and show only `매칭 해제` for matching control.
7. Admin can generate additional unique QR codes by entering a desired count.
8. Public QR URLs resolve to:
   - `/find/{public_key}`
9. When a guardian creates or edits a subject, the server assigns one available QR to that subject if no QR is already assigned.
10. If no unassigned QR remains, the server generates a new QR and assigns it.

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
- Active but unassigned key: shows a not-yet-connected QR message.
- Active assigned key: shows the managed subject information, guardian contact fields, and a `보호자에게 알리기` button.
- The notify button sends a Web Push message to the logged-in guardian's registered browser/app devices.

## Admin Controls
- Initial seed: 30 active QR records.
- Additional creation: 1 to 200 records per request.
- Subject matching:
  - one `subjects.id` maps to one `qr_codes.subject_id`.
  - `qr_codes.subject_id` is enforced with a unique index.
  - deleted subjects release their QR assignment.
  - manual admin assignment moves the selected subject from any previous QR to the newly selected QR.
  - manual clear sets `qr_codes.guardian_id` and `qr_codes.subject_id` back to `NULL`.
  - manual search excludes already matched subjects using `LEFT JOIN qr_codes ... WHERE q.id IS NULL`.
- QR image download:
  - Admin can click the QR image to download a PNG.
  - Guardian can view and download assigned QR images from the user information screen.
- Feedback:
  - Query buttons show an inline progress indicator while submitting.
  - Save/update/delete/match actions return to the page with a bottom status message.
  - Failure cases return an error-style bottom message when handled by the server action.
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
- QR filter stats verified against Turso.
- Subject option list verified against Turso.
- Unmatched subject search verified against Turso.
- Guardian subject QR join verified against Turso.
