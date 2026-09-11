import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { getGuardianBillingData } from "../../../lib/db";
import { AccountTopbar, formatCurrency } from "../account-ui";
import { formatBillingDateTime, PaymentIcon, PaymentStatus } from "./billing-ui";

const previewPayments = [
  {
    id: "preview-ad",
    payment_kind: "ad",
    payment_title: "온라인 실종 광고",
    amount: 69900,
    payment_status: "paid",
    payment_date: "2026-09-03 10:08:00",
  },
  {
    id: "preview-bracelet",
    payment_kind: "order",
    payment_title: "제자리 QR 팔찌",
    amount: 29000,
    payment_status: "paid",
    payment_date: "2026-08-21 05:32:00",
  },
  {
    id: "preview-ad-old",
    payment_kind: "ad",
    payment_title: "온라인 실종 광고",
    amount: 39900,
    payment_status: "paid",
    payment_date: "2026-07-12 01:15:00",
  },
  {
    id: "preview-necklace",
    payment_kind: "order",
    payment_title: "제자리 QR 목걸이",
    amount: 24000,
    payment_status: "cancelled",
    payment_date: "2026-06-28 07:47:00",
  },
];

export default async function BillingPage({ searchParams }) {
  const params = await searchParams;
  const previewMode = process.env.NODE_ENV === "development" ? String(params?.preview || "") : "";
  const preview = ["1", "empty"].includes(previewMode);
  const session = preview ? { user: { provider: "credentials" } } : await getServerSession(authOptions);
  if (!session) redirect("/");

  const payments = preview
    ? previewMode === "empty" ? [] : previewPayments
    : (await getGuardianBillingData(session)).payments;

  return (
    <main className="account-page billing-history-page">
      <section className="account-panel billing-history-panel">
        <AccountTopbar title="결제 및 서비스 현황" />

        {payments.length > 0 ? (
          <section className="billing-history-section" aria-labelledby="billing-history-title">
            <header>
              <h2 id="billing-history-title">결제 내역</h2>
              <p>최근 결제한 내역부터 표시됩니다.</p>
            </header>
            <div className="billing-payment-list" aria-label="결제 내역 목록">
              {payments.map((payment) => (
                <PaymentCard payment={payment} preview={preview} key={`${payment.payment_kind}:${payment.id}`} />
              ))}
            </div>
          </section>
        ) : (
          <section className="billing-empty-state" aria-label="결제 내역 없음">
            <img src="/assets/billing/receipt.png" alt="" aria-hidden="true" />
            <strong>결제 내역이 없습니다.</strong>
            <p>제자리 앱에서 결제한 내역이 여기에 표시됩니다.</p>
          </section>
        )}
      </section>
    </main>
  );
}

function PaymentCard({ payment, preview }) {
  const detailHref = `/account/billing/${payment.payment_kind}/${encodeURIComponent(payment.id)}${preview ? "?preview=1" : ""}`;
  return (
    <a className="billing-payment-card" href={detailHref} aria-label={`${payment.payment_title} 결제 상세보기`}>
      <header>
        <PaymentIcon kind={payment.payment_kind} cancelled={payment.payment_status === "cancelled"} />
        <strong>{payment.payment_title}</strong>
      </header>
      <dl>
        <div><dt>결제 금액</dt><dd className="amount">{formatCurrency(payment.amount)}</dd></div>
        <div><dt>결제 상태</dt><dd><PaymentStatus status={payment.payment_status} /></dd></div>
        <div><dt>결제 일시</dt><dd>{formatBillingDateTime(payment.payment_date)}</dd></div>
      </dl>
      <span className="billing-detail-button">상세보기</span>
    </a>
  );
}
