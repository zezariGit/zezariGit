# REAL_QR_FIND Follow-up Tasks

## Social Login

- [x] Google: `zezari.family` callback configured and full login confirmed by the user on 2026-07-31.
- [ ] Naver: passwordless social signup and callbacks are complete. Re-review was submitted on 2026-07-31 and is in `검수요청`; after approval, test first signup with a non-member account and returning-user login.
- [ ] Kakao: register and verify the `zezari.family` callback, then test first signup and returning-user login.
- [ ] Facebook: verify the production callback, permissions, app mode, and first signup/returning-user login.
- [ ] Dual-domain retirement review: keep `zezari.vercel.app` callbacks until old links and printed QR usage no longer require the compatibility domain.

## Maintenance Rule

- Move an item to completed only after its provider console configuration and production login flow are both verified.
- Never record provider secrets, access tokens, or environment-variable values in this document.

## Advertising

- [x] Administrator UI testing: local preview and legacy `test_in_review` rows can verify dashboard states without creating a new Meta advertisement.
- [x] Meta production publishing and status synchronization: a live administrator-pass advertisement was published, read through the protected status API, and moved from review to active.

## Device Verification

- [ ] iOS Safari/PWA: re-test microphone permission guidance, 30-second guardian voice recording, subject registration persistence, and saved-audio playback on a physical device.
