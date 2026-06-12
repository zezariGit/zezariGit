import { getServerSession } from "next-auth";
import { GoogleLoginButton, LogoutButton, PwaInstallPrompt } from "./auth-actions";
import GuardianDashboard from "./dashboard";
import OnboardingGate from "./onboarding-gate";
import { authOptions } from "../lib/auth";
import { getDashboardData } from "../lib/db";

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab === "info" ? "info" : "dashboard";
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Google user";
  const userEmail = session?.user?.email || "";

  if (session) {
    const dashboardData = await getDashboardData(session);
    return <GuardianDashboard {...dashboardData} session={session} activeTab={activeTab} />;
  }

  const loginPanel = (
    <main className="page">
      <section className="auth-panel" aria-label="Google login">
        <div className="app-mark" aria-hidden="true">Z</div>
        <h1 className="brand">zezari</h1>
        <p className="status">
          {session
            ? "Google 계정으로 연결되었습니다."
            : "Google 계정으로 가입하거나 로그인하세요."}
        </p>

        <GoogleLoginButton />
        <div className="install-area">
          <PwaInstallPrompt />
        </div>
      </section>
    </main>
  );

  return <OnboardingGate enabled={!session}>{loginPanel}</OnboardingGate>;
}
