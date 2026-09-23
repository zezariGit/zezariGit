import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isAdminSession } from "../../../../lib/admin";
import { authOptions } from "../../../../lib/auth";
import {
  getPosterTemplateAdminData,
  isDbAdminSession,
  savePosterTemplate,
} from "../../../../lib/db";

export const runtime = "nodejs";

async function canManage(request) {
  if (process.env.NODE_ENV === "development" && new URL(request.url).searchParams.get("preview") === "1") {
    return true;
  }
  const session = await getServerSession(authOptions);
  return Boolean(session && (isAdminSession(session) || (await isDbAdminSession(session))));
}

export async function GET(request) {
  if (!(await canManage(request))) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  return NextResponse.json(await getPosterTemplateAdminData());
}

export async function PUT(request) {
  if (!(await canManage(request))) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 7 * 1024 * 1024) {
    return NextResponse.json({ message: "템플릿 데이터가 너무 큽니다." }, { status: 413 });
  }

  try {
    const body = await request.json();
    return NextResponse.json(await savePosterTemplate(body));
  } catch (error) {
    return NextResponse.json(
      { message: error?.message || "포스터 템플릿을 저장하지 못했습니다." },
      { status: 400 },
    );
  }
}
