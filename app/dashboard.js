import {
  createSubjectAdAction,
  deleteSubjectAction,
  endSubjectAdAction,
  pauseSubjectAdAction,
  resumeSubjectAdAction,
  saveGuardianAction,
  saveSubjectAction,
} from "./actions";
import AdCampaignModal from "./ad-campaign-modal";
import FormSubmitButton from "./form-submit-button";
import KakaoPostcodeAddress from "./kakao-postcode-address";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";
import ModalScrollLock from "./modal-scroll-lock";
import NotificationBell from "./notification-bell";
import PushNotificationButton from "./push-notification-button";
import QRCode from "qrcode";
import SocialSignupCompletion from "./social-signup-completion";
import SubjectVoiceRecorder from "./subject-voice-recorder";
import { isAdminSession } from "../lib/admin";

const genders = ["남성", "여성", "기타"];
const statuses = ["상품구매필요", "QR활성화필요", "안전", "찾는중"];

export default async function GuardianDashboard({
  guardian,
  subjects,
  subscription,
  subscriptionPlans = [],
  adDailyRate = 0,
  session,
  activeTab = "dashboard",
  showMyPage = false,
  adSubjectId = "",
  registeredSubjectId = "",
}) {
  const subjectsWithQr = await withSubjectQrImages(subjects);
  const selectedAdSubject = subjectsWithQr.find((subject) => subject.id === adSubjectId) || null;
  const emptySlots = Array.from({ length: Math.max(0, 4 - subjectsWithQr.length) });
  const registeredSubject = subjectsWithQr.find((subject) => subject.id === registeredSubjectId) || null;
  const guardianComplete = Boolean(
    guardian.name && guardian.login_id && guardian.password_hash && guardian.phone
  );
  const guardianActive = guardian.is_active !== 0;
  const admin = isAdminSession(session) || Number(guardian.is_admin || 0) === 1;
  const isDashboard = activeTab === "dashboard";
  const isGuardianTab = activeTab === "guardian";
  const isSubjectsTab = activeTab === "subjects";
  const currentTab = isGuardianTab ? "guardian" : isSubjectsTab ? "subjects" : "dashboard";
  const myPageHref = `/?tab=${currentTab}&panel=my`;
  const closeMyPageHref = `/?tab=${currentTab}`;

  return (
    <main className="dashboard-page">
      <section className={`dashboard-shell${guardianComplete && guardianActive ? " has-corner" : ""}`}>
        {guardianComplete && guardianActive && (
          <div className="dashboard-corner-bar" aria-label="사용자 빠른 메뉴">
            <NotificationBell />
            <a
              className="corner-icon-button my-page-corner-link"
              href={myPageHref}
              aria-label="마이페이지"
              title="마이페이지"
              data-tooltip="마이페이지"
            >
              <PersonIcon />
            </a>
          </div>
        )}
        <header className="dashboard-header">
          <div>
            <p className="intro-kicker">{guardianComplete ? "보호자 대시보드" : "정보 입력"}</p>
            <h1 className="dashboard-title">
              {isDashboard
                ? guardianComplete
                  ? `안녕하세요, ${guardian.name}님!`
                  : "회원가입 정보를 입력해 주세요"
                : isGuardianTab
                  ? "보호자정보"
                  : isSubjectsTab
                    ? "관리대상정보"
                    : "보호자 대시보드"}
            </h1>
            <p className="dashboard-subtitle">
              {isDashboard
                ? guardianComplete
                  ? "로그인한 보호자에게 등록된 관리대상과 현재 상태를 확인할 수 있습니다."
                  : "SNS 계정에서 확인된 정보는 미리 채워두었습니다. 필수 정보를 입력하면 바로 서비스를 사용할 수 있습니다."
                : isGuardianTab
                  ? "보호자 연락처, 주소, 안심번호 등 기본 정보를 입력하고 수정합니다."
                  : isSubjectsTab
                    ? "관리대상 등록, 보호자 메시지, 음성 안내, QR 배정 정보를 관리합니다."
                    : "로그인한 보호자에게 등록된 관리대상과 현재 상태를 확인할 수 있습니다."}
            </p>
          </div>
        </header>

        {!guardianActive ? (
          <section className="dashboard-panel setup-panel">
            <h2>계정이 비활성화되었습니다</h2>
            <p>관리자에게 문의해 주세요. 비활성화된 보호자 계정은 관리 기능을 사용할 수 없습니다.</p>
          </section>
        ) : (
          <>

        {!guardianComplete ? (
          <>
            <SocialSignupCompletion guardian={guardian} session={session} />
            <div className="install-area dashboard-install">
              <PwaInstallPrompt />
            </div>
          </>
        ) : (
          <>
        <nav className="dashboard-menu" aria-label="보호자 메뉴">
          <a className={isDashboard ? "active" : ""} href="/?tab=dashboard">
            대시보드
          </a>
          <a className={isGuardianTab ? "active" : ""} href="/?tab=guardian">
            보호자정보
          </a>
          <a className={isSubjectsTab ? "active" : ""} href="/?tab=subjects">
            관리대상정보
          </a>
        </nav>

        {showMyPage && (
          <section className="modal-backdrop my-page-backdrop" aria-label="마이페이지" role="dialog" aria-modal="true">
            <ModalScrollLock />
            <MyPageTab
              guardian={guardian}
              subjects={subjectsWithQr}
              subscription={subscription}
              session={session}
              admin={admin}
              closeHref={closeMyPageHref}
            />
          </section>
        )}

        {isDashboard ? (
          <DashboardTab
            guardian={guardian}
            guardianComplete={guardianComplete}
            subjects={subjectsWithQr}
            subscription={subscription}
            subscriptionPlans={subscriptionPlans}
            adDailyRate={adDailyRate}
            selectedAdSubject={selectedAdSubject}
          />
        ) : isGuardianTab ? (
          <GuardianInfoTab guardian={guardian} session={session} />
        ) : (
          <SubjectsInfoTab subjects={subjectsWithQr} emptySlots={emptySlots} registeredSubject={registeredSubject} />
        )}

        <div className="install-area dashboard-install">
          <PwaInstallPrompt />
        </div>
          </>
        )}
          </>
        )}
      </section>
    </main>
  );
}

