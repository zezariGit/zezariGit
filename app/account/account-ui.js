import Link from "next/link";

export function AccountTopbar({ title, backHref = "/?panel=my", action = null }) {
  return (
    <header className="account-topbar">
      <Link className="account-back-link" href={backHref} aria-label="마이페이지로 돌아가기">‹</Link>
      <h1>{title}</h1>
      <div className="account-topbar-action">{action}</div>
    </header>
  );
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function subscriptionStatusLabel(status) {
  if (status === "active") return "구독중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "결제대기";
  return "미구독";
}

export function adStatusLabel(status) {
  if (status === "active") return "광고중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "대기";
  if (status === "ended") return "광고완료";
  return "준비중";
}
