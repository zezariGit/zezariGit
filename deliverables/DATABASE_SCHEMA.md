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
| `phone` | TEXT | Private guardian contact phone number, not shown on public QR pages |
| `safe_phone` | TEXT | Public QR page safe/relay phone number, nullable until issued |
| `address` | TEXT | Guardian contact address shown on assigned QR find page |
| `birth_date` | TEXT | Guardian birth date captured during direct signup or profile edit |
| `phone_verified_at` | TEXT | Timestamp when phone verification was completed during direct signup |
| `terms_privacy_agreed_at` | TEXT | Timestamp for required privacy collection/use agreement |
| `terms_service_agreed_at` | TEXT | Timestamp for required service terms agreement |
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
| `guardian_message` | TEXT | Guardian-written message shown on the assigned public QR page |
| `voice_data_url` | TEXT | Guardian recorded audio message as an audio data URL |
| `voice_name` | TEXT | Stored audio display/file name |
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
| `activated_at` | TEXT | Guardian activation timestamp after physical product receipt |
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

### guardian_notifications

Stores push notification message history for each logged-in guardian.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Guardian who can read this notification |
| `title` | TEXT | Notification title, e.g. `{관리대상 이름}을 찾았습니다` |
| `body` | TEXT | Notification body message |
| `url` | TEXT | Related app or QR find URL |
| `read_at` | TEXT | Read timestamp, nullable until the guardian opens the notification panel |
| `created_at` | TEXT | Created timestamp |

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

### products

Stores administrator-managed products shown on the user product selection page.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key, seeded as `product-sticker`, `product-bracelet`, `product-necklace`, `product-keyring` |
| `slug` | TEXT | Unique product slug |
| `name` | TEXT | Product display name |
| `description` | TEXT | Optional admin-entered product description |
| `image_data_url` | TEXT | Admin-uploaded product image data URL |
| `image_name` | TEXT | Uploaded image filename |
| `unit_price` | INTEGER | Standalone product unit price in KRW |
| `is_active` | INTEGER | `1` visible to users, `0` hidden |
| `sort_order` | INTEGER | Product display order |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

### product_orders

Stores product selections and standalone purchase requests.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT | Primary key |
| `guardian_id` | TEXT | Guardian placing the selection/order |
| `subject_id` | TEXT | Managed subject linked to the product |
| `product_id` | TEXT | Selected product |
| `quantity` | INTEGER | Selected quantity |
| `order_type` | TEXT | `subscription` or `standalone` |
| `plan_months` | INTEGER | Subscription period when `order_type = subscription` |
| `design_index` | INTEGER | Selected design index on the product detail screen |
| `shipping_address` | TEXT | Delivery address entered during order information step |
| `payment_method` | TEXT | Selected Toss payment method, currently `CARD` |
| `toss_order_id` | TEXT | Toss order ID used for payment request |
| `payment_key` | TEXT | Toss payment key after successful payment |
| `amount` | INTEGER | Expected payment amount |
| `status` | TEXT | `payment_pending`, `paid`, `paid_waiting_activation`, or `activated` |
| `paid_at` | TEXT | Payment completion timestamp |
| `activated_at` | TEXT | QR/service activation timestamp |
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
| `click_count` | INTEGER | Meta/reporting click count placeholder, defaults to `0` |
| `paused_at` | TEXT | Last pause timestamp |
| `ended_at` | TEXT | End timestamp |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

## Access Rules
- Dashboard data is loaded only after social login or guardian ID/password login.
- New guardians can sign up before login through the direct signup flow: phone verification step, profile input step, and completion step.
- Direct signup stores guardian name, phone, birth date, app login ID, password hash, phone verification timestamp, and required terms agreement timestamps.
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
- When a QR is assigned to a subject but `qr_codes.activated_at` is empty, the public find page hides managed-subject information.
- Only the logged-in owning guardian can activate an assigned QR from the public QR page after receiving the physical product.
- QR activation sets `qr_codes.activated_at`; if the guardian has a paid subscription in `ready` status, activation starts the subscription period.
- When a QR is assigned and activated, the public find page shows subject basic information and configured guardian response fields so the finder can respond.
- Subject records can include a guardian message and guardian recorded audio. The public QR page shows/plays those values when present.
- Public QR pages must not expose `guardians.phone`; they show `guardians.safe_phone` as the safe/relay number when available, or `안심번호 준비중` when not available.
- Each subject receives one QR assignment. Because each guardian can register up to 4 subjects, one guardian can have up to 4 assigned QR codes.
- Logged-in guardians can register a browser push subscription from the dashboard.
- Public find pages can call the notification API to send a push message to the assigned guardian.
- The push notification message is also stored in `guardian_notifications` so the guardian can review messages from the top-left bell notification panel.
- Privacy note: public QR pages intentionally expose configured subject/contact fields. Raw guardian phone numbers are private; before production launch, connect a real safe-number provider and add explicit guardian consent and a field-level exposure policy.
- Dashboard no longer starts new subscription billing directly; the dashboard product purchase button now opens `/shop`.
- Logged-in guardians select a product, target subject, quantity, and subscription period from `/shop`.
- A subscription checkout from `/shop` stores the product selection as a `product_orders` row with `payment_pending`.
- Subscription payment completion from `/shop` stores the order as `paid_waiting_activation`; the subscription remains `ready` until QR activation.
- Product standalone purchase is only accepted for guardians with `subscriptions.status = active` and uses Toss product payment confirmation.
- Admin users can manage product images, prices, activation state, and display order from the admin product management section.
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
  - `products`
  - `product_orders`
  - `push_subscriptions`
  - `guardian_notifications`
  - `ad_settings`
  - `subject_ads`

## Dashboard Flow
- Logged-in guardians enter the dashboard route first.
- The top menu order is:
  - `대시보드`
  - `정보입력`
- `정보입력` contains guardian and subject edit forms.
- `대시보드` contains the status overview for the logged-in guardian.
