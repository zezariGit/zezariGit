import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginAuthPanel } from "./auth-actions";
import GuardianDashboard from "./dashboard";
import OnboardingGate from "./onboarding-gate";
import StatusToast from "./status-toast";
import UserPolicyFooter from "./user-policy-footer";
import { authOptions, getConfiguredProviderIds } from "../lib/auth";
import { getActiveQrSignupClaim, getDashboardData } from "../lib/db";
import { isAdminSession } from "../lib/admin";
import {
  QR_SIGNUP_CLAIM_COOKIE,
  decodeQrSignupClaim,
  hashQrSignupClaimToken,
} from "../lib/qr-signup-claim";

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams?.tab || "dashboard";
  const activeTab =
    requestedTab === "guardian" || requestedTab === "info"
      ? "guardian"
      : requestedTab === "subjects"
        ? "subjects"
        : "dashboard";
  const showMyPage = resolvedSearchParams?.panel === "my" || requestedTab === "my";
  const adSubjectId = resolvedSearchParams?.adSubject || "";
  const previewSubjectId = resolvedSearchParams?.previewSubject || "";
  const editSubjectId = resolvedSearchParams?.editSubject || "";
  const registeredSubjectId = resolvedSearchParams?.registered || "";
  const registeredQrClaim = resolvedSearchParams?.qrClaimed === "1";
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";
  const authError = resolvedSearchParams?.error || "";
  const authMode = resolvedSearchParams?.signup === "1" ? "signup" : "login";
  const signupPreviewStep = process.env.NODE_ENV === "development" && resolvedSearchParams?.preview === "signup-complete"
    ? "done"
    : undefined;
  const dashboardPreview = process.env.NODE_ENV === "development"
    ? String(resolvedSearchParams?.preview || "")
    : "";
  const subjectPreviewModes = [
    "subject-preview",
    "subject-edit",
    "subject-registration",
    "subject-registration-complete",
  ];
  if (subjectPreviewModes.includes(dashboardPreview)) {
    const sampleSubject = previewSubject();
    const isPreview = dashboardPreview === "subject-preview";
    const isEdit = dashboardPreview === "subject-edit";
    const isComplete = dashboardPreview === "subject-registration-complete";
    return (
      <GuardianDashboard
        guardian={{ id: "preview-guardian", name: "보호자", phone: "010-0000-0000", birth_date: "1990-01-01", is_active: 1, login_id: "preview", password_hash: "preview" }}
        subjects={[sampleSubject]}
        subscription={null}
        session={{ user: { provider: "credentials", email: "" } }}
        activeTab={isPreview ? "dashboard" : "subjects"}
        previewSubjectId={isPreview ? sampleSubject.id : ""}
        editSubjectId={isEdit ? sampleSubject.id : ""}
        registeredSubjectId={isComplete ? sampleSubject.id : ""}
        imageUploadSettings={{ subjectPhotoMaxBytes: 1024 * 1024 }}
      />
    );
  }
  if (["dashboard", "dashboard-empty", "dashboard-notifications"].includes(dashboardPreview)) {
    return (
      <GuardianDashboard
        guardian={{ id: "preview-guardian", name: "보호자", phone: "010-0000-0000", birth_date: "1990-01-01", is_active: 1, login_id: "preview", password_hash: "preview" }}
        subjects={dashboardPreview === "dashboard-empty" ? [] : previewDashboardSubjects()}
        subscription={null}
        session={{ user: { provider: "credentials", email: "" } }}
        activeTab="dashboard"
        notificationPreview={dashboardPreview === "dashboard-notifications"}
      />
    );
  }
  const session = await getServerSession(authOptions);
  const enabledProviders = getConfiguredProviderIds();
  const pendingQrClaim = await resolvePendingQrClaim();

  if (session) {
    const dashboardData = await getDashboardData(session, {
      includeSubjects: true,
      includeSubjectDetails:
        activeTab === "subjects" || Boolean(adSubjectId) || Boolean(previewSubjectId),
      includeSubscription: true,
      includeSubscriptionPlans: false,
      includeAdDailyRate: activeTab === "dashboard" && Boolean(adSubjectId),
    });
    const admin = isAdminSession(session) || Number(dashboardData.guardian?.is_admin || 0) === 1;
    const guardianComplete = isGuardianProfileComplete(dashboardData.guardian, session, admin);
    const requiresFirstSubject = guardianComplete && !admin && dashboardData.subjects.length === 0;
    const claimNeedsNewSubject = guardianComplete && Boolean(pendingQrClaim);
    if (
      (requiresFirstSubject || claimNeedsNewSubject)
      && (activeTab !== "subjects" || Boolean(editSubjectId) || Boolean(registeredSubjectId))
    ) {
      redirect(`/?tab=subjects&mode=new${pendingQrClaim ? "&qrClaim=1" : ""}`);
    }
    return (
      <>
        <GuardianDashboard
          {...dashboardData}
          session={session}
          activeTab={activeTab}
          showMyPage={showMyPage}
          adSubjectId={adSubjectId}
          previewSubjectId={previewSubjectId}
          editSubjectId={editSubjectId}
          registeredSubjectId={registeredSubjectId}
          registeredQrClaim={registeredQrClaim}
          hasQrSignupClaim={Boolean(pendingQrClaim)}
        />
        <UserPolicyFooter />
        <StatusToast message={notice} type={noticeType} />
      </>
    );
  }

  const loginPanel = (
    <main className="page">
      <LoginAuthPanel
        enabledProviders={enabledProviders}
        authError={authError}
        initialMode={authMode}
        initialSignupStep={signupPreviewStep}
        qrClaim={Boolean(pendingQrClaim)}
      />
    </main>
  );

  return (
    <>
      <OnboardingGate enabled={!session && !pendingQrClaim}>{loginPanel}</OnboardingGate>
      <UserPolicyFooter />
      <StatusToast message={notice} type={noticeType} />
    </>
  );
}

