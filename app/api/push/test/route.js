import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { getGuardianPushTarget } from "../../../../lib/db";
import { notifyGuardianTest } from "../../../../lib/push";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const guardian = await getGuardianPushTarget(session);
    const result = await notifyGuardianTest({ guardianId: guardian.id });

    if (result.total === 0) {
      return NextResponse.json(
        { message: "등록된 기기가 없습니다. 푸시 알림을 다시 연결해 주세요." },
        { status: 409 }
      );
    }
    if (result.sent === 0) {
      return NextResponse.json(
        { message: "기기 전송에 실패했습니다. 알림을 다시 연결한 뒤 재시도해 주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      message: "테스트 알림을 발송했습니다.",
    });
  } catch (error) {
    console.error("[push/test] failed", {
      message: error.message || String(error),
    });
    return NextResponse.json(
      { message: error.message || "테스트 알림 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}
