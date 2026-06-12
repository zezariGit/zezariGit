import { deleteSubjectAction, saveGuardianAction, saveSubjectAction } from "./actions";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";

const genders = ["남성", "여성", "기타"];
const statuses = ["문제없음", "찾는중", "QR활성화필요"];

export default function GuardianDashboard({ guardian, subjects, session }) {
  const emptySlots = Array.from({ length: Math.max(0, 4 - subjects.length) });
  const guardianComplete = Boolean(
    guardian.name && guardian.login_id && guardian.password_hash && guardian.phone && guardian.email
  );

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="intro-kicker">{guardianComplete ? "보호자 대시보드" : "정보 입력"}</p>
            <h1 className="dashboard-title">
              {guardianComplete ? `안녕하세요, ${guardian.name}님!` : "보호자 정보를 먼저 입력해 주세요"}
            </h1>
            <p className="dashboard-subtitle">
              {guardianComplete
                ? "로그인한 보호자에게 등록된 관리대상과 현재 상태를 확인할 수 있습니다."
                : "정보 입력이 완료되면 다음 로그인부터 대시보드에서 관리대상을 바로 조회할 수 있습니다."}
            </p>
          </div>
          <div className="dashboard-header-actions">
            <span className="session-email">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </header>

        {guardianComplete && <StatusDashboard guardian={guardian} subjects={subjects} />}

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <h2 id="guardian-info">{guardianComplete ? "내 정보 수정" : "보호자 정보 입력"}</h2>
            <GuardianForm guardian={guardian} session={session} />
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <h2 id="subjects-info">관리대상 정보 {guardianComplete ? "수정" : "입력"}</h2>
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

        <div className="install-area dashboard-install">
          <PwaInstallPrompt />
        </div>
      </section>
    </main>
  );
}

function StatusDashboard({ guardian, subjects }) {
  const slots = Array.from({ length: 4 }, (_, index) => subjects[index] || null);

  return (
    <section className="status-dashboard" aria-label="관리대상 현재 상태">
      <div className="status-phone">
        <div className="status-phone-top">
          <span className="bell-icon" aria-hidden="true">!</span>
          <h2>현재 상태</h2>
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
          <a href="#subjects-info">
            <span aria-hidden="true">!</span>
            실종신고
          </a>
          <a href="#subjects-info">
            <span aria-hidden="true">B</span>
            상품 구매
          </a>
          <a href="#guardian-info">
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
