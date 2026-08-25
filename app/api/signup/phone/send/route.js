import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { requestSignupPhoneVerification } from "../../../../../lib/db";
import { isSignupSmsVerificationEnabled } from "../../../../../lib/sms";
import { getRequestSecurityMeta, NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  if (!isSignupSmsVerificationEnabled()) {
    return NextResponse.json(
      { ok: false, message: "휴대폰 인증은 현재 사용할 수 없습니다." },
      { status: 410 }
    );
  }

  const session = await getServerSession(authOptions);

  try {
    const payload = await request.json();
    const result = await requestSignupPhoneVerification(payload, session, getRequestSecurityMeta(request));
    return NextResponse.json({
      ok: !result.accountLinkRequired,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      devMode: result.devMode,
      accountLinkRequired: Boolean(result.accountLinkRequired),
      accountLinkPending: Boolean(result.accountLinkPending),
      requestedProvider: result.requestedProvider || "",
      existingProviders: result.existingProviders || [],
    }, { status: result.accountLinkRequired ? 409 : 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    const status = String(error?.message || "").includes("너무 많습니다") ? 429 : 400;
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "인증번호 발송에 실패했습니다.",
      },
      { status, headers: NO_STORE_HEADERS }
    );
  }
}
