import { getServerSession } from "next-auth";
import { GoogleLoginButton, LogoutButton } from "./auth-actions";
import { authOptions } from "../lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Google user";
  const userEmail = session?.user?.email || "";

  return (
    <main className="page">
      <section className="auth-panel" aria-label="Google login">
        <h1 className="brand">hellow zezari</h1>
        <p className="status">
          {session
            ? "Google account connected."
            : "Sign up or log in with Google to continue."}
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
      </section>
    </main>
  );
}
