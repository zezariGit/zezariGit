import { markSubscriptionFailed } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export default async function TossSubscriptionFailPage({ searchParams }) {
  const params = await searchParams;
  const code = String(params?.code || "").trim();
  const message = String(params?.message || "구독 결제가 완료되지 않았습니다.").trim();
  const customerKey = String(params?.customerKey || "").trim();

  if (customerKey) {
    await markSubscriptionFailed({ customerKey, code, message });
  }

  return (
    <main className="payment-result-page">
      <section className="payment-result-panel">
        <p className="intro-kicker">Toss Payments</p>
        <h1>구독 결제가 완료되지 않았습니다</h1>
        <p>{message}</p>
        {code && <p className="payment-error-code">오류 코드: {code}</p>}
        <a className="primary-button" href="/?tab=dashboard">
          대시보드로 이동
        </a>
      </section>
    </main>
  );
}
