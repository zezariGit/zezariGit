# Onboarding Flow

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Purpose
- Show a three-page service introduction before the social login screen.
- Let users skip future onboarding with a `다시 보지 않기` action.

## User Flow
1. First visit while logged out:
   - Show the first service introduction page.
2. Mobile:
   - User can swipe left/right.
   - There are no Previous/Next buttons.
   - Swiping is clamped at the first and last slide.
   - All three slides keep the page indicators at the same fixed position.
3. Desktop:
   - User sees one service introduction page at a time.
   - Page indicators can select page 1, page 2, or page 3.
   - On page 3, `로그인하기` opens the login screen without permanently hiding onboarding.
4. If user clicks `다시 보지 않기`:
   - Store `zezari:onboarding:hidden=true` in browser localStorage.
   - Immediately show login screen.
   - Future visits on the same browser/device skip onboarding.
5. If user is already logged in:
   - Skip onboarding and show the signed-in state.

## Slides
- `01` QR로 연결되는 안심 서비스
- `02` 발견 즉시 연결되는 도움
- `03` 온라인 실종 광고

## Implementation Files
- `app/onboarding-gate.js`
- `app/globals.css`
- `public/images/onboarding/1.png`
- `public/images/onboarding/2.png`
- `public/images/onboarding/3.png`
- `scripts/onboarding-regression.mjs`

## Notes
- The onboarding skip state is per browser/device because it uses localStorage.
- The supplied reference screens provide the illustration artwork; headings, descriptions, dots, and buttons remain native responsive UI.
- The three indicator groups use one fixed vertical position (`742px`) and the final login button starts at `780px` in the 390x844 reference layout.

## 2026-09-07 Verification And Deployment
- `npm run test:onboarding`: passed.
- `npm run security:check`: passed.
- `npm run build`: passed with Next.js 16.3.0.
- Production browser verification confirmed indicator positions `[742, 742, 742]`, no horizontal overflow, and real pointer swipe navigation.
- Feature commits `b469ef8` and `581fd1d` were pushed to GitHub `main`.
- Vercel production deployment `dpl_C7aV1X4m3kQVz6Cr89AyAiKgMHJA` reached `READY` and owns the `https://zezari.family` alias.
- Service worker cache version was updated to `zezari-v5`.
