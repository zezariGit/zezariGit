import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminSession } from "../../../../../../lib/admin";
import { authOptions } from "../../../../../../lib/auth";
import {
  getAdminSubjectAdCreativeData,
  isDbAdminSession,
} from "../../../../../../lib/db";

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !(isAdminSession(session) || (await isDbAdminSession(session)))) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const resolvedParams = await params;
  const creative = await getAdminSubjectAdCreativeData(resolvedParams?.id);
  const match = String(creative?.image_data_url || "").match(/^data:(image\/(?:jpeg|png));base64,(.+)$/i);
  if (!match) {
    return NextResponse.json({ message: "저장된 광고 소재가 없습니다." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(match[2], "base64"), {
    status: 200,
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": 'inline; filename="zezari-meta-ad-creative.jpg"',
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
