import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";

const db = createClient({ url: "file::memory:" });

await db.batch([
  {
    sql: `CREATE TABLE qr_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      public_key TEXT NOT NULL UNIQUE,
      target_url TEXT NOT NULL,
      guardian_id TEXT,
      subject_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      lifecycle_status TEXT NOT NULL DEFAULT 'unused',
      signup_claim_hash TEXT,
      signup_claim_expires_at TEXT,
      signup_claim_started_at TEXT,
      store_sale_reserved INTEGER NOT NULL DEFAULT 0,
      store_sale_reserved_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    args: [],
  },
  {
    sql: "CREATE UNIQUE INDEX idx_qr_subject ON qr_codes(subject_id)",
    args: [],
  },
]);

const exactQrId = randomUUID();
const exactPublicKey = "zrf-regressionexact01";
const exactTokenHash = sha256("A".repeat(43));
await insertQr(exactQrId, "ZRF-TEST-0001", exactPublicKey);
await setStoreSaleReservation(exactPublicKey, true);
await reserveQr(exactPublicKey, exactTokenHash);

const exactSubjectId = randomUUID();
const guardianId = randomUUID();
const exactAssignment = await assignReservedQr(exactPublicKey, exactTokenHash, guardianId, exactSubjectId);
assert(Number(exactAssignment.rowsAffected || 0) === 1, "스캔한 QR 조건부 연결이 실패했습니다.");
const exactQr = await db.execute({
  sql: "SELECT subject_id, guardian_id, signup_claim_hash, store_sale_reserved FROM qr_codes WHERE id = ? LIMIT 1",
  args: [exactQrId],
});
assert(exactQr.rows[0]?.subject_id === exactSubjectId, "스캔한 QR이 지정 대상자와 연결되지 않았습니다.");
assert(exactQr.rows[0]?.guardian_id === guardianId, "스캔한 QR에 보호자가 연결되지 않았습니다.");
assert(!exactQr.rows[0]?.signup_claim_hash, "사용 완료된 QR 예약값이 제거되지 않았습니다.");
assert(Number(exactQr.rows[0]?.store_sale_reserved || 0) === 0, "매칭 완료된 QR의 스토어 판매 선점 상태가 제거되지 않았습니다.");

const reservedQrId = randomUUID();
const reservedPublicKey = "zrf-regressionreserve02";
await insertQr(reservedQrId, "ZRF-TEST-0002", reservedPublicKey);
await setStoreSaleReservation(reservedPublicKey, true);
const normalQrId = randomUUID();
const normalPublicKey = "zrf-regressionnormal03";
await insertQr(normalQrId, "ZRF-TEST-0003", normalPublicKey);

const unselectedClaim = await tryReserveQr(normalPublicKey, sha256("B".repeat(43)));
assert(Number(unselectedClaim.rowsAffected || 0) === 0, "관리자가 선점하지 않은 QR이 가입 절차에 예약되었습니다.");

const available = await db.execute({
  sql: `SELECT id, public_key
    FROM qr_codes
    WHERE subject_id IS NULL
      AND COALESCE(lifecycle_status, 'unused') <> 'discarded'
      AND COALESCE(store_sale_reserved, 0) = 0
      AND (signup_claim_hash IS NULL OR datetime(signup_claim_expires_at) <= CURRENT_TIMESTAMP)
    ORDER BY created_at ASC, id ASC
    LIMIT 1`,
  args: [],
});
assert(available.rows[0]?.public_key === normalPublicKey, "일반 등록이 스토어 판매 선점 QR을 건너뛰지 않았습니다.");

await db.close();
console.log("QR signup claim regression checks passed.");

async function insertQr(id, code, publicKey) {
  await db.execute({
    sql: `INSERT INTO qr_codes (id, code, public_key, target_url, is_active)
      VALUES (?, ?, ?, ?, 1)`,
    args: [id, code, publicKey, `http://localhost:3000/find/${publicKey}`],
  });
}

async function reserveQr(publicKey, tokenHash) {
  const result = await tryReserveQr(publicKey, tokenHash);
  assert(Number(result.rowsAffected || 0) === 1, "스토어 판매 선점 QR 예약이 실패했습니다.");
}

function tryReserveQr(publicKey, tokenHash) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  return db.execute({
    sql: `UPDATE qr_codes
      SET signup_claim_hash = ?,
          signup_claim_expires_at = ?,
          signup_claim_started_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE public_key = ?
        AND subject_id IS NULL
        AND is_active = 1
        AND COALESCE(lifecycle_status, 'unused') <> 'discarded'
        AND store_sale_reserved = 1
        AND (signup_claim_hash IS NULL OR datetime(signup_claim_expires_at) <= CURRENT_TIMESTAMP)`,
    args: [tokenHash, expiresAt, publicKey],
  });
}

function setStoreSaleReservation(publicKey, reserved) {
  return db.execute({
    sql: `UPDATE qr_codes
      SET store_sale_reserved = ?,
          store_sale_reserved_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
          signup_claim_hash = NULL,
          signup_claim_expires_at = NULL,
          signup_claim_started_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE public_key = ? AND subject_id IS NULL`,
    args: [reserved ? 1 : 0, reserved ? 1 : 0, publicKey],
  });
}

function assignReservedQr(publicKey, tokenHash, guardianId, subjectId) {
  return db.execute({
    sql: `UPDATE qr_codes
      SET guardian_id = ?,
          subject_id = ?,
          lifecycle_status = 'in_use',
          signup_claim_hash = NULL,
          signup_claim_expires_at = NULL,
          signup_claim_started_at = NULL,
          store_sale_reserved = 0,
          store_sale_reserved_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE public_key = ?
        AND subject_id IS NULL
        AND is_active = 1
        AND COALESCE(lifecycle_status, 'unused') <> 'discarded'
        AND store_sale_reserved = 1
        AND signup_claim_hash = ?
        AND datetime(signup_claim_expires_at) > CURRENT_TIMESTAMP`,
    args: [guardianId, subjectId, publicKey, tokenHash],
  });
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
