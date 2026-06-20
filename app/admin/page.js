import { getServerSession } from "next-auth";
import Link from "next/link";
import QRCode from "qrcode";
import FormSubmitButton from "../form-submit-button";
import { LogoutButton, SocialLoginButtons } from "../auth-actions";
import ModalScrollLock from "../modal-scroll-lock";
import StatusToast from "../status-toast";
import { isAdminSession, isDefaultAdminEmail } from "../../lib/admin";
import { authOptions, getConfiguredProviderIds } from "../../lib/auth";
import {
  getAdminAdsData,
  getAdminData,
  getAdminOrdersData,
  getAdminProductsData,
  getAdminSubscriptionPlansData,
  getAdminUsersData,
  getQrAdminData,
  isDbAdminSession,
} from "../../lib/db";
import {
  generateQrCodesAction,
  setGuardianActiveAction,
  setGuardianAdminAction,
  setAdDailyRateAction,
  setProductCatalogItemAction,
  setProductOrderFulfillmentAction,
  setQrActiveAction,
  setQrSubjectAction,
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

  const activeSection = ["qr", "admins", "payments", "products", "orders", "ads"].includes(resolvedSearchParams?.section)
    ? resolvedSearchParams.section
    : "guardians";
  const selectedGuardianId = resolvedSearchParams?.guardian || "";
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
  const adminData = activeSection === "guardians" ? await getAdminData(selectedGuardianId) : null;
  const qrData = activeSection === "qr" ? await getQrAdminData(qrFilters) : null;
  const adminUsersData = activeSection === "admins" ? await getAdminUsersData() : null;
  const paymentData = activeSection === "payments" ? await getAdminSubscriptionPlansData() : null;
  const productsData = activeSection === "products" ? await getAdminProductsData() : null;
  const ordersData = activeSection === "orders" ? await getAdminOrdersData(orderFilters) : null;
  const adsData = activeSection === "ads" ? await getAdminAdsData() : null;
  const qrItems = qrData ? await withQrImages(qrData.qrCodes) : [];
  const title =
    activeSection === "qr"
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
              : "보호자 관리";
  const description =
    activeSection === "qr"
      ? "사람찾기 URL로 연결되는 QR 코드와 고유 문자열을 생성하고 활성 상태를 관리합니다."
      : activeSection === "admins"
        ? "가입된 보호자 사용자에게 관리자 역할을 부여하거나 회수합니다."
        : activeSection === "payments"
          ? "구독 옵션별 기간과 가격을 관리합니다."
          : activeSection === "products"
            ? "사용자 상품 선택 화면에 노출되는 상품 이미지, 가격, 활성 상태를 관리합니다."
            : activeSection === "orders"
              ? "주문과 결제 상태를 조회하고 배송상태, 택배사, 송장번호를 관리합니다."
            : activeSection === "ads"
              ? "광고 일 단가를 설정하고 사용자별 광고 진행사항을 조회합니다."
              : "보호자를 활성화/비활성화하고, 선택한 보호자의 관리대상 4명을 조회합니다.";

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="intro-kicker">관리자</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="admin-header-actions">
            <Link className="admin-link" href="/">
              사용자 화면
            </Link>
            <LogoutButton />
          </div>
        </header>

        <nav className="admin-menu" aria-label="관리자 메뉴">
          <Link className={activeSection === "guardians" ? "active" : ""} href="/admin">
            보호자 관리
          </Link>
          <Link className={activeSection === "orders" ? "active" : ""} href="/admin?section=orders">
            주문/배송
          </Link>
          <Link className={activeSection === "qr" ? "active" : ""} href="/admin?section=qr">
            QR 관리
          </Link>
          <Link className={activeSection === "admins" ? "active" : ""} href="/admin?section=admins">
            관리자 관리
          </Link>
          <Link className={activeSection === "payments" ? "active" : ""} href="/admin?section=payments">
            결제 관리
          </Link>
          <Link className={activeSection === "products" ? "active" : ""} href="/admin?section=products">
            상품 관리
          </Link>
          <Link className={activeSection === "ads" ? "active" : ""} href="/admin?section=ads">
            광고 관리
          </Link>
        </nav>

        {activeSection === "qr" ? (
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
        ) : (
          <GuardianManagementSection adminData={adminData} />
        )}
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
  );
}

