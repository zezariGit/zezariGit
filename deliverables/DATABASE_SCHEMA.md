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
| `photo_data_url` | TEXT | Uploaded image as data URL |
| `photo_name` | TEXT | Original uploaded file name |
| `created_at` | TEXT | Created timestamp |
| `updated_at` | TEXT | Updated timestamp |

## Access Rules
- Dashboard data is loaded only after Google login.
- A guardian can only query/update subjects where `subjects.guardian_id` belongs to the logged-in guardian.
- Server-side save logic limits each guardian to 4 subjects.

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