function DashboardTab({
  guardian,
  guardianComplete,
  subjects,
  subscription,
  subscriptionPlans,
  adDailyRate,
  selectedAdSubject,
}) {
  if (!guardianComplete) {
    return (
      <section className="dashboard-panel setup-panel">
        <h2>정보 입력이 필요합니다</h2>
        <p>대시보드를 사용하려면 보호자 정보를 먼저 입력해 주세요.</p>
        <a className="action" href="/?tab=guardian">
          보호자정보로 이동
        </a>
      </section>
    );
  }

  return (
    <>
      <StatusDashboard
        guardian={guardian}
        subjects={subjects}
      />
      {selectedAdSubject && (
        <AdCampaignModal
          subject={selectedAdSubject}
          dailyRate={adDailyRate}
          createAction={createSubjectAdAction}
          pauseAction={pauseSubjectAdAction}
          resumeAction={resumeSubjectAdAction}
          endAction={endSubjectAdAction}
        />
      )}
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

function GuardianInfoTab({ guardian, session }) {
  return (
    <section className="dashboard-panel info-panel guardian-info-panel">
      <h2 id="guardian-info">보호자 정보</h2>
      <GuardianForm guardian={guardian} session={session} />
    </section>
  );
}

function MyPageTab({ guardian, subjects, subscription, session, admin, closeHref = "" }) {
  const primarySubject = subjects[0] || null;
  const subscriptionLabel = subscription?.status === "active"
    ? "구독중"
    : subscription?.status === "paused"
      ? "일시정지"
      : subscription?.status === "ready"
        ? "결제대기"
        : "미구독";

  return (
    <section
      className={`my-page-panel${closeHref ? " my-page-modal" : ""}`}
      aria-label="마이페이지"
      data-modal-surface={closeHref ? "" : undefined}
    >
      <div className="my-page-title-row">
        <h2>내 정보</h2>
        {closeHref && (
          <a className="my-page-close-button" href={closeHref} aria-label="마이페이지 닫기">
            닫기
          </a>
        )}
      </div>
      <div className="my-profile-avatar" aria-hidden="true">
        <span />
      </div>

      <div className="my-page-section">
        <div className="my-section-heading">
          <h3>보호자 정보</h3>
          <a href="/?tab=guardian">정보 수정 &gt;</a>
        </div>
        <InfoRow label="이름" value={guardian.name || "이름 미입력"} />
        <InfoRow label="비밀번호" value={guardian.password_hash ? "********" : "미설정"} />
        <InfoRow label="연락처" value={guardian.phone || "연락처 미입력"} />
        <InfoRow label="수령인" value={guardian.name || "이름 미입력"} actionLabel="주소록관리 >" href="/?tab=guardian" />
        <InfoRow label="주소" value={guardian.address || "주소 미입력"} />
        <InfoRow label="연락처" value={guardian.safe_phone ? `안심번호 ${guardian.safe_phone}` : "안심번호 준비중"} />
      </div>

      <div className="my-page-section">
        <div className="my-section-heading">
          <h3>대상자 정보</h3>
          <a href="/?tab=subjects">정보 수정 &gt;</a>
        </div>
        {primarySubject ? (
          <>
            <InfoRow label="이름" value={primarySubject.name || "이름 미입력"} />
            <InfoRow label="성별" value={primarySubject.gender || "성별 미입력"} />
            <InfoRow label="생년월일" value={formatDate(primarySubject.birth_date)} />
            <InfoRow label="보호자 메시지" value={primarySubject.guardian_message || "메시지 미입력"} />
            <InfoRow label="사진" value={primarySubject.photo_name || (primarySubject.photo_data_url ? "사진 등록됨" : "사진 미등록")} />
          </>
        ) : (
          <p className="my-empty-text">등록된 관리대상이 없습니다.</p>
        )}
        {subjects.length > 1 && <p className="my-empty-text">외 {subjects.length - 1}명은 관리대상정보에서 확인할 수 있습니다.</p>}
      </div>

      <div className="my-page-section">
        <h3>부가 정보</h3>
        <InfoRow label="결제 및 구독 현황" value={subscriptionLabel} actionLabel="상세보기 >" href="/account/billing" />
        <InfoRow label="제자리 서비스 소개" value="QR 안심 서비스" />
        <a className="my-menu-link" href="/account/coupons">쿠폰함</a>
        <a className="my-menu-link" href="/account/payment-methods">결제수단</a>
        <a className="my-menu-link" href="/account/ads">광고 대시보드</a>
        <div className="my-action-row">
          <span>푸시 알림</span>
          <PushNotificationButton />
        </div>
        {admin && (
          <a className="my-menu-link" href="/admin">
            관리자 페이지
          </a>
        )}
      </div>

      <div className="my-page-section">
        <h3>고객 지원</h3>
        <a className="my-menu-link" href="/?panel=my">공지사항 및 FAQ</a>
        <a className="my-menu-link" href="/?panel=my">고객센터</a>
        <a className="my-menu-link" href="/?panel=my">의견 남기기</a>
        <a className="my-menu-link" href="/?panel=my">이용약관</a>
        <a className="my-menu-link" href="/?panel=my">개인정보처리방침</a>
      </div>

      <div className="my-page-section my-logout-section">
        <LogoutButton />
      </div>

      <p className="my-session-email">{session.user?.email || guardian.email || guardian.google_email || ""}</p>
    </section>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function InfoRow({ label, value, actionLabel = "", href = "" }) {
  return (
    <div className="my-info-row">
      <strong>{label}</strong>
      <span>{value || "-"}</span>
      {href && <a href={href}>{actionLabel}</a>}
    </div>
  );
}

function SubjectsInfoTab({ subjects, emptySlots, registeredSubject }) {
  if (registeredSubject) {
    return <SubjectRegistrationComplete subject={registeredSubject} />;
  }

  return (
    <section className="subjects-workspace">
      <div className="panel-heading subjects-heading">
        <div>
          <h2 id="subjects-info">대상자 등록</h2>
          <p>보호자 1명당 최대 4명까지 등록할 수 있습니다.</p>
        </div>
        <span>{subjects.length}/4명</span>
      </div>
      <div className="subject-list">
        {subjects.map((subject) => (
          <SubjectForm key={subject.id} subject={subject} />
        ))}
        {emptySlots.length > 0 && <SubjectForm />}
      </div>
    </section>
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
                  {subject.qr_code && <span>QR: {subject.qr_code}</span>}
                  {subject.ad_status && <span>광고: {adStatusLabel(subject.ad_status)}</span>}
                </div>
                <div className="managed-actions">
                  <span className={`status-badge ${statusClass(subject.status)}`}>
                    {statusLabel(subject.status)}
                  </span>
                  <a className="managed-ad-button" href={`/?tab=dashboard&adSubject=${encodeURIComponent(subject.id)}`}>
                    광고
                  </a>
                </div>
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
          <a href="/missing-report">
            <span aria-hidden="true">!</span>
            실종신고
          </a>
          <a href="/shop">
            <span aria-hidden="true">B</span>
            상품 구매
          </a>
          <a href="/?tab=dashboard&panel=my">
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
              <label>
                생년월일
                <input name="birthDate" type="date" defaultValue={guardian.birth_date || ""} />
              </label>
              <label>
                안심번호
                <input
                  name="safePhone"
                  defaultValue={guardian.safe_phone || ""}
                  placeholder="안심번호 발급 후 입력"
                />
              </label>
              <label className="full-field">
                주소
                <KakaoPostcodeAddress defaultValue={guardian.address || ""} />
              </label>
              <label className="full-field">
                이메일
                <input name="email" type="email" defaultValue={guardian.email || session.user?.email || ""} required />
              </label>
              <FormSubmitButton className="action" pendingText="저장중">
                보호자 정보 저장
              </FormSubmitButton>
            </form>
  );
}

function SubjectForm({ subject }) {
  const isExisting = Boolean(subject?.id);

  return (
    <article className="subject-edit-card">
      <form action={saveSubjectAction} className="subject-registration-form">
        <input type="hidden" name="subjectId" defaultValue={subject?.id || ""} />
        <input type="hidden" name="existingPhoto" defaultValue={subject?.photo_data_url || ""} />
        <input type="hidden" name="existingPhotoName" defaultValue={subject?.photo_name || ""} />

        <div className="subject-form-top">
          <h2>{isExisting ? "대상자 수정" : "대상자 등록"}</h2>
          {isExisting && <em>수정 저장 시 QR 완료 화면은 표시되지 않습니다.</em>}
        </div>

        <label className="subject-avatar-picker">
          <span className="subject-avatar-preview">
            {subject?.photo_data_url ? (
              <img src={subject.photo_data_url} alt={`${subject.name} 사진`} />
            ) : (
              <span aria-hidden="true" />
            )}
          </span>
          <span className="camera-chip" aria-hidden="true">사진</span>
          <input name="photo" type="file" accept="image/*" />
        </label>

        <div className="target-field-stack">
          <label className="target-field">
            <span>이름</span>
            <input name="subjectName" defaultValue={subject?.name || ""} required />
          </label>
          <label className="target-field">
            <span>생년월일</span>
            <input name="birthDate" type="date" defaultValue={subject?.birth_date || ""} required />
          </label>
          <fieldset className="target-gender-field">
            <legend>성별</legend>
            {genders.map((gender) => (
              <label key={gender}>
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  defaultChecked={(subject?.gender || "") === gender}
                  required
                />
                <span>{gender.replace("성", "")}</span>
              </label>
            ))}
          </fieldset>
          <label className="target-field">
            <span>현재 상태</span>
            <select name="status" defaultValue={statusLabel(subject?.status || "상품구매필요")} required>
              {statuses.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="target-field target-message-field">
            <span>보호자 메시지</span>
            <small>대상자를 찾은 사람이 QR 페이지에서 볼 수 있는 안내 메시지입니다.</small>
            <textarea
              name="guardianMessage"
              defaultValue={subject?.guardian_message || ""}
              placeholder="저희 삼촌을 찾고 있어요. 대화가 어려울 수 있으니 연락 부탁드립니다."
              rows={4}
            />
          </label>
          <div className="target-voice-field">
            <strong>보호자 음성 사전 녹음 (선택)</strong>
            <small>대상자를 찾았을 때 QR 페이지에서 재생할 수 있습니다.</small>
            <SubjectVoiceRecorder
              existingVoice={subject?.voice_data_url || ""}
              existingName={subject?.voice_name || ""}
            />
          </div>
        </div>

        {subject?.qr_code && (
          <div className="subject-qr-panel">
            <a href={subject.qr_image} download={`${subject.qr_code}.png`} title={`${subject.qr_code} QR 이미지 다운로드`}>
              <img src={subject.qr_image} alt={`${subject.name} QR 코드`} />
            </a>
            <div>
              <strong>{subject.qr_code}</strong>
              <span>{subject.qr_is_active ? (subject.qr_activated_at ? "사용자 활성화 완료" : "상품 수령 후 활성화 대기") : "관리자 비활성 QR"}</span>
              <a href={subject.qr_target_url} target="_blank" rel="noreferrer">
                {subject.qr_target_url}
              </a>
            </div>
          </div>
        )}

        <FormSubmitButton className="login-submit target-submit-button" pendingText={isExisting ? "수정중" : "저장중"}>
          {isExisting ? "수정 저장" : "다음"}
        </FormSubmitButton>
      </form>

      {isExisting && (
        <form action={deleteSubjectAction}>
          <input type="hidden" name="subjectId" value={subject.id} />
          <FormSubmitButton className="danger-button" pendingText="삭제중">
            삭제
          </FormSubmitButton>
        </form>
      )}
    </article>
  );
}

function SubjectRegistrationComplete({ subject }) {
  return (
    <section className="subject-complete-phone" aria-label="관리대상 등록 완료">
      <div className="phone-notch" aria-hidden="true" />
      <a className="signup-back-button subject-complete-back" href="/?tab=subjects">
        <span aria-hidden="true">‹</span>
        <span className="visually-hidden">관리대상정보로 돌아가기</span>
      </a>
      <div className="subject-complete-content">
        <div className="complete-qr-mark">
          {subject.qr_image ? (
            <img src={subject.qr_image} alt={`${subject.name} 전용 QR 코드`} />
          ) : (
            <span aria-hidden="true">QR</span>
          )}
        </div>
        <h2>등록이 완료되었습니다.</h2>
        <p>
          <strong>{subject.name}</strong> 대상자 전용 QR코드가 생성되었어요.
          QR코드는 상품 구매 단계에서 확인하실 수 있습니다.
        </p>
        {subject.qr_code && <em>{subject.qr_code}</em>}
        <a className="login-submit subject-complete-action" href="/shop">
          상품 구매하기
        </a>
        <a className="outline-login-button subject-complete-action" href="/?tab=dashboard">
          대시보드 이동하기
        </a>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
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

async function withSubjectQrImages(subjects) {
  return Promise.all(
    subjects.map(async (subject) => {
      if (!subject.qr_target_url) return subject;
      return {
        ...subject,
        qr_image: await QRCode.toDataURL(subject.qr_target_url, {
          margin: 1,
          width: 144,
          color: {
            dark: "#1f2d3d",
            light: "#ffffff",
          },
        }),
      };
    })
  );
}
