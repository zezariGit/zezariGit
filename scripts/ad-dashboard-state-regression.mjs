import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, actions, serverActions, selector, selectorPage, database, successPage, successClient, styles] = await Promise.all([
  readFile(new URL("../app/account/ads/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/account/ads/ad-history-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/missing-report/missing-report-selector.js", import.meta.url), "utf8"),
  readFile(new URL("../app/missing-report/page.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/ad/success/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/ad/success/ad-payment-success-client.js", import.meta.url), "utf8"),
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
assert.match(actions, /missing-report\?subject=\$\{encodeURIComponent\(ad\.subject_id\)\}&newAd=1/);
assert.match(selectorPage, /initialSubjectId=\{String\(params\?\.subject \|\| ""\)\}/);
assert.match(selectorPage, /forceNew=\{params\?\.newAd === "1"\}/);
assert.match(selector, /forceNew && selectedStatus === "찾는중"/);
assert.match(selector, /forceNew \? "&newAd=1" : ""/);
assert.match(serverActions, /revalidatePath\("\/account\/ads"\)/);
assert.match(database, /WHEN \? = 1 THEN 'test_in_review'/);
assert.match(database, /Number\(current\.is_test_payment \|\| 0\) === 1/);
assert.match(database, /export async function activateTestSubjectAd/);
assert.match(database, /is_test_payment = 1[\s\S]+status = 'ready'/);
assert.match(database, /meta_status = 'test_active'/);
assert.match(database, /startsWith\("test_"\)/);
assert.match(database, /export async function endSubjectAd[\s\S]+allowed: \["active", "paused"\]/);
assert.doesNotMatch(database, /export async function endSubjectAd[\s\S]{0,180}allowed: \["active", "paused", "ready"\]/);
assert.match(successPage, /광고 상태 테스트하기/);
assert.match(successPage, /testAd=\$\{encodeURIComponent\(testAdId\)\}/);
assert.match(successPage, /AdPaymentSuccessClient/);
assert.match(successClient, /\/assets\/ads\/ad-payment-complete\.png/);
assert.match(successClient, /경찰 신고도 함께 진행하시겠어요\?/);
assert.match(successClient, /112로 연결해 드립니다/);
assert.match(successClient, /112로 전화할까요\?/);
assert.match(successClient, /tel:112/);
assert.match(successClient, /police-call-modal/);
assert.match(styles, /\.ad-payment-success-panel\s*\{/);
assert.match(styles, /\.police-call-modal-dialog\s*\{/);

console.log("Ad dashboard state regression checks passed.");
