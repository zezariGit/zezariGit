# SNS Account Linking And Signup UI Cleanup

Project: REAL_QR_FIND

## Scope
- Close the My Page overlay immediately when the guardian selects `정보 수정`.
- Hide guardian photo upload controls from signup and profile editing.
- Remove the installed-PWA wording `앱으로 실행 중입니다.` from the service.
- Send Solapi verification messages from the registered representative number `1668-1290`.
- Replace the direct-signup input examples with the requested ZEZARI examples.
- Let an existing guardian add Google, Kakao, Naver, or Facebook login after proving ownership of the existing phone number.

## Account Linking Flow
1. A guardian signs in with a new SNS provider.
2. On `인증코드 받기`, the server checks whether the entered phone already belongs to another guardian.
3. If it does, the screen identifies the existing login provider and asks whether to connect the new SNS provider.
4. After confirmation, a six-digit SMS code is sent with purpose `social_account_link`.
5. Successful verification produces a guardian-bound, 15-minute, one-use token.
6. The server moves only the current SNS identity to the existing guardian and removes the unused incomplete placeholder account.
7. Subsequent login with either provider resolves to the same guardian, subjects, orders, subscriptions, advertisements, and notifications.

## Security Rules
- Email address alone never links accounts.
- The existing phone must be verified through Solapi before linking.
- The link token is hashed, purpose-bound, guardian-bound, expires after 15 minutes, and is consumed once.
- A completed or actively used secondary guardian account is not merged automatically; customer support is required.
- Provider identity uses the unique provider account ID, not display name or email.
- Provider keys, secrets, access tokens, and SMS verification codes are excluded from this document and Git.

## Database
- Schema version: 42.
- New table: `guardian_social_accounts`.
- Unique identity: `(provider, provider_account_id)`.
- Existing Google, Kakao, Naver, and Facebook guardian keys are migrated into the mapping table without changing their guardian records.

## User Interface
- My Page `정보 수정` closes the overlay before the guardian information screen is shown.
- Guardian photo upload is no longer shown in profile editing; signup did not contain a guardian photo uploader and remains hidden.
- Installed PWA mode no longer renders an explanatory line.
- Signup examples are `제자리`, `zezari@zeazri.com`, and `zezari` as requested.

## Verification
- `npm run test:social-link`: isolated Google-to-Naver linking regression passed.
- `npm run test:qr-claim`: QR signup claim regression passed.
- `npm run security:check`: security regression passed.
- `npm run build`: Next.js production build passed.
- `git diff --check`: passed.
- Vercel deployment `dpl_7pA6mZaGfpu6ZHFxDZR8U3XpjEvF` reached `READY` and was aliased to `https://zezari.family`.
- Production UI confirmed that `정보 수정` closes My Page and opens `/?tab=guardian#guardian-info`, with no guardian photo upload, installed-mode wording, or browser console error.
- Production Turso confirmed schema version 42, the social-account table, and 13 migrated identity mappings.

## Operations
- Keep `SOLAPI_SENDER_NUMBER=16681290` in local and Vercel environments.
- The number must remain registered and approved in the Solapi sender-number console.
- Account-linking production tests should use a controlled test member because linking changes the real guardian identity map.
