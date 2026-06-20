import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import {
  deleteGuardianNotification,
  getGuardianNotifications,
  markGuardianNotificationsRead,
} from "../../../lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const notifications = await getGuardianNotifications(session);
  return NextResponse.json({ notifications });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  if (payload?.action !== "mark-read") {
    return NextResponse.json({ message: "지원하지 않는 알림 요청입니다." }, { status: 400 });
  }

  await markGuardianNotificationsRead(session);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  try {
    await deleteGuardianNotification(session, payload?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "알림을 삭제하지 못했습니다." },
      { status: 400 }
    );
  }
}
