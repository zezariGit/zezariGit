import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianCoupons } from "../../../lib/db";
import { AccountTopbar, formatDate } from "../account-ui";
import CouponRegistrationForm from "./coupon-registration-form";

const previewCoupons = [
  { id: "preview-a", status: "available", name: "제자리 상품 5,000원 할인 쿠폰", code: "ZEZARI-5000", discount_type: "fixed", discount_value: 5000, master_discount_label: "5,000원", start_date: "2026-09-01", end_date: "2026-12-31", min_order_amount: 30000, service_scope: "all", created_at: "2026-09-01" },
  { id: "preview-b", status: "used", name: "온라인 실종 광고 10% 할인 쿠폰", code: "SAFE-10", discount_type: "percent", discount_value: 10, master_discount_label: "10%", start_date: "2026-01-01", end_date: "2026-08-31", service_scope: "ad", used_at: "2026-08-20", created_at: "2026-01-01" },
];

export default async function CouponsPage({ searchParams }) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params?.preview === "1";
  const session = preview ? { user: { provider: "credentials" } } : await getServerSession(authOptions);
  if (!session) redirect("/");

  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const coupons = preview ? previewCoupons : (await getGuardianCoupons(session)).coupons;
  const availableCoupons = coupons.filter((coupon) => coupon.status === "available").sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  const usedCoupons = coupons.filter((coupon) => coupon.status === "used");

  return (
    <main className="account-page">
      <section className="account-panel">
        <AccountTopbar title="쿠폰함" />

        <CouponRegistrationForm errorMessage={noticeType === "error" ? notice : ""} preview={preview} />

        <section className="account-section">
          <h2>사용가능 쿠폰</h2>
          <CouponList coupons={availableCoupons} emptyText="사용 가능한 쿠폰이 없습니다." />
        </section>

        <section className="account-section">
          <h2>사용완료 쿠폰</h2>
          <CouponList coupons={usedCoupons} emptyText="사용 완료된 쿠폰이 없습니다." used />
        </section>
      </section>
      <StatusToast message={noticeType === "error" ? "" : notice} type={noticeType} />
    </main>
  );
}

function CouponList({ coupons, emptyText, used = false }) {
  if (coupons.length === 0) {
    return <div className="coupon-empty-state"><p>{emptyText}</p></div>;
  }

  return (
    <div className="coupon-list">
      {coupons.map((coupon) => (
        <article className={`coupon-card${used ? " used" : ""}`} key={coupon.id}>
          <header><strong>{coupon.master_description || coupon.name}</strong>{used && <span>사용완료</span>}</header>
          <dl>
            <dt>{coupon.discount_type === "percent" ? "할인율" : "할인액"}</dt><dd>{coupon.master_discount_label || coupon.discount_label || "-"}</dd>
            <dt>사용기간</dt><dd>{formatDate(coupon.start_date)} ~ {formatDate(coupon.end_date)}</dd>
            <dt>사용조건</dt><dd>{couponCondition(coupon)}</dd>
            <dt>쿠폰코드</dt><dd>{coupon.code}</dd>
          </dl>
        </article>
      ))}
    </div>
  );
}

function couponCondition(coupon) {
  if (coupon.service_scope === "ad") return "온라인 실종 광고 결제 시";
  if (coupon.service_scope && !["all", "subscription"].includes(coupon.service_scope)) return "제자리 상품 구매 시";
  if (Number(coupon.min_order_amount || 0) > 0) return `${Number(coupon.min_order_amount).toLocaleString("ko-KR")}원 이상 구매 시`;
  return "제자리 서비스 결제 시";
}
