# REAL_QR_FIND Production Function Test

- Test date: 2026-07-22 KST
- Target: `https://zezari.vercel.app`
- Method: production HTTP/API checks, OAuth initiation checks, Vercel runtime logs, local production build, and read-only Turso queries
- Safety: no real payment, advertisement approval, QR activation, bulk message, data save, update, or delete was executed

## Overall Result

The core deployment, authentication provider configuration, database connection, access-control APIs, PWA assets, map search, and QR privacy gates are operating. The production service is not ready for a completely new signup flow because the SMS provider environment variables are missing. Kakao message delivery is also not configured.

The VS Code browser tab containing the signed-in account was not exposed as a controllable Codex in-app browser. Authenticated visual/button testing remains a separate required pass.

## Verified Working

| Area | Result | Evidence |
| --- | --- | --- |
| Home | PASS | Production home returned HTTP 200. |
| OAuth providers | PASS | Google, Kakao, Naver, and Facebook initiated HTTPS OAuth flows to their correct provider hosts. |
| Invalid credentials | PASS | Invalid ID/password returned 401 and created no session. |
| Protected APIs | PASS | Notifications, Toss setup, product orders, subscription changes, push registration, and payment preparation returned 401 without a session. |
| Input validation | PASS | Empty map search and invalid signup payloads returned 400 without creating valid data. |
| Map search | PASS | `논현동` returned three candidates with labels and `lat`/`lng` coordinates. |
| PWA | PASS | Manifest, service worker, 192/512 icons, and maskable icon returned 200 with correct content types. |
| Web Push configuration | PASS | The public VAPID key endpoint returned a configured key. |
| Production build | PASS | `npm run build` completed with all 24 routes generated. |
| Runtime errors | PASS | No 5xx response appeared in the Vercel log window used for this test. |
| Turso connection | PASS | Database connection succeeded and schema version matched source version 18. |
| Database schema | PASS | All 22 expected application tables were present. |
| Data integrity | PASS | No orphan guardian/subject/QR/subscription/design/order/ad/location rows, duplicate QR identifiers, QR guardian mismatch, or guardian over the four-subject limit were found. |
| QR URL domain | PASS | All 30 stored QR target URLs use `zezari.vercel.app`. |
| QR privacy | PASS | Unmatched QR shows the unmatched notice. Matched QR records without usable subscription access do not expose subject names or raw guardian phone numbers. |

## Production Data Snapshot

The snapshot contains aggregate counts only and no personal data.

- Guardians: 10
- Subjects: 3
- QR codes: 30
- QR matched: 3
- QR activated: 2
- Subscriptions: 1
- Products: 4
- Product designs: 17
- Product orders: 20
- Coupons: 1
- Guardian notifications: 15
- Subject advertisements: 4
- Location shares: 5

## Findings

### Critical - Production SMS Signup Is Not Configured

Vercel has none of the required production variables:

- `SMS_PROVIDER`
- `SMS_API_URL`
- `SMS_API_KEY`
- `SMS_API_SECRET`
- `SMS_SENDER_NO`

The application requires server-verified phone authentication for new direct and SNS signups. A completely new user cannot finish the production signup flow until an SMS provider is connected.

### High - Kakao Message Delivery Is Not Configured

The Kakao channel exists in administrator message management, but Vercel has no Kakao message API URL, API key/REST key, sender key, or sender number. Web Push is configured; Kakao delivery will not operate until a contracted Kakao notification/message provider is connected.

### Medium - Product Design Images Are Incomplete

All four products have active design rows, but only two of 17 active designs contain an uploaded option image and none contain an uploaded detail-page image. Most user design selections and preview pages will therefore use fallback visuals or have no uploaded detailed image.

### Medium - Legacy Order Amount Breakdown Is Not Backfilled

Nineteen existing orders have a valid total `amount` but retain `subtotal_amount = 0` and `discount_amount = 0`. Current order creation calculates these fields correctly, but old order detail/report screens can show an incomplete product/discount breakdown unless the historical rows are backfilled.

### Low - Lint Script Is Obsolete

`npm run lint` executes `next lint`. Next.js 16 no longer supports that command, so linting fails before examining source files. Replace the script with ESLint CLI configuration.

### Low - Invalid QR API Status Is Inconsistent

An invalid QR returns 404 from the finder notification API but 400 from the location-share API. Both reject safely and write no location data, but a consistent 404 response would simplify client error handling.

## Configured External Integrations

- Core Turso/NextAuth/public URL variables: configured
- Google, Kakao, Naver, Facebook login variables: configured
- Web Push VAPID variables: configured
- Toss payment widget variables: configured
- Meta access token and ad account variable names: configured
- SMS provider: not configured
- Kakao message provider: not configured

Configured variable names do not prove that a paid external transaction will succeed. Actual Toss payment, Meta campaign creation, SMS delivery, and Kakao message delivery require controlled live tests.

## Authenticated Browser Test Still Required

The following items require a controllable signed-in browser session and were not claimed as passed:

- Guardian dashboard rendering and tab switching
- Guardian information edit, Kakao address search, and detail-address save
- Subject registration/edit, photo upload, voice recording, and QR completion screen
- Notification panel read/swipe-delete behavior
- My Page links, payment/subscription history, coupons, and saved payment method UI
- Product/design selection, coupon recalculation, shipping address, and Toss widget rendering
- Missing-report subject state routing and advertisement preview/checkout
- All administrator menu grids, filters, detail tabs, internal scroll areas, and Excel downloads
- Order carrier/tracking save and guardian tracking display
- QR assignment modal/download/activation controls
- Notification/template save and send controls
- Meta advertisement approval/pause/resume calls

## Recommended Order

1. Configure and test the production SMS provider.
2. Connect a Kakao message provider or temporarily hide the unavailable Kakao channel.
3. Upload option and detail images for every active product design.
4. Backfill legacy order subtotal/discount fields.
5. Replace `next lint` with ESLint CLI.
6. Run the authenticated browser checklist using a browser session that Codex can control.
