"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function GoogleLoginButton() {
  return (
    <button className="action google-action" type="button" onClick={() => signIn("google")}>
      <GoogleLogo />
      <span>Google로 계속하기</span>
    </button>
  );
}

export function LogoutButton() {
  return (
    <button className="action secondary" type="button" onClick={() => signOut()}>
      Log out
    </button>
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isiOS, setIsiOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(standalone);
    setIsiOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (installed) {
    return <p className="install-note">앱으로 실행 중입니다.</p>;
  }

  if (installEvent) {
    return (
      <button className="install-action" type="button" onClick={installApp}>
        앱 설치
      </button>
    );
  }

  if (isiOS) {
    return (
      <p className="install-note">
        iPhone에서는 Safari 공유 메뉴에서 홈 화면에 추가를 선택하세요.
      </p>
    );
  }

  return <p className="install-note">브라우저 메뉴에서 앱 설치를 사용할 수 있습니다.</p>;
}

function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
