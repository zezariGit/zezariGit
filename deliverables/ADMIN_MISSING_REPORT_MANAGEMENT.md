# Admin Missing Report Management

Project: REAL_QR_FIND / zezari
Date: 2026-06-25

## Requirement
- Add a new `실종신고 관리` menu to the administrator page.
- Display missing report operations in a grid.
- Required grid columns:
  - 신고일시
  - 대상자
  - 보호자
  - 신고상태
  - 광고상태
  - 발견여부

## Implemented Screen Behavior
- Admin opens `/admin?section=missing`.
- The left admin menu includes `실종신고 관리`.
- The dashboard recent-status card for `실종신고 현황` now links to the new missing report management screen.
- The screen includes:
  - integrated search by managed subject, guardian, phone, or email
  - report date start/end filters
  - grid rows with links to the selected subject and guardian admin detail screens

## Data Source
- There is no dedicated `missing_reports` table yet.
- The current screen is derived from the existing operational state:
  - `subjects.status = '찾는중'`
  - latest `subject_ads` row for the subject, when advertisement history exists
- `신고일시` uses:
  - subject updated time when the subject is currently `찾는중`
  - latest advertisement creation time when only advertisement history exists
  - subject updated time as fallback

## Status Mapping

| Display Field | Logic |
| --- | --- |
| 신고상태 | `찾는중` + active ad = `광고 진행 중`; `찾는중` without active ad = `신고 접수`; safe subject with ad history = `발견 완료`; ended ad = `종료 완료` |
| 광고상태 | latest ad status mapped through the existing admin ad labels: `광고중`, `정지중`, `승인대기`, `만료`, or `미진행` |
| 발견여부 | `subjects.status = 찾는중` -> `미발견`; `subjects.status = 안전` -> `발견`; otherwise `미확인` |

## Files Changed
- `app/admin/admin-workspace.js`
- `app/admin/page.js`
- `app/globals.css`
- `lib/db.js`

## Verification
- `npm run build` succeeded.
- `git diff --check` returned no whitespace errors.

## Future Improvement
- Add a dedicated `missing_reports` table when report lifecycle management becomes more complex.
- Suggested future fields:
  - `id`
  - `subject_id`
  - `guardian_id`
  - `reported_at`
  - `status`
  - `found_at`
  - `closed_at`
  - `ad_id`
  - `admin_memo`
- This would allow multiple historical reports for the same managed subject without relying on subject current status or latest ad history.

## Time Spent
- Menu, grid, date/search filters, data derivation, styling, documentation, and build verification: about 30 minutes.

## Image Generation Prompt
Create a clean Korean civic-tech admin UI diagram for "REAL_QR_FIND" missing report management. Show a left admin sidebar with "실종신고 관리" selected, a date-range filter for "신고일시", a search input, and a dense grid with columns "신고일시, 대상자, 보호자, 신고상태, 광고상태, 발견여부". Include example status chips for "신고 접수", "광고 진행 중", "발견 완료", "종료 완료", advertisement chips "광고중/정지중/만료", and found state chips "미발견/발견/미확인". Use white work surfaces, civic blue accents, red missing, green found, amber paused, gray completed states, compact Korean labels, and no real personal data.
