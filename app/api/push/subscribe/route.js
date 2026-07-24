import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { savePushSubscription } from "../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const subscription = await request.json().catch(() => null);
  if (!subscription?.endpoint) {
    return NextResponse.json({ message: "푸시 구독 정보가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const saved = await savePushSubscription(session, subscription);
    console.info("[push/subscribe] device subscription saved", {
      guardianId: saved.guardianId,
      endpointHost: saved.endpointHost,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/subscribe] failed", {
      message: error.message || String(error),
    });
    return NextResponse.json(
      { message: "기기 푸시 연결 정보를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
