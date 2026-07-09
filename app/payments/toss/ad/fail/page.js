import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { markSubjectAdPaymentFailedForGuardian } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export default async function TossAdFailPage({ searchParams }) {
  const params = await searchParams;
  const code = String(params?.code || "").trim();
  const message = String(params?.message || "광고 결제가 완료되지 않았습니다.").trim();
  const adId = String(params?.adId || "").trim();
  const session = await getServerSession(authOptions);
  if (session && adId) {
    await markSubjectAdPaymentFailedForGuardian(session, adId);
  }

  return (
    <main className="payment-result-page">
      <section className="payment-result-panel">
        <p className="intro-kicker">Toss Payments</p>
        <h1>광고 결제가 완료되지 않았습니다</h1>
        <p>{message}</p>
        {code && <p className="payment-error-code">오류 코드: {code}</p>}
        <a className="primary-button" href={adId ? `/ads/checkout/${encodeURIComponent(adId)}` : "/?tab=dashboard"}>
          광고 결제로 돌아가기
        </a>
      </section>
    </main>
  );
}
