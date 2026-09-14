# Meta Advertisement Automatic Publication and Budget Separation

Project: REAL_QR_FIND / zezari  
Date: 2026-07-24

## Requirement
- Show an approximate Korean city/district name instead of raw GPS coordinates.
- Start Meta publication immediately after the guardian payment completes.
- Keep the guardian payment amount as service revenue.
- Calculate the Meta lifetime budget independently from region, radius, and duration.
- Preserve a manual administrator retry path when automatic publication fails.

## Region Flow
1. A guardian searches for a location or selects a point on the map.
2. Search results already contain a Korean region label.
3. Map clicks and current-location selections call `/api/maps/search?lat=...&lng=...`.
4. The server reverse-geocodes the coordinate through Nominatim.
5. The browser displays and stores a label such as `서울특별시 강남구 논현1동`.
6. Latitude and longitude remain in separate database columns only for Meta custom-location targeting.

New advertisements do not append latitude/longitude to `subject_ads.region`.

## Separated Amounts
- `subject_ads.amount`: amount paid by the guardian. This is service revenue.
- `subject_ads.meta_daily_budget`: calculated Meta daily budget.
- `subject_ads.meta_budget_amount`: Meta lifetime budget sent to the ad set.
- `subject_ads.spent_amount`: actual Meta spend when insight synchronization is connected.

The guardian payment amount is never passed to Meta as `lifetime_budget`.

## Meta Budget Formula

```text
extra radius units =
  ceil(max(0, selected radius - default radius) / extra radius unit)

daily budget before region =
  Meta base daily budget
  + extra radius units * Meta extra-radius daily budget

Meta daily budget =
  round up to KRW 100(daily budget before region * region multiplier)

Meta lifetime budget =
  Meta daily budget * advertising days
```

Default region tiers:
- 수도권: Seoul, Gyeonggi, Incheon, `120%`
- 광역시·세종: Busan, Daegu, Gwangju, Daejeon, Ulsan, Sejong, `110%`
- 일반지역: all other labels, `100%`

All budget amounts and multipliers are editable in `/admin?section=ad-pricing`.

## Payment and Publication Flow
1. Toss confirms the guardian payment, or an authenticated administrator completes the payment pass.
2. The service stores payment completion first.
3. The service claims the advertisement with `meta_publish_preparing`.
4. It uploads the saved poster and creates the Meta campaign, ad set, creative, and ad.
5. The independently calculated `meta_budget_amount` is used as `lifetime_budget`.
6. The ad set uses the saved region/country targeting, radius, selected end date, and a start time approximately one minute after publication processing begins.
7. Successful publication stores the Meta identifiers and presents the service advertisement as awaiting Meta review.
8. If Meta fails, payment remains completed, the advertisement returns to `ready`, and Meta state becomes `meta_publish_failed`.
9. The administrator can select the failed row and use `광고발행 재시도`.

`subject_ads.is_test_payment = 1` identifies a Toss-free administrator transaction for revenue reporting. It no longer suppresses Meta publication for new administrator payment-pass advertisements, so a pass can incur real Meta spend.

The claim expires after five minutes so a stalled serverless request can be retried without permanently blocking the advertisement.

## Review Status Synchronization

- `.github/workflows/meta-ad-status-sync.yml` calls `/api/cron/meta-ad-status` every five minutes.
- Vercel is on the Hobby plan, whose native cron interval cannot meet the five-minute requirement, so GitHub Actions provides the scheduler.
- Both sides use the same secret `CRON_SECRET`; the route rejects missing or invalid bearer credentials.
- Each run selects only paid, Meta-published advertisements whose Zezari status is still `ready`.
- Meta `effective_status` values `PENDING_REVIEW`, `IN_PROCESS`, and `PREAPPROVED` remain in the polling set.
- `ACTIVE` changes the Zezari status to `active` and Meta status to `ad_active`, emits the existing `ad.started` notification once, and is excluded from later runs.
- Disapproved/issue, paused, and archived/deleted results are mapped to `rejected`, `paused`, and `ended`, so they also leave the review polling set.
- API lookup failures retain the advertisement in `ready`, record a sanitized error, and retry on the next scheduled run.

## Existing Advertisement Compatibility
- Schema version is `24`.
- Existing rows were backfilled with their prior amount as a `legacy` Meta budget.
- Existing coordinate-style region labels in the production database were reverse-geocoded to city/district text while retaining the original latitude and longitude columns.
- Existing Meta identifiers and delivery state were not changed.
- Only advertisements created after this version use the new region-tier budget formula.

## Verification
- Next.js production build passed.
- Forward geocoding returned `서울특별시 강남구 논현1동` for `논현동`.
- Reverse geocoding returned `서울특별시 중구 명동` for the tested Seoul coordinate.
- Formula checks:
  - Seoul, 2 days, 7km: Meta budget `14,400 KRW`
  - Busan, 3 days, 5km: Meta budget `16,500 KRW`
  - Chuncheon, 1 day, 9km: Meta budget `7,000 KRW`
- Turso schema version `24` and all new budget columns were verified.
- Six existing production advertisement labels were converted from coordinate text to Korean city/district labels.
- Production deployment `dpl_hbiQeiAkWHhjohBNnGKtUr13ML5S` reached `READY`.
- `https://zezari.vercel.app` and its reverse-geocoding API returned HTTP 200.
- Production database verification found seven budgeted advertisements and zero coordinate-style region labels.
- No Toss payment or new live Meta advertisement was created during verification.
