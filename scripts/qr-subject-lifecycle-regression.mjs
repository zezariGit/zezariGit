import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const [database, findPage, adminPage, migration] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/find/[key]/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../migrations/0052_subject_qr_lifecycle.sql", import.meta.url), "utf8"),
]);

assert.match(database, /const DB_SCHEMA_VERSION = 52/);
assert.match(database, /DELETE FROM qr_codes WHERE subject_id IS NULL/);
assert.match(migration, /DELETE FROM qr_codes[\s\S]*WHERE subject_id IS NULL/);
assert.match(database, /export async function getQrAdminData[\s\S]*await ensureSchema\(\)/);
assert.doesNotMatch(database, /ensureInitialQrCodes/);
assert.doesNotMatch(database, /async function insertQrCodes/);
assert.match(database, /async function assignQrToSubject[\s\S]*const record = await createUniqueQrRecord\(db\)[\s\S]*INSERT INTO qr_codes[\s\S]*'subject_registration', 'in_use'/);
assert.match(database, /export async function generateQrCodes[\s\S]*QR은 관리대상자를 등록할 때 자동 생성됩니다/);
assert.match(findPage, /!data\.qr_active \|\| data\.qr_lifecycle_status === "discarded"[\s\S]*<QrStatusScreen type="expired"/);
assert.doesNotMatch(adminPage, /action=\{generateQrCodesAction\}/);
assert.doesNotMatch(adminPage, /action=\{setQrActiveAction\}/);
assert.doesNotMatch(adminPage, /action=\{setQrStoreSaleReservationAction\}/);

const db = createClient({ url: "file::memory:" });
await db.execute(`CREATE TABLE qr_codes (
  id TEXT PRIMARY KEY,
  subject_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  lifecycle_status TEXT NOT NULL DEFAULT 'unused',
  discarded_at TEXT
)`);
await db.batch([
  { sql: "INSERT INTO qr_codes (id, subject_id, lifecycle_status) VALUES ('matched', 'subject-1', 'in_use')", args: [] },
  { sql: "INSERT INTO qr_codes (id, subject_id, lifecycle_status) VALUES ('unmatched', NULL, 'unused')", args: [] },
  { sql: "INSERT INTO qr_codes (id, subject_id, is_active, lifecycle_status) VALUES ('old-discarded', NULL, 0, 'discarded')", args: [] },
]);
await db.execute("DELETE FROM qr_codes WHERE subject_id IS NULL");
const rowsAfterCleanup = await db.execute("SELECT id FROM qr_codes ORDER BY id");
assert.deepEqual(rowsAfterCleanup.rows.map((row) => String(row.id)), ["matched"]);
await db.execute(`UPDATE qr_codes
  SET subject_id = NULL,
      is_active = 0,
      lifecycle_status = 'discarded',
      discarded_at = COALESCE(discarded_at, CURRENT_TIMESTAMP)
  WHERE id = 'matched'`);
const discarded = await db.execute("SELECT subject_id, is_active, lifecycle_status, discarded_at FROM qr_codes WHERE id = 'matched'");
assert.equal(discarded.rows[0]?.subject_id, null);
assert.equal(Number(discarded.rows[0]?.is_active), 0);
assert.equal(discarded.rows[0]?.lifecycle_status, "discarded");
assert.ok(discarded.rows[0]?.discarded_at);
db.close();

console.log("QR subject lifecycle regression checks passed.");
