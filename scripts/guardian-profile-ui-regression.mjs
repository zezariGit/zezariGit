import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../app/account/guardian-profile-form.js", import.meta.url), "utf8");
const page = await readFile(new URL("../app/account/profile/page.js", import.meta.url), "utf8");
const actions = await readFile(new URL("../app/actions.js", import.meta.url), "utf8");
const db = await readFile(new URL("../lib/db.js", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

assert.match(page, /previewState = \["phone-change", "completed"\]/, "보호자 정보 상태별 미리보기를 제공해야 합니다.");
assert.match(component, /<strong>이름<\/strong>/, "이름 수정 항목이 있어야 합니다.");
assert.match(component, /<legend>성별<\/legend>/, "성별 수정 항목이 있어야 합니다.");
assert.match(component, /<legend>생년월일<\/legend>/, "생년월일 수정 항목이 있어야 합니다.");
assert.match(component, /<strong>휴대전화번호<\/strong>/, "휴대전화번호 수정 항목이 있어야 합니다.");
assert.match(component, /번호 변경/, "휴대전화번호 변경 진입 버튼이 있어야 합니다.");
assert.match(component, /purpose: "guardian_phone_change"/, "새 휴대전화번호 인증을 별도 목적으로 요청해야 합니다.");
assert.match(component, /Array\.from\(\{ length: 6 \}/, "인증번호는 6개 칸으로 입력해야 합니다.");
assert.match(component, /!phoneChanged \|\| phoneVerified/, "번호 변경 시 인증 완료 전에는 저장할 수 없어야 합니다.");
assert.doesNotMatch(component, /profile-social-login|socialProviderLabel|비밀번호 변경|아이디.*중복확인/, "아이디, 비밀번호 및 SNS 항목을 표시하지 않아야 합니다.");
assert.match(actions, /redirect\(withNotice\("\/\?panel=my", "보호자 정보가 수정되었습니다\."\)\)/, "저장 후 설정 화면에 완료 안내를 표시해야 합니다.");
assert.match(db, /profileSettings \? String\(current\.guardian\.login_id \|\| ""\)/, "프로필 수정 시 기존 로그인 아이디를 보존해야 합니다.");
assert.match(db, /purpose: "guardian_phone_change"[\s\S]*guardianId: current\.guardian\.id/, "변경된 휴대전화번호 인증을 서버에서 소비해야 합니다.");
assert.doesNotMatch(db, /adminMayBypassPhoneVerification/, "관리자도 새 휴대전화번호 인증을 생략할 수 없어야 합니다.");
assert.match(css, /\.profile-verification-row[\s\S]*repeat\(6, minmax\(0, 1fr\)\)/, "6자리 인증번호 입력 레이아웃이 있어야 합니다.");

console.log("Guardian profile UI regression checks passed.");
