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
  const parsed = parseRasterDataUrl(photo?.photo_data_url);
  if (!parsed) {
    return NextResponse.json({ message: "등록된 사진이 없습니다." }, { status: 404 });
  }

  return new NextResponse(parsed.buffer, {
    status: 200,
    headers: {
      "Content-Type": parsed.mimeType,
      "Cache-Control": "private, max-age=86400, immutable",
      "Content-Disposition": `inline; filename="${encodeURIComponent(photo.photo_name || "subject-photo")}"`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function parseRasterDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  return imageSignatureMatches(buffer, mimeType) ? { mimeType, buffer } : null;
}

function imageSignatureMatches(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/gif") return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  return mimeType === "image/webp" && buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}
