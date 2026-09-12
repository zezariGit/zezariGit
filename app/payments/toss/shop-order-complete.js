export default function ShopOrderComplete({ title, message, order = null }) {
  if (!order) {
    return (
      <main className="shop-complete-page">
        <section className="shop-complete-panel shop-complete-error">
          <h1>{title}</h1>
          <p>{message}</p>
          <a className="shop-next-button" href="/?tab=dashboard">대시보드 이동</a>
        </section>
      </main>
    );
  }

  return (
    <main className="shop-complete-page order-complete-page">
      <section className="shop-complete-panel order-complete-panel">
        <img
          className="order-complete-reference"
          src="/assets/order-complete/product-order-complete.png"
          alt="주문이 완료되었습니다. 주문정보는 결제 및 서비스 현황에서 확인할 수 있습니다."
        />

        <a className="order-complete-dashboard-link" href="/?tab=dashboard">
          대시보드로 이동 <span aria-hidden="true">›</span>
        </a>
      </section>
    </main>
  );
}
