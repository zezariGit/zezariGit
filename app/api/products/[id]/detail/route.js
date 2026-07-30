import { NextResponse } from "next/server";
import { getProductDetailImage } from "../../../../../lib/db";

export async function GET(_request, { params }) {
  const { id } = await params;
  const image = await getProductDetailImage(id);
  const parsed = parseDataUrl(image?.detail_image_data_url);

  if (!parsed) {
    return NextResponse.json({ message: "상품 상세페이지 이미지를 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(parsed.buffer, {
    status: 200,
    headers: {
      "Content-Type": parsed.mimeType,
      "Content-Length": String(parsed.buffer.length),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(image.detail_image_name || "product-detail")}`,
    },
  });
}

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}
