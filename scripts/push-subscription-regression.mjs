import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutSource = read("app/layout.js");
const buttonSource = read("app/push-notification-button.js");
const clientSource = read("app/push-subscription-client.js");
const syncSource = read("app/push-subscription-sync.js");
const workerSource = read("public/sw.js");
const dbSource = read("lib/db.js");
const nextConfigSource = read("next.config.mjs");

new Function(workerSource);

assert(layoutSource.includes("<PushSubscriptionSync />"), "The root layout must mount push recovery globally.");
assert(buttonSource.includes('from "./push-subscription-client"'), "The settings button must use the shared push client.");
assert(buttonSource.includes('new Event("zezari:push-connected")'), "Initial permission grant must start global recovery.");
assert(clientSource.includes('updateViaCache: "none"'), "Service-worker updates must bypass HTTP cache.");
assert(clientSource.includes('fetch("/api/push/subscribe"'), "The current subscription must be saved to the server.");

for (const eventName of ["visibilitychange", "online", "controllerchange", "zezari:push-connected"]) {
  assert(syncSource.includes(eventName), `Global push recovery must listen for ${eventName}.`);
}
assert(syncSource.includes("6 * 60 * 60 * 1000"), "Active devices must resync at least every six hours.");
assert(syncSource.includes("ZEZARI_PUSH_RESYNC_REQUIRED"), "The page must accept service-worker recovery requests.");

assert(workerSource.includes('addEventListener("pushsubscriptionchange"'), "The worker must handle refreshed subscriptions.");
assert(workerSource.includes('fetch("/api/push/subscribe"'), "The worker must persist refreshed subscriptions.");
assert(workerSource.includes("ZEZARI_PUSH_RESYNC_REQUIRED"), "The worker must request page-level recovery after failure.");
assert(workerSource.includes('request.mode === "navigate"'), "Personalized navigations must bypass the service-worker cache.");
assert(workerSource.includes('url.pathname.startsWith("/icons/")'), "Only explicit static assets should be cached.");

const appShell = workerSource.match(/const APP_SHELL = \[([\s\S]*?)\];/)?.[1] || "";
assert(!/["']\/["']/.test(appShell), "The personalized root page must not be pre-cached.");
assert(!appShell.includes("/api/"), "API responses must not be pre-cached.");

assert(nextConfigSource.includes('source: "/sw.js"'), "The worker must have dedicated response headers.");
assert(nextConfigSource.includes("no-cache, no-store, must-revalidate"), "The worker must never be served from a stale cache.");
assert(
  dbSource.includes("subscription?.expirationTime != null"),
  "A missing browser expiration time must remain null instead of becoming zero."
);

console.log("Push subscription regression checks passed.");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
