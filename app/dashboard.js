import { deleteSubjectAction, saveGuardianAction, saveSubjectAction } from "./actions";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";

const genders = ["남성", "여성", "기타"];

export default function GuardianDashboard({ guardian, subjects, session }) {
  const emptySlots = Array.from({ length: Math.max(0, 4 - subjects.length) });

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="intro-kicker">보호자 관리</p>
            <h1 className="dashboard-title">대상자 정보 관리</h1>
            <p className="dashboard-subtitle">
              로그인한 보호자 본인의 정보와 대상자 최대 4명의 정보를 저장하고 수정할 수 있습니다.
            </p>
          </div>
          <div className="dashboard-header-actions">
            <span className="session-email">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <h2>보호자 정보</h2>
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
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <h2>대상자 정보</h2>
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
