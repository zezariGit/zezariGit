import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const actions = await readFile(new URL("../app/actions.js", import.meta.url), "utf8");
const db = await readFile(new URL("../lib/db.js", import.meta.url), "utf8");
const form = await readFile(new URL("../app/account/coupons/coupon-registration-form.js", import.meta.url), "utf8");

const errorMapper = actions.match(/function couponErrorMessage\(error\) \{[\s\S]*?\n\}/)?.[0] || "";
assert.doesNotMatch(errorMapper, /message\.includes\("입력"\)/, "형식 오류를 빈 쿠폰 코드 오류로 분류하면 안 됩니다.");
assert.match(errorMapper, /message === "쿠폰 번호를 입력해 주세요\."/, "빈 쿠폰 코드만 입력 안내로 분류해야 합니다.");
assert.match(errorMapper, /return "유효하지 않은 쿠폰 코드입니다\."/, "그 밖의 잘못된 쿠폰 코드는 유효하지 않음으로 표시해야 합니다.");
assert.match(db, /if \(!isValidCouponCode\(code\)\) throw new Error\("유효하지 않은 쿠폰 코드입니다\."\)/, "짧거나 형식이 잘못된 쿠폰 코드는 명시적인 유효성 오류여야 합니다.");
assert.match(form, /disabled=\{!code\.trim\(\)\}/, "공백뿐인 쿠폰 코드는 제출할 수 없어야 합니다.");

console.log("Coupon registration regression checks passed.");
