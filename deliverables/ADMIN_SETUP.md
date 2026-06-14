# Admin Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Route
- `/admin`

## Access Control
- Admin access requires Google login.
- Admin access is granted by either:
  - Email listed in `ADMIN_EMAILS`.
  - `guardians.is_admin = 1` in the database.
- If `ADMIN_EMAILS` is empty, the default admin emails are:
  - `general@zezari.com`
  - `soonsuboy10@gmail.com`

## Admin Page Layout
- Top admin menu:
  - `보호자 관리`
  - `QR 관리`
  - `관리자 관리`
- `보호자 관리`:
  - Left guardian grid.
  - Right selected guardian detail and managed subject grid.
- `QR 관리`:
  - QR generation form.
  - QR card grid with image, unique key, URL, and active state.
- `관리자 관리`:
  - Lists registered guardians.
  - Allows admins to grant/revoke DB admin role.
  - Environment default admins are shown as protected base admins.

## Guardian Activation
- Stored in `guardians.is_active`.
- Values:
  - `1`: active
  - `0`: inactive
- Inactive guardians see a disabled-account notice on the user dashboard.

## Admin Role Management
- Stored in `guardians.is_admin`.
- Values:
  - `1`: DB administrator
  - `0`: normal guardian
- DB administrators can access `/admin` after Google login.
- Environment default admins still have access even if their DB flag is off.
- The admin management UI disables role removal for environment default admins because that access is configured outside the database.

## Files
- `app/admin/page.js`
- `app/admin/actions.js`
- `lib/admin.js`
- `lib/db.js`
- `app/dashboard.js`
- `app/globals.css`

## Environment Variable

```text
ADMIN_EMAILS=general@zezari.com,soonsuboy10@gmail.com
```

Multiple admins can be comma-separated.

```text
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```
