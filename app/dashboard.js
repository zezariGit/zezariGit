import {
  createSubjectAdAction,
  endSubjectAdAction,
  pauseSubjectAdAction,
  resumeSubjectAdAction,
  saveGuardianAction,
} from "./actions";
import AdCampaignModal from "./ad-campaign-modal";
import FormSubmitButton from "./form-submit-button";
import GuardianPhoneVerification from "./guardian-phone-verification";
import KakaoPostcodeAddress from "./kakao-postcode-address";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";
import ManagedSubjectCarousel from "./managed-subject-carousel";
import MyPageOverlay, { OpenMyPageButton } from "./my-page-overlay";
import NotificationBell from "./notification-bell";
import QRCode from "qrcode";
import Link from "next/link";
import SocialSignupCompletion from "./social-signup-completion";
import SubjectVoiceRecorder from "./subject-voice-recorder";
import SubjectBirthDateSelect from "./subject-birth-date-select";
import SubjectPhotoInput from "./subject-photo-input";
import SubjectRegistrationForm from "./subject-registration-form";
import SubjectMessageField from "./subject-message-field";
import SubjectPreviewVoicePlayer from "./subject-preview-voice-player";
import SubjectStatusGuide from "./subject-status-guide";
import { isAdminSession } from "../lib/admin";
import { formatDateOnly } from "../lib/date-format";

const genders = ["남성", "여성"];

