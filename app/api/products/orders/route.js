import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "상품 구매 방식이 변경되었습니다. /shop에서 QR 서비스 포함 상품을 주문해 주세요." },
    { status: 410 }
  );
}
