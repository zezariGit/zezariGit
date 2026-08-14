import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { verifySignupPhoneCode } from "../../../../../lib/db";
import { isSignupSmsVerificationEnabled } from "../../../../../lib/sms";
import { NO_STORE_HEADERS } from "../../../../../lib/request-security";

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
    const result = await verifySignupPhoneCode(payload, session);
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      phoneVerificationToken: result.phoneVerificationToken,
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
