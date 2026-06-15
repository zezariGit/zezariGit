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

  await savePushSubscription(session, subscription);
  return NextResponse.json({ ok: true });
}
