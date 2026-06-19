import { NextResponse } from "next/server";
import { createGuardianSignup } from "../../../../lib/db";

export async function POST(request) {
  try {
    const payload = await request.json();
    const guardian = await createGuardianSignup(payload);
    return NextResponse.json({ ok: true, guardian });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "회원가입 정보를 확인해 주세요.",
      },
      { status: 400 }
    );
  }
}
