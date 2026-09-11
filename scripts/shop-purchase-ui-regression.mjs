import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, checkout, database, styles] = await Promise.all([
  readFile(new URL("../app/shop/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/shop-checkout-client.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(database, /ORDER BY s\.created_at DESC, s\.id DESC/);
assert.match(page, /initialProductId=\{initialProduct\?\.id \|\| ""\}/);
assert.match(page, /toClientData\(sortShopProducts\(await getShopProducts\(\)\)\)/);
assert.match(checkout, /configurationReady = Boolean\(subjectId && product && selectedDesign\)/);
assert.match(checkout, /Number\(product\?\.unit_price \|\| 0\)/);
assert.match(checkout, /prompt="상품을 선택해 주세요"/);
assert.match(checkout, /prompt=\{product && designs\.length === 0 \? "선택 가능한 디자인이 없습니다" : "디자인을 선택해 주세요"\}/);
assert.match(checkout, /disabled=\{!selectionReady \|\| quantity <= 1\}/);
assert.match(checkout, /disabled=\{!selectionReady\}>\+<\/button>/);
assert.match(checkout, /disabled=\{!configurationReady\}/);
assert.match(styles, /\.shop-subject-trigger[\s\S]*background:\s*var\(--c-primary-light\)/);
assert.match(styles, /\.quantity-control button:disabled/);
assert.match(styles, /\.shop-next-button:disabled/);

console.log("shop purchase UI regression passed");
