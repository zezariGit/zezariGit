import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [campaignModal, mapSearch, database, scrollLock, styles] = await Promise.all([
  readFile(new URL("../app/ad-campaign-modal.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/maps/search/route.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/modal-scroll-lock.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(campaignModal, /location\.isLocality/);
assert.match(campaignModal, /result\?\.isLocality === true/);
assert.match(campaignModal, /읍·면·동까지 선택해 주세요\./);
assert.match(campaignModal, /<ModalScrollLock allowSurfaceScroll \/>/);
assert.match(mapSearch, /isLocality: Boolean\(locality\)/);
assert.match(mapSearch, /function findLocality/);
assert.match(mapSearch, /\.slice\(0, 4\)/);
assert.match(database, /if \(!isAdLocalityRegionLabel\(region\)\) throw new Error\("읍·면·동까지 선택해 주세요\."\)/);
assert.match(scrollLock, /allowSurfaceScroll \? "pan-y" : "none"/);
assert.match(styles, /\.ad-setup-location-input input\s*\{[\s\S]*?font-size: 16px;/);

console.log("Ad setup regression checks passed.");
