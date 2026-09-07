import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/auth-actions.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const db = fs.readFileSync(new URL("../lib/db.js", import.meta.url), "utf8");

assert.match(source, /name="signupGender"[\s\S]*name="signupGender"/, "성별 항목은 하나의 라디오 그룹이어야 합니다.");
assert.match(source, /aria-label="출생 연도"[\s\S]*aria-label="출생 월"[\s\S]*aria-label="출생 일"/, "생년월일은 세 개의 선택 상자여야 합니다.");
assert.match(source, /value=\{verifiedPhone\} readOnly/, "인증된 휴대전화번호는 수정할 수 없어야 합니다.");
assert.match(source, /disabled=\{signupLoading \|\| !signupProfileReady\}/, "필수 입력 전에는 회원가입 버튼이 비활성화되어야 합니다.");
assert.match(source, /const signupProfileReady =[\s\S]*&& requiredTermsAgreed;/, "필수 약관이 버튼 활성화 조건에 포함되어야 합니다.");
assert.doesNotMatch(source.match(/const signupProfileReady =[\s\S]*?;/)?.[0] || "", /notificationAgreed/, "선택 알림 동의는 버튼 활성화 조건에 포함되면 안 됩니다.");
assert.match(source, /setMode\("login"\);[\s\S]*회원가입이 완료되었습니다/, "가입 성공 후 로그인 화면으로 이동해야 합니다.");
assert.match(css, /\.signup-profile-form/);
assert.match(css, /\.signup-profile-form > \.login-submit:disabled/);
assert.match(db, /marketing_notifications_agreed_at/);
assert.match(db, /gender TEXT/);

console.log("signup profile UI regression checks passed");
