# Onboarding Flow

Project: REAL_QR_FIND / zezari

## Status
- Implemented.

## Purpose
- Show a three-page service introduction before the social login screen.
- Let users skip future onboarding with a "다시보지 않기" action.

## User Flow
1. First visit while logged out:
   - Show the first service introduction page.
2. Mobile:
   - User can swipe left/right.
   - User can use Previous/Next buttons.
   - Last slide button changes to `로그인 시작`.
3. Desktop:
   - User sees one service introduction page at a time.
   - User can move through page 1, page 2, and page 3 with controls.
   - After page 3, `로그인 시작` opens the login screen.
4. If user clicks `다시보지 않기`:
   - Store `zezari:onboarding:hidden=true` in browser localStorage.
   - Immediately show login screen.
   - Future visits on the same browser/device skip onboarding.
5. If user is already logged in:
   - Skip onboarding and show the signed-in state.

## Slides
- `01` QR로 연결되는 안심 서비스
- `02` 실종 발생 시 빠른 대응
- `03` 온라인 실종 공고

## Implementation Files
- `app/onboarding-gate.js`
- `app/page.js`
- `app/globals.css`
- `public/sw.js`

## Notes
- The onboarding skip state is per browser/device because it uses localStorage.
- Service worker cache version was updated to `zezari-v5`.
