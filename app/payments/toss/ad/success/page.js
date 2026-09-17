import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import {
  getGuardianAdCheckoutData,
  markSubjectAdPaid,
  publishPaidSubjectAd,
} from "../../../../../lib/db";
import { confirmWidgetPayment } from "../../../../../lib/toss-payments";
import AdPaymentSuccessClient from "./ad-payment-success-client";

export const dynamic = "force-dynamic";

export default async function TossAdSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const adId = String(params?.adId || "").trim();
  const paymentKey = String(params?.paymentKey || "").trim();
  const orderId = String(params?.orderId || "").trim();
  const amount = Number(params?.amount || 0);
  const previewMode = process.env.NODE_ENV === "development" ? String(params?.preview || "") : "";
  const preview = ["1", "admin", "user"].includes(previewMode);

  if (preview) {
    return <AdPaymentSuccessClient />;
  }

  if (!session) {
    return <AdPaymentResult title="로그인이 필요합니다" message="광고 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }
  if (!adId || !paymentKey || !orderId || !amount) {
    return <AdPaymentResult title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  try {
    const { ad } = await getGuardianAdCheckoutData(session, adId);
    if (ad.paid_at && ad.toss_order_id === orderId) {
      await publishPaidSubjectAd(adId);
      return <AdPaymentSuccessClient />;
    }
    if (ad.toss_order_id !== orderId || Number(ad.amount) !== amount) {
      throw new Error("광고 결제 정보가 일치하지 않습니다.");
    }

    const payment = await confirmWidgetPayment({ paymentKey, orderId, amount });
    if (payment.orderId !== orderId || Number(payment.totalAmount || 0) !== Number(ad.amount) || payment.status !== "DONE") {
      throw new Error("토스페이먼츠 승인 결과가 광고 결제 정보와 일치하지 않습니다.");
    }

    await markSubjectAdPaid({
      adId,
      paymentKey,
      tossOrderId: orderId,
      paymentMethod: payment.method || "결제위젯",
    });
    await publishPaidSubjectAd(adId);

    return <AdPaymentSuccessClient />;
  } catch (error) {
    return <AdPaymentResult title="광고 결제 처리에 실패했습니다" message={error.message || "잠시 후 다시 시도해 주세요."} />;
  }
}

function AdPaymentResult({ title, message, sourceLabel = "Toss Payments", testAdId = "" }) {
  return (
    <main className="payment-result-page">
      <section className="payment-result-panel">
        <div className="complete-mark" aria-hidden="true">✓</div>
        <p className="intro-kicker">{sourceLabel}</p>
        <h1>{title}</h1>
        <p>{message}</p>
        {testAdId && (
          <a className="primary-button" href={`/account/ads?testAd=${encodeURIComponent(testAdId)}`}>
            광고 상태 테스트하기
          </a>
        )}
        <a className="primary-button" href="/account/ads">
          광고내역 보기
        </a>
        <a className="plain-button" href="/?tab=dashboard">
          대시보드 이동
        </a>
      </section>
    </main>
  );
}
