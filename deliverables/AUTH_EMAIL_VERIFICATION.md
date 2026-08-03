# Email Verification Signup Integration

Project: REAL_QR_FIND

## Current Status
- Resend email verification is retained as a disabled fallback as of 2026-08-03.
- `SIGNUP_EMAIL_VERIFICATION_ENABLED=false` makes both email verification routes return HTTP 410.
- Active direct and first-time SNS signup uses Solapi SMS as documented in `AUTH_PHONE_VERIFICATION.md`.
- The implementation and Vercel Resend variables are preserved for a controlled rollback; the active UI does not call these routes.

## Retained Fallback Flow
1. The guardian enters or confirms an email address.
2. `POST /api/signup/email/send` validates duplicates and request limits, creates a 6-digit code, stores only its hash, and sends it through Resend.
3. The guardian enters the 6-digit code within 3 minutes.
4. `POST /api/signup/email/verify` validates the code and returns a 15-minute one-time `emailVerificationToken`.
5. `/api/signup/guardian` or `/api/signup/complete` consumes the token before saving the account.
6. The verified email timestamp is stored in `guardians.email_verified_at`.

This flow is not active while `SIGNUP_EMAIL_VERIFICATION_ENABLED=false`.

## APIs
- `POST /api/signup/email/send`
  - Input: `email`, optional `purpose`.
  - Output: normalized `email`, `expiresInSeconds`.
  - Limits: five sends per email per hour.
- `POST /api/signup/email/verify`
  - Input: `email`, `code`, optional `purpose`.
  - Output: `emailVerificationToken`, `expiresInSeconds`.
  - Limits: five incorrect attempts per issued code.
- `/api/signup/phone/send` and `/api/signup/phone/verify`
  - Are the active Solapi SMS routes.
  - Support both signup and authenticated guardian contact-number changes.

## Database
- `email_verifications`
  - Stores normalized email, code hash, token hash, expiries, attempts, provider message ID, state, and audit timestamps.
  - Plain verification codes and tokens are never stored.
- `guardians.email_verified_at`
  - Marks completion of the active email verification flow.
- Existing completed accounts with `phone_verified_at` are migrated to an email-verified-compatible state when they already have an email, preventing forced re-registration.

## Vercel and Resend Environment
```text
RESEND_API_KEY=
RESEND_EMAIL_DOMAIN=zezari.family
RESEND_FROM_EMAIL=제자리 <auth@zezari.family>
EMAIL_DEV_BYPASS_CODE=
SIGNUP_EMAIL_VERIFICATION_ENABLED=false
```

- `RESEND_API_KEY` is server-only and should be provisioned through the Vercel Resend Marketplace integration or stored as an encrypted Vercel environment variable.
- The Vercel Marketplace integration provisions `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` for Production and Development.
- When `RESEND_FROM_EMAIL` is omitted, the app sends from `제자리 <auth@RESEND_EMAIL_DOMAIN>`; an explicit sender override must still use a Resend-verified domain.
- `EMAIL_DEV_BYPASS_CODE` works only when `NODE_ENV` is not `production`; never configure it in Vercel Production.
- A missing Resend key or sender returns `이메일 발송 설정이 필요합니다.` without exposing provider details.

## Email Content
- Subject contains the six-digit code for quick recognition.
- HTML and text alternatives are both sent.
- The message states the 3-minute expiry and advises recipients to ignore requests they did not make.

## Verification Results
- `npm run build`: passed on Next.js 16.2.11; both email API routes were included in the production route manifest.
- Isolated local DB/API test:
  - email send request: passed in development bypass mode;
  - incorrect code: HTTP 400;
  - valid code: one-time token issued;
  - signup without token: HTTP 400;
  - signup with valid token: completed;
  - legacy SMS send route: HTTP 410.
- 390 x 844 browser check: email field and all six code inputs render on one line, SMS signup copy is absent, and no framework error overlay is present.
- GitHub commit `d2b7836` was deployed as Vercel production deployment `dpl_CkVxJSMgepWKW9mg3BirYDj8eoZb` with status `READY`.
- Both `https://zezari.family` and `https://zezari.vercel.app` returned HTTP 200 after deployment.
- The production email send route returned HTTP 200 and `devMode:false` for Resend's official `delivered@resend.dev` test recipient.
- The production legacy SMS send route returned HTTP 410, and the production signup page had zero captured console errors.
- Security patch updates applied: Next.js 16.2.9 to 16.2.11 and NextAuth 4.24.14 to 4.24.15. This removed the direct Next.js and NextAuth advisories reported against the previous versions.
- `npm audit --omit=dev` still reports three indirect high findings in Next.js-bundled PostCSS/Sharp dependencies; the audit tool currently offers no compatible forward patch for this Next.js line, so they remain tracked rather than forcing a breaking downgrade.

## External Setup Status
- Vercel Resend Marketplace free resource `zezari-email` is installed and connected to the `zezari` project for Production and Development.
- Vercel provisioned encrypted `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` variables.
- Production delivery is verified after deployment through the provider-backed signup send API test recorded in the handoff log.

## Primary References
- Resend Send Email API: https://resend.com/docs/api-reference/emails/send-email
- Vercel Resend integration: https://vercel.com/integrations/resend
