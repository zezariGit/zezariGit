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

export function LoginAuthPanel({ enabledProviders = [], authError = "", initialMode = "login" }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "login");
  const [message, setMessage] = useState(authError ? "아이디 또는 비밀번호를 확인해 주세요." : "");
  const [signupStep, setSignupStep] = useState("phone");
  const [signup, setSignup] = useState({
    phone: "",
    name: "",
    birthDate: "",
    loginId: "",
    password: "",
    privacyAgreed: false,
    serviceAgreed: false,
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [codeInput, setCodeInput] = useState(["", "", "", "", ""]);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupCredentials, setSignupCredentials] = useState(null);
  const [codeSeconds, setCodeSeconds] = useState(0);

  useEffect(() => {
    const savedLoginId = window.localStorage.getItem("zezari:remember-login-id") || "";
    if (savedLoginId) {
      setLoginId(savedLoginId);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (codeSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSeconds]);

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

  const updateSignup = (key, value) => {
    setSignup((current) => ({ ...current, [key]: value }));
  };

  const openSignup = () => {
    setMode("signup");
    setSignupStep("phone");
    setMessage("");
  };

  const closeSignup = () => {
    setMode("login");
    setSignupStep("phone");
    setMessage("");
  };

  const requestVerificationCode = () => {
    const digits = signup.phone.replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
      setMessage("휴대폰 번호를 정확히 입력해 주세요.");
      return;
    }

    const nextCode = String(Math.floor(10000 + Math.random() * 90000));
    setVerificationCode(nextCode);
    setCodeInput(["", "", "", "", ""]);
    setVerifiedPhone("");
    setCodeSeconds(180);
    setMessage(`테스트 인증코드 ${nextCode}를 입력해 주세요. 실제 문자 발송은 SMS 연동 후 교체됩니다.`);
  };

  const updateCodeInput = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCodeInput((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit) {
      const next = document.getElementById(`signup-code-${index + 1}`);
      next?.focus();
    }
  };

  const verifyCode = () => {
    if (!verificationCode || codeSeconds <= 0) {
      setMessage("인증코드를 다시 받아 주세요.");
      return;
    }
    if (codeInput.join("") !== verificationCode) {
      setMessage("인증코드가 일치하지 않습니다.");
      return;
    }

    setVerifiedPhone(signup.phone);
    setSignupStep("profile");
    setMessage("휴대폰 인증이 완료되었습니다.");
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    if (!verifiedPhone) {
      setSignupStep("phone");
      setMessage("휴대폰 인증을 먼저 완료해 주세요.");
      return;
    }

    setSignupLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signup,
          phone: verifiedPhone,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setMessage(data.message || "회원가입 정보를 확인해 주세요.");
        setSignupLoading(false);
        return;
      }

      setSignupCredentials({ loginId: signup.loginId, password: signup.password });
      setSignupLoading(false);
      setSignupStep("done");
      setMessage("");
    } catch {
      setMessage("회원가입 처리 중 오류가 발생했습니다.");
      setSignupLoading(false);
    }
  };

  const signInAfterSignup = async (destination) => {
    if (!signupCredentials) return;
    setSignupLoading(true);
    const result = await signIn("credentials", {
      loginId: signupCredentials.loginId,
      password: signupCredentials.password,
      redirect: false,
      callbackUrl: destination,
    });

    if (result?.ok) {
      window.location.href = destination;
      return;
    }

    setSignupLoading(false);
    setMessage("가입은 완료되었습니다. 로그인 화면에서 다시 로그인해 주세요.");
  };

  if (mode === "signup") {
    return (
      <section className="auth-panel signup-card" aria-label="회원가입">
        {signupStep !== "done" && (
          <button className="signup-back-button" type="button" onClick={signupStep === "phone" ? closeSignup : () => setSignupStep("phone")}>
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">이전</span>
          </button>
        )}

        {signupStep === "phone" && (
          <div className="signup-step">
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>휴대폰 번호를 입력해주세요</strong>
              <p>보호자 본인확인과 알림 보호를 위해 사용됩니다.</p>
            </div>

            <label className="signup-field">
              <span>휴대폰 번호</span>
              <input
                value={signup.phone}
                onChange={(event) => updateSignup("phone", event.target.value)}
                placeholder="010 - 1234 - 5678"
                inputMode="tel"
              />
            </label>
            <button className="login-submit" type="button" onClick={requestVerificationCode}>
              인증코드 받기
            </button>

            <div className="signup-separator" />

            <div className="code-heading">
              <strong>인증번호 입력</strong>
              <span>{formatTimer(codeSeconds)}</span>
            </div>
            <div className="verification-code-row">
              {codeInput.map((value, index) => (
                <input
                  id={`signup-code-${index}`}
                  key={index}
                  value={value}
                  onChange={(event) => updateCodeInput(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !value && index > 0) {
                      document.getElementById(`signup-code-${index - 1}`)?.focus();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`${index + 1}번째 인증번호`}
                />
              ))}
            </div>
            <button className="login-submit" type="button" onClick={verifyCode}>
              확인
            </button>
            <button className="signup-link centered-link" type="button" onClick={requestVerificationCode}>
              인증번호가 오지 않았나요? 재전송
            </button>
          </div>
        )}

        {signupStep === "profile" && (
          <form className="signup-step compact-signup-form" onSubmit={submitSignup}>
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>기본 정보를 입력해주세요</strong>
              <p>정확한 서비스 이용을 위해 필수 정보를 입력해주세요.</p>
            </div>

            <label className="signup-field">
              <span>이름</span>
              <input value={signup.name} onChange={(event) => updateSignup("name", event.target.value)} placeholder="홍길동" required />
            </label>
            <label className="signup-field">
              <span>생년월일</span>
              <input value={signup.birthDate} onChange={(event) => updateSignup("birthDate", event.target.value)} type="date" required />
            </label>
            <label className="signup-field phone-with-badge">
              <span>휴대폰 번호</span>
              <input value={verifiedPhone} readOnly />
              <em>인증완료</em>
            </label>
            <label className="signup-field">
              <span>아이디</span>
              <input
                value={signup.loginId}
                onChange={(event) => updateSignup("loginId", event.target.value)}
                placeholder="zezari_mom"
                autoComplete="username"
                required
              />
            </label>
            <label className="signup-field">
              <span>비밀번호</span>
              <input
                value={signup.password}
                onChange={(event) => updateSignup("password", event.target.value)}
                type="password"
                placeholder="8~16자 영문, 숫자, 특수문자"
                autoComplete="new-password"
                required
              />
              <small>8~16자, 영문, 숫자, 특수문자 포함</small>
            </label>

            <div className="terms-box">
              <strong>필수동의</strong>
              <label>
                <input
                  type="checkbox"
                  checked={signup.privacyAgreed}
                  onChange={(event) => updateSignup("privacyAgreed", event.target.checked)}
                />
                <span>개인정보 수집 및 이용 동의 (필수)</span>
                <button type="button">자세히</button>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={signup.serviceAgreed}
                  onChange={(event) => updateSignup("serviceAgreed", event.target.checked)}
                />
                <span>서비스 이용 약관 동의 (필수)</span>
                <button type="button">자세히</button>
              </label>
            </div>

            <button className="login-submit" type="submit" disabled={signupLoading}>
              {signupLoading ? "처리중" : "다음"}
            </button>
          </form>
        )}

        {signupStep === "done" && (
          <div className="signup-step signup-complete">
            <div className="complete-mark" aria-hidden="true">✓</div>
            <h1>회원가입이 완료되었습니다!</h1>
            <p>zezari 서비스에 오신 것을 환영합니다. 소중한 가족의 안전을 함께 지켜요.</p>
            <button className="login-submit" type="button" disabled={signupLoading} onClick={() => signInAfterSignup("/?tab=info#subjects-info")}>
              대상자 등록하기
            </button>
            <button className="outline-login-button" type="button" disabled={signupLoading} onClick={() => signInAfterSignup("/?tab=dashboard")}>
              대시보드 바로가기
            </button>
          </div>
        )}

        {message && <p className="login-message" role="status">{message}</p>}
      </section>
    );
  }

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
          onClick={openSignup}
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

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const rest = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
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
