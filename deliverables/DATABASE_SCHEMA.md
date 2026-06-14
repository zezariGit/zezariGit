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
| `google_id` | TEXT | Unique Google user key |
| `google_email` | TEXT | Email from Google login |
| `name` | TEXT | Guardian name |
| `login_id` | TEXT | Guardian-chosen app ID |
| `password_hash` | TEXT | PBKDF2 password hash, never plaintext |
| `phone` | TEXT | Contact phone number |
| `email` | TEXT | Contact email |
| `is_active` | INTEGER | `1` active, `0` inactive |
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
| `is_active` | INTEGER | `1` active, `0` inactive |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

## Access Rules
- Dashboard data is loaded only after Google login.
- A guardian can only query/update subjects where `subjects.guardian_id` belongs to the logged-in guardian.
- Server-side save logic limits each guardian to 4 subjects.
- Subject status is stored per subject and shown on the guardian dashboard.
- Admin users can list guardians and activate/deactivate them.
- Admin users can list QR codes, generate additional unique QR codes, and activate/deactivate each QR.
- Public find pages can read QR status by `public_key` without login, but guardian/subject personal data is not exposed in this phase.

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

## Dashboard Flow
- Logged-in guardians enter the dashboard route first.
- The top menu order is:
  - `대시보드`
  - `정보입력`
- `정보입력` contains guardian and subject edit forms.
- `대시보드` contains the status overview for the logged-in guardian.
