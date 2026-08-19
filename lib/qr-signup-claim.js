import { createHash, randomBytes } from "crypto";

export const QR_SIGNUP_CLAIM_COOKIE = "zezari_qr_signup_claim";
export const QR_SIGNUP_CLAIM_MAX_AGE_SECONDS = 2 * 60 * 60;

export function createQrSignupClaimToken() {
  return randomBytes(32).toString("base64url");
}

export function hashQrSignupClaimToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

export function encodeQrSignupClaim({ publicKey, token }) {
  const payload = JSON.stringify({
    publicKey: normalizePublicKey(publicKey),
    token: String(token || "").trim(),
  });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeQrSignupClaim(value) {
  try {
    const parsed = JSON.parse(Buffer.from(String(value || ""), "base64url").toString("utf8"));
    const publicKey = normalizePublicKey(parsed?.publicKey);
    const token = String(parsed?.token || "").trim();
    if (!publicKey || !/^[A-Za-z0-9_-]{32,160}$/.test(token)) return null;
    return { publicKey, token };
  } catch {
    return null;
  }
}

export function getQrSignupClaimCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: QR_SIGNUP_CLAIM_MAX_AGE_SECONDS,
  };
}

function normalizePublicKey(value) {
  const publicKey = String(value || "").trim().toLowerCase();
  return /^zrf-[a-z0-9-]{6,80}$/.test(publicKey) ? publicKey : "";
}
