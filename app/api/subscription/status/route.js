import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { pauseSubscriptionForGuardian, resumeSubscriptionForGuardian } from "../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "").trim();

  try {
    if (action === "pause") {
      await pauseSubscriptionForGuardian(session);
    } else if (action === "resume") {
      await resumeSubscriptionForGuardian(session);
    } else {
      return NextResponse.json({ message: "지원하지 않는 이용권 상태 변경입니다." }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/account/billing");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error.message || "이용권 상태를 변경하지 못했습니다." }, { status: 400 });
  }
}
