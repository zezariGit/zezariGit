import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { isAdminSession } from "../../../../../../lib/admin";
import {
  isDbAdminSession,
  markProductOrderPaid,
  saveProductOrderDraft,
} from "../../../../../../lib/db";
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
  const adminPass = body.adminPass === true;
  if (adminPass && !(isAdminSession(session) || (await isDbAdminSession(session)))) {
    return NextResponse.json({ message: "관리자만 결제패스를 사용할 수 있습니다." }, { status: 403 });
  }

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
    if (adminPass) {
      const paymentKey = `admin-pass-product-${order.id}`;
      await markProductOrderPaid({
        orderId: order.id,
        paymentKey,
        tossOrderId: order.tossOrderId,
        status: "paid",
        paymentMethod: "관리자 결제패스",
        isTestPayment: true,
      });
      return NextResponse.json({
        adminPass: true,
        productOrderId: order.id,
        orderId: order.tossOrderId,
        amount: order.amount,
        redirectUrl: buildAdminPassSuccessUrl(successUrl, {
          paymentKey,
          orderId: order.tossOrderId,
          amount: order.amount,
        }),
      });
    }

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

function buildAdminPassSuccessUrl(successUrl, { paymentKey, orderId, amount }) {
  const url = new URL(successUrl);
  url.searchParams.set("adminPass", "1");
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("amount", String(Number(amount || 0)));
  if (Number(amount || 0) === 0) {
    url.searchParams.set("free", "1");
  } else {
    url.searchParams.set("paymentKey", paymentKey);
  }
  return url.toString();
}
