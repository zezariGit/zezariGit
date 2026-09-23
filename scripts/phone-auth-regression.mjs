import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { rm } from "node:fs/promises";

const databasePath = path.join(os.tmpdir(), `zezari-phone-auth-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "phone-auth-regression-secret";
process.env.SMS_DEV_BYPASS_CODE = "123456";
process.env.NODE_ENV = "test";

const {
  authenticateGuardianPhone,
  createGuardianSignup,
  requestSignupPhoneVerification,
  verifySignupPhoneCode,
} = await import("../lib/db.js");

const phone = "010-9321-4567";
let requestIndex = 0;
const requestMeta = () => ({ ipAddress: `127.0.0.${++requestIndex}`, userAgent: "phone-auth-regression" });

await requestSignupPhoneVerification({ phone, purpose: "signup" }, null, requestMeta());
const signupVerification = await verifySignupPhoneCode({ phone, code: "123456", purpose: "signup" });
assert.equal(signupVerification.registered, false);

const guardian = await createGuardianSignup({
  phone,
  phoneVerificationToken: signupVerification.phoneVerificationToken,
  name: "휴대폰보호자",
  gender: "여성",
  birthDate: "1990-01-01",
  privacyAgreed: true,
  serviceAgreed: true,
  notificationAgreed: false,
});
assert.ok(guardian.phoneLoginToken);

const automaticLogin = await authenticateGuardianPhone(phone, guardian.phoneLoginToken, requestMeta());
assert.equal(automaticLogin?.provider, "phone");
assert.equal(automaticLogin?.phone, phone);
await assert.rejects(
  () => authenticateGuardianPhone(phone, guardian.phoneLoginToken, requestMeta()),
  /만료되었습니다/,
);

await requestSignupPhoneVerification({ phone, purpose: "signup" }, null, requestMeta());
const existingSignup = await verifySignupPhoneCode({ phone, code: "123456", purpose: "signup" });
assert.equal(existingSignup.registered, true);

await requestSignupPhoneVerification({ phone, purpose: "phone_login" }, null, requestMeta());
const loginVerification = await verifySignupPhoneCode({ phone, code: "123456", purpose: "phone_login" });
assert.equal(loginVerification.registered, true);
assert.equal((await authenticateGuardianPhone(phone, loginVerification.phoneVerificationToken, requestMeta()))?.name, "휴대폰보호자");

const newPhone = "010-9321-4568";
await requestSignupPhoneVerification({ phone: newPhone, purpose: "phone_login" }, null, requestMeta());
const unregisteredLogin = await verifySignupPhoneCode({ phone: newPhone, code: "123456", purpose: "phone_login" });
assert.equal(unregisteredLogin.registered, false);
assert.equal(await authenticateGuardianPhone(newPhone, unregisteredLogin.phoneVerificationToken, requestMeta()), null);

await rm(databasePath, { force: true }).catch(() => {});
console.log("Phone-only authentication regression passed.");
