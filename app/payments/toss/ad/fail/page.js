import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../../lib/auth";
import { markSubjectAdPaymentCancelledForGuardian, markSubjectAdPaymentFailedForGuardian } from "../../../../../lib/db";
import { isTossPaymentCancellation } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossAdFailPage({ searchParams }) {
  const params = await searchParams;
  const code = String(params?.code || "").trim();
  const message = String(params?.message || "광고 결제가 완료되지 않았습니다.").trim();
  const adId = String(params?.adId || "").trim();
  const cancelled = isTossPaymentCancellation(code);
  const session = await getServerSession(authOptions);
  if (session && adId) {
    if (cancelled) await markSubjectAdPaymentCancelledForGuardian(session, adId);
    else await markSubjectAdPaymentFailedForGuardian(session, adId);
  }

  if (!adId) redirect("/?tab=dashboard");
  const query = new URLSearchParams();
  if (!cancelled) query.set("paymentError", message);
  redirect(`/ads/checkout/${encodeURIComponent(adId)}${query.size ? `?${query.toString()}` : ""}`);
}
