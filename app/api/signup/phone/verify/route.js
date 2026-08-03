import { NextResponse } from "next/server";
import { verifySignupPhoneCode } from "../../../../../lib/db";
import { isSignupSmsVerificationEnabled } from "../../../../../lib/sms";

export async function POST(request) {
  if (!isSignupSmsVerificationEnabled()) {
    return NextResponse.json(
      { ok: false, message: "휴대폰 인증은 현재 사용하지 않습니다. 이메일 인증을 이용해 주세요." },
      { status: 410 }
    );
  }

  try {
    const payload = await request.json();
    const result = await verifySignupPhoneCode(payload);
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      phoneVerificationToken: result.phoneVerificationToken,
      expiresInSeconds: result.expiresInSeconds,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "인증번호를 확인해 주세요.",
      },
      { status: 400 }
    );
  }
}
