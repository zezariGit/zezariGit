import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { saveProductOrderDraft } from "../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const order = await saveProductOrderDraft(session, {
      productId: body.productId,
      subjectId: body.subjectId,
      quantity: body.quantity,
      orderType: "standalone",
    });
    return NextResponse.json({ ok: true, orderId: order.id, amount: order.amount });
  } catch (error) {
    return NextResponse.json({ message: error.message || "상품 주문을 저장하지 못했습니다." }, { status: 400 });
  }
}
