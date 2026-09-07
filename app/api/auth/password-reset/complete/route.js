import { NextResponse } from "next/server";
import { resetGuardianPasswordByPhone } from "../../../../../lib/db";
import { NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await resetGuardianPasswordByPhone(payload);
    return NextResponse.json({ ok: true, loginId: result.loginId }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "비밀번호 변경에 실패했습니다." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
}
