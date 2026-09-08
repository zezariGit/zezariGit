import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { checkGuardianLoginIdAvailability } from "../../../../../lib/db";
import { NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }
  try {
    const payload = await request.json();
    const result = await checkGuardianLoginIdAvailability(session, payload?.loginId);
    return NextResponse.json({ ok: true, ...result }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "아이디를 확인해 주세요." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
