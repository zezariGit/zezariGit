import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, actions, database, successPage, styles] = await Promise.all([
  readFile(new URL("../app/account/ads/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/account/ads/ad-history-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/ad/success/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(page, /statusFilter === "running"[^\n]+stage === "review" \|\| stage === "running"/);
assert.match(page, /statusFilter === "done"[^\n]+stage === "done"/);
assert.match(page, /stage === "running" && <AdHistoryActions/);
assert.match(page, /stage === "review" \? "-"/);
assert.match(page, /광고 검토 중/);
assert.match(page, /진행 중/);
assert.match(page, /광고 완료/);
assert.match(page, /ad-test-status-panel/);
assert.match(page, /activateTestSubjectAdAction/);
assert.match(page, /query\.set\("testAd", testAdId\)/);

assert.match(actions, /환불되지 않습니다/);
assert.match(database, /WHEN \? = 1 THEN 'test_in_review'/);
assert.match(database, /Number\(current\.is_test_payment \|\| 0\) === 1/);
assert.match(database, /export async function activateTestSubjectAd/);
assert.match(database, /is_test_payment = 1[\s\S]+status = 'ready'/);
assert.match(database, /meta_status = 'test_active'/);
assert.match(database, /startsWith\("test_"\)/);
assert.match(successPage, /광고 상태 테스트하기/);
assert.match(successPage, /testAd=\$\{encodeURIComponent\(testAdId\)\}/);
assert.match(styles, /\.ad-test-status-panel\s*\{/);

console.log("Ad dashboard state regression checks passed.");
