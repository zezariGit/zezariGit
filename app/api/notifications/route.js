import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import {
  deleteGuardianNotification,
  getGuardianNotificationInbox,
  markGuardianNotificationRead,
  markGuardianNotificationsReadByIds,
} from "../../../lib/db";
import { NO_STORE_HEADERS } from "../../../lib/request-security";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const inbox = await getGuardianNotificationInbox(session);
  return NextResponse.json(inbox, { headers: NO_STORE_HEADERS });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const payload = await request.json().catch(() => ({}));
  if (!["mark-read", "mark-read-visible"].includes(payload?.action)) {
    return NextResponse.json({ message: "지원하지 않는 알림 요청입니다." }, { status: 400, headers: NO_STORE_HEADERS });
  }

  try {
    if (payload.action === "mark-read-visible") {
      await markGuardianNotificationsReadByIds(session, payload?.ids);
    } else {
      await markGuardianNotificationRead(session, payload?.id);
    }
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "알림을 읽음 처리하지 못했습니다." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const payload = await request.json().catch(() => ({}));
  try {
    await deleteGuardianNotification(session, payload?.id);
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "알림을 삭제하지 못했습니다." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
