import { getServerSession } from "next-auth";
import { LoginAuthPanel } from "./auth-actions";
import GuardianDashboard from "./dashboard";
import OnboardingGate from "./onboarding-gate";
import StatusToast from "./status-toast";
import { authOptions, getConfiguredProviderIds } from "../lib/auth";
import { getDashboardData } from "../lib/db";

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams?.tab || "dashboard";
  const activeTab =
    requestedTab === "guardian" || requestedTab === "info"
      ? "guardian"
      : requestedTab === "subjects"
        ? "subjects"
        : requestedTab === "my"
          ? "my"
          : "dashboard";
  const adSubjectId = resolvedSearchParams?.adSubject || "";
  const registeredSubjectId = resolvedSearchParams?.registered || "";
  const notice = resolvedSearchParams?.notice || "";
  const noticeType = resolvedSearchParams?.noticeType || "success";
  const authError = resolvedSearchParams?.error || "";
  const authMode = resolvedSearchParams?.signup === "1" ? "signup" : "login";
  const session = await getServerSession(authOptions);
  const enabledProviders = getConfiguredProviderIds();

  if (session) {
    const dashboardData = await getDashboardData(session);
    return (
      <>
        <GuardianDashboard
          {...dashboardData}
          session={session}
          activeTab={activeTab}
          adSubjectId={adSubjectId}
          registeredSubjectId={registeredSubjectId}
        />
        <StatusToast message={notice} type={noticeType} />
      </>
    );
  }

  const loginPanel = (
    <main className="page">
      <LoginAuthPanel enabledProviders={enabledProviders} authError={authError} initialMode={authMode} />
    </main>
  );

  return (
    <>
      <OnboardingGate enabled={!session}>{loginPanel}</OnboardingGate>
      <StatusToast message={notice} type={noticeType} />
    </>
  );
}
