import { formatDateOnly } from "../../lib/date-format";
import BackButton from "../back-button";

export function AccountTopbar({ title, backHref = "/?panel=my", action = null }) {
  return (
    <header className="account-topbar">
      <BackButton className="account-back-link" href={backHref} replace label="설정으로 돌아가기" />
      <h1>{title}</h1>
      <div className="account-topbar-action">{action}</div>
    </header>
  );
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

export function formatDate(value) {
  return formatDateOnly(value);
}

export function subscriptionStatusLabel(status) {
  if (status === "active" || status === "ready") return "이용중";
  if (status === "paused") return "일시정지";
  if (status === "expired") return "이용기간 만료";
  if (status === "failed") return "결제 실패";
  return "미이용";
}

export function adStatusLabel(status) {
  if (status === "active") return "광고중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "대기";
  if (status === "ended") return "광고완료";
  return "준비중";
}
