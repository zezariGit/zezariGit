import { getServerSession } from "next-auth";
import QRCode from "qrcode";
import { GoogleLoginButton, LogoutButton } from "../auth-actions";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import { getAdminData, getQrAdminData } from "../../lib/db";
import { generateQrCodesAction, setGuardianActiveAction, setQrActiveAction } from "./actions";

export default async function AdminPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session) {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>관리자 로그인</h1>
          <p>관리자 페이지를 사용하려면 Google 로그인이 필요합니다.</p>
          <GoogleLoginButton />
        </section>
      </main>
    );
  }

  if (!isAdminSession(session)) {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>접근 권한이 없습니다</h1>
          <p>등록된 관리자 이메일만 관리자 페이지에 접근할 수 있습니다.</p>
          <LogoutButton />
        </section>
      </main>
    );
  }

  const activeSection = resolvedSearchParams?.section === "qr" ? "qr" : "guardians";
  const selectedGuardianId = resolvedSearchParams?.guardian || "";
  const adminData = activeSection === "guardians" ? await getAdminData(selectedGuardianId) : null;
  const qrData = activeSection === "qr" ? await getQrAdminData() : null;
  const qrItems = qrData ? await withQrImages(qrData.qrCodes) : [];

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="intro-kicker">관리자</p>
            <h1>{activeSection === "qr" ? "QR 관리" : "보호자 관리"}</h1>
            <p>
              {activeSection === "qr"
                ? "사람찾기 URL로 연결되는 QR 코드와 고유 문자열을 생성하고 활성 상태를 관리합니다."
                : "보호자를 활성화/비활성화하고, 선택한 보호자의 관리대상 4명을 조회합니다."}
            </p>
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
        </nav>

        {activeSection === "qr" ? (
          <QrManagementSection qrData={qrData} qrItems={qrItems} />
        ) : (
          <GuardianManagementSection adminData={adminData} />
        )}
      </section>
    </main>
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
                <button
                  className={selectedGuardian.is_active ? "danger-button compact" : "activate-button"}
                  type="submit"
                >
                  {selectedGuardian.is_active ? "비활성화" : "활성화"}
                </button>
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
          <button className="primary-button compact" type="submit">
            생성
          </button>
        </form>
        <div className="qr-stats" aria-label="QR 상태 요약">
          <span>활성 {qrData.activeCount}개</span>
          <span>비활성 {qrData.inactiveCount}개</span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>생성된 QR</h2>
          <span>{qrItems.length}개</span>
        </div>
        <div className="qr-grid">
          {qrItems.map((qr) => (
            <article className="qr-card" key={qr.id}>
              <div className="qr-image-wrap">
                <img src={qr.image} alt={`${qr.code} QR 코드`} />
              </div>
              <div className="qr-card-body">
                <div>
                  <strong>{qr.code}</strong>
                  <span>{qr.public_key}</span>
                </div>
                <a href={qr.target_url} target="_blank" rel="noreferrer">
                  {qr.target_url}
                </a>
                <div className="qr-card-footer">
                  <em className={qr.is_active ? "active-state" : "inactive-state"}>
                    {qr.is_active ? "활성" : "비활성"}
                  </em>
                  <form action={setQrActiveAction}>
                    <input type="hidden" name="qrId" value={qr.id} />
                    <input type="hidden" name="active" value={qr.is_active ? "0" : "1"} />
                    <button className={qr.is_active ? "danger-button compact" : "activate-button"} type="submit">
                      {qr.is_active ? "비활성화" : "활성화"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
          {qrItems.length === 0 && <p className="empty-text">생성된 QR 코드가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
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
