import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StatusToast from "../../status-toast";
import { authOptions } from "../../../lib/auth";
import { getGuardianAdDashboardData } from "../../../lib/db";
import { AccountTopbar, adStatusLabel, formatCurrency, formatDate } from "../account-ui";

export default async function AccountAdsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const params = await searchParams;
  const notice = params?.notice || "";
  const noticeType = params?.noticeType || "success";
  const statusFilter = ["all", "running", "done"].includes(params?.status) ? params.status : "all";
  const { ads } = await getGuardianAdDashboardData(session);
  const filteredAds = ads.filter((ad) => {
    if (statusFilter === "running") return ["active", "paused", "ready"].includes(ad.status);
    if (statusFilter === "done") return ad.status === "ended";
    return true;
  });

  return (
    <main className="account-page">
      <section className="account-panel">
        <AccountTopbar title="광고 대시보드" />

        <nav className="ad-dashboard-filters" aria-label="광고 상태 필터">
          <a className={statusFilter === "all" ? "active" : ""} href="/account/ads?status=all">전체</a>
          <a className={statusFilter === "running" ? "active" : ""} href="/account/ads?status=running">광고중</a>
          <a className={statusFilter === "done" ? "active" : ""} href="/account/ads?status=done">광고완료</a>
        </nav>

        <div className="ad-dashboard-list">
          {filteredAds.map((ad) => (
            <article className="ad-dashboard-card" key={ad.id}>
              <AdThumb ad={ad} />
              <div>
                <div className="ad-card-heading">
                  <strong>{ad.subject_name}</strong>
                  <span className={`ad-status-badge ${ad.status}`}>{adStatusLabel(ad.status)}</span>
                </div>
                <dl>
                  <dt>광고지역</dt>
                  <dd>{ad.region}</dd>
                  <dt>광고기간</dt>
                  <dd>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</dd>
                  <dt>광고금액</dt>
                  <dd>{formatCurrency(ad.amount)}</dd>
                  <dt>Meta 상태</dt>
                  <dd>{ad.meta_status || "운영 준비 중"}</dd>
                </dl>
              </div>
            </article>
          ))}
          {filteredAds.length === 0 && (
            <p className="account-empty-text">조건에 맞는 광고가 없습니다. 대시보드에서 관리대상별 광고를 신청할 수 있습니다.</p>
          )}
        </div>

        <ul className="ad-dashboard-notes">
          <li>광고는 관리대상별로 신청되며, 기간과 지역 정보 기준으로 운영됩니다.</li>
          <li>Meta 광고 API 직접 송출은 운영 설정이 필요한 항목입니다.</li>
          <li>광고 상태 변경은 대시보드의 관리대상 카드에서 진행할 수 있습니다.</li>
        </ul>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function AdThumb({ ad }) {
  if (ad.subject_photo_data_url) {
    return <img className="ad-dashboard-thumb" src={ad.subject_photo_data_url} alt={`${ad.subject_name} 광고 이미지`} />;
  }
  return (
    <div className="ad-dashboard-thumb empty" aria-hidden="true">
      AD
    </div>
  );
}
