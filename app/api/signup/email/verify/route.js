import { NextResponse } from "next/server";
import { verifySignupEmailCode } from "../../../../../lib/db";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await verifySignupEmailCode(payload);
    return NextResponse.json({
      ok: true,
      email: result.email,
      emailVerificationToken: result.emailVerificationToken,
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
