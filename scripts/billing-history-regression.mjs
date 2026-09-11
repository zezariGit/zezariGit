import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [listPage, detailPage, billingUi, database, styles] = await Promise.all([
  readFile(new URL("../app/account/billing/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/account/billing/[kind]/[id]/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/account/billing/billing-ui.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(database, /FROM product_orders o[\s\S]*WHERE o\.guardian_id = \?/);
assert.match(database, /FROM subject_ads a[\s\S]*WHERE a\.guardian_id = \?/);
assert.match(database, /payments = \[\.\.\.productPayments, \.\.\.adPayments\][\s\S]*\.sort/);
assert.match(database, /getGuardianPaymentDetail[\s\S]*payment\.payment_kind === kind && payment\.id === id/);

assert.match(listPage, /getGuardianBillingData\(session\)\)\.payments/);
assert.match(listPage, /billing-payment-list/);
assert.match(listPage, /account\/billing\/\$\{payment\.payment_kind\}/);
assert.match(listPage, /결제 금액/);
assert.match(listPage, /결제 상태/);
assert.match(listPage, /결제 일시/);

assert.match(detailPage, /getGuardianPaymentDetail\(session, route\.kind, route\.id\)/);
assert.match(detailPage, /title="결제 상세"/);
assert.match(detailPage, /title=\{isOrder \? "주문 상품" : "서비스 정보"\}/);
assert.match(detailPage, /title="배송 정보"/);
assert.match(detailPage, /title="결제 정보"/);
assert.match(detailPage, /title="취소 정보"/);

assert.match(billingUi, /promotion-green\.png/);
assert.match(billingUi, /shopping-green\.png/);
assert.match(billingUi, /billing-payment-status \$\{status\}/);
assert.match(styles, /\.billing-payment-list[\s\S]*overflow-y:\s*auto/);
assert.match(styles, /\.billing-payment-status\.cancelled/);

console.log("billing history regression passed");
