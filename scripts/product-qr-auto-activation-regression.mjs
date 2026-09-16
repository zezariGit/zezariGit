import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [database, subscriptionSuccess, productSuccess, dashboard, adminPage, actions, adminActions] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/subscription/success/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/product/success/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/dashboard.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/actions.js", import.meta.url), "utf8"),
]);

assert.match(database, /async function assignQrToSubject[\s\S]*activated_at = CURRENT_TIMESTAMP,[\s\S]*activation_source = 'subject_registration'/);
assert.match(database, /const nextOrderStatus = "activated"/);
assert.match(database, /const subjectStatus = "안전"/);
assert.match(database, /WHERE status = 'QR활성화필요'/);
assert.match(database, /WHERE status = 'paid_waiting_activation'/);
assert.doesNotMatch(database, /SET status = 'QR활성화필요'/);
assert.doesNotMatch(database, /const nextOrderStatus = .*paid_waiting_activation/);
assert.doesNotMatch(database, /export async function activateQrForGuardian/);
assert.doesNotMatch(database, /export async function setQrAdminTestActivation/);
assert.match(subscriptionSuccess, /대상자 서비스를 바로 이용할 수 있습니다/);
assert.match(productSuccess, /대상자 서비스를 바로 이용할 수 있습니다/);
assert.doesNotMatch(subscriptionSuccess, /활성화 가능한 매칭 QR|QR 활성화가 완료/);
assert.doesNotMatch(productSuccess, /QR 활성화가 완료/);
assert.doesNotMatch(dashboard, />QR 활성화 필요</);
assert.doesNotMatch(adminPage, />QR활성화필요<|>QR미활성화<|구매 없이 QR 수동 활성화/);
assert.doesNotMatch(actions, /activateQrAction/);
assert.doesNotMatch(adminActions, /setQrAdminTestActivationAction/);

console.log("subject registration QR auto-activation regression passed");
