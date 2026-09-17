import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [prepareRoute, database, metaMarketing, paymentClient, successPage] = await Promise.all([
  readFile(new URL("../app/api/payments/toss/ad/prepare/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/meta-marketing.js", import.meta.url), "utf8"),
  readFile(new URL("../app/ad-payment-client.js", import.meta.url), "utf8"),
  readFile(new URL("../app/payments/toss/ad/success/page.js", import.meta.url), "utf8"),
]);

assert.match(prepareRoute, /adminPass[\s\S]+markSubjectAdPaid\([\s\S]+isTestPayment:\s*true/);
assert.match(database, /export async function markSubjectAdPaid[\s\S]+ELSE 'meta_publish_queued'/);
assert.doesNotMatch(database, /관리자 테스트 광고는 Meta에 발행하지 않습니다/);
assert.match(database, /export async function publishPaidSubjectAd[\s\S]+syncMetaCampaignForAdCommand\(ad, "approve"\)/);
assert.match(metaMarketing, /Date\.now\(\) \+ 60 \* 1000/);
assert.match(metaMarketing, /const targeting = buildMetaCustomLocationTargeting\(ad\)/);
assert.match(metaMarketing, /lifetime_budget:\s*lifetimeBudget/);
assert.match(metaMarketing, /start_time:\s*schedule\.startTime/);
assert.match(metaMarketing, /end_time:\s*schedule\.endTime/);
assert.match(paymentClient, /Toss 결제는 발생하지 않지만 설정된 예산으로 실제 Meta 광고가 발행됩니다/);
assert.match(successPage, /publishPaidSubjectAd\(adId\)/);
assert.doesNotMatch(successPage, /관리자 결제패스가 완료되었습니다/);
assert.doesNotMatch(successPage, /publicationMessage/);

console.log("Ad payment Meta publication regression checks passed.");
