import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, styles, ...images] = await Promise.all([
  readFile(new URL("../app/onboarding-gate.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ...[1, 2, 3].map((number) => (
    readFile(new URL(`../public/images/onboarding/${number}.png`, import.meta.url))
  )),
]);

const requiredCopy = [
  "QR로 연결되는 <em>안심 서비스</em>",
  "QR을 통해 필요한 정보를 빠르게 확인하고",
  "보호자와 안전하게 연결합니다.",
  "발견 즉시 <em>연결되는</em> 도움",
  "발견자가 QR을 스캔하면 보호자 연락,",
  "위치 공유, 보호자 음성 재생까지",
  "바로 연결됩니다.",
  "온라인 실종 광고",
  "필요한 정보를 온라인으로 공유하고",
  "더 많은 사람이 확인할 수 있도록 지원합니다.",
  "(인스타그램, 페이스북)",
  "로그인하기",
  "다시 보지 않기",
];

const normalizedComponent = component.replace(/\s+/g, " ");
for (const copy of requiredCopy) {
  assert.ok(normalizedComponent.includes(copy), `Onboarding copy is missing: ${copy}`);
}

assert.equal((component.match(/number: "0[123]"/g) || []).length, 3);
assert.match(component, /const SWIPE_THRESHOLD = 44;/);
assert.match(component, /Math\.min\(current \+ 1, slides\.length - 1\)/);
assert.match(component, /Math\.max\(current - 1, 0\)/);
assert.match(component, /onPointerDown=/);
assert.match(component, /onPointerUp=/);
assert.match(component, /active === slides\.length - 1/);
assert.match(component, /window\.localStorage\.setItem\(STORAGE_KEY, "true"\)/);
assert.doesNotMatch(component, />\s*(다음|이전|뒤로가기)\s*</);

assert.match(styles, /\.onboarding-shell \{[\s\S]*?width: min\(100%, 390px\)/);
assert.match(styles, /\.onboarding-shell \.slide-track \{[\s\S]*?transition: transform/);
assert.match(styles, /\.onboarding-shell \.dot\.active \{[\s\S]*?background: #009b50/);
assert.match(styles, /\.onboarding-shell \.onboarding-controls \.onboarding-login-button/);

for (const [index, image] of images.entries()) {
  assert.equal(image.toString("ascii", 1, 4), "PNG");
  assert.equal(image.readUInt32BE(16), 390, `Onboarding image ${index + 1} width changed`);
  assert.equal(image.readUInt32BE(20), 844, `Onboarding image ${index + 1} height changed`);
}

console.log("Onboarding regression checks passed.");
