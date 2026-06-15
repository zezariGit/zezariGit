import { getServerSession } from "next-auth";
import { PwaInstallPrompt, SocialLoginButtons } from "./auth-actions";
import GuardianDashboard from "./dashboard";
import OnboardingGate from "./onboarding-gate";
import StatusToast from "./status-toast";
import { authOptions, getConfiguredProviderIds } from "../lib/auth";
import { getDashboardData } from "../lib/db";

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab === "info" ? "info" : "dashboard";
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";
  const session = await getServerSession(authOptions);
  const enabledProviders = getConfiguredProviderIds();

  if (session) {
    const dashboardData = await getDashboardData(session);
    return (
      <>
        <GuardianDashboard {...dashboardData} session={session} activeTab={activeTab} />
        <StatusToast message={notice} type={noticeType} />
      </>
    );
  }

  const loginPanel = (
    <main className="page">
      <section className="auth-panel" aria-label="소셜 로그인">
        <div className="app-mark" aria-hidden="true">Z</div>
        <h1 className="brand">zezari</h1>
        <p className="status">
          {session
            ? "소셜 계정으로 연결되었습니다."
            : "소셜 계정으로 가입하거나 로그인하세요."}
        </p>

        <SocialLoginButtons enabledProviders={enabledProviders} />
        <div className="install-area">
          <PwaInstallPrompt />
        </div>
      </section>
    </main>
  );

  return (
    <>
      <OnboardingGate enabled={!session}>{loginPanel}</OnboardingGate>
      <StatusToast message={notice} type={noticeType} />
    </>
  );
}
