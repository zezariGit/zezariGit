# Solapi SMS Phone Verification Release

## Requirement
- Restore SMS verification for direct and SNS signup.
- Require a fresh SMS verification whenever a guardian changes the contact phone number.
- Integrate the existing Solapi account with Vercel without exposing provider credentials.
- Retain the Resend email implementation but keep it hidden and disabled.

## Implementation
- Added the official Solapi Node.js SDK and a server-only adapter in `lib/sms.js`.
- Activated `/api/signup/phone/send` and `/api/signup/phone/verify`.
- Added guardian-bound `guardian_phone_change` verification purpose.
- Added a six-box verification control to the guardian information screen.
- Added DB audit fields for guardian binding and Solapi message group IDs.
- Increased the database schema version to 34 with an existing-database-safe migration order.

## Configuration
- Local and Vercel Production/Development environments use encrypted `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, and `SOLAPI_SENDER_NUMBER` values.
- `SIGNUP_SMS_VERIFICATION_ENABLED=true`.
- `SIGNUP_EMAIL_VERIFICATION_ENABLED=false`.
- No credential values are included in this artifact.

## Test Evidence
- Solapi real API SMS: completed, one success, zero failures.
- Direct signup API: token required and one-time use verified.
- SNS-compatible authenticated signup path: guardian-bound verification supported.
- Guardian phone change: authenticated send/verify/save passed; save without verification rejected.
- Email fallback routes: HTTP 410 while disabled.
- Mobile layout: six verification inputs remain on one line.
- Production build and whitespace checks passed.
- Vercel production deployment `dpl_HGbV2Y5p79PHwwu5moLiSZYJrQ2m` reached `READY`.
- `https://zezari.family` and `https://zezari.vercel.app` returned HTTP 200.
- The legacy `zezari.vercel.app` alias was found pinned to a two-day-old deployment and was reassigned to the latest production deployment; its API flags and guardian phone-verification UI then matched `zezari.family`.
- Production Turso reported schema version 34 with both new columns and the guardian verification index.
- Production email verification returned HTTP 410 and invalid SMS input returned HTTP 400, confirming the active route flags and validation order.
- Production browser verification confirmed SMS-first copy, six code inputs on one row, no horizontal overflow, and no Next.js error overlay.

## Operating Notes
- Keep the Solapi sender number verified and funded.
- The production sender is the registered ZEZARI representative number `1668-1290`.
- Check the Solapi message log when users report delivery failures.
- Rotate the API key and update Vercel immediately if exposure is suspected.
- Official Node.js reference: https://solapi.com/developers/sdk/nodejs-sendingexample
