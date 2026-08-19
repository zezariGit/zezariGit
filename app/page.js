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
  const editSubjectId = resolvedSearchParams?.editSubject || "";
  const registeredSubjectId = resolvedSearchParams?.registered || "";
  const registeredQrClaim = resolvedSearchParams?.qrClaimed === "1";
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";
  const authError = resolvedSearchParams?.error || "";
  const authMode = resolvedSearchParams?.signup === "1" ? "signup" : "login";
  const session = await getServerSession(authOptions);
  const enabledProviders = getConfiguredProviderIds();
  const pendingQrClaim = await resolvePendingQrClaim();

  if (session) {
    const dashboardData = await getDashboardData(session, {
      includeSubjects: true,
      includeSubjectDetails: activeTab === "subjects" || showMyPage || Boolean(adSubjectId),
      includeSubscription: showMyPage,
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
