# REAL_QR_FIND Follow-up Tasks

## Social Login

- [x] Google: `zezari.family` callback configured and full login confirmed by the user on 2026-07-31.
- [ ] Naver: callback configuration is complete, but the application is still in development mode. Complete Naver review and test login with a non-member account.
- [ ] Kakao: register and verify the `zezari.family` callback, then test first signup and returning-user login.
- [ ] Facebook: verify the production callback, permissions, app mode, and first signup/returning-user login.
- [ ] Dual-domain retirement review: keep `zezari.vercel.app` callbacks until old links and printed QR usage no longer require the compatibility domain.

## Maintenance Rule

- Move an item to completed only after its provider console configuration and production login flow are both verified.
- Never record provider secrets, access tokens, or environment-variable values in this document.
