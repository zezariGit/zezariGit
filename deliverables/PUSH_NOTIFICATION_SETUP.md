# Push Notification Setup

Project: REAL_QR_FIND / zezari

## Purpose
- Let a finder who scans an assigned QR notify the logged-in guardian.
- Message content:
  - `{관리대상 이름}을 찾았습니다`

## Implemented Flow
1. Logged-in guardian opens the dashboard.
2. Guardian clicks `푸시 알림 켜기`.
3. Browser asks for notification permission.
4. The app stores the browser Push API subscription in Turso.
5. Finder scans an assigned QR and opens `/find/{public_key}`.
6. Finder clicks `보호자에게 알리기`.
7. Server loads the assigned subject and guardian from `qr_codes`.
8. Server sends Web Push to the guardian's registered browser/app devices.

## Environment Variables
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

`VAPID_SUBJECT` currently defaults to `mailto:general@zezari.com`.

## Files
- `app/push-notification-button.js`
- `app/api/push/public-key/route.js`
- `app/api/push/subscribe/route.js`
- `app/api/find/[key]/notify/route.js`
- `app/find/[key]/notify-button.js`
- `lib/push.js`
- `public/sw.js`
- `lib/db.js`

## Data Storage
- Table: `push_subscriptions`
- One guardian can have multiple push subscriptions across devices/browsers.
- Expired push endpoints are removed when the push provider returns 404 or 410.

## Limits And Next Hardening
- Current notify endpoint is public because QR find pages are public.
- Before launch, add abuse controls:
  - rate limit by QR key and IP.
  - optional confirmation throttling per subject.
  - finder message/audit log if needed.
- Public QR pages show subject/contact information by design. Add explicit consent and field-level visibility controls before real personal data rollout.
