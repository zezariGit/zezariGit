# Solapi SMS Phone Verification

Project: REAL_QR_FIND

## Current Status
- Solapi SMS is the active identity check for direct signup and first-time SNS signup.
- A guardian must verify every newly entered contact phone number before profile storage.
- Resend email verification remains in source as a disabled fallback and is not shown in the active signup UI.
- Administrators with an existing completed account are not forced through signup verification merely to sign in.

## User Flows

### Direct and SNS Signup
1. The guardian enters a Korean mobile phone number.
2. `POST /api/signup/phone/send` creates and sends a six-digit SMS code.
3. `POST /api/signup/phone/verify` verifies the code and returns a 15-minute one-time `phoneVerificationToken`.
4. `/api/signup/guardian` or `/api/signup/complete` consumes the token before saving the account.
5. The server records `guardians.phone_verified_at`.

SNS-provided name and email values are still prefilled. The phone verification requirement is identical for direct and first-time SNS signup.

### Guardian Contact Number Change
1. The signed-in guardian changes `연락받을 전화번호` on the guardian information screen.
2. The phone component requests a code with purpose `guardian_phone_change`.
3. The issued verification row is bound to the signed-in guardian ID.
4. Profile saving consumes the one-time token and updates the phone plus `phone_verified_at`.
5. Saving an unverified changed number, a duplicate number, an expired token, or another guardian's token is rejected.

An unchanged current phone does not require another verification.

## API
- `POST /api/signup/phone/send`
  - Input: `phone`, `purpose` (`signup` or `guardian_phone_change`).
  - Output: normalized `phone`, `expiresInSeconds`.
  - The change purpose requires an authenticated guardian session.
- `POST /api/signup/phone/verify`
  - Input: `phone`, `code`, `purpose`.
  - Output: `phoneVerificationToken`, `expiresInSeconds`.
  - The token is usable once and only for the same phone, purpose, and guardian binding.

## Solapi Adapter
- Package: `solapi` Node.js SDK.
- The SDK is called only from the server through `lib/sms.js`.
- Recipient and sender numbers are normalized to digits only.
- The Solapi group ID is retained as `provider_message_id` for operational tracing.
- Signup and phone-change messages use distinct labels.

Official reference: https://solapi.com/developers/sdk/nodejs-sendingexample

## Database
- Schema version: 34.
- `phone_verifications`
  - `guardian_id`: binds authenticated phone-change requests to one guardian.
  - `phone`, `purpose`, `code_hash`, `token_hash`.
  - code/token expiries, verification/consumption timestamps, attempts, send count.
  - `provider`, `provider_message_id`, status, audit timestamps.
- Plain verification codes, tokens, and Solapi credentials are never stored in the database.

## Environment Variables
```text
SIGNUP_SMS_VERIFICATION_ENABLED=true
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER_NUMBER=
SMS_DEV_BYPASS_CODE=

SIGNUP_EMAIL_VERIFICATION_ENABLED=false
```

- The Solapi key, secret, and sender number are server-only.
- `SMS_DEV_BYPASS_CODE` works only when `NODE_ENV` is not `production`; it must not be configured in Vercel Production.
- The registered sender number must remain active in the Solapi console.
- Vercel serverless outbound IPs are not fixed, so the Solapi key was configured for all IPs. Key secrecy and server-only use are therefore mandatory.

## Security Rules
- Code length: six digits.
- Code expiry: three minutes.
- Verification token expiry: 15 minutes.
- Send limit: five requests per phone and purpose per hour.
- Attempt limit: five incorrect attempts per issued code.
- Existing guardian phone numbers cannot be reused by another account.
- Every token is hashed, guardian/purpose scoped, and consumed once.

## Verification Record
- Next.js production build passed with all phone and email fallback routes.
- Isolated API tests passed for invalid phone, send, wrong code, successful verification, token-required signup, token reuse rejection, and disabled email route.
- Authenticated guardian tests passed for phone-change send/verify/save and unverified save rejection.
- Mobile signup UI showed all six code inputs on one line.
- Solapi accepted and completed one real API SMS with one success and zero failures.

## Operations
- Monitor Solapi balance, sender-number expiry, and message logs.
- Rotate a leaked key immediately in Solapi and Vercel.
- Never place credentials in Git, screenshots, logs, deliverables, or browser-side code.
