import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [checkout, database, couponApi, complete, adminPage, adminActions, shipping] = await Promise.all([
  readFile(new URL("../app/shop-checkout-client.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/coupons/register/route.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/shop-order-complete.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/shop-shipping.js", import.meta.url), "utf8"),
]);

assert.match(checkout, /placeholder="000-0000-0000"/);
assert.match(checkout, /formatMobilePhoneInput\(event\.target\.value\)/);
assert.match(checkout, /replace\(\/\\D\/g, ""\)\.slice\(0, 11\)/);
assert.match(checkout, /className=\{`checkout-coupon-register/);
assert.match(checkout, /유효한 쿠폰코드가 아닙니다/);
assert.match(checkout, /이미 등록된 쿠폰입니다/);
assert.match(checkout, /setCouponInventory\(\(current\) => \[\.\.\.current, coupon\]\)/);
assert.match(checkout, /calculateShopShippingFee\(subtotalAmount, normalizedShippingSettings\)/);
assert.match(checkout, /Math\.max\(0, subtotalAmount - discountAmount\) \+ shippingFee/);
assert.match(checkout, /이상 구매 시 무료배송/);

assert.match(couponApi, /registerGuardianCoupon/);
assert.match(couponApi, /유효한 쿠폰코드가 아닙니다/);
assert.match(couponApi, /이미 등록된 쿠폰입니다/);

assert.match(database, /CREATE TABLE IF NOT EXISTS shop_purchase_settings/);
assert.match(database, /shipping_fee INTEGER NOT NULL DEFAULT 0/);
assert.match(database, /free_shipping_threshold INTEGER NOT NULL DEFAULT 30000/);
assert.match(database, /export async function getShopPurchaseSettings/);
assert.match(database, /export async function setShopPurchaseSettings/);
assert.match(database, /calculateShopShippingFee/);

assert.match(shipping, /shippingFee: 3500/);
assert.match(shipping, /freeShippingThreshold: 30000/);
assert.match(shipping, /subtotal >= normalized\.freeShippingThreshold/);

assert.match(adminPage, /상품 배송비 설정/);
assert.match(adminPage, /name="shippingFee"/);
assert.match(adminPage, /name="freeShippingThreshold"/);
assert.match(adminActions, /setShopPurchaseSettingsAction/);

assert.match(complete, /<h1>주문이 완료되었습니다<\/h1>/);
assert.doesNotMatch(complete, /product-order-complete\.png/);
assert.match(complete, /홈으로 이동/);
assert.doesNotMatch(complete, /대시보드(?:로)? 이동/);
assert.match(complete, /주문정보는 결제 및 서비스 현황에서/);

console.log("shop checkout payment regression passed");
