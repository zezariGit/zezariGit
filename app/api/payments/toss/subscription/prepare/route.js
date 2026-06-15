import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { prepareSubscriptionForGuardian } from "../../../../../../lib/db";
import { getTossCallbackUrls, getTossClientKey, isTossConfigured } from "../../../../../../lib/toss-payments";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const planMonths = Number(body?.planMonths || 1);
  const { guardian, subscription, plan } = await prepareSubscriptionForGuardian(session, planMonths);
  const configured = isTossConfigured();
  const { successUrl, failUrl } = getTossCallbackUrls();

  return NextResponse.json({
    configured,
    clientKey: configured ? getTossClientKey() : "",
    customerKey: subscription.customer_key,
    planMonths: plan.months,
    amount: plan.amount,
    orderName: plan.name,
    successUrl,
    failUrl,
    customerName: guardian.name || session.user?.name || "",
    customerEmail: guardian.email || session.user?.email || "",
  });
}
