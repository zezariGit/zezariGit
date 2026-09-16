import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, route, database, styles, adFailPage, productFailPage, subscriptionFailPage, tossPayments] = await Promise.all([
  readFile(new URL("../app/notification-bell.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/notifications/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/ad/fail/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/product/fail/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/subscription/fail/page.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/toss-payments.js", import.meta.url), "utf8"),
]);

assert.match(component, /body: JSON\.stringify\(\{ action: "mark-read-visible", ids \}\)/);
assert.match(component, /exposedUnreadIdsRef/);
assert.match(component, /keepalive: true/);
assert.match(component, /window\.addEventListener\("pagehide"/);
assert.match(component, /finishClosing\(\);[\s\S]*window\.location\.assign\(mapUrl\)/);
assert.match(component, /url\.hostname === "map\.kakao\.com"/);
assert.doesNotMatch(component, /onRead=\{markRead\}/);
assert.match(component, /window\.history\.pushState/);
assert.match(component, /window\.addEventListener\("popstate"/);
assert.match(component, /notification-item\$\{unread \? " unread" : ""\}/);
assert.match(route, /markGuardianNotificationRead\(session, payload\?\.id\)/);
assert.match(route, /markGuardianNotificationsReadByIds\(session, payload\?\.ids\)/);
assert.match(database, /markGuardianNotificationsReadByIds[\s\S]*WHERE guardian_id = \?[\s\S]*AND read_at IS NULL[\s\S]*AND id IN/);
assert.match(database, /idx_guardian_notifications_dedupe/);
assert.match(database, /WHERE event_key = \? AND channel = 'push' AND is_auto = 1 AND is_active = 1/);
assert.match(database, /eventKey: "safety\.location_shared"/);
assert.match(database, /eventKey: "ad\.started"/);
assert.match(database, /eventKey: "commerce\.product_payment_completed"/);
assert.match(database, /eventKey: "commerce\.product_payment_failed"/);
assert.match(database, /eventKey: "commerce\.product_payment_cancelled"/);
assert.match(database, /commerce\.product_refund_completed/);
assert.match(database, /eventKey: "ad\.payment_completed"/);
assert.match(database, /eventKey: "ad\.payment_failed"/);
assert.match(database, /eventKey: "ad\.payment_cancelled"/);
assert.match(database, /ad\.refund_completed/);
assert.match(component, /const \[open, setOpen\] = useState\(preview\)/);
assert.match(component, /PREVIEW_NOTIFICATIONS\.filter\(\(notification\) => !notification\.read_at\)\.length/);
assert.match(database, /UPDATE guardian_notifications[\s\S]*payment-completed:ad:%/);
assert.match(database, /payment_refunds pr[\s\S]*pr\.payment_kind = 'ad'/);
for (const title of [
  "상품 결제가 완료되었습니다.",
  "상품 결제에 실패했습니다.",
  "상품 결제가 취소되었습니다.",
  "상품 결제 금액의 환불이 완료되었습니다.",
  "광고 결제가 완료되었습니다.",
  "광고 결제에 실패했습니다.",
  "광고 결제가 취소되었습니다.",
  "광고 결제 금액의 환불이 완료되었습니다.",
]) {
  assert.match(component, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${title} 미리보기가 필요합니다.`);
  assert.match(database, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${title} 자동 알림 템플릿이 필요합니다.`);
}
assert.match(tossPayments, /USER_CANCEL[\s\S]*PAY_PROCESS_CANCELED[\s\S]*PAY_PROCESS_ABORTED/);
assert.match(adFailPage, /cancelled[\s\S]*markSubjectAdPaymentCancelledForGuardian/);
assert.match(productFailPage, /cancelled[\s\S]*markProductOrderCancelledForGuardian/);
assert.match(subscriptionFailPage, /cancelled[\s\S]*markProductOrderCancelledForGuardian/);
assert.match(styles, /\.notification-list \{[\s\S]*overflow-y: auto/);

console.log("Notification popover regression checks passed.");
