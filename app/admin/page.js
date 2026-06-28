import { getServerSession } from "next-auth";
import Link from "next/link";
import QRCode from "qrcode";
import FormSubmitButton from "../form-submit-button";
import { LogoutButton, SocialLoginButtons } from "../auth-actions";
import ModalScrollLock from "../modal-scroll-lock";
import StatusToast from "../status-toast";
import AdminWorkspace from "./admin-workspace";
import AdminExportButton from "./export-button";
import { isAdminSession, isDefaultAdminEmail } from "../../lib/admin";
import { authOptions, getConfiguredProviderIds } from "../../lib/auth";
import {
  getAdminAdsData,
  getAdminDashboardData,
  getAdminData,
  getAdminInquiriesData,
  getAdminLocationSharesData,
  getAdminMissingReportsData,
  getAdminOrdersData,
  getAdminPaymentsData,
  getAdminProductsData,
  getAdminSubscriptionPlansData,
  getAdminSubjectsData,
  getAdminUsersData,
  getQrAdminData,
  isDbAdminSession,
} from "../../lib/db";
import {
  generateQrCodesAction,
  setGuardianActiveAction,
  setGuardianAdminMemoAction,
  setGuardianAdminAction,
  setAdDailyRateAction,
  setProductCatalogItemAction,
  setProductOrderFulfillmentAction,
  setQrActiveAction,
  setQrSubjectAction,
  setAdminSubjectAdStatusAction,
  setSubscriptionPlanPriceAction,
} from "./actions";

