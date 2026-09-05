import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutSource = read("app/layout.js");
const buttonSource = read("app/push-notification-button.js");
const clientSource = read("app/push-subscription-client.js");
const syncSource = read("app/push-subscription-sync.js");
const workerSource = read("public/sw.js");
const manifestSource = read("public/manifest.webmanifest");
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

const iconFiles = [
  ["public/icons/zezari-wordmark-v1-48.png", 48],
  ["public/icons/zezari-wordmark-v1-180.png", 180],
  ["public/icons/zezari-wordmark-v1-192.png", 192],
  ["public/icons/zezari-wordmark-v1-512.png", 512],
  ["public/icons/zezari-wordmark-maskable-v1-512.png", 512],
  ["public/icons/zezari-wordmark-badge-v1-96.png", 96],
];
for (const [relativePath, expectedSize] of iconFiles) {
  const metadata = readPngMetadata(relativePath);
  assert(metadata.width === expectedSize && metadata.height === expectedSize, `${relativePath} must be ${expectedSize}px square.`);
}
assert(
  [4, 6].includes(readPngMetadata("public/icons/zezari-wordmark-badge-v1-96.png").colorType),
  "The Android notification badge must include transparency."
);
assert(manifestSource.includes("zezari-wordmark-v1-192.png"), "The PWA manifest must use the versioned wordmark icon.");
assert(manifestSource.includes("zezari-wordmark-maskable-v1-512.png"), "The PWA manifest must include a maskable wordmark icon.");
assert(layoutSource.includes("zezari-wordmark-v1-180.png"), "The page metadata must expose the wordmark Apple touch icon.");
assert(layoutSource.includes("zezari-wordmark-v1-48.png"), "The page metadata must expose the wordmark shortcut icon.");
assert(workerSource.includes('icon: "/icons/zezari-wordmark-v1-192.png"'), "Push notifications must use the wordmark icon.");
assert(workerSource.includes('badge: "/icons/zezari-wordmark-badge-v1-96.png"'), "Push notifications must use the transparent wordmark badge.");

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

function readPngMetadata(relativePath) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  assert(buffer.subarray(1, 4).toString("ascii") === "PNG", `${relativePath} must be a PNG file.`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
