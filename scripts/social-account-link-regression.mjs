import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

const databasePath = path.join(os.tmpdir(), `zezari-social-link-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "social-link-regression-secret";
process.env.SMS_DEV_BYPASS_CODE = "123456";
process.env.NODE_ENV = "test";

const {
  completeGuardianSignup,
  ensureSchema,
  getDashboardData,
  linkSocialAccountByVerifiedPhone,
  requestSignupPhoneVerification,
  verifySignupPhoneCode,
} = await import("../lib/db.js");

const googleSession = {
  user: {
    id: "google-account-existing",
    provider: "google",
    email: "existing-google@example.com",
    name: "기존 보호자",
  },
};
const naverSession = {
  user: {
    id: "naver:new-account",
    provider: "naver",
    email: "new-naver@example.com",
    name: "연결 보호자",
  },
};
const phone = "010-2222-3333";

await ensureSchema();
await getDashboardData(googleSession, { includeSubjects: false, includeSubscription: false });
await requestSignupPhoneVerification({ phone, purpose: "signup" }, googleSession);
const googleVerification = await verifySignupPhoneCode(
  { phone, code: "123456", purpose: "signup" },
  googleSession
);
await completeGuardianSignup(googleSession, {
  name: "기존 보호자",
  birthDate: "1990-01-01",
  email: "existing-google@example.com",
  phone,
  phoneVerificationToken: googleVerification.phoneVerificationToken,
  privacyAgreed: true,
  serviceAgreed: true,
});
const googleGuardian = (await getDashboardData(googleSession, {
  includeSubjects: false,
  includeSubscription: false,
})).guardian;

await getDashboardData(naverSession, { includeSubjects: false, includeSubscription: false });
const inspection = await requestSignupPhoneVerification({ phone, purpose: "signup" }, naverSession);
assert.equal(inspection.accountLinkRequired, true);
assert.ok(inspection.existingProviders.includes("google"));

for (let attempt = 0; attempt < 2; attempt += 1) {
  const repeatedInspection = await requestSignupPhoneVerification({ phone, purpose: "signup" }, naverSession);
  assert.equal(repeatedInspection.accountLinkRequired, true);
}

const sendResult = await requestSignupPhoneVerification(
  { phone, purpose: "signup", accountLinkConfirmed: true },
  naverSession
);
assert.equal(sendResult.accountLinkPending, true);

const naverVerification = await verifySignupPhoneCode(
  { phone, code: "123456", purpose: "social_account_link" },
  naverSession
);
await linkSocialAccountByVerifiedPhone(naverSession, {
  phone,
  phoneVerificationToken: naverVerification.phoneVerificationToken,
});

const linkedGuardian = (await getDashboardData(naverSession, {
  includeSubjects: false,
  includeSubscription: false,
})).guardian;
assert.equal(linkedGuardian.id, googleGuardian.id);
assert.equal(linkedGuardian.phone, phone);

console.log("Social account link regression passed.");
