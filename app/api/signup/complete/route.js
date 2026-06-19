import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { completeGuardianSignup } from "../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const guardian = await completeGuardianSignup(session, payload);
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
