import { getServerSession } from "next-auth";
import Link from "next/link";
import QRCode from "qrcode";
import FormSubmitButton from "../form-submit-button";
import { LogoutButton, SocialLoginButtons } from "../auth-actions";
import ModalScrollLock from "../modal-scroll-lock";
import StatusToast from "../status-toast";
import AdminWorkspace from "./admin-workspace";
import AdminExportButton from "./export-button";
import ProductAdminCatalogForm from "./product-admin-catalog-form";
import { isAdminSession, isDefaultAdminEmail } from "../../lib/admin";
import { authOptions, getConfiguredProviderIds } from "../../lib/auth";
import {
  getAdminAdsData,
  getAdminCouponsData,
  getAdminDashboardData,
  getAdminData,
  getAdminInquiriesData,
  getAdminLocationSharesData,
  getAdminMessagesData,
  getAdminMessageTemplatesData,
  getAdminMissingReportsData,
  getAdminOrdersData,
  getAdminPaymentsData,
  getAdminProductsData,
  getAdminSubscriptionsData,
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
  setProductOrderFulfillmentAction,
  setQrAdminMemoAction,
  setQrActiveAction,
  setQrLifecycleAction,
  setQrSubjectAction,
  setAdminSubjectAdMemoAction,
  setAdminSubjectAdStatusAction,
  createAdminPaymentRefundAction,
  saveAdminCouponAction,
  saveAdminMessageAction,
  saveAdminMessageTemplateAction,
  setSubscriptionAdminMemoAction,
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

  const activeSection = ["dashboard", "guardians", "subjects", "qr", "admins", "payments", "coupons", "products", "orders", "subscriptions", "ads", "missing", "locations", "notifications", "message-templates", "inquiries"].includes(resolvedSearchParams?.section)
    ? resolvedSearchParams.section
    : "dashboard";
  const selectedGuardianId = resolvedSearchParams?.guardian || "";
  const selectedSubjectId = resolvedSearchParams?.subject || "";
  const guardianFilters = {
    query: resolvedSearchParams?.guardianAdminQuery || "",
    status: resolvedSearchParams?.guardianStatus || "all",
    type: resolvedSearchParams?.guardianType || "all",
    startDate: resolvedSearchParams?.guardianStart || "",
    endDate: resolvedSearchParams?.guardianEnd || "",
  };
  const subjectAdminFilters = {
    query: resolvedSearchParams?.subjectAdminQuery || "",
    status: resolvedSearchParams?.subjectStatus || "all",
    qr: resolvedSearchParams?.subjectQr || "all",
    subscription: resolvedSearchParams?.subjectSubscription || "all",
    startDate: resolvedSearchParams?.subjectStart || "",
    endDate: resolvedSearchParams?.subjectEnd || "",
    guardianId: resolvedSearchParams?.guardianId || "",
  };
  const qrFilters = {
    query: resolvedSearchParams?.qrAdminQuery || "",
    status: resolvedSearchParams?.qrStatus || "all",
    match: resolvedSearchParams?.match || "all",
    active: resolvedSearchParams?.active || "all",
    startDate: resolvedSearchParams?.qrStart || "",
    endDate: resolvedSearchParams?.qrEnd || "",
    selectedQr: resolvedSearchParams?.qr || "",
    assignQr: resolvedSearchParams?.assignQr || "",
    guardianQuery: resolvedSearchParams?.guardianQuery || "",
    subjectQuery: resolvedSearchParams?.subjectQuery || "",
  };
  const orderFilters = {
    query: resolvedSearchParams?.orderQuery || "",
    product: resolvedSearchParams?.orderProduct || "",
    payment: resolvedSearchParams?.payment || "all",
    fulfillment: resolvedSearchParams?.fulfillment || "all",
    startDate: resolvedSearchParams?.orderStart || "",
    endDate: resolvedSearchParams?.orderEnd || "",
  };
  const paymentFilters = {
    query: resolvedSearchParams?.paymentLedgerQuery || "",
    type: resolvedSearchParams?.paymentLedgerType || "all",
    status: resolvedSearchParams?.paymentLedgerStatus || "all",
    startDate: resolvedSearchParams?.paymentStart || "",
    endDate: resolvedSearchParams?.paymentEnd || "",
  };
  const couponFilters = {
    query: resolvedSearchParams?.couponQuery || "",
    discountType: resolvedSearchParams?.couponDiscountType || "all",
    status: resolvedSearchParams?.couponStatus || "all",
  };
  const subscriptionFilters = {
    query: resolvedSearchParams?.subscriptionQuery || "",
    plan: resolvedSearchParams?.subscriptionPlan || "all",
    status: resolvedSearchParams?.subscriptionStatus || "all",
    payment: resolvedSearchParams?.subscriptionPayment || "all",
    startDate: resolvedSearchParams?.subscriptionStart || "",
    endDate: resolvedSearchParams?.subscriptionEnd || "",
  };
  const selectedOrderId = resolvedSearchParams?.order || "";
  const selectedPaymentId = resolvedSearchParams?.paymentRecord || "";
  const selectedCouponId = resolvedSearchParams?.coupon || "";
  const selectedSubscriptionId = resolvedSearchParams?.subscription || "";
  const selectedAdId = resolvedSearchParams?.ad || "";
  const adFilters = {
    query: resolvedSearchParams?.adQuery || "",
    status: resolvedSearchParams?.adStatus || "all",
    review: resolvedSearchParams?.adReview || "all",
    region: resolvedSearchParams?.adRegion || "all",
    startDate: resolvedSearchParams?.adStart || "",
    endDate: resolvedSearchParams?.adEnd || "",
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
  const selectedMessageId = resolvedSearchParams?.message || "";
  const composeMessage = resolvedSearchParams?.compose === "1";
  const messageFilters = {
    query: resolvedSearchParams?.messageQuery || "",
    channel: resolvedSearchParams?.messageChannel || "all",
    status: resolvedSearchParams?.messageStatus || "all",
    startDate: resolvedSearchParams?.messageStart || "",
    endDate: resolvedSearchParams?.messageEnd || "",
  };
  const selectedTemplateId = resolvedSearchParams?.template || "";
  const templateFilters = {
    query: resolvedSearchParams?.templateQuery || "",
    channel: resolvedSearchParams?.templateChannel || "all",
    auto: resolvedSearchParams?.templateAuto || "all",
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
        ...(await getAdminPaymentsData(paymentFilters, selectedPaymentId)),
      }
    : null;
  const couponsData = activeSection === "coupons" ? await getAdminCouponsData(couponFilters, selectedCouponId) : null;
  const productsData = activeSection === "products" ? await getAdminProductsData() : null;
  const ordersData = activeSection === "orders" ? await getAdminOrdersData(orderFilters, selectedOrderId) : null;
  const subscriptionsData = activeSection === "subscriptions" ? await getAdminSubscriptionsData(subscriptionFilters, selectedSubscriptionId) : null;
  const adsData = activeSection === "ads" ? await getAdminAdsData(adFilters, selectedAdId) : null;
  const missingReportsData = activeSection === "missing" ? await getAdminMissingReportsData(missingFilters) : null;
  const locationSharesData = activeSection === "locations" ? await getAdminLocationSharesData(locationFilters, selectedLocationShareId) : null;
  const messagesData = activeSection === "notifications" ? await getAdminMessagesData(messageFilters, composeMessage ? "new" : selectedMessageId) : null;
  const messageTemplatesData = activeSection === "message-templates" ? await getAdminMessageTemplatesData(templateFilters, selectedTemplateId) : null;
  const inquiriesData = activeSection === "inquiries" ? await getAdminInquiriesData() : null;
  const qrItems = qrData ? await withQrImages(qrData.qrCodes) : [];
  const selectedSubjectQrImage = adminSubjectsData?.selectedSubject?.qr_target_url
    ? await QRCode.toDataURL(adminSubjectsData.selectedSubject.qr_target_url, {
        margin: 1,
        width: 144,
        color: {
          dark: "#1f2d3d",
          light: "#ffffff",
        },
      })
    : "";
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
          : activeSection === "coupons"
            ? "쿠폰 관리"
          : activeSection === "products"
            ? "상품 관리"
            : activeSection === "orders"
              ? "주문/배송 관리"
              : activeSection === "subscriptions"
                ? "구독 관리"
            : activeSection === "ads"
              ? "광고 관리"
              : activeSection === "missing"
                ? "실종신고 관리"
                : activeSection === "locations"
                  ? "위치공유 관리"
                  : activeSection === "notifications"
                    ? "알림 관리"
                    : activeSection === "message-templates"
                      ? "메시지 템플릿"
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
          : activeSection === "coupons"
            ? "쿠폰 코드를 발행하고 할인 조건, 유효기간, 사용 가능 상태를 관리합니다."
          : activeSection === "products"
            ? "사용자 상품 선택 화면에 노출되는 상품 이미지, 가격, 활성 상태를 관리합니다."
            : activeSection === "orders"
              ? "주문과 결제 상태를 조회하고 배송상태, 택배사, 송장번호를 관리합니다."
              : activeSection === "subscriptions"
                ? "이용권 구독 상태, 기간, 결제내역과 운영 메모를 관리합니다."
            : activeSection === "ads"
              ? "광고 일 단가를 설정하고 사용자별 광고 진행사항을 조회합니다."
              : activeSection === "missing"
                ? "실종신고 접수 현황과 광고 상태, 발견 여부를 조회합니다."
                : activeSection === "locations"
                  ? "QR 공개 페이지에서 공유된 발견 위치와 지도 링크를 조회합니다."
                  : activeSection === "notifications"
                    ? "가입 보호자에게 푸시 알림 메시지를 작성, 저장, 발송하고 결과를 확인합니다."
                    : activeSection === "message-templates"
                      ? "자동/수동 메시지 템플릿의 채널, 대상, 제목과 내용을 관리합니다."
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
            <SubjectManagementSection adminSubjectsData={adminSubjectsData} selectedSubjectQrImage={selectedSubjectQrImage} />
          ) : activeSection === "qr" ? (
            <QrManagementSection qrData={qrData} qrItems={qrItems} />
          ) : activeSection === "admins" ? (
            <AdminRoleManagementSection adminUsersData={adminUsersData} />
          ) : activeSection === "payments" ? (
            <PaymentManagementSection paymentData={paymentData} />
          ) : activeSection === "coupons" ? (
            <CouponManagementSection couponsData={couponsData} />
          ) : activeSection === "products" ? (
            <ProductManagementSection productsData={productsData} />
          ) : activeSection === "orders" ? (
            <OrderManagementSection ordersData={ordersData} />
          ) : activeSection === "subscriptions" ? (
            <SubscriptionManagementSection subscriptionsData={subscriptionsData} />
          ) : activeSection === "ads" ? (
            <AdManagementSection adsData={adsData} />
          ) : activeSection === "missing" ? (
            <MissingReportManagementSection missingReportsData={missingReportsData} />
          ) : activeSection === "locations" ? (
            <LocationShareManagementSection locationSharesData={locationSharesData} />
          ) : activeSection === "notifications" ? (
            <NotificationManagementSection messagesData={messagesData} composeMessage={composeMessage} />
          ) : activeSection === "message-templates" ? (
            <MessageTemplateManagementSection templatesData={messageTemplatesData} />
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
            <span className="dashboard-cell-ellipsis" title={item.body || item.guardian_name || "-"}>
              {truncateText(item.body || item.guardian_name || "-", 10)}
            </span>,
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
    case "growth":
      return (
        <>
          <circle cx="17" cy="43" r="7" />
          <circle cx="34" cy="38" r="7" />
          <circle cx="51" cy="33" r="7" />
          <path d="M8 26h14l7-8 8 6 15-17" />
          <path d="M45 7h7v7" />
          <path d="M7 56c2-6 5.5-9 10-9s8 3 10 9" />
          <path d="M24 56c2-6 5.5-9 10-9s8 3 10 9" />
          <path d="M41 56c2-6 5.5-9 10-9s8 3 10 9" />
        </>
      );
    case "linked":
      return (
        <>
          <circle cx="24" cy="18" r="8" />
          <path d="M10 46c2-10 6.7-15 14-15s12 5 14 15" />
          <path d="M43 14c6 3 9 8 9 15s-3 12-9 15" />
          <path d="M49 25h9v9" />
        </>
      );
    case "blocked":
      return (
        <>
          <circle cx="32" cy="32" r="22" />
          <path d="M17 17 47 47" />
        </>
      );
    case "time":
      return (
        <>
          <circle cx="32" cy="32" r="23" />
          <path d="M32 17v16l12 7" />
        </>
      );
    case "check":
      return (
        <>
          <circle cx="32" cy="32" r="23" />
          <path d="M20 33.5 28.5 42 46 23" />
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

function NotificationManagementSection({ messagesData, composeMessage }) {
  const { messages, selectedMessage, subjects, summary, filters } = messagesData;
  const visibleRows = Math.max(0, 12 - messages.length);
  const selectedReturnTo = buildAdminMessageUrl(filters, selectedMessage?.id);
  const closeComposeUrl = buildAdminMessageUrl(filters, selectedMessage?.id);

  return (
    <div className="admin-message-page">
      <section className="admin-panel admin-message-search-panel">
        <h2>메시지 관리</h2>
        <form className="admin-message-search-form" action="/admin">
          <input type="hidden" name="section" value="notifications" />
          <label>
            발송 채널
            <select name="messageChannel" defaultValue={filters.channel}>
              <option value="all">전체</option>
              <option value="push">푸시 알림</option>
              <option value="kakao">카카오톡</option>
            </select>
          </label>
          <label>
            발송 상태
            <select name="messageStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="draft">저장됨</option>
              <option value="sent">발송완료</option>
            </select>
          </label>
          <label className="admin-message-query">
            검색어
            <input name="messageQuery" defaultValue={filters.query} placeholder="제목 또는 내용입력" />
          </label>
          <fieldset className="admin-message-date-filter">
            <legend>기간</legend>
            <input type="date" name="messageStart" defaultValue={filters.startDate} aria-label="시작일" />
            <span>~</span>
            <input type="date" name="messageEnd" defaultValue={filters.endDate} aria-label="종료일" />
          </fieldset>
          <div className="admin-message-search-actions">
            <Link className="plain-button" href="/admin?section=notifications">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-message-toolbar">
        <div>
          <strong>전체 {formatMetricValue(summary.total)}건</strong>
          <span>발송 {formatMetricValue(summary.sent)}건 · 저장 {formatMetricValue(summary.draft)}건</span>
        </div>
        <Link className="primary-button compact" href={buildAdminMessageUrl(filters, "", true)}>+ 새 메시지</Link>
      </div>

      <div className="admin-master-detail admin-message-layout">
        <section className="admin-panel guardian-list-panel admin-message-list-panel">
          <div className="guardian-list-heading">
            <h2>조회</h2>
            <AdminExportButton filename="zezari-admin-messages.csv" rows={adminMessageExportRows(messages)} />
          </div>
          <div className="admin-record-table-wrap">
            <div className="admin-record-table admin-message-table" role="table" aria-label="알림 메시지 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">알림번호</span>
                <span role="columnheader">제목</span>
                <span role="columnheader">발송 채널</span>
                <span role="columnheader">발송 대상</span>
                <span role="columnheader">발송 상태</span>
                <span role="columnheader">발송 수</span>
                <span role="columnheader">성공 수</span>
                <span role="columnheader">실패 수</span>
                <span role="columnheader">발송 일시</span>
                <span role="columnheader">관리</span>
              </div>
              {messages.map((message) => {
                const isSelected = selectedMessage?.id === message.id;
                return (
                  <Link
                    className={isSelected ? "admin-record-row active" : "admin-record-row"}
                    href={buildAdminMessageUrl(filters, message.id)}
                    key={message.id}
                    role="row"
                  >
                    <strong role="cell">{message.message_number}</strong>
                    <span role="cell">{message.title || "제목 없음"}</span>
                    <span role="cell"><b className="message-channel-chip">{adminMessageChannelLabel(message.channel)}</b></span>
                    <span role="cell">{adminMessageTargetLabel(message)}</span>
                    <span role="cell"><b className={`message-status-chip ${message.status || "draft"}`}>{adminMessageStatusLabel(message.status)}</b></span>
                    <span role="cell">{formatMetricValue(message.recipient_count)}</span>
                    <span role="cell">{formatMetricValue(message.success_count)}</span>
                    <span role="cell">{formatMetricValue(message.failure_count)}</span>
                    <time role="cell">{formatRecentDateTime(message.sent_at || message.created_at)}</time>
                    <span role="cell">상세보기</span>
                  </Link>
                );
              })}
              {Array.from({ length: visibleRows }).map((_, index) => (
                <div className="admin-record-row placeholder" role="row" key={`message-empty-${index}`}>
                  {Array.from({ length: 10 }).map((__, columnIndex) => (
                    <span role="cell" key={columnIndex}> </span>
                  ))}
                </div>
              ))}
              {messages.length === 0 && <p className="empty-text">조건에 맞는 메시지가 없습니다.</p>}
            </div>
          </div>
          <div className="admin-table-footer">
            <span>선택한 메시지 {selectedMessage ? "1" : "0"}건</span>
            <select aria-label="페이지당 표시 개수" defaultValue="10">
              <option>10개씩 보기</option>
              <option>20개씩 보기</option>
              <option>50개씩 보기</option>
            </select>
          </div>
        </section>

        <aside className="admin-panel admin-message-detail-panel">
          {selectedMessage ? (
            <>
              <div className="admin-message-detail-summary">
                <h2>상세 정보</h2>
                <dl className="admin-detail-list">
                  <div><dt>알림번호</dt><dd>{selectedMessage.message_number}</dd></div>
                  <div><dt>발송상태</dt><dd><b className={`message-status-chip ${selectedMessage.status || "draft"}`}>{adminMessageStatusLabel(selectedMessage.status)}</b></dd></div>
                  <div><dt>발송일시</dt><dd>{formatRecentDateTime(selectedMessage.sent_at)}</dd></div>
                  <div><dt>발송채널</dt><dd>{adminMessageChannelLabel(selectedMessage.channel)}</dd></div>
                  <div><dt>발송대상</dt><dd>{adminMessageTargetLabel(selectedMessage)}</dd></div>
                </dl>
              </div>
              <AdminMessageEditor message={selectedMessage} subjects={subjects} returnTo={selectedReturnTo} />
              <section className="admin-message-result-section">
                <h3>발송 결과</h3>
                <div className="admin-message-result-grid">
                  <span><strong>{formatMetricValue(selectedMessage.recipient_count)}</strong><small>발송 수</small></span>
                  <span><strong>{formatMetricValue(selectedMessage.success_count)}</strong><small>성공 수</small></span>
                  <span><strong>{formatMetricValue(selectedMessage.failure_count)}</strong><small>실패 수</small></span>
                </div>
              </section>
            </>
          ) : (
            <>
              <h2>상세 정보</h2>
              <p className="empty-text">메시지를 선택하거나 새 메시지를 작성해 주세요.</p>
            </>
          )}
        </aside>
      </div>

      {composeMessage && (
        <>
          <ModalScrollLock />
          <div className="admin-message-compose-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-message-compose-title">
            <Link className="admin-message-compose-scrim" href={closeComposeUrl} aria-label="새 메시지 닫기" />
            <aside className="admin-message-compose-panel">
              <div className="admin-message-compose-header">
                <h2 id="admin-message-compose-title">상세 정보</h2>
                <Link className="plain-button compact" href={closeComposeUrl}>닫기</Link>
              </div>
              <AdminMessageEditor message={null} subjects={subjects} returnTo="/admin?section=notifications" compact />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function AdminMessageEditor({ message, subjects, returnTo, compact = false }) {
  const targetType = message?.target_type || "all";
  const subjectId = message?.subject_id || "";
  const title = message?.title || "";
  const body = message?.body || "";

  return (
    <form action={saveAdminMessageAction} className={`admin-message-editor${compact ? " compact" : ""}`}>
      <input type="hidden" name="messageId" value={message?.id || ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="messageUrl" value="/" />

      <label>
        발송 채널
        <select name="channel" defaultValue={message?.channel || "push"}>
          <option value="push">푸시 알림</option>
          <option value="kakao">카카오톡</option>
        </select>
      </label>

      <div className="admin-message-target-row">
        <label>
          발송 대상
          <select name="targetType" defaultValue={targetType}>
            <option value="all">전체 회원</option>
            <option value="subject">대상자 선택</option>
          </select>
        </label>
        <span>또는</span>
        <label>
          대상자
          <select name="subjectId" defaultValue={subjectId}>
            <option value="">대상자 선택</option>
            {subjects.map((subject) => (
              <option value={subject.id} key={subject.id}>
                {subject.name || "이름 미입력"} / {subject.guardian_name || subject.guardian_email || subject.guardian_google_email || "보호자 미입력"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        제목
        <input name="title" defaultValue={title} placeholder="제목을 입력하세요" maxLength="120" />
      </label>
      <label>
        내용
        <textarea name="body" defaultValue={body} placeholder="내용을 입력하세요" rows={compact ? 4 : 5} maxLength="1000" />
      </label>

      <section className="admin-message-preview" aria-label="알림 미리보기">
        <h3>미리보기</h3>
        <div>
          <strong>{title || "제목이 표시됩니다."}</strong>
          <p>{body || "내용이 표시됩니다."}</p>
        </div>
      </section>

      <div className="admin-message-editor-actions">
        <FormSubmitButton className="plain-button compact" pendingText="저장중" name="command" value="save">
          저장
        </FormSubmitButton>
        <FormSubmitButton className="primary-button compact" pendingText="발송중" name="command" value="send">
          발송
        </FormSubmitButton>
      </div>
    </form>
  );
}

function MessageTemplateManagementSection({ templatesData }) {
  const { templates, selectedTemplate, selectedTemplateId, summary, filters } = templatesData;
  const isCreating = selectedTemplateId === "new" || !selectedTemplate;
  const editingTemplate = selectedTemplate || {};
  const locked = Number(editingTemplate.is_locked || 0) === 1;
  const returnTo = buildMessageTemplateUrl(filters, isCreating ? "new" : editingTemplate.id);
  const visibleRows = Math.max(0, 12 - templates.length);

  return (
    <div className="message-template-page">
      <section className="admin-panel message-template-search-panel">
        <h2>템플릿 관리</h2>
        <form className="message-template-search-form" action="/admin">
          <input type="hidden" name="section" value="message-templates" />
          <label>
            검색어
            <input name="templateQuery" defaultValue={filters.query} placeholder="이벤트, 제목, 내용" />
          </label>
          <label>
            발송 채널
            <select name="templateChannel" defaultValue={filters.channel}>
              <option value="all">전체</option>
              <option value="push">푸시 알림</option>
              <option value="kakao">카카오톡</option>
            </select>
          </label>
          <label>
            자동 여부
            <select name="templateAuto" defaultValue={filters.auto}>
              <option value="all">전체</option>
              <option value="auto">자동 메시지</option>
              <option value="manual">수동 메시지</option>
            </select>
          </label>
          <div className="message-template-search-actions">
            <Link className="plain-button" href="/admin?section=message-templates">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail message-template-layout">
        <section className="admin-panel guardian-list-panel message-template-list-panel">
          <div className="guardian-list-heading">
            <h2>템플릿 메시지 <small>총 {formatMetricValue(summary.total)}개</small></h2>
            <AdminExportButton filename="zezari-message-templates.csv" rows={messageTemplateExportRows(templates)} />
          </div>
          <div className="admin-record-table-wrap">
            <div className="admin-record-table message-template-table" role="table" aria-label="메시지 템플릿 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">이벤트</span>
                <span role="columnheader">설명</span>
                <span role="columnheader">발송채널</span>
                <span role="columnheader">내용</span>
                <span role="columnheader">발송 대상</span>
                <span role="columnheader">자동 메시지</span>
                <span role="columnheader">관리</span>
              </div>
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id && !isCreating;
                return (
                  <Link
                    className={isSelected ? "admin-record-row active" : "admin-record-row"}
                    href={buildMessageTemplateUrl(filters, template.id)}
                    key={template.id}
                    role="row"
                  >
                    <strong role="cell">{template.event_key || "-"}</strong>
                    <span role="cell">{template.description || template.title || "-"}</span>
                    <span role="cell"><b className={`message-channel-chip ${template.channel || "push"}`}>{adminMessageChannelLabel(template.channel)}</b></span>
                    <span role="cell">{truncateText(template.body || "-", 32)}</span>
                    <span role="cell">{adminMessageTargetTypeLabel(template.target_type)}</span>
                    <span role="cell">
                      <b className={`template-auto-chip ${Number(template.is_auto || 0) ? "on" : "off"}`}>
                        {Number(template.is_auto || 0) ? "ON" : "OFF"}
                      </b>
                    </span>
                    <span role="cell">설정</span>
                  </Link>
                );
              })}
              {Array.from({ length: visibleRows }).map((_, index) => (
                <div className="admin-record-row placeholder" role="row" key={`template-empty-${index}`}>
                  {Array.from({ length: 7 }).map((__, columnIndex) => (
                    <span role="cell" key={columnIndex}> </span>
                  ))}
                </div>
              ))}
              {templates.length === 0 && <p className="empty-text">조건에 맞는 메시지 템플릿이 없습니다.</p>}
            </div>
          </div>
          <div className="admin-table-footer">
            <span>선택한 템플릿 {isCreating ? "0" : "1"}개</span>
            <Link className="primary-button compact" href={buildMessageTemplateUrl(filters, "new")}>+ 새 템플릿</Link>
          </div>
        </section>

        <aside className="admin-panel message-template-detail-panel">
          <h2>{isCreating ? "메시지 등록" : "메시지 수정"}</h2>
          {locked && <p className="template-lock-note">자동 메시지는 제목과 내용만 수정할 수 있습니다.</p>}
          <form action={saveAdminMessageTemplateAction} className="message-template-detail-form">
            <input type="hidden" name="templateId" value={isCreating ? "" : editingTemplate.id || ""} />
            <input type="hidden" name="returnTo" value={returnTo} />
            {locked && (
              <>
                <input type="hidden" name="channel" value={editingTemplate.channel || "push"} />
                <input type="hidden" name="targetType" value={editingTemplate.target_type || "all"} />
                <input type="hidden" name="isAuto" value={Number(editingTemplate.is_auto || 0) ? "1" : "0"} />
              </>
            )}

            {!locked && (
              <>
                <label>
                  이벤트
                  <input name="eventKey" defaultValue={editingTemplate.event_key || ""} placeholder="예: 결제 완료" maxLength="80" />
                </label>
                <label>
                  설명
                  <input name="description" defaultValue={editingTemplate.description || ""} placeholder="템플릿 설명" maxLength="160" />
                </label>
              </>
            )}

            <label>
              알림 채널
              <select name={locked ? undefined : "channel"} defaultValue={editingTemplate.channel || "push"} disabled={locked}>
                <option value="push">푸시 알림</option>
                <option value="kakao">카카오톡</option>
              </select>
            </label>

            <label>
              발송 대상
              <select name={locked ? undefined : "targetType"} defaultValue={editingTemplate.target_type || "all"} disabled={locked}>
                <option value="all">전체 회원</option>
                <option value="subject">대상자 선택</option>
              </select>
            </label>

            <label>
              제목
              <input name="title" defaultValue={editingTemplate.title || ""} placeholder="제목을 입력하세요" maxLength="120" />
            </label>
            <label>
              내용
              <textarea name="body" defaultValue={editingTemplate.body || ""} placeholder="내용을 입력하세요" rows="7" maxLength="1000" />
            </label>

            {!locked && (
              <section className="message-template-radio-section">
                <h3>자동 메시지</h3>
                <div className="message-template-radio-row">
                  <label>
                    <input name="isAuto" type="radio" value="1" defaultChecked={Number(editingTemplate.is_auto || 0) === 1} />
                    <span>ON</span>
                  </label>
                  <label>
                    <input name="isAuto" type="radio" value="0" defaultChecked={Number(editingTemplate.is_auto || 0) !== 1} />
                    <span>OFF</span>
                  </label>
                </div>
              </section>
            )}

            <section className="message-template-radio-section">
              <h3>사용 상태</h3>
              <div className="message-template-radio-row">
                <label>
                  <input name="isActive" type="radio" value="1" defaultChecked={Number(editingTemplate.is_active ?? 1) !== 0} />
                  <span>사용 가능</span>
                </label>
                <label>
                  <input name="isActive" type="radio" value="0" defaultChecked={Number(editingTemplate.is_active || 0) === 0} />
                  <span>사용 불가능</span>
                </label>
              </div>
            </section>

            <section className="admin-message-preview" aria-label="템플릿 미리보기">
              <h3>미리보기</h3>
              <div>
                <strong>{editingTemplate.title || "제목이 표시됩니다."}</strong>
                <p>{editingTemplate.body || "내용이 표시됩니다."}</p>
              </div>
            </section>

            <FormSubmitButton className="primary-button compact" pendingText="저장중">
              저장
            </FormSubmitButton>
          </form>
        </aside>
      </div>
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
  const summaryCards = [
    { label: "전체 주문", value: summary.total, note: "누적 주문" },
    { label: "결제 완료", value: summary.paid, note: orderRatio(summary.paid, summary.total) },
    { label: "배송중", value: summary.shipped, note: orderRatio(summary.shipped, summary.total) },
    { label: "배송완료", value: summary.delivered, note: orderRatio(summary.delivered, summary.total) },
    { label: "취소", value: summary.cancelled, note: orderRatio(summary.cancelled, summary.total) },
    { label: "환불", value: summary.refunded, note: orderRatio(summary.refunded, summary.total) },
  ];

  return (
    <div className="qr-admin-stack order-admin-page">
      <section className="order-admin-status" aria-label="주문 현황">
        <h2>주문관리</h2>
        <div className="order-stat-grid">
          {summaryCards.map((card) => (
            <article className="order-stat-card" key={card.label}>
              <strong>{card.label}</strong>
              <b>{formatMetricValue(card.value)} 건</b>
              <span>{card.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel order-search-panel">
        <h3>검색</h3>
        <form className="order-search-form" action="/admin">
          <input type="hidden" name="section" value="orders" />
          <label>
            검색어
            <input
              name="orderQuery"
              defaultValue={filters.query}
              placeholder="주문번호, 대상자명, 보호자명, 연락처, 송장번호"
            />
          </label>
          <label>
            상품명
            <input name="orderProduct" defaultValue={filters.product} placeholder="상품명" />
          </label>
          <label>
            주문상태
            <select name="payment" defaultValue={filters.payment}>
              <option value="all">전체</option>
              <option value="paid">결제 완료</option>
              <option value="pending">결제 대기</option>
              <option value="failed">결제 실패/취소</option>
            </select>
          </label>
          <label>
            배송상태
            <select name="fulfillment" defaultValue={filters.fulfillment}>
              <option value="all">전체</option>
              <option value="pending">결제 확인 전</option>
              <option value="preparing">배송 준비</option>
              <option value="shipped">배송 중</option>
              <option value="delivered">배송 완료</option>
              <option value="cancelled">배송 취소</option>
            </select>
          </label>
          <div className="order-date-filter">
            <span>주문기간</span>
            <input type="date" name="orderStart" defaultValue={filters.startDate} />
            <em>~</em>
            <input type="date" name="orderEnd" defaultValue={filters.endDate} />
          </div>
          <div className="order-search-actions">
            <Link className="plain-button" href="/admin?section=orders">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail admin-order-master-detail">
        <section className="admin-panel admin-master-panel">
          <div className="panel-heading">
            <h2>조회</h2>
            <div className="admin-heading-actions">
              <span>{orders.length}건 조회</span>
              <AdminExportButton filename="zezari-orders.csv" rows={orderExportRows(orders)} />
            </div>
          </div>

          <div className="admin-record-table-wrap">
            <div className="admin-record-table order-record-table" role="table" aria-label="주문 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">선택</span>
                <span role="columnheader">주문번호</span>
                <span role="columnheader">주문일시</span>
                <span role="columnheader">대상자명/보호자명</span>
                <span role="columnheader">연락처</span>
                <span role="columnheader">상품명(옵션)</span>
                <span role="columnheader">수량</span>
                <span role="columnheader">상품금액</span>
                <span role="columnheader">결제금액</span>
                <span role="columnheader">결제방법</span>
                <span role="columnheader">주문상태</span>
                <span role="columnheader">배송상태</span>
                <span role="columnheader">관리</span>
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
                    <span className="admin-row-selector" role="cell">{selectedOrder?.id === order.id ? "◎" : "□"}</span>
                    <strong className="inline-scroll-value" role="cell">{formatOrderNumber(order)}</strong>
                    <time role="cell">{formatRecentDateTime(order.created_at)}</time>
                    <span className="order-record-party" role="cell">
                      <strong>{order.subject_name || "대상자 미선택"}</strong>
                      <small>{order.guardian_name || "보호자 미입력"}</small>
                    </span>
                    <span role="cell">{order.display_recipient_phone || order.guardian_phone || "-"}</span>
                    <span role="cell">{formatOrderProductName(order)} ({order.order_type === "standalone" ? "단독" : `${order.plan_months || "-"}개월`})</span>
                    <span role="cell">{order.quantity || 1}개</span>
                    <span role="cell">{formatCurrency(order.amount)}</span>
                    <span role="cell">{formatCurrency(order.amount)}</span>
                    <span role="cell">{order.payment_method || "-"}</span>
                    <em className={`order-state ${paymentStateClass(order.status)}`} role="cell">
                      {paymentStatusLabel(order.status)}
                    </em>
                    <em className={`order-state fulfillment-${fulfillment}`} role="cell">
                      {fulfillmentStatusLabel(fulfillment)}
                    </em>
                    <span className="admin-row-detail" role="cell">상세보기</span>
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
                <h3>주문 기본 정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>주문번호</dt><dd className="inline-scroll-value">{formatOrderNumber(selectedOrder)}</dd></div>
                  <div><dt>주문일시</dt><dd>{formatDateTime(selectedOrder.created_at)}</dd></div>
                  <div><dt>결제상태</dt><dd>{paymentStatusLabel(selectedOrder.status)}</dd></div>
                  <div><dt>배송상태</dt><dd>{fulfillmentStatusLabel(selectedFulfillment)}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>대상자 정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>대상자명</dt><dd>{selectedOrder.subject_name || "대상자 미선택"}</dd></div>
                  <div><dt>보호자명</dt><dd>{selectedOrder.guardian_name || "보호자 미입력"}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>주문 상품</h3>
                <div className="order-detail-product">
                  <div className="order-detail-product-image">
                    {selectedOrder.design_option_image_data_url || selectedOrder.product_image_data_url ? (
                      <img src={selectedOrder.design_option_image_data_url || selectedOrder.product_image_data_url} alt={`${formatOrderProductName(selectedOrder)} 이미지`} />
                    ) : (
                      <span aria-hidden="true">QR</span>
                    )}
                  </div>
                  <dl className="admin-detail-list">
                    <div><dt>상품명</dt><dd>{formatOrderProductName(selectedOrder)}</dd></div>
                    <div><dt>옵션</dt><dd>{selectedOrder.order_type === "standalone" ? "상품 단독 구매" : `${selectedOrder.plan_months || "-"}개월 이용권`}</dd></div>
                    <div><dt>수량</dt><dd>{selectedOrder.quantity || 1}개</dd></div>
                    <div><dt>결제금액</dt><dd>{formatCurrency(selectedOrder.amount)}</dd></div>
                  </dl>
                </div>
              </section>

              <section className="admin-detail-section">
                <h3>결제정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>상품금액</dt><dd>{formatCurrency(selectedOrder.amount)}</dd></div>
                  <div><dt>배송비</dt><dd>{formatCurrency(0)}</dd></div>
                  <div><dt>할인금액</dt><dd>{formatCurrency(0)}</dd></div>
                  <div><dt>결제금액</dt><dd>{formatCurrency(selectedOrder.amount)}</dd></div>
                  <div><dt>결제방법</dt><dd>{selectedOrder.payment_method || "-"}</dd></div>
                  <div><dt>결제일</dt><dd>{formatDateTime(selectedOrder.paid_at)}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section">
                <h3>배송정보</h3>
                <dl className="admin-detail-list">
                  <div><dt>수령인</dt><dd>{selectedOrder.display_recipient_name || "이름 미입력"}</dd></div>
                  <div><dt>수령 연락처</dt><dd>{selectedOrder.display_recipient_phone || "전화번호 미입력"}</dd></div>
                  <div><dt>배송지</dt><dd>{formatFullAddress(selectedOrder.shipping_address, selectedOrder.shipping_address_detail)}</dd></div>
                  <div><dt>택배사</dt><dd>{selectedOrder.carrier || "미입력"}</dd></div>
                  <div><dt>송장번호</dt><dd className="inline-scroll-value">{selectedOrder.tracking_number || "미입력"}</dd></div>
                </dl>
              </section>

              <section className="admin-detail-section order-fulfillment-section">
                <h3>관리자 배송정보 입력</h3>
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
  const { setting, summary, regions, ads, selectedAd, selectedSpendHistory, filters } = adsData;
  const selectedAdReturnTo = buildAdListUrl(filters, selectedAd?.id);
  const selectedTabName = selectedAd ? `ad-detail-tab-${selectedAd.id}` : "ad-detail-tab-empty";
  const monthlyDelta = Number(summary.monthlyAmount || 0) - Number(summary.previousMonthlyAmount || 0);
  const summaryCards = [
    { label: "진행 중", value: `${formatMetricValue(summary.active)}건`, icon: "megaphone", note: "광고 집행" },
    { label: "심사 대기", value: `${formatMetricValue(summary.reviewPending)}건`, icon: "time", note: "META 검토" },
    { label: "심사반려", value: `${formatMetricValue(summary.reviewRejected)}건`, icon: "blocked", note: "확인 필요" },
    { label: "중단", value: `${formatMetricValue(summary.paused)}건`, icon: "blocked", note: "일시정지" },
    { label: "만료", value: `${formatMetricValue(summary.ended)}건`, icon: "check", note: "종료됨" },
    { label: "월 광고비", value: formatCurrency(summary.monthlyAmount), icon: "money", note: `전월 대비 ${monthlyDelta >= 0 ? "+" : ""}${formatCurrency(monthlyDelta)}` },
    { label: "년 광고비", value: formatCurrency(summary.yearlyAmount), icon: "money", note: "올해 누적" },
  ];

  return (
    <div className="ad-admin-page">
      <section className="ad-admin-status" aria-label="광고 현황">
        <h2>광고관리</h2>
        <div className="ad-stat-grid">
          {summaryCards.map((card) => (
            <article className="guardian-stat-card ad-stat-card" key={card.label}>
              <DashboardIcon name={card.icon} />
              <div>
                <h3>{card.label}</h3>
                <strong>{card.value}</strong>
                <span>{card.note}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel ad-rate-panel">
        <div>
          <h3>광고 일 단가</h3>
          <p>{formatCurrency(setting.daily_rate)} 기준으로 사용자가 선택한 광고기간 예상 금액을 산정합니다.</p>
        </div>
        <form className="ad-rate-form" action={setAdDailyRateAction}>
          <input type="hidden" name="returnTo" value={selectedAdReturnTo} />
          <label>
            일 단가
            <input name="dailyRate" type="number" min="0" step="100" defaultValue={setting.daily_rate} />
          </label>
          <FormSubmitButton pendingText="저장중">저장</FormSubmitButton>
        </form>
      </section>

      <section className="admin-panel ad-search-panel">
        <h3>조회</h3>
        <form className="ad-search-form" action="/admin">
          <input type="hidden" name="section" value="ads" />
          <label>
            검색어
            <input name="adQuery" defaultValue={filters.query} placeholder="번호, 이름" />
          </label>
          <label>
            광고 상태
            <select name="adStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="active">진행중</option>
              <option value="paused">중단</option>
              <option value="ready">심사전</option>
              <option value="ended">만료</option>
              <option value="rejected">반려</option>
            </select>
          </label>
          <label>
            심사 상태
            <select name="adReview" defaultValue={filters.review}>
              <option value="all">전체</option>
              <option value="pending">심사대기</option>
              <option value="approved">승인완료</option>
              <option value="rejected">심사반려</option>
            </select>
          </label>
          <label>
            광고 지역
            <select name="adRegion" defaultValue={filters.region}>
              <option value="all">전체</option>
              {regions.map((region) => (
                <option value={region} key={region}>{region}</option>
              ))}
            </select>
          </label>
          <div className="ad-date-filter">
            <span>광고 기간</span>
            <input type="date" name="adStart" defaultValue={filters.startDate} />
            <em>~</em>
            <input type="date" name="adEnd" defaultValue={filters.endDate} />
          </div>
          <div className="ad-search-actions">
            <Link className="plain-button" href="/admin?section=ads">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail admin-ad-master-detail">
        <section className="admin-panel admin-master-panel ad-list-panel">
          <div className="guardian-list-heading">
            <h2>전체 광고 <strong>{formatMetricValue(summary.total)}</strong>건</h2>
            <div className="admin-heading-actions">
              <span>{ads.length}건 조회</span>
              <AdminExportButton filename="zezari-ads.csv" rows={adExportRows(ads)} />
            </div>
          </div>

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
                <span role="columnheader">선택</span>
                <span role="columnheader">광고 번호</span>
                <span role="columnheader">대상자</span>
                <span role="columnheader">광고상태</span>
                <span role="columnheader">심사상태</span>
                <span role="columnheader">광고지역</span>
                <span role="columnheader">광고기간</span>
                <span role="columnheader">일예산</span>
                <span role="columnheader">총예산</span>
                <span role="columnheader">광고비(%)</span>
                <span role="columnheader">활성화 일시</span>
                <span role="columnheader">관리</span>
              </div>
              {ads.map((ad) => (
                <Link
                  className={ad.id === selectedAd?.id ? "admin-record-row active" : "admin-record-row"}
                  href={buildAdListUrl(filters, ad.id)}
                  key={ad.id}
                  role="row"
                >
                  <span className="admin-row-selector" role="cell">{ad.id === selectedAd?.id ? "◎" : "□"}</span>
                  <strong className="inline-scroll-value" role="cell">{formatAdNumber(ad)}</strong>
                  <span role="cell">{ad.subject_name || "관리대상 미입력"}</span>
                  <em role="cell" className={`ad-status-pill ${ad.status}`}>{adStatusLabel(ad.status)}</em>
                  <em role="cell" className={`ad-review-pill ${adReviewClass(ad.review_status)}`}>{adReviewStatusLabel(ad.review_status)}</em>
                  <span role="cell">{ad.region || "지역 미입력"}</span>
                  <time role="cell">{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</time>
                  <span role="cell">{formatCurrency(ad.daily_rate)}</span>
                  <span role="cell">{formatCurrency(ad.amount)}</span>
                  <span role="cell">{adBudgetProgressPercent(ad)}%</span>
                  <time role="cell">{formatRecentDateTime(ad.updated_at)}</time>
                  <span className="admin-row-detail" role="cell">상세보기</span>
                </Link>
              ))}
              {ads.length === 0 && <p className="empty-text">등록된 광고 진행사항이 없습니다.</p>}
            </div>
          </div>
          <div className="guardian-list-footer">
            <span>선택한 광고 {selectedAd ? "1건" : "0건"}</span>
            <select defaultValue="10" aria-label="페이지당 표시 건수">
              <option>10개씩 보기</option>
            </select>
          </div>
        </section>

        <aside className="admin-panel guardian-detail-card ad-detail-card" id="admin-ad-detail">
          {selectedAd ? (
            <>
              <div className="guardian-detail-header ad-detail-header">
                <AdAvatar ad={selectedAd} />
                <div>
                  <h2>{selectedAd.subject_name || "관리대상 미입력"}</h2>
                  <span>{selectedAd.subject_gender ? `${selectedAd.subject_gender}, ` : ""}{formatAgeFromBirthDate(selectedAd.subject_birth_date)}</span>
                  <span>보호자 {selectedAd.guardian_name || "보호자 미입력"}</span>
                  <em className={`ad-status-pill ${selectedAd.status}`}>{adStatusLabel(selectedAd.status)}</em>
                </div>
              </div>
              <div className="guardian-detail-tabset ad-detail-tabset">
                <input className="guardian-tab-radio" type="radio" name={selectedTabName} id={`${selectedTabName}-base`} defaultChecked />
                <input className="guardian-tab-radio" type="radio" name={selectedTabName} id={`${selectedTabName}-performance`} />
                <input className="guardian-tab-radio" type="radio" name={selectedTabName} id={`${selectedTabName}-spend`} />
                <div className="guardian-detail-tabs">
                  <label htmlFor={`${selectedTabName}-base`}>기본 정보</label>
                  <label htmlFor={`${selectedTabName}-performance`}>광고 성과</label>
                  <label htmlFor={`${selectedTabName}-spend`}>지출 내역</label>
                </div>
                <div className="guardian-tab-panels">
                  <section className="guardian-tab-panel">
                    <dl className="guardian-detail-list">
                      <div><dt>광고상태</dt><dd>{adStatusLabel(selectedAd.status)}</dd></div>
                      <div><dt>심사상태</dt><dd>{adReviewStatusLabel(selectedAd.review_status)}</dd></div>
                      <div><dt>일예산</dt><dd>{formatCurrency(selectedAd.daily_rate)}</dd></div>
                      <div><dt>총예산(%)</dt><dd>{formatCurrency(selectedAd.amount)} ({adBudgetProgressPercent(selectedAd)}% 소진)</dd></div>
                      <div><dt>광고지역</dt><dd>{selectedAd.region || "-"}</dd></div>
                      <div><dt>지도 반경</dt><dd className="inline-scroll-value">{formatAdTargetLocation(selectedAd)}</dd></div>
                      <div><dt>광고기간</dt><dd>{formatDate(selectedAd.start_date)} ~ {formatDate(selectedAd.end_date)}</dd></div>
                      <div><dt>활성화 일시</dt><dd>{formatRecentDateTime(selectedAd.updated_at)}</dd></div>
                      <div><dt>캠페인 ID</dt><dd className="inline-scroll-value">{selectedAd.meta_campaign_id || "미연동"}</dd></div>
                      <div><dt>Meta 상태</dt><dd>{formatAdMetaStatus(selectedAd.meta_status)}</dd></div>
                    </dl>
                    <div className="ad-creative-row">
                      <strong>광고 소재</strong>
                      <AdCreativePreview ad={selectedAd} />
                    </div>
                    <form className="ad-memo-form" action={setAdminSubjectAdMemoAction}>
                      <input type="hidden" name="adId" value={selectedAd.id} />
                      <input type="hidden" name="returnTo" value={selectedAdReturnTo} />
                      <label>
                        메모
                        <textarea name="adminMemo" maxLength="2000" defaultValue={selectedAd.admin_memo || ""} placeholder="광고 운영 메모" />
                      </label>
                      <FormSubmitButton className="plain-button compact" pendingText="저장중">수정</FormSubmitButton>
                    </form>
                  </section>
                  <section className="guardian-tab-panel">
                    <dl className="guardian-detail-list">
                      <div><dt>도달수</dt><dd>{formatMetricValue(selectedAd.display_reach_count)}</dd></div>
                      <div><dt>노출수</dt><dd>{formatMetricValue(selectedAd.display_impression_count)}</dd></div>
                      <div><dt>클릭수</dt><dd>{formatMetricValue(selectedAd.click_count)}</dd></div>
                      <div><dt>클릭비용</dt><dd>{formatCurrency(calculateAdClickCost(selectedAd))}</dd></div>
                      <div><dt>CTR</dt><dd>{formatPercent(calculateAdCtr(selectedAd))}</dd></div>
                      <div><dt>지출금액</dt><dd>{formatCurrency(displayAdSpentAmount(selectedAd))}</dd></div>
                      <div><dt>연락 수</dt><dd>{formatMetricValue(selectedAd.display_contact_count)}</dd></div>
                    </dl>
                  </section>
                  <section className="guardian-tab-panel">
                    <div className="admin-record-table-wrap ad-spend-table-wrap">
                      <div className="admin-record-table ad-spend-table" role="table" aria-label="광고 지출 내역">
                        <div className="admin-record-header" role="row">
                          <span role="columnheader">지출일시</span>
                          <span role="columnheader">광고기간</span>
                          <span role="columnheader">광고지역</span>
                          <span role="columnheader">광고금액</span>
                          <span role="columnheader">결제수단</span>
                          <span role="columnheader">영수증</span>
                        </div>
                        {selectedSpendHistory.map((item) => (
                          <div className="admin-record-row" role="row" key={item.id}>
                            <time role="cell">{formatRecentDateTime(item.created_at)}</time>
                            <span role="cell">{formatDate(item.start_date)} ~ {formatDate(item.end_date)}</span>
                            <span role="cell">{item.region || "-"}</span>
                            <span role="cell">{formatCurrency(item.amount)}</span>
                            <span role="cell">광고 결제 준비</span>
                            <Link role="cell" href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(formatAdNumber(item))}`}>다음</Link>
                          </div>
                        ))}
                        {selectedSpendHistory.length === 0 && <p className="empty-text">지출 내역이 없습니다.</p>}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">광고를 선택해 주세요.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function AdAvatar({ ad }) {
  if (ad?.subject_photo_data_url) {
    return <img className="subject-detail-avatar ad-detail-avatar" src={ad.subject_photo_data_url} alt={`${ad.subject_name || "관리대상"} 사진`} />;
  }
  return (
    <span className="subject-detail-avatar ad-detail-avatar" aria-hidden="true">
      <span>{String(ad?.subject_name || "대").slice(0, 1)}</span>
    </span>
  );
}

function AdCreativePreview({ ad }) {
  return (
    <div className="ad-creative-preview">
      <strong>실종자 발견제보</strong>
      <span>{ad.subject_name || "관리대상"}</span>
      <small>{ad.region || "광고지역 미입력"}</small>
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
  const { plans, payments, selectedPayment, selectedRefunds, summary, filters } = paymentData;
  const selectedPaymentReturnTo = buildPaymentListUrl(filters, selectedPayment?.payment_row_id);
  const refundableAmount = paymentRefundableAmount(selectedPayment);
  const summaryCards = [
    { label: "총 매출액", value: summary.totalRevenue, icon: "money", hint: "전체 결제완료" },
    { label: "주문 매출", value: summary.orderRevenue, icon: "linked", hint: "상품 단독구매" },
    { label: "구독 매출", value: summary.subscriptionRevenue, icon: "check", hint: "기간 구독" },
    { label: "광고 매출", value: summary.adRevenue, icon: "megaphone", hint: "온라인 광고" },
    { label: "취소/환불 비용", value: summary.refundAmount, icon: "blocked", hint: "접수/완료 합산" },
  ];

  return (
    <div className="payment-admin-page">
      <section className="payment-admin-status" aria-label="결제 현황">
        <h2>현황</h2>
        <div className="payment-stat-grid">
          {summaryCards.map((card) => (
            <article className="guardian-stat-card payment-stat-card" key={card.label}>
              <DashboardIcon name={card.icon} />
              <div>
                <h3>{card.label}</h3>
                <strong>{formatCurrency(card.value)}</strong>
                <span>{card.hint}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel payment-search-panel">
        <h3>조회</h3>
        <form className="payment-search-form" action="/admin">
          <input type="hidden" name="section" value="payments" />
          <label>
            검색어
            <input
              name="paymentLedgerQuery"
              defaultValue={filters.query}
              placeholder="번호, 이름"
            />
          </label>
          <label className="compact-select-label">
            거래구분
            <select name="paymentLedgerType" defaultValue={filters.type}>
              <option value="all">전체</option>
              <option value="order">주문</option>
              <option value="subscription">구독</option>
              <option value="ad">광고</option>
            </select>
          </label>
          <label className="compact-select-label">
            결제상태
            <select name="paymentLedgerStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="paid">결제완료</option>
              <option value="pending">결제대기</option>
              <option value="cancelled">결제취소</option>
              <option value="refunded">환불접수</option>
              <option value="failed">결제실패</option>
            </select>
          </label>
          <div className="payment-date-filter">
            <span>기간</span>
            <input type="date" name="paymentStart" defaultValue={filters.startDate} />
            <em>~</em>
            <input type="date" name="paymentEnd" defaultValue={filters.endDate} />
          </div>
          <div className="payment-search-actions">
            <Link className="plain-button" href="/admin?section=payments">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail payment-admin-layout">
        <section className="admin-panel guardian-list-panel payment-list-panel">
          <div className="guardian-list-heading">
            <h2>전체 <b>{formatMetricValue(payments.length)}</b>건</h2>
            <div className="admin-heading-actions">
              <AdminExportButton filename="zezari-payments.csv" rows={paymentExportRows(payments)} />
            </div>
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap">
            <div className="admin-record-table guardian-admin-table payment-record-table" role="table" aria-label="결제 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">선택</span>
                <span role="columnheader">주문/구독/광고 번호</span>
                <span role="columnheader">거래구분</span>
                <span role="columnheader">대상자(보호자)</span>
                <span role="columnheader">거래일시</span>
                <span role="columnheader">금액</span>
                <span role="columnheader">결제상태</span>
                <span role="columnheader">관리</span>
              </div>
              {payments.map((payment) => {
                const isSelected = selectedPayment?.payment_row_id === payment.payment_row_id;
                return (
                  <div className={`admin-record-row ${isSelected ? "selected" : ""}`} role="row" key={payment.payment_row_id}>
                    <span role="cell" className="admin-row-selector">{isSelected ? "⊙" : "□"}</span>
                    <strong role="cell">{formatPaymentNumber(payment)}</strong>
                    <span role="cell">
                      <b className={`admin-status-chip payment-kind-chip ${payment.payment_kind}`}>{paymentTypeLabel(payment)}</b>
                    </span>
                    <span role="cell" className="payment-record-party">
                      <strong>{payment.subject_name || "대상자 미선택"}</strong>
                      <small>{payment.guardian_name || "보호자 미입력"}</small>
                    </span>
                    <time role="cell">{formatRecentDateTime(payment.payment_date)}</time>
                    <span role="cell">{formatCurrency(payment.amount)}</span>
                    <span role="cell">
                      <b className={`order-state ${paymentStateClass(payment.payment_state)}`}>{paymentStatusLabel(payment.payment_state)}</b>
                    </span>
                    <Link role="cell" className="admin-row-detail" href={buildPaymentListUrl(filters, payment.payment_row_id)}>
                      상세보기
                    </Link>
                  </div>
                );
              })}
              {payments.length === 0 && <p className="empty-text">조건에 맞는 결제내역이 없습니다.</p>}
            </div>
          </div>
          <div className="admin-table-footer">
            <span>선택한 결제 {selectedPayment ? "1" : "0"}건</span>
            <select aria-label="페이지당 표시 개수" defaultValue="10">
              <option>10개씩 보기</option>
              <option>20개씩 보기</option>
              <option>50개씩 보기</option>
            </select>
          </div>
        </section>

        <aside className="admin-panel payment-detail-panel">
          <h2>상세 정보</h2>
          {selectedPayment ? (
            <>
              <section className="admin-detail-section payment-detail-section">
                <h3>결제 정보</h3>
                <dl className="admin-detail-list">
                  <div>
                    <dt>주문/구독/광고 번호</dt>
                    <dd>{formatPaymentNumber(selectedPayment)}</dd>
                  </div>
                  <div>
                    <dt>거래 구분</dt>
                    <dd>{paymentTypeLabel(selectedPayment)}</dd>
                  </div>
                  <div>
                    <dt>거래 상품</dt>
                    <dd>{selectedPayment.payment_item || "-"}</dd>
                  </div>
                  <div>
                    <dt>거래 일시</dt>
                    <dd>{formatRecentDateTime(selectedPayment.payment_date)}</dd>
                  </div>
                  <div>
                    <dt>거래 금액</dt>
                    <dd>{formatCurrency(selectedPayment.amount)}</dd>
                  </div>
                  <div>
                    <dt>결제 상태</dt>
                    <dd><b className={`order-state ${paymentStateClass(selectedPayment.payment_state)}`}>{paymentStatusLabel(selectedPayment.payment_state)}</b></dd>
                  </div>
                  <div>
                    <dt>결제 수단</dt>
                    <dd>{selectedPayment.payment_method || "-"}</dd>
                  </div>
                  <div>
                    <dt>환불 금액</dt>
                    <dd>{formatCurrency(selectedPayment.refund_amount)}</dd>
                  </div>
                </dl>
              </section>

              <section className="admin-detail-section payment-detail-section">
                <h3>대상자정보</h3>
                <dl className="admin-detail-list">
                  <div>
                    <dt>대상자</dt>
                    <dd>{selectedPayment.subject_name || "대상자 미선택"}</dd>
                  </div>
                  <div>
                    <dt>보호자</dt>
                    <dd>{selectedPayment.guardian_name || "보호자 미입력"}</dd>
                  </div>
                  <div>
                    <dt>연락처</dt>
                    <dd>{selectedPayment.guardian_phone || "-"}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{selectedPayment.guardian_email || "-"}</dd>
                  </div>
                </dl>
              </section>

              {selectedRefunds.length > 0 && (
                <section className="admin-detail-section payment-detail-section">
                  <h3>취소/환불 이력</h3>
                  <div className="payment-refund-history">
                    {selectedRefunds.map((refund) => (
                      <article key={refund.id}>
                        <strong>{formatCurrency(refund.amount)}</strong>
                        <span>{refund.reason}</span>
                        <time>{formatRecentDateTime(refund.created_at)}</time>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <div className="payment-detail-actions">
                <input className="payment-refund-toggle" type="checkbox" id="payment-refund-modal" />
                <label className="primary-button compact" htmlFor="payment-refund-modal">
                  취소/환불
                </label>
                <div className="payment-refund-modal-backdrop">
                  <label className="payment-refund-modal-scrim" htmlFor="payment-refund-modal" aria-label="취소/환불 팝업 닫기" />
                  <section className="payment-refund-modal" role="dialog" aria-modal="true" aria-labelledby="payment-refund-title">
                    <h2 id="payment-refund-title">취소/환불</h2>
                    <form action={createAdminPaymentRefundAction} className="payment-refund-form">
                      <input type="hidden" name="paymentKind" value={selectedPayment.payment_kind} />
                      <input type="hidden" name="paymentId" value={selectedPayment.id} />
                      <input type="hidden" name="returnTo" value={selectedPaymentReturnTo} />
                      <label>
                        거래 구분
                        <select defaultValue={paymentTypeLabel(selectedPayment)} disabled>
                          <option>{paymentTypeLabel(selectedPayment)}</option>
                        </select>
                      </label>
                      <label>
                        환불 금액
                        <input name="refundAmount" type="number" min="1" step="1" defaultValue={refundableAmount} disabled={refundableAmount <= 0} />
                      </label>
                      <label>
                        환불 사유
                        <textarea name="refundReason" rows="3" placeholder="내용 입력" required />
                      </label>
                      <div className="payment-refund-actions">
                        <label className="plain-button" htmlFor="payment-refund-modal">닫기</label>
                        <FormSubmitButton className="primary-button compact" pendingText="처리중" disabled={refundableAmount <= 0}>
                          환불하기
                        </FormSubmitButton>
                      </div>
                      <p>현재 버튼은 운영 기록과 상태 변경을 수행합니다. 실제 토스 결제 취소 API는 별도 승인 후 연결합니다.</p>
                    </form>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">결제내역을 선택해 주세요.</p>
          )}
        </aside>
      </div>

      <section className="admin-panel payment-plan-section">
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

function CouponManagementSection({ couponsData }) {
  const { coupons, selectedCoupon, selectedCouponId, summary, filters } = couponsData;
  const isCreating = selectedCouponId === "new" || !selectedCoupon;
  const editingCoupon = selectedCoupon || {};
  const returnTo = buildCouponListUrl(filters, isCreating ? "new" : editingCoupon.id);
  const visibleRows = Math.max(0, 12 - coupons.length);

  return (
    <div className="coupon-admin-page">
      <section className="admin-panel coupon-search-panel">
        <h2>조회</h2>
        <form className="coupon-search-form" action="/admin">
          <input type="hidden" name="section" value="coupons" />
          <label>
            검색어
            <input name="couponQuery" defaultValue={filters.query} placeholder="쿠폰번호, 쿠폰 코드" />
          </label>
          <label>
            할인 유형
            <select name="couponDiscountType" defaultValue={filters.discountType}>
              <option value="all">전체</option>
              <option value="percent">정률</option>
              <option value="fixed">정액</option>
            </select>
          </label>
          <label>
            상태
            <select name="couponStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="active">사용 가능</option>
              <option value="inactive">사용 불가능</option>
            </select>
          </label>
          <div className="coupon-search-actions">
            <Link className="plain-button" href="/admin?section=coupons">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail coupon-admin-layout">
        <section className="admin-panel guardian-list-panel coupon-list-panel">
          <div className="guardian-list-heading">
            <h2>전체 <b>{formatMetricValue(summary.total)}</b>건</h2>
            <div className="admin-heading-actions">
              <AdminExportButton filename="zezari-coupons.csv" rows={couponExportRows(coupons)} />
            </div>
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap">
            <div className="admin-record-table guardian-admin-table coupon-record-table" role="table" aria-label="쿠폰 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">선택</span>
                <span role="columnheader">쿠폰번호</span>
                <span role="columnheader">쿠폰 코드</span>
                <span role="columnheader">할인 유형</span>
                <span role="columnheader">할인 금액</span>
                <span role="columnheader">할인 내용</span>
                <span role="columnheader">유효 기간</span>
                <span role="columnheader">발행 수</span>
                <span role="columnheader">사용 수</span>
                <span role="columnheader">상태</span>
                <span role="columnheader">관리</span>
              </div>
              {coupons.map((coupon) => {
                const isSelected = selectedCoupon?.id === coupon.id && !isCreating;
                return (
                  <div className={`admin-record-row ${isSelected ? "selected" : ""}`} role="row" key={coupon.id}>
                    <span role="cell" className="admin-row-selector">{isSelected ? "⊙" : "□"}</span>
                    <strong role="cell">{coupon.coupon_number || formatCouponNumber(coupon)}</strong>
                    <span role="cell">{coupon.code}</span>
                    <span role="cell">
                      <b className={`coupon-type-chip ${coupon.discount_type}`}>{couponDiscountTypeLabel(coupon.discount_type)}</b>
                    </span>
                    <span role="cell">{couponDiscountValueLabel(coupon)}</span>
                    <span role="cell">{coupon.description || coupon.discount_label || "-"}</span>
                    <time role="cell">{formatCouponPeriod(coupon)}</time>
                    <span role="cell">{formatMetricValue(coupon.issued_count)} / {formatMetricValue(coupon.issue_limit)}</span>
                    <span role="cell">{formatMetricValue(coupon.used_count)}</span>
                    <span role="cell">
                      <b className={`coupon-status-chip ${coupon.status}`}>{couponStatusLabel(coupon.status)}</b>
                    </span>
                    <Link role="cell" className="admin-row-detail" href={buildCouponListUrl(filters, coupon.id)}>
                      상세보기
                    </Link>
                  </div>
                );
              })}
              {Array.from({ length: visibleRows }).map((_, index) => (
                <div className="admin-record-row placeholder" role="row" key={`coupon-empty-${index}`}>
                  {Array.from({ length: 11 }).map((__, columnIndex) => (
                    <span role="cell" key={columnIndex}> </span>
                  ))}
                </div>
              ))}
              {coupons.length === 0 && <p className="empty-text">조건에 맞는 쿠폰이 없습니다.</p>}
            </div>
          </div>
          <div className="admin-table-footer coupon-table-footer">
            <span>선택한 쿠폰 {isCreating ? "0" : "1"}건</span>
            <select aria-label="페이지당 표시 개수" defaultValue="10">
              <option>10개씩 보기</option>
              <option>20개씩 보기</option>
              <option>50개씩 보기</option>
            </select>
          </div>
          <div className="coupon-create-action">
            <Link className="primary-button compact" href={buildCouponListUrl(filters, "new")}>+ 새 쿠폰</Link>
          </div>
        </section>

        <aside className="admin-panel coupon-detail-panel">
          <h2>{isCreating ? "쿠폰 등록" : "쿠폰 수정"}</h2>
          <form action={saveAdminCouponAction} className="coupon-detail-form">
            <input type="hidden" name="couponId" value={isCreating ? "" : editingCoupon.id || ""} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <section>
              <h3>기본 설정</h3>
              <fieldset className="coupon-code-mode">
                <legend>쿠폰코드</legend>
                <label>
                  <input name="codeMode" type="radio" value="random" defaultChecked={!editingCoupon.code || editingCoupon.code_mode === "random"} />
                  <span>랜덤생성</span>
                </label>
                <label>
                  <input name="codeMode" type="radio" value="manual" defaultChecked={Boolean(editingCoupon.code && editingCoupon.code_mode !== "random")} />
                  <span>직접 입력</span>
                </label>
              </fieldset>
              <input name="couponCode" defaultValue={editingCoupon.code || ""} placeholder="쿠폰코드" />
              <label>
                할인 유형
                <select name="discountType" defaultValue={editingCoupon.discount_type || "percent"}>
                  <option value="percent">정률</option>
                  <option value="fixed">정액</option>
                </select>
              </label>
              <label>
                할인금액
                <input name="discountValue" type="number" min="1" step="1" defaultValue={editingCoupon.discount_value || 100} />
              </label>
              <label>
                할인 내용
                <input name="description" defaultValue={editingCoupon.description || ""} placeholder="제한없음" />
              </label>
              <div className="coupon-date-pair">
                <label>
                  유효기간
                  <input name="startDate" type="date" defaultValue={editingCoupon.start_date || "2026-01-01"} />
                </label>
                <span>~</span>
                <label>
                  <span className="sr-only">유효기간 종료일</span>
                  <input name="endDate" type="date" defaultValue={editingCoupon.end_date || "2026-12-31"} />
                </label>
              </div>
            </section>

            <section>
              <h3>발행 설정</h3>
              <label>
                최소 금액
                <input name="minOrderAmount" type="number" min="0" step="100" defaultValue={editingCoupon.min_order_amount || 0} />
              </label>
              <label>
                최대 금액
                <input name="maxDiscountAmount" type="number" min="0" step="100" defaultValue={editingCoupon.max_discount_amount || 0} />
              </label>
              <label>
                적용 서비스
                <select name="serviceScope" defaultValue={editingCoupon.service_scope || "all"}>
                  <option value="all">전체</option>
                  <option value="subscription">구독</option>
                  <option value="sticker">스티커</option>
                  <option value="bracelet">팔찌</option>
                  <option value="necklace">목걸이</option>
                  <option value="keyring">키링</option>
                  <option value="ad">광고</option>
                </select>
              </label>
              <label>
                발행수량
                <input name="issueLimit" type="number" min="0" step="1" defaultValue={editingCoupon.issue_limit || 100} />
              </label>
              <label>
                1인당 사용 제한
                <select name="perUserLimit" defaultValue={editingCoupon.per_user_limit || 1}>
                  <option value="1">1회</option>
                  <option value="2">2회</option>
                  <option value="3">3회</option>
                </select>
              </label>
              <label>
                메모
                <textarea name="adminMemo" rows="2" defaultValue={editingCoupon.admin_memo || ""} />
              </label>
            </section>

            <section>
              <h3>상태 설정</h3>
              <div className="coupon-status-options">
                <label>
                  <input name="status" type="radio" value="active" defaultChecked={(editingCoupon.status || "active") === "active"} />
                  <span>사용 가능</span>
                </label>
                <label>
                  <input name="status" type="radio" value="inactive" defaultChecked={editingCoupon.status === "inactive"} />
                  <span>사용 불가능</span>
                </label>
              </div>
            </section>

            <FormSubmitButton className="primary-button compact" pendingText="저장중">
              저장
            </FormSubmitButton>
          </form>
        </aside>
      </div>
    </div>
  );
}

function SubscriptionManagementSection({ subscriptionsData }) {
  const { summary, subscriptions, selectedSubscription, selectedOrders, plans, filters } = subscriptionsData;
  const returnTo = buildSubscriptionListUrl(filters, selectedSubscription?.subscription_id);
  const summaryCards = [
    { label: "전체 구독", value: summary.total, icon: "money" },
    { label: "구독중", value: summary.active, icon: "person" },
    { label: "일시정지", value: summary.paused, icon: "blocked" },
    { label: "취소 / 환불", value: summary.cancelledRefund, icon: "blocked" },
  ];
  const selectedTabName = selectedSubscription ? `subscription-tab-${selectedSubscription.subscription_id}` : "subscription-tab-empty";

  return (
    <div className="subscription-admin-page">
      <section className="subscription-admin-status" aria-label="구독 현황">
        <h2>구독관리</h2>
        <div className="subscription-stat-grid">
          {summaryCards.map((card) => (
            <article className="guardian-stat-card subscription-stat-card" key={card.label}>
              <DashboardIcon name={card.icon} />
              <div>
                <h3>{card.label}</h3>
                <strong>{formatMetricValue(card.value)} 건</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel subscription-search-panel">
        <h3>검색</h3>
        <form className="subscription-search-form" action="/admin">
          <input type="hidden" name="section" value="subscriptions" />
          <label>
            검색어
            <input
              name="subscriptionQuery"
              defaultValue={filters.query}
              placeholder="구독번호, 대상자명, 보호자명"
            />
          </label>
          <label>
            구독상품
            <select name="subscriptionPlan" defaultValue={filters.plan}>
              <option value="all">전체</option>
              {plans.map((plan) => (
                <option value={String(plan.months)} key={plan.months}>{plan.name || `${plan.months}개월`}</option>
              ))}
            </select>
          </label>
          <label>
            구독상태
            <select name="subscriptionStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="active">구독중</option>
              <option value="ready">QR활성화 대기</option>
              <option value="paused">일시정지</option>
              <option value="expired">만료</option>
              <option value="cancelled">취소</option>
            </select>
          </label>
          <label>
            결제상태
            <select name="subscriptionPayment" defaultValue={filters.payment}>
              <option value="all">전체</option>
              <option value="paid">결제완료</option>
              <option value="pending">결제대기</option>
              <option value="failed">결제실패</option>
            </select>
          </label>
          <div className="subscription-date-filter">
            <span>구독기간</span>
            <input type="date" name="subscriptionStart" defaultValue={filters.startDate} />
            <em>~</em>
            <input type="date" name="subscriptionEnd" defaultValue={filters.endDate} />
          </div>
          <div className="subscription-search-actions">
            <Link className="plain-button" href="/admin?section=subscriptions">초기화</Link>
            <button type="submit">검색</button>
          </div>
        </form>
      </section>

      <div className="admin-master-detail subscription-admin-layout">
        <section className="admin-panel guardian-list-panel subscription-list-panel">
          <div className="guardian-list-heading">
            <h2>조회</h2>
            <div className="admin-heading-actions">
              <span>{subscriptions.length}건 조회</span>
              <AdminExportButton filename="zezari-subscriptions.csv" rows={subscriptionExportRows(subscriptions)} />
            </div>
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap">
            <div className="admin-record-table guardian-admin-table subscription-admin-table" role="table" aria-label="구독 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">선택</span>
                <span role="columnheader">구독번호</span>
                <span role="columnheader">대상자(보호자)</span>
                <span role="columnheader">구독상품</span>
                <span role="columnheader">구독기간</span>
                <span role="columnheader">다음결제일</span>
                <span role="columnheader">금액</span>
                <span role="columnheader">구독상태</span>
                <span role="columnheader">결제상태</span>
                <span role="columnheader">관리</span>
              </div>
              {subscriptions.map((subscription) => (
                <Link
                  className={`admin-record-row ${selectedSubscription?.subscription_id === subscription.subscription_id ? "active" : ""}`}
                  href={buildSubscriptionListUrl(filters, subscription.subscription_id)}
                  key={subscription.subscription_id}
                  role="row"
                >
                  <span className="admin-row-selector" role="cell">
                    {selectedSubscription?.subscription_id === subscription.subscription_id ? "◎" : "□"}
                  </span>
                  <strong className="inline-scroll-value" role="cell">{formatSubscriptionNumber(subscription)}</strong>
                  <span className="order-record-party" role="cell">
                    <strong>{subscription.subject_name || "대상자 미선택"}</strong>
                    <small>{subscription.guardian_name || "보호자 미입력"}</small>
                  </span>
                  <span role="cell">{subscriptionPlanLabel(subscription)}</span>
                  <span role="cell">{formatSubscriptionPeriod(subscription)}</span>
                  <span role="cell">{formatDate(subscription.current_period_end)}</span>
                  <span role="cell">{formatCurrency(subscription.amount)}</span>
                  <em className={`subscription-state ${subscriptionAdminStateClass(subscription.status)}`} role="cell">
                    {subscriptionStatusLabel(subscription.status)}
                  </em>
                  <em className={`order-state ${paymentStateClass(subscription.latest_order_status)}`} role="cell">
                    {paymentStatusLabel(subscription.latest_order_status)}
                  </em>
                  <span className="admin-row-detail" role="cell">상세보기</span>
                </Link>
              ))}
              {subscriptions.length === 0 && <p className="empty-text">조건에 맞는 구독이 없습니다.</p>}
            </div>
          </div>
          <div className="guardian-list-footer">
            <span>선택한 구독 {selectedSubscription ? "1건" : "0건"}</span>
            <select defaultValue="10" aria-label="페이지당 표시 건수">
              <option>10개씩 보기</option>
            </select>
          </div>
        </section>

        <aside className="admin-panel guardian-detail-card subscription-detail-card">
          {selectedSubscription ? (
            <>
              <div className="guardian-detail-header subscription-detail-header">
                <SubscriptionAvatar subscription={selectedSubscription} />
                <div>
                  <h2>{selectedSubscription.subject_name || "대상자 미선택"}</h2>
                  <span>{subscriptionPlanLabel(selectedSubscription)}</span>
                  <span>{formatSubscriptionPeriod(selectedSubscription)}</span>
                  <em className={`guardian-status-pill ${subscriptionAdminStateClass(selectedSubscription.status)}`}>
                    {subscriptionStatusLabel(selectedSubscription.status)}
                  </em>
                </div>
              </div>
              <div className="guardian-detail-tabset">
                <input className="guardian-tab-radio" type="radio" name={selectedTabName} id={`${selectedTabName}-base`} defaultChecked />
                <input className="guardian-tab-radio" type="radio" name={selectedTabName} id={`${selectedTabName}-payments`} />
                <div className="guardian-detail-tabs">
                  <label htmlFor={`${selectedTabName}-base`}>기본정보</label>
                  <label htmlFor={`${selectedTabName}-payments`}>결제내역</label>
                </div>
                <div className="guardian-tab-panels">
                  <div className="guardian-tab-panel">
                    <section className="guardian-detail-section">
                      <div className="subscription-section-heading">
                        <h3 className="guardian-tab-section-title">대상자정보</h3>
                        {selectedSubscription.subject_id && (
                          <Link href={`/admin?section=subjects&subject=${encodeURIComponent(selectedSubscription.subject_id)}`}>상세보기 &gt;</Link>
                        )}
                      </div>
                      <dl className="guardian-detail-list">
                        <div><dt>대상자명</dt><dd>{selectedSubscription.subject_name || "대상자 미선택"}</dd></div>
                        <div><dt>생년월일</dt><dd>{formatDate(selectedSubscription.subject_birth_date)}</dd></div>
                        <div><dt>보호자명</dt><dd>{selectedSubscription.guardian_name || "보호자 미입력"}</dd></div>
                        <div><dt>연락처</dt><dd>{selectedSubscription.guardian_phone || "연락처 미입력"}</dd></div>
                      </dl>
                    </section>
                    <section className="guardian-detail-section">
                      <div className="subscription-section-heading">
                        <h3 className="guardian-tab-section-title">구독정보</h3>
                        <Link href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(formatSubscriptionNumber(selectedSubscription))}`}>상세보기 &gt;</Link>
                      </div>
                      <dl className="guardian-detail-list">
                        <div><dt>구독상품</dt><dd>{subscriptionPlanLabel(selectedSubscription)}</dd></div>
                        <div><dt>구독기간</dt><dd>{formatSubscriptionPeriod(selectedSubscription)}</dd></div>
                        <div><dt>다음결제일</dt><dd>{formatDate(selectedSubscription.current_period_end)}</dd></div>
                        <div><dt>구독상태</dt><dd>{subscriptionStatusLabel(selectedSubscription.status)}</dd></div>
                        <div><dt>결제상태</dt><dd>{paymentStatusLabel(selectedSubscription.latest_order_status)}</dd></div>
                        <div><dt>금액</dt><dd>{formatCurrency(selectedSubscription.amount)}</dd></div>
                      </dl>
                      <form className="subscription-memo-form" action={setSubscriptionAdminMemoAction}>
                        <input type="hidden" name="subscriptionId" value={selectedSubscription.subscription_id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <label>
                          메모
                          <textarea name="adminMemo" defaultValue={selectedSubscription.admin_memo || ""} placeholder="구독 운영 메모" />
                        </label>
                        <FormSubmitButton className="plain-button compact" pendingText="저장중">메모저장</FormSubmitButton>
                      </form>
                    </section>
                  </div>
                  <div className="guardian-tab-panel">
                    <section className="guardian-detail-section">
                      <div className="subscription-section-heading">
                        <h3 className="guardian-tab-section-title">결제 내역</h3>
                        <Link href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(selectedSubscription.guardian_name || "")}`}>상세보기 &gt;</Link>
                      </div>
                      <div className="subscription-payment-list">
                        {selectedOrders.map((order) => (
                          <article className="subscription-payment-card" key={order.id}>
                            <dl className="guardian-detail-list">
                              <div><dt>결제 일시</dt><dd>{formatDateTime(order.paid_at || order.updated_at || order.created_at)}</dd></div>
                              <div><dt>결제 상품</dt><dd>{order.product_name || subscriptionPlanLabel(order)}</dd></div>
                              <div><dt>결제 금액</dt><dd>{formatCurrency(order.amount)}</dd></div>
                              <div><dt>결제 수단</dt><dd>{order.payment_method || "결제위젯"}</dd></div>
                              <div><dt>결제 상태</dt><dd>{paymentStatusLabel(order.status)}</dd></div>
                              <div><dt>구독번호</dt><dd className="inline-scroll-value">{formatSubscriptionNumber(selectedSubscription)}</dd></div>
                              <div><dt>영수증</dt><dd><Link className="plain-button compact" href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(order.payment_number || order.id)}`}>조회</Link></dd></div>
                            </dl>
                          </article>
                        ))}
                        {selectedOrders.length === 0 && <p className="empty-text">구독 결제내역이 없습니다.</p>}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">조회된 구독이 없습니다. 검색 조건을 변경해 주세요.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function SubscriptionAvatar({ subscription }) {
  const photoSrc = subscription?.subject_photo_data_url;
  if (photoSrc) {
    return <img className="subscription-avatar" src={photoSrc} alt={`${subscription.subject_name || "대상자"} 사진`} />;
  }
  return (
    <div className="subscription-avatar empty" aria-hidden="true">
      <span />
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
            <ProductAdminCatalogForm product={product} key={product.id} />
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
  const { summary, guardians, selectedGuardian, subjects, subscription, payments, ads, activities, filters } = adminData;
  const returnTo = buildGuardianAdminUrl(filters, selectedGuardian?.id);
  const selectedGuardianType = guardianTypeLabel(selectedGuardian, subscription);
  const visibleRows = Math.max(0, 12 - guardians.length);
  const guardianTabName = selectedGuardian ? `guardian-detail-tab-${selectedGuardian.id}` : "guardian-detail-tab";

  return (
    <div className="guardian-admin-page">
      <section className="guardian-admin-status" aria-labelledby="guardian-status-title">
        <h2 id="guardian-status-title">현황</h2>
        <div className="guardian-stat-grid">
          <GuardianStatCard
            icon="people"
            title="전체 보호자"
            value={formatCountWithUnit(summary.totalGuardians, "명")}
          />
          <GuardianStatCard
            icon="growth"
            title="신규 보호자"
            value={formatCountWithUnit(summary.newGuardiansToday, "명")}
            note={formatDeltaText(summary.newGuardiansToday, summary.newGuardiansYesterday, "명", "어제 대비")}
            noteTone={Number(summary.newGuardiansToday || 0) >= Number(summary.newGuardiansYesterday || 0) ? "positive" : "negative"}
          />
          <GuardianStatCard
            icon="linked"
            title="대상자 등록"
            value={formatCountWithUnit(summary.registeredGuardians, "명")}
            note={`전체 보호자 ${safePercent(summary.registeredGuardians, summary.totalGuardians).toFixed(0)}%`}
            noteTone="positive"
          />
          <GuardianStatCard
            icon="blocked"
            title="대상자 미등록"
            value={formatCountWithUnit(summary.unregisteredGuardians, "명")}
            note={`전체 보호자 ${safePercent(summary.unregisteredGuardians, summary.totalGuardians).toFixed(0)}%`}
            noteTone={Number(summary.unregisteredGuardians || 0) > 0 ? "negative" : "neutral"}
          />
        </div>
      </section>

      <section className="admin-panel guardian-search-panel">
        <h2>조회</h2>
        <form action="/admin" className="guardian-admin-filter">
          <input type="hidden" name="section" value="guardians" />
          <label>
            검색어
            <input name="guardianAdminQuery" defaultValue={filters.query} placeholder="이름, 연락처" />
          </label>
          <label>
            상태
            <select name="guardianStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">휴면/비활성</option>
            </select>
          </label>
          <label>
            구분
            <select name="guardianType" defaultValue={filters.type}>
              <option value="all">전체</option>
              <option value="vip">VIP</option>
              <option value="normal">일반</option>
              <option value="admin">관리자</option>
            </select>
          </label>
          <fieldset className="guardian-filter-date">
            <legend>가입일</legend>
            <input type="date" name="guardianStart" defaultValue={filters.startDate} aria-label="가입 시작일" />
            <span>~</span>
            <input type="date" name="guardianEnd" defaultValue={filters.endDate} aria-label="가입 종료일" />
          </fieldset>
          <Link className="plain-button guardian-reset-button" href="/admin?section=guardians">초기화</Link>
          <button type="submit">검색</button>
        </form>
      </section>

      <div className="guardian-admin-layout">
        <section className="admin-panel guardian-list-panel">
          <div className="guardian-list-heading">
            <h2>전체 보호자 <strong>{formatMetricValue(summary.totalGuardians)}</strong>명</h2>
            <AdminExportButton filename="zezari-guardians.csv" rows={guardianExportRows(guardians)} />
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap">
            <div className="admin-record-table guardian-record-table guardian-admin-table" role="table" aria-label="보호자 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">□</span>
                <span role="columnheader">이름</span>
                <span role="columnheader">아이디</span>
                <span role="columnheader">연락처</span>
                <span role="columnheader">생년월일</span>
                <span role="columnheader">성별</span>
                <span role="columnheader">보호자상태</span>
                <span role="columnheader">보호자 구분</span>
                <span role="columnheader">가입일</span>
                <span role="columnheader">관리</span>
              </div>
              {guardians.map((guardian) => (
                <Link
                  className={guardian.id === selectedGuardian?.id ? "admin-record-row active" : "admin-record-row"}
                  href={buildGuardianAdminUrl(filters, guardian.id)}
                  key={guardian.id}
                  role="row"
                >
                  <span role="cell">{guardian.id === selectedGuardian?.id ? "◉" : "□"}</span>
                  <strong role="cell">{guardian.name || "이름 미입력"}<small>{formatMemberNumber(guardian.id)}</small></strong>
                  <span role="cell">{guardian.login_id || providerLoginLabel(guardian) || "-"}</span>
                  <span role="cell">{guardian.phone || "-"}</span>
                  <span role="cell">{formatDate(guardian.birth_date)}{guardian.birth_date ? <small>{calculateAgeLabel(guardian.birth_date)}</small> : null}</span>
                  <span role="cell">-</span>
                  <em role="cell" className={`guardian-table-badge ${Number(guardian.is_active || 0) ? "active" : "inactive"}`}>
                    {Number(guardian.is_active || 0) ? "일반" : "휴면"}
                  </em>
                  <em role="cell" className={`guardian-table-badge ${guardianTypeClass(guardian)}`}>
                    {guardianTypeLabel(guardian)}
                  </em>
                  <time role="cell">{formatDateOnlyValue(guardian.created_at)}</time>
                  <span role="cell">상세보기</span>
                </Link>
              ))}
              {guardians.length > 0 && Array.from({ length: visibleRows }, (_, index) => (
                <div className="admin-record-row guardian-empty-row" role="row" key={`guardian-empty-${index}`}>
                  {Array.from({ length: 10 }, (_, cellIndex) => <span role="cell" key={`guardian-empty-${index}-${cellIndex}`}>&nbsp;</span>)}
                </div>
              ))}
              {guardians.length === 0 && (
                <div className="admin-record-row guardian-empty-result" role="row">
                  <span role="cell">조건에 맞는 보호자가 없습니다.</span>
                </div>
              )}
            </div>
          </div>
          <div className="guardian-list-footer">
            <span>선택한 보호자 {selectedGuardian ? "1" : "0"}명</span>
            <label>
              <select defaultValue="10" aria-label="페이지당 보호자 수">
                <option value="10">10개씩 보기</option>
                <option value="20">20개씩 보기</option>
                <option value="50">50개씩 보기</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-panel guardian-detail-card">
          {selectedGuardian ? (
            <>
              <div className="guardian-detail-header">
                <div className="guardian-avatar" aria-hidden="true">
                  {guardianInitial(selectedGuardian)}
                </div>
                <div>
                  <h2>{selectedGuardian.name || "이름 미입력"} <small>({formatMemberNumber(selectedGuardian.id)})</small></h2>
                  <em className={`guardian-status-pill ${Number(selectedGuardian.is_active || 0) ? "active" : "inactive"}`}>
                    {Number(selectedGuardian.is_active || 0) ? "일반" : "휴면"}
                  </em>
                  <span>{selectedGuardian.phone || "연락처 미입력"}</span>
                  <span>{formatDateOnlyValue(selectedGuardian.created_at)} 가입</span>
                </div>
              </div>

              <div className="guardian-detail-tabset">
                <input className="guardian-tab-radio" type="radio" id={`${guardianTabName}-basic`} name={guardianTabName} defaultChecked />
                <input className="guardian-tab-radio" type="radio" id={`${guardianTabName}-subjects`} name={guardianTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${guardianTabName}-orders`} name={guardianTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${guardianTabName}-ads`} name={guardianTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${guardianTabName}-activity`} name={guardianTabName} />

                <div className="guardian-detail-tabs" role="tablist" aria-label="보호자 상세 탭">
                  <label htmlFor={`${guardianTabName}-basic`} role="tab">기본정보</label>
                  <label htmlFor={`${guardianTabName}-subjects`} role="tab">대상자</label>
                  <label htmlFor={`${guardianTabName}-orders`} role="tab">구독/주문</label>
                  <label htmlFor={`${guardianTabName}-ads`} role="tab">광고</label>
                  <label htmlFor={`${guardianTabName}-activity`} role="tab">활동 내역</label>
                </div>

                <div className="guardian-tab-panels">
                  <section className="guardian-tab-panel guardian-basic-panel">
                    <dl className="guardian-detail-list">
                      <div><dt>이름</dt><dd>{selectedGuardian.name || "이름 미입력"} ({formatMemberNumber(selectedGuardian.id)})</dd></div>
                      <div><dt>보호자 구분</dt><dd>{selectedGuardianType}</dd></div>
                      <div><dt>보호자 상태</dt><dd>{Number(selectedGuardian.is_active || 0) ? "일반" : "휴면/비활성"}</dd></div>
                      <div><dt>연락처</dt><dd>{selectedGuardian.phone || "-"}</dd></div>
                      <div><dt>생년월일</dt><dd>{formatDate(selectedGuardian.birth_date)}{selectedGuardian.birth_date ? ` (${calculateAgeLabel(selectedGuardian.birth_date)})` : ""}</dd></div>
                      <div><dt>성별</dt><dd>-</dd></div>
                      <div><dt>주소</dt><dd>{formatFullAddress(selectedGuardian.address, selectedGuardian.address_detail)}</dd></div>
                      <div><dt>SNS 로그인</dt><dd><GuardianProviderBadges guardian={selectedGuardian} /></dd></div>
                    </dl>

                    <form action={setGuardianAdminMemoAction} className="guardian-detail-memo-form">
                      <input type="hidden" name="guardianId" value={selectedGuardian.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <label htmlFor={`guardian-admin-memo-${selectedGuardian.id}`}>메모</label>
                      <textarea id={`guardian-admin-memo-${selectedGuardian.id}`} name="adminMemo" maxLength="2000" defaultValue={selectedGuardian.admin_memo || ""} placeholder="복지기본소속 선생님, 상담 이력 등 내부 메모를 입력하세요." />
                      <FormSubmitButton pendingText="저장중">저장</FormSubmitButton>
                    </form>

                    <form action={setGuardianActiveAction} className="guardian-withdraw-form">
                      <input type="hidden" name="guardianId" value={selectedGuardian.id} />
                      <input type="hidden" name="active" value={Number(selectedGuardian.is_active || 0) ? "0" : "1"} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <FormSubmitButton
                        className={Number(selectedGuardian.is_active || 0) ? "danger-button compact" : "activate-button"}
                        pendingText={Number(selectedGuardian.is_active || 0) ? "처리중" : "재활성화중"}
                      >
                        {Number(selectedGuardian.is_active || 0) ? "탈퇴 처리" : "재활성화"}
                      </FormSubmitButton>
                    </form>
                  </section>

                  <section className="guardian-tab-panel guardian-subject-panel">
                    <div className="guardian-tab-section-title">대상자</div>
                    <div className="guardian-subject-card-list">
                      {subjects.map((subject) => (
                        <article className="guardian-subject-card" key={subject.id}>
                          <div className="guardian-subject-avatar" aria-hidden="true">{guardianInitial(subject)}</div>
                          <div>
                            <strong>{subject.name || "이름 미입력"} <small>({subject.gender || "-"}, {calculateAgeLabel(subject.birth_date)})</small></strong>
                            <span>{formatDateOnlyValue(subject.created_at)} 등록</span>
                          </div>
                          <em className={`status-badge ${statusClass(subject.status)}`}>{statusLabel(subject.status)}</em>
                          <Link href={`/admin?section=subjects&subject=${encodeURIComponent(subject.id)}`}>상세보기 &gt;</Link>
                        </article>
                      ))}
                      {subjects.length === 0 && <p className="empty-text">등록된 대상자가 없습니다.</p>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel guardian-orders-panel">
                    <div className="guardian-tab-section-title">주문 내역</div>
                    <div className="guardian-detail-card-list">
                      {payments.map((payment) => (
                        <article className="guardian-detail-mini-card" key={payment.id}>
                          <div className="guardian-detail-row"><strong>주문번호</strong><span>{formatOrderNumber(payment)}</span><Link href={`/admin?section=orders&order=${encodeURIComponent(payment.id)}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>주문일시</strong><span>{formatRecentDateTime(payment.created_at)}</span></div>
                          <div className="guardian-detail-row"><strong>상품(옵션)</strong><span>{payment.product_name || orderTypeLabel(payment.order_type)}</span></div>
                          <div className="guardian-detail-row"><strong>주문금액</strong><span>{formatCurrency(payment.amount)}</span></div>
                          <div className="guardian-detail-row"><strong>배송상태</strong><span>{fulfillmentStatusLabel(payment.fulfillment_status)}</span></div>
                        </article>
                      ))}
                      {payments.length === 0 && <p className="empty-text">주문 내역이 없습니다.</p>}
                    </div>

                    <div className="guardian-tab-section-title">구독 내역</div>
                    <article className="guardian-detail-mini-card">
                      <div className="guardian-detail-row"><strong>구독상태</strong><span>{subscriptionStatusLabel(subscription?.status)}</span></div>
                      <div className="guardian-detail-row"><strong>구독상품</strong><span>{subscription?.plan_name || "이용권 정보 없음"}</span></div>
                      <div className="guardian-detail-row"><strong>구독기간</strong><span>{subscription ? `${Number(subscription.plan_months || 1)}개월` : "-"}</span></div>
                      <div className="guardian-detail-row"><strong>다음 결제일</strong><span>{formatDateOnlyValue(subscription?.current_period_end)}</span></div>
                      <div className="guardian-detail-row"><strong>구독금액</strong><span>{subscription ? formatCurrency(subscription.amount) : "-"}</span></div>
                    </article>

                    <div className="guardian-tab-section-title">결제 내역</div>
                    <div className="guardian-detail-card-list">
                      {payments.slice(0, 3).map((payment) => (
                        <article className="guardian-detail-mini-card compact" key={`payment-${payment.id}`}>
                          <div className="guardian-detail-row"><strong>결제수단</strong><span>{payment.payment_method || "-"}</span><Link href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(formatOrderNumber(payment))}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>총 결제 금액</strong><span>{formatCurrency(payment.amount)}</span></div>
                        </article>
                      ))}
                      {payments.length === 0 && <p className="empty-text">결제 내역이 없습니다.</p>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel guardian-ads-panel">
                    <div className="guardian-tab-section-title">광고 내역</div>
                    <div className="guardian-detail-card-list">
                      {ads.map((ad) => (
                        <article className="guardian-detail-mini-card" key={ad.id}>
                          <div className="guardian-detail-row"><strong>광고명</strong><span>{ad.subject_name || "관리대상 미입력"}</span><Link href={`/admin?section=ads&ad=${encodeURIComponent(ad.id)}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>광고상태</strong><span>{adStatusLabel(ad.status)}</span></div>
                          <div className="guardian-detail-row"><strong>광고기간</strong><span>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</span></div>
                          <div className="guardian-detail-row"><strong>광고지역</strong><span>{ad.region || "-"}</span></div>
                          <div className="guardian-detail-row"><strong>일 예산</strong><span>{formatCurrency(ad.daily_rate)}</span></div>
                          <div className="guardian-detail-row"><strong>총 예산</strong><span>{formatCurrency(ad.amount)}</span></div>
                          <div className="guardian-detail-row"><strong>클릭수</strong><span>{formatMetricValue(ad.click_count)}</span></div>
                        </article>
                      ))}
                      {ads.length === 0 && <p className="empty-text">광고 내역이 없습니다.</p>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel guardian-activity-panel">
                    <div className="guardian-tab-section-title">활동 내역</div>
                    <ol className="guardian-activity-list">
                      {activities.map((activity) => (
                        <li key={activity.id}>
                          <time>{formatRecentDateTime(activity.created_at)}</time>
                          <span>{activity.title || "활동"}</span>
                          {activity.body && <p>{truncateText(activity.body, 42)}</p>}
                        </li>
                      ))}
                      {activities.length === 0 && <li className="guardian-activity-empty">최근 활동 내역이 없습니다.</li>}
                    </ol>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">보호자를 선택해 주세요.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function GuardianStatCard({ icon, title, value, note = "", noteTone = "neutral" }) {
  return (
    <article className="guardian-stat-card">
      <DashboardIcon name={icon} />
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
        {note && <span className={`guardian-stat-note ${noteTone}`}>{note}</span>}
      </div>
    </article>
  );
}

function GuardianProviderBadges({ guardian }) {
  const providers = guardianProviderLabels(guardian);
  return (
    <span className="guardian-provider-badges">
      {providers.map((provider) => (
        <em className={`guardian-provider-badge ${provider.className}`} key={provider.label}>
          {provider.label}
        </em>
      ))}
    </span>
  );
}

function SubjectManagementSection({ adminSubjectsData, selectedSubjectQrImage }) {
  const { summary, subjects, selectedSubject, subscription, orders, ads, activities, filters } = adminSubjectsData;
  const visibleRows = Math.max(0, 12 - subjects.length);
  const subjectTabName = selectedSubject ? `subject-detail-tab-${selectedSubject.id}` : "subject-detail-tab";

  return (
    <div className="subject-admin-page">
      <section className="guardian-admin-status subject-admin-status" aria-labelledby="subject-status-title">
        <h2 id="subject-status-title">현황</h2>
        <div className="subject-stat-grid">
          <GuardianStatCard icon="people" title="전체 대상자" value={formatCountWithUnit(summary.totalSubjects, "명")} />
          <GuardianStatCard
            icon="growth"
            title="신규 대상자"
            value={formatCountWithUnit(summary.newSubjectsToday, "명")}
            note={formatDeltaText(summary.newSubjectsToday, summary.newSubjectsYesterday, "명", "어제 대비")}
            noteTone={Number(summary.newSubjectsToday || 0) >= Number(summary.newSubjectsYesterday || 0) ? "positive" : "negative"}
          />
          <GuardianStatCard icon="linked" title="안전" value={formatCountWithUnit(summary.safeSubjects, "명")} note={`${safePercent(summary.safeSubjects, summary.totalSubjects).toFixed(2)}%`} noteTone="positive" />
          <GuardianStatCard icon="money" title="상품구매필요" value={formatCountWithUnit(summary.purchaseNeededSubjects, "명")} note={`${safePercent(summary.purchaseNeededSubjects, summary.totalSubjects).toFixed(2)}%`} noteTone={Number(summary.purchaseNeededSubjects || 0) > 0 ? "negative" : "neutral"} />
          <GuardianStatCard icon="qr" title="QR미활성화" value={formatCountWithUnit(summary.qrNeededSubjects, "명")} note={`${safePercent(summary.qrNeededSubjects, summary.totalSubjects).toFixed(2)}%`} noteTone={Number(summary.qrNeededSubjects || 0) > 0 ? "negative" : "neutral"} />
          <GuardianStatCard icon="person" title="찾는 중" value={formatCountWithUnit(summary.searchingSubjects, "명")} note={`${safePercent(summary.searchingSubjects, summary.totalSubjects).toFixed(2)}%`} noteTone={Number(summary.searchingSubjects || 0) > 0 ? "negative" : "neutral"} />
          <GuardianStatCard icon="blocked" title="비활성" value={formatCountWithUnit(summary.inactiveQrSubjects, "명")} note={`${safePercent(summary.inactiveQrSubjects, summary.totalSubjects).toFixed(2)}%`} />
          <GuardianStatCard icon="blocked" title="삭제" value={formatCountWithUnit(summary.deletedSubjects, "명")} note={`${safePercent(summary.deletedSubjects, summary.totalSubjects).toFixed(2)}%`} />
        </div>
      </section>

      <section className="admin-panel guardian-search-panel subject-search-panel">
        <h2>조회</h2>
        <form action="/admin" className="guardian-admin-filter subject-admin-filter">
          <input type="hidden" name="section" value="subjects" />
          {filters.guardianId && <input type="hidden" name="guardianId" value={filters.guardianId} />}
          <label>
            검색어
            <input name="subjectAdminQuery" defaultValue={filters.query} placeholder="이름, 연락처" />
          </label>
          <label>
            대상자 상태
            <select name="subjectStatus" defaultValue={filters.status}>
              <option value="all">전체</option>
              <option value="상품구매필요">상품구매필요</option>
              <option value="QR활성화필요">QR활성화필요</option>
              <option value="안전">안전</option>
              <option value="찾는중">찾는중</option>
            </select>
          </label>
          <label>
            QR 상태
            <select name="subjectQr" defaultValue={filters.qr}>
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="pending">활성화 대기</option>
              <option value="inactive">비활성</option>
              <option value="unassigned">미매칭</option>
            </select>
          </label>
          <label>
            구독 상태
            <select name="subjectSubscription" defaultValue={filters.subscription}>
              <option value="all">전체</option>
              <option value="active">이용중</option>
              <option value="paused">일시정지</option>
              <option value="none">미구독</option>
            </select>
          </label>
          <fieldset className="guardian-filter-date subject-filter-date">
            <legend>등록일</legend>
            <input type="date" name="subjectStart" defaultValue={filters.startDate} aria-label="등록 시작일" />
            <span>~</span>
            <input type="date" name="subjectEnd" defaultValue={filters.endDate} aria-label="등록 종료일" />
          </fieldset>
          <Link className="plain-button guardian-reset-button" href="/admin?section=subjects">초기화</Link>
          <button type="submit">검색</button>
        </form>
        {filters.guardianId && (
          <div className="admin-active-filter">
            특정 보호자의 관리대상만 조회 중입니다.
            <Link href="/admin?section=subjects">전체 보기</Link>
          </div>
        )}
      </section>

      <div className="guardian-admin-layout subject-admin-layout">
        <section className="admin-panel guardian-list-panel subject-list-panel">
          <div className="guardian-list-heading">
            <h2>전체 대상자 <strong>{formatMetricValue(summary.totalSubjects)}</strong>명</h2>
            <AdminExportButton filename="zezari-subjects.csv" rows={subjectExportRows(subjects)} />
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap">
            <div className="admin-record-table guardian-admin-table subject-admin-table" role="table" aria-label="관리대상자 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">□</span>
                <span role="columnheader">대상자 번호</span>
                <span role="columnheader">대상자</span>
                <span role="columnheader">보호자</span>
                <span role="columnheader">대상자상태</span>
                <span role="columnheader">QR 상태</span>
                <span role="columnheader">구독 상태</span>
                <span role="columnheader">등록일</span>
                <span role="columnheader">관리</span>
              </div>
              {subjects.map((subject) => (
                <Link
                  className={subject.id === selectedSubject?.id ? "admin-record-row active" : "admin-record-row"}
                  href={buildSubjectAdminUrl(filters, subject.id)}
                  key={subject.id}
                  role="row"
                >
                  <span role="cell">{subject.id === selectedSubject?.id ? "◉" : "□"}</span>
                  <span role="cell">{formatSubjectNumber(subject.id)}</span>
                  <strong role="cell">{subject.name || "이름 미입력"}<small>{subject.gender || "-"} · {calculateAgeLabel(subject.birth_date)}</small></strong>
                  <span role="cell">{subject.guardian_name || "보호자 미입력"}<small>{subject.guardian_phone || "-"}</small></span>
                  <em role="cell" className={`status-badge ${statusClass(subject.status)}`}>{statusLabel(subject.status)}</em>
                  <em role="cell" className={`qr-admin-state ${qrAdminStateClass(subject)}`}>{qrAdminStateLabel(subject)}</em>
                  <em role="cell" className={`guardian-table-badge ${subscriptionStateClass(subject.subscription_status)}`}>{subscriptionStatusLabel(subject.subscription_status)}</em>
                  <time role="cell">{formatDateOnlyValue(subject.created_at)}</time>
                  <span role="cell">상세보기</span>
                </Link>
              ))}
              {subjects.length > 0 && Array.from({ length: visibleRows }, (_, index) => (
                <div className="admin-record-row guardian-empty-row" role="row" key={`subject-empty-${index}`}>
                  {Array.from({ length: 9 }, (_, cellIndex) => <span role="cell" key={`subject-empty-${index}-${cellIndex}`}>&nbsp;</span>)}
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="admin-record-row guardian-empty-result" role="row">
                  <span role="cell">조건에 맞는 관리대상자가 없습니다.</span>
                </div>
              )}
            </div>
          </div>
          <div className="guardian-list-footer">
            <span>선택한 대상자 {selectedSubject ? "1" : "0"}명</span>
            <label>
              <select defaultValue="10" aria-label="페이지당 대상자 수">
                <option value="10">10개씩 보기</option>
                <option value="20">20개씩 보기</option>
                <option value="50">50개씩 보기</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-panel guardian-detail-card subject-detail-card">
          {selectedSubject ? (
            <>
              <div className="guardian-detail-header subject-detail-header">
                <div className="subject-detail-avatar" aria-hidden="true">
                  {selectedSubject.photo_url ? <img src={selectedSubject.photo_url} alt="" /> : <span>{guardianInitial(selectedSubject)}</span>}
                </div>
                <div>
                  <h2>{selectedSubject.name || "이름 미입력"} <small>({selectedSubject.gender || "-"}, {calculateAgeLabel(selectedSubject.birth_date)})</small></h2>
                  <em className={`guardian-status-pill ${statusClass(selectedSubject.status)}`}>
                    {statusLabel(selectedSubject.status)}
                  </em>
                  <span>{formatDate(selectedSubject.birth_date)}</span>
                  <span>{formatDateOnlyValue(selectedSubject.created_at)} 가입</span>
                  <span>{formatDateOnlyValue(selectedSubject.updated_at)} 수정</span>
                </div>
              </div>

              <div className="guardian-detail-tabset">
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-basic`} name={subjectTabName} defaultChecked />
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-guardian`} name={subjectTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-qr`} name={subjectTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-ads`} name={subjectTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-orders`} name={subjectTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${subjectTabName}-activity`} name={subjectTabName} />

                <div className="guardian-detail-tabs" role="tablist" aria-label="대상자 상세 탭">
                  <label htmlFor={`${subjectTabName}-basic`} role="tab">기본 정보</label>
                  <label htmlFor={`${subjectTabName}-guardian`} role="tab">보호자</label>
                  <label htmlFor={`${subjectTabName}-qr`} role="tab">QR</label>
                  <label htmlFor={`${subjectTabName}-ads`} role="tab">광고</label>
                  <label htmlFor={`${subjectTabName}-orders`} role="tab">구독/주문</label>
                  <label htmlFor={`${subjectTabName}-activity`} role="tab">활동 내역</label>
                </div>

                <div className="guardian-tab-panels">
                  <section className="guardian-tab-panel subject-basic-panel">
                    <dl className="guardian-detail-list">
                      <div><dt>이름</dt><dd>{selectedSubject.name || "-"}</dd></div>
                      <div><dt>성별</dt><dd>{selectedSubject.gender || "-"}</dd></div>
                      <div><dt>생년월일</dt><dd>{formatDate(selectedSubject.birth_date)} ({calculateAgeLabel(selectedSubject.birth_date)})</dd></div>
                      <div><dt>주소</dt><dd>{formatFullAddress(selectedSubject.guardian_address, selectedSubject.guardian_address_detail)}</dd></div>
                      <div><dt>보호자 메시지</dt><dd className="admin-message-content">{selectedSubject.guardian_message || "입력된 보호자 메시지가 없습니다."}</dd></div>
                      <div><dt>대상자 상태</dt><dd>{statusLabel(selectedSubject.status)}</dd></div>
                      <div><dt>QR 상태</dt><dd>{qrAdminStateLabel(selectedSubject)}</dd></div>
                    </dl>
                    <div className="subject-detail-media-block">
                      <div className="guardian-tab-section-title">사진</div>
                      <div className="subject-photo-strip">
                        {selectedSubject.photo_url ? <img src={selectedSubject.photo_url} alt={`${selectedSubject.name} 사진`} /> : <span>사진 없음</span>}
                        <em>{selectedSubject.photo_name || "사진 파일 없음"}</em>
                      </div>
                    </div>
                    <div className="subject-detail-media-block">
                      <div className="guardian-tab-section-title">보호자 음성</div>
                      {selectedSubject.voice_data_url ? (
                        <audio className="admin-voice-player" controls preload="none" src={selectedSubject.voice_data_url}>
                          브라우저에서 음성을 재생할 수 없습니다.
                        </audio>
                      ) : (
                        <p className="empty-text">저장된 보호자 음성이 없습니다.</p>
                      )}
                      {selectedSubject.voice_name && <span className="admin-detail-caption">{selectedSubject.voice_name}</span>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel subject-guardian-panel">
                    <div className="guardian-tab-section-title">보호자 정보</div>
                    <article className="guardian-detail-mini-card">
                      <div className="guardian-detail-row"><strong>이름(아이디)</strong><span>{selectedSubject.guardian_name || "-"} ({selectedSubject.guardian_login_id || selectedSubject.guardian_email || selectedSubject.guardian_google_email || "-"})</span><Link href={`/admin?section=guardians&guardian=${encodeURIComponent(selectedSubject.guardian_id)}`}>상세보기 &gt;</Link></div>
                      <div className="guardian-detail-row"><strong>연락처</strong><span>{selectedSubject.guardian_phone || "-"}</span></div>
                      <div className="guardian-detail-row"><strong>보호자 구분</strong><span>{subscription?.status === "active" ? "VIP" : "일반"}</span></div>
                      <div className="guardian-detail-row"><strong>주소</strong><span>{formatFullAddress(selectedSubject.guardian_address, selectedSubject.guardian_address_detail)}</span></div>
                      <div className="guardian-detail-row"><strong>가입일</strong><span>{formatRecentDateTime(selectedSubject.guardian_created_at)}</span></div>
                    </article>
                  </section>

                  <section className="guardian-tab-panel subject-qr-panel">
                    <div className="guardian-tab-section-title">QR 정보</div>
                    <article className="guardian-detail-mini-card subject-qr-card">
                      <div className="subject-qr-preview">
                        {selectedSubjectQrImage ? <img src={selectedSubjectQrImage} alt={`${selectedSubject.name} QR 코드`} /> : <span>미매칭</span>}
                      </div>
                      <div>
                        <div className="guardian-detail-row"><strong>QR 번호</strong><span className="inline-scroll-value">{selectedSubject.qr_code || "미매칭"}</span>{selectedSubject.qr_target_url && <Link href={selectedSubject.qr_target_url} target="_blank">상세보기 &gt;</Link>}</div>
                        <div className="guardian-detail-row"><strong>QR 상태</strong><span>{qrAdminStateLabel(selectedSubject)}</span></div>
                        <div className="guardian-detail-row"><strong>발급일</strong><span>{formatRecentDateTime(selectedSubject.qr_updated_at)}</span></div>
                        <div className="guardian-detail-row"><strong>활성화 시점</strong><span>{formatRecentDateTime(selectedSubject.qr_activated_at)}</span></div>
                        <div className="guardian-detail-row"><strong>최근 수정일</strong><span>{formatRecentDateTime(selectedSubject.qr_updated_at)}</span></div>
                      </div>
                    </article>
                  </section>

                  <section className="guardian-tab-panel subject-ads-panel">
                    <div className="guardian-tab-section-title">광고 내역</div>
                    <div className="guardian-detail-card-list">
                      {ads.map((ad) => (
                        <article className="guardian-detail-mini-card" key={ad.id}>
                          <div className="guardian-detail-row"><strong>광고명</strong><span>{selectedSubject.name || "관리대상 미입력"}</span><Link href={`/admin?section=ads&ad=${encodeURIComponent(ad.id)}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>광고상태</strong><span>{adStatusLabel(ad.status)}</span></div>
                          <div className="guardian-detail-row"><strong>광고기간</strong><span>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</span></div>
                          <div className="guardian-detail-row"><strong>광고지역</strong><span>{ad.region || "-"}</span></div>
                          <div className="guardian-detail-row"><strong>일 예산</strong><span>{formatCurrency(ad.daily_rate)}</span></div>
                          <div className="guardian-detail-row"><strong>총 예산</strong><span>{formatCurrency(ad.amount)}</span></div>
                          <div className="guardian-detail-row"><strong>도달수</strong><span>{formatMetricValue(ad.click_count)}</span></div>
                        </article>
                      ))}
                      {ads.length === 0 && <p className="empty-text">광고 내역이 없습니다.</p>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel subject-orders-panel">
                    <div className="guardian-tab-section-title">주문 내역</div>
                    <div className="guardian-detail-card-list">
                      {orders.map((order) => (
                        <article className="guardian-detail-mini-card" key={order.id}>
                          <div className="guardian-detail-row"><strong>주문번호</strong><span>{formatOrderNumber(order)}</span><Link href={`/admin?section=orders&order=${encodeURIComponent(order.id)}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>주문일시</strong><span>{formatRecentDateTime(order.created_at)}</span></div>
                          <div className="guardian-detail-row"><strong>상품(옵션)</strong><span>{order.product_name || orderTypeLabel(order.order_type)}</span></div>
                          <div className="guardian-detail-row"><strong>주문금액</strong><span>{formatCurrency(order.amount)}</span></div>
                          <div className="guardian-detail-row"><strong>배송상태</strong><span>{fulfillmentStatusLabel(order.fulfillment_status)}</span></div>
                        </article>
                      ))}
                      {orders.length === 0 && <p className="empty-text">주문 내역이 없습니다.</p>}
                    </div>

                    <div className="guardian-tab-section-title">구독 내역</div>
                    <article className="guardian-detail-mini-card">
                      <div className="guardian-detail-row"><strong>구독번호</strong><span>{subscription?.id || "-"}</span></div>
                      <div className="guardian-detail-row"><strong>구독상품</strong><span>{subscription?.plan_name || "이용권 정보 없음"}</span></div>
                      <div className="guardian-detail-row"><strong>구독상태</strong><span>{subscriptionStatusLabel(subscription?.status)}</span></div>
                      <div className="guardian-detail-row"><strong>구독 시작일시</strong><span>{formatRecentDateTime(subscription?.current_period_start)}</span></div>
                      <div className="guardian-detail-row"><strong>다음 결제일</strong><span>{formatDateOnlyValue(subscription?.current_period_end)}</span></div>
                      <div className="guardian-detail-row"><strong>구독 금액</strong><span>{subscription ? formatCurrency(subscription.amount) : "-"}</span></div>
                    </article>

                    <div className="guardian-tab-section-title">결제 내역</div>
                    <div className="guardian-detail-card-list">
                      {orders.filter((order) => isPaidOrder(order.status)).slice(0, 10).map((order) => (
                        <article className="guardian-detail-mini-card compact" key={`subject-payment-${order.id}`}>
                          <div className="guardian-detail-row"><strong>결제수단</strong><span>{order.payment_method || "-"}</span><Link href={`/admin?section=payments&paymentLedgerQuery=${encodeURIComponent(formatOrderNumber(order))}`}>상세보기 &gt;</Link></div>
                          <div className="guardian-detail-row"><strong>총 결제 금액</strong><span>{formatCurrency(order.amount)}</span></div>
                          <div className="guardian-detail-row"><strong>결제일</strong><span>{formatRecentDateTime(order.paid_at)}</span></div>
                        </article>
                      ))}
                      {orders.filter((order) => isPaidOrder(order.status)).length === 0 && <p className="empty-text">결제 내역이 없습니다.</p>}
                    </div>
                  </section>

                  <section className="guardian-tab-panel subject-activity-panel">
                    <div className="guardian-tab-section-title">활동 내역</div>
                    <ol className="guardian-activity-list">
                      {activities.map((activity) => (
                        <li key={activity.id}>
                          <time>{formatRecentDateTime(activity.at)}</time>
                          <span>{activity.title || "활동"}</span>
                          {activity.body && <p>{truncateText(activity.body, 42)}</p>}
                        </li>
                      ))}
                      {activities.length === 0 && <li className="guardian-activity-empty">최근 활동 내역이 없습니다.</li>}
                    </ol>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">관리대상자를 선택해 주세요.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function QrManagementSection({ qrData, qrItems }) {
  const selectedQr = qrData.selectedQr;
  const selectedQrImage = selectedQr
    ? qrItems.find((item) => item.id === selectedQr.id)?.image || ""
    : "";
  const visibleRows = Math.max(0, 12 - qrItems.length);
  const qrTabName = selectedQr ? `qr-detail-tab-${selectedQr.id}` : "qr-detail-tab";
  const selectedQrReturnTo = selectedQr ? buildQrDetailUrl(qrData, selectedQr.id) : buildQrListUrl(qrData);

  return (
    <div className="qr-admin-page">
      <section className="guardian-admin-status qr-admin-status" aria-labelledby="qr-status-title">
        <h2 id="qr-status-title">QR관리</h2>
        <div className="qr-stat-grid">
          <GuardianStatCard icon="qr" title="전체 QR" value={formatCountWithUnit(qrData.total, "개")} />
          <GuardianStatCard
            icon="growth"
            title="사용중 QR"
            value={formatCountWithUnit(qrData.inUseCount, "개")}
            note={`미활성화: ${formatMetricValue(qrData.inactiveCount)}개 / 활성화: ${formatMetricValue(qrData.activeCount)}개`}
            noteTone="positive"
          />
          <GuardianStatCard icon="blocked" title="미사용" value={formatCountWithUnit(qrData.unusedCount, "개")} />
          <GuardianStatCard icon="blocked" title="폐기" value={formatCountWithUnit(qrData.discardedCount, "개")} noteTone={Number(qrData.discardedCount || 0) > 0 ? "negative" : "neutral"} />
        </div>
      </section>

      <section className="admin-panel guardian-search-panel qr-admin-search-panel">
        <h2>검색</h2>
        <form className="guardian-admin-filter qr-admin-filter" action="/admin">
          <input type="hidden" name="section" value="qr" />
          <label>
            검색어
            <input name="qrAdminQuery" defaultValue={qrData.filters.query} placeholder="QR번호, 대상자명, 보호자명" />
          </label>
          <label>
            QR상태
            <select name="qrStatus" defaultValue={qrData.filters.status}>
              <option value="all">전체</option>
              <option value="in_use">사용중</option>
              <option value="unused">미사용</option>
              <option value="discarded">폐기</option>
            </select>
          </label>
          <label>
            활성화 상태
            <select name="active" defaultValue={qrData.filters.active}>
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">미활성</option>
            </select>
          </label>
          <fieldset className="guardian-filter-date qr-filter-date">
            <legend>활성화일</legend>
            <input type="date" name="qrStart" defaultValue={qrData.filters.startDate} aria-label="활성화 시작일" />
            <span>~</span>
            <input type="date" name="qrEnd" defaultValue={qrData.filters.endDate} aria-label="활성화 종료일" />
          </fieldset>
          <Link className="plain-button guardian-reset-button" href="/admin?section=qr">초기화</Link>
          <button type="submit">검색</button>
        </form>
        <form className="qr-inline-create-form" action={generateQrCodesAction}>
          <label htmlFor="qr-count">QR 추가 생성</label>
          <input id="qr-count" type="number" name="count" min="1" max="200" defaultValue="10" />
          <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
          <FormSubmitButton pendingText="생성중">생성</FormSubmitButton>
        </form>
      </section>

      <div className="qr-admin-layout">
        <section className="admin-panel guardian-list-panel qr-list-panel">
          <div className="guardian-list-heading">
            <h2>조회 <strong>{formatMetricValue(qrData.filteredCount)}</strong>개</h2>
            <AdminExportButton filename="zezari-qr-codes.csv" rows={qrExportRows(qrItems)} />
          </div>
          <div className="admin-record-table-wrap guardian-admin-table-wrap qr-admin-table-wrap">
            <div className="admin-record-table guardian-admin-table qr-admin-table" role="table" aria-label="QR 목록">
              <div className="admin-record-header" role="row">
                <span role="columnheader">□</span>
                <span role="columnheader">QR</span>
                <span role="columnheader">QR 번호</span>
                <span role="columnheader">대상자명</span>
                <span role="columnheader">보호자명</span>
                <span role="columnheader">상태</span>
                <span role="columnheader">활성화상태</span>
                <span role="columnheader">생성일</span>
                <span role="columnheader">활성화일</span>
                <span role="columnheader">만료일</span>
                <span role="columnheader">관리</span>
              </div>
              {qrItems.map((qr) => (
                <Link
                  className={qr.id === selectedQr?.id ? "admin-record-row active" : "admin-record-row"}
                  href={buildQrDetailUrl(qrData, qr.id)}
                  key={qr.id}
                  role="row"
                >
                  <span role="cell">{qr.id === selectedQr?.id ? "◉" : "□"}</span>
                  <span role="cell" className="qr-table-image"><img src={qr.image} alt={`${qr.code} QR`} /></span>
                  <span role="cell" className="inline-scroll-value">{qr.code || "-"}</span>
                  <span role="cell">{formatQrSubjectLabel(qr)}</span>
                  <span role="cell">{qr.guardian_name || "미배정"}</span>
                  <em role="cell" className={`qr-lifecycle-badge ${qrLifecycleClass(qr)}`}>{qrLifecycleLabel(qr.lifecycle_status)}</em>
                  <em role="cell" className={`qr-activation-badge ${qrActivationClass(qr)}`}>{qrActivationLabel(qr)}</em>
                  <time role="cell">{formatDateOnlyValue(qr.created_at)}</time>
                  <time role="cell">{formatDateOnlyValue(qr.activated_at)}</time>
                  <time role="cell">{formatDateOnlyValue(qr.subscription_ends_at)}</time>
                  <span role="cell">상세보기</span>
                </Link>
              ))}
              {qrItems.length > 0 && Array.from({ length: visibleRows }, (_, index) => (
                <div className="admin-record-row guardian-empty-row" role="row" key={`qr-empty-${index}`}>
                  {Array.from({ length: 11 }, (_, cellIndex) => <span role="cell" key={`qr-empty-${index}-${cellIndex}`}>&nbsp;</span>)}
                </div>
              ))}
              {qrItems.length === 0 && (
                <div className="admin-record-row guardian-empty-result" role="row">
                  <span role="cell">조건에 맞는 QR 코드가 없습니다.</span>
                </div>
              )}
            </div>
          </div>
          <div className="guardian-list-footer">
            <span>선택한 QR {selectedQr ? "1" : "0"}개</span>
            <label>
              <select defaultValue="10" aria-label="페이지당 QR 수">
                <option value="10">10개씩 보기</option>
                <option value="20">20개씩 보기</option>
                <option value="50">50개씩 보기</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-panel guardian-detail-card qr-detail-card">
          {selectedQr ? (
            <>
              <div className="guardian-detail-header qr-detail-header">
                <div className="qr-detail-image">
                  {selectedQrImage && (
                    <a href={selectedQrImage} download={`${selectedQr.code}.png`} title={`${selectedQr.code} QR 이미지 다운로드`}>
                      <img src={selectedQrImage} alt={`${selectedQr.code} QR 코드`} />
                    </a>
                  )}
                </div>
                <div>
                  <h2><span className="inline-scroll-value">{selectedQr.code}</span></h2>
                  <div className="qr-detail-badges">
                    <em className={`qr-lifecycle-badge ${qrLifecycleClass(selectedQr)}`}>{qrLifecycleLabel(selectedQr.lifecycle_status)}</em>
                    <em className={`qr-activation-badge ${qrActivationClass(selectedQr)}`}>{qrActivationLabel(selectedQr)}</em>
                  </div>
                  <span>{selectedQr.subject_name || "미매칭"}</span>
                  <span>{selectedQr.guardian_name || "보호자 미배정"}</span>
                </div>
              </div>

              <div className="guardian-detail-tabset qr-detail-tabset">
                <input className="guardian-tab-radio" type="radio" id={`${qrTabName}-basic`} name={qrTabName} defaultChecked />
                <input className="guardian-tab-radio" type="radio" id={`${qrTabName}-history`} name={qrTabName} />
                <input className="guardian-tab-radio" type="radio" id={`${qrTabName}-manage`} name={qrTabName} />

                <div className="guardian-detail-tabs" role="tablist" aria-label="QR 상세 탭">
                  <label htmlFor={`${qrTabName}-basic`} role="tab">기본 정보</label>
                  <label htmlFor={`${qrTabName}-history`} role="tab">이력 정보</label>
                  <label htmlFor={`${qrTabName}-manage`} role="tab">관리</label>
                </div>

                <div className="guardian-tab-panels">
                  <section className="guardian-tab-panel qr-basic-panel">
                    <dl className="guardian-detail-list">
                      <div><dt>대상자명</dt><dd>{formatQrSubjectLabel(selectedQr)}</dd></div>
                      <div><dt>보호자명</dt><dd>{selectedQr.guardian_name || "미배정"}</dd></div>
                      <div><dt>연락처</dt><dd>{selectedQr.guardian_safe_phone || selectedQr.guardian_phone || "-"}</dd></div>
                      <div><dt>생성일</dt><dd>{formatRecentDateTime(selectedQr.created_at)}</dd></div>
                      <div><dt>활성화일</dt><dd>{formatRecentDateTime(selectedQr.activated_at)}</dd></div>
                      <div><dt>만료일</dt><dd>{formatRecentDateTime(selectedQr.subscription_ends_at)}</dd></div>
                      <div><dt>QR 번호</dt><dd><span className="inline-scroll-value">{selectedQr.code || "-"}</span></dd></div>
                      <div><dt>고유키</dt><dd><span className="inline-scroll-value">{selectedQr.public_key || "-"}</span></dd></div>
                      <div><dt>대상자정보페이지</dt><dd><a className="inline-scroll-value" href={selectedQr.target_url} target="_blank" rel="noreferrer">{selectedQr.target_url}</a></dd></div>
                    </dl>
                    <form action={setQrAdminMemoAction} className="guardian-detail-memo-form">
                      <input type="hidden" name="qrId" value={selectedQr.id} />
                      <input type="hidden" name="returnTo" value={selectedQrReturnTo} />
                      <label htmlFor={`qr-admin-memo-${selectedQr.id}`}>메모</label>
                      <textarea id={`qr-admin-memo-${selectedQr.id}`} name="adminMemo" maxLength="2000" defaultValue={selectedQr.admin_memo || ""} placeholder="QR 배송, 교체, 회수 등 내부 메모를 입력하세요." />
                      <FormSubmitButton pendingText="저장중">메모 저장</FormSubmitButton>
                    </form>
                  </section>

                  <section className="guardian-tab-panel qr-history-panel">
                    <div className="guardian-tab-section-title">이력 정보</div>
                    <ol className="guardian-activity-list">
                      {qrData.selectedQrActivities.map((activity) => (
                        <li key={activity.id}>
                          <time>{formatRecentDateTime(activity.at)}</time>
                          <span>{activity.title || "이력"}</span>
                          {activity.body && <p>{truncateText(activity.body, 42)}</p>}
                        </li>
                      ))}
                      {qrData.selectedQrActivities.length === 0 && <li className="guardian-activity-empty">QR 이력이 없습니다.</li>}
                    </ol>
                  </section>

                  <section className="guardian-tab-panel qr-manage-panel">
                    <div className="guardian-tab-section-title">QR 관리</div>
                    <div className="guardian-detail-card-list">
                      <article className="guardian-detail-mini-card">
                        <div className="guardian-detail-row"><strong>현재 상태</strong><span>{qrLifecycleLabel(selectedQr.lifecycle_status)} / {qrActivationLabel(selectedQr)}</span></div>
                        <div className="guardian-detail-row"><strong>매칭 대상</strong><span>{formatQrSubjectLabel(selectedQr)}</span></div>
                        <div className="guardian-detail-row"><strong>보호자</strong><span>{selectedQr.guardian_name || "미배정"}</span></div>
                      </article>
                      <div className="qr-detail-action-grid">
                        {selectedQr.lifecycle_status !== "discarded" && !selectedQr.subject_id && (
                          <Link className="activate-button" href={buildQrAssignUrl(qrData, selectedQr.id)}>
                            매칭대상 조회
                          </Link>
                        )}
                        {selectedQr.lifecycle_status !== "discarded" && selectedQr.subject_id && (
                          <form action={setQrSubjectAction}>
                            <input type="hidden" name="qrId" value={selectedQr.id} />
                            <input type="hidden" name="subjectId" value="" />
                            <input type="hidden" name="returnTo" value={selectedQrReturnTo} />
                            <FormSubmitButton className="plain-button" pendingText="해제중">매칭 해제</FormSubmitButton>
                          </form>
                        )}
                        {selectedQr.lifecycle_status !== "discarded" && (
                          <form action={setQrActiveAction}>
                            <input type="hidden" name="qrId" value={selectedQr.id} />
                            <input type="hidden" name="active" value={selectedQr.is_active ? "0" : "1"} />
                            <input type="hidden" name="returnTo" value={selectedQrReturnTo} />
                            <FormSubmitButton className={selectedQr.is_active ? "plain-button" : "activate-button"} pendingText={selectedQr.is_active ? "비활성화중" : "활성화중"}>
                              {selectedQr.is_active ? "QR 비활성화" : "QR 활성화"}
                            </FormSubmitButton>
                          </form>
                        )}
                        {selectedQr.lifecycle_status !== "discarded" ? (
                          <form action={setQrLifecycleAction}>
                            <input type="hidden" name="qrId" value={selectedQr.id} />
                            <input type="hidden" name="lifecycleStatus" value="discarded" />
                            <input type="hidden" name="returnTo" value={buildQrListUrl(qrData)} />
                            <FormSubmitButton className="danger-button compact" pendingText="폐기중">QR 폐기</FormSubmitButton>
                          </form>
                        ) : (
                          <form action={setQrLifecycleAction}>
                            <input type="hidden" name="qrId" value={selectedQr.id} />
                            <input type="hidden" name="lifecycleStatus" value="unused" />
                            <input type="hidden" name="returnTo" value={selectedQrReturnTo} />
                            <FormSubmitButton className="activate-button" pendingText="복구중">미사용 복구</FormSubmitButton>
                          </form>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-text">QR을 선택해 주세요.</p>
          )}
        </section>
      </div>

      {selectedQr && qrData.matchSearch.qrId && !selectedQr.subject_id && (
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
              <input type="hidden" name="qrAdminQuery" value={qrData.filters.query} />
              <input type="hidden" name="qrStatus" value={qrData.filters.status} />
              <input type="hidden" name="active" value={qrData.filters.active} />
              <input type="hidden" name="qrStart" value={qrData.filters.startDate} />
              <input type="hidden" name="qrEnd" value={qrData.filters.endDate} />
              <input type="hidden" name="qr" value={selectedQr.id} />
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
                  <input type="hidden" name="returnTo" value={buildQrDetailUrl(qrData, selectedQr.id)} />
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
              <Link className="plain-button modal-close-button" href={buildQrDetailUrl(qrData, selectedQr.id)}>
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
  const params = buildQrParams(qrData);
  params.set("qr", qrId);
  params.set("assignQr", qrId);
  return `/admin?${params.toString()}`;
}

function buildQrDetailUrl(qrData, qrId) {
  const params = buildQrParams(qrData);
  if (qrId) params.set("qr", qrId);
  return `/admin?${params.toString()}`;
}

function buildQrListUrl(qrData) {
  const params = buildQrParams(qrData);
  return `/admin?${params.toString()}`;
}

function buildQrParams(qrData) {
  const params = new URLSearchParams({ section: "qr" });
  if (qrData.filters.query) params.set("qrAdminQuery", qrData.filters.query);
  if (qrData.filters.status && qrData.filters.status !== "all") params.set("qrStatus", qrData.filters.status);
  if (qrData.filters.active && qrData.filters.active !== "all") params.set("active", qrData.filters.active);
  if (qrData.filters.startDate) params.set("qrStart", qrData.filters.startDate);
  if (qrData.filters.endDate) params.set("qrEnd", qrData.filters.endDate);
  return params;
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
    "주문/구독/광고 번호": formatPaymentNumber(payment),
    거래구분: paymentTypeLabel(payment),
    "대상자(보호자)": `${payment.subject_name || "대상자 미선택"} (${payment.guardian_name || "보호자 미입력"})`,
    거래상품: payment.payment_item || "-",
    결제수단: payment.payment_method || "-",
    거래금액: formatCurrency(payment.amount),
    환불금액: formatCurrency(payment.refund_amount),
    결제상태: paymentStatusLabel(payment.payment_state),
    거래일시: formatRecentDateTime(payment.payment_date),
  }));
}

function couponExportRows(coupons = []) {
  return coupons.map((coupon) => ({
    쿠폰번호: coupon.coupon_number || formatCouponNumber(coupon),
    쿠폰코드: coupon.code || "-",
    할인유형: couponDiscountTypeLabel(coupon.discount_type),
    할인금액: couponDiscountValueLabel(coupon),
    할인내용: coupon.description || coupon.discount_label || "-",
    유효기간: formatCouponPeriod(coupon),
    발행수량: Number(coupon.issue_limit || 0),
    발행수: Number(coupon.issued_count || 0),
    사용수: Number(coupon.used_count || 0),
    상태: couponStatusLabel(coupon.status),
    적용서비스: couponServiceLabel(coupon.service_scope),
    최소금액: formatCurrency(coupon.min_order_amount),
    최대할인금액: formatCurrency(coupon.max_discount_amount),
    메모: coupon.admin_memo || "",
    생성일: formatRecentDateTime(coupon.created_at),
  }));
}

function subscriptionExportRows(subscriptions = []) {
  return subscriptions.map((subscription) => ({
    구독번호: formatSubscriptionNumber(subscription),
    보호자: subscription.guardian_name || "보호자 미입력",
    대상자: subscription.subject_name || "대상자 미선택",
    구독상품: subscriptionPlanLabel(subscription),
    구독기간: formatSubscriptionPeriod(subscription),
    다음결제일: formatDate(subscription.current_period_end),
    금액: formatCurrency(subscription.amount),
    구독상태: subscriptionStatusLabel(subscription.status),
    결제상태: paymentStatusLabel(subscription.latest_order_status),
    최근주문번호: subscription.latest_order_number || "-",
  }));
}

function guardianExportRows(guardians = []) {
  return guardians.map((guardian) => ({
    회원번호: formatMemberNumber(guardian.id),
    이름: guardian.name || "이름 미입력",
    아이디: guardian.login_id || providerLoginLabel(guardian) || "-",
    연락처: guardian.phone || "-",
    이메일: guardian.email || guardian.google_email || "-",
    생년월일: formatDate(guardian.birth_date),
    주소: formatFullAddress(guardian.address, guardian.address_detail),
    보호자구분: guardianTypeLabel(guardian),
    가입일: formatDateOnlyValue(guardian.created_at),
    상태: Number(guardian.is_active || 0) ? "일반" : "휴면/비활성",
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
    상품: formatOrderProductName(order),
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
    광고상태: adStatusLabel(ad.status),
    심사상태: adReviewStatusLabel(ad.review_status),
    광고지역: ad.region || "지역 미입력",
    광고기간: `${formatDate(ad.start_date)} ~ ${formatDate(ad.end_date)}`,
    일예산: formatCurrency(ad.daily_rate),
    총예산: formatCurrency(ad.amount),
    광고비소진율: `${adBudgetProgressPercent(ad)}%`,
    클릭수: formatMetricValue(ad.click_count),
    활성화일시: formatRecentDateTime(ad.updated_at),
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

function adminMessageExportRows(messages = []) {
  return messages.map((message) => ({
    알림번호: message.message_number || "-",
    제목: message.title || "제목 없음",
    발송채널: adminMessageChannelLabel(message.channel),
    발송대상: adminMessageTargetLabel(message),
    발송상태: adminMessageStatusLabel(message.status),
    발송수: Number(message.recipient_count || 0),
    성공수: Number(message.success_count || 0),
    실패수: Number(message.failure_count || 0),
    발송일시: formatRecentDateTime(message.sent_at),
    작성일시: formatRecentDateTime(message.created_at),
    내용: message.body || "",
  }));
}

function messageTemplateExportRows(templates = []) {
  return templates.map((template) => ({
    템플릿번호: template.template_number || "-",
    이벤트: template.event_key || "-",
    설명: template.description || "",
    발송채널: adminMessageChannelLabel(template.channel),
    제목: template.title || "",
    내용: template.body || "",
    발송대상: adminMessageTargetTypeLabel(template.target_type),
    자동메시지: Number(template.is_auto || 0) ? "ON" : "OFF",
    수정제한: Number(template.is_locked || 0) ? "제목/내용만 수정" : "전체 수정",
    상태: Number(template.is_active || 0) ? "사용 가능" : "사용 불가능",
    수정일시: formatRecentDateTime(template.updated_at),
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
    디자인수: (product.designs || []).length,
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
    QR번호: qr.code,
    고유문자열: qr.public_key,
    상태: qrLifecycleLabel(qr.lifecycle_status),
    활성화상태: qrActivationLabel(qr),
    보호자: qr.guardian_name || "미배정",
    관리대상: formatQrSubjectLabel(qr),
    보호자연락처: qr.guardian_safe_phone || qr.guardian_phone || "-",
    공개URL: qr.target_url,
    생성일: formatRecentDateTime(qr.created_at),
    활성화일: formatRecentDateTime(qr.activated_at),
    만료일: formatRecentDateTime(qr.subscription_ends_at),
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

function truncateText(value, maxLength = 10) {
  const text = String(value || "-").trim() || "-";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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

function orderRatio(value, total) {
  const denominator = Number(total || 0);
  if (!denominator) return "0%";
  return `${Math.round((Number(value || 0) / denominator) * 1000) / 10}%`;
}

function formatMemberNumber(id) {
  return `U-${String(id || "").replace(/-/g, "").slice(-8).toUpperCase() || "UNKNOWN"}`;
}

function formatSubjectNumber(id) {
  return `DP-${String(id || "").replace(/-/g, "").slice(-6).toUpperCase() || "UNKNOWN"}`;
}

function guardianInitial(guardian) {
  const name = String(guardian?.name || guardian?.login_id || guardian?.email || "보").trim();
  return name.slice(0, 1).toUpperCase();
}

function guardianTypeLabel(guardian, subscription = null) {
  if (!guardian) return "일반";
  if (Number(guardian.is_admin || 0)) return "관리자";
  if (subscription?.status === "active" || Number(guardian.active_subscription_count || 0) > 0) return "VIP";
  return "일반";
}

function guardianTypeClass(guardian, subscription = null) {
  const label = guardianTypeLabel(guardian, subscription);
  if (label === "VIP") return "vip";
  if (label === "관리자") return "admin";
  return "normal";
}

function subscriptionStateClass(status) {
  if (status === "active") return "vip";
  if (status === "paused") return "inactive";
  return "normal";
}

function providerLoginLabel(guardian) {
  const provider = guardianProviderLabels(guardian)[0]?.label || "";
  if (!provider) return "";
  return provider === "ID" ? guardian?.login_id || "ID" : provider;
}

function guardianProviderLabels(guardian) {
  const key = String(guardian?.google_id || "");
  if (key.startsWith("kakao:")) return [{ label: "KAKAO", className: "kakao" }];
  if (key.startsWith("naver:")) return [{ label: "NAVER", className: "naver" }];
  if (key.startsWith("credentials:")) return [{ label: "ID", className: "credentials" }];
  if (key) return [{ label: "GOOGLE", className: "google" }];
  return [{ label: "미연결", className: "neutral" }];
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

function formatOrderProductName(order) {
  const productName = order?.product_name || "상품 미확인";
  return order?.design_name ? `${productName} - ${order.design_name}` : productName;
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

function qrLifecycleLabel(status) {
  if (status === "discarded") return "폐기";
  if (status === "in_use") return "사용중";
  return "미사용";
}

function qrLifecycleClass(qr) {
  if (qr?.lifecycle_status === "discarded") return "discarded";
  if (qr?.lifecycle_status === "in_use") return "in-use";
  return "unused";
}

function qrActivationLabel(qr) {
  return Number(qr?.is_active || 0) === 1 ? "활성" : "미활성";
}

function qrActivationClass(qr) {
  return Number(qr?.is_active || 0) === 1 ? "active" : "inactive";
}

function formatQrSubjectLabel(qr) {
  if (!qr?.subject_name) return "미배정";
  const meta = [qr.subject_gender, calculateAgeLabel(qr.subject_birth_date)].filter(Boolean).join("/");
  return meta ? `${qr.subject_name} (${meta})` : qr.subject_name;
}

function formatFullAddress(address, detailAddress) {
  return [address, detailAddress].filter(Boolean).join(" ") || "주소 미입력";
}

function formatOrderNumber(order) {
  return order.toss_order_id || `ORDER-${String(order.id || "").slice(0, 8).toUpperCase()}`;
}

function formatSubscriptionNumber(subscription) {
  const compactId = String(subscription?.subscription_id || subscription?.id || "").replace(/-/g, "").slice(0, 12).toUpperCase();
  return `SS-${compactId || "UNKNOWN"}`;
}

function subscriptionPlanLabel(subscription) {
  if (!subscription) return "-";
  if (subscription.plan_name) return subscription.plan_name;
  if (subscription.plan_months) return `${subscription.plan_months}개월 이용권`;
  return "이용권";
}

function formatSubscriptionPeriod(subscription) {
  const start = formatDate(subscription?.current_period_start);
  const end = formatDate(subscription?.current_period_end);
  if (start === "-" && end === "-") return "-";
  return `${start} ~ ${end}`;
}

function subscriptionAdminStateClass(status) {
  if (status === "active") return "active";
  if (status === "ready") return "ready";
  if (status === "paused") return "paused";
  if (status === "expired") return "expired";
  if (status === "cancelled") return "cancelled";
  return "none";
}

function formatAdNumber(ad) {
  const compactId = String(ad?.id || "").replace(/-/g, "").slice(0, 10).toUpperCase();
  return `AD-${compactId || "UNKNOWN"}`;
}

function formatAdTargetLocation(ad) {
  const lat = Number(ad?.region_latitude);
  const lng = Number(ad?.region_longitude);
  const radius = Number(ad?.region_radius_km || 0);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "지도 위치 미설정";
  const radiusLabel = radius > 0 ? `반경 ${radius}km` : "반경 미설정";
  return `${radiusLabel} / ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function formatAdMetaStatus(status) {
  if (status === "campaign_active") return "캠페인 활성";
  if (status === "campaign_paused") return "캠페인 일시정지";
  if (status === "campaign_not_created") return "캠페인 미생성";
  if (status === "campaign_ended_paused") return "종료 처리됨";
  if (status === "meta_api_access_blocked") return "Meta 권한 승인 필요";
  if (status === "meta_api_pending") return "연동 대기";
  return status || "연동 대기";
}

function formatPaymentNumber(payment) {
  if (payment?.payment_kind === "ad") {
    return `AD-${String(payment.id || payment.payment_number || "").replace(/-/g, "").slice(0, 10).toUpperCase() || "UNKNOWN"}`;
  }
  return payment?.payment_number || `PAY-${String(payment?.id || "").slice(0, 8).toUpperCase() || "UNKNOWN"}`;
}

function formatCouponNumber(coupon) {
  return coupon?.coupon_number || `CU-${String(coupon?.id || "").replace(/-/g, "").slice(0, 8).toUpperCase() || "UNKNOWN"}`;
}

function couponDiscountTypeLabel(type) {
  return type === "fixed" ? "정액" : "정률";
}

function couponDiscountValueLabel(coupon) {
  const value = Number(coupon?.discount_value || 0);
  if (coupon?.discount_type === "fixed") return `${formatMetricValue(value)}원`;
  return `${formatMetricValue(value)}%`;
}

function couponStatusLabel(status) {
  return status === "inactive" ? "불가능" : "가능";
}

function couponServiceLabel(scope) {
  const labels = {
    all: "전체",
    subscription: "구독",
    sticker: "스티커",
    bracelet: "팔찌",
    necklace: "목걸이",
    keyring: "키링",
    ad: "광고",
  };
  return labels[scope] || "전체";
}

function adminMessageChannelLabel(channel) {
  if (channel === "kakao") return "카카오톡";
  return channel === "push" ? "푸시 알림" : channel || "-";
}

function adminMessageStatusLabel(status) {
  if (status === "sent") return "발송완료";
  return "저장됨";
}

function adminMessageTargetLabel(message) {
  if (message?.target_type === "subject") {
    const subjectName = message.subject_name || "대상자 선택";
    const guardianName = message.subject_guardian_name || message.subject_guardian_email || message.subject_guardian_google_email || "";
    return guardianName ? `${subjectName} (${guardianName})` : subjectName;
  }
  return "전체 회원";
}

function adminMessageTargetTypeLabel(targetType) {
  return targetType === "subject" ? "대상자 보호자" : "전체 회원";
}

function formatCouponPeriod(coupon) {
  const start = formatDate(coupon?.start_date);
  const end = formatDate(coupon?.end_date);
  if (start === "-" && end === "-") return "-";
  return `${start}~${end}`;
}

function paymentKindLabel(payment) {
  const group = payment?.payment_group || (payment?.payment_kind === "ad" ? "광고" : "상품");
  const item = payment?.payment_item || "-";
  return `${group} - ${item}`;
}

function paymentTypeLabel(payment) {
  if (payment?.payment_group) return payment.payment_group;
  if (payment?.payment_kind === "subscription") return "구독";
  if (payment?.payment_kind === "ad") return "광고";
  return "주문";
}

function paymentRefundableAmount(payment) {
  if (!payment) return 0;
  return Math.max(0, Number(payment.amount || 0) - Number(payment.refund_amount || 0));
}

function isPaidOrder(status) {
  return ["paid", "paid_waiting_activation", "activated"].includes(status);
}

function paymentStatusLabel(status) {
  if (isPaidOrder(status)) return "결제완료";
  if (["draft", "payment_pending", "subscription_pending", "subscription_processing", "pending"].includes(status)) return "결제대기";
  if (status === "refunded") return "환불접수";
  if (status === "failed") return "결제 실패";
  if (status === "cancelled") return "결제취소";
  return status || "상태 미확인";
}

function paymentStateClass(status) {
  if (isPaidOrder(status)) return "payment-paid";
  if (status === "refunded") return "payment-refunded";
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
  if (filters.product) params.set("orderProduct", filters.product);
  if (filters.payment && filters.payment !== "all") params.set("payment", filters.payment);
  if (filters.fulfillment && filters.fulfillment !== "all") params.set("fulfillment", filters.fulfillment);
  if (filters.startDate) params.set("orderStart", filters.startDate);
  if (filters.endDate) params.set("orderEnd", filters.endDate);
  if (orderId) params.set("order", orderId);
  return `/admin?${params.toString()}`;
}

function buildSubscriptionListUrl(filters, subscriptionId = "") {
  const params = new URLSearchParams({ section: "subscriptions" });
  if (filters.query) params.set("subscriptionQuery", filters.query);
  if (filters.plan && filters.plan !== "all") params.set("subscriptionPlan", filters.plan);
  if (filters.status && filters.status !== "all") params.set("subscriptionStatus", filters.status);
  if (filters.payment && filters.payment !== "all") params.set("subscriptionPayment", filters.payment);
  if (filters.startDate) params.set("subscriptionStart", filters.startDate);
  if (filters.endDate) params.set("subscriptionEnd", filters.endDate);
  if (subscriptionId) params.set("subscription", subscriptionId);
  return `/admin?${params.toString()}`;
}

function buildPaymentListUrl(filters, paymentRowId = "") {
  const params = new URLSearchParams({ section: "payments" });
  if (filters?.query) params.set("paymentLedgerQuery", filters.query);
  if (filters?.type && filters.type !== "all") params.set("paymentLedgerType", filters.type);
  if (filters?.status && filters.status !== "all") params.set("paymentLedgerStatus", filters.status);
  if (filters?.startDate) params.set("paymentStart", filters.startDate);
  if (filters?.endDate) params.set("paymentEnd", filters.endDate);
  if (paymentRowId) params.set("paymentRecord", paymentRowId);
  return `/admin?${params.toString()}`;
}

function buildCouponListUrl(filters, couponId = "") {
  const params = new URLSearchParams({ section: "coupons" });
  if (filters?.query) params.set("couponQuery", filters.query);
  if (filters?.discountType && filters.discountType !== "all") params.set("couponDiscountType", filters.discountType);
  if (filters?.status && filters.status !== "all") params.set("couponStatus", filters.status);
  if (couponId) params.set("coupon", couponId);
  return `/admin?${params.toString()}`;
}

function buildAdListUrl(filters, adId = "") {
  const params = new URLSearchParams({ section: "ads" });
  if (filters?.query) params.set("adQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("adStatus", filters.status);
  if (filters?.review && filters.review !== "all") params.set("adReview", filters.review);
  if (filters?.region && filters.region !== "all") params.set("adRegion", filters.region);
  if (filters?.startDate) params.set("adStart", filters.startDate);
  if (filters?.endDate) params.set("adEnd", filters.endDate);
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

function buildAdminMessageUrl(filters, messageId = "", compose = false) {
  const params = new URLSearchParams({ section: "notifications" });
  if (filters?.query) params.set("messageQuery", filters.query);
  if (filters?.channel && filters.channel !== "all") params.set("messageChannel", filters.channel);
  if (filters?.status && filters.status !== "all") params.set("messageStatus", filters.status);
  if (filters?.startDate) params.set("messageStart", filters.startDate);
  if (filters?.endDate) params.set("messageEnd", filters.endDate);
  if (messageId) params.set("message", messageId);
  if (compose) params.set("compose", "1");
  return `/admin?${params.toString()}`;
}

function buildMessageTemplateUrl(filters, templateId = "") {
  const params = new URLSearchParams({ section: "message-templates" });
  if (filters?.query) params.set("templateQuery", filters.query);
  if (filters?.channel && filters.channel !== "all") params.set("templateChannel", filters.channel);
  if (filters?.auto && filters.auto !== "all") params.set("templateAuto", filters.auto);
  if (templateId) params.set("template", templateId);
  return `/admin?${params.toString()}`;
}

function buildGuardianAdminUrl(filters, guardianId = "") {
  const params = new URLSearchParams({ section: "guardians" });
  if (filters?.query) params.set("guardianAdminQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("guardianStatus", filters.status);
  if (filters?.type && filters.type !== "all") params.set("guardianType", filters.type);
  if (filters?.startDate) params.set("guardianStart", filters.startDate);
  if (filters?.endDate) params.set("guardianEnd", filters.endDate);
  if (guardianId) params.set("guardian", guardianId);
  return `/admin?${params.toString()}`;
}

function buildSubjectAdminUrl(filters, subjectId = "") {
  const params = new URLSearchParams({ section: "subjects" });
  if (filters?.query) params.set("subjectAdminQuery", filters.query);
  if (filters?.status && filters.status !== "all") params.set("subjectStatus", filters.status);
  if (filters?.qr && filters.qr !== "all") params.set("subjectQr", filters.qr);
  if (filters?.subscription && filters.subscription !== "all") params.set("subjectSubscription", filters.subscription);
  if (filters?.startDate) params.set("subjectStart", filters.startDate);
  if (filters?.endDate) params.set("subjectEnd", filters.endDate);
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
  if (status === "active") return "진행중";
  if (status === "paused") return "중단";
  if (status === "ready") return "심사전";
  if (status === "ended") return "만료";
  if (status === "rejected") return "반려";
  return "연동 대기";
}

function adReviewStatusLabel(status) {
  if (status === "pending") return "심사대기";
  if (status === "rejected") return "심사반려";
  if (status === "approved") return "승인완료";
  return "확인중";
}

function adReviewClass(status) {
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "approved") return "approved";
  return "none";
}

function displayAdSpentAmount(ad) {
  const spent = Number(ad?.display_spent_amount || ad?.spent_amount || 0);
  return spent > 0 ? spent : Number(ad?.amount || 0);
}

function adBudgetProgressPercent(ad) {
  const amount = Number(ad?.amount || 0);
  if (amount <= 0) return 0;
  const spent = Number(ad?.display_spent_amount || ad?.spent_amount || 0);
  if (spent > 0) return Math.max(0, Math.min(100, Math.round((spent / amount) * 100)));
  if (ad?.status === "ended") return 100;

  const start = new Date(ad?.start_date);
  const end = new Date(ad?.end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  const now = new Date();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

function calculateAdClickCost(ad) {
  const clicks = Number(ad?.click_count || 0);
  if (clicks <= 0) return 0;
  return Math.round(displayAdSpentAmount(ad) / clicks);
}

function calculateAdCtr(ad) {
  const impressions = Number(ad?.display_impression_count || ad?.impression_count || 0);
  const clicks = Number(ad?.click_count || 0);
  if (impressions <= 0 || clicks <= 0) return 0;
  return (clicks / impressions) * 100;
}

function formatPercent(value) {
  const number = Number(value || 0);
  return `${number.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}%`;
}

function isBaseAdminUser(user) {
  return isDefaultAdminEmail(user.email) || isDefaultAdminEmail(user.google_email);
}
