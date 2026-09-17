import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyMetaAdvertisementDeliveryStatus } from "../lib/meta-marketing.js";

const [database, metaMarketing, route, accountRoute, workflow, dashboard, autoSync, styles] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/meta-marketing.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/cron/meta-ad-status/route.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/account/ads/sync/route.js", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/meta-ad-status-sync.yml", import.meta.url), "utf8"),
  readFile(new URL("../app/account/ads/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/account/ads/ad-status-auto-sync.js", import.meta.url), "utf8"),
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
assert.match(metaMarketing, /timeoutMs: 8000/);
assert.match(database, /export async function syncReviewingMetaAds/);
assert.match(database, /export async function syncOperationalMetaAds/);
assert.match(database, /WHERE a\.status IN \('active', 'paused'\)[\s\S]+a\.meta_ad_id/);
assert.match(database, /const operational = await syncOperationalMetaAds/);
assert.match(database, /export async function completeExpiredSubjectAds/);
assert.match(database, /DATE\(a\.end_date\) < DATE\('now', '\+9 hours'\)/);
assert.match(database, /export async function syncGuardianSubjectAdLifecycle/);
assert.match(database, /minimumAgeMinutes: 4/);
assert.match(database, /meta\.state === "active" \? "ad_active"/);
assert.match(database, /WHERE a\.status = 'ready'[\s\S]+a\.meta_published_at IS NOT NULL[\s\S]+a\.meta_ad_id/);
assert.match(database, /SET status = \?, meta_status = \?, meta_last_error = NULL/);
assert.match(database, /eventKey: "ad\.started"/);
assert.match(route, /process\.env\.CRON_SECRET/);
assert.match(route, /timingSafeEqual/);
assert.match(route, /syncSubjectAdLifecycle\(\)/);
assert.match(accountRoute, /getServerSession\(authOptions\)/);
assert.match(accountRoute, /syncGuardianSubjectAdLifecycle\(session\)/);
assert.match(workflow, /cron: "2-57\/5 \* \* \* \*"/);
assert.match(workflow, /secrets\.CRON_SECRET/);
assert.match(workflow, /https:\/\/zezari\.family\/api\/cron\/meta-ad-status/);
assert.match(dashboard, /return "rejected"/);
assert.match(dashboard, /return "paused"/);
assert.match(dashboard, /광고 중단/);
assert.match(dashboard, /광고 반려/);
assert.match(dashboard, /reviewEnabled=/);
assert.match(dashboard, /nextExpiryDate=/);
assert.match(autoSync, /5 \* 60 \* 1000/);
assert.match(autoSync, /T23:59:59\+09:00/);
assert.match(autoSync, /document\.visibilityState === "hidden"/);
assert.match(autoSync, /document\.addEventListener\("visibilitychange"/);
assert.match(styles, /\.ad-history-status\.rejected/);
assert.match(styles, /\.ad-history-status\.paused/);

console.log("Meta advertisement status synchronization regression checks passed.");
