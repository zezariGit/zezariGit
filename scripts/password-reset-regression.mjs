import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";

const databasePath = path.join(os.tmpdir(), `zezari-password-reset-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "password-reset-regression-secret";
process.env.SMS_DEV_BYPASS_CODE = "123456";
process.env.NODE_ENV = "test";

const {
  authenticateGuardianCredentials,
  createGuardianSignup,
  ensureSchema,
  requestPasswordResetPhoneVerification,
  requestSignupPhoneVerification,
  resetGuardianPasswordByPhone,
  verifyPasswordResetPhoneCode,
  verifySignupPhoneCode,
} = await import("../lib/db.js");

await ensureSchema();

const phone = "010-4555-6677";
const loginId = "reset_user";
const initialPassword = "Start123!";
const newPassword = "PasswordReset123!Long";

await requestSignupPhoneVerification(
  { phone, purpose: "signup" },
  null,
  requestMeta("signup"),
);
const signupVerification = await verifySignupPhoneCode({
  phone,
  code: "123456",
  purpose: "signup",
});
await createGuardianSignup({
  name: "비밀번호 재설정 테스트",
  birthDate: "1990-01-01",
  phone,
  email: "password-reset@example.com",
  loginId,
  password: initialPassword,
  phoneVerificationToken: signupVerification.phoneVerificationToken,
  privacyAgreed: true,
  serviceAgreed: true,
});

await assert.rejects(
  requestPasswordResetPhoneVerification(
    { phone: "010-4999-0000" },
    requestMeta("unknown"),
  ),
  /가입된 아이디 계정을 확인할 수 없습니다/,
);

const firstSend = await requestPasswordResetPhoneVerification(
  { phone },
  requestMeta("first-send"),
);
assert.equal(firstSend.phone, phone);
assert.equal(firstSend.expiresInSeconds, 180);

const secondSend = await requestPasswordResetPhoneVerification(
  { phone },
  requestMeta("second-send"),
);
assert.equal(secondSend.phone, phone);

const inspectionDb = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const resetRows = await inspectionDb.execute({
  sql: `SELECT status, COUNT(*) AS count
    FROM phone_verifications
    WHERE phone = ? AND purpose = 'password_reset'
    GROUP BY status`,
  args: [phone],
});
const statusCounts = Object.fromEntries(
  resetRows.rows.map((row) => [String(row.status), Number(row.count || 0)]),
);
assert.equal(statusCounts.superseded, 1);
assert.equal(statusCounts.sent, 1);

await assert.rejects(
  verifyPasswordResetPhoneCode({ phone, code: "000000" }),
  /인증번호가 일치하지 않습니다/,
);

const supersededVerification = await verifyPasswordResetPhoneCode({ phone, code: "123456" });
assert.equal(supersededVerification.phone, phone);
assert.ok(supersededVerification.passwordResetToken);

await requestPasswordResetPhoneVerification(
  { phone },
  requestMeta("post-verification-resend"),
);
await assert.rejects(
  resetGuardianPasswordByPhone({
    phone,
    passwordResetToken: supersededVerification.passwordResetToken,
    newPassword,
  }),
  /인증이 만료되었습니다/,
);

const verification = await verifyPasswordResetPhoneCode({ phone, code: "123456" });
assert.ok(verification.passwordResetToken);

await assert.rejects(
  resetGuardianPasswordByPhone({
    phone,
    passwordResetToken: verification.passwordResetToken,
    newPassword: "weak-password",
  }),
  /8자 이상 영문, 숫자, 특수문자/,
);

const resetResult = await resetGuardianPasswordByPhone({
  phone,
  passwordResetToken: verification.passwordResetToken,
  newPassword,
});
assert.equal(resetResult.loginId, loginId);
assert.equal(await authenticateGuardianCredentials(loginId, initialPassword), null);
assert.ok(await authenticateGuardianCredentials(loginId, newPassword));

await assert.rejects(
  resetGuardianPasswordByPhone({
    phone,
    passwordResetToken: verification.passwordResetToken,
    newPassword: "AnotherPassword123!",
  }),
  /인증이 만료되었습니다/,
);

inspectionDb.close();
console.log("Password reset regression passed.");

function requestMeta(label) {
  return {
    ipAddress: `test-${label}`,
    userAgent: "password-reset-regression",
  };
}
