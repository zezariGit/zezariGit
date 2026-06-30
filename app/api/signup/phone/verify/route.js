import { NextResponse } from "next/server";
import { verifySignupPhoneCode } from "../../../../../lib/db";

export async function POST(request) {
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
