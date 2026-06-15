import { deleteSubjectAction, saveGuardianAction, saveSubjectAction } from "./actions";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";
import PushNotificationButton from "./push-notification-button";
import TossSubscriptionButton from "./toss-subscription-button";
import { isAdminSession } from "../lib/admin";

const genders = ["남성", "여성", "기타"];
const statuses = ["문제없음", "찾는중", "QR활성화필요"];

export default function GuardianDashboard({
  guardian,
  subjects,
  subscription,
  subscriptionPlans = [],
  session,
  activeTab = "dashboard",
}) {
  const emptySlots = Array.from({ length: Math.max(0, 4 - subjects.length) });
  const guardianComplete = Boolean(
    guardian.name && guardian.login_id && guardian.password_hash && guardian.phone && guardian.email
  );
  const guardianActive = guardian.is_active !== 0;
  const admin = isAdminSession(session) || Number(guardian.is_admin || 0) === 1;
  const isDashboard = activeTab !== "info";

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="intro-kicker">{guardianComplete ? "보호자 대시보드" : "정보 입력"}</p>
            <h1 className="dashboard-title">
              {isDashboard
                ? guardianComplete
                  ? `안녕하세요, ${guardian.name}님!`
                  : "대시보드 준비가 필요합니다"
                : "정보입력"}
            </h1>
            <p className="dashboard-subtitle">
              {isDashboard
                ? guardianComplete
                  ? "로그인한 보호자에게 등록된 관리대상과 현재 상태를 확인할 수 있습니다."
                  : "보호자 정보 입력을 완료하면 대시보드에서 관리대상을 바로 조회할 수 있습니다."
                : "보호자 정보와 관리대상 정보를 입력하고 수정합니다."}
            </p>
          </div>
          <div className="dashboard-header-actions">
            <span className="session-email">{session.user?.email}</span>
            {admin && (
              <a className="admin-link" href="/admin">
                관리자 페이지
              </a>
            )}
            <PushNotificationButton />
            <LogoutButton />
          </div>
        </header>

        {!guardianActive ? (
          <section className="dashboard-panel setup-panel">
            <h2>계정이 비활성화되었습니다</h2>
            <p>관리자에게 문의해 주세요. 비활성화된 보호자 계정은 관리 기능을 사용할 수 없습니다.</p>
          </section>
        ) : (
          <>

        <nav className="dashboard-menu" aria-label="보호자 메뉴">
          <a className={isDashboard ? "active" : ""} href="/?tab=dashboard">
            대시보드
          </a>
          <a className={!isDashboard ? "active" : ""} href="/?tab=info">
            정보입력
          </a>
        </nav>

        {isDashboard ? (
          <DashboardTab
            guardian={guardian}
            guardianComplete={guardianComplete}
            subjects={subjects}
            subscription={subscription}
            subscriptionPlans={subscriptionPlans}
          />
        ) : (
          <InfoTab guardian={guardian} session={session} subjects={subjects} emptySlots={emptySlots} />
        )}

        <div className="install-area dashboard-install">
          <PwaInstallPrompt />
        </div>
          </>
        )}
      </section>
    </main>
  );
}

function DashboardTab({ guardian, guardianComplete, subjects, subscription, subscriptionPlans }) {
  if (!guardianComplete) {
    return (
      <section className="dashboard-panel setup-panel">
        <h2>정보 입력이 필요합니다</h2>
        <p>대시보드를 사용하려면 보호자 정보를 먼저 입력해 주세요.</p>
        <a className="action" href="/?tab=info">
          정보입력으로 이동
        </a>
      </section>
    );
  }

  return (
    <>
      <StatusDashboard
        guardian={guardian}
        subjects={subjects}
        subscription={subscription}
        subscriptionPlans={subscriptionPlans}
      />
      <section className="dashboard-panel summary-panel">
        <div className="panel-heading">
          <h2>관리대상 요약</h2>
          <span>{subjects.length}/4명</span>
        </div>
        <p>상태 변경이나 정보 수정은 정보입력 메뉴에서 진행할 수 있습니다.</p>
      </section>
    </>
  );
}

function InfoTab({ guardian, session, subjects, emptySlots }) {
  return (
    <div className="dashboard-grid info-grid">
      <section className="dashboard-panel info-panel">
        <h2 id="guardian-info">보호자 정보</h2>
        <GuardianForm guardian={guardian} session={session} />
      </section>

      <section className="dashboard-panel info-panel">
        <div className="panel-heading">
          <h2 id="subjects-info">관리대상 정보</h2>
          <span>{subjects.length}/4명</span>
        </div>
        <div className="subject-list">
          {subjects.map((subject) => (
            <SubjectForm key={subject.id} subject={subject} />
          ))}
          {emptySlots.length > 0 && <SubjectForm />}
        </div>
      </section>
    </div>
  );
}

