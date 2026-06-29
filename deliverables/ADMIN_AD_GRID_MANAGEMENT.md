# Admin Advertisement Grid Management

Project: REAL_QR_FIND / zezari
Date: 2026-06-25

## Requirement
- Replace the admin advertisement management card layout with a grid-style operations screen.
- Show these grid columns:
  - advertisement number
  - managed subject
  - guardian
  - status
  - advertisement region
  - advertisement period
  - advertisement cost
  - click count
- Add top action buttons:
  - `광고승인`
  - `광고정지`
  - `광고재개`
  - `광고상세정보`
- Keep the structure ready for future Meta Ads API integration.

## Implemented Screen Behavior
- Admin opens `/admin?section=ads`.
- The top panel still manages the global advertisement daily rate.
- Advertisement rows now appear in the same grid/master-detail style used by guardian, subject, and order management screens.
- Search and status filters were added above the grid:
  - search by advertisement ID, subject name, guardian name, phone, or email
  - filter by all, approval waiting, advertising, paused, or expired
- Selecting a grid row sets `ad=<id>` in the admin URL and opens the detail panel on the right.
- The selected row is visually highlighted.
- `광고상세정보` scrolls to the selected detail panel.

## Button Rules

| Button | Allowed Current Status | Result |
| --- | --- | --- |
| `광고승인` | `ready`, `active`, `paused` | Sets status to `active`, clears pause/end timestamps, and marks `meta_status = admin_approved` |
| `광고정지` | `ready`, `active` | Sets status to `paused` and stores `paused_at` |
| `광고재개` | `paused` | Sets status to `active` and clears `paused_at` |
| `광고상세정보` | selected advertisement only | Opens the detail panel for the selected advertisement |

Disabled buttons remain visible but cannot be clicked when the selected advertisement is in an invalid state.

## Grid Columns

| Column | Source |
| --- | --- |
| 광고 번호 | formatted `subject_ads.id` |
| 관리대상 | `subjects.name` |
| 보호자 | guardian name, email fallback, or Google email fallback |
| 상태 | `subject_ads.status` mapped to Korean labels |
| 광고지역 | `subject_ads.region` |
| 광고기간 | `subject_ads.start_date` to `subject_ads.end_date` |
| 광고비 | `subject_ads.amount` |
| 클릭수 | `subject_ads.click_count` |

## Database Change
- `DB_SCHEMA_VERSION` increased from `6` to `7`.
- `subject_ads.click_count INTEGER NOT NULL DEFAULT 0` was added for Meta Ads API reporting readiness.

## Meta API Readiness
- Existing placeholders remain:
  - `meta_campaign_id`
  - `meta_status`
- New click tracking placeholder:
  - `click_count`
- Future Meta API integration can map:
  - campaign approval to `광고승인`
  - campaign pause to `광고정지`
  - campaign resume to `광고재개`
  - ad performance sync to `click_count`

## Files Changed
- `lib/db.js`
- `app/admin/actions.js`
- `app/admin/page.js`
- `app/globals.css`
- `deliverables/ADVERTISING_SETUP.md`
- `deliverables/DATABASE_SCHEMA.md`

## Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors.

## Deployment
- GitHub commit: `c4288df Convert admin ads to grid management`
- Vercel production deployment: `https://zezari-q8466w9ph-zezari.vercel.app`
- Production alias: `https://zezari.vercel.app`
- Deployment state: Ready
- Production home check: HTTP 200

## Time Spent
- UI conversion, DB schema placeholder, admin action wiring, documentation, and build verification: about 35 minutes.

## Image Generation Prompt
Create a clean Korean civic-tech admin UI diagram for "REAL_QR_FIND" advertisement management. Show a left admin sidebar, an advertisement daily-rate panel, a dense advertisement grid with columns "광고 번호, 관리대상, 보호자, 상태, 광고지역, 광고기간, 광고비, 클릭수", top action buttons "광고승인, 광고정지, 광고재개, 광고상세정보", and a right detail panel with Meta API placeholders for campaign ID, API status, and click count. Use white surfaces, civic blue accents, green advertising, amber paused, gray expired states, compact Korean labels, and no real personal data.

## 2026-06-29 Update - Three-Tab Detail Card

### Requirement
- Rebuild the advertisement management menu to match the new reference image.
- Add operations summary cards.
- Add a three-tab detail card:
  - `기본 정보`
  - `광고 성과`
  - `지출 내역`
- Keep grid and detail content usable with horizontal and vertical scrolling.

### Implemented Changes
- Added top status cards:
  - 진행 중
  - 심사 대기
  - 심사반려
  - 중단
  - 만료
  - 월 광고비
  - 년 광고비
- Expanded search filters:
  - 검색어
  - 광고 상태
  - 심사 상태
  - 광고 지역
  - 광고 기간
- Expanded advertisement grid columns:
  - 선택
  - 광고 번호
  - 대상자
  - 광고상태
  - 심사상태
  - 광고지역
  - 광고기간
  - 일예산
  - 총예산
  - 광고비(%)
  - 활성화 일시
  - 관리
- Added in-card detail tabs:
  - 기본 정보: status, review state, budgets, region, period, Meta placeholders, creative preview, and admin memo
  - 광고 성과: reach, impressions, clicks, CPC, CTR, spend, and contact count
  - 지출 내역: spend date, campaign period, region, amount, payment method, and receipt/payment link
- Added administrator advertisement memo storage in `subject_ads.admin_memo`.
- Added future Meta reporting columns:
  - `impression_count`
  - `reach_count`
  - `contact_count`
  - `spent_amount`
- Updated CSV export to include review status, budget, progress rate, and activation time.

### Verification
- `npm run build` succeeded.
- `git diff --check` succeeded with Windows line-ending warnings only.
- Turso `subject_ads` schema check and advertisement join query succeeded without printing secrets.
