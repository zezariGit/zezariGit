import { NextResponse } from "next/server";
import { getServiceRegulation } from "../../../../lib/db";
import { NO_STORE_HEADERS } from "../../../../lib/request-security";

export async function GET(_request, { params }) {
  const { type } = await params;
  const regulation = await getServiceRegulation(type);
  if (!regulation) {
    return NextResponse.json({ ok: false, message: "규정 항목을 찾을 수 없습니다." }, { status: 404, headers: NO_STORE_HEADERS });
  }
  return NextResponse.json({ ok: true, regulation }, { headers: NO_STORE_HEADERS });
}