function OrderManagementSection({ ordersData }) {
  const { orders, summary, filters } = ordersData;
  const returnTo = buildOrderListUrl(filters);

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

      <section className="admin-panel order-filter-panel">
        <form className="admin-order-filter" action="/admin">
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
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>주문 목록</h2>
          <span>{orders.length}건 조회</span>
        </div>
        <div className="admin-order-list">
          {orders.map((order) => {
            const paid = isPaidOrder(order.status);
            const currentFulfillment = order.fulfillment_status || (paid ? "preparing" : "pending");
            return (
              <article className="admin-order-card" key={order.id}>
                <header className="admin-order-card-header">
                  <div>
                    <span>주문번호</span>
                    <strong>{formatOrderNumber(order)}</strong>
                    <time>{formatDateTime(order.created_at)}</time>
                  </div>
                  <div className="admin-order-badges">
                    <em className={`order-state ${paymentStateClass(order.status)}`}>{paymentStatusLabel(order.status)}</em>
                    <em className={`order-state fulfillment-${currentFulfillment}`}>{fulfillmentStatusLabel(currentFulfillment)}</em>
                  </div>
                </header>

                <div className="admin-order-details">
                  <section>
                    <h3>주문 상품</h3>
                    <dl>
                      <dt>상품</dt><dd>{order.product_name || "상품 미확인"} / {order.quantity || 1}개</dd>
                      <dt>대상자</dt><dd>{order.subject_name || "미선택"}</dd>
                      <dt>구매유형</dt><dd>{order.order_type === "standalone" ? "상품 단독 구매" : `${order.plan_months || "-"}개월 구독`}</dd>
                      <dt>결제금액</dt><dd>{formatCurrency(order.amount)}</dd>
                      <dt>결제수단</dt><dd>{order.payment_method || "-"}</dd>
                      <dt>결제일</dt><dd>{formatDateTime(order.paid_at)}</dd>
                    </dl>
                  </section>
                  <section>
                    <h3>주문자/배송지</h3>
                    <dl>
                      <dt>보호자</dt><dd>{order.guardian_name || "이름 미입력"}</dd>
                      <dt>연락처</dt><dd>{order.guardian_phone || "전화번호 미입력"}</dd>
                      <dt>이메일</dt><dd>{order.guardian_email || order.guardian_google_email || "-"}</dd>
                      <dt>수령인</dt><dd>{order.display_recipient_name || "이름 미입력"}</dd>
                      <dt>수령 연락처</dt><dd>{order.display_recipient_phone || "전화번호 미입력"}</dd>
                      <dt>주소</dt><dd>{formatFullAddress(order.shipping_address, order.shipping_address_detail)}</dd>
                    </dl>
                  </section>
                </div>

                <form className="admin-shipping-form" action={setProductOrderFulfillmentAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <label>
                    배송상태
                    <select name="fulfillmentStatus" defaultValue={currentFulfillment}>
                      {!paid && <option value="pending">결제 확인 전</option>}
                      {paid && <option value="preparing">배송 준비</option>}
                      {paid && <option value="shipped">배송 중</option>}
                      {paid && <option value="delivered">배송 완료</option>}
                      <option value="cancelled">배송 취소</option>
                    </select>
                  </label>
                  <label>
                    택배사
                    <select name="carrier" defaultValue={order.carrier || ""}>
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
                    <input name="trackingNumber" defaultValue={order.tracking_number || ""} placeholder="송장번호 입력" />
                  </label>
                  <label className="admin-order-memo-field">
                    관리자 메모
                    <input name="adminMemo" defaultValue={order.admin_memo || ""} placeholder="포장·배송 관련 내부 메모" />
                  </label>
                  <div className="admin-shipping-meta">
                    <span>발송 {formatDateTime(order.shipped_at)}</span>
                    <span>완료 {formatDateTime(order.delivered_at)}</span>
                  </div>
                  <FormSubmitButton pendingText="저장중">배송정보 저장</FormSubmitButton>
                </form>
                {!paid && <p className="order-payment-warning">결제 완료 전에는 배송준비·배송중·배송완료로 변경할 수 없습니다.</p>}
              </article>
            );
          })}
          {orders.length === 0 && <p className="empty-text">조건에 맞는 주문이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function AdManagementSection({ adsData }) {
  const { setting, ads } = adsData;
  const activeCount = ads.filter((ad) => ad.status === "active").length;
  const pausedCount = ads.filter((ad) => ad.status === "paused").length;

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
          <span>일시정지 {pausedCount}건</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>사용자별 광고 진행사항</h2>
          <span>{ads.length}건</span>
        </div>
        <div className="admin-ad-grid">
          {ads.map((ad) => (
            <article className="admin-ad-card" key={ad.id}>
              <div className="admin-ad-main">
                <strong>{ad.subject_name || "관리대상 미입력"}</strong>
                <span>{ad.guardian_name || ad.guardian_email || ad.guardian_google_email || "보호자 미입력"}</span>
                <span>{ad.guardian_phone || "전화번호 미입력"}</span>
              </div>
              <div className="admin-ad-meta">
                <em className={`ad-status-pill ${ad.status}`}>{adStatusLabel(ad.status)}</em>
                <span>{ad.region}</span>
                <span>
                  {formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}
                </span>
                <span>
                  {ad.days}일 / {formatCurrency(ad.amount)}
                </span>
                <span>일 단가 {formatCurrency(ad.daily_rate)}</span>
                <span>Meta API: {ad.meta_campaign_id || ad.meta_status || "연동 대기"}</span>
              </div>
            </article>
          ))}
          {ads.length === 0 && <p className="empty-text">등록된 광고 진행사항이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function PaymentManagementSection({ paymentData }) {
  const { plans } = paymentData;

  return (
    <div className="qr-admin-stack">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>구독 옵션 가격</h2>
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
          <span>{products.length}개</span>
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
          <span>{users.length}명</span>
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
  const { guardians, selectedGuardian, subjects } = adminData;
  const slots = Array.from({ length: 4 }, (_, index) => subjects[index] || null);

  return (
    <div className="admin-layout">
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>보호자</h2>
          <span>{guardians.length}명</span>
        </div>
        <div className="guardian-grid">
          {guardians.map((guardian) => (
            <Link
              className={guardian.id === selectedGuardian?.id ? "guardian-row active" : "guardian-row"}
              href={`/admin?guardian=${guardian.id}`}
              key={guardian.id}
            >
              <div>
                <strong>{guardian.name || "이름 미입력"}</strong>
                <span>{guardian.email || guardian.google_email || "-"}</span>
              </div>
              <div className="guardian-meta">
                <span>{guardian.subject_count || 0}/4명</span>
                <em className={guardian.is_active ? "active-state" : "inactive-state"}>
                  {guardian.is_active ? "활성" : "비활성"}
                </em>
              </div>
            </Link>
          ))}
          {guardians.length === 0 && <p className="empty-text">등록된 보호자가 없습니다.</p>}
        </div>
      </section>

      <section className="admin-panel">
        {selectedGuardian ? (
          <>
            <div className="selected-guardian">
              <div>
                <h2>{selectedGuardian.name || "이름 미입력"}</h2>
                <p>{selectedGuardian.email || selectedGuardian.google_email || "-"}</p>
                <p>{selectedGuardian.phone || "전화번호 미입력"}</p>
              </div>
              <form action={setGuardianActiveAction}>
                <input type="hidden" name="guardianId" value={selectedGuardian.id} />
                <input type="hidden" name="active" value={selectedGuardian.is_active ? "0" : "1"} />
                <input type="hidden" name="returnTo" value={`/admin?guardian=${selectedGuardian.id}`} />
                <FormSubmitButton
                  className={selectedGuardian.is_active ? "danger-button compact" : "activate-button"}
                  pendingText={selectedGuardian.is_active ? "비활성화중" : "활성화중"}
                >
                  {selectedGuardian.is_active ? "비활성화" : "활성화"}
                </FormSubmitButton>
              </form>
            </div>

            <div className="admin-subject-grid">
              {slots.map((subject, index) =>
                subject ? (
                  <article className="admin-subject-card" key={subject.id}>
                    <div className="admin-subject-photo">
                      {subject.photo_url || subject.photo_data_url ? (
                        <img src={subject.photo_url || subject.photo_data_url} alt={`${subject.name} 사진`} />
                      ) : (
                        <span aria-hidden="true" />
                      )}
                    </div>
                    <strong>{subject.name}</strong>
                    <span>{formatDate(subject.birth_date)}</span>
                    <em className={`status-badge ${statusClass(subject.status)}`}>
                      {statusLabel(subject.status)}
                    </em>
                  </article>
                ) : (
                  <article className="admin-subject-card empty-admin-subject" key={`empty-${index}`}>
                    <div className="admin-subject-photo">
                      <span aria-hidden="true" />
                    </div>
                    <strong>미등록</strong>
                    <span>{index + 1}번 슬롯</span>
                    <em className="status-badge neutral">빈 슬롯</em>
                  </article>
                )
              )}
            </div>
          </>
        ) : (
          <p className="empty-text">보호자를 선택해 주세요.</p>
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
          <span>{qrData.filteredCount}/{qrData.total}개</span>
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

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
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

function formatFullAddress(address, detailAddress) {
  return [address, detailAddress].filter(Boolean).join(" ") || "주소 미입력";
}

function formatOrderNumber(order) {
  return order.toss_order_id || `ORDER-${String(order.id || "").slice(0, 8).toUpperCase()}`;
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

function buildOrderListUrl(filters) {
  const params = new URLSearchParams({ section: "orders" });
  if (filters.query) params.set("orderQuery", filters.query);
  if (filters.payment && filters.payment !== "all") params.set("payment", filters.payment);
  if (filters.fulfillment && filters.fulfillment !== "all") params.set("fulfillment", filters.fulfillment);
  return `/admin?${params.toString()}`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
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

function adStatusLabel(status) {
  if (status === "active") return "광고중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "준비중";
  if (status === "ended") return "종료";
  return "연동 대기";
}

function isBaseAdminUser(user) {
  return isDefaultAdminEmail(user.email) || isDefaultAdminEmail(user.google_email);
}
