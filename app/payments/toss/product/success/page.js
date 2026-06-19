import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { getProductOrderById, markProductOrderPaid } from "../../../../../lib/db";
import { confirmPayment } from "../../../../../lib/toss-payments";

export const dynamic = "force-dynamic";

export default async function TossProductSuccessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const productOrderId = String(params?.productOrderId || "").trim();
  const paymentKey = String(params?.paymentKey || "").trim();
  const orderId = String(params?.orderId || "").trim();
  const amount = Number(params?.amount || 0);

  if (!session) {
    return <ShopComplete title="로그인이 필요합니다" message="상품 결제 완료 처리를 위해 다시 로그인해 주세요." />;
  }

  if (!productOrderId || !paymentKey || !orderId || !amount) {
    return <ShopComplete title="결제 인증값이 없습니다" message="Toss Payments 인증 결과를 확인할 수 없습니다." />;
  }

  const order = await getProductOrderById(productOrderId);
  if (!order) {
    return <ShopComplete title="주문 정보를 찾을 수 없습니다" message="다시 상품 선택 화면에서 결제를 시작해 주세요." />;
  }

  try {
    await confirmPayment({ paymentKey, orderId, amount });
    await markProductOrderPaid({
      orderId: productOrderId,
      paymentKey,
      tossOrderId: orderId,
      status: "paid",
    });

    return (
      <ShopComplete
        title="주문이 완료되었습니다!"
        message="상품을 수령하신 후, QR 코드를 활성화해야 제자리 서비스 이용이 시작됩니다."
        order={order}
      />
    );
  } catch (error) {
    return <ShopComplete title="상품 결제 처리에 실패했습니다" message={error.message || "잠시 후 다시 시도해 주세요."} />;
  }
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
