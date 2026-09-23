# Admin Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Route
- `/admin`

## Access Control
- Admin access requires phone verification login.
- Admin access is granted by either:
  - Phone number listed in `ADMIN_PHONES`.
  - `guardians.is_admin = 1` in the database.
- Former `ADMIN_EMAILS` entries are migrated once to `guardians.is_admin = 1` and are not used for runtime authorization.

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
  - Uses the verified phone number to grant/revoke the DB admin role.
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
- DB administrators can access `/admin` after phone verification login.
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
ADMIN_PHONES=010-1234-5678,010-9876-5432
```

Multiple phone numbers can be comma-separated. Store only verified guardian phone numbers.
