import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/auth-actions.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const db = fs.readFileSync(new URL("../lib/db.js", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../app/page.js", import.meta.url), "utf8");

assert.match(source, /name="signupGender"[\s\S]*name="signupGender"/, "성별 항목은 하나의 라디오 그룹이어야 합니다.");
assert.match(source, /profile\.birthYear[\s\S]*profile\.birthMonth[\s\S]*profile\.birthDay/, "생년월일은 세 개의 선택 상자여야 합니다.");
assert.match(source, /disabled=\{Boolean\(verifiedPhone\)\}/, "인증된 휴대전화번호는 수정할 수 없어야 합니다.");
assert.match(source, /disabled=\{disabled \|\| !profileReady\}/, "필수 입력 전에는 회원가입 버튼이 비활성화되어야 합니다.");
assert.match(source, /profile\.privacyAgreed[\s\S]*profile\.serviceAgreed/, "필수 약관이 버튼 활성화 조건에 포함되어야 합니다.");
assert.match(source, /signIn\("phone", \{[\s\S]*phoneLoginToken/, "가입 완료 후 휴대폰 계정으로 자동 로그인해야 합니다.");
assert.doesNotMatch(source, /아이디를 입력|비밀번호를 입력|setSignupStep\("done"\)/, "아이디와 비밀번호 가입 단계를 표시하지 않아야 합니다.");
assert.match(css, /\.phone-terms-section\s*\{/);
assert.match(css, /\.phone-profile-gender label\s*\{[^}]*min-width: 74px;[^}]*min-height: 28px;[^}]*cursor: pointer;/s, "성별은 테두리 선택 박스가 아닌 라디오 항목이어야 합니다.");
assert.match(css, /\.phone-profile-birth > div\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/s, "생년월일 선택 상자는 같은 너비여야 합니다.");
assert.match(css, /\.phone-terms-section h2\s*\{[^}]*font-size: 15px;/s, "약관 동의 제목은 회원 정보 항목 제목과 같은 크기여야 합니다.");
assert.match(css, /\.profile-section \.phone-signup-heading h2\s*\{[^}]*font-size: 27px;/s, "회원 정보 제목은 기본 항목 제목의 1.8배여야 합니다.");
assert.match(css, /\.phone-signup-content \.phone-code-row input,\s*\.phone-signup-content \.phone-code-confirm\s*\{[^}]*height: 40px;[^}]*min-height: 40px;/s, "인증번호 입력칸과 완료 버튼 높이는 동일해야 합니다.");
assert.match(css, /\.phone-signup-submit\s*\{/);
assert.match(db, /marketing_notifications_agreed_at/);
assert.match(db, /gender TEXT/);
assert.match(page, /phone-signup-profile/, "회원정보 입력 미리보기는 개발 환경에서만 허용해야 합니다.");

console.log("signup profile UI regression checks passed");
