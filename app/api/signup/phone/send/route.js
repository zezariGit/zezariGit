import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { requestSignupPhoneVerification } from "../../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  try {
    const payload = await request.json();
    const result = await requestSignupPhoneVerification(payload, session);
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      devMode: result.devMode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "인증번호 발송에 실패했습니다.",
      },
      { status: 400 }
    );
  }
}
