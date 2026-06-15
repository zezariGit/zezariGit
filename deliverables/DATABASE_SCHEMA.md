# Database Schema

Project: REAL_QR_FIND / zezari

## Status
- Implemented in Turso.

## Tables

### guardians

Stores one guardian profile per logged-in Google user.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `google_id` | TEXT | Legacy column name; stores unique social login user key |
| `google_email` | TEXT | Legacy column name; stores email from social login |
| `name` | TEXT | Guardian name |
| `login_id` | TEXT | Guardian-chosen app ID |
| `password_hash` | TEXT | PBKDF2 password hash, never plaintext |
| `phone` | TEXT | Contact phone number |
| `address` | TEXT | Guardian contact address shown on assigned QR find page |
| `email` | TEXT | Contact email |
| `is_active` | INTEGER | `1` active, `0` inactive |
| `is_admin` | INTEGER | `1` DB administrator, `0` normal guardian |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### subjects

Stores target/person records belonging to a guardian.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Foreign key to `guardians.id` |
| `name` | TEXT | Subject name |
| `birth_date` | TEXT | Date input value |
| `gender` | TEXT | Selected gender |
| `status` | TEXT | Current status: `문제없음`, `찾는중`, `QR활성화필요` |
| `photo_data_url` | TEXT | Uploaded image as data URL |
| `photo_name` | TEXT | Original uploaded file name |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### qr_codes

Stores QR codes and the unique public strings used as the final segment of people-finding URLs.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `code` | TEXT | Unique administrator-facing QR code label, e.g. `ZRF-XXXX-XXXX` |
| `public_key` | TEXT | Unique URL-safe string used in `/find/{public_key}` |
| `target_url` | TEXT | Full generated finding URL at creation time |
| `guardian_id` | TEXT | Assigned guardian ID, nullable until a subject is matched |
| `subject_id` | TEXT | Assigned subject ID, unique and nullable |
| `is_active` | INTEGER | `1` active, `0` inactive |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### push_subscriptions

Stores browser push subscriptions for logged-in guardians.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Guardian receiving push notifications |
| `endpoint` | TEXT | Browser push endpoint, unique |
| `subscription_json` | TEXT | Full Push API subscription JSON |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### subscriptions

Stores Toss Payments subscription/billing state for a guardian.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Unique guardian ID |
| `customer_key` | TEXT | Toss billing customer key mapped to the guardian |
| `billing_key` | TEXT | Toss billing key, server-side only |
| `status` | TEXT | `ready`, `active`, `failed`, etc. |
| `plan_name` | TEXT | Subscription plan identifier |
| `plan_months` | INTEGER | Selected plan duration: `1`, `3`, or `6` |
| `amount` | INTEGER | Subscription amount in KRW |
| `currency` | TEXT | Currency, currently `KRW` |
| `current_period_start` | TEXT | Current subscription period start |
| `current_period_end` | TEXT | Current subscription period end |
| `paused_at` | TEXT | Last pause timestamp |
| `resumed_at` | TEXT | Last resume timestamp |
| `last_order_id` | TEXT | Last Toss billing order ID |
| `last_payment_key` | TEXT | Last Toss payment key |
| `last_payment_status` | TEXT | Last Toss payment status |
| `error_code` | TEXT | Last Toss or app error code |
| `error_message` | TEXT | Last Toss or app error message |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### subscription_plans

Stores administrator-managed subscription plan prices.

| Column | Type | Notes |
| --- | --- | --- |
| `months` | INTEGER | Primary key: `1`, `3`, or `6` |
| `name` | TEXT | Plan display name |
| `amount` | INTEGER | Plan amount in KRW |
| `is_active` | INTEGER | `1` active, `0` inactive |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### ad_settings

Stores administrator-managed advertising pricing.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key, current singleton row is `default` |
| `daily_rate` | INTEGER | Advertising daily unit price in KRW |
| `currency` | TEXT | Currency, currently `KRW` |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### subject_ads

Stores advertisement requests and status by managed subject.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Guardian who owns the subject |
| `subject_id` | TEXT | Managed subject being advertised |
| `region` | TEXT | User-entered advertising region |
| `start_date` | TEXT | Advertising start date |
| `end_date` | TEXT | Advertising end date |
| `days` | INTEGER | Inclusive advertising day count |
| `daily_rate` | INTEGER | Daily rate captured at request time |
| `amount` | INTEGER | `days * daily_rate` |
| `currency` | TEXT | Currency, currently `KRW` |
| `status` | TEXT | `ready`, `active`, `paused`, `ended` |
| `meta_campaign_id` | TEXT | Reserved Meta API campaign identifier |
| `meta_status` | TEXT | Reserved Meta API status, currently `meta_api_pending` |
| `paused_at` | TEXT | Last pause timestamp |
| `ended_at` | TEXT | End timestamp |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

## Access Rules
- Dashboard data is loaded only after social login.
- A guardian can only query/update subjects where `subjects.guardian_id` belongs to the logged-in guardian.
- Server-side save logic limits each guardian to 4 subjects.
- Subject status is stored per subject and shown on the guardian dashboard.
- Admin users can list guardians and activate/deactivate them.
- Admin users can grant or revoke DB admin role for registered guardians.
- Admin users can list QR codes, generate additional unique QR codes, and activate/deactivate each QR.
- Admin users can filter QR codes by matching status and activation status.
- Admin users can manually assign, change, or clear a QR-to-subject match.
- Manual assignment clears any previous QR assignment for the selected subject before assigning it to the selected QR.
- Manual match search only returns subjects with no current QR assignment.
- Logged-in guardians can view assigned QR code details for their own subjects.
- Public find pages can read QR status by `public_key` without login.
- When a QR is assigned to a subject, the public find page shows subject basic information and guardian contact information so the finder can respond.
- Each subject receives one QR assignment. Because each guardian can register up to 4 subjects, one guardian can have up to 4 assigned QR codes.
- Logged-in guardians can register a browser push subscription from the dashboard.
- Public find pages can call the notification API to send a push message to the assigned guardian.
- Privacy note: public QR pages intentionally expose configured subject/contact fields. Before production launch, add explicit guardian consent and a field-level exposure policy.
- Logged-in guardians can start Toss Payments subscription billing from the dashboard.
- Subscription is marked active only after server-side Toss billing API succeeds.
- Logged-in guardians can pause/resume their own subscription service state.
- Admin users can edit 1/3/6-month subscription option prices.
- Logged-in guardians can open an advertisement modal per managed subject.
- Advertisement request amount is calculated from admin daily rate and selected inclusive date range.
- Logged-in guardians can pause, resume, or end only their own subject advertisements.
- Admin users can edit the global advertisement daily rate.
- Admin users can list advertisement progress by guardian and managed subject.
- Meta API fields are reserved but external Meta calls are not connected yet.

## Upload Rules
- Photo file must be an image.
- Photo size is limited to 1MB.
- Current implementation stores image data URLs in Turso for speed of early development.
- Future production hardening may move images to object storage and keep only URLs in Turso.

## Verification
- Turso connection verified.
- Tables verified:
  - `guardians`
  - `subjects`
  - `qr_codes`
  - `subscriptions`
  - `subscription_plans`
  - `push_subscriptions`
  - `ad_settings`
  - `subject_ads`

## Dashboard Flow
- Logged-in guardians enter the dashboard route first.
- The top menu order is:
  - `대시보드`
  - `정보입력`
- `정보입력` contains guardian and subject edit forms.
- `대시보드` contains the status overview for the logged-in guardian.
