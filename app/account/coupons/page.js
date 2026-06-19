import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { registerCouponAction } from "../../actions";
import FormSubmitButton from "../../form-submit-button";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianCoupons } from "../../../lib/db";
import { AccountTopbar, formatDate } from "../account-ui";

export default async function CouponsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const { coupons } = await getGuardianCoupons(session);
  const availableCoupons = coupons.filter((coupon) => coupon.status === "available");
  const usedCoupons = coupons.filter((coupon) => coupon.status === "used");

  return (
    <main className="account-page">
      <section className="account-panel">
        <AccountTopbar title="쿠폰함" />

        <form className="coupon-register-form" action={registerCouponAction}>
          <label htmlFor="coupon-code">쿠폰 번호를 입력해 주세요</label>
          <div>
            <input id="coupon-code" name="code" type="text" placeholder="예: ZEZARI-100" maxLength={40} />
            <FormSubmitButton pendingText="등록 중">등록</FormSubmitButton>
          </div>
        </form>

        <section className="account-section">
          <h2>사용가능 쿠폰</h2>
          <CouponList coupons={availableCoupons} emptyText="사용 가능한 쿠폰이 없습니다." />
        </section>

        <section className="account-section">
          <h2>사용완료 쿠폰</h2>
          <CouponList coupons={usedCoupons} emptyText="사용 완료된 쿠폰이 없습니다." used />
        </section>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function CouponList({ coupons, emptyText, used = false }) {
  if (coupons.length === 0) {
    return <p className="account-empty-text">{emptyText}</p>;
  }

  return (
    <div className="coupon-list">
      {coupons.map((coupon) => (
        <article className={`coupon-card${used ? " used" : ""}`} key={coupon.id}>
          <div>
            <strong>{coupon.name}</strong>
            <span>{coupon.discount_label || "할인"} · {coupon.code}</span>
          </div>
          <span>{used ? `사용일 ${formatDate(coupon.used_at)}` : "사용가능"}</span>
        </article>
      ))}
    </div>
  );
}
