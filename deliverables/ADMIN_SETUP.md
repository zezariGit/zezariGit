# Admin Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Route
- `/admin`

## Access Control
- Admin access requires Google login.
- Admin email is checked against `ADMIN_EMAILS`.
- If `ADMIN_EMAILS` is empty, the default admin email is:
  - `general@zezari.com`

## Admin Page Layout
- Left side:
  - Guardian grid.
  - Shows guardian name/email.
  - Shows subject count.
  - Shows active/inactive state.
- Right side:
  - Selected guardian detail.
  - Activate/deactivate button.
  - Grid of up to 4 managed subjects.
  - Each subject shows photo, name, birth date, and status.

## Guardian Activation
- Stored in `guardians.is_active`.
- Values:
  - `1`: active
  - `0`: inactive
- Inactive guardians see a disabled-account notice on the user dashboard.

## Files
- `app/admin/page.js`
- `app/admin/actions.js`
- `lib/admin.js`
- `lib/db.js`
- `app/dashboard.js`
- `app/globals.css`

## Environment Variable

```text
ADMIN_EMAILS=general@zezari.com
```

Multiple admins can be comma-separated.

```text
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```
