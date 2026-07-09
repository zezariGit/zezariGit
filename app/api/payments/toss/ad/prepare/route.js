import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import { prepareSubjectAdPayment } from "../../../../../../lib/db";
import {
  createTossCustomerKey,
  getTossAdCallbackUrls,
  getTossWidgetClientKey,
  isTossWidgetConfigured,
} from "../../../../../../lib/toss-payments";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const adId = String(body.adId || "").trim();

  try {
    const { guardian, ad, alreadyPaid } = await prepareSubjectAdPayment(session, adId);
    const configured = isTossWidgetConfigured();
    const { successUrl, failUrl } = getTossAdCallbackUrls(ad.id);

    return NextResponse.json({
      configured,
      alreadyPaid,
      clientKey: configured ? getTossWidgetClientKey() : "",
      customerKey: createTossCustomerKey(session.user?.id || session.user?.email),
      adId: ad.id,
      orderId: ad.toss_order_id,
      amount: Number(ad.amount || 0),
      orderName: `${ad.subject_name || "관리대상"} 온라인 실종광고`,
      successUrl,
      failUrl,
      customerEmail: guardian.email || guardian.google_email || "",
      customerName: guardian.name || "",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "광고 결제 준비에 실패했습니다." }, { status: 400 });
  }
}
