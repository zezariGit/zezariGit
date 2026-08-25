# REAL_QR_FIND Green Theme And Dashboard Interactions

## Purpose

This deliverable records the user-facing green design system and the dashboard interaction rules introduced on 2026-08-25.

## Design Tokens

- Primary: `#26963f`
- Primary dark: `#176b2c`
- Primary light: `#eef9f0`
- Primary border: `#9dcea8`
- Page background: `#f5f8f5`
- Surface: `#ffffff`
- Main text: `#17231a`
- Warning and danger colors remain amber and red so workflow states stay distinguishable.
- PWA browser chrome and manifest theme color use the same primary green.

The source of truth is `css/gov-style.css`. Existing pages that use the common `--c-*` tokens inherit the green palette without page-specific color duplication.

## Dashboard Quick Actions

- `실종신고`: opens `/missing-report`.
- `상품 구매`: opens `/shop`.
- `고객지원`: opens the KakaoTalk channel chat in a new external tab.
- The top-right gear continues to open My Page. The duplicate bottom `내 정보` action was removed.

## Subject Status Actions

The dashboard continues to show one canonical status per subject.

| Status | Dashboard behavior |
| --- | --- |
| 상품구매필요 | Clickable. Opens `/shop?subject={subjectId}` and preselects that subject. |
| QR활성화필요 | Clickable. Opens the subject's `/find/{publicKey}` QR activation page. |
| 안전 | Informational badge only. |
| 찾는중 | Informational badge only. |

The subject photo/name area remains a separate link to the authenticated guardian preview. This avoids nested links and prevents the status action from being confused with subject editing.

## Notification Detail

- The generic `관련 화면 열기` action was removed from in-app notification items.
- The associated client URL validation and label routing helpers were removed.
- Explicit URLs contained in the message body, including Kakao Map links, remain clickable.
- Push notification destination data remains stored for operating-system notification clicks; only the redundant in-app generic button was removed.

## Verification

- `npm run build`
- `npm run security:check`
- `git diff --check`
- Responsive browser verification at desktop and mobile widths
- Production verification on `https://zezari.family`

