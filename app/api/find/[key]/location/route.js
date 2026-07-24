import { NextResponse } from "next/server";
import { createLocationShareForFindPage, getFindPageDataByKey } from "../../../../../lib/db";
import { isPushConfigured, notifyGuardianLocationShared } from "../../../../../lib/push";

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const data = await getFindPageDataByKey(resolvedParams?.key);
  const payload = await request.json().catch(() => ({}));

  let share;
  try {
    share = await createLocationShareForFindPage(data, payload, {
      userAgent: request.headers.get("user-agent") || "",
      ipAddress: getClientIp(request),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "위치공유 정보를 저장하지 못했습니다." },
      { status: 400 },
    );
  }

  if (!isPushConfigured()) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      total: 0,
      mapUrl: share.kakaoMapUrl,
      naverMapUrl: share.naverMapUrl,
      message: "위치는 저장되었습니다. 푸시 알림 설정이 필요합니다.",
    });
  }

  const result = await notifyGuardianLocationShared({
    guardianId: share.guardianId,
    subjectName: share.subjectName,
    kakaoMapUrl: share.kakaoMapUrl,
    naverMapUrl: share.naverMapUrl,
    addressLabel: share.addressLabel,
    finderContact: share.finderContact,
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    total: result.total,
    mapUrl: share.kakaoMapUrl,
    naverMapUrl: share.naverMapUrl,
    message:
      result.sent > 0
        ? "보호자에게 위치공유 알림을 보냈습니다."
        : "위치는 저장되었습니다. 보호자의 푸시 알림 기기가 아직 등록되어 있지 않습니다.",
  });
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}
