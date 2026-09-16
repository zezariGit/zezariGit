import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, styles, authConfig, keepAlive] = await Promise.all([
  readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../lib/auth.js", import.meta.url), "utf8"),
  readFile(new URL("../app/session-keep-alive.js", import.meta.url), "utf8"),
]);

assert.match(component, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
assert.match(component, /\/api\/auth\/phone\/send/);
assert.match(component, /\/api\/auth\/phone\/verify/);
assert.match(component, /signIn\("phone"/);
assert.match(component, /가입되지 않은 휴대폰번호입니다\./);
assert.doesNotMatch(component, /아이디 찾기|비밀번호 찾기|SNS 계정으로/);
assert.match(styles, /\.phone-code-row\s*\{/);
assert.match(styles, /\.phone-auth-dialog-backdrop\s*\{/);
assert.match(authConfig, /id: "phone"/);
assert.doesNotMatch(authConfig, /GoogleProvider|KakaoProvider|NaverProvider|FacebookProvider/);
assert.match(authConfig, /const DEFAULT_SESSION_MAX_AGE_DAYS = 365;/);
assert.match(authConfig, /sessionToken:[\s\S]*?maxAge: SESSION_MAX_AGE_SECONDS/);
assert.match(keepAlive, /credentials: "include"/);
assert.match(keepAlive, /window\.addEventListener\("pageshow", refreshWhenActive\)/);

console.log("Login UI regression checks passed.");
