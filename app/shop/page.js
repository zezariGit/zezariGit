import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StatusToast from "../status-toast";
import ShopCheckoutClient from "../shop-checkout-client";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import { getShopPageData, getShopProducts } from "../../lib/db";

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params?.preview === "1";
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const requestedProductId = params?.product || "";
  const requestedSubjectId = params?.subject || "";
  if (preview) {
    const products = toClientData(sortShopProducts(await getShopProducts()));
    const paymentPreview = params?.screen === "payment";
    return (
      <main className="shop-page">
        <ShopCheckoutClient
          products={products}
          initialProductId={paymentPreview ? products[0]?.id || "" : ""}
          initialSubjectId="preview-recent"
          initialOrderPreview={paymentPreview}
          subjects={[
            { id: "preview-recent", name: "로로", birth_date: "2022-06-23", created_at: "2026-09-11" },
            { id: "preview-older", name: "제자리", birth_date: "2020-03-18", created_at: "2026-09-10" },
          ]}
          guardian={{ name: "보호자", address: "", address_detail: "" }}
          coupons={[]}
        />
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const [shopPageData, productRows] = await Promise.all([
    getShopPageData(session),
    getShopProducts(),
  ]);
  const { guardian, subjects, coupons } = toClientData(shopPageData);
  const products = toClientData(sortShopProducts(productRows));
  const availableCoupons = coupons.filter((coupon) => coupon.status === "available");
  const initialProduct = products.find(
    (product) => product.id === requestedProductId || product.slug === requestedProductId
  ) || null;
  const adminPaymentPassEnabled = isAdminSession(session) || Number(guardian?.is_admin || 0) === 1;

  return (
    <main className="shop-page">
      {products.length > 0 ? (
        <ShopCheckoutClient
          products={products}
          initialProductId={initialProduct?.id || ""}
          initialSubjectId={requestedSubjectId}
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

function toClientData(value) {
  return JSON.parse(JSON.stringify(value));
}
