import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const db = await readFile(new URL("../lib/db.js", import.meta.url), "utf8");

assert.match(component, /function formatPhoneNumber\(value\)/, "phone number formatter is required");
assert.match(component, /function isValidMobilePhone\(value\)/, "mobile phone validation helper is required");
assert.match(component, /\^010\\d\{8\}\$/, "010 numbers must contain eleven digits");
assert.match(component, /placeholder="010-0000-0000"/, "phone placeholder should match the reference");
assert.match(component, /disabled=\{loading \|\| !phoneValid \|\| Boolean\(verifiedPhone\)\}/, "send buttons require a valid phone number");
assert.match(component, /codeRequested \? "인증번호 다시 받기" : "인증번호 받기"/, "send label should change after a request");
assert.match(component, /setSeconds\(data\.expiresInSeconds \|\| 180\)/, "verification timer should start at three minutes");
assert.match(component, /disabled=\{loading \|\| !codeReady \|\| Boolean\(verifiedPhone\)\}/, "confirm requires six valid digits and an active timer");
assert.match(component, /인증시간이 만료되었습니다\. 인증번호를 다시 받아 주세요\./, "expiry error should be explicit");
assert.match(component, /이미 가입된 휴대폰번호입니다\./, "existing signup numbers need a dedicated dialog");
assert.match(css, /\.phone-code-row\.is-invalid input\s*\{[^}]*border-color: #ec5353/s, "invalid codes need red borders");
assert.match(css, /\.phone-auth-primary:disabled\s*\{[^}]*background: #e8ece9/s, "disabled actions need the neutral reference style");
assert.match(css, /\.phone-login-notice\s*\{/, "login completion notice panel is required");
assert.match(db, /\^010\\d\{8\}\$/, "server validation must also require eleven-digit 010 numbers");

console.log("Signup phone UI regression checks passed.");
