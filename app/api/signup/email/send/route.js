import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { requestSignupEmailVerification } from "../../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  try {
    const payload = await request.json();
    const result = await requestSignupEmailVerification(payload, session);
    return NextResponse.json({
      ok: true,
      email: result.email,
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
