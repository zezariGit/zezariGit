import { getServerSession } from "next-auth";
import { GoogleLoginButton, LogoutButton } from "../auth-actions";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import { getAdminData } from "../../lib/db";
import { setGuardianActiveAction } from "./actions";

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

  const selectedGuardianId = resolvedSearchParams?.guardian || "";
  const { guardians, selectedGuardian, subjects } = await getAdminData(selectedGuardianId);
  const slots = Array.from({ length: 4 }, (_, index) => subjects[index] || null);

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="intro-kicker">관리자</p>
            <h1>보호자 관리</h1>
            <p>보호자를 활성화/비활성화하고, 선택한 보호자의 관리대상 4명을 조회합니다.</p>
          </div>
          <div className="admin-header-actions">
            <a className="admin-link" href="/">
              사용자 화면
            </a>
            <LogoutButton />
          </div>
        </header>

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
      </section>
    </main>
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
