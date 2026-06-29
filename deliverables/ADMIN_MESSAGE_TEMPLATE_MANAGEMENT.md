# Admin Message Template Management

## Scope
- Adds an administrator `메시지 템플릿` menu.
- Provides template master data for operational messages used by push and KakaoTalk channels.
- Matches the requested layout: template grid on the left, edit card on the right.

## Screen
- Menu path: `/admin?section=message-templates`
- Search filters:
  - 검색어
  - 발송 채널
  - 자동 여부
- Grid columns:
  - 이벤트
  - 설명
  - 발송채널
  - 내용
  - 발송 대상
  - 자동 메시지
  - 관리
- CSV export is available from the grid header.

## Detail Card
- Editable fields:
  - 이벤트
  - 설명
  - 알림 채널
  - 발송 대상
  - 제목
  - 내용
  - 자동 메시지 ON/OFF
  - 사용 가능/사용 불가능
- Locked automatic templates follow the requested rule:
  - only `제목` and `내용` can be changed
  - channel, target, and auto setting are disabled

## Seed Templates
- `QR 미활성화 안내`
  - channel: push
  - target: subject guardian
  - locked automatic template
- `구독 / 갱신`
  - channel: push
- `실종광고 종료`
  - channel: push
- `취소/환불`
  - channel: KakaoTalk

## Database
- New table: `message_templates`
- Important fields:
  - `template_number`
  - `event_key`
  - `description`
  - `channel`
  - `title`
  - `body`
  - `target_type`
  - `is_auto`
  - `is_locked`
  - `is_active`

## KakaoTalk Channel
- Template channel can be set to `카카오톡`.
- Actual KakaoTalk sending is handled by the admin message send flow through the configured Kakao/Biz message API environment variables.

## Verification
- `npm run build` succeeded locally after implementation.
- Production route to verify after deployment:
  - `https://zezari.vercel.app/admin?section=message-templates`
