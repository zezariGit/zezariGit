import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { isAdminSession } from "../../../../../../lib/admin";
import {
  completePrepaidSubscriptionPurchase,
  isDbAdminSession,
  saveProductOrderDraft,
} from "../../../../../../lib/db";
import {
  createTossCustomerKey,
  getTossCallbackUrls,
  getTossWidgetClientKey,
  isTossWidgetConfigured,
} from "../../../../../../lib/toss-payments";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planMonths = Number(body?.planMonths || 1);
  const adminPass = body.adminPass === true;
  if (adminPass && !(isAdminSession(session) || (await isDbAdminSession(session)))) {
    return NextResponse.json({ message: "관리자만 결제패스를 사용할 수 있습니다." }, { status: 403 });
  }

  try {
    if (!body?.productId) throw new Error("이용권과 함께 구매할 상품을 선택해 주세요.");
    const productOrder = await saveProductOrderDraft(session, {
      productId: body.productId,
      subjectId: body.subjectId,
      quantity: body.quantity,
      designIndex: body.designIndex,
      designId: body.designId,
      couponId: body.couponId,
      shippingAddress: body.shippingAddress,
      shippingAddressDetail: body.shippingAddressDetail,
      paymentMethod: "WIDGET",
      orderType: "subscription",
      planMonths,
    });
    const configured = isTossWidgetConfigured();
    const { successUrl, failUrl } = getTossCallbackUrls(productOrder.id);
    const freeSuccessUrl = `${successUrl}${successUrl.includes("?") ? "&" : "?"}free=1&orderId=${encodeURIComponent(productOrder.tossOrderId)}&amount=0`;
    if (adminPass) {
      const paymentKey = `admin-pass-subscription-${productOrder.id}`;
      await completePrepaidSubscriptionPurchase({
        guardianId: productOrder.guardian.id,
        productOrderId: productOrder.id,
        payment: {
          orderId: productOrder.tossOrderId,
          paymentKey,
          method: "관리자 결제패스",
          status: "DONE",
          isTestPayment: true,
        },
      });
      return NextResponse.json({
        adminPass: true,
        productOrderId: productOrder.id,
        orderId: productOrder.tossOrderId,
        amount: productOrder.amount,
        redirectUrl: buildAdminPassSuccessUrl(successUrl, {
          paymentKey,
          orderId: productOrder.tossOrderId,
          amount: productOrder.amount,
        }),
      });
    }

    return NextResponse.json({
      configured,
      freeOrder: Number(productOrder.amount || 0) === 0,
      clientKey: configured ? getTossWidgetClientKey() : "",
      customerKey: createTossCustomerKey(session.user?.id || session.user?.email),
      productOrderId: productOrder.id,
      orderId: productOrder.tossOrderId,
      planMonths: productOrder.plan.months,
      subtotalAmount: productOrder.subtotalAmount,
      discountAmount: productOrder.discountAmount,
      amount: productOrder.amount,
      orderName: `${productOrder.product.name}${productOrder.product.selected_design?.name ? ` - ${productOrder.product.selected_design.name}` : ""} + ${productOrder.plan.name}`,
      successUrl,
      failUrl,
      redirectUrl: Number(productOrder.amount || 0) === 0 ? freeSuccessUrl : "",
      customerName: productOrder.guardian.name || session.user?.name || "",
      customerEmail: productOrder.guardian.email || session.user?.email || "",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "이용권 결제 준비에 실패했습니다." }, { status: 400 });
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
