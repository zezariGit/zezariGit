import {
  createSubjectAdAction,
  deleteSubjectAction,
  endSubjectAdAction,
  pauseSubjectAdAction,
  resumeSubjectAdAction,
  saveGuardianAction,
} from "./actions";
import AdCampaignModal from "./ad-campaign-modal";
import FormSubmitButton from "./form-submit-button";
import GuardianPhoneVerification from "./guardian-phone-verification";
import ImageFileInput from "./image-file-input";
import KakaoPostcodeAddress from "./kakao-postcode-address";
import { LogoutButton, PwaInstallPrompt } from "./auth-actions";
import ManagedSubjectCarousel from "./managed-subject-carousel";
import MyPageOverlay, { OpenMyPageButton } from "./my-page-overlay";
import NotificationBell from "./notification-bell";
import PushNotificationButton from "./push-notification-button";
import QRCode from "qrcode";
import Link from "next/link";
import SocialSignupCompletion from "./social-signup-completion";
import SubjectVoiceRecorder from "./subject-voice-recorder";
import SubjectBirthDateSelect from "./subject-birth-date-select";
import SubjectPhotoInput from "./subject-photo-input";
import SubjectRegistrationForm from "./subject-registration-form";
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
  editSubjectId = "",
  registeredSubjectId = "",
  registeredQrClaim = false,
  hasQrSignupClaim = false,
}) {
  const qrImageSubjectIds = new Set([adSubjectId, editSubjectId, registeredSubjectId].filter(Boolean));
  const subjectsWithQr = await withSubjectQrImages(subjects, qrImageSubjectIds);
  const selectedAdSubject = subjectsWithQr.find((subject) => subject.id === adSubjectId) || null;
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

  return (
    <main className="dashboard-page">
      <section className={`dashboard-shell${guardianComplete && guardianActive ? " has-corner" : ""}`}>
        {guardianComplete && guardianActive && (
          <div className="dashboard-corner-bar" aria-label="사용자 빠른 메뉴">
            <NotificationBell />
            <OpenMyPageButton
              className="corner-icon-button my-page-corner-link"
              title="마이페이지"
            >
              <PersonIcon />
            </OpenMyPageButton>
          </div>
        )}
        {guardianComplete && guardianActive && (
          <MyPageOverlay initialOpen={showMyPage} closeHref={closeMyPageHref}>
            <MyPageTab
              guardian={guardian}
              subjects={subjectsWithQr}
              subscription={subscription}
              session={session}
              admin={admin}
              closeHref={closeMyPageHref}
            />
          </MyPageOverlay>
        )}
        <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            {guardianComplete && !isDashboard && (
              <Link className="dashboard-back-link" href="/?tab=dashboard">
                <span aria-hidden="true">‹</span>
                대시보드로 돌아가기
              </Link>
            )}
            {!isSubjectsTab && (
              <p className="intro-kicker">{guardianComplete ? "보호자 대시보드" : "정보 입력"}</p>
            )}
            <h1 className="dashboard-title">
              {isDashboard
                ? guardianComplete
                  ? `안녕하세요, ${guardian.name}님!`
                  : "회원가입 정보를 입력해 주세요"
                : isGuardianTab
                  ? "보호자정보"
                  : isSubjectsTab
                    ? selectedEditSubject
                      ? "대상자 정보 수정"
                      : "대상자 정보 등록"
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
                    ? selectedEditSubject
                      ? `${selectedEditSubject.name} 대상자의 정보를 수정해 주세요.`
                      : <>
                          보호가 필요한 대상자의 정보를 등록해주세요.
                          <br />
                          등록한 정보는 QR 스캔 시 발견자에게 필요한 정보를 안내하는 데 사용됩니다.
                        </>
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
          />
        ) : isGuardianTab ? (
          <GuardianInfoTab guardian={guardian} session={session} imageUploadSettings={imageUploadSettings} />
        ) : (
          <SubjectsInfoTab
            selectedSubject={selectedEditSubject}
            registeredSubject={registeredSubject}
            registeredQrClaim={registeredQrClaim}
            hasQrSignupClaim={hasQrSignupClaim}
            imageUploadSettings={imageUploadSettings}
          />
        )}

        <div className="install-area dashboard-install">
          <PwaInstallPrompt />
        </div>
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
      <StatusDashboard subjects={subjects} />
      {selectedAdSubject && (
        <AdCampaignModal
          subject={selectedAdSubject}
          pricing={adPricing}
          createAction={createSubjectAdAction}
          pauseAction={pauseSubjectAdAction}
          resumeAction={resumeSubjectAdAction}
          endAction={endSubjectAdAction}
        />
      )}
    </>
  );
}

