import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusToast from "../status-toast";
import ShopCheckoutClient from "../shop-checkout-client";
import { authOptions } from "../../lib/auth";
import { getDashboardData, getGuardianCoupons, getProducts } from "../../lib/db";

export default async function ShopPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const selectedProductId = params?.product || "";
  const [{ guardian, subjects, subscription, subscriptionPlans }, products, couponData] = await Promise.all([
    getDashboardData(session, {
      includeSubjectDetails: false,
      includeAdDailyRate: false,
    }),
    getProducts(),
    getGuardianCoupons(session),
  ]);
  const availableCoupons = couponData.coupons.filter((coupon) => coupon.status === "available");
  const selectedProduct = products.find((product) => product.id === selectedProductId || product.slug === selectedProductId) || null;

  return (
    <main className="shop-page">
      {!selectedProduct ? (
        <section className="shop-shell">
          <header className="shop-topbar">
            <Link className="shop-back-link" href="/" aria-label="대시보드로 돌아가기">‹</Link>
            <h1>상품 선택</h1>
            <span className="shop-help-mark" aria-hidden="true">?</span>
          </header>

          <div className="product-choice-grid">
            {products.map((product) => (
              <Link className="product-choice-card" href={`/shop?product=${encodeURIComponent(product.id)}`} key={product.id}>
                <ProductVisual product={product} />
                <strong>{product.name}</strong>
                <span>{formatCurrency(product.unit_price)}</span>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="empty-text">현재 선택 가능한 상품이 없습니다. 관리자 상품 관리에서 상품을 활성화해 주세요.</p>
            )}
          </div>
        </section>
      ) : (
        <ShopCheckoutClient
          product={selectedProduct}
          subjects={subjects}
          plans={subscriptionPlans}
          subscription={subscription}
          guardian={guardian}
          coupons={availableCoupons}
        />
      )}
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function ProductVisual({ product }) {
  if (product.image_data_url) {
    return <img src={product.image_data_url} alt={`${product.name} 상품 이미지`} />;
  }
  return <span aria-hidden="true">{productFallbackIcon(product.slug)}</span>;
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  return "상품";
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
