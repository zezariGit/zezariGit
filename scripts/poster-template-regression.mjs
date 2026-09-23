import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import QRCode from "qrcode";
import {
  DEFAULT_POSTER_LAYOUT,
  POSTER_TEMPLATE_POLICY,
  fitPosterText,
  normalizePosterLayout,
} from "../lib/poster-template.js";
import { renderPoster } from "../lib/poster-renderer.js";

const layout = normalizePosterLayout({
  memo: { ...DEFAULT_POSTER_LAYOUT.memo, fontSize: 48, minFontSize: 18, maxLines: 3 },
});
assert.equal(layout.canvas.width, 1080);
assert.equal(layout.canvas.height, 1350);
assert.equal(layout.memo.maxLines, 3);

const fitted = fitPosterText("긴 보호자 메모입니다. ".repeat(80), layout.memo);
assert.ok(fitted.fontSize >= 18 && fitted.fontSize <= 48);
assert.ok(fitted.text.split("\n").length <= 3);
assert.equal(fitted.truncated, true);

const qrCodeUrl = await QRCode.toDataURL("https://zezari.family/find/regression", {
  width: 512,
  margin: 1,
});
const png = await renderPoster({
  photoUrl: "/assets/subject-registration/photo-placeholder.png",
  qrCodeUrl,
  name: "렌더링 테스트",
  age: "만 8세",
  gender: "여성",
  guardianMemo: "대상자를 발견하시면 안전한 곳에서 보호자에게 연락해 주세요.",
}, {
  id: "regression",
  name: "회귀 테스트",
  version: 1,
  layout_json: JSON.stringify(layout),
  background_image_url: "/assets/missing-ad-template.png",
  is_active: 1,
});

assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
assert.equal(png.readUInt32BE(16), 1080);
assert.equal(png.readUInt32BE(20), 1350);

const [dbSource, modalSource, editorSource, apiSource, metaSource, migrationSource] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/ad-campaign-modal.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/poster-template-editor.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/admin/poster-template/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/meta-marketing.js", import.meta.url), "utf8"),
  readFile(new URL("../migrations/0051_poster_templates.sql", import.meta.url), "utf8"),
]);

assert.match(dbSource, /const DB_SCHEMA_VERSION = 51/);
assert.match(dbSource, /CREATE UNIQUE INDEX IF NOT EXISTS idx_poster_templates_single_active/);
assert.match(dbSource, /poster_template_version/);
assert.match(dbSource, /await regenerateSubjectAdCreative\(db, id, ad\.subject_id\)/);
assert.doesNotMatch(modalSource, /creativeImageDataUrl|createMissingAdCreativeImage/);
assert.match(editorSource, /450/);
assert.match(editorSource, /실시간 미리보기/);
assert.match(apiSource, /export async function PUT/);
assert.match(metaSource, /image_hash/);
assert.match(migrationSource, /poster_template_versions/);
assert.equal(POSTER_TEMPLATE_POLICY.publishedCreativeIsImmutable, true);

console.log(`poster template regression: ok (${png.length.toLocaleString("en-US")} byte PNG)`);
