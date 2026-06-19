import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { saveProductOrderDraft } from "../../../../../../lib/db";
import { getTossClientKey, getTossProductCallbackUrls, isTossConfigured } from "../../../../../../lib/toss-payments";

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
      designIndex: body.designIndex,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      orderType: "standalone",
    });
    const configured = isTossConfigured();
    const { successUrl, failUrl } = getTossProductCallbackUrls(order.id);

    return NextResponse.json({
      configured,
      clientKey: configured ? getTossClientKey() : "",
      productOrderId: order.id,
      orderId: order.tossOrderId,
      amount: order.amount,
      orderName: `${order.product.name} ${order.orderType === "standalone" ? "단독 구매" : "구독"}`,
      successUrl,
      failUrl,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "상품 결제 준비에 실패했습니다." }, { status: 400 });
  }
}
