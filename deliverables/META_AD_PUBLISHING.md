# Meta Missing-Person Advertisement Publishing

Project: REAL_QR_FIND / zezari

## Goal
- Turn the guardian's missing-person preview into the exact bitmap submitted to Meta.
- Publish the paid request with its selected period, map center, radius, and budget.
- Start publication automatically after payment while keeping an administrator retry action.

## Implemented Flow
1. The guardian selects the map center, radius, and end date.
2. The browser displays the final missing-person poster.
3. Clicking `결제하기` captures that poster as a 1080px JPEG before the server creates the advertisement request.
4. The JPEG is stored in `subject_ad_creatives`; the operational grid only reads a small `has_creative_image` flag.
5. After payment, the server immediately claims the request for automatic publication.
6. The server validates Meta settings before creating any campaign.
7. The server uploads the JPEG and creates a paused campaign, ad set, creative, and ad.
8. The ad set receives the independently calculated Meta lifetime budget, selected dates, latitude, longitude, and radius.
9. Only after all four objects exist are campaign, ad set, and ad changed to `ACTIVE`.
10. A failed publication preserves payment and can be retried with `광고발행 재시도`.
11. Pause/resume actions update all existing Meta objects.

## Required Server Variables
- `META_APP_ID`
- `META_APP_SECRET`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `META_PAGE_ID`
- Optional `META_API_VERSION` (`v23.0` default)
- Optional `META_CAMPAIGN_OBJECTIVE` (`OUTCOME_AWARENESS` default)
- Optional `META_OPTIMIZATION_GOAL` (`REACH` default)

Never expose these values in client code, logs, screenshots, Git, or documentation.

## Current Readiness Result
- Business portfolio: `제자리zezari` (`594205283097084`).
- Facebook Page: `제자리` (`480121825189746`), assigned to the system user for ads and insights.
- Ad account: `ZEZARI` (`604475922197751`), active, KRW, Asia/Seoul, and funding-source data present.
- Meta app: `qr-find-ads` (`1005400915800540`), connected to the same business and ad account.
- System user: `Conversions API System User` (`61571172351536`).
- System-user token permissions: `ads_management`, `ads_read`, and `business_management`.
- Token and real ad-account access: passed.
- Image upload: passed.
- Paused campaign creation: passed.
- Paused ad-set creation with a 3km custom location, schedule, and lifetime budget: passed.
- Page-backed creative creation: passed.
- Paused ad creation: passed after the business operator accepted Meta's anti-discrimination policy.
- Active ad submission and review: passed.
- Ads Manager delivery display: passed (`활동 중`).
- Disposable campaign, ad set, creative, and image cleanup: passed. No delivery or spend occurred.
- `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, and `META_PAGE_ID` were updated locally and in Vercel Production without exposing secret values.
- Facebook Login was added to the app so the Page permissions are available with standard access.
- The deprecated `standard_enhancements` creative field was removed after Meta returned subcode `3858504`.

The Page object cannot be read directly with the system-user token because that token does not expose `pages_read_engagement`. This does not block Page-backed ad creative creation: the real paused creative write succeeded with the assigned Page ID.

## 2026-07-24 Active Test Result
- The business operator accepted Meta's anti-discrimination policy.
- A synthetic API connectivity advertisement was created against the real `ZEZARI` ad account.
- Campaign ID: `120255991903620550`.
- Ad-set ID: `120255991907990550`.
- Creative ID: `1746203396451350`.
- Ad ID: `120255991909750550`.
- Targeting: Seoul center, 1km radius, age 18+.
- Lifetime budget: KRW 2,000.
- Campaign, ad set, and ad were submitted as `ACTIVE`.
- Meta review progressed from `IN_PROCESS` to `PENDING_REVIEW` and then `ACTIVE`.
- Ads Manager displayed the selected advertisement as `활동 중`.
- The test was paused immediately after delivery verification. Campaign and ad set are retained in Meta for audit, with `PAUSED` configured status.
- No impressions or spend had been reported when the test was paused.

There are no remaining Meta asset, token, Page, funding-source, policy, or API compatibility blockers for administrator-approved advertisements.

## 2026-07-24 Site Approval Flow Verification
- Service advertisement: `AD-50934FB359`.
- Service record ID: `50934fb3-5958-41f1-add9-9f6cd2d80986`.
- Service status: `active`.
- Stored Meta status: `ad_active`.
- Campaign ID: `120255992127740550`.
- Ad-set ID: `120255992128520550`.
- Creative ID: `1043259211453331`.
- Ad ID: `120255992129580550`.
- Meta campaign, ad set, and ad all returned configured and effective status `ACTIVE`.
- Ads Manager displayed the advertisement as `예약됨` before its scheduled start.
- Scheduled delivery: 2026-07-24 22:41:50 KST through 23:59:59 KST.
- Lifetime budget: KRW 10,000.
- Targeting: 5km around latitude `37.506757`, longitude `127.128897`.
- No Meta issue or publication error was returned.
- Insights were empty before the scheduled start, which is expected. After delivery starts, verify the Ads Manager delivery column changes to `활동 중` and confirm impressions, reach, and spend.

## Safety Rules
- Automated verification creates only `PAUSED` resources unless the operator explicitly authorizes an active delivery test.
- Explicit active tests use a small capped lifetime budget and are paused immediately after delivery-state verification.
- Test resources are deleted immediately.
- A paid guardian advertisement starts Meta publication automatically without administrator approval.
- The guardian payment amount is stored as revenue and is never reused as the Meta lifetime budget.
- Meta budget is calculated separately from region tier, radius, and duration.
- Partial Meta identifiers and a sanitized error are retained when a downstream API step fails.
- Existing advertisements created before this version do not contain a captured poster; they must be re-created through the updated application flow before full publication.

## Future Work
- Meta webhook or scheduled insight synchronization.
- Store effective delivery/review status separately from configured status.
- Reconcile reach, impressions, clicks, spend, and contact conversions.
- Add scheduled retry and operator alerts for repeated publication failures.
