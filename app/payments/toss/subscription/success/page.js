import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import {
  getSubscriptionByCustomerKey,
  markSubscriptionActive,
  markSubscriptionFailed,
} from "../../../../../lib/db";
import { approveSubscriptionBilling, issueBillingKey } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossSubscriptionSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const authKey = String(params?.authKey || "").trim();
  const customerKey = String(params?.customerKey || "").trim();

  if (!session) {
    return <PaymentResult title="로그인이 필요합니다" message="구독 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }

  if (!authKey || !customerKey) {
    return <PaymentResult title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  const subscription = await getSubscriptionByCustomerKey(customerKey);
  if (!subscription) {
    return <PaymentResult title="구독 정보를 찾을 수 없습니다" message="다시 대시보드에서 구독 결제를 시작해 주세요." />;
  }

  try {
    const billing = await issueBillingKey({ authKey, customerKey });
    const orderId = `sub_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const payment = await approveSubscriptionBilling({
      billingKey: billing.billingKey,
      customerKey,
      amount: Number(subscription.amount || process.env.TOSS_SUBSCRIPTION_AMOUNT || 9900),
      orderId,
      orderName: process.env.TOSS_SUBSCRIPTION_ORDER_NAME || "zezari 월 구독",
    });

    await markSubscriptionActive({
      customerKey,
      billingKey: billing.billingKey,
      payment,
    });

    return (
      <PaymentResult
        title="구독 결제가 완료되었습니다"
        message="대시보드에서 구독중 상태를 확인할 수 있습니다."
        actionLabel="대시보드로 이동"
        actionHref="/?tab=dashboard"
      />
    );
  } catch (error) {
    await markSubscriptionFailed({
      customerKey,
      code: error.code || "TOSS_SUBSCRIPTION_FAILED",
      message: error.message,
    });

    return (
      <PaymentResult
        title="구독 결제 처리에 실패했습니다"
        message={error.message || "잠시 후 다시 시도해 주세요."}
        actionLabel="대시보드로 이동"
        actionHref="/?tab=dashboard"
      />
    );
  }
}

function PaymentResult({ title, message, actionLabel = "처음 화면", actionHref = "/" }) {
  return (
    <main className="payment-result-page">
      <section className="payment-result-panel">
        <p className="intro-kicker">Toss Payments</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <a className="primary-button" href={actionHref}>
          {actionLabel}
        </a>
      </section>
    </main>
  );
}
