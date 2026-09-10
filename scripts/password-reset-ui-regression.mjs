import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../app/password-reset-panel.js", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

assert.match(component, /function formatPhoneInput\(value\)/, "phone formatting is required");
assert.match(component, /function isValidMobilePhone\(value\)/, "phone validation is required");
assert.match(component, /disabled=\{!validPhone \|\| loading\}/, "code request requires a valid phone number");
assert.match(component, /setCodeSeconds\(data\.expiresInSeconds \|\| 180\)/, "code request starts a three-minute timer");
assert.match(component, /placeholder="인증번호 6자리"/, "a single six-digit code field is required");
assert.match(component, /maxLength=\{6\}/, "verification code is limited to six digits");
assert.match(component, /disabled=\{completeCode\.length !== 6 \|\| codeSeconds <= 0 \|\| loading\}/, "confirm requires six digits within the timer");
assert.match(component, /인증번호가 일치하지 않습니다\. 다시 입력해 주세요\./, "mismatch error is explicit");
assert.match(component, /인증시간이 만료되었습니다\. 인증번호를 다시 받아주세요\./, "expiry error is explicit");
assert.match(component, /function maskPhoneNumber\(value\)/, "verified phone number is masked");
assert.match(component, /setStep\("password"\)/, "verification switches the existing panel to password entry");
assert.match(component, /type=\{showNewPassword \? "text" : "password"\}/, "new password visibility can be toggled");
assert.match(component, /type=\{showConfirmPassword \? "text" : "password"\}/, "confirmation visibility can be toggled");
assert.match(component, /newPassword\.length >= 8/, "password requires at least eight characters");
assert.match(component, /\[A-Za-z\]/, "password requires a letter");
assert.match(component, /\\d/, "password requires a number");
assert.match(component, /\[\^A-Za-z0-9\]/, "password requires a special character");
assert.match(component, /onComplete\(\{ loginId: data\.loginId \|\| "" \}\)/, "successful reset returns to login through the parent");
assert.match(css, /\.password-reset-code-field\.invalid\s*\{[^}]*border-color: #ff4d57/s, "invalid code field uses the error color");
assert.doesNotMatch(component, /휴대전화번호 인증이 완료되었습니다\./, "verification success copy is removed from the password step");
assert.match(component, /<\/label>\s*<p className="password-reset-password-help">\s*영문, 숫자, 특수문자를 조합하여 8자 이상 입력해 주세요\./s, "password guidance follows the new password field");
assert.match(css, /\.password-reset-password-help\s*\{[^}]*text-align: left;[^}]*white-space: nowrap;/s, "password guidance stays gray, left aligned, and on one line");
assert.doesNotMatch(css, /\.password-reset-password-help\.valid/, "password guidance never changes to green");
assert.match(css, /\.password-reset-password-field button svg\s*\{/, "password visibility controls are styled");

console.log("Password reset UI regression checks passed.");
