import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../../lib/auth";
import { markSubjectAdPaymentFailedForGuardian } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export default async function TossAdFailPage({ searchParams }) {
  const params = await searchParams;
  const code = String(params?.code || "").trim();
  const message = String(params?.message || "광고 결제가 완료되지 않았습니다.").trim();
  const adId = String(params?.adId || "").trim();
  const cancelled = isPaymentCancellation(code);
  const session = await getServerSession(authOptions);
  if (session && adId && !cancelled) {
    await markSubjectAdPaymentFailedForGuardian(session, adId);
  }

  if (!adId) redirect("/?tab=dashboard");
  const query = new URLSearchParams();
  if (!cancelled) query.set("paymentError", message);
  redirect(`/ads/checkout/${encodeURIComponent(adId)}${query.size ? `?${query.toString()}` : ""}`);
}

function isPaymentCancellation(code) {
  return ["USER_CANCEL", "PAY_PROCESS_CANCELED", "PAY_PROCESS_ABORTED"].includes(String(code || "").toUpperCase());
}
