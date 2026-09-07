import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, styles] = await Promise.all([
  readFile(new URL("../app/auth-actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(component, /const LOGIN_ERROR_MESSAGE = "아이디 또는 비밀번호가 일치하지 않습니다\.";/);
assert.match(component, /const \[showPassword, setShowPassword\] = useState\(false\)/);
assert.match(component, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
assert.match(component, /type=\{showPassword \? "text" : "password"\}/);
assert.match(component, /aria-label=\{showPassword \? "비밀번호 숨기기" : "비밀번호 표시"\}/);
assert.match(component, /const loginReady = Boolean\(loginId\.trim\(\) && password\)/);
assert.match(component, /disabled=\{loading \|\| !loginReady\}/);
assert.match(component, /aria-invalid=\{hasCredentialError\}/);
assert.match(component, /className="login-field-error" role="alert"/);
assert.match(component, /onClick=\{openPasswordReset\}/);
assert.match(component, /onClick=\{openSignup\}/);
assert.match(component, /signIn\(id, \{ callbackUrl: callbackUrl \|\| "\/" \}\)/);

assert.match(styles, /\.login-card \.login-credential-input\.invalid,[\s\S]*?border-color: #ff4d57;/);
assert.match(styles, /\.login-card \.remember-login input:checked \{[\s\S]*?background: #00a653;/);
assert.match(styles, /\.login-card \.remember-login input \{[\s\S]*?min-height: 20px;/);
assert.match(styles, /\.login-card \.login-submit:disabled,[\s\S]*?background: #f1f7f3;/);
assert.match(styles, /\.login-card \.social-icon-button \{[\s\S]*?width: 58px;[\s\S]*?height: 58px;/);
assert.match(styles, /\.login-card \.signup-link \{[\s\S]*?color: #009b50;/);

console.log("Login UI regression checks passed.");
