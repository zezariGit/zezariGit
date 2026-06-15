# Advertising Setup

Project: REAL_QR_FIND / zezari

## Status
- Implemented as an internal advertising request and status-management foundation.
- Meta API integration is not connected yet.
- Payment integration for advertisement placement is not connected yet.

## User Flow
1. A logged-in guardian opens the dashboard.
2. Each registered managed subject card shows an `광고` button.
3. Clicking `광고` opens a modal overlay and disables the main screen behind it.
4. The guardian enters:
   - advertising region
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
3. Admin can view user advertisement progress as a grid:
   - guardian
   - managed subject
   - advertising region
   - period
   - days
   - daily rate
   - total amount
   - internal status
   - Meta API status placeholder

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

## Meta API Preparation
- `subject_ads.meta_campaign_id` is reserved for Meta campaign/ad set identifiers.
- `subject_ads.meta_status` currently stores `meta_api_pending`.
- Future API integration should add:
  - Meta access token environment variables
  - campaign creation API call
  - pause/resume API call
  - stop/delete API call
  - webhook or polling sync for Meta delivery status
  - error code/message columns if needed

## Verification
- `npm run build` succeeded.
- Turso verification:
  - `ad_settings.default.daily_rate = 10000`
  - `subject_ads` table exists and currently has `0` rows.
