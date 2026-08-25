const ORDER_STEPS = [
  { label: "상품 수령", src: "/assets/order-complete/product-received.png" },
  { label: "QR 코드 스캔", src: "/assets/order-complete/qr-scan.png" },
  { label: "대상자 확인", src: "/assets/order-complete/subject-check.png" },
  { label: "활성화 완료", src: "/assets/order-complete/activation-complete.png" },
];

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
        <div className="order-complete-symbol" aria-hidden="true">
          <span className="order-sparkle sparkle-one">+</span>
          <span className="order-sparkle sparkle-two">•</span>
          <span className="order-sparkle sparkle-three">✦</span>
          <span className="order-sparkle sparkle-four">+</span>
          <i>✓</i>
        </div>

        <header className="order-complete-heading">
          <h1>주문이 완료되었습니다!</h1>
          <p>상품 수령 후 QR 코드를 활성화해 주세요.</p>
        </header>

        <div className="shop-activation-guide" aria-label="QR 활성화 순서">
          {ORDER_STEPS.map((step) => (
            <div className="order-complete-step" key={step.label}>
              <img src={step.src} alt={step.label} />
            </div>
          ))}
        </div>

        <section className="order-activation-note">
          <CalendarClockIcon />
          <div>
            <strong>QR 안심 서비스는 QR 코드 활성화일을 기준으로 시작됩니다.</strong>
            <p>상품 수령 후 QR 코드를 스캔해 활성화해 주세요.</p>
            <p>활성화가 완료되면 대상자 정보 페이지를 이용할 수 있습니다.</p>
          </div>
        </section>

        <a className="order-complete-dashboard-link" href="/?tab=dashboard">
          대시보드 이동 <span aria-hidden="true">›</span>
        </a>
      </section>
    </main>
  );
}

function CalendarClockIcon() {
  return (
    <svg className="order-calendar-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="8" y="12" width="40" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M8 24h40M18 7v11M38 7v11M17 33h5M28 33h5M17 42h5M28 42h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <circle cx="47" cy="46" r="12" fill="#ffffff" stroke="currentColor" strokeWidth="4" />
      <path d="M47 39v7l5 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}
