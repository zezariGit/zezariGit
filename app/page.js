import { getServerSession } from "next-auth";
import { GoogleLoginButton, LogoutButton, PwaInstallPrompt } from "./auth-actions";
import { authOptions } from "../lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Google user";
  const userEmail = session?.user?.email || "";

  return (
    <main className="page">
      <section className="auth-panel" aria-label="Google login">
        <div className="app-mark" aria-hidden="true">Z</div>
        <h1 className="brand">zezari</h1>
        <p className="status">
          {session
            ? "Google 계정으로 연결되었습니다."
            : "Google 계정으로 가입하거나 로그인하세요."}
        </p>

        {session ? (
          <>
            <div className="profile">
              <div className="profile-name">{userName}</div>
              <div className="profile-email">{userEmail}</div>
            </div>
            <LogoutButton />
          </>
        ) : (
          <GoogleLoginButton />
        )}
        <div className="install-area">
          <PwaInstallPrompt />
        </div>
      </section>
    </main>
  );
}
