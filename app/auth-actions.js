"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const socialProviders = [
  {
    id: "google",
    label: "Google",
    className: "google-action",
    Logo: GoogleLogo,
  },
  {
    id: "kakao",
    label: "Kakao",
    className: "kakao-action",
    Logo: KakaoLogo,
  },
  {
    id: "naver",
    label: "Naver",
    className: "naver-action",
    Logo: NaverLogo,
  },
];

export function LoginAuthPanel({ enabledProviders = [], authError = "" }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(authError ? "아이디 또는 비밀번호를 확인해 주세요." : "");

  useEffect(() => {
    const savedLoginId = window.localStorage.getItem("zezari:remember-login-id") || "";
    if (savedLoginId) {
      setLoginId(savedLoginId);
      setRemember(true);
    }
  }, []);

  const submitCredentials = async (event) => {
    event.preventDefault();
    if (!loginId.trim() || !password) {
      setMessage("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    if (remember) {
      window.localStorage.setItem("zezari:remember-login-id", loginId.trim());
    } else {
      window.localStorage.removeItem("zezari:remember-login-id");
    }

    const result = await signIn("credentials", {
      loginId: loginId.trim(),
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.ok) {
      window.location.href = result.url || "/";
      return;
    }

    setLoading(false);
    setMessage("아이디 또는 비밀번호를 확인해 주세요.");
  };

  return (
    <section className="auth-panel login-card" aria-label="로그인">
      <h1 className="login-title">로그인</h1>

      <form className="credentials-login-form" onSubmit={submitCredentials}>
        <label className="visually-hidden" htmlFor="login-id">
          아이디
        </label>
        <input
          id="login-id"
          name="loginId"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          placeholder="아이디"
          type="text"
          autoComplete="username"
        />

        <label className="visually-hidden" htmlFor="login-password">
          비밀번호
        </label>
        <input
          id="login-password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          type="password"
          autoComplete="current-password"
        />

        <div className="login-options">
          <label className="remember-login">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>자동로그인</span>
          </label>
          <button
            className="link-button"
            type="button"
            onClick={() => setMessage("비밀번호 찾기는 준비중입니다. SNS 로그인 또는 관리자 문의를 이용해 주세요.")}
          >
            비밀번호 찾기
          </button>
        </div>

        <button className="login-submit" type="submit" disabled={loading}>
          {loading ? "로그인 중" : "로그인"}
        </button>
      </form>

      {message && <p className="login-message" role="status">{message}</p>}

      <div className="login-divider">
        <span>또는</span>
      </div>

      <p className="sns-login-title">SNS 계정으로 간편 로그인</p>
      <SocialLoginButtons enabledProviders={enabledProviders} variant="icons" />

      <div className="signup-helper">
        <span>계정이 없으신가요?</span>
        <button
          className="signup-link"
          type="button"
          onClick={() => setMessage("회원가입은 SNS 계정으로 처음 로그인하면 자동으로 시작됩니다.")}
        >
          회원가입
        </button>
      </div>

      <div className="install-area">
        <PwaInstallPrompt />
      </div>
    </section>
  );
}

export function SocialLoginButtons({ enabledProviders = [], variant = "stack" }) {
  return <SocialLoginButtonsInner enabledProviders={enabledProviders} variant={variant} />;
}

function SocialLoginButtonsInner({ enabledProviders = [], variant = "stack" }) {
  const enabled = new Set(enabledProviders);
  const providers = variant === "icons"
    ? [socialProviders[1], socialProviders[2], socialProviders[0], appleProvider]
    : socialProviders;

  return (
    <div className={variant === "icons" ? "social-icon-row" : "social-login-stack"}>
      {providers.map(({ id, label, fullLabel, className, Logo }) => {
        const configured = enabled.has(id);
        const disabled = id === "apple" || !configured;

        return (
          <button
            className={variant === "icons" ? `social-icon-button ${className}` : `action social-action ${className}`}
            type="button"
            key={id}
            onClick={() => !disabled && signIn(id)}
            disabled={disabled}
            title={configured ? `${label}로 계속하기` : `${label} 설정 필요`}
            aria-label={configured ? `${label}로 계속하기` : `${label} 설정 필요`}
          >
            <Logo />
            {variant !== "icons" && <span>{configured ? `${label}로 계속하기` : `${fullLabel || label} - 설정 필요`}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function GoogleLoginButton({ enabledProviders = ["google"] }) {
  return <SocialLoginButtons enabledProviders={enabledProviders.filter((provider) => provider === "google")} />;
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

function KakaoLogo() {
  return (
    <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#191919"
        d="M12 4C6.98 4 3 7.14 3 11.02c0 2.47 1.62 4.64 4.05 5.89l-.72 2.65c-.08.31.27.56.53.38l3.16-2.1c.64.13 1.3.2 1.98.2 5.02 0 9-3.14 9-7.02S17.02 4 12 4z"
      />
    </svg>
  );
}

function NaverLogo() {
  return (
    <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#ffffff" d="M7 6h3.85l3.3 4.78V6H17v12h-3.85l-3.3-4.78V18H7V6z" />
    </svg>
  );
}

const appleProvider = {
  id: "apple",
  label: "Apple",
  className: "apple-action",
  Logo: AppleLogo,
};

function AppleLogo() {
  return (
    <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.1-2.8.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.2-1.2 3-2.4c.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9ZM14 5.7c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z"
      />
    </svg>
  );
}
