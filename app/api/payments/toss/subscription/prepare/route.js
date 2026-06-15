import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { getSubscriptionAmount, prepareSubscriptionForGuardian } from "../../../../../../lib/db";
import { getTossCallbackUrls, getTossClientKey, isTossConfigured } from "../../../../../../lib/toss-payments";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { guardian, subscription } = await prepareSubscriptionForGuardian(session);
  const configured = isTossConfigured();
  const { successUrl, failUrl } = getTossCallbackUrls();

  return NextResponse.json({
    configured,
    clientKey: configured ? getTossClientKey() : "",
    customerKey: subscription.customer_key,
    amount: getSubscriptionAmount(),
    orderName: process.env.TOSS_SUBSCRIPTION_ORDER_NAME || "zezari 월 구독",
    successUrl,
    failUrl,
    customerName: guardian.name || session.user?.name || "",
    customerEmail: guardian.email || session.user?.email || "",
  });
}
