# QR Subscription Hold

Project: REAL_QR_FIND / zezari
Date: 2026-07-24

## Requirement
- An administrator can activate or deactivate a managed subject's QR from the subject-management detail card.
- When an active subscription exists, an extended QR deactivation should preserve the unused subscription days.
- A temporary deactivation of 24 hours or less must not change the subscription period.

## Business Rule
- Deactivation starts a QR-specific hold timer only when:
  - the QR is assigned to a guardian and subject;
  - the guardian subscription status is `active`;
  - the current subscription end is still in the future.
- The guardian-level subscription status remains active. This prevents one subject's QR deactivation from blocking the same guardian's other QR pages.
- On QR reactivation:
  - elapsed time of 24 hours or less credits `0` days;
  - elapsed time over 24 hours credits only completed 24-hour days;
  - the credited days are added to `subscriptions.current_period_end`;
  - an expired subscription is restored to `active` only when the extended end is later than the reactivation time.
- Examples:
  - 23 hours 59 minutes: `0` days
  - exactly 24 hours: `0` days
  - 24 hours and 1 second: `1` day
  - 47 hours: `1` day
  - 48 hours: `2` days

## Database
- Schema version: `19`
- Added to `qr_codes`:
  - `subscription_hold_started_at`
  - `subscription_hold_subscription_id`
  - `subscription_hold_total_days`
  - `subscription_hold_last_days`
  - `subscription_hold_last_ended_at`
- QR discard, subject deletion, unmatching, and reassignment clear hold ownership and accumulated display data so it cannot move to another subject.

## Administrator UI
- Menu: `대상자 관리`
- Detail tab: `QR`
- Shows:
  - current QR state;
  - hold start date/time;
  - accumulated credited days;
  - QR activate/deactivate button;
  - the 24-hour grace rule or a no-active-subscription notice.
- The existing QR-management menu uses the same server function, so both admin entry points apply the same subscription rule.

## Concurrency
- State updates require the QR to still be in the expected active/inactive state.
- Subscription extension checks the exact stored hold start and subscription ID.
- Repeated or concurrent activation submissions cannot apply the same hold period twice.

## Verification
- `npm run build`
- `git diff --check`
- Pure boundary tests for 23:59, 24:00, 24:00:01, 47:00, and 48:00.
- Production migration verification should confirm schema version `19` and all five QR hold columns after deployment.

## Presentation Image Prompt
> 한국 공공서비스 스타일의 QR 안전서비스 관리자 대상자 상세 화면. 오른쪽 상세 카드의 QR 탭에 QR 코드, QR 번호, 활성 상태, 구독기간 보정 시작일시, 누적 보정일이 표시되고 하단에 QR 활성화 또는 비활성화 버튼이 있다. 안내문에는 24시간 이내 비활성화는 구독기간에 반영하지 않고, 초과 시 완료 일수만큼 만료일을 연장한다고 명확히 표시한다. 흰색 배경, 절제된 파란색, 조밀하고 실무적인 한국어 운영 UI, 16:9 발표자료용.
