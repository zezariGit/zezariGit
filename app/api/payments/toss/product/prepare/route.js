import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { saveProductOrderDraft } from "../../../../../../lib/db";
import {
  createTossCustomerKey,
  getTossProductCallbackUrls,
  getTossWidgetClientKey,
  isTossWidgetConfigured,
} from "../../../../../../lib/toss-payments";

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
      designId: body.designId,
      couponId: body.couponId,
      shippingAddress: body.shippingAddress,
      shippingAddressDetail: body.shippingAddressDetail,
      paymentMethod: body.paymentMethod,
      orderType: "standalone",
    });
    const configured = isTossWidgetConfigured();
    const { successUrl, failUrl } = getTossProductCallbackUrls(order.id);
    const freeSuccessUrl = `${successUrl}${successUrl.includes("?") ? "&" : "?"}free=1&orderId=${encodeURIComponent(order.tossOrderId)}&amount=0`;

    return NextResponse.json({
      configured,
      freeOrder: Number(order.amount || 0) === 0,
      clientKey: configured ? getTossWidgetClientKey() : "",
      customerKey: createTossCustomerKey(session.user?.id || session.user?.email),
      productOrderId: order.id,
      orderId: order.tossOrderId,
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      amount: order.amount,
      orderName: `${order.product.name}${order.product.selected_design?.name ? ` - ${order.product.selected_design.name}` : ""} 단독 구매`,
      successUrl,
      failUrl,
      redirectUrl: Number(order.amount || 0) === 0 ? freeSuccessUrl : "",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "상품 결제 준비에 실패했습니다." }, { status: 400 });
  }
}
