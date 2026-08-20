import { NextResponse } from "next/server";

export function catalogImageResponse(image, fallbackName = "product-image") {
  const parsed = parseDataUrl(image?.image_data_url);
  if (!parsed) {
    return NextResponse.json({ message: "상품 이미지를 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(parsed.buffer, {
    status: 200,
    headers: {
      "Content-Type": parsed.mimeType,
      "Content-Length": String(parsed.buffer.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(image.image_name || fallbackName)}`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function parseDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (!imageSignatureMatches(buffer, mimeType)) return null;
  return { mimeType, buffer };
}

function imageSignatureMatches(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/gif") return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  return mimeType === "image/webp" && buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}
