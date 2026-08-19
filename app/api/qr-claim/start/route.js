import { NextResponse } from "next/server";
import {
  enforcePublicApiRateLimit,
  getActiveQrSignupClaim,
  releaseQrSignupClaim,
  reserveQrSignupClaim,
} from "../../../../lib/db";
import {
  QR_SIGNUP_CLAIM_COOKIE,
  createQrSignupClaimToken,
  decodeQrSignupClaim,
  encodeQrSignupClaim,
  getQrSignupClaimCookieOptions,
  hashQrSignupClaimToken,
} from "../../../../lib/qr-signup-claim";
import { getRequestSecurityMeta, NO_STORE_HEADERS } from "../../../../lib/request-security";

export async function POST(request) {
  try {
    const requestMeta = getRequestSecurityMeta(request);
    await enforcePublicApiRateLimit({
      action: "qr-signup-claim",
      identity: requestMeta.identity,
      maxRequests: 10,
      windowMinutes: 10,
    });
    const payload = await request.json();
    const publicKey = String(payload?.publicKey || "").trim().toLowerCase();
    const stored = decodeQrSignupClaim(request.cookies.get(QR_SIGNUP_CLAIM_COOKIE)?.value);
    const existingTokenHash = stored?.publicKey === publicKey
      ? hashQrSignupClaimToken(stored.token)
      : "";

    if (stored?.publicKey === publicKey) {
      const active = await getActiveQrSignupClaim(publicKey, existingTokenHash);
      if (active) {
        const response = NextResponse.json(
          { ok: true, message: "스캔한 QR 연결을 이어서 진행합니다." },
          { headers: NO_STORE_HEADERS }
        );
        response.cookies.set(
          QR_SIGNUP_CLAIM_COOKIE,
          encodeQrSignupClaim(stored),
          getQrSignupClaimCookieOptions()
        );
        return response;
      }
    }

    if (stored && stored.publicKey !== publicKey) {
      await releaseQrSignupClaim(stored.publicKey, hashQrSignupClaimToken(stored.token));
    }

    const token = createQrSignupClaimToken();
    const tokenHash = hashQrSignupClaimToken(token);
    const claim = await reserveQrSignupClaim(publicKey, tokenHash, existingTokenHash);
    if (!claim) throw new Error("미배정 QR을 예약하지 못했습니다.");

    const response = NextResponse.json(
      { ok: true, message: "가입 후 등록하는 첫 관리대상과 이 QR을 연결합니다." },
      { headers: NO_STORE_HEADERS }
    );
    response.cookies.set(
      QR_SIGNUP_CLAIM_COOKIE,
      encodeQrSignupClaim({ publicKey, token }),
      getQrSignupClaimCookieOptions()
    );
    return response;
  } catch (error) {
    const status = String(error?.message || "").includes("너무 많습니다") ? 429 : 409;
    return NextResponse.json(
      { ok: false, message: error.message || "QR 가입 연결을 시작하지 못했습니다." },
      { status, headers: NO_STORE_HEADERS }
    );
  }
}