function previewDashboardSubjects() {
  return [
    { id: "preview-1", name: "김제자리", birth_date: "2019-09-14", status: "안전", qr_is_active: 1, qr_activated_at: "2026-01-01" },
    { id: "preview-2", name: "박제자리", birth_date: "2017-03-22", status: "찾는중" },
    { id: "preview-3", name: "이제자리", birth_date: "2021-11-05", status: "상품구매필요" },
  ];
}

function previewSubject() {
  return {
    id: "preview-subject",
    name: "이하율",
    birth_date: "2016-05-10",
    gender: "여성",
    status: "안전",
    guardian_message: "저희 아이는 대화가 조금 어려울 수 있어요.\n보호자 음성을 들려주시고,\n안전한 곳에서 보호자와 기다려주세요.",
    photo_data_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f7d9ce'/%3E%3Ccircle cx='60' cy='48' r='28' fill='%23ffd7bd'/%3E%3Cpath d='M31 45c2-27 18-35 31-35 18 0 30 14 29 38-8-4-15-10-20-18-11 12-24 16-40 15Z' fill='%23583b33'/%3E%3Ccircle cx='50' cy='49' r='2.5'/%3E%3Ccircle cx='70' cy='49' r='2.5'/%3E%3Cpath d='M54 61c4 3 8 3 12 0' fill='none' stroke='%23d87871' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M24 120c4-31 20-45 36-45s32 14 36 45' fill='%23f59da7'/%3E%3C/svg%3E",
    voice_data_url: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
    voice_name: "보호자 음성 메시지",
  };
}

async function resolvePendingQrClaim() {
  const cookieStore = await cookies();
  const parsed = decodeQrSignupClaim(cookieStore.get(QR_SIGNUP_CLAIM_COOKIE)?.value);
  if (!parsed) return null;
  return getActiveQrSignupClaim(parsed.publicKey, hashQrSignupClaimToken(parsed.token));
}

function isGuardianProfileComplete(guardian, session, admin) {
  if (admin) return true;
  const provider = String(session?.user?.provider || "").trim().toLowerCase();
  const socialAccount = ["google", "kakao", "naver", "facebook"].includes(provider);
  return Boolean(
    guardian?.name
      && guardian?.birth_date
      && guardian?.phone
      && (socialAccount
        ? (guardian.email_verified_at || guardian.phone_verified_at)
          && guardian.terms_privacy_agreed_at
          && guardian.terms_service_agreed_at
        : guardian.login_id && guardian.password_hash)
  );
}
