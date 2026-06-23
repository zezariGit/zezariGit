import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import {
  getProductOrderForGuardian,
  getSubscriptionForGuardianByCustomerKey,
  markSubscriptionActive,
  markSubscriptionFailed,
  markSubscriptionReady,
} from "../../../../../lib/db";
import { approveSubscriptionBilling, issueBillingKey } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossSubscriptionSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const authKey = String(params?.authKey || "").trim();
  const customerKey = String(params?.customerKey || "").trim();
  const productOrderId = String(params?.productOrderId || "").trim();

  if (!session) {
    return <PaymentResult title="로그인이 필요합니다" message="구독 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }

  if (!authKey || !customerKey) {
    return <PaymentResult title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  const subscription = await getSubscriptionForGuardianByCustomerKey(session, customerKey);
  if (!subscription) {
    return <PaymentResult title="구독 정보를 찾을 수 없습니다" message="다시 대시보드에서 구독 결제를 시작해 주세요." />;
  }

  const productOrder = productOrderId ? await getProductOrderForGuardian(session, productOrderId) : null;
  if (productOrderId && !productOrder) {
    return <PaymentResult title="주문 정보를 찾을 수 없습니다" message="현재 로그인한 보호자의 주문인지 확인해 주세요." />;
  }
  if (productOrder && ["paid", "paid_waiting_activation", "activated"].includes(productOrder.status)) {
    return (
      <ShopComplete
        title="주문이 완료되었습니다!"
        message="이미 결제가 완료된 주문입니다. 상품 수령 후 QR 코드를 활성화해 주세요."
        order={productOrder}
      />
    );
  }
  if (productOrder && (productOrder.order_type !== "subscription" || Number(productOrder.amount) !== Number(subscription.amount))) {
    return <PaymentResult title="결제 정보가 일치하지 않습니다" message="선택한 구독 상품과 결제금액을 다시 확인해 주세요." />;
  }
  if (!productOrder && subscription.status === "active") {
    return <PaymentResult title="구독 결제가 완료되었습니다" message="이미 활성화된 구독입니다." actionLabel="대시보드로 이동" actionHref="/?tab=dashboard" />;
  }

  try {
    const billing = await issueBillingKey({ authKey, customerKey });
    const orderId = `sub_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const payment = await approveSubscriptionBilling({
      billingKey: billing.billingKey,
      customerKey,
      amount: Number(subscription.amount || process.env.TOSS_SUBSCRIPTION_AMOUNT || 9900),
      orderId,
      orderName: subscription.plan_name || process.env.TOSS_SUBSCRIPTION_ORDER_NAME || "zezari 월 구독",
    });
    if (payment.orderId !== orderId || Number(payment.totalAmount || 0) !== Number(subscription.amount) || payment.status !== "DONE") {
      throw new Error("토스페이먼츠 승인 결과가 구독 정보와 일치하지 않습니다.");
    }

    if (productOrderId) {
      await markSubscriptionReady({
        customerKey,
        billingKey: billing.billingKey,
        payment,
        productOrderId,
      });
      const order = await getProductOrderForGuardian(session, productOrderId);

      return (
        <ShopComplete
          title="주문이 완료되었습니다!"
          message="상품을 수령하신 후, QR 코드를 활성화해야 제자리 서비스 이용이 시작됩니다."
          order={order}
        />
      );
    }

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

function ShopComplete({ title, message, order = null }) {
  return (
    <main className="shop-complete-page">
      <section className="shop-complete-panel">
        <div className="complete-mark" aria-hidden="true">✓</div>
        <h1>{title}</h1>
        <p>{message}</p>
        {order && (
          <div className="shop-activation-guide">
            <span>상품 수령</span>
            <span>QR 코드 스캔</span>
            <span>대상자 확인</span>
            <span>활성화 완료</span>
          </div>
        )}
        <a className="shop-next-button" href="/?tab=dashboard">
          대시보드 이동
        </a>
      </section>
    </main>
  );
}
