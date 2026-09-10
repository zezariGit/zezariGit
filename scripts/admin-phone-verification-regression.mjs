import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";

const databasePath = path.join(os.tmpdir(), `zezari-admin-phone-${Date.now()}.db`).replaceAll("\\", "/");
process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
process.env.TURSO_AUTH_TOKEN = "local-test-token";
process.env.NEXTAUTH_SECRET = "admin-phone-regression-secret";
process.env.SMS_DEV_BYPASS_CODE = "123456";
process.env.ADMIN_EMAILS = "general@zezari.com";
process.env.NODE_ENV = "test";

const {
  authenticateGuardianCredentials,
  createGuardianSignup,
  ensureSchema,
  requestSignupPhoneVerification,
  saveGuardianProfile,
  setGuardianAdmin,
  verifySignupPhoneCode,
} = await import("../lib/db.js");

await ensureSchema();

async function createVerifiedGuardian({ phone, email, loginId, requestLabel }) {
  await requestSignupPhoneVerification(
    { phone, purpose: "signup" },
    null,
    requestMeta(requestLabel),
  );
  const verification = await verifySignupPhoneCode({ phone, code: "123456", purpose: "signup" });
  return createGuardianSignup({
    name: "인증 테스트",
    birthDate: "1990-01-01",
    gender: "남성",
    phone,
    email,
    loginId,
    password: "Admin123!",
    phoneVerificationToken: verification.phoneVerificationToken,
    privacyAgreed: true,
    serviceAgreed: true,
  });
}

const configuredAdminPhone = "010-1111-2222";
await createVerifiedGuardian({
  phone: configuredAdminPhone,
  email: "general@zezari.com",
  loginId: "configured_admin",
  requestLabel: "configured-admin",
});
const configuredAdminResend = await requestSignupPhoneVerification(
  { phone: configuredAdminPhone, purpose: "signup" },
  null,
  requestMeta("configured-admin"),
);
assert.equal(configuredAdminResend.phone, "010-1111-2222");

const roleAdminPhone = "010-2222-3333";
const roleAdmin = await createVerifiedGuardian({
  phone: roleAdminPhone,
  email: "role-admin@example.com",
  loginId: "role_admin",
  requestLabel: "role-admin",
});
const adminForm = new FormData();
adminForm.set("guardianId", roleAdmin.id);
adminForm.set("admin", "1");
await setGuardianAdmin(adminForm);
const roleAdminResend = await requestSignupPhoneVerification(
  { phone: roleAdminPhone, purpose: "signup" },
  null,
  requestMeta("role-admin"),
);
assert.equal(roleAdminResend.phone, "010-2222-3333");

const roleAdminVerification = await verifySignupPhoneCode({
  phone: roleAdminPhone,
  code: "123456",
  purpose: "signup",
});
await assert.rejects(
  createGuardianSignup({
    name: "중복 가입 차단",
    birthDate: "1990-01-01",
    gender: "남성",
    phone: roleAdminPhone,
    email: "duplicate@example.com",
    loginId: "duplicate_admin",
    password: "Admin123!",
    phoneVerificationToken: roleAdminVerification.phoneVerificationToken,
    privacyAgreed: true,
    serviceAgreed: true,
  }),
  /이미 가입된 휴대폰 번호입니다/,
);

const roleAdminUser = await authenticateGuardianCredentials("role_admin", "Admin123!");
const changedAdminPhone = "010-2222-9999";
await saveGuardianProfile(
  { user: { id: roleAdminUser.id, email: roleAdminUser.email, provider: "credentials" } },
  profileForm({ phone: changedAdminPhone, loginId: "role_admin" }),
);

const regularPhone = "010-3333-4444";
await createVerifiedGuardian({
  phone: regularPhone,
  email: "regular@example.com",
  loginId: "regular_user",
  requestLabel: "regular-user",
});
const regularUser = await authenticateGuardianCredentials("regular_user", "Admin123!");
await assert.rejects(
  saveGuardianProfile(
    { user: { id: regularUser.id, email: regularUser.email, provider: "credentials" } },
    profileForm({ phone: "010-3333-9999", loginId: "regular_user" }),
  ),
  /휴대폰 인증을 먼저 완료해 주세요/,
);
await assert.rejects(
  requestSignupPhoneVerification(
    { phone: regularPhone, purpose: "signup" },
    null,
    requestMeta("regular-user"),
  ),
  /이미 가입된 휴대폰 번호입니다/,
);

function requestMeta(label) {
  return {
    ipAddress: `test-${label}`,
    userAgent: "admin-phone-verification-regression",
  };
}

console.log("Administrator signup phone verification regression passed.");

function profileForm({ phone, loginId }) {
  const form = new FormData();
  form.set("guardianName", "인증 테스트");
  form.set("loginId", loginId);
  form.set("phone", phone);
  form.set("birthDate", "1990-01-01");
  form.set("gender", "남성");
  form.set("email", "");
  form.set("profileSettings", "1");
  return form;
}
