# Phone Verification Signup Integration

Project: REAL_QR_FIND

## Purpose
- Replace temporary client-generated signup verification codes with server-issued phone verification.
- Apply the same phone verification requirement to direct ID signup and first-time SNS signup completion.
- Keep NICE real-name identity verification as a later optional integration.

## User Flow
- The guardian enters a Korean mobile phone number.
- `인증코드 받기` calls `POST /api/signup/phone/send`.
- The server generates a 6-digit code, stores only a hash, and sends the code through the configured SMS adapter.
- The guardian enters the 6-digit code.
- `확인` calls `POST /api/signup/phone/verify`.
- On success, the server returns a 15-minute `phoneVerificationToken`.
- Signup completion APIs consume that token once and save `guardians.phone_verified_at`.

## Administrator Exception
- A signed-in account recognized by `ADMIN_EMAILS` or `guardians.is_admin = 1` bypasses the guardian signup-completion screen.
- Administrators are not required to enter a phone verification code merely to sign in.
- This exception changes only the post-login screen gate. It does not create a verification token or mark an unverified phone as verified.
- Administrators can enter or update optional guardian profile information later from the authenticated information screen.
- Inactive administrator records remain blocked by the existing account activation rule.

## API
- `POST /api/signup/phone/send`
  - Input: `phone`, optional `purpose`.
  - Output: `phone`, `expiresInSeconds`.
  - Behavior: rejects invalid phone numbers, already registered phone numbers, and excessive sends.
- `POST /api/signup/phone/verify`
  - Input: `phone`, `code`, optional `purpose`.
  - Output: `phone`, `phoneVerificationToken`, `expiresInSeconds`.
  - Behavior: rejects expired codes, wrong codes, and too many attempts.

## Database
- `phone_verifications`
  - Stores phone, purpose, code hash, token hash, expiry timestamps, attempts, provider, status, and audit timestamps.
  - Plain verification codes and plain verification tokens are not stored.
- `guardians.phone_verified_at`
  - Remains the final guardian-level verification marker.

## Environment Variables
```text
SMS_PROVIDER=generic
SMS_API_URL=
SMS_API_KEY=
SMS_API_SECRET=
SMS_SENDER_NO=
SMS_DEV_BYPASS_CODE=
```

- Production requires `SMS_API_URL` and `SMS_API_KEY`.
- `SMS_DEV_BYPASS_CODE` works only outside production and should not be configured on Vercel production.
- If SMS configuration is missing, the send API returns `문자 발송 설정이 필요합니다.`

## Security Rules
- Verification code length: 6 digits.
- Code expiry: 3 minutes.
- Verification token expiry: 15 minutes.
- Send limit: 5 requests per phone per hour.
- Attempt limit: 5 wrong verification attempts per code.
- Signup completion requires a valid one-time token.

## Reference Finding
- `reference/wp` did not include MShop plugin source files.
- `reference/wp.sql` showed the legacy site used MShop members, SMS, and user-certification plugins with a required phone certification field.
- The current implementation recreates that behavior in Next.js and Turso rather than porting PHP plugin internals.

### 2026-08-03 Solapi Audit
- `reference/wp` contains WordPress core files only; `wp-content/plugins` and `wp-content/mu-plugins` are absent.
- `reference/wp.tar.gz` contains 3,228 paths but zero `wp-content` or plugin paths, so the missing plugin implementation cannot be recovered from that archive.
- `reference/wp.sql` contains repeated activation/update traces for `mshop-sms-s2/mshop-sms-s2.php` and `mshop-user-certification-s2/mshop-user-certification-s2.php`.
- The SQL also retains the legacy certification identifiers `certification_for_register`, `certification_number`, and `billing_phone_certification_number`.
- Exact searches found zero occurrences of `solapi`, `coolsms`, `api.solapi.com`, and `api.coolsms.co.kr`.
- No Solapi API key name, secret name, request host, HMAC code, or message-send function is available in the supplied backup.
- Therefore the backup proves that MShop handled SMS certification, but it does not prove that Solapi was the underlying provider and cannot supply reusable Solapi credentials or request code.
