import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { getLocationSecurityExportData } from "../../../../../lib/db";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  try {
    const type = new URL(request.url).searchParams.get("type") || "ledger";
    const result = await getLocationSecurityExportData(session, type, {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
    });
    const csv = toCsv(result.rows);
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zezari-location-${result.type}-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "내보내기에 실패했습니다." }, { status: 403 });
  }
}

function toCsv(rows) {
  if (!rows.length) return "데이터 없음\r\n";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ].join("\r\n");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}
