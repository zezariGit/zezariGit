import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [adminPage, productWorkspace, styles] = await Promise.all([
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/product-admin-catalog-form.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

const detailRowBuilders = [
  "buildLocationShareUrl",
  "buildSafePhonePoolUrl",
  "buildAdminMessageUrl",
  "buildMessageTemplateUrl",
  "buildOrderListUrl",
  "buildAdListUrl",
  "buildPaymentListUrl",
  "buildCouponListUrl",
  "buildSubscriptionListUrl",
  "buildGuardianAdminUrl",
  "buildSubjectAdminUrl",
  "buildQrDetailUrl",
];

for (const builder of detailRowBuilders) {
  assert.match(
    adminPage,
    new RegExp(`<Link[\\s\\S]{0,260}href=\\{${builder}\\(`),
    `${builder} must be attached to a whole selectable row`,
  );
}

assert.doesNotMatch(
  adminPage,
  /<div className=\{`admin-record-row \$\{isSelected \? "selected"/,
  "payment and coupon rows must not require their final detail cell",
);
assert.match(productWorkspace, /<tr[\s\S]{0,300}onClick=\{\(\) => selectProduct\(product\.id\)\}/);
assert.match(productWorkspace, /onKeyDown=\{\(event\) => \{/);
assert.match(productWorkspace, /aria-selected=\{isSelected\}/);
assert.match(styles, /\.admin-record-row \{[\s\S]*?cursor: pointer;/);
assert.match(styles, /\.product-catalog-table tbody tr \{[\s\S]*?cursor: pointer;/);

console.log("Admin grid row selection regression checks passed.");
