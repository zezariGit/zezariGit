import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { getProductOrderForGuardian, markProductOrderPaid } from "../../../../../lib/db";
import { confirmWidgetPayment } from "../../../../../lib/toss-payments";
import ShopComplete from "../../shop-order-complete";

export const dynamic = "force-dynamic";

export default async function TossProductSuccessPage({ searchParams }) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV !== "production" && String(params?.preview || "") === "1";

  if (preview) {
    return <ShopComplete order={{ id: "local-preview" }} />;
  }

  const session = await getServerSession(authOptions);
  const productOrderId = String(params?.productOrderId || "").trim();
  const paymentKey = String(params?.paymentKey || "").trim();
  const orderId = String(params?.orderId || "").trim();
  const amount = Number(params?.amount || 0);
  const freeOrder = String(params?.free || "") === "1";
  const adminPass = String(params?.adminPass || "") === "1";

  if (!session) {
    return <ShopComplete title="로그인이 필요합니다" message="상품 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }

  if (!productOrderId || !orderId || (!freeOrder && (!paymentKey || !amount))) {
    return <ShopComplete title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  const order = await getProductOrderForGuardian(session, productOrderId);
  if (!order) {
    return <ShopComplete title="주문 정보를 찾을 수 없습니다" message="다시 상품 선택 화면에서 결제를 시작해 주세요." />;
  }
  if (["paid", "paid_waiting_activation", "activated"].includes(order.status)) {
    return (
      <ShopComplete
        title="주문이 완료되었습니다!"
        message={adminPass
          ? "관리자 결제패스로 테스트 주문과 결제 완료 상태가 저장되었습니다."
          : "이미 결제가 완료된 주문입니다."}
        order={order}
      />
    );
  }
  if (order.order_type !== "standalone" || order.toss_order_id !== orderId || Number(order.amount) !== amount) {
    return <ShopComplete title="결제 정보가 일치하지 않습니다" message="주문번호와 결제금액을 다시 확인해 주세요." />;
  }

  try {
    if (freeOrder) {
      if (Number(order.amount || 0) !== 0) {
        throw new Error("전액 할인 주문 정보가 일치하지 않습니다.");
      }
      await markProductOrderPaid({
        orderId: productOrderId,
        paymentKey: `coupon-free-${productOrderId.slice(0, 8)}`,
        tossOrderId: orderId,
        status: "paid",
        paymentMethod: "쿠폰 전액할인",
      });
      const completedOrder = await getProductOrderForGuardian(session, productOrderId);
      return (
        <ShopComplete
          title="주문이 완료되었습니다!"
          message={completedOrder?.status === "activated"
            ? "쿠폰 전액 할인 결제와 매칭된 QR 활성화가 완료되었습니다."
            : "쿠폰 전액 할인 결제가 완료되었습니다."}
          order={completedOrder}
        />
      );
    }

    const payment = await confirmWidgetPayment({ paymentKey, orderId, amount });
    if (payment.orderId !== orderId || Number(payment.totalAmount || 0) !== Number(order.amount) || payment.status !== "DONE") {
      throw new Error("토스페이먼츠 승인 결과가 주문 정보와 일치하지 않습니다.");
    }
    await markProductOrderPaid({
      orderId: productOrderId,
      paymentKey,
      tossOrderId: orderId,
      status: "paid",
      paymentMethod: payment.method || "결제위젯",
    });
    const completedOrder = await getProductOrderForGuardian(session, productOrderId);

    return (
      <ShopComplete
        title="주문이 완료되었습니다!"
        message={completedOrder?.status === "activated"
          ? "상품 결제와 매칭된 QR 활성화가 완료되었습니다."
          : "상품 결제가 완료되었습니다."}
        order={completedOrder}
      />
    );
  } catch (error) {
    return <ShopComplete title="상품 결제 처리에 실패했습니다" message={error.message || "잠시 후 다시 시도해 주세요."} />;
  }
}
