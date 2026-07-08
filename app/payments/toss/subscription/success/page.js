import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import {
  completePrepaidSubscriptionPurchase,
  getProductOrderForGuardian,
} from "../../../../../lib/db";
import { confirmWidgetPayment } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossSubscriptionSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const productOrderId = String(params?.productOrderId || "").trim();
  const paymentKey = String(params?.paymentKey || "").trim();
  const orderId = String(params?.orderId || "").trim();
  const amount = Number(params?.amount || 0);
  const freeOrder = String(params?.free || "") === "1";

  if (!session) {
    return <PaymentResult title="로그인이 필요합니다" message="이용권 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }

  if (!productOrderId || !orderId || (!freeOrder && (!paymentKey || !amount))) {
    return <PaymentResult title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  const productOrder = await getProductOrderForGuardian(session, productOrderId);
  if (!productOrder) {
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
  if (
    productOrder.order_type !== "subscription"
    || productOrder.toss_order_id !== orderId
    || Number(productOrder.amount) !== amount
  ) {
    return <PaymentResult title="결제 정보가 일치하지 않습니다" message="이용권 주문번호와 결제금액을 다시 확인해 주세요." />;
  }

  try {
    if (freeOrder) {
      if (Number(productOrder.amount || 0) !== 0) {
        throw new Error("전액 할인 이용권 주문 정보가 일치하지 않습니다.");
      }
      const result = await completePrepaidSubscriptionPurchase({
        guardianId: productOrder.guardian_id,
        productOrderId,
        payment: {
          orderId,
          paymentKey: `coupon-free-${productOrderId.slice(0, 8)}`,
          method: "쿠폰 전액할인",
          status: "DONE",
        },
      });
      const order = await getProductOrderForGuardian(session, productOrderId);
      const waitingForActivation = result.status === "ready";

      return (
        <ShopComplete
          title="주문이 완료되었습니다!"
          message={waitingForActivation
            ? "쿠폰 전액 할인으로 결제가 완료되었습니다. 상품을 수령한 뒤 QR을 활성화하면 이용기간이 시작됩니다."
            : "쿠폰 전액 할인으로 결제가 완료되었고, 이용기간이 추가되었습니다."}
          order={order}
        />
      );
    }

    const payment = await confirmWidgetPayment({ paymentKey, orderId, amount });
    if (payment.orderId !== orderId || Number(payment.totalAmount || 0) !== Number(productOrder.amount) || payment.status !== "DONE") {
      throw new Error("토스페이먼츠 승인 결과가 이용권 주문과 일치하지 않습니다.");
    }

    const result = await completePrepaidSubscriptionPurchase({
      guardianId: productOrder.guardian_id,
      productOrderId,
      payment,
    });
    const order = await getProductOrderForGuardian(session, productOrderId);
    const waitingForActivation = result.status === "ready";

    return (
      <ShopComplete
        title="주문이 완료되었습니다!"
        message={waitingForActivation
          ? "상품을 수령한 뒤 QR을 활성화하면 이용기간이 시작됩니다."
          : "기존 이용기간 뒤에 구매한 이용기간이 추가되었습니다."}
        order={order}
      />
    );
  } catch (error) {
    return (
      <PaymentResult
        title="이용권 결제 처리에 실패했습니다"
        message={error.message || "잠시 후 다시 시도해 주세요."}
        actionLabel="상품 선택으로 이동"
        actionHref="/shop"
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