export default async function GuardianDashboard({
  guardian,
  subjects,
  subscription,
  subscriptionPlans = [],
  adPricing = {},
  imageUploadSettings = {},
  session,
  activeTab = "dashboard",
  showMyPage = false,
  adSubjectId = "",
  forceNewAd = false,
  previewSubjectId = "",
  editSubjectId = "",
  registeredSubjectId = "",
  registeredQrClaim = false,
  hasQrSignupClaim = false,
  notificationPreview = false,
}) {
  const qrImageSubjectIds = new Set([adSubjectId, editSubjectId].filter(Boolean));
  const subjectsWithQr = await withSubjectQrImages(subjects, qrImageSubjectIds);
  const selectedAdSubject = subjectsWithQr.find((subject) => subject.id === adSubjectId) || null;
  const selectedPreviewSubject = subjectsWithQr.find((subject) => subject.id === previewSubjectId) || null;
  const selectedEditSubject = subjectsWithQr.find((subject) => subject.id === editSubjectId) || null;
  const registeredSubject = subjectsWithQr.find((subject) => subject.id === registeredSubjectId) || null;
  const admin = isAdminSession(session) || Number(guardian.is_admin || 0) === 1;
  const socialAccount = isSocialAccount(session);
  const guardianComplete = admin || Boolean(
    guardian.name
      && guardian.birth_date
      && guardian.phone
      && (socialAccount
        ? (guardian.email_verified_at || guardian.phone_verified_at)
          && guardian.terms_privacy_agreed_at
          && guardian.terms_service_agreed_at
        : guardian.login_id && guardian.password_hash)
  );
  const guardianActive = guardian.is_active !== 0;
  const isDashboard = activeTab === "dashboard";
  const isGuardianTab = activeTab === "guardian";
  const isSubjectsTab = activeTab === "subjects";
  const currentTab = isGuardianTab ? "guardian" : isSubjectsTab ? "subjects" : "dashboard";
  const closeMyPageHref = `/?tab=${currentTab}`;
  const showCornerBar = isDashboard && !selectedPreviewSubject;

  return (
    <main className="dashboard-page">
      <section className={`dashboard-shell${guardianComplete && guardianActive && showCornerBar ? " has-corner" : ""}${isDashboard && !selectedPreviewSubject ? " dashboard-home-shell" : ""}`}>
        {guardianComplete && guardianActive && showCornerBar && (
          <div className="dashboard-corner-bar" aria-label="사용자 빠른 메뉴">
            <NotificationBell preview={notificationPreview} />
            <OpenMyPageButton
              className="corner-icon-button my-page-corner-link"
              title="설정"
            >
              <img className="dashboard-corner-icon" src="/assets/dashboard/settings.png" alt="" />
            </OpenMyPageButton>
          </div>
        )}
        {guardianComplete && guardianActive && (
          <MyPageOverlay initialOpen={showMyPage} closeHref={closeMyPageHref}>
            <MyPageTab closeHref={closeMyPageHref} admin={admin} />
          </MyPageOverlay>
        )}
        <div className="dashboard-content">
        {!registeredSubject && !selectedPreviewSubject && !isSubjectsTab && <header className="dashboard-header">
          <div>
            {guardianComplete && !isDashboard && (
              <Link className="dashboard-back-link" href="/?tab=dashboard">
                <span aria-hidden="true">‹</span>
                대시보드로 돌아가기
              </Link>
            )}
            {!isSubjectsTab && !isDashboard && (
              <p className="intro-kicker">{guardianComplete ? "보호자 대시보드" : "정보 입력"}</p>
            )}
            <h1 className="dashboard-title">
              {isDashboard
                ? guardianComplete
                  ? "안녕하세요, 보호자님!"
                  : "회원가입 정보를 입력해 주세요"
                : isGuardianTab
                  ? "보호자정보"
                  : isSubjectsTab
                    ? selectedEditSubject
                      ? "대상자 정보 수정"
                      : "대상자 정보 등록"
                    : "보호자 대시보드"}
            </h1>
            {(!isDashboard || !guardianComplete) && (
              <p className="dashboard-subtitle">
                {isDashboard
                  ? "SNS 계정에서 확인된 정보는 미리 채워두었습니다. 필수 정보를 입력하면 바로 서비스를 사용할 수 있습니다."
                  : isGuardianTab
                    ? "보호자 연락처, 주소, 안심번호 등 기본 정보를 입력하고 수정합니다."
                    : isSubjectsTab
                      ? selectedEditSubject
                        ? `${selectedEditSubject.name} 대상자의 정보를 수정해 주세요.`
                        : <>
                            보호가 필요한 대상자의 정보를 등록해주세요.
                            <br />
                            등록한 정보는 QR 스캔 시 발견자에게 필요한 정보를 안내하는 데 사용됩니다.
                          </>
                      : null}
              </p>
            )}
          </div>
        </header>}

        {!guardianActive ? (
          <section className="dashboard-panel setup-panel">
            <h2>계정이 비활성화되었습니다</h2>
            <p>관리자에게 문의해 주세요. 비활성화된 보호자 계정은 관리 기능을 사용할 수 없습니다.</p>
          </section>
        ) : (
          <>

        {!guardianComplete ? (
          <>
            <SocialSignupCompletion guardian={guardian} session={session} qrClaim={hasQrSignupClaim} />
            <div className="install-area dashboard-install">
              <PwaInstallPrompt />
            </div>
          </>
        ) : (
          <>
        {isDashboard ? (
          <DashboardTab
            guardian={guardian}
            guardianComplete={guardianComplete}
            subjects={subjectsWithQr}
            subscription={subscription}
            subscriptionPlans={subscriptionPlans}
            adPricing={adPricing}
            selectedAdSubject={selectedAdSubject}
            selectedPreviewSubject={selectedPreviewSubject}
          />
        ) : isGuardianTab ? (
          <GuardianInfoTab guardian={guardian} session={session} admin={admin} />
        ) : (
          <SubjectsInfoTab
            selectedSubject={selectedEditSubject}
            registeredSubject={registeredSubject}
            registeredQrClaim={registeredQrClaim}
            hasQrSignupClaim={hasQrSignupClaim}
            imageUploadSettings={imageUploadSettings}
          />
        )}

        {!registeredSubject && !selectedPreviewSubject && !isSubjectsTab && (
          <div className="install-area dashboard-install">
            <PwaInstallPrompt />
          </div>
        )}
          </>
        )}
          </>
        )}
        </div>
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
  adPricing,
  selectedAdSubject,
  selectedPreviewSubject,
}) {
  if (!guardianComplete) {
    return (
      <section className="dashboard-panel setup-panel">
        <h2>정보 입력이 필요합니다</h2>
        <p>대시보드를 사용하려면 보호자 정보를 먼저 입력해 주세요.</p>
        <Link className="action" href="/?tab=guardian">
          보호자정보로 이동
        </Link>
      </section>
    );
  }

  return (
    <>
      {selectedPreviewSubject ? (
        <SubjectPreviewPage subject={selectedPreviewSubject} />
      ) : (
        <StatusDashboard subjects={subjects} />
      )}
      {selectedAdSubject && (
        <AdCampaignModal
          subject={selectedAdSubject}
          pricing={adPricing}
          forceNew={forceNewAd}
          createAction={createSubjectAdAction}
          pauseAction={pauseSubjectAdAction}
          resumeAction={resumeSubjectAdAction}
          endAction={endSubjectAdAction}
        />
      )}
    </>
  );
}

