# Authentication Session And Performance

## Purpose

This document records the August 23, 2026 investigation and production correction for slow Google login and unexpectedly repeated login prompts.

## Root Cause

- Vercel Functions ran in `iad1` while the Turso database ran in `aws-ap-northeast-1`. Google OAuth returned to the dashboard, which immediately performed database reads across the Pacific.
- The application relied on the NextAuth default 30-day JWT session and had no foreground/background session refresh.
- `zezari.family` and legacy Vercel domains used separate host cookies. Entering a different host could therefore look like an expired session even when the canonical-domain session remained valid.

## Implemented Changes

- Added `vercel.json` with the `hnd1` function region.
- Made `https://zezari.family` the production `NEXTAUTH_URL` and `PUBLIC_APP_URL`.
- Attached `zezari.vercel.app` to the current production deployment and permanently redirect legacy Vercel hosts to the canonical domain.
- Set JWT and session `maxAge` to 90 days, configurable through `AUTH_SESSION_MAX_AGE_DAYS` with a 1-365 day guard.
- Added a non-blocking session keep-alive on app open, every six hours, and after meaningful focus/online returns.
- Kept explicit logout and inactive-session expiry behavior unchanged.

## Production Verification

- Deployment: `dpl_8WbNSVKiNcvvdmvE1aVwcFxuVE9y` (`READY`).
- Function output region: `hnd1`.
- Dashboard visible-time measurement: about 2,865ms before, about 568ms after.
- Google account chooser opened in about 2,135ms.
- Selecting the existing Google account returned directly to the dashboard in about 3,436ms, with no second application login screen.
- Navigation through `/shop` and back to the dashboard retained the signed-in state.
- Opening `https://zezari.vercel.app/shop` redirected to `https://zezari.family/shop` and retained the canonical session.
- Production logs showed successful Google callback (`302`) and session requests (`200`).

## Operations

- Keep all OAuth provider callback URLs on `https://zezari.family`.
- Do not remove `NEXTAUTH_SECRET` or change it casually; rotating it invalidates existing sessions.
- A user who clears browser data, uses private browsing, explicitly logs out, changes device/browser profile, or remains inactive beyond the configured period must log in again.
- Google-hosted account selection and consent latency is external to the application. The application controls the callback and dashboard portions only.
