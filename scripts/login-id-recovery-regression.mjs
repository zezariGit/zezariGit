import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";

const databasePath = path.join(os.tmpdir(), `zezari-login-id-recovery-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "login-id-recovery-regression-secret";
process.env.SMS_DEV_BYPASS_CODE = "123456";
process.env.NODE_ENV = "test";

const {
  createGuardianSignup,
  ensureSchema,
  requestLoginIdPhoneVerification,
  requestSignupPhoneVerification,
  verifyLoginIdPhoneCode,
  verifySignupPhoneCode,
} = await import("../lib/db.js");

await ensureSchema();

const name = "아이디 찾기 테스트";
const phone = "010-4333-2211";
const loginId = "find_user_10";

await requestSignupPhoneVerification({ phone, purpose: "signup" }, null, requestMeta("signup"));
const signupVerification = await verifySignupPhoneCode({ phone, code: "123456", purpose: "signup" });
await createGuardianSignup({
  name,
  birthDate: "1990-01-01",
  gender: "여성",
  phone,
  loginId,
  password: "Start123!",
  phoneVerificationToken: signupVerification.phoneVerificationToken,
  privacyAgreed: true,
  serviceAgreed: true,
});

await assert.rejects(
  requestLoginIdPhoneVerification({ name: "다른 이름", phone }, requestMeta("wrong-name")),
  /가입된 아이디를 확인할 수 없습니다/,
);

const firstSend = await requestLoginIdPhoneVerification({ name, phone }, requestMeta("first"));
assert.equal(firstSend.expiresInSeconds, 180);
await requestLoginIdPhoneVerification({ name, phone }, requestMeta("resend"));

const inspectionDb = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const verificationRows = await inspectionDb.execute({
  sql: `SELECT status, COUNT(*) AS count
    FROM phone_verifications
    WHERE phone = ? AND purpose = 'login_id_recovery'
    GROUP BY status`,
  args: [phone],
});
const statusCounts = Object.fromEntries(
  verificationRows.rows.map((row) => [String(row.status), Number(row.count || 0)]),
);
assert.equal(statusCounts.superseded, 1);
assert.equal(statusCounts.sent, 1);

await assert.rejects(
  verifyLoginIdPhoneCode({ name, phone, code: "000000" }),
  /인증번호가 일치하지 않습니다/,
);

const recovered = await verifyLoginIdPhoneCode({ name, phone, code: "123456" });
assert.equal(recovered.loginId, loginId);
await assert.rejects(
  verifyLoginIdPhoneCode({ name, phone, code: "123456" }),
  /인증번호를 다시 받아 주세요/,
);

inspectionDb.close();
console.log("Login ID recovery regression passed.");

function requestMeta(label) {
  return {
    ipAddress: `test-${label}`,
    userAgent: "login-id-recovery-regression",
  };
}
