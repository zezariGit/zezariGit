import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { prepareSubscriptionForGuardian, saveProductOrderDraft } from "../../../../../../lib/db";
import { getTossCallbackUrls, getTossClientKey, isTossConfigured } from "../../../../../../lib/toss-payments";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planMonths = Number(body?.planMonths || 1);
  let productOrder = null;
  if (body?.productId) {
    productOrder = await saveProductOrderDraft(session, {
      productId: body.productId,
      subjectId: body.subjectId,
      quantity: body.quantity,
      designIndex: body.designIndex,
      shippingAddress: body.shippingAddress,
      shippingAddressDetail: body.shippingAddressDetail,
      paymentMethod: body.paymentMethod,
      orderType: "subscription",
      planMonths,
    });
  }
  const { guardian, subscription, plan } = await prepareSubscriptionForGuardian(session, planMonths);
  const configured = isTossConfigured();
  const { successUrl: baseSuccessUrl, failUrl } = getTossCallbackUrls();
  const successUrl = productOrder
    ? appendQuery(baseSuccessUrl, { productOrderId: productOrder.id })
    : baseSuccessUrl;

  return NextResponse.json({
    configured,
    clientKey: configured ? getTossClientKey() : "",
    customerKey: subscription.customer_key,
    productOrderId: productOrder?.id || "",
    planMonths: plan.months,
    amount: plan.amount,
    orderName: plan.name,
    successUrl,
    failUrl,
    customerName: guardian.name || session.user?.name || "",
    customerEmail: guardian.email || session.user?.email || "",
  });
}

function appendQuery(url, values) {
  const next = new URL(url);
  for (const [key, value] of Object.entries(values)) {
    if (value) next.searchParams.set(key, value);
  }
  return next.toString();
}
