import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianBillingData } from "../../../lib/db";
import { AccountTopbar, formatCurrency, formatDate, subscriptionStatusLabel } from "../account-ui";

export default async function BillingPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const { subjects, subscription, productOrders } = await getGuardianBillingData(session);
  const statusLabel = subscriptionStatusLabel(subscription?.status);
  const nextBillingDate = subscription?.current_period_end ? formatDate(subscription.current_period_end) : "-";

  return (
    <main className="account-page">
      <section className="account-panel">
        <AccountTopbar title="결제 및 구독 현황" />

        <section className="account-section">
          <h2>구독 현황</h2>
          <div className="account-subject-list">
            {subjects.map((subject) => (
              <article className="account-subject-card" key={subject.id}>
                <SubjectAvatar subject={subject} />
                <div>
                  <strong>{subject.name}</strong>
                  <span>구독기간: {statusLabel}</span>
                  <span>다음 결제일: {nextBillingDate}</span>
                </div>
                <a href="#payment-history">결제 내역 &gt;</a>
              </article>
            ))}
            {subjects.length === 0 && (
              <p className="account-empty-text">등록된 관리대상이 없습니다. 관리대상정보에서 먼저 대상자를 등록해 주세요.</p>
            )}
          </div>
        </section>

        <nav className="account-menu-list" aria-label="결제 관련 메뉴">
          <Link href="/account/coupons">쿠폰함</Link>
          <Link href="/account/payment-methods">결제수단</Link>
          <Link href="/account/ads">광고 대시보드</Link>
        </nav>

        <section className="account-section" id="payment-history">
          <h2>최근 결제 내역</h2>
          <div className="account-history-list">
            {productOrders.map((order) => (
              <article className="account-history-card" key={order.id}>
                <div>
                  <strong>{order.product_name || "상품"}</strong>
                  <span>{order.subject_name || "대상자 미선택"} · {order.order_type === "standalone" ? "상품 단독 구매" : "구독 상품"}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div>
                  <strong>{formatCurrency(order.amount)}</strong>
                  <span>{paymentStatusLabel(order.status)}</span>
                </div>
              </article>
            ))}
            {productOrders.length === 0 && (
              <p className="account-empty-text">아직 결제 내역이 없습니다.</p>
            )}
          </div>
        </section>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function SubjectAvatar({ subject }) {
  const photoSrc = subject.photo_url || subject.photo_data_url;
  if (photoSrc) {
    return <img className="account-subject-avatar" src={photoSrc} alt={`${subject.name} 사진`} />;
  }
  return (
    <div className="account-subject-avatar empty" aria-hidden="true">
      <span />
    </div>
  );
}

function paymentStatusLabel(status) {
  if (status === "paid" || status === "activated") return "결제완료";
  if (status === "paid_waiting_activation") return "활성화대기";
  if (status === "payment_pending") return "결제대기";
  if (status === "failed") return "결제실패";
  return status || "-";
}
