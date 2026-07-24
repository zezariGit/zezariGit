# Location Share Management

Project: REAL_QR_FIND / zezari
Date: 2026-06-25

## Requirement
- Add a `위치공유 관리` menu and administrator page.
- Add a `위치공유` button to the public QR find page.
- When a finder presses the button, ask for mobile/browser location permission and save the detected latitude/longitude.
- Send the guardian a push notification that includes a map link when the managed subject is found.
- Let administrators review location-share history in a grid and detail panel.

## Public QR Flow
1. Finder scans an assigned QR code and opens `/find/{public_key}`.
2. The page must already be active:
   - QR is enabled.
   - QR has been activated by the owning guardian.
   - The linked guardian has an active paid service period.
3. Finder optionally enters:
   - finder contact phone
   - short location description/address memo
4. Finder presses `위치공유`.
5. Browser asks for location permission through the standard Geolocation API.
6. Server validates the QR/service state again, stores the location history, and sends a guardian push notification when push is configured.

## Guardian Notification
- Notification title: `{관리대상 이름} 발견 위치가 공유되었습니다`
- Notification body displays the finder contact first and the location next:
  - `연락처: 010-0000-0000 · 위치: 서울 송파구 ...`
  - if the finder contact is empty, `연락처 미입력` is displayed.
- The primary notification click URL is the Kakao map link when generated, with the Naver map link as fallback.
- The in-app bell notification list renders URL text as clickable links and also shows a `지도 열기` action button.
- The service worker opens external map URLs in a new browser window when the system push notification is clicked.
- If the guardian has no registered push device, the location is still stored and the finder receives a message that no guardian push device is registered yet.

## Administrator Screen
- Admin opens `/admin?section=locations`.
- The left admin menu includes `위치공유 관리`.
- The page uses the same master/detail grid style as the other administrator operations screens.
- Filters:
  - integrated search by subject name, guardian name, finder contact, or address memo
  - share start date
  - share end date
- Grid columns:
  - 공유일시
  - 대상자
  - 보호자
  - 발견자 연락처
  - 주소
  - 위도
  - 경도
- Selecting a row opens a right detail panel with:
  - map preview
  - Kakao/Naver map links
  - coordinates and accuracy
  - linked subject and guardian admin pages
  - safe phone and finder contact

## Database Change
- `DB_SCHEMA_VERSION` increased from `7` to `8`.
- New table: `location_shares`

| Column | Purpose |
| --- | --- |
| `id` | Location-share history ID |
| `qr_id` | QR code that opened the public page |
| `guardian_id` | Guardian to notify |
| `subject_id` | Managed subject found |
| `public_key` | QR public key snapshot |
| `subject_name` | Subject name snapshot |
| `guardian_name` | Guardian name snapshot |
| `guardian_safe_phone` | Safe phone snapshot, not raw private phone |
| `finder_contact` | Optional finder contact entered on the public page |
| `address_label` | Optional finder-entered location description |
| `latitude` | Browser-provided latitude |
| `longitude` | Browser-provided longitude |
| `accuracy` | Browser-provided accuracy in meters |
| `kakao_map_url` | Generated Kakao map link |
| `naver_map_url` | Generated Naver map link |
| `user_agent` | Finder browser user-agent snapshot |
| `ip_address` | Request IP snapshot from forwarding headers |
| `created_at` | Share timestamp |

Indexes:
- `idx_location_shares_created_at`
- `idx_location_shares_guardian_id`

## Files Changed
- `lib/db.js`
- `lib/push.js`
- `public/sw.js`
- `app/notification-bell.js`
- `app/api/find/[key]/location/route.js`
- `app/find/[key]/location-share-button.js`
- `app/find/[key]/page.js`
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`

## Privacy Notes
- Raw guardian private phone numbers are not stored in `location_shares`.
- The table stores the guardian safe/relay phone snapshot only.
- Public QR pages must hide personal information when the QR is inactive, not activated, paused, expired, or unpaid.
- Location is sensitive information. Before full-scale production use, add service terms text explaining that location, approximate accuracy, finder contact, user-agent, and request IP may be stored for guardian response and administrator audit.
- Real address reverse geocoding is not connected yet. The current address field is a finder-entered memo plus map links.
- Finder contact is included in the guardian notification because the finder entered it for direct response. The public page should make this purpose clear before launch.

## Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors except expected Windows LF/CRLF warnings.
- Local Next dev server on port `3010` returned HTTP 200 for `/` and `/admin?section=locations`.
- `POST /api/find/__codex_missing_key__/location` returned HTTP 400 with `등록되지 않은 QR입니다.`, confirming the route loads and reaches QR validation.
- Notification link bugfix build succeeded after changing the primary map URL to Naver-first and rendering in-app notification links as anchors.
- Mobile field verification showed Kakao map coordinates open accurately, so the notification click URL was changed back to Kakao-map-first and the bell action label now shows `카카오맵 열기`.
- `agent-browser` CLI was not available in PATH, so browser visual automation could not be run in this environment.
- Manual browser verification should include:
  - inactive/unpaid QR cannot submit location
  - active QR shows `위치공유`
  - denied browser location permission shows a friendly error
  - successful API call inserts a `location_shares` row
  - admin `위치공유 관리` list and detail panel render the row
  - push-notification history stores the map URL

## Time Spent
- QR public button, geolocation API route, DB schema, push notification, admin grid/detail screen, styling, documentation, and build verification: about 40 minutes.

## Image Generation Prompt
Create a clean Korean civic-tech admin and public QR workflow diagram for "REAL_QR_FIND" location sharing. Show a finder scanning `/find/{QR key}`, pressing "위치공유", granting mobile location permission, and sending a guardian push notification with Kakao and Naver map links. Show the administrator left sidebar with "위치공유 관리" selected, a date/search filter, a dense grid with columns "공유일시, 대상자, 보호자, 발견자 연락처, 주소, 위도, 경도", and a right detail panel with a map preview and coordinates. Include Turso table `location_shares`, Web Push, and privacy notes that raw guardian phone numbers are not exposed. Use white work surfaces, civic blue accents, purple location pins, green successful share states, compact Korean labels, and no real personal data.
