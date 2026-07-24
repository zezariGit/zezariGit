# Advertisement Pricing Management

Project: REAL_QR_FIND / zezari  
Date: 2026-07-24

## Requirement
- Add a dedicated administrator menu named `광고결제 관리`.
- Let administrators configure advertising price by billing-day unit.
- Let administrators configure the included default advertising radius.
- Charge an additional amount for each configured radius unit beyond the default.
- Fix the guardian advertisement start date to the current Korean date.
- Let the guardian choose only the end date, map location, and advertising radius.
- Display the same price breakdown on the application modal and Toss checkout page.
- Configure Meta execution budget independently from the guardian payment amount.

## Admin Screen
- URL: `/admin?section=ad-pricing`
- Fields:
  - `과금 일수`: select box, 1 to 30 days
  - `기본 금액`: numeric KRW input
  - `기본 광고 범위`: numeric radius from 1km to 80km
  - `초과 범위 단위`: select box, 1km to 20km
  - `단위별 추가 금액`: numeric KRW input
  - `Meta 일 기본예산`: numeric KRW input
  - `Meta 초과 반경 단위별 일 추가예산`: numeric KRW input
  - `수도권/광역시·세종/일반지역 가중치`: percentage inputs
- The form shows a live example and the calculation formula before saving.
- Saved settings apply only to advertisements created afterward. Existing advertisement amounts remain unchanged.

## Calculation

```text
billing blocks = ceil(selected days / billing unit days)
extra radius units = ceil(max(0, selected radius - default radius) / extra radius unit)
period amount = billing blocks * base price
range amount = billing blocks * extra radius units * extra radius price
total amount = period amount + range amount
```

Example:
- Billing unit: 1 day
- Base price: 10,000 KRW
- Default radius: 5km
- Extra unit: 2km
- Extra unit price: 10,000 KRW
- Guardian selection: 2 days, 7km
- Result: `2 * (10,000 + 1 * 10,000) = 40,000 KRW`

## Guardian Flow
1. Guardian selects a managed subject and opens the online missing advertisement modal.
2. Start date is displayed as the current date and cannot be edited.
3. Guardian selects only the end date.
4. Guardian searches/selects the advertising center on the map.
5. Radius options are generated from the administrator's default radius and extra-radius unit.
6. The modal displays:
   - policy summary
   - inclusive advertising days
   - period base amount
   - range additional amount
   - total payment amount
7. Preview and Toss checkout use the stored server-calculated amount.

## Server Validation
- The server ignores a submitted start date and always uses the current KST date.
- Maximum advertising period is 365 days.
- The server calculates the amount again from the active administrator policy.
- Each advertisement stores a pricing snapshot and breakdown.
- Toss payment preparation recalculates pricing-version 2 advertisements and rejects a mismatched stored amount.

## Database
- Schema version: `24`
- `ad_settings` adds:
  - `billing_unit_days`
  - `default_radius_km`
  - `extra_radius_unit_km`
  - `extra_radius_price`
- `subject_ads` adds pricing snapshot and breakdown fields:
  - `billing_unit_days`
  - `default_radius_km`
  - `extra_radius_unit_km`
  - `extra_radius_price`
  - `billing_blocks`
  - `extra_radius_units`
  - `period_amount`
  - `range_amount`
  - `pricing_version`
  - `meta_daily_budget`
  - `meta_budget_amount`
  - `meta_region_tier`
  - `meta_region_multiplier_percent`
  - `meta_budget_version`

## Verification
- Next.js production build succeeded.
- Formula test returned 40,000 KRW for 2 days and 7km under the example policy.
- Turso schema version `24` and all payment/Meta budget columns were verified.
- Default persisted policy was verified as 1 day / 10,000 KRW / 5km / 2km / 10,000 KRW.

## Image Generation Prompt
Create a Korean civic-tech administrator and guardian workflow diagram for "REAL_QR_FIND" advertisement pricing. On the left, show a dark navy admin sidebar with "광고결제 관리" selected and a white pricing form containing "과금 일수 1일", "기본 금액 10,000원", "기본 광고 범위 5km", and "초과 2km당 10,000원". In the center, show the formula "과금 묶음 수 × (기본 금액 + 초과 범위 단위 수 × 추가 금액)". On the right, show a guardian mobile advertisement form with today's start date fixed, an end-date picker, map location, a 7km radius selector, and a breakdown for 2 days: period 20,000원, range 20,000원, total 40,000원. Use the existing REAL_QR_FIND style with white work surfaces, thin gray lines, civic blue and restrained purple actions, compact Korean labels, no gradients, and no real personal data.
