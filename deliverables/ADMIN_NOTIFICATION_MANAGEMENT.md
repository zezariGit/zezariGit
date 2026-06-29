# Admin Notification Management

## Scope
- Adds an administrator `알림 관리` menu for composing, saving, sending, searching, and exporting guardian notifications.
- Supported channels:
  - browser push notification
  - KakaoTalk message API bridge
- Messages are also saved into each guardian's in-app notification history so the bell list can show the message after login.

## Administrator Screen
- Menu path: `/admin?section=notifications`
- Search filters:
  - 발송 채널
  - 발송 상태
  - 검색어
  - 기간
- Grid columns:
  - 알림번호
  - 제목
  - 발송 채널
  - 발송 대상
  - 발송 상태
  - 발송 수
  - 성공 수
  - 실패 수
  - 발송 일시
  - 관리
- CSV export is available from the grid header.

## Message Detail And Compose
- The right detail card shows selected message metadata, edit fields, preview, send/save buttons, and delivery counts.
- `+ 새 메시지` opens a right-side modal panel.
- The modal prevents background selection while it is open.
- Fields:
  - 발송 채널: push notification or KakaoTalk
  - 발송 대상: all active guardians or one selected subject's guardian
  - 제목
  - 내용
  - 미리보기
- Buttons:
  - 저장: stores a draft in `admin_messages`
  - 발송: stores the message, creates guardian notification records, and sends browser push to registered subscriptions

## Database
- New table: `admin_messages`
- Important fields:
  - `message_number`: administrator-facing notification number
  - `channel`: first value is `push`
  - `target_type`: `all` or `subject`
  - `subject_id`: optional selected subject
  - `title`, `body`, `url`
  - `status`: `draft` or `sent`
  - `recipient_count`, `success_count`, `failure_count`
  - `sent_at`, `created_at`, `updated_at`

## Push Delivery Notes
- A guardian is counted as a push success only when at least one registered push subscription accepts the notification.
- If the guardian has no push subscription, the in-app notification is still saved, but the push result is counted as failure for operational visibility.
- VAPID keys must be configured for browser push delivery.

## KakaoTalk Delivery Notes
- KakaoTalk delivery uses an external Kakao/Biz message API bridge.
- Required runtime environment variables:
  - `KAKAO_MESSAGE_API_URL`
  - `KAKAO_MESSAGE_API_KEY` or `KAKAO_REST_API_KEY`
  - optional `KAKAO_MESSAGE_SENDER_KEY`
  - optional `KAKAO_MESSAGE_SENDER_NO`
- When Kakao credentials are missing, the administrator message is still saved and guardian in-app notification records are created, but Kakao delivery is counted as failure for operational visibility.
- The current generic request payload includes receiver phone, title, body, URL, sender key, and sender number so it can be mapped to an AlimTalk/provider endpoint.

## Template Management
- Added administrator menu: `메시지 템플릿`.
- Templates can define:
  - event key
  - description
  - delivery channel
  - target type
  - title
  - body
  - auto-message flag
  - active status
- Locked automatic templates only allow title/body editing.

## Coupon Detail UI Fix
- Coupon registration/edit radio groups were adjusted so labels do not overlap:
  - random/manual coupon code mode
  - use possible/use impossible status

## Verification
- `npm run build` succeeded locally after implementation.
- `git diff --check` should be run before deployment.
- Production deployment should be verified at:
  - `https://zezari.vercel.app/admin?section=notifications`
