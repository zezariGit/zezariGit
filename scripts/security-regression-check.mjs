import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const securitySource = read("lib/security.js");
const securityModule = await import(
  `data:text/javascript;base64,${Buffer.from(securitySource).toString("base64")}`
);

verifyPasswordCompatibility(securityModule);
verifySourceGuards();
console.log("Security regression checks passed.");

function verifyPasswordCompatibility({ hashPassword, verifyPassword }) {
  const password = "Aa1!security-regression";
  const currentHash = hashPassword(password);
  assert(verifyPassword(password, currentHash), "Current password hash must verify.");
  assert(!verifyPassword("wrong-password", currentHash), "Wrong passwords must be rejected.");

  const salt = crypto.randomBytes(16).toString("hex");
  const legacyDigest = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  const legacyHash = `pbkdf2$120000$${salt}$${legacyDigest}`;
  assert(verifyPassword(password, legacyHash), "Existing 120000-iteration hashes must remain compatible.");

  const abusiveHash = `pbkdf2$999999999$${salt}$${legacyDigest}`;
  assert(!verifyPassword(password, abusiveHash), "Unbounded PBKDF2 work factors must be rejected.");
}

function verifySourceGuards() {
  const dbSource = read("lib/db.js");
  const adminActions = read("app/admin/actions.js");
  const adminExport = read("app/admin/export-button.js");
  const locationExport = read("app/api/admin/location-security/export/route.js");
  const nextConfig = read("next.config.mjs");

  assert(!dbSource.includes('file.type.startsWith("image/")'), "Uploads must not accept every image MIME type.");
  assert(dbSource.includes("detectRasterImageMimeType"), "Uploads must validate image signatures.");
  assert(dbSource.includes("normalizePushSubscription"), "Push endpoints must be normalized and allowlisted.");
  assert(dbSource.includes("rowsAffected || 0) !== 1"), "One-time token consumption must be atomic.");
  assert(adminActions.includes("isLocalAdminPath"), "Admin return paths must be local-only.");
  assert(adminExport.includes("neutralizeSpreadsheetFormula"), "Admin exports must neutralize formulas.");
  assert(locationExport.includes("neutralizeSpreadsheetFormula"), "Location exports must neutralize formulas.");
  assert(nextConfig.includes("Content-Security-Policy"), "Global security headers must include a CSP.");
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
