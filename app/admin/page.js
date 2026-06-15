import { getServerSession } from "next-auth";
import QRCode from "qrcode";
import FormSubmitButton from "../form-submit-button";
import { LogoutButton, SocialLoginButtons } from "../auth-actions";
import StatusToast from "../status-toast";
import { isAdminSession, isDefaultAdminEmail } from "../../lib/admin";
import { authOptions, getConfiguredProviderIds } from "../../lib/auth";
import {
  getAdminData,
  getAdminSubscriptionPlansData,
  getAdminUsersData,
  getQrAdminData,
  isDbAdminSession,
} from "../../lib/db";
import {
  generateQrCodesAction,
  setGuardianActiveAction,
  setGuardianAdminAction,
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

  const activeSection = ["qr", "admins", "payments"].includes(resolvedSearchParams?.section)
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
  const adminData = activeSection === "guardians" ? await getAdminData(selectedGuardianId) : null;
  const qrData = activeSection === "qr" ? await getQrAdminData(qrFilters) : null;
  const adminUsersData = activeSection === "admins" ? await getAdminUsersData() : null;
  const paymentData = activeSection === "payments" ? await getAdminSubscriptionPlansData() : null;
  const qrItems = qrData ? await withQrImages(qrData.qrCodes) : [];
  const title =
    activeSection === "qr"
      ? "QR 관리"
      : activeSection === "admins"
        ? "관리자 관리"
        : activeSection === "payments"
          ? "결제 관리"
          : "보호자 관리";
  const description =
    activeSection === "qr"
      ? "사람찾기 URL로 연결되는 QR 코드와 고유 문자열을 생성하고 활성 상태를 관리합니다."
      : activeSection === "admins"
        ? "가입된 보호자 사용자에게 관리자 역할을 부여하거나 회수합니다."
        : activeSection === "payments"
          ? "구독 옵션별 기간과 가격을 관리합니다."
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
            <a className="admin-link" href="/">
              사용자 화면
            </a>
            <LogoutButton />
          </div>
        </header>

        <nav className="admin-menu" aria-label="관리자 메뉴">
          <a className={activeSection === "guardians" ? "active" : ""} href="/admin">
            보호자 관리
          </a>
          <a className={activeSection === "qr" ? "active" : ""} href="/admin?section=qr">
            QR 관리
          </a>
          <a className={activeSection === "admins" ? "active" : ""} href="/admin?section=admins">
            관리자 관리
          </a>
          <a className={activeSection === "payments" ? "active" : ""} href="/admin?section=payments">
            결제 관리
          </a>
        </nav>

        {activeSection === "qr" ? (
          <QrManagementSection qrData={qrData} qrItems={qrItems} />
        ) : activeSection === "admins" ? (
          <AdminRoleManagementSection adminUsersData={adminUsersData} />
        ) : activeSection === "payments" ? (
          <PaymentManagementSection paymentData={paymentData} />
        ) : (
          <GuardianManagementSection adminData={adminData} />
        )}
      </section>
      <StatusToast message={notice} type={noticeType} />
    </main>
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
            <a
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
            </a>
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
                      {subject.photo_data_url ? (
                        <img src={subject.photo_data_url} alt={`${subject.name} 사진`} />
                      ) : (
                        <span aria-hidden="true" />
                      )}
                    </div>
                    <strong>{subject.name}</strong>
                    <span>{formatDate(subject.birth_date)}</span>
                    <em className={`status-badge ${statusClass(subject.status)}`}>
                      {subject.status || "문제없음"}
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
          <a className="admin-link" href="/admin?section=qr">
            초기화
          </a>
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
                      <a className="activate-button" href={buildQrAssignUrl(qrData, qr.id)}>
                        매칭대상 조회
                      </a>
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
        <section className="qr-modal-backdrop" aria-label="QR 매칭 대상 조회">
          <div className="qr-modal">
            <div className="qr-modal-header">
              <div>
                <p className="intro-kicker">QR 매칭</p>
                <h2>매칭대상 조회</h2>
                <p>{selectedQr.code}에 연결할 미매칭 관리대상을 선택합니다.</p>
              </div>
              <a className="plain-button" href="/admin?section=qr">
                닫기
              </a>
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

function statusClass(status) {
  if (status === "찾는중") return "searching";
  if (status === "QR활성화필요") return "qr-needed";
  return "safe";
}

function isBaseAdminUser(user) {
  return isDefaultAdminEmail(user.email) || isDefaultAdminEmail(user.google_email);
}
