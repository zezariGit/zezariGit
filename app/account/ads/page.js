import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusToast from "../../status-toast";
import { activateTestSubjectAdAction, endSubjectAdAction } from "../../actions";
import { authOptions } from "../../../lib/auth";
import { isAdminSession } from "../../../lib/admin";
import { getGuardianAdDashboardData } from "../../../lib/db";
import { AccountTopbar, formatCurrency, formatDate } from "../account-ui";
import AdHistoryActions from "./ad-history-actions";

const previewAds = [
  { id: "preview-review", subject_id: "preview-1", subject_name: "김제자리", status: "ready", meta_status: "test_in_review", is_test_payment: 1, region: "서울특별시 강남구 역삼동", start_date: "2026-09-05", end_date: "2026-09-11", amount: 89900, reach_count: 0, creative_image_url: "/assets/missing-ad-template.png", created_at: "2026-09-08" },
  { id: "preview-running", subject_id: "preview-2", subject_name: "박제자리", status: "active", meta_status: "test_active", is_test_payment: 1, region: "서울특별시 송파구 잠실동", start_date: "2026-09-01", end_date: "2026-09-07", amount: 69900, reach_count: 6000, creative_image_url: "/assets/missing-ad-template.png", created_at: "2026-09-07" },
  { id: "preview-ended", subject_id: "preview-3", subject_name: "이제자리", status: "ended", meta_status: "test_ended", is_test_payment: 1, region: "서울특별시 마포구 서교동", start_date: "2026-08-20", end_date: "2026-08-26", amount: 39900, reach_count: 4320, creative_image_url: "/assets/missing-ad-template.png", created_at: "2026-08-26" },
];

export default async function AccountAdsPage({ searchParams }) {
  const params = await searchParams;
  const previewMode = process.env.NODE_ENV === "development" ? String(params?.preview || "") : "";
  const preview = ["1", "empty"].includes(previewMode);
  const session = preview ? { user: { provider: "credentials" } } : await getServerSession(authOptions);
  if (!session) redirect("/");
  const statusFilter = ["all", "running", "done"].includes(params?.status) ? params.status : "all";
  const data = preview
    ? { guardian: { is_admin: 1 }, ads: previewMode === "empty" ? [] : previewAds }
    : await getGuardianAdDashboardData(session);
  const ads = data.ads;
  const admin = preview || isAdminSession(session) || Number(data.guardian?.is_admin || 0) === 1;
  const selectedTestAd = admin
    ? ads.find((ad) => ad.id === String(params?.testAd || "") && Number(ad.is_test_payment || 0) === 1 && adStage(ad) === "review")
    : null;
  const filteredAds = ads.filter((ad) => {
    const stage = adStage(ad);
    if (statusFilter === "running") return stage === "review" || stage === "running";
    if (statusFilter === "done") return stage === "done";
    return true;
  });

  return (
    <main className="account-page ad-history-page">
      <section className="account-panel ad-history-panel">
        <AccountTopbar title="광고 대시보드" />
        <nav className="ad-history-filters" aria-label="광고 상태 필터">
          <FilterLink active={statusFilter === "all"} href={filterHref("all", preview, selectedTestAd?.id)}>전체</FilterLink>
          <FilterLink active={statusFilter === "running"} href={filterHref("running", preview, selectedTestAd?.id)}>진행 중</FilterLink>
          <FilterLink active={statusFilter === "done"} href={filterHref("done", preview, selectedTestAd?.id)}>광고 완료</FilterLink>
        </nav>
        {selectedTestAd && (
          <section className="ad-test-status-panel" aria-label="관리자 광고 상태 테스트">
            <div>
              <strong>광고 검토 중 상태입니다.</strong>
              <p>카드와 필터를 확인한 후 Meta 호출 없이 진행 중 상태로 전환할 수 있습니다.</p>
            </div>
            <form action={activateTestSubjectAdAction}>
              <input type="hidden" name="adId" value={selectedTestAd.id} />
              <button type="submit">진행 중으로 전환</button>
            </form>
          </section>
        )}
        {filteredAds.length > 0 ? (
          <div className="ad-history-list">
            {filteredAds.map((ad) => <AdHistoryCard ad={ad} preview={preview} key={ad.id} />)}
          </div>
        ) : (
          <div className="ad-history-empty">
            <img src="/assets/ad-dashboard-promotion.png" alt="" aria-hidden="true" />
            <strong>진행한 광고 내역이 없습니다.</strong>
            <p>온라인 실종광고를 신청하면 이곳에서 확인할 수 있습니다.</p>
          </div>
        )}
      </section>
      <StatusToast message={params?.notice || ""} type={params?.noticeType || "success"} />
    </main>
  );
}

function FilterLink({ active, href, children }) {
  return <Link className={active ? "active" : ""} href={href}>{children}</Link>;
}

function filterHref(status, preview, testAdId = "") {
  const query = new URLSearchParams({ status });
  if (preview) query.set("preview", "1");
  if (testAdId) query.set("testAd", testAdId);
  return `/account/ads?${query.toString()}`;
}

function AdHistoryCard({ ad, preview }) {
  const stage = adStage(ad);
  return (
    <article className="ad-history-card">
      <div className="ad-history-poster">
        {ad.creative_image_url
          ? <img src={ad.creative_image_url} alt={`${ad.subject_name} 실종 광고 포스터`} />
          : <div><span>실종자를 찾습니다</span><strong>{ad.subject_name}</strong></div>}
      </div>
      <div className="ad-history-details">
        <header>
          <strong>{ad.subject_name}</strong>
          {stage === "running" && <AdHistoryActions ad={ad} action={endSubjectAdAction} preview={preview} />}
        </header>
        <span className={`ad-history-status ${stage}`}>{adStageLabel(stage)}</span>
        <dl>
          <dt>광고 지역</dt><dd>{formatAdLocation(ad)}</dd>
          <dt>광고 기간</dt><dd>{formatDate(ad.start_date)}-{formatDate(ad.end_date)}</dd>
          <dt>광고 금액</dt><dd>{formatCurrency(ad.amount)}</dd>
          <dt>도달수</dt><dd>{stage === "review" ? "-" : `${Number(ad.reach_count || 0).toLocaleString("ko-KR")}명`}</dd>
        </dl>
      </div>
    </article>
  );
}

function adStage(ad) {
  if (String(ad.status) === "ended") return "done";
  if (["active", "paused"].includes(String(ad.status))) return "running";
  return "review";
}

function adStageLabel(stage) {
  if (stage === "running") return "진행 중";
  if (stage === "done") return "광고 완료";
  return "광고 검토 중";
}

function formatAdLocation(ad) {
  if (ad?.coverage_type === "country") return ad?.distance_label || "대한민국 전체";
  return ad?.region || "지역 미입력";
}
