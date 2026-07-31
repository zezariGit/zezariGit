# Naver Login Review Resubmission

## Status

- Application: `zezari`
- Review request date: 2026-07-31 KST
- Naver Developer status: `검수요청`
- Primary service domain: `https://zezari.family`
- Compatibility domain: `https://zezari.vercel.app`

## Rejection Reasons Addressed

1. The earlier approved `제자리` application and the new `zezari` application appeared to use the same member system.
2. The first-time Naver signup screen requested a separate service password.

## Implementation

- The earlier `zezari.com` member data is not migrated to or shared with the new `zezari.family` application.
- The two applications are operated as independent member systems.
- Naver first signup no longer asks for a service login ID or password.
- The Naver identity is used for subsequent sign-in.
- First signup now collects only phone verification, required guardian information, and required agreements.
- Existing credential-based signup still retains its own password requirements.
- Existing registered social users continue directly to the dashboard.

## Callback URLs

- `https://zezari.family/api/auth/callback/naver`
- `https://zezari.vercel.app/api/auth/callback/naver`
- `http://localhost:3011/api/auth/callback/naver` was temporarily registered for isolated review-flow verification.

## Submitted Explanation

> 기존 승인 애플리케이션(제자리/zezari.com)의 연동 회원정보는 신규 애플리케이션(zezari/zezari.family)으로 이관하거나 공유하지 않으며, 서로 독립된 다른 회원체계로 운영합니다. 따라서 애플리케이션이 변경되어도 이용자 식별에 특이사항이 없다는 점을 소명합니다. 또한 네이버 로그인 신규 가입 과정에서 별도 아이디와 비밀번호 입력 항목을 제거했습니다. 이용자는 네이버 이용자 식별값으로 로그인하며, 휴대폰 인증과 서비스 필수정보 및 약관 동의만 진행합니다. 수정된 단계별 화면을 첨부합니다.

## Review Screenshots

- `naver-review/01-login-naver-button.png`: login screen with the Naver button.
- `naver-review/03-phone-verification.png`: Naver first-signup phone verification.
- `naver-review/04-profile-no-password.png`: Naver profile completion without login ID or password fields.

The screenshots contain only synthetic review data and no provider credentials, tokens, or real phone numbers.

## Verification

- Actual Naver authorization consent completed against the registered local callback.
- The callback returned to the application and displayed the Naver first-signup phone step.
- Server-side phone issuance and verification reached the profile step in an isolated local database.
- The profile screen displayed the explicit notice that no separate ID or password is created.
- `npm run build` passed with all application routes.
- The functional source commit was pushed to GitHub before the review request.
- Naver Developer changed from `승인거부` to `검수요청` with request date `2026.07.31`.

## Follow-up

- Wait for the Naver review result.
- After approval, test first signup with a non-member account and returning-user login on `https://zezari.family`.
- Remove the temporary localhost callback when review troubleshooting no longer needs it.

