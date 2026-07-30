# REAL_QR_FIND OAuth Callback Setup

## Purpose

- Primary service URL: `https://zezari.family`
- Compatibility URL: `https://zezari.vercel.app`
- Configure Google and Naver to accept login callbacks from both service domains.

## Google OAuth

The Google Cloud OAuth web client used by the application allows these production origins:

```text
https://zezari.family
https://zezari.vercel.app
```

The client allows these production callback URLs:

```text
https://zezari.family/api/auth/callback/google
https://zezari.vercel.app/api/auth/callback/google
```

The existing localhost origin and callback remain registered for local development.

## Naver Login

The Naver application uses this primary service URL:

```text
https://zezari.family
```

The application allows both production callback URLs:

```text
https://zezari.family/api/auth/callback/naver
https://zezari.vercel.app/api/auth/callback/naver
```

The Naver application is currently in the `개발 중` state. Callback validation works, but only Naver accounts registered as application members can complete login until Naver review is approved.

## Verification

- PASS: Google accepted the custom-domain callback and opened the Google account chooser for `zezari.family` without a redirect URI mismatch.
- PASS: Naver accepted the custom-domain callback and opened the `zezari` consent screen without a callback URL error.
- PASS: Existing Vercel-domain callback entries were preserved.
- PASS: No client secret, access token, or environment-variable value is recorded in this document.

## Operations

- Do not remove the `zezari.vercel.app` callbacks while direct login from the compatibility domain remains available.
- When the compatibility domain is retired, remove its provider-console callbacks only after old links and printed QR usage have been audited.
- Complete Naver Login review before offering Naver login to all public users.
