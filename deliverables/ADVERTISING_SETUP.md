# Advertising Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented as an internal advertising request and status-management foundation.
- Meta Marketing API campaign-level integration is connected for admin approval, pause, and resume buttons.
- Guardian pause/resume/end buttons also sync to Meta when a campaign ID already exists.
- Advertisement creative preview and payment-entry screen are prepared.
- Toss Payments advertisement checkout is connected through the payment widget.
- Payment completion stores the Toss order ID, payment key, payment method, and paid timestamp on `subject_ads`.

## User Flow
1. A logged-in guardian opens the dashboard.
2. Each registered managed subject card shows an `광고` button.
3. Clicking `광고` opens a modal overlay and disables the main screen behind it.
4. The guardian enters:
   - optional location search keyword such as `논현동` or `서울 강남구`
   - selected location from the search result list, when used
   - advertising center location by clicking the map or using current device location
   - advertising radius in kilometers
   - fixed current-date start
   - selected end date
5. The modal calculates:
   - inclusive advertising days
   - billing-day blocks from admin settings
   - included default radius and extra-radius units
   - period amount, range amount, and total amount
6. The guardian selects `확인`.
7. The modal changes to a missing-person advertisement preview:
   - managed subject photo
   - name, age, gender
   - guardian message
   - QR code
   - managed subject info page link
   - contact guidance text: `발견즉시 연락부탁드립니다 / qr을 스캔하시면 보호자에게 연락할 수 있습니다`
8. Selecting `결제하기` creates a `subject_ads` row with status `ready` and moves to `/ads/checkout/[id]`.
9. The checkout page shows the advertisement payment card:
   - cost breakdown
   - estimated impressions
   - notices
   - Toss payment widget
   - bottom payment button
10. On successful Toss confirmation, the advertisement stores payment details and remains `ready` for admin approval and Meta registration.
11. If an advertisement is running, the modal shows:
   - `일시정지`
   - `광고끝내기`
12. If an advertisement is paused, the modal shows:
   - `광고 재개`
   - `광고끝내기`

## Admin Flow
1. Admin opens `/admin?section=ad-pricing` to configure billing-day and radius pricing.
2. Admin opens `/admin?section=ads` to manage advertisement progress and Meta operations.
3. Admin can search and filter advertisement progress:
   - search by advertisement ID, managed subject, guardian, phone, or email
   - filter by all, approval waiting, advertising, paused, or expired
4. Admin can view user advertisement progress as a grid:
   - advertisement number
   - managed subject
   - guardian
   - status
   - advertising region
   - period
   - total amount
   - click count
5. Admin can select one advertisement and use:
   - `광고승인`: creates a Meta campaign when no campaign ID exists, or sets the existing campaign to `ACTIVE`.
   - `광고정지`: sets the existing Meta campaign to `PAUSED`.
   - `광고재개`: sets the existing Meta campaign to `ACTIVE`, or creates a campaign if the existing ad has no campaign ID.
   - `광고상세정보`
6. The detail panel shows the selected advertisement, guardian, subject, Meta campaign placeholder, Meta API status, registration time, and update time.

## Database

### `ad_settings`
- Stores global advertising pricing.
- Current row:
  - `id = default`
  - `daily_rate`
  - `billing_unit_days`
  - `default_radius_km`
  - `extra_radius_unit_km`
  - `extra_radius_price`
  - `currency = KRW`

### `subject_ads`
- Stores subject-level advertisement requests.
- One subject can have only one currently running internal ad state:
  - `ready`
  - `active`
  - `paused`
- Ended ads remain as history with `status = ended`.
- Map targeting fields:
  - `region`: human-readable selected location label
  - `region_latitude`: selected map center latitude
  - `region_longitude`: selected map center longitude
  - `region_radius_km`: selected radius in kilometers
  - `region_source`: currently `map`
- Payment fields:
  - `payment_method`: selected/confirmed Toss payment method label
  - `toss_order_id`: Toss order ID used for advertisement payment
  - `payment_key`: Toss payment key after successful confirmation
  - `paid_at`: advertisement payment completion timestamp
