import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { linkSocialAccountByVerifiedPhone } from "../../../../../lib/db";
import { NO_STORE_HEADERS } from "../../../../../lib/request-security";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }

  try {
    const payload = await request.json();
    const result = await linkSocialAccountByVerifiedPhone(session, payload);
    return NextResponse.json({ ok: true, ...result }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "SNS 계정 연결에 실패했습니다." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