function GuardianInfoTab({ guardian, session, imageUploadSettings }) {
  return (
    <section className="dashboard-panel info-panel guardian-info-panel">
      <h2 id="guardian-info">보호자 정보</h2>
      <GuardianForm guardian={guardian} session={session} imageUploadSettings={imageUploadSettings} />
    </section>
  );
}

function MyPageTab({ guardian, subjects, subscription, session, admin, closeHref = "" }) {
  const subscriptionLabel = subscription?.status === "active"
    ? "이용중"
    : subscription?.status === "paused"
      ? "일시정지"
      : subscription?.status === "ready"
        ? "QR 활성화 대기"
        : subscription?.status === "expired"
          ? "이용기간 만료"
          : "미이용";

  return (
    <section
      className={`my-page-panel${closeHref ? " my-page-modal" : ""}`}
      aria-label="마이페이지"
      data-modal-surface={closeHref ? "" : undefined}
    >
      <div className="my-page-title-row">
        <h2>내 정보</h2>
        {closeHref && (
          <button className="my-page-close-button" type="button" data-my-page-close aria-label="마이페이지 닫기">
            닫기
          </button>
        )}
      </div>
      <div className="my-profile-avatar" aria-hidden={!guardian.photo_url}>
        {guardian.photo_url ? <img src={guardian.photo_url} alt="" /> : <span />}
      </div>

      <div className="my-page-section">
        <div className="my-section-heading">
          <h3>보호자 정보</h3>
          <Link href="/?tab=guardian#guardian-info">정보 수정 &gt;</Link>
        </div>
        <InfoRow label="이름" value={guardian.name || "이름 미입력"} />
        <InfoRow
          label={isSocialAccount(session) ? "로그인 방식" : "비밀번호"}
          value={isSocialAccount(session) ? `${socialProviderLabel(session?.user?.provider)} 계정` : guardian.password_hash ? "********" : "미설정"}
        />
        <InfoRow label="연락처" value={guardian.phone || "연락처 미입력"} />
        <InfoRow label="수령인" value={guardian.name || "이름 미입력"} actionLabel="주소록관리 >" href="/?tab=guardian#guardian-info" />
        <InfoRow label="주소" value={formatFullAddress(guardian.address, guardian.address_detail)} />
        <InfoRow
          label="안심번호 운영"
          value="QR 접근 시 24시간 자동 배정"
        />
      </div>

      <div className="my-page-section">
        <div className="my-section-heading">
          <h3>대상자 정보</h3>
          <span>총 {subjects.length}명</span>
        </div>
        {subjects.length > 0 ? (
          <div className="my-subject-list">
            {subjects.map((subject) => (
              <Link
                className="my-subject-row"
                href={`/?tab=subjects&editSubject=${encodeURIComponent(subject.id)}#subjects-info`}
                aria-label={`${subject.name} 정보 수정`}
                key={subject.id}
              >
                <span className="my-subject-photo" aria-hidden={!subjectPhotoSrc(subject)}>
                  {subjectPhotoSrc(subject) ? (
                    <img src={subjectPhotoSrc(subject)} alt="" />
                  ) : (
                    <span aria-hidden="true" />
                  )}
                </span>
                <span className="my-subject-summary">
                  <span className="my-subject-name-line">
                    <strong>{subject.name || "이름 미입력"}</strong>
                    <em className={`status-badge ${statusClass(subject.status)}`}>
                      {statusLabel(subject.status)}
                    </em>
                  </span>
                  <small>{shortGender(subject.gender)} · {formatDate(subject.birth_date)}</small>
                </span>
                <span className="my-subject-chevron" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="my-empty-text">등록된 관리대상이 없습니다.</p>
        )}
        <Link className="my-subject-add-button" href="/?tab=subjects&mode=new#subjects-info">
          <span aria-hidden="true">+</span>
          대상자 추가
        </Link>
      </div>

      <div className="my-page-section">
        <h3>부가 정보</h3>
        <InfoRow label="결제 및 서비스 현황" value={subscriptionLabel} actionLabel="상세보기 >" href="/account/billing" />
        <InfoRow label="제자리 서비스 소개" value="QR 안심 서비스" />
        <Link className="my-menu-link" href="/account/coupons">쿠폰함</Link>
        <Link className="my-menu-link" href="/account/payment-methods">결제수단</Link>
        <Link className="my-menu-link" href="/account/ads">광고 대시보드</Link>
        <div className="my-action-row">
          <span>푸시 알림</span>
          <PushNotificationButton />
        </div>
        {admin && (
          <Link className="my-menu-link" href="/admin">
            관리자 페이지
          </Link>
        )}
      </div>

      <div className="my-page-section">
        <h3>고객 지원</h3>
        <Link className="my-menu-link" href="/?panel=my">공지사항 및 FAQ</Link>
        <Link className="my-menu-link" href="/?panel=my">고객센터</Link>
        <Link className="my-menu-link" href="/?panel=my">의견 남기기</Link>
        <Link className="my-menu-link" href="/?panel=my">이용약관</Link>
        <Link className="my-menu-link" href="/?panel=my">개인정보처리방침</Link>
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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M12 9v4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 17h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 8h12l1 12H5L6 8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function InfoRow({ label, value, actionLabel = "", href = "" }) {
  return (
    <div className="my-info-row">
      <strong>{label}</strong>
      <span>{value || "-"}</span>
      {href && <Link href={href}>{actionLabel}</Link>}
    </div>
  );
}

function SubjectsInfoTab({ selectedSubject, registeredSubject, registeredQrClaim = false, hasQrSignupClaim = false, imageUploadSettings }) {
  if (registeredSubject) {
    return <SubjectRegistrationComplete subject={registeredSubject} qrClaimed={registeredQrClaim} />;
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

function StatusDashboard({ subjects }) {
  const pageSize = 3;
  const subjectPages = [];
  for (let index = 0; index < subjects.length; index += pageSize) {
    subjectPages.push(subjects.slice(index, index + pageSize));
  }
  if (subjectPages.length === 0) subjectPages.push([]);

  return (
    <section className="status-dashboard" aria-label="관리대상 현재 상태">
      <div className="status-phone">
        <div className="status-phone-top">
          <h2>현재 상태</h2>
          <span className="status-subject-count">등록 대상 {subjects.length}명</span>
        </div>
        <ManagedSubjectCarousel pageCount={subjectPages.length}>
          <div className="managed-pages">
            {subjectPages.map((pageSubjects, pageIndex) => (
              <div className="managed-page" key={`managed-page-${pageIndex}`}>
                {pageSubjects.map((subject) => (
                  <article className="managed-card" key={subject.id}>
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
                      {subject.qr_code && <span>QR: {subject.qr_code}</span>}
                      {subject.ad_status && <span>광고: {adStatusLabel(subject.ad_status)}</span>}
                    </div>
                    <div className="managed-actions">
                      <span className={`status-badge ${statusClass(subject.status)}`}>
                        {statusLabel(subject.status)}
                      </span>
                      <Link className="managed-ad-button" href={`/?tab=dashboard&adSubject=${encodeURIComponent(subject.id)}`}>
                        광고
                      </Link>
                    </div>
                  </article>
                ))}
                {pageIndex === subjectPages.length - 1 && (
                  <div className="managed-add-row">
                    <Link className="managed-add-button" href="/?tab=subjects&mode=new#subjects-info" aria-label="관리대상 추가" title="관리대상 추가">
                      <span aria-hidden="true">+</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ManagedSubjectCarousel>
        <div className="quick-actions">
          <Link href="/missing-report">
            <AlertIcon />
            실종신고
          </Link>
          <Link href="/shop">
            <BagIcon />
            상품 구매
          </Link>
          <OpenMyPageButton title="내 정보">
            <PersonIcon />
            내 정보
          </OpenMyPageButton>
        </div>
      </div>
    </section>
  );
}

function GuardianForm({ guardian, session, imageUploadSettings }) {
  const socialAccount = isSocialAccount(session);

  return (
    <form action={saveGuardianAction} className="form-grid">
              <label className="full-field guardian-photo-upload">
                <span>보호자 사진</span>
                <span className="guardian-photo-upload-row">
                  <span className="guardian-photo-preview" aria-hidden={!guardian.photo_url}>
                    {guardian.photo_url ? <img src={guardian.photo_url} alt="" /> : <span />}
                  </span>
                  <span className="guardian-photo-upload-control">
                    <ImageFileInput
                      name="guardianPhoto"
                      label="보호자 사진"
                      maxBytes={imageUploadSettings?.guardianPhotoMaxBytes || 1024 * 1024}
                    />
                    <small>{formatUploadLimit(imageUploadSettings?.guardianPhotoMaxBytes)}MB 이하 JPEG, PNG, WebP, GIF</small>
                  </span>
                </span>
              </label>
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
              <GuardianPhoneVerification currentPhone={guardian.phone || ""} />
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
    <article className="subject-edit-card">
      <SubjectRegistrationForm hasExistingPhoto={Boolean(photoSrc)}>
        <input type="hidden" name="subjectId" defaultValue={subject?.id || ""} />
        <input type="hidden" name="existingPhotoName" defaultValue={subject?.photo_name || ""} />
        <input type="hidden" name="status" defaultValue={statusLabel(subject?.status || "상품구매필요")} />

        {isExisting && (
          <div className="subject-form-top">
            <em>수정 저장 시 QR 완료 화면은 표시되지 않습니다.</em>
          </div>
        )}

        <div className="target-field-stack">
          <div className="subject-primary-fields">
            <SubjectPhotoInput
              existingSrc={photoSrc}
              maxBytes={imageUploadSettings?.subjectPhotoMaxBytes || 1024 * 1024}
              required={!photoSrc}
            />
            <label className="target-field subject-primary-name">
              <span>이름</span>
              <input
                name="subjectName"
                defaultValue={subject?.name || ""}
                placeholder="이름을 입력해주세요."
                required
              />
            </label>
          </div>
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
                <span>{gender.replace("성", "")}</span>
              </label>
            ))}
          </fieldset>
          <label className="target-field target-message-field">
            <span>보호자 메시지</span>
            <small>QR을 스캔한 발견자에게 보여지는 메시지로, 대상자를 돕는 데 필요한 내용을 적어주세요.</small>
            <textarea
              name="guardianMessage"
              defaultValue={subject?.guardian_message || ""}
              placeholder="저희 아이는 대화가 조금 어려울 수 있어요. 보호자 음성을 들려주시고, 안전한 곳에서 함께 기다려주세요."
              rows={4}
              required
            />
          </label>
          <div className="target-voice-field">
            <strong>보호자 음성 사전 녹음 (선택)</strong>
            <small>QR을 스캔한 발견자가 대상자를 안심시킬 수 있도록 재생하는 음성입니다.</small>
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
      </SubjectRegistrationForm>

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

function SubjectRegistrationComplete({ subject, qrClaimed = false }) {
  return (
    <section className="subject-complete-phone" aria-label="관리대상 등록 완료">
      <div className="phone-notch" aria-hidden="true" />
      <Link className="signup-back-button subject-complete-back" href="/?tab=subjects">
        <span aria-hidden="true">‹</span>
        <span className="visually-hidden">관리대상정보로 돌아가기</span>
      </Link>
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
          <strong>{subject.name}</strong> 대상자 전용 QR코드가 {qrClaimed ? "연결되었어요." : "생성되었어요."}
          {qrClaimed ? " 방금 스캔한 상품의 QR을 그대로 사용할 수 있습니다." : " QR코드는 상품 구매 단계에서 확인하실 수 있습니다."}
        </p>
        {subject.qr_code && <em>{subject.qr_code}</em>}
        <Link className="login-submit subject-complete-action" href="/shop">
          상품 구매하기
        </Link>
        <Link className="outline-login-button subject-complete-action" href="/?tab=dashboard">
          대시보드 이동하기
        </Link>
      </div>
    </section>
  );
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

function adStatusLabel(status) {
  if (status === "active") return "광고중";
  if (status === "paused") return "일시정지";
  if (status === "ready") return "준비중";
  if (status === "ended") return "종료";
  return "연동 대기";
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
