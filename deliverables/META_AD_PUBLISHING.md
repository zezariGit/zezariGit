# Meta Missing-Person Advertisement Publishing

Project: REAL_QR_FIND / zezari

## Goal
- Turn the guardian's missing-person preview into the exact bitmap submitted to Meta.
- Publish the paid request with its selected period, map center, radius, and budget.
- Keep publication behind the existing administrator approval action.

## Implemented Flow
1. The guardian selects the map center, radius, and end date.
2. The browser displays the final missing-person poster.
3. Clicking `결제하기` captures that poster as a 1080px JPEG before the server creates the advertisement request.
4. The JPEG is stored in `subject_ad_creatives`; the operational grid only reads a small `has_creative_image` flag.
5. After payment, an administrator selects the advertisement and clicks `광고승인`.
6. The server validates Meta settings before creating any campaign.
7. The server uploads the JPEG and creates a paused campaign, ad set, creative, and ad.
8. The ad set receives the paid lifetime budget, selected dates, latitude, longitude, and radius.
9. Only after all four objects exist are campaign, ad set, and ad changed to `ACTIVE`.
10. Pause/resume actions update all existing Meta objects.

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
- Token validity: passed.
- Token/app match: passed.
- `ads_management`: granted.
- Configured KRW ad account: active and accessible.
- Image upload: passed.
- Paused campaign create: passed.
- Paused ad set create with a 3km custom location: passed.
- Test campaign and image cleanup: passed.
- Page-backed creative/ad create: blocked by configuration.

The checked ad account currently returns zero connected Facebook Pages and `.env.local` has an empty `META_PAGE_ID`. This is not a source-code failure. Meta requires a Page identity in `object_story_spec.page_id`.

### 2026-07-24 Business Connection Audit
- Ad account: active (`account_status = 1`), KRW, Asia/Seoul, no disable reason.
- Ad-account user access: one user is readable.
- Facebook Page connected for promotion: zero.
- Pages readable from the current user token: zero.
- Instagram account connected to the ad account: zero.
- Funding source/payment method: not configured according to the ad-account API.
- Existing campaign: one active campaign.
- Existing ad sets and ads: zero; account insights contain no spend, impressions, or clicks.
- `META_PAGE_ID`: not configured locally.
- Missing token permissions for setup inspection: `pages_show_list` and `business_management`.
- The in-app browser tab was not exposed to the coding browser connection, so this audit used authenticated Graph API responses.

### Screenshot Follow-up
- The supplied Business Settings screenshot shows `계정 > 앱 > qr-find-ads > 연결된 자산`.
- The single connected asset is the `ZEZARI` ad account.
- This confirms the Meta app-to-ad-account connection, but it does not connect a Facebook Page.
- A fresh Graph API check still returned zero `promote_pages`, zero user Pages, zero Instagram accounts, and an empty `META_PAGE_ID`.
- The next console location is `계정 > 페이지`, not `계정 > 앱`.

## One Remaining Meta Console Task
1. Create or select the official zezari Facebook Page.
2. Assign that Page to the same Business Portfolio and ad account with advertising permission.
3. Assign a funding source/payment method to the ad account.
4. Generate/confirm a token with `ads_management`, `pages_manage_ads`, `pages_show_list`, and `business_management`.
5. Put the numeric Page ID in local `META_PAGE_ID`.
6. Add the same variable to Vercel Production and redeploy.

The application now stops with a Korean setup error before campaign creation when this requirement is missing, preventing orphaned campaign objects.

## Safety Rules
- Automated verification creates only `PAUSED` resources.
- Test resources are deleted immediately.
- A real guardian advertisement becomes active only through the administrator approval command.
- Partial Meta identifiers and a sanitized error are retained when a downstream API step fails.
- Existing advertisements created before this version do not contain a captured poster; they must be re-created through the updated application flow before full publication.

## Future Work
- Meta webhook or scheduled insight synchronization.
- Store effective delivery/review status separately from configured status.
- Reconcile reach, impressions, clicks, spend, and contact conversions.
- Add an administrator retry action for failed publications after configuration is corrected.
