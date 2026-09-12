import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, checkout, servicePage, serviceControls, imageRoute, adminPage, adminActions, adminWorkspace, productAdmin, database, styles] = await Promise.all([
  readFile(new URL("../app/shop/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/shop-checkout-client.js", import.meta.url), "utf8"),
  readFile(new URL("../app/shop/service/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/shop/service/shop-service-controls.js", import.meta.url), "utf8"),
  readFile(new URL("../app/api/shop/service-intro/image/route.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/admin-workspace.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/product-admin-catalog-form.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(database, /ORDER BY s\.created_at DESC, s\.id DESC/);
assert.match(page, /initialProductId=\{initialProduct\?\.id \|\| ""\}/);
assert.match(page, /toClientData\(sortShopProducts\(await getShopProducts\(\)\)\)/);
assert.match(checkout, /configurationReady = Boolean\(subjectId && product && selectedDesign\)/);
assert.match(checkout, /Number\(product\?\.unit_price \|\| 0\)/);
assert.match(checkout, /prompt="상품을 선택해 주세요"/);
assert.match(checkout, /prompt=\{product && designs\.length === 0 \? "선택 가능한 디자인이 없습니다" : "디자인을 선택해 주세요"\}/);
assert.match(checkout, /disabled=\{!selectionReady \|\| quantity <= 1\}/);
assert.match(checkout, /disabled=\{!selectionReady\}>\+<\/button>/);
assert.match(checkout, /disabled=\{!configurationReady\}/);
assert.match(checkout, /selectionView === "product"/);
assert.match(checkout, /selectionView === "design"/);
assert.match(checkout, /getUniversalShopDesigns\(products\)/);
assert.match(checkout, /designChoices = product \? designs : universalDesigns/);
assert.match(checkout, /setSelectedDesignName\(nextDesign\.name\)/);
assert.match(checkout, /has_image[\s\S]*productImageUrl\(product\)/);
assert.match(checkout, /has_option_image[\s\S]*productDesignImageUrl\(design\)/);
assert.match(checkout, /className="shop-subject-backdrop"/);
assert.match(checkout, /role="dialog" aria-modal="true"/);
assert.match(checkout, /className="shop-choice-grid" role="listbox"/);
assert.match(checkout, /className="shop-choice-confirm"[\s\S]*disabled=\{!selectedId\}/);
assert.match(checkout, /href="\/shop\/service"/);
assert.match(servicePage, /<h1>제품보기<\/h1>/);
assert.match(servicePage, /getProductServiceIntro\(\)/);
assert.match(serviceControls, /router\.back\(\)/);
assert.match(serviceControls, /window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\)/);
assert.match(imageRoute, /getProductServiceIntroImage/);
assert.match(adminWorkspace, /상품구매 서비스소개 관리/);
assert.match(adminWorkspace, /상품\/디자인 관리/);
assert.match(adminPage, /ProductServiceIntroManagementSection/);
assert.match(adminPage, /상품 \{products\.length\}개/);
assert.match(adminPage, /디자인 \{designCount\}개/);
assert.match(adminActions, /saveProductServiceIntroAction/);
assert.match(adminActions, /setGlobalProductDesignCatalogItemAction/);
assert.match(productAdmin, /전체/);
assert.match(productAdmin, /상품\/디자인 목록/);
assert.match(productAdmin, /catalog-type-badge/);
assert.match(productAdmin, /상품 명칭/);
assert.match(productAdmin, /디자인 명칭/);
assert.match(productAdmin, /이미지 파일 변경/);
assert.match(database, /CREATE TABLE IF NOT EXISTS product_service_intro/);
assert.match(database, /export async function saveProductServiceIntro/);
assert.match(database, /GLOBAL_DESIGN_PRODUCT_ID/);
assert.match(database, /resetIndependentShopCatalog/);
assert.match(database, /export async function setGlobalProductDesignCatalogItem/);
assert.match(styles, /\.shop-subject-trigger[\s\S]*background:\s*var\(--c-primary-light\)/);
assert.match(styles, /\.shop-choice-grid[\s\S]*grid-template-columns:\s*repeat\(2/);
assert.match(styles, /\.shop-catalog-selection-view\.design \.shop-choice-grid > button[\s\S]*aspect-ratio:\s*1/);
assert.match(styles, /\.shop-catalog-selection-view\.design[\s\S]*grid-template-rows:\s*auto auto[\s\S]*align-content:\s*start/);
assert.match(styles, /\.shop-catalog-selection-view\.design \.shop-choice-grid[\s\S]*grid-template-columns:\s*repeat\(2, 114px\)[\s\S]*align-self:\s*start/);
assert.match(styles, /\.shop-catalog-selection-view\.design \.shop-choice-image img[\s\S]*width:\s*100%[\s\S]*height:\s*100%[\s\S]*object-fit:\s*contain/);
assert.match(styles, /\.shop-catalog-selection-view\.design \.shop-choice-confirm[\s\S]*position:\s*static[\s\S]*width:\s*234px/);
assert.match(styles, /\.catalog-type-filters[\s\S]*grid-template-columns:\s*repeat\(3/);
assert.match(styles, /\.catalog-management-image img,[\s\S]*width:\s*100%[\s\S]*height:\s*100%[\s\S]*object-fit:\s*contain/);
assert.match(styles, /\.shop-subject-backdrop[\s\S]*backdrop-filter:\s*blur/);
assert.match(styles, /\.quantity-control button:disabled/);
assert.match(styles, /\.shop-next-button:disabled/);

console.log("shop purchase UI regression passed");
