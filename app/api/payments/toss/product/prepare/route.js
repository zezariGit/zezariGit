import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "상품 구매 방식이 변경되었습니다. 화면을 새로고침한 뒤 다시 주문해 주세요." },
    { status: 410 }
  );
}
