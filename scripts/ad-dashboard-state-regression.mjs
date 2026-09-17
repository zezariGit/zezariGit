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

assert.match(page, /statusFilter === "running"[^\n]+\["review", "running", "paused"\]\.includes\(stage\)/);
assert.match(page, /statusFilter === "done"[^\n]+stage === "done"/);
assert.match(page, /\["running", "paused"\]\.includes\(stage\) && <AdHistoryActions/);
assert.match(page, /stage === "review" \? "-"/);
assert.match(page, /광고 검토 중/);
assert.match(page, /진행 중/);
assert.match(page, /광고 중단/);
assert.match(page, /광고 완료/);
assert.match(page, /ad-test-status-panel/);
assert.match(page, /activateTestSubjectAdAction/);
assert.match(page, /query\.set\("testAd", testAdId\)/);
assert.match(page, /String\(ad\.meta_status \|\| ""\) === "test_in_review"/);

assert.match(actions, /환불되지 않습니다/);
assert.match(actions, /missing-report\?subject=\$\{encodeURIComponent\(ad\.subject_id\)\}&newAd=1/);
assert.match(selectorPage, /initialSubjectId=\{String\(params\?\.subject \|\| ""\)\}/);
assert.match(selectorPage, /forceNew=\{params\?\.newAd === "1"\}/);
assert.match(selector, /if \(status === "찾는중"\)/);
assert.match(selector, /buildAdSetupHref\(subject\.id, true\)/);
assert.match(selector, /forceNew \? "&newAd=1" : ""/);
assert.match(serverActions, /revalidatePath\("\/account\/ads"\)/);
assert.match(database, /is_test_payment = \?,[\s\S]+ELSE 'meta_publish_queued'/);
assert.match(database, /export async function markSubjectAdPaid[\s\S]+SET status = '찾는중'/);
assert.match(database, /a\.paid_at IS NOT NULL[\s\S]+a\.status IN \('ready', 'active', 'paused', 'rejected'\)/);
assert.doesNotMatch(database, /관리자 테스트 광고는 Meta에 발행하지 않습니다/);
assert.match(database, /export async function activateTestSubjectAd/);
assert.match(database, /is_test_payment = 1[\s\S]+status = 'ready'[\s\S]+meta_status = 'test_in_review'[\s\S]+COALESCE\(meta_ad_id, ''\) = ''/);
assert.match(database, /meta_status = 'test_active'/);
assert.match(database, /startsWith\("test_"\)/);
assert.match(database, /export async function endSubjectAd[\s\S]+allowed: \["active", "paused"\]/);
assert.doesNotMatch(database, /export async function endSubjectAd[\s\S]{0,180}allowed: \["active", "paused", "ready"\]/);
assert.match(successPage, /광고 상태 테스트하기/);
assert.match(successPage, /testAd=\$\{encodeURIComponent\(testAdId\)\}/);
assert.match(successPage, /AdPaymentSuccessClient/);
assert.match(successPage, /\["1", "admin", "user"\]\.includes\(previewMode\)/);
assert.doesNotMatch(successPage, /publicationMessage/);
assert.doesNotMatch(successPage, /해당 문구는 관리자만 볼 수 있습니다/);
assert.doesNotMatch(successClient, /광고 검토 중 · META 검토 대기/);
assert.doesNotMatch(successClient, /ad-complete-publication-note/);
assert.doesNotMatch(successClient, /광고 상태 테스트하기/);
assert.doesNotMatch(successClient, /광고내역 보기/);
assert.doesNotMatch(successClient, /대시보드 이동/);
assert.match(successClient, /\/assets\/ad-payment\/payment-complete\.png/);
assert.match(successClient, /경찰 신고도 함께 진행하시겠어요\?/);
assert.match(successClient, /112로 연결해 드립니다/);
assert.match(successClient, /112로 전화할까요\?/);
assert.match(successClient, /tel:112/);
assert.match(successClient, /police-call-modal/);
assert.match(styles, /\.ad-payment-success-panel\s*\{/);
assert.match(styles, /\.ad-payment-success-panel \.police-report-prompt-section\s*\{[\s\S]*?margin-top: 58px/);
assert.match(styles, /\.ad-history-status\.paused/);
assert.match(styles, /\.police-call-modal-dialog\s*\{/);

console.log("Ad dashboard state regression checks passed.");
