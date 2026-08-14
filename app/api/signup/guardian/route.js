import { NextResponse } from "next/server";
import { createGuardianSignup } from "../../../../lib/db";
import { NO_STORE_HEADERS } from "../../../../lib/request-security";

export async function POST(request) {
  try {
    const payload = await request.json();
    const guardian = await createGuardianSignup(payload);
    return NextResponse.json({ ok: true, guardian }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "회원가입 정보를 확인해 주세요.",
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
