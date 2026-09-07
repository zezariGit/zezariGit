# Phone Password Reset Flow

Project: REAL_QR_FIND

## User Flow
1. The guardian selects `비밀번호 찾기` on the credentials login screen.
2. The phone input keeps digits only and formats a valid mobile number with hyphens.
3. `인증코드 받기` is enabled only for a valid Korean mobile number.
4. The server sends a six-digit Solapi code and starts a three-minute timer.
5. All six code positions must be filled before `확인` is enabled.
6. `인증번호 재전송` supersedes every pending, sent, or verified password-reset request for the same guardian and starts a new three-minute timer.
7. Successful phone verification replaces the verification area with new-password inputs in the same panel.
8. The password must contain a letter, number, and special character and be at least eight characters long. The client shows each condition while typing.
9. Successful password change returns to the login panel and prefills the recovered login ID.

## API
- `POST /api/auth/password-reset/phone/send`
  - Input: `phone`.
  - Requires an active credentials guardian with the same registered phone.
- `POST /api/auth/password-reset/phone/verify`
  - Input: `phone`, six-digit `code`.
  - Returns a 15-minute `passwordResetToken`.
- `POST /api/auth/password-reset/complete`
  - Input: `phone`, `passwordResetToken`, `newPassword`.
  - Consumes the token once, updates the password hash, and clears failed-login lock records for the account.

Every response uses `Cache-Control: no-store` through the shared security headers.

## Security Rules
- Verification purpose is isolated as `password_reset`; signup, administrator testing, phone changes, and SNS account linking cannot reuse its records.
- Only active guardians with an existing login ID and password are eligible. SNS-only accounts continue to use their SNS provider.
- Codes expire after three minutes and allow at most five incorrect attempts.
- Tokens are random, hashed in storage, guardian-bound, expire after 15 minutes, and are consumed once.
- A resend invalidates the previous code and any unconsumed verified reset token.
- Existing requester limits remain three sends per five minutes and ten per hour; the phone limit remains five per hour for password reset.
- Passwords are stored only through the existing password hashing function and are never logged or returned.

## Verification
- `npm run test:password-reset`: passed for account lookup, resend superseding, wrong-code rejection, verified-token superseding, password policy, old-password rejection, new-password login, and token reuse rejection.
- `npm run test:sms-provider`: passed.
- `npm run test:admin-phone-otp`: passed.
- `npm run test:social-link`: passed.
- `npm run security:check`: passed.
- `npm run build`: passed with Next.js 16.3.0 and all three password-reset API routes.
- Local 390px browser verification showed no horizontal overflow or framework overlay.
- Production browser verification confirmed the password-reset entry, invalid/valid phone button states, and zero console errors without sending an SMS.

## Deployment
- Feature commit: `38d628f`.
- Vercel production deployment: `dpl_8UXzr7YeUzqa3WCe6mHEVVbZrQ6k`.
- Canonical domain: `https://zezari.family`.