function GuardianInfoTab({ guardian, session, admin }) {
  return (
    <section className="dashboard-panel info-panel guardian-info-panel">
      <h2 id="guardian-info">보호자 정보</h2>
      <GuardianForm guardian={guardian} session={session} admin={admin} />
    </section>
  );
}

function MyPageTab({ closeHref = "", admin = false }) {
  const menuItems = [
    ["보호자 정보", "/account/profile"],
    ["쿠폰함", "/account/coupons"],
    ["광고 대시보드", "/account/ads"],
    ["결제 및 서비스 현황", "/account/billing"],
    ["제자리 서비스 소개", "/?serviceIntro=1"],
    ["이용약관", "/privacy#terms"],
    ["개인정보처리방침", "/privacy"],
    ...(admin ? [["관리자 화면", "/admin"]] : []),
  ];
  return (
    <section
      className={`my-page-panel${closeHref ? " my-page-modal" : ""}`}
      aria-label="설정"
      data-modal-surface={closeHref ? "" : undefined}
    >
      <div className="my-page-title-row">
        {closeHref && (
          <button className="my-page-close-button" type="button" data-my-page-close aria-label="설정 닫기">
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <h2>설정</h2>
        <span aria-hidden="true" />
      </div>
      <nav className="settings-menu-list" aria-label="설정 메뉴">
        {menuItems.map(([label, href]) => (
          <Link key={label} href={href} data-my-page-navigate>
            <span>{label}</span><span aria-hidden="true">›</span>
          </Link>
        ))}
      </nav>
      <div className="my-logout-section">
        <LogoutButton className="settings-logout-button">로그아웃</LogoutButton>
      </div>
    </section>
  );
}

function SubjectsInfoTab({ selectedSubject, registeredSubject, hasQrSignupClaim = false, imageUploadSettings }) {
  if (registeredSubject) {
    return <SubjectRegistrationComplete />;
  }

  const editing = Boolean(selectedSubject);

  return (
    <section className="subjects-workspace">
      <div className="subject-list" id="subjects-info">
        {hasQrSignupClaim && !editing && (
          <div className="qr-claim-registration-banner" role="status">
            <strong>스캔한 미배정 QR 연결 대기 중</strong>
            <span>이 대상자를 저장하면 방금 접근한 QR이 자동으로 연결됩니다.</span>
          </div>
        )}
        <SubjectForm subject={selectedSubject || undefined} imageUploadSettings={imageUploadSettings} />
      </div>
    </section>
  );
}

function SubjectPreviewPage({ subject }) {
  const photoSrc = subjectPhotoSrc(subject);
  const age = calculateAge(subject.birth_date);

  return (
    <section className="guardian-subject-preview" aria-label={`${subject.name} 대상자 정보 미리보기`}>
      <Link className="subject-preview-back" href="/?tab=dashboard" aria-label="대시보드로 돌아가기">
        ‹
      </Link>
      <span className="subject-preview-shield" aria-hidden="true"><ShieldCheckIcon /></span>
      <header className="subject-preview-heading">
        <img src="/assets/dashboard/subject-preview-heading.png" alt="대상자 정보 미리보기. 입력한 내용을 확인해 주세요." />
      </header>

      <div className="subject-preview-profile">
        <div className="subject-preview-photo">
          {photoSrc ? <img src={photoSrc} alt={`${subject.name} 사진`} /> : <span aria-hidden="true" />}
        </div>
        <div className="subject-preview-summary">
          <strong>{subject.name || "이름 미입력"}</strong>
          <span>{shortGender(subject.gender)} · {age !== null ? `${age}세` : "나이 미입력"} ({formatDate(subject.birth_date)})</span>
        </div>
      </div>

      <button className="subject-preview-contact subject-preview-disabled" type="button" disabled>
        <img src="/assets/dashboard/subject-preview-call-v2.png" alt="보호자에게 전화하기. 안심번호로 연결됩니다." />
      </button>

      <div className="subject-preview-emergency-grid">
        <button className="subject-preview-disabled" type="button" disabled>
          <img src="/assets/dashboard/subject-preview-location-v2.png" alt="위치 공유. 보호자에게 현재 위치를 공유해요." />
        </button>
        <button className="subject-preview-disabled" type="button" disabled>
          <img src="/assets/dashboard/subject-preview-emergency-v2.png" alt="112 신고. 관할기관에 신고합니다." />
        </button>
      </div>

      {subject.voice_data_url && (
        <section className="subject-preview-voice">
          <SubjectPreviewVoicePlayer
            src={subject.voice_data_url}
            name={subject.voice_name || "보호자 음성"}
          />
        </section>
      )}

      <section className="subject-preview-message">
        <img className="subject-preview-message-reference" src="/assets/dashboard/subject-preview-message-v2.png" alt="보호자가 전하고픈 말. 위 메시지는 보호자가 직접 입력한 내용입니다." />
        <p>{subject.guardian_message || "등록된 보호자 메시지가 없습니다."}</p>
      </section>

      <Link
        className="subject-preview-edit"
        href={`/?tab=subjects&editSubject=${encodeURIComponent(subject.id)}#subjects-info`}
      >
        <EditIcon />
        <strong>수정하기</strong>
      </Link>
    </section>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 2.8 20 6v5.8c0 4.7-3.1 8.3-8 9.7-4.9-1.4-8-5-8-9.7V6l8-3.2Z" />
      <path d="m8.8 12 2.1 2.1 4.5-4.7" />
    </svg>
  );
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5 10 7.7 8.2 9.5c1.2 2.5 3.3 4.6 5.8 5.8l1.8-1.8 4.2 2.8-.8 3.4c-.2.8-.9 1.3-1.7 1.3C9.5 20.4 3.6 14.5 3 6.5c-.1-.8.5-1.5 1.3-1.7l2.9-.7Z" /></svg>;
}

function LocationIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.3" /></svg>;
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5 3.5 21l4-1a9 9 0 1 0-2.5-1.5Z" /><circle cx="9" cy="11" r=".7" /><circle cx="12" cy="11" r=".7" /><circle cx="15" cy="11" r=".7" /></svg>;
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m13.5 6.5 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function StatusDashboard({ subjects }) {
  const pageSize = 3;
  const subjectPages = [];
  for (let index = 0; index < subjects.length; index += pageSize) {
    subjectPages.push(subjects.slice(index, index + pageSize));
  }
  if (subjects.length === 0) {
    subjectPages.push([]);
  } else if (subjectPages.at(-1).length < pageSize) {
    subjectPages.at(-1).push(null);
  } else {
    subjectPages.push([null]);
  }

  return (
    <section className="status-dashboard" aria-label="관리대상 현재 상태">
      <div className="status-phone">
        <div className="status-phone-top">
          <h2>현재 상태</h2>
          <SubjectStatusGuide />
        </div>
        <ManagedSubjectCarousel pageCount={subjectPages.length} showDots={subjects.length > 0}>
          <div className="managed-pages">
            {subjectPages.map((pageSubjects, pageIndex) => (
              <div className="managed-page" key={`managed-page-${pageIndex}`}>
                {pageSubjects.map((subject) => {
                  if (!subject) {
                    return (
                      <Link
                        className="managed-add-subject"
                        href="/?tab=subjects&mode=new#subjects-info"
                        aria-label="대상자 추가하기"
                        key={`managed-add-${pageIndex}`}
                      >
                        <span aria-hidden="true">+</span>
                      </Link>
                    );
                  }
                  const displayStatus = resolveSubjectStatus(subject);
                  return (
                  <Link
                    className="managed-card"
                    href={`/?tab=dashboard&previewSubject=${encodeURIComponent(subject.id)}`}
                    aria-label={`${subject.name} 대상자 정보 미리보기`}
                    key={subject.id}
                  >
                    <div className="managed-card-preview-link">
                      <div className="managed-photo">
                        {subjectPhotoSrc(subject) ? (
                          <img src={subjectPhotoSrc(subject)} alt={`${subject.name} 사진`} />
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                      <div className="managed-info">
                        <strong>{subject.name}</strong>
                        <span>{formatDate(subject.birth_date)}</span>
                      </div>
                    </div>
                    <div className="managed-actions">
                      <span className={`status-badge ${statusClass(displayStatus)}`}>
                        {subjectStatusDisplayLabel(displayStatus)}
                      </span>
                    </div>
                  </Link>
                  );
                })}
                {subjects.length === 0 && pageSubjects.length === 0 && (
                  <div className="managed-empty-state">
                    <strong>등록된 대상자가 없습니다.</strong>
                    <p>대상자를 등록하고 제자리 서비스를 시작해 보세요.</p>
                    <Link className="managed-empty-add" href="/?tab=subjects&mode=new#subjects-info">
                      <span aria-hidden="true">+</span> 대상자 추가하기
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ManagedSubjectCarousel>
        <div className="quick-actions">
          <Link href="/missing-report" aria-label="실종신고">
            <img className="quick-action-image" src="/assets/dashboard/missing.png" alt="" />
            <span className="quick-action-label">실종신고</span>
          </Link>
          <Link href="/shop" aria-label="상품구매">
            <img className="quick-action-image" src="/assets/dashboard/shop.png" alt="" />
            <span className="quick-action-label">상품구매</span>
          </Link>
          <a
            href="http://pf.kakao.com/_xmuiln/chat"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="카카오톡 고객지원 새 창에서 열기"
          >
            <img className="quick-action-image" src="/assets/dashboard/support.png" alt="" />
            <span className="quick-action-label">고객지원</span>
          </a>
        </div>
        <div className="dashboard-assurance-banner">
          <img className="dashboard-assurance-icon" src="/assets/dashboard/safety.png" alt="" />
          <p>제자리는 소중한 사람의 안전을 지킵니다.<br />실종 신고, 보호자 안심번호, 음성 재생 등<br />다양한 기능을 활용할 수 있어요.</p>
        </div>
      </div>
    </section>
  );
}

function GuardianForm({ guardian, session, admin }) {
  const socialAccount = isSocialAccount(session);

  return (
    <form action={saveGuardianAction} className="form-grid">
              <label>
                이름
                <input name="guardianName" defaultValue={guardian.name || ""} required />
              </label>
              {socialAccount ? (
                <>
                  <input name="loginId" type="hidden" defaultValue={guardian.login_id || ""} />
                  <label>
                    로그인 방식
                    <input value={`${socialProviderLabel(session?.user?.provider)} 계정 로그인`} readOnly />
                  </label>
                </>
              ) : (
                <>
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
                </>
              )}
              <GuardianPhoneVerification currentPhone={guardian.phone || ""} admin={admin} />
              <label>
                생년월일
                <input name="birthDate" type="date" defaultValue={guardian.birth_date || ""} />
              </label>
              <label>
                안심번호
                <input
                  value={safePhoneDisplayValue(guardian)}
                  readOnly
                  aria-readonly="true"
                />
                <small className="field-helper">
                  실제 번호는 공개되지 않으며 QR 접근 시 공용 050 번호가 24시간 배정됩니다.
                </small>
              </label>
              <label className="full-field">
                주소
                <KakaoPostcodeAddress
                  defaultValue={guardian.address || ""}
                  defaultDetailValue={guardian.address_detail || ""}
                />
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

function SubjectForm({ subject, imageUploadSettings }) {
  const isExisting = Boolean(subject?.id);
  const photoSrc = subjectPhotoSrc(subject);

  return (
    <article className={`subject-edit-card ${isExisting ? "is-editing" : "is-registering"}`}>
      <header className="subject-form-header">
        <Link
          className="subject-form-back"
          href={isExisting ? `/?tab=dashboard&previewSubject=${encodeURIComponent(subject.id)}` : "/?tab=dashboard"}
          aria-label={isExisting ? "대상자 정보 미리보기로 돌아가기" : "대시보드로 돌아가기"}
        >
          <span aria-hidden="true">‹</span>
        </Link>
        <h1>{isExisting ? "대상자 정보 수정" : "대상자 정보 등록"}</h1>
        {isExisting && <p>정확한 정보를 위해 수정해 주세요.</p>}
      </header>

      <SubjectRegistrationForm hasExistingPhoto={Boolean(photoSrc)} editing={isExisting}>
        <input type="hidden" name="subjectId" defaultValue={subject?.id || ""} />
        <input type="hidden" name="existingPhotoName" defaultValue={subject?.photo_name || ""} />
        <input type="hidden" name="status" defaultValue={statusLabel(subject?.status || "상품구매필요")} />

        <div className="target-field-stack">
          {isExisting ? (
            <div className="subject-primary-fields">
              <SubjectPhotoInput
                existingSrc={photoSrc}
                maxBytes={imageUploadSettings?.subjectPhotoMaxBytes || 1024 * 1024}
                required={!photoSrc}
                mode="edit"
              />
              <label className="target-field subject-primary-name">
                <span>이름</span>
                <input
                  name="subjectName"
                  defaultValue={subject?.name || ""}
                  placeholder="이름을 입력해 주세요."
                  maxLength={80}
                  required
                />
              </label>
            </div>
          ) : (
            <>
              <div className="subject-registration-photo">
                <SubjectPhotoInput
                  existingSrc={photoSrc}
                  maxBytes={imageUploadSettings?.subjectPhotoMaxBytes || 1024 * 1024}
                  required
                  mode="create"
                />
              </div>
              <label className="target-field subject-primary-name">
                <span>이름</span>
                <input
                  name="subjectName"
                  defaultValue=""
                  placeholder="이름을 입력해 주세요."
                  maxLength={80}
                  required
                />
              </label>
            </>
          )}
          <SubjectBirthDateSelect value={subject?.birth_date || ""} />
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
                <span>{gender}</span>
              </label>
            ))}
          </fieldset>
          <div className="target-voice-field">
            <strong>보호자 음성 녹음 (선택)</strong>
            <small>보호자의 음성을 최대 30초까지 녹음할 수 있습니다.</small>
            <SubjectVoiceRecorder
              existingVoice={subject?.voice_data_url || ""}
              existingName={subject?.voice_name || ""}
            />
          </div>
          <SubjectMessageField value={subject?.guardian_message || ""} />
          {isExisting && (
            <p className="subject-edit-helper">
              <InfoIcon /> 보호자 연락처는 [설정] &gt; [보호자 정보]에서 수정 가능합니다.
            </p>
          )}
        </div>
      </SubjectRegistrationForm>
    </article>
  );
}

function SubjectRegistrationComplete() {
  return (
    <section className="subject-complete-phone" aria-label="대상자 등록 완료">
      <div className="subject-complete-content">
        <img
          className="subject-complete-qr-image"
          src="/assets/subject-registration/completion-qr.png"
          alt=""
          aria-hidden="true"
        />
        <h2>대상자 등록이 완료되었습니다.</h2>
        <p>이제 대상자 전용 QR이 적용된 상품을 구매할 수 있어요.</p>
        <Link className="login-submit subject-complete-action" href="/shop">
          <img
            className="subject-complete-button-icon shop"
            src="/assets/subject-registration/shop-icon.png"
            alt=""
            aria-hidden="true"
          />
          상품 구매하기
        </Link>
        <Link className="outline-login-button subject-complete-action" href="/?tab=dashboard">
          <img
            className="subject-complete-button-icon"
            src="/assets/subject-registration/dashboard-icon.png"
            alt=""
            aria-hidden="true"
          />
          대시보드 이동하기
        </Link>
      </div>
    </section>
  );
}

function InfoIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.2v.2" /></svg>;
}

function formatDate(value) {
  return formatDateOnly(value);
}

function shortGender(value) {
  const gender = String(value || "").trim();
  if (!gender) return "성별 미입력";
  return gender.replace("성", "");
}

function formatFullAddress(address, detailAddress) {
  return [address, detailAddress].filter(Boolean).join(" ") || "주소 미입력";
}

function isSocialAccount(session) {
  return ["google", "kakao", "naver", "facebook"].includes(
    String(session?.user?.provider || "").trim().toLowerCase()
  );
}

function socialProviderLabel(provider) {
  if (provider === "naver") return "네이버";
  if (provider === "kakao") return "카카오";
  if (provider === "google") return "Google";
  if (provider === "facebook") return "Facebook";
  return "SNS";
}

function safePhoneDisplayValue(guardian) {
  return "QR 접근 시 24시간 자동 배정";
}

function subjectPhotoSrc(subject) {
  return subject?.photo_url || subject?.photo_data_url || "";
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

function subjectStatusDisplayLabel(status) {
  if (status === "상품구매필요") return "상품 구매 필요";
  if (status === "찾는중") return "찾는 중";
  if (status === "QR활성화필요") return "QR 활성화 필요";
  return "안전";
}

function resolveSubjectStatus(subject) {
  const storedStatus = statusLabel(subject?.status);
  if (storedStatus === "찾는중") return "찾는중";

  const qrEnabled = Number(subject?.qr_is_active || 0) === 1;
  const qrActivated = Boolean(subject?.qr_activated_at);
  if (qrEnabled && qrActivated) return "안전";

  if (
    Number(subject?.has_product_purchase || 0) === 1
    || storedStatus === "QR활성화필요"
    || storedStatus === "안전"
    || qrActivated
  ) {
    return "QR활성화필요";
  }
  return "상품구매필요";
}

function subjectStatusActionHref(subject, status) {
  if (status === "상품구매필요") {
    return `/shop?subject=${encodeURIComponent(subject.id)}`;
  }
  if (status === "QR활성화필요") {
    return subject.qr_target_url || `/shop?subject=${encodeURIComponent(subject.id)}`;
  }
  return "";
}

function calculateAge(value) {
  const birth = new Date(`${String(value || "").slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday = today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

async function withSubjectQrImages(subjects, subjectIds = new Set()) {
  return Promise.all(
    subjects.map(async (subject) => {
      if (!subject.qr_target_url || !subjectIds.has(subject.id)) return subject;
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

function formatUploadLimit(bytes) {
  const megabytes = Math.max(1, Number(bytes) || 1024 * 1024) / (1024 * 1024);
  return Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(1).replace(/\.0$/, "");
}