export default async function AdminPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const enabledProviders = getConfiguredProviderIds();
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";

  if (!session) {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>관리자 로그인</h1>
          <p>관리자 페이지를 사용하려면 등록된 소셜 계정 로그인이 필요합니다.</p>
          <SocialLoginButtons enabledProviders={enabledProviders} />
        </section>
        <StatusToast message={notice} type={noticeType} />
      </main>
    );
  }

  const adminAuthorized = isAdminSession(session) || (await isDbAdminSession(session));
  if (!adminAuthorized) {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>접근 권한이 없습니다</h1>
          <p>등록된 관리자 이메일만 관리자 페이지에 접근할 수 있습니다.</p>
          <LogoutButton />
        </section>
        <StatusToast message={notice} type={noticeType} />
      </main>
    );
  }

  const activeSection = ["dashboard", "guardians", "subjects", "qr", "admins", "payments", "products", "orders", "ads", "missing", "locations", "inquiries"].includes(resolvedSearchParams?.section)
    ? resolvedSearchParams.section
    : "dashboard";
  const selectedGuardianId = resolvedSearchParams?.guardian || "";
  const selectedSubjectId = resolvedSearchParams?.subject || "";
  const guardianFilters = {
    query: resolvedSearchParams?.guardianAdminQuery || "",
    status: resolvedSearchParams?.guardianStatus || "all",
  };
  const subjectAdminFilters = {
    query: resolvedSearchParams?.subjectAdminQuery || "",
    status: resolvedSearchParams?.subjectStatus || "all",
    qr: resolvedSearchParams?.subjectQr || "all",
    guardianId: resolvedSearchParams?.guardianId || "",
  };
  const qrFilters = {
    match: resolvedSearchParams?.match || "all",
    active: resolvedSearchParams?.active || "all",
    assignQr: resolvedSearchParams?.assignQr || "",
    guardianQuery: resolvedSearchParams?.guardianQuery || "",
    subjectQuery: resolvedSearchParams?.subjectQuery || "",
  };
  const orderFilters = {
    query: resolvedSearchParams?.orderQuery || "",
    payment: resolvedSearchParams?.payment || "all",
    fulfillment: resolvedSearchParams?.fulfillment || "all",
  };
  const paymentFilters = {
    query: resolvedSearchParams?.paymentLedgerQuery || "",
    type: resolvedSearchParams?.paymentLedgerType || "all",
  };
  const selectedOrderId = resolvedSearchParams?.order || "";
  const selectedAdId = resolvedSearchParams?.ad || "";
  const adFilters = {
    query: resolvedSearchParams?.adQuery || "",
    status: resolvedSearchParams?.adStatus || "all",
  };
  const missingFilters = {
    query: resolvedSearchParams?.missingQuery || "",
    startDate: resolvedSearchParams?.missingStart || "",
    endDate: resolvedSearchParams?.missingEnd || "",
  };
  const selectedLocationShareId = resolvedSearchParams?.locationShare || "";
  const locationFilters = {
    query: resolvedSearchParams?.locationQuery || "",
    startDate: resolvedSearchParams?.locationStart || "",
    endDate: resolvedSearchParams?.locationEnd || "",
  };
  const dashboardData = activeSection === "dashboard" ? await getAdminDashboardData(resolvedSearchParams?.month) : null;
  const adminData = activeSection === "guardians" ? await getAdminData(selectedGuardianId, guardianFilters) : null;
  const adminSubjectsData = activeSection === "subjects"
    ? await getAdminSubjectsData(selectedSubjectId, subjectAdminFilters)
    : null;
  const qrData = activeSection === "qr" ? await getQrAdminData(qrFilters) : null;
  const adminUsersData = activeSection === "admins" ? await getAdminUsersData() : null;
  const paymentData = activeSection === "payments"
    ? {
        ...(await getAdminSubscriptionPlansData()),
        ...(await getAdminPaymentsData(paymentFilters)),
      }
    : null;
  const productsData = activeSection === "products" ? await getAdminProductsData() : null;
  const ordersData = activeSection === "orders" ? await getAdminOrdersData(orderFilters, selectedOrderId) : null;
  const adsData = activeSection === "ads" ? await getAdminAdsData(adFilters, selectedAdId) : null;
  const missingReportsData = activeSection === "missing" ? await getAdminMissingReportsData(missingFilters) : null;
  const locationSharesData = activeSection === "locations" ? await getAdminLocationSharesData(locationFilters, selectedLocationShareId) : null;
  const inquiriesData = activeSection === "inquiries" ? await getAdminInquiriesData() : null;
  const qrItems = qrData ? await withQrImages(qrData.qrCodes) : [];
  const title =
    activeSection === "dashboard"
      ? "대시보드"
      : activeSection === "subjects"
        ? "관리대상자 관리"
      : activeSection === "qr"
      ? "QR 관리"
      : activeSection === "admins"
        ? "관리자 관리"
        : activeSection === "payments"
          ? "결제 관리"
          : activeSection === "products"
            ? "상품 관리"
            : activeSection === "orders"
              ? "주문/배송 관리"
            : activeSection === "ads"
              ? "광고 관리"
              : activeSection === "missing"
                ? "실종신고 관리"
                : activeSection === "locations"
                  ? "위치공유 관리"
              : activeSection === "inquiries"
                ? "고객문의 관리"
                : "보호자 관리";
  const description =
    activeSection === "dashboard"
      ? "회원, 관리대상, QR, 실종신고, 광고와 월별 매출 현황을 한눈에 확인합니다."
      : activeSection === "subjects"
        ? "전체 관리대상자를 조회하고 보호자 메시지, 음성, QR과 부가정보를 확인합니다."
      : activeSection === "qr"
      ? "사람찾기 URL로 연결되는 QR 코드와 고유 문자열을 생성하고 활성 상태를 관리합니다."
      : activeSection === "admins"
        ? "가입된 보호자 사용자에게 관리자 역할을 부여하거나 회수합니다."
        : activeSection === "payments"
          ? "결제내역을 조회하고 선불 이용권의 기간과 가격을 관리합니다."
          : activeSection === "products"
            ? "사용자 상품 선택 화면에 노출되는 상품 이미지, 가격, 활성 상태를 관리합니다."
            : activeSection === "orders"
              ? "주문과 결제 상태를 조회하고 배송상태, 택배사, 송장번호를 관리합니다."
            : activeSection === "ads"
              ? "광고 일 단가를 설정하고 사용자별 광고 진행사항을 조회합니다."
              : activeSection === "missing"
                ? "실종신고 접수 현황과 광고 상태, 발견 여부를 조회합니다."
                : activeSection === "locations"
                  ? "QR 공개 페이지에서 공유된 발견 위치와 지도 링크를 조회합니다."
              : activeSection === "inquiries"
                ? "접수된 고객문의의 제목, 작성자, 상태와 작성일시를 조회합니다."
                : "보호자 목록을 조회하고 배송지, 등록대상자, 이용권, 결제, 광고와 관리메모를 확인합니다.";

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <AdminWorkspace activeSection={activeSection}>
          <header className="admin-header">
            <div>
              <p className="intro-kicker">관리자</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </header>

          {activeSection === "dashboard" ? (
            <AdminDashboardSection dashboardData={dashboardData} />
          ) : activeSection === "subjects" ? (
            <SubjectManagementSection adminSubjectsData={adminSubjectsData} />
          ) : activeSection === "qr" ? (
            <QrManagementSection qrData={qrData} qrItems={qrItems} />
          ) : activeSection === "admins" ? (
            <AdminRoleManagementSection adminUsersData={adminUsersData} />
          ) : activeSection === "payments" ? (
            <PaymentManagementSection paymentData={paymentData} />
          ) : activeSection === "products" ? (
            <ProductManagementSection productsData={productsData} />
          ) : activeSection === "orders" ? (
            <OrderManagementSection ordersData={ordersData} />
          ) : activeSection === "ads" ? (
            <AdManagementSection adsData={adsData} />
          ) : activeSection === "missing" ? (
            <MissingReportManagementSection missingReportsData={missingReportsData} />
          ) : activeSection === "locations" ? (
            <LocationShareManagementSection locationSharesData={locationSharesData} />
          ) : activeSection === "inquiries" ? (
            <InquiryManagementSection inquiriesData={inquiriesData} />
          ) : (
            <GuardianManagementSection adminData={adminData} />
          )}
        </AdminWorkspace>
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function AdminDashboardSection({ dashboardData }) {
  const qrRatio = safePercent(dashboardData.activeQrCount, dashboardData.totalSubjects);
  const inactiveQrRatio = safePercent(dashboardData.inactiveQrCount, dashboardData.totalSubjects);
  const monthlyDeltaRate = safePercent(dashboardData.monthlyRevenue - dashboardData.previousMonthRevenue, dashboardData.previousMonthRevenue);

  return (
    <section className="admin-dashboard-section" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard-heading">
        <div>
          <h2 id="admin-dashboard-title">현황</h2>
          <p>{formatDashboardMonth(dashboardData.month)} 기준</p>
        </div>
        <form action="/admin" className="admin-dashboard-month-form">
          <input type="hidden" name="section" value="dashboard" />
          <label>
            <span>조회 월</span>
            <input type="month" name="month" defaultValue={dashboardData.month} />
          </label>
          <button type="submit">조회</button>
        </form>
      </div>

      <div className="admin-overview-grid">
        <DashboardSummaryCard
          icon="people"
          rows={[
            { label: "전체 보호자", value: formatCountWithUnit(dashboardData.totalGuardians, "명") },
            { label: "전체 대상자", value: formatCountWithUnit(dashboardData.totalSubjects, "명") },
          ]}
        />
        <DashboardSummaryCard
          icon="person"
          rows={[
            {
              label: "신규 보호자",
              value: formatCountWithUnit(dashboardData.newGuardiansToday, "명"),
              note: formatDeltaText(dashboardData.newGuardiansToday, dashboardData.newGuardiansYesterday, "명"),
            },
            {
              label: "신규 대상자",
              value: formatCountWithUnit(dashboardData.newSubjectsToday, "명"),
              note: formatDeltaText(dashboardData.newSubjectsToday, dashboardData.newSubjectsYesterday, "명"),
            },
          ]}
        />
        <DashboardSummaryCard
          icon="qr"
          rows={[
            {
              label: "활성 QR",
              value: formatCountWithUnit(dashboardData.activeQrCount, "개"),
              note: `(전체 대상자 ${qrRatio.toFixed(1)}%)`,
            },
            {
              label: "미활성 QR",
              value: formatCountWithUnit(dashboardData.inactiveQrCount, "개"),
              note: `(전체 대상자 ${inactiveQrRatio.toFixed(1)}%)`,
            },
          ]}
        />
        <DashboardSummaryCard
          icon="megaphone"
          rows={[
            {
              label: "광고 진행중",
              value: formatCountWithUnit(dashboardData.activeAdCount, "건"),
              note: formatDeltaText(dashboardData.activeAdCount, dashboardData.adStatus.paused, "건", "정지 대비"),
            },
            { label: "광고 심사반려", value: formatCountWithUnit(dashboardData.adRejectedCount, "건") },
          ]}
        />
        <DashboardSummaryCard
          icon="money"
          rows={[
            {
              label: "일 매출",
              value: formatCurrency(dashboardData.todayRevenue),
              note: formatDeltaText(dashboardData.todayRevenue, dashboardData.yesterdayRevenue, "원"),
            },
            {
              label: "월 매출",
              value: formatCurrency(dashboardData.monthlyRevenue),
              note: `(전월 대비 ${monthlyDeltaRate >= 0 ? "+" : ""}${monthlyDeltaRate.toFixed(1)}%)`,
            },
          ]}
        />
      </div>

      <DashboardTrendChart data={dashboardData.dailyTrend} />

      <div className="admin-recent-heading">
        <h2>최근 현황</h2>
        <span>운영 확인이 필요한 최신 데이터</span>
      </div>
      <div className="dashboard-recent-tables">
        <DashboardMiniTable
          title="신규 가입자"
          columns={["보호자명", "연락처", "나이", "가입일"]}
          rows={dashboardData.recentGuardians.map((item) => [
            item.name || item.login_id || item.email || item.google_email || "이름 미입력",
            item.phone || "-",
            calculateAgeLabel(item.birth_date),
            formatRecentDate(item.created_at),
          ])}
          emptyText="최근 가입자가 없습니다."
        />
        <DashboardMiniTable
          title="신규 주문"
          wide
          columns={["주문번호", "대상자명(보호자명)", "상품명(옵션)", "결제금액", "주문일시"]}
          rows={dashboardData.recentOrders.map((item) => [
            formatOrderNumber(item),
            `${item.subject_name || "대상자 미선택"}(${item.guardian_name || "보호자 미입력"})`,
            item.product_name || "상품 미확인",
            formatCurrency(item.amount),
            formatRecentDateTime(item.created_at),
          ])}
          emptyText="최근 주문이 없습니다."
        />
        <DashboardMiniTable
          title="최근 활동 알림"
          columns={["구분", "내용", "발생일시"]}
          rows={dashboardData.recentNotifications.map((item) => [
            item.title || "알림",
            item.body || item.guardian_name || "-",
            formatRecentDateTime(item.created_at),
          ])}
          emptyText="최근 알림이 없습니다."
        />
        <DashboardMiniTable
          title="주의 대상 현황"
          compact
          columns={["구분", "건수"]}
          rows={[
            ["QR 미활성화 (10일 초과)", formatMetricValue(dashboardData.risks.qrPendingOver10)],
            ["상품 발송대기중 (2일 이상)", formatMetricValue(dashboardData.risks.shippingWaitingOver2)],
            ["구독 만료 예정일 (7일 이내)", formatMetricValue(dashboardData.risks.subscriptionExpiring7)],
            ["광고 심사 지연 (1시간 이상)", formatMetricValue(dashboardData.risks.adReviewOver1)],
            ["취소/환불 대기 (24시간 이상)", formatMetricValue(dashboardData.risks.refundWaitingOver1)],
          ]}
        />
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-operations-card dashboard-order-card">
          <h2>주문 현황</h2>
          <OrderStatusFlow status={dashboardData.orderStatus} />
          <DashboardMiniTable
            title="최근 실종 광고"
            columns={["대상자", "보호자", "캠페인", "현재 상태", "광고 진행", "비고"]}
            rows={dashboardData.recentMissingAds.map((item) => [
              `${item.subject_name || "관리대상 미입력"}${item.subject_birth_date ? `(${formatAgeFromBirthDate(item.subject_birth_date)})` : ""}`,
              `${item.guardian_name || "보호자 미입력"}${item.guardian_phone ? `(${item.guardian_phone})` : ""}`,
              formatRecentDateTime(item.created_at),
              item.status === "active" ? "진행중" : adStatusLabel(item.status),
              item.status === "active" ? "광고 진행" : adStatusLabel(item.status),
              item.click_count ? `클릭 ${formatMetricValue(item.click_count)}회` : "-",
            ])}
            emptyText="최근 광고가 없습니다."
          />
        </section>
        <DashboardDonutPanel
          title="광고 진행 현황"
          centerLabel="진행중"
          centerValue={`${formatMetricValue(dashboardData.adStatus.active)}건`}
          items={[
            { label: "진행중", value: dashboardData.adStatus.active, color: "#f4b657" },
            { label: "승인대기", value: dashboardData.adStatus.ready, color: "#8b76e8" },
            { label: "정지중", value: dashboardData.adStatus.paused, color: "#e35b5b" },
            { label: "만료", value: dashboardData.adStatus.ended, color: "#aab2bd" },
            { label: "심사반려", value: dashboardData.adStatus.rejected, color: "#222222" },
          ]}
        />
        <DashboardDonutPanel
          title="구독 현황"
          centerLabel="구독중"
          centerValue={formatCountWithUnit(dashboardData.subscriptionStatus.active, "건")}
          items={[
            { label: "구독중", value: dashboardData.subscriptionStatus.active, color: "#f4b657" },
            { label: "활성대기", value: dashboardData.subscriptionStatus.ready, color: "#8b76e8" },
            { label: "일시정지", value: dashboardData.subscriptionStatus.paused, color: "#3d7df2" },
            { label: "만료", value: dashboardData.subscriptionStatus.expired, color: "#aab2bd" },
            { label: "취소", value: dashboardData.subscriptionStatus.cancelled, color: "#e35b5b" },
          ]}
        />
        <section className="dashboard-operations-card dashboard-sales-card">
          <h2>매출 현황</h2>
          <table>
            <caption>매출 요약</caption>
            <tbody>
              <tr><th>총 매출</th><td>{formatCurrency(dashboardData.monthlyRevenue)}</td></tr>
              <tr><th>상품 매출</th><td>{formatCurrency(dashboardData.productRevenue)}</td></tr>
              <tr><th>구독 매출</th><td>{formatCurrency(dashboardData.subscriptionRevenue)}</td></tr>
              <tr><th>광고 매출</th><td>{formatCurrency(dashboardData.advertisingRevenue)}</td></tr>
              <tr><th>환불 금액</th><td className="negative">{formatCurrency(-dashboardData.refundAmount)}</td></tr>
              <tr><th>실 매출</th><td className="positive">{formatCurrency(dashboardData.netRevenue)}</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}

function DashboardSummaryCard({ icon, rows }) {
  return (
    <article className="dashboard-summary-card">
      <DashboardIcon name={icon} />
      <div className="dashboard-summary-values">
        {rows.map((row) => (
          <div key={row.label}>
            <h3>{row.label}</h3>
            <strong>{row.value}</strong>
            {row.note && <span>{row.note}</span>}
          </div>
        ))}
      </div>
    </article>
  );
}

function DashboardTrendChart({ data }) {
  const chartWidth = 940;
  const chartHeight = 190;
  const paddingX = 34;
  const paddingY = 20;
  const maxRevenue = Math.max(1, ...data.map((item) => Number(item.revenue || 0)));
  const maxOrders = Math.max(1, ...data.map((item) => Number(item.orders || 0)));
  const maxActivity = Math.max(1, ...data.map((item) => Number(item.activity || 0)));
  const series = [
    { label: "매출", color: "#4d7df3", points: trendPoints(data, "revenue", maxRevenue, chartWidth, chartHeight, paddingX, paddingY) },
    { label: "주문", color: "#8b76e8", points: trendPoints(data, "orders", maxOrders, chartWidth, chartHeight, paddingX, paddingY) },
    { label: "위치공유", color: "#f3b45b", points: trendPoints(data, "activity", maxActivity, chartWidth, chartHeight, paddingX, paddingY) },
  ];

  return (
    <section className="dashboard-trend-panel" aria-label="최근 30일 운영 추이">
      <div className="dashboard-trend-legend">
        {series.map((item) => (
          <span key={item.label}><i style={{ backgroundColor: item.color }} />{item.label}</span>
        ))}
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="최근 30일 매출, 주문, 위치공유 추이">
        {[0, 1, 2, 3, 4].map((line) => {
          const y = paddingY + ((chartHeight - paddingY * 2) / 4) * line;
          return <line className="dashboard-chart-gridline" x1={paddingX} x2={chartWidth - paddingX} y1={y} y2={y} key={line} />;
        })}
        {series.map((item) => (
          <polyline fill="none" stroke={item.color} strokeWidth="3" points={item.points} key={item.label} />
        ))}
        {data.map((item, index) => {
          if (index % 7 !== 0 && index !== data.length - 1) return null;
          const x = paddingX + ((chartWidth - paddingX * 2) / Math.max(1, data.length - 1)) * index;
          return (
            <text className="dashboard-chart-label" x={x} y={chartHeight - 2} textAnchor="middle" key={item.day}>
              {item.day.slice(5).replace("-", ".")}
            </text>
          );
        })}
      </svg>
      <aside className="dashboard-chart-note">
        <strong>그래프 (최근 30일)</strong>
        <span>일별 매출 현황: 선 그래프</span>
        <span>일별 주문 현황: 선 그래프</span>
        <span>일별 위치공유/광고 활동: 선 그래프</span>
      </aside>
    </section>
  );
}

function DashboardMiniTable({ title, columns, rows, emptyText = "표시할 데이터가 없습니다.", wide = false, compact = false }) {
  const emptyRows = Math.max(0, 4 - rows.length);
  return (
    <section className={`dashboard-table-panel${wide ? " is-wide" : ""}${compact ? " is-compact" : ""}`}>
      <h3>{title}</h3>
      <div className="dashboard-table-wrap">
        <table>
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>)}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length}>{emptyText}</td></tr>
            )}
            {rows.length > 0 && Array.from({ length: emptyRows }, (_, index) => (
              <tr className="dashboard-empty-row" key={`${title}-empty-${index}`}>
                {columns.map((column) => <td key={`${column}-${index}`}>&nbsp;</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderStatusFlow({ status }) {
  const steps = [
    { label: "신규주문", value: status.newOrders },
    { label: "배송준비", value: status.preparing },
    { label: "배송중", value: status.shipped },
    { label: "배송완료", value: status.delivered },
  ];

  return (
    <div className="dashboard-order-flow" aria-label="주문 상태 흐름">
      {steps.map((step, index) => (
        <div className="dashboard-order-step" key={step.label}>
          <strong>{step.label}</strong>
          <span>{formatCountWithUnit(step.value, "건")}</span>
          {index < steps.length - 1 && <b aria-hidden="true">›</b>}
        </div>
      ))}
    </div>
  );
}

function DashboardDonutPanel({ title, centerLabel, centerValue, items }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return (
    <section className="dashboard-operations-card dashboard-donut-card">
      <h2>{title}</h2>
      <div className="dashboard-donut" style={{ "--donut": buildDonutGradient(items) }}>
        <div>
          <span>{centerLabel}</span>
          <strong>{centerValue}</strong>
        </div>
      </div>
      <div className="dashboard-donut-legend">
        {items.map((item) => (
          <span key={item.label}>
            <i style={{ backgroundColor: item.color }} />
            {item.label} {formatMetricValue(item.value)}
            {total > 0 ? ` (${safePercent(item.value, total).toFixed(0)}%)` : ""}
          </span>
        ))}
      </div>
    </section>
  );
}

function DashboardIcon({ name }) {
  return (
    <svg className="dashboard-card-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {dashboardIconPath(name)}
    </svg>
  );
}

function dashboardIconPath(name) {
  switch (name) {
    case "people":
      return (
        <>
          <circle cx="24" cy="22" r="8" />
          <circle cx="42" cy="24" r="7" />
          <circle cx="12" cy="27" r="6" />
          <path d="M10 50c1.8-10 7-15 15.5-15S39 40 41 50z" />
          <path d="M35 50c.9-7 4.8-11 11-11 5.3 0 9.2 3.5 10.3 11z" />
          <path d="M4 50c.7-5.5 3.8-9 8.8-9 3.2 0 5.8 1.5 7.3 4" />
        </>
      );
    case "person":
      return (
        <>
          <circle cx="32" cy="21" r="11" />
          <path d="M12 52c2.7-12.3 9.4-18.5 20-18.5S49.3 39.7 52 52z" />
        </>
      );
    case "qr":
      return (
        <>
          <path d="M10 10h14v14H10z" />
          <path d="M40 10h14v14H40z" />
          <path d="M10 40h14v14H10z" />
          <path d="M33 33h7v7h-7z" />
          <path d="M47 33h7v7h-7z" />
          <path d="M33 47h7v7h-7z" />
          <path d="M47 47h7v7h-7z" />
        </>
      );
    case "megaphone":
      return (
        <>
          <path d="M9 37h10l30 13V14L19 27H9z" />
          <path d="M19 38 24 57" />
          <path d="M53 23c3 2.4 4.5 5.4 4.5 9s-1.5 6.6-4.5 9" />
        </>
      );
    case "money":
    default:
      return (
        <>
          <path d="M20 17 14 27v21c0 7 7 10 18 10s18-3 18-10V27l-6-10z" />
          <path d="M22 17c4 3 16 3 20 0" />
          <path d="M32 29v18" />
          <path d="M25 35c1.2-3.4 4-5 7-5 4 0 7 2 7 5.5 0 7-14 4-14 10 0 3 3 5 7 5 3.6 0 6.2-1.4 7.6-4.2" />
        </>
      );
  }
}

function MissingReportManagementSection({ missingReportsData }) {
  const { reports, filters } = missingReportsData;

  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>실종신고 목록</h2>
        <div className="admin-heading-actions">
          <span>{reports.length}건 조회</span>
          <AdminExportButton filename="zezari-missing-reports.csv" rows={missingReportExportRows(reports)} />
        </div>
      </div>

      <form className="admin-master-filter missing-report-filter" action="/admin">
        <input type="hidden" name="section" value="missing" />
        <label>
          통합 검색
          <input
            name="missingQuery"
            defaultValue={filters.query}
            placeholder="대상자, 보호자, 연락처, 이메일"
          />
        </label>
        <label>
          신고 시작일
          <input type="date" name="missingStart" defaultValue={filters.startDate} />
        </label>
        <label>
          신고 종료일
          <input type="date" name="missingEnd" defaultValue={filters.endDate} />
        </label>
        <button type="submit">조회</button>
        <Link className="plain-button" href="/admin?section=missing">초기화</Link>
      </form>

      <div className="admin-record-table-wrap">
        <div className="admin-record-table missing-report-table" role="table" aria-label="실종신고 목록">
          <div className="admin-record-header" role="row">
            <span role="columnheader">신고일시</span>
            <span role="columnheader">대상자</span>
            <span role="columnheader">보호자</span>
            <span role="columnheader">신고상태</span>
            <span role="columnheader">광고상태</span>
            <span role="columnheader">발견여부</span>
          </div>
          {reports.map((report) => (
            <div className="admin-record-row" role="row" key={`${report.subject_id}-${report.ad_id || "no-ad"}`}>
              <time role="cell">{formatRecentDateTime(report.reported_at)}</time>
              <Link role="cell" href={`/admin?section=subjects&subject=${encodeURIComponent(report.subject_id)}`}>
                {report.subject_name || "관리대상 미입력"}
              </Link>
              <Link role="cell" href={`/admin?section=guardians&guardian=${encodeURIComponent(report.guardian_id)}`}>
                {report.guardian_name || report.guardian_email || report.guardian_google_email || "보호자 미입력"}
              </Link>
              <em role="cell" className={`status-badge ${missingReportStatusClass(report)}`}>
                {missingReportStatusLabel(report)}
              </em>
              <em role="cell" className={`ad-status-pill ${report.ad_status || "none"}`}>
                {report.ad_status ? adStatusLabel(report.ad_status) : "미진행"}
              </em>
              <em role="cell" className={`status-badge ${missingFoundClass(report)}`}>
                {missingFoundLabel(report)}
              </em>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="empty-text">조건에 맞는 실종신고 이력이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function LocationShareManagementSection({ locationSharesData }) {
  const { shares, selectedShare, filters } = locationSharesData;

  return (
    <div className="admin-master-detail admin-location-master-detail">
      <section className="admin-panel admin-master-panel">
        <div className="panel-heading">
          <h2>위치공유 목록</h2>
          <div className="admin-heading-actions">
            <span>{shares.length}건 조회</span>
            <AdminExportButton filename="zezari-location-shares.csv" rows={locationShareExportRows(shares)} />
          </div>
        </div>

        <form className="admin-master-filter location-share-filter" action="/admin">
          <input type="hidden" name="section" value="locations" />
          <label>
            통합 검색
            <input
              name="locationQuery"
              defaultValue={filters.query}
              placeholder="대상자명, 보호자명, 연락처, 주소"
            />
          </label>
          <label>
            공유 시작일
            <input type="date" name="locationStart" defaultValue={filters.startDate} />
          </label>
          <label>
            공유 종료일
            <input type="date" name="locationEnd" defaultValue={filters.endDate} />
          </label>
          <button type="submit">조회</button>
          <Link className="plain-button" href="/admin?section=locations">초기화</Link>
        </form>

        <div className="admin-record-table-wrap">
          <div className="admin-record-table location-share-table" role="table" aria-label="위치공유 목록">
            <div className="admin-record-header" role="row">
              <span role="columnheader">공유일시</span>
              <span role="columnheader">대상자</span>
              <span role="columnheader">보호자</span>
              <span role="columnheader">발견자 연락처</span>
              <span role="columnheader">주소</span>
              <span role="columnheader">위도</span>
              <span role="columnheader">경도</span>
            </div>
            {shares.map((share) => (
              <Link
                className={share.id === selectedShare?.id ? "admin-record-row active" : "admin-record-row"}
                href={buildLocationShareUrl(filters, share.id)}
                key={share.id}
                role="row"
              >
                <time role="cell">{formatRecentDateTime(share.created_at)}</time>
                <span role="cell">{share.subject_display_name || "관리대상 미입력"}</span>
                <span role="cell">{share.guardian_display_name || "보호자 미입력"}</span>
                <span role="cell">{share.finder_contact || "미입력"}</span>
                <span role="cell">{share.address_label || "지도 링크 확인"}</span>
                <span role="cell">{formatCoordinate(share.latitude)}</span>
                <span role="cell">{formatCoordinate(share.longitude)}</span>
              </Link>
            ))}
            {shares.length === 0 && <p className="empty-text">공유된 위치 이력이 없습니다.</p>}
          </div>
        </div>
      </section>

      <aside className="admin-panel admin-detail-panel location-share-detail-panel">
        {selectedShare ? (
          <>
            <div className="admin-detail-heading">
              <div>
                <span className="admin-detail-kicker">위치 상세 보기</span>
                <h2>{selectedShare.subject_display_name || "관리대상 미입력"}</h2>
                <p>{formatRecentDateTime(selectedShare.created_at)}</p>
              </div>
            </div>

            <div className="location-map-preview" aria-hidden="true">
              <span className="location-map-pin" />
            </div>

            <section className="admin-detail-section">
              <h3>위치 정보</h3>
              <dl className="admin-detail-list">
                <div><dt>주소/설명</dt><dd>{selectedShare.address_label || "지도 링크 확인"}</dd></div>
                <div><dt>위도</dt><dd>{formatCoordinate(selectedShare.latitude)}</dd></div>
                <div><dt>경도</dt><dd>{formatCoordinate(selectedShare.longitude)}</dd></div>
                <div><dt>정확도</dt><dd>{selectedShare.accuracy ? `약 ${Math.round(Number(selectedShare.accuracy))}m` : "-"}</dd></div>
              </dl>
              <div className="location-map-links">
                {selectedShare.kakao_map_url && (
                  <a className="admin-detail-link" href={selectedShare.kakao_map_url} target="_blank" rel="noreferrer">
                    카카오 지도 열기
                  </a>
                )}
                {selectedShare.naver_map_url && (
                  <a className="admin-detail-link" href={selectedShare.naver_map_url} target="_blank" rel="noreferrer">
                    네이버 지도 열기
                  </a>
                )}
              </div>
            </section>

            <section className="admin-detail-section">
              <h3>연결 정보</h3>
              <dl className="admin-detail-list">
                <div><dt>대상자</dt><dd><Link href={`/admin?section=subjects&subject=${encodeURIComponent(selectedShare.subject_id)}`}>{selectedShare.subject_display_name || "대상자 보기"}</Link></dd></div>
                <div><dt>보호자</dt><dd><Link href={`/admin?section=guardians&guardian=${encodeURIComponent(selectedShare.guardian_id)}`}>{selectedShare.guardian_display_name || "보호자 보기"}</Link></dd></div>
                <div><dt>안심번호</dt><dd>{selectedShare.guardian_safe_phone || "-"}</dd></div>
                <div><dt>발견자 연락처</dt><dd>{selectedShare.finder_contact || "미입력"}</dd></div>
              </dl>
            </section>
          </>
        ) : (
          <p className="empty-text">위치공유 이력을 선택해 주세요.</p>
        )}
      </aside>
    </div>
  );
}

function InquiryManagementSection({ inquiriesData }) {
  const { inquiries } = inquiriesData;

  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>고객문의 목록</h2>
        <div className="admin-heading-actions">
          <span>최근 최대 100건</span>
          <AdminExportButton filename="zezari-inquiries.csv" rows={inquiryExportRows(inquiries)} />
        </div>
      </div>
      <div className="admin-inquiry-list">
        {inquiries.map((inquiry) => (
          <article className="admin-inquiry-card" key={inquiry.id}>
            <div>
              <strong>{inquiry.title || "제목 없음"}</strong>
              <span>{inquiry.guardian_name || "작성자 미확인"}</span>
            </div>
            <div>
              <em className={`inquiry-status status-${inquiry.status || "received"}`}>
                {inquiryStatusLabel(inquiry.status)}
              </em>
              <time>{formatDateTime(inquiry.created_at)}</time>
            </div>
          </article>
        ))}
        {inquiries.length === 0 && (
          <p className="empty-text">아직 접수된 고객문의가 없습니다. 사용자 문의 접수 기능을 추가하면 이 화면에 표시됩니다.</p>
        )}
      </div>
    </section>
  );
}

function OrderManagementSection({ ordersData }) {
  const { orders, selectedOrder, summary, filters } = ordersData;
  const selectedPaid = selectedOrder ? isPaidOrder(selectedOrder.status) : false;
  const selectedFulfillment = selectedOrder
    ? selectedOrder.fulfillment_status || (selectedPaid ? "preparing" : "pending")
    : "pending";
  const returnTo = buildOrderListUrl(filters, selectedOrder?.id);

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel order-summary-panel">
        <div className="panel-heading">
          <h2>주문 현황</h2>
          <span>최근 최대 200건</span>
        </div>
        <div className="admin-order-summary" aria-label="주문 상태 요약">
          <span><strong>{Number(summary.total || 0)}</strong>전체 주문</span>
          <span><strong>{Number(summary.paid || 0)}</strong>결제 완료</span>
          <span><strong>{Number(summary.preparing || 0)}</strong>배송 준비</span>
          <span><strong>{Number(summary.shipped || 0)}</strong>배송 중</span>
          <span><strong>{Number(summary.delivered || 0)}</strong>배송 완료</span>
        </div>
      </section>

      <div className="admin-master-detail admin-order-master-detail">
        <section className="admin-panel admin-master-panel">
          <div className="panel-heading">
            <h2>주문 목록</h2>
            <div className="admin-heading-actions">
              <span>{orders.length}건 조회</span>
              <AdminExportButton filename="zezari-orders.csv" rows={orderExportRows(orders)} />
            </div>
          </div>

          <form className="admin-order-filter order-master-filter" action="/admin">
            <input type="hidden" name="section" value="orders" />
            <label>
              통합 검색
              <input
                name="orderQuery"
                defaultValue={filters.query}
                placeholder="주문번호, 보호자, 대상자, 상품, 송장번호"
              />
            </label>
            <label>
              결제 상태
              <select name="payment" defaultValue={filters.payment}>
                <option value="all">전체</option>
                <option value="paid">결제 완료</option>
                <option value="pending">결제 대기</option>
                <option value="failed">결제 실패/취소</option>
              </select>
            </label>
            <label>
              배송 상태
              <select name="fulfillment" defaultValue={filters.fulfillment}>
                <option value="all">전체</option>
                <option value="pending">결제 확인 전</option>
                <option value="preparing">배송 준비</option>
                <option value="shipped">배송 중</option>
                <option value="delivered">배송 완료</option>
                <option value="cancelled">배송 취소</option>
              </select>
            </label>
            <div className="admin-order-filter-actions">
              <button type="submit">조회</button>
              <Link className="plain-button" href="/admin?section=orders">초기화</Link>
            </div>
          </form>

          <div className="admin-record-table-wrap">
            <div className="admin-record-table order-record-table" role="table" aria-label="주문 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">주문번호</span>
                <span role="columnheader">주문자/대상자</span>
                <span role="columnheader">상품</span>
                <span role="columnheader">결제금액</span>
                <span role="columnheader">결제</span>
                <span role="columnheader">배송</span>
                <span role="columnheader">주문일</span>
              </div>
              {orders.map((order) => {
                const paid = isPaidOrder(order.status);
                const fulfillment = order.fulfillment_status || (paid ? "preparing" : "pending");
                return (
                  <Link
                    className={`admin-record-row ${selectedOrder?.id === order.id ? "active" : ""}`}
                    href={buildOrderListUrl(filters, order.id)}
                    key={order.id}
                    role="row"
                  >
                    <strong role="cell">{formatOrderNumber(order)}</strong>
                    <span className="order-record-party" role="cell">
                      <strong>{order.guardian_name || "이름 미입력"}</strong>
                      <small>{order.subject_name || "대상자 미선택"}</small>
                    </span>
                    <span role="cell">{order.product_name || "상품 미확인"}</span>
                    <span role="cell">{formatCurrency(order.amount)}</span>
                    <em className={`order-state ${paymentStateClass(order.status)}`} role="cell">
                      {paymentStatusLabel(order.status)}
                    </em>
                    <em className={`order-state fulfillment-${fulfillment}`} role="cell">
                      {fulfillmentStatusLabel(fulfillment)}
                    </em>
                    <time role="cell">{formatDate(order.created_at)}</time>
                  </Link>
                );
              })}
              {orders.length === 0 && <p className="empty-text">조건에 맞는 주문이 없습니다.</p>}
            </div>
          </div>
        </section>

        <aside className="admin-panel admin-detail-panel order-detail-panel">
          {selectedOrder ? (
            <>
              <div className="admin-detail-heading">
                <div>
                  <span>주문 상세 정보</span>
                  <h2>{formatOrderNumber(selectedOrder)}</h2>
                  <time>{formatDateTime(selectedOrder.created_at)}</time>
                </div>
                <div className="order-detail-badges">
                  <em className={`order-state ${paymentStateClass(selectedOrder.status)}`}>
                    {paymentStatusLabel(selectedOrder.status)}
                  </em>
                  <em className={`order-state fulfillment-${selectedFulfillment}`}>
                    {fulfillmentStatusLabel(selectedFulfillment)}
                  </em>
                </div>
              </div>

              <section className="admin-detail-section">
                <h3>주문 상품</h3>
                <dl className="admin-detail-list">
                  <div><dt>상품</dt><dd>{selectedOrder.product_name || "상품 미확인"} / {selectedOrder.quantity || 1}개</dd></div>
                  <div><dt>대상자</dt><dd>{selectedOrder.subject_name || "미선택"}</dd></div>
                  <div><dt>구매유형</dt><dd>{selectedOrder.order_type === "standalone" ? "상품 단독 구매" : `${selectedOrder.plan_months || "-"}개월 이용권`}</dd></div>
                  <div><dt>결제금액</dt><dd>{formatCurrency(selectedOrder.amount)}</dd></div>
                  <div><dt>결제수단</dt><dd>{selectedOrder.payment_method || "-"}</dd></div>
                  <div><dt>결제일</dt><dd>{formatDateTime(selectedOrder.paid_at)}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>수령인 및 배송지</h3>
                <dl className="admin-detail-list">
                  <div><dt>보호자</dt><dd>{selectedOrder.guardian_name || "이름 미입력"}</dd></div>
                  <div><dt>연락처</dt><dd>{selectedOrder.guardian_phone || "전화번호 미입력"}</dd></div>
                  <div><dt>이메일</dt><dd>{selectedOrder.guardian_email || selectedOrder.guardian_google_email || "-"}</dd></div>
                  <div><dt>수령인</dt><dd>{selectedOrder.display_recipient_name || "이름 미입력"}</dd></div>
                  <div><dt>수령 연락처</dt><dd>{selectedOrder.display_recipient_phone || "전화번호 미입력"}</dd></div>
                  <div><dt>배송지</dt><dd>{formatFullAddress(selectedOrder.shipping_address, selectedOrder.shipping_address_detail)}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section order-fulfillment-section">
                <h3>배송 정보 입력</h3>
                <form className="order-detail-form" action={setProductOrderFulfillmentAction}>
                  <input type="hidden" name="orderId" value={selectedOrder.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <label>
                    배송상태
                    <select name="fulfillmentStatus" defaultValue={selectedFulfillment}>
                      {!selectedPaid && <option value="pending">결제 확인 전</option>}
                      {selectedPaid && <option value="preparing">배송 준비</option>}
                      {selectedPaid && <option value="shipped">배송 중</option>}
                      {selectedPaid && <option value="delivered">배송 완료</option>}
                      <option value="cancelled">배송 취소</option>
                    </select>
                  </label>
                  <label>
                    택배사
                    <select name="carrier" defaultValue={selectedOrder.carrier || ""}>
                      <option value="">택배사 선택</option>
                      <option value="CJ대한통운">CJ대한통운</option>
                      <option value="한진택배">한진택배</option>
                      <option value="롯데택배">롯데택배</option>
                      <option value="로젠택배">로젠택배</option>
                      <option value="우체국택배">우체국택배</option>
                      <option value="기타">기타</option>
                    </select>
                  </label>
                  <label>
                    송장번호
                    <input name="trackingNumber" defaultValue={selectedOrder.tracking_number || ""} placeholder="송장번호 입력" />
                  </label>
                  <label>
                    관리자 메모
                    <textarea name="adminMemo" defaultValue={selectedOrder.admin_memo || ""} placeholder="포장, 출고, 고객 요청 등 내부 메모" />
                  </label>
                  <div className="admin-shipping-meta">
                    <span>발송 {formatDateTime(selectedOrder.shipped_at)}</span>
                    <span>완료 {formatDateTime(selectedOrder.delivered_at)}</span>
                  </div>
                  {!selectedPaid && <p className="order-payment-warning">결제 완료 전에는 배송준비·배송중·배송완료로 변경할 수 없습니다.</p>}
                  <FormSubmitButton pendingText="저장중">배송정보 저장</FormSubmitButton>
                </form>
              </section>
            </>
          ) : (
            <p className="empty-text">조회된 주문이 없습니다. 검색 조건을 변경해 주세요.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function AdManagementSection({ adsData }) {
  const { setting, ads, selectedAd, filters } = adsData;
  const activeCount = ads.filter((ad) => ad.status === "active").length;
  const pausedCount = ads.filter((ad) => ad.status === "paused").length;
  const endedCount = ads.filter((ad) => ad.status === "ended").length;
  const selectedAdReturnTo = buildAdListUrl(filters, selectedAd?.id);

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel qr-create-panel">
        <div>
          <div className="panel-heading">
            <h2>광고 일 단가</h2>
            <span>{formatCurrency(setting.daily_rate)}</span>
          </div>
          <p className="empty-text">사용자가 선택한 광고기간 일수에 이 단가를 곱해 예상 금액을 산정합니다.</p>
        </div>
        <form className="ad-rate-form" action={setAdDailyRateAction}>
          <input type="hidden" name="returnTo" value="/admin?section=ads" />
          <label>
            일 단가
            <input name="dailyRate" type="number" min="0" step="100" defaultValue={setting.daily_rate} />
          </label>
          <FormSubmitButton pendingText="저장중">
            저장
          </FormSubmitButton>
        </form>
        <div className="qr-stats" aria-label="광고 상태 요약">
          <span>전체 {ads.length}건</span>
          <span>광고중 {activeCount}건</span>
          <span>정지중 {pausedCount}건</span>
          <span>만료 {endedCount}건</span>
        </div>
      </section>

      <div className="admin-master-detail admin-ad-master-detail">
        <section className="admin-panel admin-master-panel">
          <div className="panel-heading">
            <h2>광고 목록</h2>
            <div className="admin-heading-actions">
              <span>{ads.length}건 조회</span>
              <AdminExportButton filename="zezari-ads.csv" rows={adExportRows(ads)} />
            </div>
          </div>

          <form className="admin-master-filter ad-master-filter" action="/admin">
            <input type="hidden" name="section" value="ads" />
            <label>
              통합 검색
              <input
                name="adQuery"
                defaultValue={filters.query}
                placeholder="광고번호, 관리대상, 보호자, 연락처"
              />
            </label>
            <label>
              진행 상태
              <select name="adStatus" defaultValue={filters.status}>
                <option value="all">전체</option>
                <option value="ready">승인대기</option>
                <option value="active">광고중</option>
                <option value="paused">정지중</option>
                <option value="ended">만료</option>
              </select>
            </label>
            <button type="submit">조회</button>
            <Link className="plain-button" href="/admin?section=ads">초기화</Link>
          </form>

          <div className="admin-ad-toolbar" aria-label="광고 관리 작업">
            <AdStatusActionButton
              ad={selectedAd}
              command="approve"
              returnTo={selectedAdReturnTo}
              disabled={!selectedAd || !["ready", "active", "paused"].includes(selectedAd.status)}
            >
              광고승인
            </AdStatusActionButton>
            <AdStatusActionButton
              ad={selectedAd}
              command="pause"
              returnTo={selectedAdReturnTo}
              disabled={!selectedAd || !["ready", "active"].includes(selectedAd.status)}
            >
              광고정지
            </AdStatusActionButton>
            <AdStatusActionButton
              ad={selectedAd}
              command="resume"
              returnTo={selectedAdReturnTo}
              disabled={!selectedAd || selectedAd.status !== "paused"}
            >
              광고재개
            </AdStatusActionButton>
            <Link
              className={`plain-button admin-ad-detail-button${selectedAd ? "" : " disabled"}`}
              href={selectedAd ? `${selectedAdReturnTo}#admin-ad-detail` : "/admin?section=ads"}
              aria-disabled={!selectedAd}
            >
              광고상세정보
            </Link>
          </div>

          <div className="admin-record-table-wrap">
            <div className="admin-record-table ad-record-table" role="table" aria-label="광고 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">광고 번호</span>
                <span role="columnheader">관리대상</span>
                <span role="columnheader">보호자</span>
                <span role="columnheader">상태</span>
                <span role="columnheader">광고지역</span>
                <span role="columnheader">광고기간</span>
                <span role="columnheader">광고비</span>
                <span role="columnheader">클릭수</span>
              </div>
              {ads.map((ad) => (
                <Link
                  className={ad.id === selectedAd?.id ? "admin-record-row active" : "admin-record-row"}
                  href={buildAdListUrl(filters, ad.id)}
                  key={ad.id}
                  role="row"
                >
                  <strong role="cell">{formatAdNumber(ad)}</strong>
                  <span role="cell">{ad.subject_name || "관리대상 미입력"}</span>
                  <span role="cell">{ad.guardian_name || ad.guardian_email || ad.guardian_google_email || "보호자 미입력"}</span>
                  <em role="cell" className={`ad-status-pill ${ad.status}`}>{adStatusLabel(ad.status)}</em>
                  <span role="cell">{ad.region || "지역 미입력"}</span>
                  <time role="cell">{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</time>
                  <span role="cell">{formatCurrency(ad.amount)}</span>
                  <span role="cell">{formatMetricValue(ad.click_count)}</span>
                </Link>
              ))}
              {ads.length === 0 && <p className="empty-text">등록된 광고 진행사항이 없습니다.</p>}
            </div>
          </div>
        </section>

        <aside className="admin-panel admin-detail-panel admin-ad-detail-panel" id="admin-ad-detail">
          {selectedAd ? (
            <>
              <div className="admin-detail-heading">
                <div>
                  <span className="admin-detail-kicker">{formatAdNumber(selectedAd)}</span>
                  <h2>{selectedAd.subject_name || "관리대상 미입력"}</h2>
                  <p>{selectedAd.guardian_name || selectedAd.guardian_email || selectedAd.guardian_google_email || "보호자 미입력"}</p>
                </div>
                <em className={`ad-status-pill ${selectedAd.status}`}>{adStatusLabel(selectedAd.status)}</em>
              </div>

              <section className="admin-detail-section">
                <h3>광고 상세정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>광고지역</dt><dd>{selectedAd.region || "-"}</dd></div>
                  <div><dt>광고기간</dt><dd>{formatDate(selectedAd.start_date)} ~ {formatDate(selectedAd.end_date)}</dd></div>
                  <div><dt>집행일수</dt><dd>{Number(selectedAd.days || 0).toLocaleString("ko-KR")}일</dd></div>
                  <div><dt>광고비</dt><dd>{formatCurrency(selectedAd.amount)}</dd></div>
                  <div><dt>일 단가</dt><dd>{formatCurrency(selectedAd.daily_rate)}</dd></div>
                  <div><dt>클릭수</dt><dd>{formatMetricValue(selectedAd.click_count)}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>연결 정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>관리대상</dt><dd><Link href={`/admin?section=subjects&subject=${encodeURIComponent(selectedAd.subject_id)}`}>{selectedAd.subject_name || "대상자 보기"}</Link></dd></div>
                  <div><dt>대상자 상태</dt><dd>{statusLabel(selectedAd.subject_status)}</dd></div>
                  <div><dt>보호자</dt><dd><Link href={`/admin?section=guardians&guardian=${encodeURIComponent(selectedAd.guardian_id)}`}>{selectedAd.guardian_name || "보호자 보기"}</Link></dd></div>
                  <div><dt>보호자 연락처</dt><dd>{selectedAd.guardian_phone || "-"}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>Meta 연동 준비 정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>캠페인 ID</dt><dd>{selectedAd.meta_campaign_id || "미연동"}</dd></div>
                  <div><dt>Meta 상태</dt><dd>{selectedAd.meta_status || "연동 대기"}</dd></div>
                  <div><dt>등록일시</dt><dd>{formatRecentDateTime(selectedAd.created_at)}</dd></div>
                  <div><dt>수정일시</dt><dd>{formatRecentDateTime(selectedAd.updated_at)}</dd></div>
                </dl>
              </section>
            </>
          ) : (
            <p className="empty-text">광고를 선택해 주세요.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function AdStatusActionButton({ ad, command, returnTo, disabled, children }) {
  return (
    <form action={setAdminSubjectAdStatusAction}>
      <input type="hidden" name="adId" value={ad?.id || ""} />
      <input type="hidden" name="command" value={command} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormSubmitButton className="primary-button compact" pendingText="처리중" disabled={disabled}>
        {children}
      </FormSubmitButton>
    </form>
  );
}

function PaymentManagementSection({ paymentData }) {
  const { plans, payments, filters } = paymentData;

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>결제내역</h2>
          <div className="admin-heading-actions">
            <span>최근 최대 300건 / {payments.length}건 조회</span>
            <AdminExportButton filename="zezari-payments.csv" rows={paymentExportRows(payments)} />
          </div>
        </div>

        <form className="admin-master-filter payment-ledger-filter" action="/admin">
          <input type="hidden" name="section" value="payments" />
          <label>
            통합 검색
            <input
              name="paymentLedgerQuery"
              defaultValue={filters.query}
              placeholder="결제번호, 보호자, 대상자, 구분, 결제수단"
            />
          </label>
          <label>
            구분
            <select name="paymentLedgerType" defaultValue={filters.type}>
              <option value="all">전체</option>
              <option value="subscription">이용권</option>
              <option value="product">상품</option>
              <option value="ad">광고</option>
            </select>
          </label>
          <button type="submit">조회</button>
          <Link className="plain-button" href="/admin?section=payments">초기화</Link>
        </form>

        <div className="admin-record-table-wrap">
          <div className="admin-record-table payment-record-table" role="table" aria-label="결제내역">
            <div className="admin-record-header" role="row">
              <span role="columnheader">결제번호</span>
              <span role="columnheader">보호자</span>
              <span role="columnheader">대상자</span>
              <span role="columnheader">구분</span>
              <span role="columnheader">결제수단</span>
              <span role="columnheader">결제금액</span>
              <span role="columnheader">결제일</span>
            </div>
            {payments.map((payment) => (
              <div className="admin-record-row" role="row" key={`${payment.payment_kind}-${payment.id}`}>
                <strong role="cell">{formatPaymentNumber(payment)}</strong>
                <span role="cell">{payment.guardian_name || "보호자 미입력"}</span>
                <span role="cell">{payment.subject_name || "대상자 미선택"}</span>
                <span role="cell">{paymentKindLabel(payment)}</span>
                <span role="cell">{payment.payment_method || "-"}</span>
                <span role="cell">{formatCurrency(payment.amount)}</span>
                <time role="cell">{formatRecentDateTime(payment.payment_date)}</time>
              </div>
            ))}
            {payments.length === 0 && <p className="empty-text">조건에 맞는 결제내역이 없습니다.</p>}
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>이용권 옵션 가격</h2>
          <span>{plans.length}개</span>
        </div>
        <div className="payment-plan-grid">
          {plans.map((plan) => (
            <article className="payment-plan-card" key={plan.months}>
              <div>
                <strong>{plan.name}</strong>
                <span>{plan.months}개월 옵션</span>
              </div>
              <form action={setSubscriptionPlanPriceAction} className="payment-plan-form">
                <input type="hidden" name="months" value={plan.months} />
                <input type="hidden" name="returnTo" value="/admin?section=payments" />
                <label>
                  가격
                  <input name="amount" type="number" min="0" step="100" defaultValue={plan.amount} />
                </label>
                <FormSubmitButton pendingText="저장중">
                  저장
                </FormSubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductManagementSection({ productsData }) {
  const { products } = productsData;

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>상품 이미지 및 가격</h2>
          <div className="admin-heading-actions">
            <span>{products.length}개</span>
            <AdminExportButton filename="zezari-products.csv" rows={productExportRows(products)} />
          </div>
        </div>
        <p className="empty-text">업로드한 상품 이미지는 사용자 상품 선택 화면에 노출됩니다. 이미지는 1MB 이하만 저장됩니다.</p>
        <div className="product-admin-grid">
          {products.map((product) => (
            <article className="product-admin-card" key={product.id}>
              <div className="product-admin-preview">
                {product.image_data_url ? (
                  <img src={product.image_data_url} alt={`${product.name} 상품 이미지`} />
                ) : (
                  <span aria-hidden="true">{productFallbackIcon(product.slug)}</span>
                )}
              </div>
              <form action={setProductCatalogItemAction} className="product-admin-form">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="returnTo" value="/admin?section=products" />
                <input type="hidden" name="existingImage" value={product.image_data_url || ""} />
                <input type="hidden" name="existingImageName" value={product.image_name || ""} />
                <label>
                  상품명
                  <input name="name" defaultValue={product.name || ""} required />
                </label>
                <label>
                  설명
                  <input name="description" defaultValue={product.description || ""} placeholder="상품 설명" />
                </label>
                <label>
                  단독 구매 가격
                  <input name="unitPrice" type="number" min="0" step="100" defaultValue={product.unit_price || 0} />
                </label>
                <label>
                  정렬
                  <input name="sortOrder" type="number" step="1" defaultValue={product.sort_order || 0} />
                </label>
                <label>
                  상품 이미지
                  <input name="image" type="file" accept="image/*" />
                </label>
                <div className="product-admin-options">
                  <label>
                    <input name="isActive" type="checkbox" value="1" defaultChecked={product.is_active !== 0} />
                    <span>사용자 화면에 노출</span>
                  </label>
                  <label>
                    <input name="removeImage" type="checkbox" value="1" />
                    <span>이미지 삭제</span>
                  </label>
                </div>
                <FormSubmitButton pendingText="저장중">
                  상품 저장
                </FormSubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminRoleManagementSection({ adminUsersData }) {
  const { users, adminCount } = adminUsersData;
  const accessCount = users.filter((user) => user.is_admin || isBaseAdminUser(user)).length;

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel qr-create-panel">
        <div>
          <div className="panel-heading">
            <h2>관리자 역할</h2>
            <span>{accessCount}명</span>
          </div>
          <p className="empty-text">
            가입된 보호자 중에서 관리자 페이지에 접근할 사용자를 선택합니다. 기본 관리자는 환경변수로
            보호됩니다.
          </p>
        </div>
        <div className="qr-stats" aria-label="관리자 권한 요약">
          <span>DB 관리자 {adminCount}명</span>
          <span>전체 사용자 {users.length}명</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>가입된 사용자</h2>
          <div className="admin-heading-actions">
            <span>{users.length}명</span>
            <AdminExportButton filename="zezari-admin-users.csv" rows={adminUserExportRows(users)} />
          </div>
        </div>
        <div className="admin-user-grid">
          {users.map((user) => {
            const baseAdmin = isBaseAdminUser(user);
            const dbAdmin = Number(user.is_admin || 0) === 1;
            const hasAccess = baseAdmin || dbAdmin;

            return (
              <article className="admin-user-card" key={user.id}>
                <div>
                  <strong>{user.name || "이름 미입력"}</strong>
                  <span>{user.email || user.google_email || "-"}</span>
                  <span>{user.phone || "전화번호 미입력"}</span>
                </div>
                <div className="admin-role-badges">
                  <em className={hasAccess ? "status-badge safe" : "status-badge neutral"}>
                    {hasAccess ? "관리자" : "일반 보호자"}
                  </em>
                  {baseAdmin && <em className="status-badge qr-needed">기본관리자</em>}
                  {!user.is_active && <em className="status-badge searching">비활성 사용자</em>}
                  <em className="status-badge neutral">{user.subject_count || 0}/4명</em>
                </div>
                <form action={setGuardianAdminAction}>
                  <input type="hidden" name="guardianId" value={user.id} />
                  <input type="hidden" name="admin" value={dbAdmin ? "0" : "1"} />
                  <input type="hidden" name="returnTo" value="/admin?section=admins" />
                  <FormSubmitButton
                    className={dbAdmin ? "danger-button compact" : "activate-button"}
                    disabled={baseAdmin}
                    pendingText={dbAdmin ? "회수중" : "부여중"}
                  >
                    {baseAdmin ? "기본관리자 유지" : dbAdmin ? "관리자 회수" : "관리자 부여"}
                  </FormSubmitButton>
                </form>
              </article>
            );
          })}
          {users.length === 0 && <p className="empty-text">가입된 사용자가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function GuardianManagementSection({ adminData }) {
  const { guardians, selectedGuardian, subjects, subscription, payments, ads, filters } = adminData;
  const returnTo = buildGuardianAdminUrl(filters, selectedGuardian?.id);

  return (
    <div className="admin-master-detail">
      <section className="admin-panel admin-master-panel">
        <div className="panel-heading">
          <h2>보호자 목록</h2>
          <div className="admin-heading-actions">
            <span>최대 200명 / {guardians.length}명 조회</span>
            <AdminExportButton filename="zezari-guardians.csv" rows={guardianExportRows(guardians)} />
          </div>
        </div>
        <form action="/admin" className="admin-master-filter">
          <input type="hidden" name="section" value="guardians" />
          <label>
            통합 검색
            <input name="guardianAdminQuery" defaultValue={filters.query} placeholder="회원번호, 이름, 연락처, 이메일" />
          </label>
          <label>
            회원 상태
            <select name="guardianStatus" defaultValue={filters.status}>
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </label>
          <button type="submit">검색</button>
          <Link className="plain-button" href="/admin?section=guardians">초기화</Link>
        </form>
        <div className="admin-record-table-wrap">
          <div className="admin-record-table guardian-record-table" role="table" aria-label="보호자 목록">
            <div className="admin-record-header" role="row">
              <span role="columnheader">회원번호</span>
              <span role="columnheader">이름</span>
              <span role="columnheader">연락처</span>
              <span role="columnheader">이메일</span>
              <span role="columnheader">가입일</span>
              <span role="columnheader">상태</span>
            </div>
          {guardians.map((guardian) => (
            <Link
                className={guardian.id === selectedGuardian?.id ? "admin-record-row active" : "admin-record-row"}
                href={buildGuardianAdminUrl(filters, guardian.id)}
              key={guardian.id}
                role="row"
            >
                <span role="cell">{formatMemberNumber(guardian.id)}</span>
                <strong role="cell">{guardian.name || "이름 미입력"}</strong>
                <span role="cell">{guardian.phone || "-"}</span>
                <span role="cell">{guardian.email || guardian.google_email || "-"}</span>
                <time role="cell">{formatDateOnlyValue(guardian.created_at)}</time>
                <em role="cell" className={guardian.is_active ? "active-state" : "inactive-state"}>
                  {guardian.is_active ? "활성" : "비활성"}
                </em>
            </Link>
          ))}
          </div>
        </div>
        {guardians.length === 0 && <p className="empty-text">조건에 맞는 보호자가 없습니다.</p>}
      </section>

      <section className="admin-panel admin-detail-panel">
        {selectedGuardian ? (
          <>
            <div className="admin-detail-heading">
              <div>
                <span className="admin-detail-kicker">{formatMemberNumber(selectedGuardian.id)}</span>
                <h2>{selectedGuardian.name || "이름 미입력"}</h2>
                <p>{selectedGuardian.phone || "전화번호 미입력"}</p>
                <p>{selectedGuardian.email || selectedGuardian.google_email || "이메일 미입력"}</p>
              </div>
              <form action={setGuardianActiveAction}>
                <input type="hidden" name="guardianId" value={selectedGuardian.id} />
                <input type="hidden" name="active" value={selectedGuardian.is_active ? "0" : "1"} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <FormSubmitButton
                  className={selectedGuardian.is_active ? "danger-button compact" : "activate-button"}
                  pendingText={selectedGuardian.is_active ? "비활성화중" : "활성화중"}
                >
                  {selectedGuardian.is_active ? "비활성화" : "활성화"}
                </FormSubmitButton>
              </form>
            </div>

            <section className="admin-detail-section">
              <h3>배송지</h3>
              <p>{formatFullAddress(selectedGuardian.address, selectedGuardian.address_detail)}</p>
            </section>

            <section className="admin-detail-section">
              <h3>등록대상자</h3>
              <Link className="admin-detail-link" href={`/admin?section=subjects&guardianId=${encodeURIComponent(selectedGuardian.id)}`}>
                등록 대상자 {subjects.length}명 보기
              </Link>
              {subjects.length > 0 && (
                <p>{subjects.map((subject) => subject.name).join(", ")}</p>
              )}
            </section>

            <section className="admin-detail-section">
              <h3>이용권 현황</h3>
              <dl className="admin-detail-list">
                <div><dt>상태</dt><dd>{subscriptionStatusLabel(subscription?.status)}</dd></div>
                <div><dt>상품</dt><dd>{subscription?.plan_name || "이용권 정보 없음"}</dd></div>
                <div><dt>기간</dt><dd>{subscription ? `${Number(subscription.plan_months || 1)}개월` : "-"}</dd></div>
                <div><dt>이용기간</dt><dd>{subscription?.current_period_start ? `${formatDateOnlyValue(subscription.current_period_start)} ~ ${formatDateOnlyValue(subscription.current_period_end)}` : "-"}</dd></div>
              </dl>
            </section>

            <section className="admin-detail-section">
              <h3>결제내역</h3>
              <div className="admin-detail-history">
                {payments.map((payment) => (
                  <div key={payment.id}>
                    <strong>{formatOrderNumber(payment)}</strong>
                    <span>{payment.product_name || orderTypeLabel(payment.order_type)} / {formatCurrency(payment.amount)}</span>
                    <time>{formatRecentDateTime(payment.paid_at || payment.created_at)}</time>
                  </div>
                ))}
                {payments.length === 0 && <p>결제내역이 없습니다.</p>}
              </div>
            </section>

            <section className="admin-detail-section">
              <h3>광고 내역</h3>
              <div className="admin-detail-history">
                {ads.map((ad) => (
                  <div key={ad.id}>
                    <strong>{ad.subject_name || "관리대상 미입력"}</strong>
                    <span>{ad.region} / {adStatusLabel(ad.status)} / {formatCurrency(ad.amount)}</span>
                    <time>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</time>
                  </div>
                ))}
                {ads.length === 0 && <p>광고 내역이 없습니다.</p>}
              </div>
            </section>

            <section className="admin-detail-section">
              <h3>관리메모</h3>
              <form action={setGuardianAdminMemoAction} className="admin-memo-form">
                <input type="hidden" name="guardianId" value={selectedGuardian.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <textarea name="adminMemo" maxLength="2000" defaultValue={selectedGuardian.admin_memo || ""} placeholder="상담, 배송, 운영 관련 내부 메모를 입력하세요." />
                <FormSubmitButton pendingText="저장중">메모 저장</FormSubmitButton>
              </form>
            </section>
          </>
        ) : (
          <p className="empty-text">보호자를 선택해 주세요.</p>
        )}
      </section>
    </div>
  );
}

function SubjectManagementSection({ adminSubjectsData }) {
  const { subjects, selectedSubject, filters } = adminSubjectsData;

  return (
    <div className="admin-master-detail">
      <section className="admin-panel admin-master-panel">
        <div className="panel-heading">
          <h2>관리대상자 목록</h2>
          <div className="admin-heading-actions">
            <span>최대 300명 / {subjects.length}명 조회</span>
            <AdminExportButton filename="zezari-subjects.csv" rows={subjectExportRows(subjects)} />
          </div>
        </div>
        <form action="/admin" className="admin-master-filter subject-master-filter">
          <input type="hidden" name="section" value="subjects" />
          {filters.guardianId && <input type="hidden" name="guardianId" value={filters.guardianId} />}
          <label>
            통합 검색
            <input name="subjectAdminQuery" defaultValue={filters.query} placeholder="관리대상 이름, 보호자 이름" />
          </label>
          <label>
            현재 상태
            <select name="subjectStatus" defaultValue={filters.status}>
              <option value="all">전체 상태</option>
              <option value="상품구매필요">상품구매필요</option>
              <option value="QR활성화필요">QR활성화필요</option>
              <option value="안전">안전</option>
              <option value="찾는중">찾는중</option>
            </select>
          </label>
          <label>
            QR 상태
            <select name="subjectQr" defaultValue={filters.qr}>
              <option value="all">전체 QR</option>
              <option value="active">활성</option>
              <option value="pending">활성화 대기</option>
              <option value="inactive">비활성</option>
              <option value="unassigned">미매칭</option>
            </select>
          </label>
          <button type="submit">검색</button>
          <Link className="plain-button" href="/admin?section=subjects">초기화</Link>
        </form>
        {filters.guardianId && (
          <div className="admin-active-filter">
            특정 보호자의 관리대상만 조회 중입니다.
            <Link href="/admin?section=subjects">전체 보기</Link>
          </div>
        )}
        <div className="admin-record-table-wrap">
          <div className="admin-record-table subject-record-table" role="table" aria-label="관리대상자 목록">
            <div className="admin-record-header" role="row">
              <span role="columnheader">관리대상 이름</span>
              <span role="columnheader">성별</span>
              <span role="columnheader">생년월일</span>
              <span role="columnheader">보호자</span>
              <span role="columnheader">상태</span>
              <span role="columnheader">QR 상태</span>
            </div>
            {subjects.map((subject) => (
              <Link
                className={subject.id === selectedSubject?.id ? "admin-record-row active" : "admin-record-row"}
                href={buildSubjectAdminUrl(filters, subject.id)}
                key={subject.id}
                role="row"
              >
                <strong role="cell">{subject.name || "이름 미입력"}</strong>
                <span role="cell">{subject.gender || "-"}</span>
                <span role="cell">{formatDate(subject.birth_date)}</span>
                <span role="cell">{subject.guardian_name || "보호자 미입력"}</span>
                <em role="cell" className={`status-badge ${statusClass(subject.status)}`}>{statusLabel(subject.status)}</em>
                <em role="cell" className={`qr-admin-state ${qrAdminStateClass(subject)}`}>{qrAdminStateLabel(subject)}</em>
              </Link>
            ))}
          </div>
        </div>
        {subjects.length === 0 && <p className="empty-text">조건에 맞는 관리대상자가 없습니다.</p>}
      </section>

      <section className="admin-panel admin-detail-panel subject-detail-panel">
        {selectedSubject ? (
          <>
            <div className="admin-detail-heading subject-detail-heading">
              <div className="admin-detail-photo">
                {selectedSubject.photo_url ? <img src={selectedSubject.photo_url} alt={`${selectedSubject.name} 사진`} /> : <span aria-hidden="true" />}
              </div>
              <div>
                <span className="admin-detail-kicker">관리대상 상세정보</span>
                <h2>{selectedSubject.name || "이름 미입력"}</h2>
                <p>{selectedSubject.gender || "성별 미입력"} / {formatDate(selectedSubject.birth_date)}</p>
                <p>보호자: {selectedSubject.guardian_name || "미입력"}</p>
              </div>
            </div>

            <section className="admin-detail-section">
              <h3>기본정보</h3>
              <dl className="admin-detail-list">
                <div><dt>이름</dt><dd>{selectedSubject.name || "-"}</dd></div>
                <div><dt>성별</dt><dd>{selectedSubject.gender || "-"}</dd></div>
                <div><dt>생년월일</dt><dd>{formatDate(selectedSubject.birth_date)}</dd></div>
                <div><dt>현재 상태</dt><dd>{statusLabel(selectedSubject.status)}</dd></div>
                <div><dt>보호자</dt><dd><Link href={`/admin?section=guardians&guardian=${encodeURIComponent(selectedSubject.guardian_id)}`}>{selectedSubject.guardian_name || "보호자 보기"}</Link></dd></div>
                <div><dt>보호자 연락처</dt><dd>{selectedSubject.guardian_phone || "-"}</dd></div>
              </dl>
            </section>

            <section className="admin-detail-section">
              <h3>보호자 메시지</h3>
              <p className="admin-message-content">{selectedSubject.guardian_message || "입력된 보호자 메시지가 없습니다."}</p>
            </section>

            <section className="admin-detail-section">
              <h3>보호자 음성</h3>
              {selectedSubject.voice_data_url ? (
                <audio className="admin-voice-player" controls preload="none" src={selectedSubject.voice_data_url}>
                  브라우저에서 음성을 재생할 수 없습니다.
                </audio>
              ) : (
                <p>저장된 보호자 음성이 없습니다.</p>
              )}
              {selectedSubject.voice_name && <span className="admin-detail-caption">{selectedSubject.voice_name}</span>}
            </section>

            <section className="admin-detail-section">
              <h3>부가정보</h3>
              <dl className="admin-detail-list">
                <div><dt>사진 파일</dt><dd>{selectedSubject.photo_name || "없음"}</dd></div>
                <div><dt>QR 상태</dt><dd>{qrAdminStateLabel(selectedSubject)}</dd></div>
                <div><dt>QR 코드</dt><dd>{selectedSubject.qr_code || "미매칭"}</dd></div>
                <div><dt>등록일시</dt><dd>{formatRecentDateTime(selectedSubject.created_at)}</dd></div>
                <div><dt>수정일시</dt><dd>{formatRecentDateTime(selectedSubject.updated_at)}</dd></div>
              </dl>
              {selectedSubject.qr_target_url && (
                <a className="admin-detail-link" href={selectedSubject.qr_target_url} target="_blank" rel="noreferrer">QR 공개 페이지 열기</a>
              )}
            </section>
          </>
        ) : (
          <p className="empty-text">관리대상자를 선택해 주세요.</p>
        )}
      </section>
    </div>
  );
}

function QrManagementSection({ qrData, qrItems }) {
  const selectedQr = qrData.selectedQr;
  const selectedQrImage = selectedQr
    ? qrItems.find((item) => item.id === selectedQr.id)?.image || ""
    : "";

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel qr-create-panel">
        <div>
          <div className="panel-heading">
            <h2>QR 생성</h2>
            <span>{qrData.total}개</span>
          </div>
          <p className="empty-text">
            새 QR은 중복되지 않는 고유 문자열을 만들고 `/find/고유문자열` URL로 연결됩니다.
          </p>
        </div>
        <form className="qr-create-form" action={generateQrCodesAction}>
          <label htmlFor="qr-count">추가 개수</label>
          <input id="qr-count" type="number" name="count" min="1" max="200" defaultValue="10" />
          <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
          <FormSubmitButton pendingText="생성중">
            생성
          </FormSubmitButton>
        </form>
        <div className="qr-stats" aria-label="QR 상태 요약">
          <span>활성 {qrData.activeCount}개</span>
          <span>비활성 {qrData.inactiveCount}개</span>
          <span>매칭 {qrData.matchedCount}개</span>
          <span>미매칭 {qrData.unmatchedCount}개</span>
        </div>
      </section>

      <section className="admin-panel qr-filter-panel">
        <form className="qr-filter-form" action="/admin">
          <input type="hidden" name="section" value="qr" />
          <label>
            매칭상태
            <select name="match" defaultValue={qrData.filters.match}>
              <option value="all">전체</option>
              <option value="matched">관리대상 매칭됨</option>
              <option value="unmatched">관리대상 미매칭</option>
            </select>
          </label>
          <label>
            활성상태
            <select name="active" defaultValue={qrData.filters.active}>
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </label>
          <FormSubmitButton pendingText="조회중">
            필터 적용
          </FormSubmitButton>
          <Link className="admin-link" href="/admin?section=qr">
            초기화
          </Link>
        </form>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>생성된 QR</h2>
          <div className="admin-heading-actions">
            <span>{qrData.filteredCount}/{qrData.total}개</span>
            <AdminExportButton filename="zezari-qr-codes.csv" rows={qrExportRows(qrItems)} />
          </div>
        </div>
        <div className="qr-grid">
          {qrItems.map((qr) => (
            <article className="qr-card" key={qr.id}>
              <div className="qr-image-wrap">
                <a href={qr.image} download={`${qr.code}.png`} title={`${qr.code} QR 이미지 다운로드`}>
                  <img src={qr.image} alt={`${qr.code} QR 코드`} />
                </a>
              </div>
              <div className="qr-card-body">
                <div>
                  <strong>{qr.code}</strong>
                  <span>{qr.public_key}</span>
                  <span>보호자: {qr.guardian_name || "미배정"}</span>
                  <span>관리대상: {qr.subject_name || "미배정"}</span>
                </div>
                <a href={qr.target_url} target="_blank" rel="noreferrer">
                  {qr.target_url}
                </a>
                <div className="qr-card-footer">
                  <em className={qr.is_active ? "active-state" : "inactive-state"}>
                    {qr.is_active ? "활성" : "비활성"}
                  </em>
                  <div className="qr-card-actions">
                    {!qr.subject_id && (
                      <Link className="activate-button" href={buildQrAssignUrl(qrData, qr.id)}>
                        매칭대상 조회
                      </Link>
                    )}
                    {qr.subject_id && (
                      <form action={setQrSubjectAction}>
                        <input type="hidden" name="qrId" value={qr.id} />
                        <input type="hidden" name="subjectId" value="" />
                        <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
                        <FormSubmitButton className="danger-button compact" pendingText="해제중">
                          매칭 해제
                        </FormSubmitButton>
                      </form>
                    )}
                    <form action={setQrActiveAction}>
                      <input type="hidden" name="qrId" value={qr.id} />
                      <input type="hidden" name="active" value={qr.is_active ? "0" : "1"} />
                      <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
                      <FormSubmitButton
                        className={qr.is_active ? "danger-button compact" : "activate-button"}
                        pendingText={qr.is_active ? "비활성화중" : "활성화중"}
                      >
                        {qr.is_active ? "비활성화" : "활성화"}
                      </FormSubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {qrItems.length === 0 && <p className="empty-text">생성된 QR 코드가 없습니다.</p>}
        </div>
      </section>

      {selectedQr && !selectedQr.subject_id && (
        <section className="modal-backdrop qr-modal-backdrop" aria-label="QR 매칭 대상 조회" role="dialog" aria-modal="true">
          <ModalScrollLock />
          <div className="modal-surface qr-modal" data-modal-surface>
            <div className="qr-modal-header">
              <div>
                <p className="intro-kicker">QR 매칭</p>
                <h2>매칭대상 조회</h2>
                <p>{selectedQr.code}에 연결할 미매칭 관리대상을 선택합니다.</p>
              </div>
            </div>

            <div className="qr-modal-summary">
              {selectedQrImage && <img src={selectedQrImage} alt={`${selectedQr.code} QR 코드`} />}
              <div>
                <strong>{selectedQr.code}</strong>
                <span>{selectedQr.public_key}</span>
              </div>
            </div>

            <form action="/admin" className="qr-modal-search-form">
              <input type="hidden" name="section" value="qr" />
              <input type="hidden" name="match" value={qrData.filters.match} />
              <input type="hidden" name="active" value={qrData.filters.active} />
              <input type="hidden" name="assignQr" value={selectedQr.id} />
              <label>
                보호자
                <input
                  name="guardianQuery"
                  defaultValue={qrData.matchSearch.guardianQuery}
                  placeholder="보호자 이름 또는 이메일"
                />
              </label>
              <label>
                관리대상
                <input name="subjectQuery" defaultValue={qrData.matchSearch.subjectQuery} placeholder="관리대상 이름" />
              </label>
              <FormSubmitButton pendingText="조회중">
                조회
              </FormSubmitButton>
            </form>

            <div className="qr-modal-results">
              {qrData.matchCandidates.map((subject) => (
                <form action={setQrSubjectAction} className="qr-modal-result" key={subject.id}>
                  <input type="hidden" name="qrId" value={selectedQr.id} />
                  <input type="hidden" name="subjectId" value={subject.id} />
                  <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
                  <div>
                    <strong>{subject.name}</strong>
                    <span>
                      {subject.guardian_name ||
                        subject.guardian_email ||
                        subject.guardian_google_email ||
                        "보호자 미입력"}
                    </span>
                    <span>{formatDate(subject.birth_date)}</span>
                  </div>
                  <FormSubmitButton className="activate-button" pendingText="매칭중">
                    선택 매칭
                  </FormSubmitButton>
                </form>
              ))}
              {qrData.matchCandidates.length === 0 && (
                <p className="empty-text">조회된 미매칭 관리대상이 없습니다. 기존 매칭을 해제하면 다시 조회됩니다.</p>
              )}
            </div>
            <div className="modal-footer">
              <Link className="plain-button modal-close-button" href="/admin?section=qr">
                닫기
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function buildQrAssignUrl(qrData, qrId) {
  const params = new URLSearchParams({
    section: "qr",
    match: qrData.filters.match,
    active: qrData.filters.active,
    assignQr: qrId,
  });
  return `/admin?${params.toString()}`;
}

function buildQrListUrl(qrData) {
  const params = new URLSearchParams({
    section: "qr",
    match: qrData.filters.match,
    active: qrData.filters.active,
  });
  return `/admin?${params.toString()}`;
}

async function withQrImages(qrCodes) {
  return Promise.all(
    qrCodes.map(async (qr) => ({
      ...qr,
      image: await QRCode.toDataURL(qr.target_url, {
        margin: 1,
        width: 144,
        color: {
          dark: "#1f2d3d",
          light: "#ffffff",
        },
      }),
    }))
  );
}

function paymentExportRows(payments = []) {
  return payments.map((payment) => ({
    결제번호: formatPaymentNumber(payment),
    보호자: payment.guardian_name || "보호자 미입력",
    대상자: payment.subject_name || "대상자 미선택",
    구분: paymentKindLabel(payment),
    결제수단: payment.payment_method || "-",
    결제금액: formatCurrency(payment.amount),
    결제일: formatRecentDateTime(payment.payment_date),
  }));
}

function guardianExportRows(guardians = []) {
  return guardians.map((guardian) => ({
    회원번호: formatMemberNumber(guardian.id),
    이름: guardian.name || "이름 미입력",
    연락처: guardian.phone || "-",
    이메일: guardian.email || guardian.google_email || "-",
    가입일: formatDateOnlyValue(guardian.created_at),
    상태: guardian.is_active ? "활성" : "비활성",
    등록대상자수: Number(guardian.subject_count || 0),
  }));
}

function subjectExportRows(subjects = []) {
  return subjects.map((subject) => ({
    관리대상명: subject.name || "이름 미입력",
    성별: subject.gender || "-",
    생년월일: formatDate(subject.birth_date),
    보호자: subject.guardian_name || "보호자 미입력",
    상태: statusLabel(subject.status),
    "QR 상태": qrAdminStateLabel(subject),
    "QR 코드": subject.qr_code || "미매칭",
    등록일: formatRecentDateTime(subject.created_at),
  }));
}

function orderExportRows(orders = []) {
  return orders.map((order) => ({
    주문번호: formatOrderNumber(order),
    보호자: order.guardian_name || "이름 미입력",
    대상자: order.subject_name || "대상자 미선택",
    상품: order.product_name || "상품 미확인",
    구매유형: order.order_type === "standalone" ? "상품 단독 구매" : `${order.plan_months || "-"}개월 이용권`,
    결제금액: formatCurrency(order.amount),
    결제상태: paymentStatusLabel(order.status),
    배송상태: fulfillmentStatusLabel(order.fulfillment_status || (isPaidOrder(order.status) ? "preparing" : "pending")),
    택배사: order.carrier || "-",
    송장번호: order.tracking_number || "-",
    주문일: formatRecentDateTime(order.created_at),
    결제일: formatRecentDateTime(order.paid_at),
    배송지: formatFullAddress(order.shipping_address, order.shipping_address_detail),
    관리자메모: order.admin_memo || "",
  }));
}

function adExportRows(ads = []) {
  return ads.map((ad) => ({
    광고번호: formatAdNumber(ad),
    관리대상: ad.subject_name || "관리대상 미입력",
    보호자: ad.guardian_name || ad.guardian_email || ad.guardian_google_email || "보호자 미입력",
    상태: adStatusLabel(ad.status),
    광고지역: ad.region || "지역 미입력",
    광고기간: `${formatDate(ad.start_date)} ~ ${formatDate(ad.end_date)}`,
    광고비: formatCurrency(ad.amount),
    클릭수: formatMetricValue(ad.click_count),
    등록일: formatRecentDateTime(ad.created_at),
  }));
}

function missingReportExportRows(reports = []) {
  return reports.map((report) => ({
    신고일시: formatRecentDateTime(report.reported_at),
    대상자: report.subject_name || "관리대상 미입력",
    보호자: report.guardian_name || report.guardian_email || report.guardian_google_email || "보호자 미입력",
    신고상태: missingReportStatusLabel(report),
    광고상태: report.ad_status ? adStatusLabel(report.ad_status) : "미진행",
    발견여부: missingFoundLabel(report),
  }));
}

function locationShareExportRows(shares = []) {
  return shares.map((share) => ({
    공유일시: formatRecentDateTime(share.created_at),
    대상자: share.subject_display_name || "관리대상 미입력",
    보호자: share.guardian_display_name || "보호자 미입력",
    발견자연락처: share.finder_contact || "미입력",
    주소: share.address_label || "지도 링크 확인",
    위도: formatCoordinate(share.latitude),
    경도: formatCoordinate(share.longitude),
    카카오맵: share.kakao_map_url || "",
    네이버지도: share.naver_map_url || "",
  }));
}

function inquiryExportRows(inquiries = []) {
  return inquiries.map((inquiry) => ({
    제목: inquiry.title || "제목 없음",
    작성자: inquiry.guardian_name || "작성자 미확인",
    상태: inquiryStatusLabel(inquiry.status),
    작성일시: formatRecentDateTime(inquiry.created_at),
  }));
}

function productExportRows(products = []) {
  return products.map((product) => ({
    상품명: product.name || "-",
    구분: product.slug || "-",
    설명: product.description || "",
    단독구매가격: formatCurrency(product.unit_price),
    노출상태: product.is_active !== 0 ? "노출" : "숨김",
    정렬순서: Number(product.sort_order || 0),
    이미지파일: product.image_name || "-",
  }));
}

function adminUserExportRows(users = []) {
  return users.map((user) => ({
    회원번호: formatMemberNumber(user.id),
    이름: user.name || "이름 미입력",
    아이디: user.login_id || "-",
    연락처: user.phone || "전화번호 미입력",
    이메일: user.email || user.google_email || "-",
    권한: isBaseAdminUser(user) || Number(user.is_admin || 0) === 1 ? "관리자" : "일반 보호자",
    상태: user.is_active ? "활성" : "비활성",
    등록대상자수: Number(user.subject_count || 0),
    가입일: formatRecentDateTime(user.created_at),
  }));
}

function qrExportRows(qrItems = []) {
  return qrItems.map((qr) => ({
    QR코드: qr.code,
    고유문자열: qr.public_key,
    보호자: qr.guardian_name || "미배정",
    관리대상: qr.subject_name || "미배정",
    매칭상태: qr.subject_id ? "매칭" : "미매칭",
    활성상태: qr.is_active ? "활성" : "비활성",
    공개URL: qr.target_url,
    생성일: formatRecentDateTime(qr.created_at),
  }));
}

function trendPoints(data, key, maxValue, chartWidth, chartHeight, paddingX, paddingY) {
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2 - 14;
  return data
    .map((item, index) => {
      const x = paddingX + (innerWidth / Math.max(1, data.length - 1)) * index;
      const y = paddingY + innerHeight - (Number(item[key] || 0) / Math.max(1, maxValue)) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildDonutGradient(items) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  if (total <= 0) return "#eef1f4 0deg 360deg";

  let cursor = 0;
  return items
    .filter((item) => Number(item.value || 0) > 0)
    .map((item) => {
      const start = cursor;
      cursor += (Number(item.value || 0) / total) * 360;
      return `${item.color} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
    })
    .join(", ");
}

function formatCountWithUnit(value, unit) {
  return `${formatMetricValue(value)}${unit}`;
}

function formatDeltaText(current, previous, unit, label = "전일 대비") {
  const delta = Number(current || 0) - Number(previous || 0);
  return `(${label} ${delta >= 0 ? "+" : ""}${formatMetricValue(delta)}${unit})`;
}

function safePercent(part, total) {
  const denominator = Number(total || 0);
  if (denominator === 0) return 0;
  return (Number(part || 0) / denominator) * 100;
}

function calculateAgeLabel(birthDate) {
  const age = calculateAge(birthDate);
  return age === null ? "-" : `${age}세`;
}

function formatAgeFromBirthDate(birthDate) {
  const age = calculateAge(birthDate);
  return age === null ? "나이 미상" : `${age}세`;
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const date = new Date(String(birthDate));
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return age < 0 ? null : age;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}

function formatRecentDateTime(value) {
  const date = parseDatabaseDate(value);
  if (!date) return "-";
  const parts = getKoreanDateParts(date, {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

function formatRecentDate(value) {
  const date = parseDatabaseDate(value);
  if (!date) return "-";
  const parts = getKoreanDateParts(date, {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${parts.year}.${parts.month}.${parts.day}`;
}

function getKoreanDateParts(date, options) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", options)
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

function parseDatabaseDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMetricValue(value) {
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0));
}

function formatMemberNumber(id) {
  return `U-${String(id || "").replace(/-/g, "").slice(-8).toUpperCase() || "UNKNOWN"}`;
}

function formatDateOnlyValue(value) {
  return formatRecentDate(value);
}

function formatDashboardMonth(month) {
  const [year, monthNumber] = String(month || "").split("-");
  return year && monthNumber ? `${year}년 ${Number(monthNumber)}월` : "이번 달";
}

function inquiryStatusLabel(status) {
  if (status === "answered") return "답변완료";
  if (status === "in_progress") return "처리중";
  return "접수";
}

function subscriptionStatusLabel(status) {
  if (status === "active") return "이용중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "활성화 대기";
  if (status === "cancelled") return "해지";
  if (status === "expired") return "기간 만료";
  return "이용권 정보 없음";
}

function orderTypeLabel(type) {
  return type === "subscription" ? "이용권 주문" : "상품 주문";
}

function qrAdminStateLabel(subject) {
  if (!subject?.qr_id) return "미매칭";
  if (!Number(subject.qr_is_active || 0)) return "비활성";
  if (subject.qr_activated_at) return "활성";
  return "활성화 대기";
}

function qrAdminStateClass(subject) {
  if (!subject?.qr_id) return "unassigned";
  if (!Number(subject.qr_is_active || 0)) return "inactive";
  if (subject.qr_activated_at) return "active";
  return "pending";
}

function formatFullAddress(address, detailAddress) {
  return [address, detailAddress].filter(Boolean).join(" ") || "주소 미입력";
}

function formatOrderNumber(order) {
  return order.toss_order_id || `ORDER-${String(order.id || "").slice(0, 8).toUpperCase()}`;
}

function formatAdNumber(ad) {
  const compactId = String(ad?.id || "").replace(/-/g, "").slice(0, 10).toUpperCase();
  return `AD-${compactId || "UNKNOWN"}`;
}

function formatPaymentNumber(payment) {
  if (payment?.payment_kind === "ad") {
    return `AD-${String(payment.id || payment.payment_number || "").replace(/-/g, "").slice(0, 10).toUpperCase() || "UNKNOWN"}`;
  }
  return payment?.payment_number || `PAY-${String(payment?.id || "").slice(0, 8).toUpperCase() || "UNKNOWN"}`;
}

function paymentKindLabel(payment) {
  const group = payment?.payment_group || (payment?.payment_kind === "ad" ? "광고" : "상품");
  const item = payment?.payment_item || "-";
  return `${group} - ${item}`;
}

function isPaidOrder(status) {
  return ["paid", "paid_waiting_activation", "activated"].includes(status);
}

function paymentStatusLabel(status) {
  if (isPaidOrder(status)) return "결제 완료";
  if (["draft", "payment_pending", "subscription_pending"].includes(status)) return "결제 대기";
  if (status === "failed") return "결제 실패";
  if (status === "cancelled") return "결제 취소";
  return status || "상태 미확인";
}

function paymentStateClass(status) {
  if (isPaidOrder(status)) return "payment-paid";
  if (["failed", "cancelled"].includes(status)) return "payment-failed";
  return "payment-pending";
}

function fulfillmentStatusLabel(status) {
  if (status === "preparing") return "배송 준비";
  if (status === "shipped") return "배송 중";
  if (status === "delivered") return "배송 완료";
  if (status === "cancelled") return "배송 취소";
  return "결제 확인 전";
}

function buildOrderListUrl(filters, orderId = "") {
  const params = new URLSearchParams({ section: "orders" });
  if (filters.query) params.set("orderQuery", filters.query);
  if (filters.payment && filters.payment !== "all") params.set("payment", filters.payment);
  if (filters.fulfillment && filters.fulfillment !== "all") params.set("fulfillment", filters.fulfillment);
  if (orderId) params.set("order", orderId);
  return `/admin?${params.toString()}`;
}

function buildAdListUrl(filters, adId = "") {
  const params = new URLSearchParams({ section: "ads" });
  if (filters?.query) params.set("adQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("adStatus", filters.status);
  if (adId) params.set("ad", adId);
  return `/admin?${params.toString()}`;
}

function buildLocationShareUrl(filters, shareId = "") {
  const params = new URLSearchParams({ section: "locations" });
  if (filters?.query) params.set("locationQuery", filters.query);
  if (filters?.startDate) params.set("locationStart", filters.startDate);
  if (filters?.endDate) params.set("locationEnd", filters.endDate);
  if (shareId) params.set("locationShare", shareId);
  return `/admin?${params.toString()}`;
}

function buildGuardianAdminUrl(filters, guardianId = "") {
  const params = new URLSearchParams({ section: "guardians" });
  if (filters?.query) params.set("guardianAdminQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("guardianStatus", filters.status);
  if (guardianId) params.set("guardian", guardianId);
  return `/admin?${params.toString()}`;
}

function buildSubjectAdminUrl(filters, subjectId = "") {
  const params = new URLSearchParams({ section: "subjects" });
  if (filters?.query) params.set("subjectAdminQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("subjectStatus", filters.status);
  if (filters?.qr && filters.qr !== "all") params.set("subjectQr", filters.qr);
  if (filters?.guardianId) params.set("guardianId", filters.guardianId);
  if (subjectId) params.set("subject", subjectId);
  return `/admin?${params.toString()}`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(6) : "-";
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  return "상품";
}

function statusClass(status) {
  const normalized = statusLabel(status);
  if (normalized === "상품구매필요") return "purchase-needed";
  if (normalized === "찾는중") return "searching";
  if (normalized === "QR활성화필요") return "qr-needed";
  return "safe";
}

function statusLabel(status) {
  if (status === "문제없음") return "안전";
  if (["상품구매필요", "QR활성화필요", "안전", "찾는중"].includes(status)) return status;
  return "상품구매필요";
}

function missingReportStatusLabel(report) {
  const subjectStatus = statusLabel(report?.subject_status);
  const adStatus = String(report?.ad_status || "");
  if (subjectStatus === "찾는중") {
    if (adStatus === "active") return "광고 진행 중";
    if (adStatus === "paused") return "광고 정지 중";
    if (adStatus === "ended") return "종료 처리";
    return "신고 접수";
  }
  if (subjectStatus === "안전" && report?.ad_id) return "발견 완료";
  if (adStatus === "ended") return "종료 완료";
  return "신고 이력";
}

function missingReportStatusClass(report) {
  const label = missingReportStatusLabel(report);
  if (label.includes("발견")) return "safe";
  if (label.includes("종료")) return "neutral";
  return "searching";
}

function missingFoundLabel(report) {
  const subjectStatus = statusLabel(report?.subject_status);
  if (subjectStatus === "찾는중") return "미발견";
  if (subjectStatus === "안전") return "발견";
  return "미확인";
}

function missingFoundClass(report) {
  const label = missingFoundLabel(report);
  if (label === "발견") return "safe";
  if (label === "미발견") return "searching";
  return "neutral";
}

function adStatusLabel(status) {
  if (status === "active") return "광고중";
  if (status === "paused") return "정지중";
  if (status === "ready") return "승인대기";
  if (status === "ended") return "만료";
  return "연동 대기";
}

function isBaseAdminUser(user) {
  return isDefaultAdminEmail(user.email) || isDefaultAdminEmail(user.google_email);
}
