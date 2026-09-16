import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourcePaths = [
  "app/account/account-ui.js",
  "app/account/location-shares/[id]/shared-location-view.js",
  "app/ad-campaign-modal.js",
  "app/ads/checkout/[id]/page.js",
  "app/auth-actions.js",
  "app/dashboard.js",
  "app/find/[key]/location-share-button.js",
  "app/login-id-recovery-panel.js",
  "app/missing-report/missing-report-selector.js",
  "app/notification-bell.js",
  "app/password-reset-panel.js",
  "app/privacy/page.js",
  "app/service-regulation-modal.js",
  "app/shop-checkout-client.js",
  "app/shop/service/shop-service-controls.js",
  "app/social-signup-completion.js",
];

const [component, styles, ...sources] = await Promise.all([
  readFile(new URL("../app/back-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ...sourcePaths.map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
]);
const myPageOverlay = await readFile(new URL("../app/my-page-overlay.js", import.meta.url), "utf8");

assert.match(component, /className="app-back-button-icon"/, "공통 뒤로가기 아이콘이 필요합니다.");
assert.match(component, /<Link[\s\S]*href=\{href\}/, "링크형 뒤로가기를 지원해야 합니다.");
assert.match(component, /<button[\s\S]*onClick=\{onClick\}/, "팝업형 뒤로가기를 지원해야 합니다.");
assert.match(styles, /\.app-back-button\.app-back-button\s*\{[\s\S]*width: 40px !important;[\s\S]*height: 40px !important;/, "뒤로가기 버튼 크기는 같아야 합니다.");
assert.match(styles, /\.app-back-button-icon\s*\{[\s\S]*border-bottom: 2px solid currentColor;[\s\S]*border-left: 2px solid currentColor;/, "뒤로가기 화살표는 공통 아이콘을 사용해야 합니다.");

for (const [index, source] of sources.entries()) {
  assert.match(source, /BackButton/, `${sourcePaths[index]}에서 공통 뒤로가기 버튼을 사용해야 합니다.`);
  assert.doesNotMatch(source, /[‹←]/, `${sourcePaths[index]}에 개별 뒤로가기 문자가 남아 있습니다.`);
}

const sourceFor = (path) => sources[sourcePaths.indexOf(path)];
assert.match(sourceFor("app/account/account-ui.js"), /href=\{backHref\} replace/, "설정 하위 계정 화면은 설정 팝업으로 교체 이동해야 합니다.");
assert.match(sourceFor("app/privacy/page.js"), /href="\/\?panel=my" replace/, "약관 화면은 설정 팝업으로 돌아가야 합니다.");
assert.match(sourceFor("app/shop/service/shop-service-controls.js"), /router\.replace\(backHref\)/, "설정에서 연 서비스 소개는 설정 팝업으로 돌아가야 합니다.");
assert.match(myPageOverlay, /router\.push\(`\$\{url\.pathname\}/, "설정 팝업을 브라우저 방문 기록에 남겨야 합니다.");

console.log("back button regression checks passed");
