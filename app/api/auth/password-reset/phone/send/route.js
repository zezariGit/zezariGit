import { NextResponse } from "next/server";
import { requestPasswordResetPhoneVerification } from "../../../../../../lib/db";
import { getRequestSecurityMeta, NO_STORE_HEADERS } from "../../../../../../lib/request-security";
import { isSignupSmsVerificationEnabled } from "../../../../../../lib/sms";

export async function POST(request) {
  if (!isSignupSmsVerificationEnabled()) {
    return NextResponse.json(
      { ok: false, message: "휴대폰 인증은 현재 사용할 수 없습니다." },
      { status: 410, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const payload = await request.json();
    const result = await requestPasswordResetPhoneVerification(payload, getRequestSecurityMeta(request));
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      devMode: result.devMode,
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const status = String(error?.message || "").includes("너무 많습니다") ? 429 : 400;
    return NextResponse.json(
      { ok: false, message: error.message || "인증번호 발송에 실패했습니다." },
      { status, headers: NO_STORE_HEADERS },
    );
  }
}
