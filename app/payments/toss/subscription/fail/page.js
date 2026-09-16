import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { markProductOrderCancelledForGuardian, markProductOrderFailedForGuardian } from "../../../../../lib/db";
import { isTossPaymentCancellation } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossSubscriptionFailPage({ searchParams }) {
  const params = await searchParams;
  const code = String(params?.code || "").trim();
  const message = String(params?.message || "이용권 결제가 완료되지 않았습니다.").trim();
  const productOrderId = String(params?.productOrderId || "").trim();
  const cancelled = isTossPaymentCancellation(code);
  const session = await getServerSession(authOptions);

  if (session && productOrderId) {
    if (cancelled) await markProductOrderCancelledForGuardian(session, productOrderId);
    else await markProductOrderFailedForGuardian(session, productOrderId);
  }

  return (
    <main className="payment-result-page">
      <section className="payment-result-panel">
        <p className="intro-kicker">Toss Payments</p>
        <h1>이용권 결제가 완료되지 않았습니다</h1>
        <p>{message}</p>
        {code && <p className="payment-error-code">오류 코드: {code}</p>}
        <a className="primary-button" href="/shop">
          상품 선택으로 이동
        </a>
      </section>
    </main>
  );
}
