import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyMetaAdvertisementDeliveryStatus } from "../lib/meta-marketing.js";

const [database, metaMarketing, route, workflow, dashboard, styles] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/meta-marketing.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/cron/meta-ad-status/route.js", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/meta-ad-status-sync.yml", import.meta.url), "utf8"),
  readFile(new URL("../app/account/ads/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.equal(classifyMetaAdvertisementDeliveryStatus("ACTIVE"), "active");
assert.equal(classifyMetaAdvertisementDeliveryStatus("PENDING_REVIEW"), "review");
assert.equal(classifyMetaAdvertisementDeliveryStatus("IN_PROCESS"), "review");
assert.equal(classifyMetaAdvertisementDeliveryStatus("PREAPPROVED"), "review");
assert.equal(classifyMetaAdvertisementDeliveryStatus("DISAPPROVED"), "rejected");
assert.equal(classifyMetaAdvertisementDeliveryStatus("CAMPAIGN_PAUSED"), "paused");
assert.equal(classifyMetaAdvertisementDeliveryStatus("DELETED"), "ended");

assert.match(metaMarketing, /fields: "id,effective_status,configured_status,status,updated_time"/);
assert.match(database, /export async function syncReviewingMetaAds/);
assert.match(database, /WHERE status = 'ready'[\s\S]+meta_published_at IS NOT NULL[\s\S]+meta_ad_id/);
assert.match(database, /SET status = \?, meta_status = \?, meta_last_error = NULL/);
assert.match(database, /eventKey: "ad\.started"/);
assert.match(route, /process\.env\.CRON_SECRET/);
assert.match(route, /timingSafeEqual/);
assert.match(route, /syncReviewingMetaAds\(\)/);
assert.match(workflow, /cron: "\*\/5 \* \* \* \*"/);
assert.match(workflow, /secrets\.CRON_SECRET/);
assert.match(workflow, /https:\/\/zezari\.family\/api\/cron\/meta-ad-status/);
assert.match(dashboard, /return "rejected"/);
assert.match(dashboard, /광고 반려/);
assert.match(styles, /\.ad-history-status\.rejected/);

console.log("Meta advertisement status synchronization regression checks passed.");
