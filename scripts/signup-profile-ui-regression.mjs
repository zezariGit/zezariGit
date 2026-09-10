import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/auth-actions.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const db = fs.readFileSync(new URL("../lib/db.js", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../app/page.js", import.meta.url), "utf8");

assert.match(source, /name="signupGender"[\s\S]*name="signupGender"/, "성별 항목은 하나의 라디오 그룹이어야 합니다.");
assert.match(source, /aria-label="출생 연도"[\s\S]*aria-label="출생 월"[\s\S]*aria-label="출생 일"/, "생년월일은 세 개의 선택 상자여야 합니다.");
assert.match(source, /value=\{verifiedPhone\} readOnly/, "인증된 휴대전화번호는 수정할 수 없어야 합니다.");
assert.match(source, /disabled=\{signupLoading \|\| !signupProfileReady\}/, "필수 입력 전에는 회원가입 버튼이 비활성화되어야 합니다.");
assert.match(source, /const signupProfileReady =[\s\S]*&& requiredTermsAgreed;/, "필수 약관이 버튼 활성화 조건에 포함되어야 합니다.");
assert.doesNotMatch(source.match(/const signupProfileReady =[\s\S]*?;/)?.[0] || "", /notificationAgreed/, "선택 알림 동의는 버튼 활성화 조건에 포함되면 안 됩니다.");
assert.match(source, /setSignupStep\("done"\)/, "가입 성공 후 완료 화면으로 이동해야 합니다.");
assert.doesNotMatch(source, /휴대폰 인증이 완료되었습니다\./, "정보 입력 화면 아래에 인증 완료 문구를 표시하지 않아야 합니다.");
assert.match(css, /\.signup-profile-terms\s*\{[^}]*gap: 5px;/s, "약관 동의 항목의 세로 간격은 좁게 유지되어야 합니다.");
assert.match(css, /\.signup-profile-terms input\[type="checkbox"\]\s*\{[^}]*height: 16px;[^}]*min-height: 16px;/s, "약관 체크박스는 공통 입력 높이에 늘어나지 않아야 합니다.");
assert.match(css, /\.signup-profile-terms input\[type="checkbox"\]:focus\s*\{[^}]*box-shadow: none;/s, "선택한 약관 체크박스의 포커스 테두리는 행 높이를 늘리지 않아야 합니다.");
assert.match(source, /회원가입이 완료되었습니다![\s\S]*로그인 후 제자리 서비스를 이용해 주세요\.[\s\S]*로그인하기/, "완료 화면 문구와 로그인 버튼이 있어야 합니다.");
assert.match(source, /setMode\("login"\);[\s\S]*setSignupStep\("phone"\)/, "완료 화면의 로그인 버튼은 로그인 화면으로 이동해야 합니다.");
assert.match(css, /\.signup-profile-form/);
assert.match(css, /\.signup-profile-form > \.login-submit:disabled/);
assert.match(css, /\.signup-complete-reference/);
assert.match(db, /marketing_notifications_agreed_at/);
assert.match(db, /gender TEXT/);
assert.match(page, /process\.env\.NODE_ENV === "development"[\s\S]*preview === "signup-complete"/, "완료 화면 미리보기는 개발 환경에서만 허용해야 합니다.");

console.log("signup profile UI regression checks passed");
