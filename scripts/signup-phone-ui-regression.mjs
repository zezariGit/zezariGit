import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const db = await readFile(new URL("../lib/db.js", import.meta.url), "utf8");

assert.match(component, /function formatPhoneNumber\(value\)/, "phone number formatter is required");
assert.match(component, /function isValidMobilePhone\(value\)/, "mobile phone validation helper is required");
assert.match(component, /\^010\\d\{8\}\$/, "010 numbers must contain eleven digits");
assert.match(component, /placeholder="010-0000-0000"/, "phone placeholder should match the reference");
assert.match(component, /disabled=\{phoneVerificationLoading \|\| !signupPhoneValid\}/, "send buttons require a valid phone number");
assert.match(component, /codeRequested \? "인증코드 다시 받기" : "인증코드 받기"/, "send label should change after a request");
assert.match(component, /setCodeSeconds\(data\.expiresInSeconds \|\| 180\)/, "verification timer should start at three minutes");
assert.match(component, /disabled=\{phoneVerificationLoading \|\| !signupCodeReady\}/, "confirm requires six valid digits and an active timer");
assert.match(component, /인증번호가 일치하지 않습니다\. 다시 확인해 주세요\./, "mismatch error should be explicit");
assert.match(component, /인증시간이 만료되었습니다\. 인증번호를 다시 받아주세요\./, "expiry error should be explicit");
assert.match(component, /휴대전화번호를 정확하게 입력해 주세요\./, "phone length error should be explicit");
assert.match(component, /setSignupStep\("profile"\)/, "successful verification should open profile entry");
assert.match(css, /\.signup-phone-step \.verification-code-row\.invalid input\s*\{[^}]*border-color: #ff4d57/s, "invalid codes need red borders");
assert.match(css, /\.signup-phone-step \.login-submit:disabled\s*\{[^}]*background: #f1f3f4/s, "disabled actions need the neutral reference style");
assert.match(css, /\.signup-phone-notice\s*\{/, "privacy notice panel is required");
assert.match(db, /\^010\\d\{8\}\$/, "server validation must also require eleven-digit 010 numbers");

console.log("Signup phone UI regression checks passed.");
