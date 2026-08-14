import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { requestSignupEmailVerification } from "../../../../../lib/db";
import { isSignupEmailVerificationEnabled } from "../../../../../lib/email-verification";
import { getRequestSecurityMeta, NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  if (!isSignupEmailVerificationEnabled()) {
    return NextResponse.json(
      { ok: false, message: "이메일 인증은 현재 사용하지 않습니다. 휴대폰 인증을 이용해 주세요." },
      { status: 410 }
    );
  }

  const session = await getServerSession(authOptions);

  try {
    const payload = await request.json();
    const result = await requestSignupEmailVerification(payload, session, getRequestSecurityMeta(request));
    return NextResponse.json({
      ok: true,
      email: result.email,
      expiresInSeconds: result.expiresInSeconds,
      devMode: result.devMode,
    }, { headers: NO_STORE_HEADERS });
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
