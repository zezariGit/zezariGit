import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StatusToast from "../status-toast";
import ShopCheckoutClient from "../shop-checkout-client";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import { getShopPageData, getShopProducts } from "../../lib/db";

export default async function ShopPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const requestedProductId = params?.product || "";
  const [{ guardian, subjects, coupons }, productRows] = await Promise.all([
    getShopPageData(session),
    getShopProducts(),
  ]);
  const products = sortShopProducts(productRows);
  const availableCoupons = coupons.filter((coupon) => coupon.status === "available");
  const initialProduct = products.find(
    (product) => product.id === requestedProductId || product.slug === requestedProductId
  ) || products[0] || null;
  const adminPaymentPassEnabled = isAdminSession(session) || Number(guardian?.is_admin || 0) === 1;

  return (
    <main className="shop-page">
      {initialProduct ? (
        <ShopCheckoutClient
          products={products}
          initialProductId={initialProduct.id}
          subjects={subjects}
          guardian={guardian}
          coupons={availableCoupons}
          adminPaymentPassEnabled={adminPaymentPassEnabled}
        />
      ) : (
        <section className="shop-shell">
          <h1>상품 구매</h1>
          <p className="empty-text">현재 선택 가능한 상품이 없습니다. 관리자 상품 관리에서 상품을 활성화해 주세요.</p>
        </section>
      )}
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function sortShopProducts(products) {
  return [...products].sort((a, b) => {
    return Number(a.sort_order || 0) - Number(b.sort_order || 0)
      || String(a.name || "").localeCompare(String(b.name || ""), "ko");
  });
}
