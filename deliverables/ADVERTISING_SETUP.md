# Advertising Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented as an internal advertising request and status-management foundation.
- Meta Marketing API campaign-level integration is connected for admin approval, pause, and resume buttons.
- Guardian pause/resume/end buttons also sync to Meta when a campaign ID already exists.
- Payment integration for advertisement placement is not connected yet.

## User Flow
1. A logged-in guardian opens the dashboard.
2. Each registered managed subject card shows an `광고` button.
3. Clicking `광고` opens a modal overlay and disables the main screen behind it.
4. The guardian enters:
   - advertising center location by clicking the map or using current device location
   - advertising radius in kilometers
   - start date
   - end date
5. The modal calculates:
   - inclusive advertising days
   - daily rate from admin settings
   - estimated total amount
6. Saving creates a `subject_ads` row with status `active`.
7. If an advertisement is running, the modal shows:
   - `일시정지`
   - `광고끝내기`
8. If an advertisement is paused, the modal shows:
   - `광고 재개`
   - `광고끝내기`

## Admin Flow
1. Admin opens `/admin?section=ads`.
2. Admin can update the advertising daily unit price.
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

## Meta Marketing API Integration
- Server-side module: `lib/meta-marketing.js`
- Runtime environment variables:
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_ACCESS_TOKEN`
  - `META_AD_ACCOUNT_ID`
  - Optional: `META_API_VERSION`, defaults to `v23.0`
  - Optional: `META_CAMPAIGN_OBJECTIVE`, defaults to `OUTCOME_AWARENESS`
- `subject_ads.meta_campaign_id` stores the Meta campaign ID returned from the Campaigns API.
- `subject_ads.meta_status` stores the latest local integration state:
  - `campaign_active`
  - `campaign_paused`
  - `campaign_not_created`
  - `campaign_ended_paused`
  - `meta_api_pending`
- Current integration scope:
  - Campaign create
  - Campaign active/pause status update
  - Campaign ID and integration status persistence
- Meta campaign creation explicitly sends `is_adset_budget_sharing_enabled=false` because the current first-stage integration does not create campaign-budget optimization/ad set budget sharing.
- Map-selected ad locations can be converted to Meta targeting with `buildMetaCustomLocationTargeting()`:
  - `geo_locations.custom_locations[].latitude`
  - `geo_locations.custom_locations[].longitude`
  - `geo_locations.custom_locations[].radius`
  - `geo_locations.custom_locations[].distance_unit = kilometer`
- Next Meta integration scope:
  - Ad set creation
  - Ad creative creation from the missing-person ad content
  - Page/Instagram actor configuration
  - targeting, budget, and schedule mapping
  - webhook or polling sync for Meta delivery status, impressions, reach, spend, and click count
  - structured storage for Meta error code/message if needed

## Verification
- `npm run build` succeeded.
- Vercel production/development environment variables were updated for populated Meta keys without printing secret values.
- Safe Meta account access check succeeded against the configured ad account.
- Meta campaign creation validation with `execution_options=["validate_only"]` succeeded after adding `is_adset_budget_sharing_enabled=false`.
- `npm run build` succeeded after the map-based advertisement region selection change.
- Full campaign creation was not executed during verification to avoid creating an unwanted live Meta campaign object.
