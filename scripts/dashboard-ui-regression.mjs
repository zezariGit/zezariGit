import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const iconNames = ["notification", "settings", "status-help", "subject-status-guide", "missing", "shop", "support", "safety"];
const [page, dashboard, authActions, carousel, guide, adCampaign, privacyPage, styles, ...icons] = await Promise.all([
  readFile(new URL("../app/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/dashboard.js", import.meta.url), "utf8"),
  readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/managed-subject-carousel.js", import.meta.url), "utf8"),
  readFile(new URL("../app/subject-status-guide.js", import.meta.url), "utf8"),
  readFile(new URL("../app/ad-campaign-modal.js", import.meta.url), "utf8"),
  readFile(new URL("../app/privacy/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ...iconNames.map((name) => readFile(new URL(`../public/assets/dashboard/${name}.png`, import.meta.url))),
]);

assert.match(dashboard, /const pageSize = 3;/, "대상자 목록은 3명 단위여야 합니다.");
assert.match(dashboard, /subjectPages\.at\(-1\)\.push\(null\)/, "마지막 페이지의 빈 슬롯에는 대상자 추가 버튼이 있어야 합니다.");
assert.match(dashboard, /subjectPages\.push\(\[null\]\)/, "3명 단위로 가득 찬 경우 다음 페이지에 대상자 추가 버튼이 있어야 합니다.");
assert.match(dashboard, /subjects\.length === 0 && pageSubjects\.length === 0/, "빈 상태는 대상자가 0명일 때만 표시해야 합니다.");
assert.doesNotMatch(dashboard, /className="managed-empty-plus"/, "빈 상태 상단의 큰 플러스 아이콘은 표시하지 않아야 합니다.");
assert.match(dashboard, /안녕하세요, 보호자님!/);
assert.match(dashboard, /inactive-account-login-button[\s\S]*callbackUrl="\/\?login=1"[\s\S]*로그인 화면으로 돌아가기/, "비활성 계정 안내에서 로그인 화면으로 돌아갈 수 있어야 합니다.");
assert.match(authActions, /LogoutButton\(\{[\s\S]*callbackUrl = "\/"[\s\S]*signOut\(\{ callbackUrl \}\)/, "로그아웃 버튼은 지정된 로그인 복귀 주소로 이동해야 합니다.");
assert.match(page, /"dashboard-inactive"/, "비활성 계정 화면을 로그인 없이 확인할 개발 미리보기가 있어야 합니다.");
assert.match(page, /resolvedSearchParams\?\.login !== "1"/, "로그인 복귀 URL은 온보딩을 건너뛰어야 합니다.");
assert.match(dashboard, /<MyPageTab closeHref=\{closeMyPageHref\} admin=\{admin\} \/>/, "설정 메뉴에 관리자 여부를 전달해야 합니다.");
assert.match(dashboard, /\.\.\.\(admin \? \[\["관리자 화면", "\/admin"\]\] : \[\]\)/, "관리자 화면 메뉴는 관리자에게만 표시되어야 합니다.");
assert.match(dashboard, /href=\{`\/\?tab=dashboard&previewSubject=/, "대상자 행 전체가 미리보기 링크여야 합니다.");
assert.match(dashboard, /등록된 대상자가 없습니다\./);
assert.match(dashboard, /대상자 추가하기/);
assert.doesNotMatch(adCampaign, /ActiveAdvertisement|ad-current-panel/, "광고 설정 화면에 예전 현재 광고 요약 화면이 노출되면 안 됩니다.");
assert.match(adCampaign, /<form action=\{createAction\} className="ad-setup-form"/, "광고 설정 진입 시 새 광고 설정 폼을 바로 표시해야 합니다.");
assert.match(page, /"ad-campaign"/, "로그인 없이 광고 설정 단계를 확인할 개발 미리보기가 있어야 합니다.");
assert.match(adCampaign, /const canSubmit = Boolean\([\s\S]*selectedDistance[\s\S]*selectedDuration[\s\S]*regionComplete/, "지역·거리·기간 선택이 완료되어야 다음 단계로 진행할 수 있어야 합니다.");
assert.match(adCampaign, /\{canSubmit && \([\s\S]*ad-setup-summary[\s\S]*ad-setup-next/, "필수값 완료 시 선택 내역과 다음 버튼이 같은 스크롤 화면에 표시되어야 합니다.");
assert.match(privacyPage, /className="privacy-brand-logo"[\s\S]*zezari-wordmark\.png/, "설정의 약관 문서에는 제자리 로고가 표시되어야 합니다.");
assert.doesNotMatch(privacyPage, />REAL_QR_FIND</, "약관 문서 상단에 개발 프로젝트명이 노출되면 안 됩니다.");
assert.match(carousel, /scroll-snap-type|scrollTo\(/, "대상자 페이지는 가로 이동을 지원해야 합니다.");
assert.match(carousel, /Array\.from\(\{ length: totalPages \}/, "표시점은 페이지 수를 기준으로 만들어야 합니다.");
assert.match(carousel, /showDots &&/, "빈 대상자 목록에서는 페이지 표시점을 숨겨야 합니다.");
assert.match(guide, /대상자 현재 상태 안내/);
assert.match(guide, /상품 구매 필요[\s\S]*안전[\s\S]*찾는 중/);
assert.match(guide, /src="\/assets\/dashboard\/subject-status-guide\.png\?v=20260914-hq"/, "상태 설명은 제공된 고해상도 이미지를 사용해야 합니다.");
assert.match(guide, /role="dialog"/);
assert.match(styles, /\.dashboard-shell\.dashboard-home-shell/);
assert.match(styles, /\.subject-status-guide-overlay/);
assert.match(styles, /\.subject-status-guide-reference\s*\{[^}]*width: 100%;[^}]*height: auto;[^}]*object-fit: contain;/s, "상태 안내 이미지는 잘리지 않아야 합니다.");
assert.match(styles, /\.ad-setup-backdrop\s*\{[^}]*overflow: hidden;[^}]*touch-action: pan-y;/s, "광고 세팅 배경은 전용 스크롤 영역으로 터치 이동을 전달해야 합니다.");
assert.match(styles, /\.ad-setup-page\s*\{[^}]*height: 100dvh;[^}]*overflow-y: auto;[^}]*safe-area-inset-bottom[^}]*touch-action: pan-y;/s, "모바일 광고 세팅 화면은 하단 버튼까지 세로 스크롤되어야 합니다.");
assert.match(styles, /\.privacy-brand-logo\s*\{[^}]*width: 112px;[^}]*height: auto;[^}]*object-fit: contain;/s, "약관 화면의 제자리 로고는 비율을 유지해야 합니다.");

for (const [index, icon] of icons.entries()) {
  assert.equal(icon.toString("ascii", 1, 4), "PNG", `${iconNames[index]} 아이콘이 PNG가 아닙니다.`);
}

console.log("Dashboard UI regression checks passed.");
