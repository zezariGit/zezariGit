import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, route, database, styles] = await Promise.all([
  readFile(new URL("../app/notification-bell.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/notifications/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(component, /body: JSON\.stringify\(\{ action: "mark-read", id: notification\.id \}\)/);
assert.doesNotMatch(component, /markRead\(\);/);
assert.match(component, /window\.history\.pushState/);
assert.match(component, /window\.addEventListener\("popstate"/);
assert.match(component, /notification-item\$\{unread \? " unread" : ""\}/);
assert.match(route, /markGuardianNotificationRead\(session, payload\?\.id\)/);
assert.match(database, /idx_guardian_notifications_dedupe/);
assert.match(database, /WHERE event_key = \? AND channel = 'push' AND is_auto = 1 AND is_active = 1/);
assert.match(database, /eventKey: "safety\.location_shared"/);
assert.match(database, /eventKey: "ad\.started"/);
assert.match(database, /eventKey: "commerce\.payment_completed"/);
assert.match(styles, /\.notification-list \{[\s\S]*overflow-y: auto/);

console.log("Notification popover regression checks passed.");
