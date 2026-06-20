import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminSession } from "../../../../../lib/admin";
import { authOptions } from "../../../../../lib/auth";
import { getSubjectPhotoData, isDbAdminSession } from "../../../../../lib/db";

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const resolvedParams = await params;
  let photo = await getSubjectPhotoData(session, resolvedParams?.id, false);
  if (!photo) {
    const allowAdmin = isAdminSession(session) || (await isDbAdminSession(session));
    if (allowAdmin) {
      photo = await getSubjectPhotoData(session, resolvedParams?.id, true);
    }
  }
  const match = String(photo?.photo_data_url || "").match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) {
    return NextResponse.json({ message: "등록된 사진이 없습니다." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(match[2], "base64"), {
    status: 200,
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "private, max-age=86400, immutable",
      "Content-Disposition": `inline; filename="${encodeURIComponent(photo.photo_name || "subject-photo")}"`,
    },
  });
}