- Pricing snapshot fields preserve the amount shown when the advertisement was created:
  - billing unit and base price
  - default radius and extra-radius unit/price
  - period and range amount breakdown
  - pricing version

## Toss Payments Advertisement Checkout
- Client component: `app/ad-payment-client.js`
- Prepare API: `POST /api/payments/toss/ad/prepare`
- Success callback: `/payments/toss/ad/success`
- Fail callback: `/payments/toss/ad/fail`
- Server confirmation uses `confirmWidgetPayment()` before storing `paid_at`.
- Successful payment does not directly publish Meta ads. It leaves the ad in `ready` so admin approval and Meta campaign/ad creation remain controlled.

## Meta Marketing API Integration
- Server-side module: `lib/meta-marketing.js`
- Runtime environment variables:
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_ACCESS_TOKEN`
  - `META_AD_ACCOUNT_ID`
  - `META_PAGE_ID` (required; Facebook Page connected to the ad account)
  - Optional: `META_API_VERSION`, defaults to `v23.0`
  - Optional: `META_CAMPAIGN_OBJECTIVE`, defaults to `OUTCOME_AWARENESS`
  - Optional: `META_OPTIMIZATION_GOAL`, defaults to `REACH`
- Meta object identifiers are stored separately:
  - `subject_ads.meta_campaign_id`
  - `subject_ads.meta_adset_id`
  - `subject_ads.meta_creative_id`
  - `subject_ads.meta_ad_id`
  - `subject_ads.meta_image_hash`
- `subject_ads.meta_last_error` stores the latest sanitized API error and `meta_published_at` records first successful publication.
- `subject_ad_creatives` stores the JPEG captured from the guardian's missing-person advertisement preview.
- `subject_ads.meta_status` stores the latest local integration state:
  - `ad_active`
  - `ad_paused`
  - `ad_ended_paused`
  - `meta_publish_preparing`
  - `meta_publish_failed`
  - `meta_api_access_blocked`
  - `meta_api_pending`
- Current integration scope:
  - Browser preview capture to a 1080px JPEG before advertisement checkout
  - Meta image upload
  - Paused campaign creation
  - Ad set creation with lifetime budget, period, and map radius
  - Page-backed link ad creative creation
  - Paused ad creation
  - Campaign, ad set, and ad activation after all objects are ready
  - Pause/resume propagation to all created Meta objects
- Meta campaign creation sends `is_adset_budget_sharing_enabled=false`; the paid amount is assigned as the ad set lifetime budget.
- `buildMetaCustomLocationTargeting()` maps the guardian selection to:
  - `geo_locations.custom_locations[].latitude`
  - `geo_locations.custom_locations[].longitude`
  - `geo_locations.custom_locations[].radius`
  - `geo_locations.custom_locations[].distance_unit = kilometer`
  - `geo_locations.location_types = ["home", "recent"]`
- Location search endpoint:
  - `GET /api/maps/search?query=...`
  - currently uses OpenStreetMap Nominatim with Korean result priority and no project API key
  - can be replaced later with Kakao/Naver/Google Places if higher production search throughput is required
- Required operation before live publication:
  - Create or select a Facebook Page.
  - Assign the Page to the configured ad account/business with advertising permission.
  - Add the numeric Page ID as `META_PAGE_ID` locally and in Vercel Production.
  - The current checked account returned zero `promote_pages`, so publication intentionally stops before creating any campaign until this condition is met.
- Next Meta integration scope:
  - webhook or polling sync for Meta delivery status, impressions, reach, spend, and click count

## Verification
- `npm run build` succeeded.
- Vercel Production variables were updated for the four populated Meta keys without printing secret values.
- The configured user token is valid, belongs to the configured app, and has `ads_management`.
- The configured KRW/Asia-Seoul ad account is active and accessible.
- A disposable test image, paused campaign, and paused ad set with 3km custom-location targeting were created successfully and then deleted; no live delivery or spend occurred.
- Creative/ad creation was not attempted because `META_PAGE_ID` is empty and the ad account has no connected Page. The application now reports this condition before any production campaign object is created.
