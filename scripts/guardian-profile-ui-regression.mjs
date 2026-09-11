import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../app/account/guardian-profile-form.js", import.meta.url), "utf8");
const page = await readFile(new URL("../app/account/profile/page.js", import.meta.url), "utf8");
const actions = await readFile(new URL("../app/actions.js", import.meta.url), "utf8");
const db = await readFile(new URL("../lib/db.js", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

assert.match(page, /provider=\{session\.user\?\.provider \|\| "credentials"\}/, "로그인 제공자가 보호자 정보 폼으로 전달되어야 합니다.");
assert.match(page, /socialProvider\(params\?\.provider\)/, "개발 미리보기에서 SNS 채널 표기를 확인할 수 있어야 합니다.");
assert.match(component, /name="loginId" className="profile-social-login" value=\{original\.loginId\} readOnly/, "SNS 계정도 실제 아이디를 읽기 전용으로 표시해야 합니다.");
assert.match(component, /profile-social-provider[\s\S]*socialProviderLabel\(provider\)/, "SNS 로그인 채널은 아이디 입력란 아래에 표시해야 합니다.");
assert.match(component, /google: "구글 로그인 계정"[\s\S]*naver: "네이버 로그인 계정"[\s\S]*kakao: "카카오 로그인 계정"/, "SNS 로그인 채널명이 올바르게 표시되어야 합니다.");
assert.doesNotMatch(component, /profile-password-toggle/, "비밀번호 변경은 접이식 토글을 사용하지 않아야 합니다.");
assert.match(component, /verifyGuardianCurrentPasswordAction\(currentPassword\)/, "현재 비밀번호를 서버에서 확인해야 합니다.");
assert.match(component, /disabled=\{!currentPasswordVerified\}/, "현재 비밀번호 확인 전에는 새 비밀번호 입력이 비활성화되어야 합니다.");
assert.match(component, /setCurrentPassword\(""\)[\s\S]*resetPasswordVerification/, "현재 비밀번호 불일치 시 비밀번호 입력값을 초기화해야 합니다.");
assert.match(actions, /export async function verifyGuardianCurrentPasswordAction/, "현재 비밀번호 확인 서버 액션이 있어야 합니다.");
assert.match(db, /verifyPassword\(currentPassword, guardian\.password_hash\)/, "현재 비밀번호는 저장된 해시와 비교해야 합니다.");
assert.match(css, /\.profile-password-input:has\(input:disabled\)/, "확인 전 비밀번호 입력은 비활성 스타일이어야 합니다.");

console.log("Guardian profile UI regression checks passed.");
