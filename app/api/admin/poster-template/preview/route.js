import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminSession } from "../../../../../lib/admin";
import { authOptions } from "../../../../../lib/auth";
import { isDbAdminSession } from "../../../../../lib/db";
import { normalizePosterLayout } from "../../../../../lib/poster-template";
import { renderPoster } from "../../../../../lib/poster-renderer";

export const runtime = "nodejs";

async function canPreview(request) {
  if (process.env.NODE_ENV === "development" && new URL(request.url).searchParams.get("preview") === "1") {
    return true;
  }
  const session = await getServerSession(authOptions);
  return Boolean(session && (isAdminSession(session) || (await isDbAdminSession(session))));
}

export async function POST(request) {
  if (!(await canPreview(request))) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2.5 * 1024 * 1024) {
    return NextResponse.json({ message: "배경 이미지 용량이 너무 큽니다. 이미지를 다시 선택해 주세요." }, { status: 413 });
  }

  try {
    const body = await request.json();
    const qrCodeUrl = await QRCode.toDataURL("https://zezari.family/find/sample", {
      width: 768,
      margin: 1,
      errorCorrectionLevel: "H",
    });
    const image = await renderPoster({
      photoUrl: "/assets/subject-registration/photo-placeholder.png",
      qrCodeUrl,
      name: "이하율",
      age: "만 8세",
      gender: "여성",
      guardianMemo: "낯선 사람을 어려워합니다. 발견하시면 안전한 곳에서 보호자에게 연락해 주세요.",
    }, {
      id: body?.id || "preview",
      name: body?.name || "미리보기",
      version: Number(body?.version || 1),
      layout_json: JSON.stringify(normalizePosterLayout(body?.layout)),
      background_image_url: body?.backgroundImageUrl || "/assets/missing-ad-template.png",
      is_active: 1,
    });
    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error?.message || "포스터 미리보기를 만들지 못했습니다." },
      { status: 400 },
    );
  }
}
