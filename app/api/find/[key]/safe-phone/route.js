import { NextResponse } from "next/server";
import {
  getFindPageDataByKey,
  requestOnDemandSafePhoneForFindPage,
} from "../../../../../lib/db";

export async function POST(request, { params }) {
  const resolvedParams = await params;

  try {
    const data = await getFindPageDataByKey(resolvedParams?.key);
    const result = await requestOnDemandSafePhoneForFindPage(data, {
      userAgent: request.headers.get("user-agent") || "",
      ipAddress: getClientIp(request),
    });
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = Math.min(599, Math.max(400, Number(error?.statusCode || 500)));
    return NextResponse.json(
      { ok: false, message: error?.message || "안심번호 통화 연결에 실패했습니다." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}
