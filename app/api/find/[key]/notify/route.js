import { NextResponse } from "next/server";
import { enforcePublicApiRateLimit, getFindPageDataByKey } from "../../../../../lib/db";
import { isPushConfigured, notifyGuardianFound } from "../../../../../lib/push";
import { getRequestSecurityMeta } from "../../../../../lib/request-security";

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const data = await getFindPageDataByKey(resolvedParams?.key);

  if (!data) {
    return NextResponse.json({ message: "등록되지 않은 QR입니다." }, { status: 404 });
  }
  if (!data.qr_active) {
    return NextResponse.json({ message: "비활성화된 QR입니다." }, { status: 400 });
  }
  if (!data.qr_activated_at) {
    return NextResponse.json({ message: "아직 보호자가 활성화하지 않은 QR입니다." }, { status: 400 });
  }
  if (!data.subject_id || !data.guardian_id) {
    return NextResponse.json({ message: "관리대상과 연결되지 않은 QR입니다." }, { status: 400 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ message: "푸시 알림 설정이 필요합니다." }, { status: 503 });
  }

  try {
    await enforcePublicApiRateLimit({
      action: `find-notify:${data.public_key}`,
      identity: getRequestSecurityMeta(request).identity,
      maxRequests: 5,
      windowMinutes: 10,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "알림 요청이 너무 많습니다." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await notifyGuardianFound({
    guardianId: data.guardian_id,
    subjectName: data.subject_name,
    findUrl: data.target_url,
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    total: result.total,
    message:
      result.sent > 0
        ? "보호자에게 알림을 보냈습니다."
        : "보호자의 푸시 알림 기기가 아직 등록되어 있지 않습니다.",
  });
}