function StatusDashboard({ guardian, subjects, subscription, subscriptionPlans }) {
  const slots = Array.from({ length: 4 }, (_, index) => subjects[index] || null);

  return (
    <section className="status-dashboard" aria-label="관리대상 현재 상태">
      <div className="status-phone">
        <div className="status-phone-top">
          <span className="bell-icon" aria-hidden="true">!</span>
          <h2>현재 상태</h2>
          <TossSubscriptionButton subscription={subscription} plans={subscriptionPlans} />
        </div>
        <div className="managed-list">
          {slots.map((subject, index) =>
            subject ? (
              <article className="managed-card" key={subject.id}>
                <div className="managed-photo">
                  {subject.photo_data_url ? (
                    <img src={subject.photo_data_url} alt={`${subject.name} 사진`} />
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </div>
                <div className="managed-info">
                  <strong>{subject.name}</strong>
                  <span>{formatDate(subject.birth_date)}</span>
                </div>
                <span className={`status-badge ${statusClass(subject.status)}`}>
                  {subject.status || "문제없음"}
                </span>
              </article>
            ) : (
              <article className="managed-card empty-managed" key={`empty-${index}`}>
                <div className="managed-photo">
                  <span aria-hidden="true" />
                </div>
                <div className="managed-info">
                  <strong>미등록</strong>
                  <span>관리대상을 추가하세요</span>
                </div>
                <span className="status-badge neutral">빈 슬롯</span>
              </article>
            )
          )}
        </div>
        <div className="quick-actions">
          <a href="/?tab=info#subjects-info">
            <span aria-hidden="true">!</span>
            실종신고
          </a>
          <a href="/?tab=info#subjects-info">
            <span aria-hidden="true">B</span>
            상품 구매
          </a>
          <a href="/?tab=info#guardian-info">
            <span aria-hidden="true">M</span>
            내 정보
          </a>
        </div>
      </div>
    </section>
  );
}

function GuardianForm({ guardian, session }) {
  return (
    <form action={saveGuardianAction} className="form-grid">
              <label>
                이름
                <input name="guardianName" defaultValue={guardian.name || ""} required />
              </label>
              <label>
                아이디
                <input name="loginId" defaultValue={guardian.login_id || ""} required />
              </label>
              <label>
                비밀번호
                <input
                  name="password"
                  type="password"
                  placeholder={guardian.password_hash ? "변경할 때만 입력" : "비밀번호 입력"}
                  required={!guardian.password_hash}
                />
              </label>
              <label>
                연락받을 전화번호
                <input name="phone" defaultValue={guardian.phone || ""} required />
              </label>
              <label className="full-field">
                주소
                <input name="address" defaultValue={guardian.address || ""} placeholder="보호자 주소" />
              </label>
              <label className="full-field">
                이메일
                <input name="email" type="email" defaultValue={guardian.email || session.user?.email || ""} required />
              </label>
              <button className="action" type="submit">
                보호자 정보 저장
              </button>
            </form>
  );
}

function SubjectForm({ subject }) {
  const isExisting = Boolean(subject?.id);

  return (
    <article className="subject-card">
      <form action={saveSubjectAction} className="subject-form">
        <input type="hidden" name="subjectId" defaultValue={subject?.id || ""} />
        <input type="hidden" name="existingPhoto" defaultValue={subject?.photo_data_url || ""} />
        <input type="hidden" name="existingPhotoName" defaultValue={subject?.photo_name || ""} />

        <div className="subject-photo">
          {subject?.photo_data_url ? (
            <img src={subject.photo_data_url} alt={`${subject.name} 사진`} />
          ) : (
            <span>사진</span>
          )}
        </div>

        <div className="subject-fields">
          <label>
            이름
            <input name="subjectName" defaultValue={subject?.name || ""} required />
          </label>
          <label>
            생년월일
            <input name="birthDate" type="date" defaultValue={subject?.birth_date || ""} required />
          </label>
          <label>
            성별
            <select name="gender" defaultValue={subject?.gender || ""} required>
              <option value="" disabled>
                선택
              </option>
              {genders.map((gender) => (
                <option value={gender} key={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
          <label>
            현재 상태
            <select name="status" defaultValue={subject?.status || "문제없음"} required>
              {statuses.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="full-field">
            사진 업로드
            <input name="photo" type="file" accept="image/*" />
          </label>
          <button className="action" type="submit">
            {isExisting ? "대상자 정보 수정" : "대상자 추가"}
          </button>
        </div>
      </form>

      {isExisting && (
        <form action={deleteSubjectAction}>
          <input type="hidden" name="subjectId" value={subject.id} />
          <button className="danger-button" type="submit">
            삭제
          </button>
        </form>
      )}
    </article>
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
