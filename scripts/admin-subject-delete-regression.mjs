import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [database, adminActions, adminPage, confirmButton, styles] = await Promise.all([
  readFile(new URL("../lib/db.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/actions.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/admin/confirm-submit-button.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(database, /async function deleteSubjectRecord[\s\S]*UPDATE qr_codes[\s\S]*is_active = 0[\s\S]*guardian_id = NULL|async function deleteSubjectRecord[\s\S]*guardian_id = NULL[\s\S]*is_active = 0/);
assert.match(database, /async function deleteSubjectRecord[\s\S]*subject_id = NULL[\s\S]*lifecycle_status = 'discarded'/);
assert.match(database, /async function deleteSubjectRecord[\s\S]*discarded_at = COALESCE\(discarded_at, CURRENT_TIMESTAMP\)/);
assert.match(database, /db\.batch\(\[[\s\S]*UPDATE qr_codes[\s\S]*DELETE FROM subjects[\s\S]*\], "write"\)/);
assert.match(database, /export async function deleteAdminSubject\(formData\)/);

assert.match(adminActions, /export async function deleteAdminSubjectAction\(formData\)/);
assert.match(adminActions, /deleteAdminSubjectAction[\s\S]*isAdminSession\(session\)[\s\S]*deleteAdminSubject\(formData\)/);
assert.match(adminActions, /revalidatePath\("\/find\/\[key\]", "page"\)/);

assert.match(adminPage, /<form action=\{deleteAdminSubjectAction\}>/);
assert.match(adminPage, /name="subjectId" value=\{selectedSubject\.id\}/);
assert.match(adminPage, /연결된 QR은 폐기되어 만료 페이지로 전환됩니다/);
assert.match(adminActions, /폐기되어 만료 페이지로 전환되었습니다/);
assert.match(confirmButton, /window\.confirm\(confirmMessage\)/);
assert.match(styles, /\.subject-delete-row \{/);

console.log("Admin subject deletion regression checks passed.");
