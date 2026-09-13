import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [database, subscriptionSuccess, productSuccess] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/subscription/success/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/product/success/page.js", import.meta.url), "utf8"),
]);

assert.match(database, /q\.id AS qr_id[\s\S]*q\.lifecycle_status AS qr_lifecycle_status/);
assert.match(database, /const hasActivatableMatchedQr = Boolean\([\s\S]*order\.qr_id[\s\S]*discarded/);
assert.match(database, /UPDATE qr_codes[\s\S]*is_active = 1[\s\S]*activated_at = COALESCE\(activated_at, CURRENT_TIMESTAMP\)[\s\S]*activation_source = 'guardian_purchase'/);
assert.match(database, /const qrActivated = Boolean\(order\.qr_activated_at\) \|\| hasActivatableMatchedQr/);
assert.match(database, /const nextOrderStatus = qrActivated \? "activated" : "paid_waiting_activation"/);
assert.match(database, /const subjectStatus = qrActivated \? "안전" : "QR활성화필요"/);
assert.match(subscriptionSuccess, /매칭된 QR 활성화가 완료되었습니다/);
assert.doesNotMatch(subscriptionSuccess, /상품 수령 후 QR 코드를 활성화/);
assert.match(productSuccess, /상품 결제와 매칭된 QR 활성화가 완료되었습니다/);
assert.doesNotMatch(productSuccess, /상품을 수령하신 후, QR 코드를 활성화/);

console.log("product QR auto-activation regression passed");
