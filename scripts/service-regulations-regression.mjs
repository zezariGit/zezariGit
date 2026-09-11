import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [db, adminPage, adminWorkspace, adminActions, authActions, socialSignup, modal, editor, apiRoute, shared, css] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/admin-workspace.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/social-signup-completion.js", import.meta.url), "utf8"),
  readFile(new URL("../app/service-regulation-modal.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/service-regulation-editor.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/service-regulations/[type]/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/service-regulations.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(db, /CREATE TABLE IF NOT EXISTS service_regulations/, "서비스 규정 저장 테이블이 필요합니다.");
assert.match(db, /seedServiceRegulations\(db\)/, "세 규정의 기본값을 초기화해야 합니다.");
assert.match(db, /export async function saveServiceRegulation/, "관리자 저장 함수가 필요합니다.");
assert.match(db, /submittedLength > 30000/, "관리자 입력 길이를 서버에서 제한해야 합니다.");
assert.match(adminWorkspace, /서비스 규정 관리/, "관리자 메뉴에 서비스 규정 관리가 있어야 합니다.");
assert.match(adminPage, /service-regulation-tabs/, "개인정보, 서비스이용, 알림 탭을 표시해야 합니다.");
assert.match(adminActions, /관리자 권한이 필요합니다/, "저장 Server Action에서 관리자 권한을 다시 확인해야 합니다.");
assert.match(editor, /FONT_SIZES = \[14, 16, 18, 20, 24\]/, "허용된 글씨 크기만 제공해야 합니다.");
assert.match(editor, /aria-pressed=\{Boolean\(selected\?\.bold\)\}/, "문단 굵기 설정을 제공해야 합니다.");
assert.doesNotMatch(editor + modal, /dangerouslySetInnerHTML/, "규정 내용은 임의 HTML로 렌더링하면 안 됩니다.");
assert.match(authActions, /setOpenRegulationType\("privacy"\)/, "개인정보 자세히 버튼을 연결해야 합니다.");
assert.match(authActions, /setOpenRegulationType\("service"\)/, "서비스 약관 자세히 버튼을 연결해야 합니다.");
assert.match(authActions, /setOpenRegulationType\("notification"\)/, "알림 동의 자세히 버튼을 연결해야 합니다.");
assert.match(socialSignup, /notificationAgreed/, "SNS 회원가입에도 선택 알림 동의를 제공해야 합니다.");
assert.match(db, /marketing_notifications_agreed_at = CASE WHEN \? = 1/, "SNS 알림 동의 결과를 저장해야 합니다.");
assert.match(modal, /cache: "no-store"/, "팝업을 열 때 최신 저장 내용을 다시 조회해야 합니다.");
assert.match(apiRoute, /NO_STORE_HEADERS/, "공개 규정 API 응답은 캐시하지 않아야 합니다.");
assert.match(shared, /SERVICE_REGULATION_TYPES = \["privacy", "service", "notification"\]/, "세 규정 유형만 허용해야 합니다.");
assert.match(shared, /\[14, 16, 18, 20, 24\]\.includes/, "저장된 글씨 크기를 허용 목록으로 정규화해야 합니다.");
assert.match(css, /\.service-regulation-scroll\s*\{[^}]*overflow-y: auto;/s, "팝업 본문만 세로 스크롤되어야 합니다.");

console.log("service regulations regression checks passed");
