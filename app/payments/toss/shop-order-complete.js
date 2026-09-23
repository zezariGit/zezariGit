export default function ShopOrderComplete({ title, message, order = null }) {
  if (!order) {
    return (
      <main className="shop-complete-page">
        <section className="shop-complete-panel shop-complete-error">
          <h1>{title}</h1>
          <p>{message}</p>
          <a className="shop-next-button" href="/?tab=dashboard">홈 이동</a>
        </section>
      </main>
    );
  }

  return (
    <main className="shop-complete-page order-complete-page">
      <section className="shop-complete-panel order-complete-panel">
        <div className="order-complete-check" aria-hidden="true"><span /></div>
        <div className="order-complete-copy">
          <h1>주문이 완료되었습니다</h1>
          <p>주문정보는 결제 및 서비스 현황에서<br />확인할 수 있습니다.</p>
        </div>

        <a className="order-complete-dashboard-link" href="/?tab=dashboard">
          홈으로 이동 <span aria-hidden="true">›</span>
        </a>
      </section>
    </main>
  );
}
