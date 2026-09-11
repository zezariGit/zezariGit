import { formatDateTime } from "../../../lib/date-format";

export function PaymentIcon({ kind, cancelled = false }) {
  const advertisement = kind === "ad";
  return (
    <span className={`billing-payment-icon${cancelled ? " cancelled" : ""}`}>
      <img
        src={advertisement ? "/assets/billing/promotion-green.png" : "/assets/billing/shopping-green.png"}
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}

export function PaymentStatus({ status }) {
  return <span className={`billing-payment-status ${status}`}>{paymentStatusLabel(status)}</span>;
}

export function PaymentInfoSection({ title, rows = [], className = "" }) {
  return (
    <section className={`billing-detail-section ${className}`.trim()}>
      <h2>{title}</h2>
      <dl>
        {rows.filter((row) => row.value !== undefined && row.value !== null && row.value !== "").map((row) => (
          <div className={row.emphasis ? "emphasis" : ""} key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function paymentStatusLabel(status) {
  if (status === "cancelled") return "결제 취소";
  if (status === "failed") return "결제 실패";
  if (status === "pending") return "결제 대기";
  return "결제 완료";
}

export function formatBillingDateTime(value) {
  return formatDateTime(value).replace(/-/g, ".");
}
