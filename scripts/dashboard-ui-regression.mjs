import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const iconNames = ["notification", "settings", "status-help", "missing", "shop", "support", "safety"];
const [dashboard, carousel, guide, styles, ...icons] = await Promise.all([
  readFile(new URL("../app/dashboard.js", import.meta.url), "utf8"),
  readFile(new URL("../app/managed-subject-carousel.js", import.meta.url), "utf8"),
  readFile(new URL("../app/subject-status-guide.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ...iconNames.map((name) => readFile(new URL(`../public/assets/dashboard/${name}.png`, import.meta.url))),
]);

assert.match(dashboard, /const pageSize = 3;/, "대상자 목록은 3명 단위여야 합니다.");
assert.match(dashboard, /href=\{`\/\?tab=dashboard&previewSubject=/, "대상자 행 전체가 미리보기 링크여야 합니다.");
assert.match(dashboard, /등록된 대상자가 없습니다\./);
assert.match(dashboard, /대상자 추가하기/);
assert.match(carousel, /scroll-snap-type|scrollTo\(/, "대상자 페이지는 가로 이동을 지원해야 합니다.");
assert.match(carousel, /Array\.from\(\{ length: totalPages \}/, "표시점은 페이지 수를 기준으로 만들어야 합니다.");
assert.match(carousel, /showDots &&/, "빈 대상자 목록에서는 페이지 표시점을 숨겨야 합니다.");
assert.match(guide, /현재 상태 단계 안내/);
assert.match(guide, /상품 구매 필요[\s\S]*안전[\s\S]*찾는 중/);
assert.match(guide, /role="dialog"/);
assert.match(styles, /\.dashboard-shell\.dashboard-home-shell/);
assert.match(styles, /\.subject-status-guide-overlay/);

for (const [index, icon] of icons.entries()) {
  assert.equal(icon.toString("ascii", 1, 4), "PNG", `${iconNames[index]} 아이콘이 PNG가 아닙니다.`);
}

console.log("Dashboard UI regression checks passed.");
