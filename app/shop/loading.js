export default function ShopLoading() {
  return (
    <main className="shop-page">
      <section className="shop-phone-panel shop-loading-panel" aria-busy="true" aria-label="상품 정보를 불러오는 중">
        <header className="shop-topbar">
          <span className="shop-back-link" aria-hidden="true">‹</span>
          <h1>상품 구매</h1>
          <span className="shop-help-mark" aria-hidden="true">?</span>
        </header>
        <div className="shop-loading-stack">
          <span className="shop-loading-line wide" />
          <span className="shop-loading-line" />
          <span className="shop-loading-line" />
          <div className="shop-loading-preview" />
          <span className="shop-loading-line short" />
        </div>
        <p className="shop-loading-message">상품 정보를 불러오고 있습니다.</p>
      </section>
    </main>
  );
}
