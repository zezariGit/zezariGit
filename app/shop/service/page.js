import { getProductServiceIntro } from "../../../lib/db";
import ShopServiceControls from "./shop-service-controls";

export const dynamic = "force-dynamic";

export default async function ShopServicePage() {
  const setting = JSON.parse(JSON.stringify(await getProductServiceIntro()));
  const hasImage = Number(setting.has_image || 0) === 1;

  return (
    <main className="shop-service-page" id="shop-service-top">
      <header className="shop-service-topbar">
        <ShopServiceControls mode="back" />
        <h1>제품보기</h1>
        <span aria-hidden="true" />
      </header>
      {hasImage ? (
        <img
          className="shop-service-detail-image"
          src={`/api/shop/service-intro/image?v=${encodeURIComponent(setting.updated_at || "")}`}
          alt="상품구매 서비스 소개"
        />
      ) : (
        <section className="shop-service-placeholder">
          <span>ZEZARI FAMILY</span>
          <h2>소중한 사람의 일상에<br />안심을 더해 주세요.</h2>
          <p>대상자 전용 QR이 적용된 상품으로 발견자와 보호자를 빠르게 연결합니다.</p>
          <div>
            <strong>QR 안심 연결</strong>
            <strong>대상자 맞춤 디자인</strong>
            <strong>보호자 연락 지원</strong>
          </div>
        </section>
      )}
      <ShopServiceControls mode="top" />
    </main>
  );
}
