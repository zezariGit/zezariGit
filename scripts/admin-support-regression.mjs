import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";

const databasePath = path.join(os.tmpdir(), `zezari-admin-support-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "admin-support-regression-secret";
process.env.ADMIN_PHONES = "010-1111-2222";
process.env.NODE_ENV = "test";

const {
  endAdminSupportSession,
  ensureSchema,
  getAdminSupportUsersData,
  getPushSubscriptionsByGuardianId,
  isDbAdminSession,
  startAdminSupportSession,
} = await import("../lib/db.js");
const { isAdminSession } = await import("../lib/admin.js");

await ensureSchema();
const db = createClient({ url: process.env.TURSO_DATABASE_URL });
const adminId = "guardian-admin-support";
const adminGoogleId = "phone:01011112222";
const targetId = "guardian-target-support";
const targetGoogleId = "phone:01022223333";

await db.batch([
  guardianInsert(adminId, adminGoogleId, "지원 관리자", "010-1111-2222", 1),
  guardianInsert(targetId, targetGoogleId, "지원 보호자", "010-2222-3333", 0),
  ...Array.from({ length: 23 }, (_, index) => guardianInsert(
    `guardian-support-${index}`,
    `phone:0109000${String(index).padStart(4, "0")}`,
    `보호자 ${String(index + 1).padStart(2, "0")}`,
    `010-9000-${String(index).padStart(4, "0")}`,
    0,
  )),
], "write");

const firstPage = await getAdminSupportUsersData();
assert.equal(firstPage.pageSize, 20);
assert.equal(firstPage.users.length, 20);
assert.equal(firstPage.total, 25);
assert.equal(firstPage.totalPages, 2);
const secondPage = await getAdminSupportUsersData({ page: 2 });
assert.equal(secondPage.users.length, 5);
const searchResult = await getAdminSupportUsersData({ query: "지원 보호자" });
assert.equal(searchResult.total, 1);
assert.equal(searchResult.users[0].id, targetId);

const adminSession = {
  user: {
    id: adminGoogleId,
    name: "지원 관리자",
    phone: "010-1111-2222",
    provider: "phone",
  },
};
assert.equal(isAdminSession(adminSession), true);
assert.equal(await isDbAdminSession(adminSession), true);

const support = await startAdminSupportSession(adminSession, targetId, {
  ipAddress: "127.0.0.1",
  userAgent: "admin-support-regression",
});
assert.equal(support.actor.id, adminId);
assert.equal(support.target.id, targetId);

const supportSession = {
  user: {
    id: targetGoogleId,
    phone: "010-2222-3333",
    provider: "support",
    supportMode: true,
    supportSessionId: support.supportSessionId,
    adminActorGuardianId: adminId,
  },
};
assert.equal(isAdminSession(supportSession), false);
assert.equal(await isDbAdminSession(supportSession), false);

await db.execute({
  sql: `INSERT INTO push_subscriptions (id, guardian_id, endpoint, subscription_json)
    VALUES (?, ?, ?, ?)`,
  args: [
    "push-admin-support",
    adminId,
    "https://fcm.googleapis.com/admin-support-endpoint",
    JSON.stringify({
      endpoint: "https://fcm.googleapis.com/admin-support-endpoint",
      keys: { p256dh: "support-key", auth: "support-auth" },
    }),
  ],
});
const mirroredSubscriptions = await getPushSubscriptionsByGuardianId(targetId);
assert.equal(mirroredSubscriptions.length, 1);
assert.equal(mirroredSubscriptions[0].endpoint, "https://fcm.googleapis.com/admin-support-endpoint");

const restoredActor = await endAdminSupportSession(supportSession);
assert.equal(restoredActor.id, adminId);
assert.equal(restoredActor.google_id, adminGoogleId);
assert.equal((await getPushSubscriptionsByGuardianId(targetId)).length, 0);

const auditResult = await db.execute({
  sql: "SELECT status, ended_at, end_reason FROM admin_support_sessions WHERE id = ?",
  args: [support.supportSessionId],
});
assert.equal(auditResult.rows[0].status, "ended");
assert.ok(auditResult.rows[0].ended_at);
assert.equal(auditResult.rows[0].end_reason, "admin_return");

const adminPageSource = fs.readFileSync(new URL("../app/admin/page.js", import.meta.url), "utf8");
const workspaceSource = fs.readFileSync(new URL("../app/admin/admin-workspace.js", import.meta.url), "utf8");
const bannerSource = fs.readFileSync(new URL("../app/support-mode-banner.js", import.meta.url), "utf8");
assert.match(workspaceSource, /label: "사용자지원"/);
assert.match(adminPageSource, /getAdminSupportUsersData/);
assert.match(adminPageSource, /role="columnheader">로그인/);
assert.match(bannerSource, /관리자로 돌아가기/);

db.close();
console.log("Administrator support login regression passed.");

function guardianInsert(id, googleId, name, phone, isAdmin) {
  return {
    sql: `INSERT INTO guardians (
        id, google_id, name, phone, phone_verified_at, birth_date, gender, is_active, is_admin
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, '1990-01-01', '여성', 1, ?)`,
    args: [id, googleId, name, phone, isAdmin],
  };
}
