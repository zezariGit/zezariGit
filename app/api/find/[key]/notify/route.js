import { NextResponse } from "next/server";
import { getFindPageDataByKey } from "../../../../../lib/db";
import { isPushConfigured, notifyGuardianFound } from "../../../../../lib/push";

export async function POST(_request, { params }) {
  const resolvedParams = await params;
  const data = await getFindPageDataByKey(resolvedParams?.key);

  if (!data) {
    return NextResponse.json({ message: "등록되지 않은 QR입니다." }, { status: 404 });
  }
  if (!data.qr_active) {
    return NextResponse.json({ message: "비활성화된 QR입니다." }, { status: 400 });
  }
  if (!data.subject_id || !data.guardian_id) {
    return NextResponse.json({ message: "관리대상과 연결되지 않은 QR입니다." }, { status: 400 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ message: "푸시 알림 설정이 필요합니다." }, { status: 503 });
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
