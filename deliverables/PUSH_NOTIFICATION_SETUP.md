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
8. Server stores the message in `guardian_notifications`.
9. Server sends Web Push to the guardian's registered browser/app devices.
10. The guardian can open the top-left bell icon in the dashboard to view received notification messages.

## Device Registration And Self-Recovery
- Notification permission alone is not treated as a completed Push connection.
- On app load, a guardian with granted permission goes through all required checks:
  1. register or update `/sw.js`
  2. load the production VAPID public key
  3. inspect the browser `PushSubscription`
  4. replace a subscription created with a different VAPID key
  5. upsert the current endpoint into `push_subscriptions`
- The UI becomes connected only after the server confirms the endpoint save.
- `푸시 알림 연결하기` requests permission, completes device registration, and immediately sends a real test Push.
- Once connected, the same button becomes `테스트 알림 보내기`.
- Test endpoint: authenticated `POST /api/push/test`.
- A failed test returns a specific error for no registered device or provider delivery failure.

## Installed App Notification Behavior
- Android installed PWA:
  - Web Push appears in the Android notification center.
  - The notification uses the device's default site notification sound and an Android vibration pattern.
  - Android launchers that derive icon badges from active notifications display the unread notification badge automatically.
  - When the Badging API is available, the app also sets the exact unread count.
- iPhone/iPad Home Screen web app:
  - Requires iOS/iPadOS 16.4 or later.
  - The user must add the service to the Home Screen, open it from the installed icon, and tap `푸시 알림 켜기`.
  - Notifications appear on the Lock Screen and in Notification Center after permission is granted.
  - The Home Screen icon badge shows the unread `guardian_notifications` count when badge display is enabled in iOS notification settings.
- Web Push cannot select or upload a custom sound file. `silent: false` allows the operating system's default notification sound, subject to silent mode, Focus mode, and per-app notification settings.

## Unread Count And Badge Synchronization
- Every saved guardian notification is counted from `guardian_notifications WHERE read_at IS NULL`.
- The server includes `unreadCount` in each Web Push payload.
- `public/sw.js` calls the Badging API while processing the background push event.
- Opening the in-app bell marks all messages as read, clears the app icon badge, and closes displayed OS notifications.
- Clicking an OS notification also marks messages as read and clears the badge.
- Deleting an in-app notification closes its matching displayed OS notification when available.
- The notification API returns both the latest notification rows and the complete unread count, so counts above the list limit remain accurate.

## Environment Variables
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

`VAPID_SUBJECT` currently defaults to `mailto:general@zezari.com`.

## Files
- `app/push-notification-button.js`
- `app/notification-bell.js`
- `app/api/notifications/route.js`
- `app/api/push/public-key/route.js`
- `app/api/push/subscribe/route.js`
- `app/api/push/test/route.js`
- `app/api/find/[key]/notify/route.js`
- `app/find/[key]/notify-button.js`
- `lib/push.js`
- `public/sw.js`
- `lib/db.js`

## Data Storage
- Table: `push_subscriptions`
- One guardian can have multiple push subscriptions across devices/browsers.
- Expired push endpoints are removed when the push provider returns 404 or 410.
- Table: `guardian_notifications`
- Each finder notification is saved by guardian so it can be shown in the in-app bell notification panel.
- Opening the bell panel marks stored notifications as read.

## Platform References
- WebKit: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- WebKit Badging API: https://webkit.org/blog/14112/badging-for-home-screen-web-apps/
- Chrome Badging API: https://developer.chrome.com/docs/capabilities/web-apis/badging-api

## Limits And Next Hardening
- Current notify endpoint is public because QR find pages are public.
- Before launch, add abuse controls:
  - rate limit by QR key and IP.
  - optional confirmation throttling per subject.
  - finder message/audit log if needed.
- Public QR pages show subject/contact information by design. Add explicit consent and field-level visibility controls before real personal data rollout.
- Final sound, vibration, notification-center placement, and icon-badge visibility are controlled by each device's notification settings and launcher.
- Complete verification requires one real Android installed PWA and one iOS 16.4+ Home Screen web app.

## 2026-07-24 Android Delivery Incident
- Symptom: the installed Android PWA received no sound or notification-center entry.
- Production evidence:
  - `push_subscriptions`: 0 rows
  - guardians with a registered Push endpoint: 0
  - latest admin Push batch: 9 recipients, 0 successes, 9 failures
- Root cause:
  - the old UI marked Push as enabled when `Notification.permission` was `granted`
  - it did not verify that a browser Push subscription existed and was saved in Turso
  - the enabled button was disabled, so the user could not repair the missing endpoint
- Fix:
  - validate and upsert the device endpoint on every granted-permission app load
  - keep the button available for reconnect/test
  - expose real test delivery
  - log server-side subscription saves and provider failures
  - mark an administrator batch with zero successes as failed instead of showing a false completion message
