import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const FORMAT_VERSION = "v1";

export function isLocationEncryptionConfigured() {
  return Boolean(getEncryptionKey(false));
}

export function encryptLocationValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const key = getEncryptionKey(true);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [FORMAT_VERSION, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptLocationValue(value) {
  const serialized = String(value || "").trim();
  if (!serialized) return "";
  const [version, ivValue, tagValue, encryptedValue] = serialized.split(".");
  if (version !== FORMAT_VERSION || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("지원하지 않는 위치정보 암호문입니다.");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(true), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function hashLocationAuditValue(value) {
  const secret = String(
    process.env.LOCATION_AUDIT_HASH_KEY ||
    process.env.LOCATION_DATA_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    "",
  ).trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("위치정보 감사로그 해시 키가 설정되지 않았습니다.");
    }
    return createHmac("sha256", "zezari-location-audit-development-only")
      .update(String(value || ""))
      .digest("hex");
  }
  return createHmac("sha256", secret).update(String(value || "")).digest("hex");
}

export function getLocationRetentionHours() {
  const configured = Number(process.env.LOCATION_RAW_RETENTION_HOURS || 24);
  if (!Number.isFinite(configured)) return 24;
  return Math.min(168, Math.max(1, Math.floor(configured)));
}

function getEncryptionKey(required) {
  const configured = String(process.env.LOCATION_DATA_ENCRYPTION_KEY || "").trim();
  if (!configured) {
    if (required) throw new Error("위치정보 저장 암호화 키가 설정되지 않았습니다.");
    return null;
  }

  const key = decodeKey(configured);
  if (key.length !== 32) {
    throw new Error("LOCATION_DATA_ENCRYPTION_KEY는 32바이트 키여야 합니다.");
  }
  return key;
}

function decodeKey(value) {
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, "hex");
  try {
    const decoded = Buffer.from(value, "base64");
    if (decoded.length === 32) return decoded;
  } catch {
    // The length validation below returns a consistent configuration error.
  }
  return Buffer.from(value, "utf8");
}
