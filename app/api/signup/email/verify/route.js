import { NextResponse } from "next/server";
import { verifySignupEmailCode } from "../../../../../lib/db";
import { isSignupEmailVerificationEnabled } from "../../../../../lib/email-verification";
import { NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  if (!isSignupEmailVerificationEnabled()) {
    return NextResponse.json(
      { ok: false, message: "이메일 인증은 현재 사용하지 않습니다. 휴대폰 인증을 이용해 주세요." },
      { status: 410 }
    );
  }

  try {
    const payload = await request.json();
    const result = await verifySignupEmailCode(payload);
    return NextResponse.json({
      ok: true,
      email: result.email,
      emailVerificationToken: result.emailVerificationToken,
      expiresInSeconds: result.expiresInSeconds,
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "인증번호를 확인해 주세요.",
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
