"use client";

import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { PasswordResetPanel } from "./password-reset-panel";
import { LoginIdRecoveryPanel } from "./login-id-recovery-panel";
import PasswordVisibilityIcon from "./password-visibility-icon";
import ServiceRegulationModal from "./service-regulation-modal";
import { DEFAULT_SERVICE_REGULATIONS } from "../lib/service-regulations";

const LOGIN_ERROR_MESSAGE = "아이디 또는 비밀번호가 일치하지 않습니다.";

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

export function LoginAuthPanel({ enabledProviders = [], authError = "", initialMode = "login", initialSignupStep, qrClaim = false, serviceRegulations = DEFAULT_SERVICE_REGULATIONS }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(
    initialMode === "signup" || ["profile", "done"].includes(initialSignupStep)
      ? "signup"
      : initialMode === "login-id" || initialMode === "login-id-found"
        ? "login-id"
        : "login",
  );
  const [message, setMessage] = useState(authError ? LOGIN_ERROR_MESSAGE : "");
  const [signupStep, setSignupStep] = useState(["profile", "done"].includes(initialSignupStep) ? initialSignupStep : "phone");
  const [signup, setSignup] = useState({
    email: "",
    phone: "",
    name: "",
    birthDate: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
    loginId: "",
    password: "",
    privacyAgreed: false,
    serviceAgreed: false,
    notificationAgreed: false,
  });
  const [codeInput, setCodeInput] = useState(["", "", "", "", "", ""]);
  const [verifiedPhone, setVerifiedPhone] = useState(initialSignupStep === "profile" ? "010-1234-5678" : "");
  const [phoneVerificationToken, setPhoneVerificationToken] = useState(initialSignupStep === "profile" ? "preview-token" : "");
  const [signupLoading, setSignupLoading] = useState(false);
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [profileTouched, setProfileTouched] = useState({});
  const [codeSeconds, setCodeSeconds] = useState(0);
  const [codeRequested, setCodeRequested] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [signupPhoneError, setSignupPhoneError] = useState("");
  const [signupCodeError, setSignupCodeError] = useState("");
  const [openRegulationType, setOpenRegulationType] = useState("");

  useEffect(() => {
    const savedLoginId = window.localStorage.getItem("zezari:remember-login-id") || "";
    if (savedLoginId) {
      setLoginId(savedLoginId);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [mode]);

  useEffect(() => {
    if (codeSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeSeconds((current) => {
        if (current <= 1) {
          setSignupCodeError("인증시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
          return 0;
        }
        return current - 1;
      });
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
      callbackUrl: qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : "/",
    });

    if (result?.ok) {
      window.location.href = result.url || (qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : "/");
      return;
    }

    setLoading(false);
    setMessage(LOGIN_ERROR_MESSAGE);
  };

  const updateSignup = (key, value) => {
    setSignup((current) => ({ ...current, [key]: value }));
    if (key === "phone") {
      setVerifiedPhone("");
      setPhoneVerificationToken("");
      setCodeInput(["", "", "", "", "", ""]);
      setCodeRequested(false);
      setCodeSeconds(0);
      setSignupCodeError("");
    }
  };

  const updateSignupBirthPart = (key, value) => {
    setSignup((current) => {
      const next = { ...current, [key]: value };
      if ((key === "birthYear" || key === "birthMonth") && next.birthYear && next.birthMonth && next.birthDay) {
        const lastDay = new Date(Number(next.birthYear), Number(next.birthMonth), 0).getDate();
        if (Number(next.birthDay) > lastDay) next.birthDay = "";
      }
      const birthDate = next.birthYear && next.birthMonth && next.birthDay
        ? `${next.birthYear}-${next.birthMonth}-${next.birthDay}`
        : "";
      return { ...next, birthDate };
    });
  };

  const touchProfileField = (key) => {
    setProfileTouched((current) => ({ ...current, [key]: true }));
  };

  const openSignup = () => {
    setMode("signup");
    setSignupStep("phone");
    setMessage("");
    setPhoneTouched(false);
    setSignupPhoneError("");
    setSignupCodeError("");
    setProfileTouched({});
  };

  const closeSignup = () => {
    setMode("login");
    setSignupStep("phone");
    setMessage("");
    setSignupPhoneError("");
    setSignupCodeError("");
  };

  const openPasswordReset = () => {
    setMode("password-reset");
    setMessage("");
  };

  const openLoginIdRecovery = () => {
    setMode("login-id");
    setMessage("");
  };

  const closePasswordReset = () => {
    setMode("login");
    setMessage("");
  };

  const requestVerificationCode = async () => {
    const phone = signup.phone.replace(/\D/g, "");
    setPhoneTouched(true);
    if (!isValidMobilePhone(phone)) {
      setSignupPhoneError("휴대전화번호를 정확하게 입력해 주세요.");
      return;
    }

    setPhoneVerificationLoading(true);
    setMessage("");
    setSignupPhoneError("");
    setSignupCodeError("");

    try {
      const response = await fetch("/api/signup/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setSignupPhoneError(data.message || "인증번호 발송에 실패했습니다.");
        setPhoneVerificationLoading(false);
        return;
      }

      setCodeInput(["", "", "", "", "", ""]);
      setVerifiedPhone("");
      setPhoneVerificationToken("");
      setCodeRequested(true);
      setCodeSeconds(data.expiresInSeconds || 180);
    } catch {
      setSignupPhoneError("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const updateCodeInput = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCodeInput((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    setSignupCodeError("");
    if (digit) {
      const next = document.getElementById(`signup-code-${index + 1}`);
      next?.focus();
    }
  };

  const verifyCode = async () => {
    const code = codeInput.join("");
    if (!code || codeSeconds <= 0) {
      setSignupCodeError("인증시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setSignupCodeError("6자리 인증번호를 입력해 주세요.");
      return;
    }

    setPhoneVerificationLoading(true);
    setMessage("");
    setSignupCodeError("");

    try {
      const response = await fetch("/api/signup/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: signup.phone, code, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const verificationMessage = data.message || "인증번호가 일치하지 않습니다.";
        setSignupCodeError(
          verificationMessage.includes("일치하지")
            ? "인증번호가 일치하지 않습니다. 다시 확인해 주세요."
            : verificationMessage.includes("다시 받아")
              ? "인증시간이 만료되었습니다. 인증번호를 다시 받아주세요."
              : verificationMessage
        );
        setPhoneVerificationLoading(false);
        return;
      }

      setVerifiedPhone(data.phone || signup.phone);
      setPhoneVerificationToken(data.phoneVerificationToken || "");
      setSignupStep("profile");
      setMessage("");
    } catch {
      setSignupCodeError("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    if (!verifiedPhone || !phoneVerificationToken) {
      setSignupStep("phone");
      setMessage("휴대폰 인증을 먼저 완료해 주세요.");
      return;
    }
    if (!isSignupProfileComplete(signup)) {
      setProfileTouched({ name: true, gender: true, birthDate: true, loginId: true, password: true, terms: true });
      setMessage("필수 가입 정보를 확인해 주세요.");
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
          phoneVerificationToken,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setMessage(data.message || "회원가입 정보를 확인해 주세요.");
        setSignupLoading(false);
        return;
      }

      setSignupLoading(false);
      setLoginId(signup.loginId);
      setPassword("");
      setSignupStep("done");
      setMessage("");
    } catch {
      setMessage("회원가입 처리 중 오류가 발생했습니다.");
      setSignupLoading(false);
    }
  };

  if (mode === "signup") {
    const signupPhoneDigits = signup.phone.replace(/\D/g, "");
    const signupPhoneValid = isValidMobilePhone(signupPhoneDigits);
    const completeSignupCode = codeInput.join("");
    const signupCodeReady = codeRequested && codeSeconds > 0 && /^\d{6}$/.test(completeSignupCode);
    const currentYear = new Date().getFullYear();
    const signupYears = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));
    const signupMonths = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
    const signupDayCount = signup.birthYear && signup.birthMonth
      ? new Date(Number(signup.birthYear), Number(signup.birthMonth), 0).getDate()
      : 31;
    const signupDays = Array.from({ length: signupDayCount }, (_, index) => String(index + 1).padStart(2, "0"));
    const signupNameValid = Boolean(signup.name.trim());
    const signupGenderValid = ["남성", "여성"].includes(signup.gender);
    const signupBirthValid = isValidSignupBirthDate(signup.birthDate);
    const signupIdValid = /^[A-Za-z0-9_]{4,20}$/.test(signup.loginId);
    const signupPasswordValid = isStrongSignupPassword(signup.password);
    const requiredTermsAgreed = signup.privacyAgreed && signup.serviceAgreed;
    const allTermsAgreed = requiredTermsAgreed && signup.notificationAgreed;
    const signupProfileReady = signupNameValid
      && signupGenderValid
      && signupBirthValid
      && Boolean(verifiedPhone && phoneVerificationToken)
      && signupIdValid
      && signupPasswordValid
      && requiredTermsAgreed;

    return (
      <section className="auth-panel signup-card" aria-label="회원가입">
        {signupStep !== "done" && (
          <button className="signup-back-button" type="button" onClick={signupStep === "phone" ? closeSignup : () => setSignupStep("phone")}>
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">이전</span>
          </button>
        )}

        {signupStep === "phone" && (
          <div className="signup-step signup-phone-step">
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong><em>휴대폰 번호</em>를 입력해 주세요</strong>
              <p>대상자 발견 시 연락받을 보호자 번호를 인증해 주세요.</p>
            </div>

            <label className={`signup-field ${signupPhoneError || (phoneTouched && !signupPhoneValid) ? "invalid" : ""}`}>
              <span>휴대폰 번호</span>
              <input
                value={signup.phone}
                onChange={(event) => {
                  const formattedPhone = formatPhoneNumber(event.target.value);
                  updateSignup("phone", formattedPhone);
                  setSignupPhoneError("");
                  if (phoneTouched && !isValidMobilePhone(formattedPhone)) {
                    setSignupPhoneError("휴대전화번호를 정확하게 입력해 주세요.");
                  }
                }}
                onBlur={() => {
                  setPhoneTouched(true);
                  if (signupPhoneDigits && !signupPhoneValid) {
                    setSignupPhoneError("휴대전화번호를 정확하게 입력해 주세요.");
                  }
                }}
                placeholder="010-0000-0000"
                inputMode="tel"
                autoComplete="tel"
                maxLength={13}
                aria-invalid={Boolean(signupPhoneError || (phoneTouched && !signupPhoneValid))}
              />
              {signupPhoneError && <small className="signup-field-error" role="alert">{signupPhoneError}</small>}
            </label>
            <button className="login-submit signup-verification-request" type="button" onClick={requestVerificationCode} disabled={phoneVerificationLoading || !signupPhoneValid}>
              {phoneVerificationLoading ? "발송 중" : codeRequested ? "인증코드 다시 받기" : "인증코드 받기"}
            </button>

            <div className="signup-separator" />

            <div className="code-heading">
              <strong>인증번호 입력</strong>
              {codeRequested && <span className={codeSeconds === 0 ? "expired" : ""}>{formatTimer(codeSeconds)}</span>}
            </div>
            <div className={`verification-code-row ${codeRequested ? "active" : ""} ${signupCodeError ? "invalid" : ""}`}>
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
                  disabled={!codeRequested || codeSeconds <= 0}
                  aria-label={`${index + 1}번째 인증번호`}
                  aria-invalid={Boolean(signupCodeError)}
                />
              ))}
            </div>
            {signupCodeError && <p className="signup-code-error" role="alert">{signupCodeError}</p>}
            <button className="login-submit" type="button" onClick={verifyCode} disabled={phoneVerificationLoading || !signupCodeReady}>
              {phoneVerificationLoading ? "확인 중" : "확인"}
            </button>
            <button className="signup-link centered-link" type="button" onClick={requestVerificationCode} disabled={phoneVerificationLoading || !signupPhoneValid}>
              인증번호가 오지 않았나요? 재전송
            </button>

            <div className="signup-phone-notice">
              <ShieldCheckIcon />
              <p>
                입력한 휴대폰 번호는 대상자 발견 시 연락받을 보호자 연락처입니다. 정확한 번호를 입력해 주세요.<br />
                보호자 연락처는 안심번호로 안전하게 보호됩니다.
              </p>
            </div>
          </div>
        )}

        {signupStep === "profile" && (
          <form className="signup-step compact-signup-form signup-profile-form" onSubmit={submitSignup} noValidate>
            <h1 className="login-title">회원가입</h1>
            <p className="signup-profile-intro">가입 정보를 입력해 주세요.</p>

            <label className={`signup-profile-field ${profileTouched.name && !signupNameValid ? "invalid" : ""}`}>
              <span>이름</span>
              <input value={signup.name} onChange={(event) => updateSignup("name", event.target.value)} onBlur={() => touchProfileField("name")} placeholder="이름을 입력해 주세요." aria-invalid={profileTouched.name && !signupNameValid} />
              {profileTouched.name && !signupNameValid && <small role="alert">이름을 입력해 주세요.</small>}
            </label>

            <fieldset className={`signup-profile-gender ${profileTouched.gender && !signupGenderValid ? "invalid" : ""}`} onBlur={() => touchProfileField("gender")}>
              <legend>성별</legend>
              <label><input type="radio" name="signupGender" value="남성" checked={signup.gender === "남성"} onChange={(event) => { updateSignup("gender", event.target.value); touchProfileField("gender"); }} /><span>남성</span></label>
              <label><input type="radio" name="signupGender" value="여성" checked={signup.gender === "여성"} onChange={(event) => { updateSignup("gender", event.target.value); touchProfileField("gender"); }} /><span>여성</span></label>
              {profileTouched.gender && !signupGenderValid && <small role="alert">성별을 선택해 주세요.</small>}
            </fieldset>

            <fieldset className={`signup-profile-birth ${profileTouched.birthDate && !signupBirthValid ? "invalid" : ""}`} onBlur={() => touchProfileField("birthDate")}>
              <legend>생년월일</legend>
              <div>
                <select value={signup.birthYear} onChange={(event) => updateSignupBirthPart("birthYear", event.target.value)} aria-label="출생 연도"><option value="">년</option>{signupYears.map((year) => <option key={year} value={year}>{year}</option>)}</select>
                <select value={signup.birthMonth} onChange={(event) => updateSignupBirthPart("birthMonth", event.target.value)} aria-label="출생 월"><option value="">월</option>{signupMonths.map((month) => <option key={month} value={month}>{month}</option>)}</select>
                <select value={signup.birthDay} onChange={(event) => updateSignupBirthPart("birthDay", event.target.value)} aria-label="출생 일"><option value="">일</option>{signupDays.map((day) => <option key={day} value={day}>{day}</option>)}</select>
              </div>
              {profileTouched.birthDate && !signupBirthValid && <small role="alert">생년월일을 모두 선택해 주세요.</small>}
            </fieldset>

            <label className="signup-profile-field signup-profile-phone">
              <span>휴대전화번호</span>
              <span className="signup-profile-phone-row"><input value={verifiedPhone} readOnly aria-readonly="true" /><em>인증 완료</em></span>
            </label>

            <label className={`signup-profile-field ${profileTouched.loginId && !signupIdValid ? "invalid" : ""}`}>
              <span>아이디</span>
              <input value={signup.loginId} onChange={(event) => updateSignup("loginId", event.target.value)} onBlur={() => touchProfileField("loginId")} placeholder="영문, 숫자 조합 4자 이상" autoComplete="username" aria-invalid={profileTouched.loginId && !signupIdValid} />
              {profileTouched.loginId && !signupIdValid
                ? <small role="alert">영문과 숫자를 조합하여 4자 이상 입력해 주세요.</small>
                : signupIdValid && <small className="valid">사용 가능한 아이디 형식입니다.</small>}
            </label>

            <label className={`signup-profile-field signup-profile-password ${profileTouched.password && !signupPasswordValid ? "invalid" : ""}`}>
              <span>비밀번호</span>
              <span className="signup-profile-password-row">
                <input value={signup.password} onChange={(event) => updateSignup("password", event.target.value)} onBlur={() => touchProfileField("password")} type={showSignupPassword ? "text" : "password"} placeholder="비밀번호를 입력해 주세요." autoComplete="new-password" maxLength={64} aria-invalid={profileTouched.password && !signupPasswordValid} />
                <button type="button" onClick={() => setShowSignupPassword((current) => !current)} aria-label={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 표시"}><PasswordVisibilityIcon visible={showSignupPassword} /></button>
              </span>
              <small className={signupPasswordValid ? "valid" : ""}>영문, 숫자, 특수문자를 포함하여 8자 이상 입력해 주세요.</small>
            </label>

            <div className={`signup-profile-terms ${profileTouched.terms && !requiredTermsAgreed ? "invalid" : ""}`}>
              <strong>약관 동의</strong>
              <label><input type="checkbox" checked={allTermsAgreed} onChange={(event) => { const checked = event.target.checked; setSignup((current) => ({ ...current, privacyAgreed: checked, serviceAgreed: checked, notificationAgreed: checked })); }} /><span>전체 동의</span></label>
              <label><input type="checkbox" checked={signup.privacyAgreed} onChange={(event) => updateSignup("privacyAgreed", event.target.checked)} /><span>(필수) 개인정보 수집 및 이용 동의</span><button type="button" onClick={() => setOpenRegulationType("privacy")}>자세히</button></label>
              <label><input type="checkbox" checked={signup.serviceAgreed} onChange={(event) => updateSignup("serviceAgreed", event.target.checked)} /><span>(필수) 서비스 이용 약관 동의</span><button type="button" onClick={() => setOpenRegulationType("service")}>자세히</button></label>
              <label><input type="checkbox" checked={signup.notificationAgreed} onChange={(event) => updateSignup("notificationAgreed", event.target.checked)} /><span>(선택) 알림 동의</span><button type="button" onClick={() => setOpenRegulationType("notification")}>자세히</button></label>
              {profileTouched.terms && !requiredTermsAgreed && <small role="alert">필수 약관에 모두 동의해 주세요.</small>}
            </div>

            <button className="login-submit" type="submit" disabled={signupLoading || !signupProfileReady}>
              {signupLoading ? "처리중" : "회원가입"}
            </button>
          </form>
        )}

        {signupStep === "done" && (
          <div className="signup-step signup-complete signup-complete-reference">
            <div className="complete-mark" aria-hidden="true"><span /></div>
            <h1>회원가입이 완료되었습니다!</h1>
            <p>로그인 후 제자리 서비스를 이용해 주세요.</p>
            <button
              className="login-submit"
              type="button"
              onClick={() => {
                setMode("login");
                setSignupStep("phone");
                setMessage("");
              }}
            >
              로그인하기
            </button>
          </div>
        )}

        {message && <p className="login-message" role="status">{message}</p>}
        {openRegulationType && (
          <ServiceRegulationModal
            type={openRegulationType}
            initialDocument={serviceRegulations[openRegulationType]}
            onClose={() => setOpenRegulationType("")}
          />
        )}
      </section>
    );
  }

  if (mode === "password-reset") {
    return (
      <PasswordResetPanel
        onBack={closePasswordReset}
        onComplete={({ loginId: recoveredLoginId }) => {
          if (recoveredLoginId) setLoginId(recoveredLoginId);
          setMode("login");
          setMessage("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.");
        }}
      />
    );
  }

  if (mode === "login-id") {
    return (
      <LoginIdRecoveryPanel
        onBack={() => setMode("login")}
        onLogin={(recoveredLoginId) => {
          setLoginId(recoveredLoginId);
          setPassword("");
          setMode("login");
          setMessage("");
        }}
        onPasswordReset={openPasswordReset}
        initialLoginId={initialMode === "login-id-found" ? "jinyoung10" : ""}
      />
    );
  }

  const hasCredentialError = message === LOGIN_ERROR_MESSAGE;
  const loginReady = Boolean(loginId.trim() && password);
  const clearCredentialError = () => {
    if (hasCredentialError) setMessage("");
  };

  return (
    <section className="auth-panel login-card" aria-label="로그인">
      <Image
        className="login-wordmark"
        src="/icons/zezari-wordmark-v1-512.png"
        alt="제자리"
        width={512}
        height={512}
        priority
      />
      <h1 className="login-title">로그인</h1>

      <form className="credentials-login-form" onSubmit={submitCredentials}>
        <label className="visually-hidden" htmlFor="login-id">
          아이디
        </label>
        <input
          id="login-id"
          className={hasCredentialError ? "login-credential-input invalid" : "login-credential-input"}
          name="loginId"
          value={loginId}
          onChange={(event) => {
            setLoginId(event.target.value);
            clearCredentialError();
          }}
          placeholder="아이디"
          type="text"
          autoComplete="username"
          aria-invalid={hasCredentialError}
        />

        <label className="visually-hidden" htmlFor="login-password">
          비밀번호
        </label>
        <div className={hasCredentialError ? "login-password-field invalid" : "login-password-field"}>
          <input
            id="login-password"
            name="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearCredentialError();
            }}
            placeholder="비밀번호"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={hasCredentialError}
          />
          <button
            className="password-visibility-button"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <PasswordVisibilityIcon visible={showPassword} />
          </button>
        </div>

        {hasCredentialError && (
          <p className="login-field-error" role="alert">{LOGIN_ERROR_MESSAGE}</p>
        )}

        <div className="login-options">
          <label className="remember-login">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>자동로그인</span>
          </label>
          <div className="login-recovery-links">
            <button className="link-button" type="button" onClick={openLoginIdRecovery}>아이디 찾기</button>
            <span aria-hidden="true">|</span>
            <button className="link-button" type="button" onClick={openPasswordReset}>비밀번호 찾기</button>
          </div>
        </div>

        <button className="login-submit" type="submit" disabled={loading || !loginReady}>
          {loading ? "로그인 중" : "로그인"}
        </button>
      </form>

      {message && !hasCredentialError && (
        <p className={`login-message ${message.startsWith("비밀번호가 변경되었습니다.") ? "success" : ""}`} role="status">
          {message}
        </p>
      )}

      <div className="login-divider">
        <span>또는</span>
      </div>

      <p className="sns-login-title">SNS 계정으로 간편 로그인</p>
      <SocialLoginButtons
        enabledProviders={enabledProviders}
        variant="icons"
        callbackUrl={qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : undefined}
      />

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

    </section>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 4 40 10v12c0 10.4-6.4 17.1-16 22-9.6-4.9-16-11.6-16-22V10l16-6Z" />
      <path d="m17 23 5 5 10-11" />
    </svg>
  );
}

export function SocialLoginButtons({ enabledProviders = [], variant = "stack", callbackUrl }) {
  return <SocialLoginButtonsInner enabledProviders={enabledProviders} variant={variant} callbackUrl={callbackUrl} />;
}

function SocialLoginButtonsInner({ enabledProviders = [], variant = "stack", callbackUrl }) {
  const enabled = new Set(enabledProviders);
  const providers = variant === "icons"
    ? [socialProviders[1], socialProviders[2], socialProviders[0]]
    : socialProviders;

  return (
    <div className={variant === "icons" ? "social-icon-row" : "social-login-stack"}>
      {providers.map(({ id, label, fullLabel, className, Logo }) => {
        const configured = enabled.has(id);
        const disabled = !configured;

        return (
          <button
            className={variant === "icons" ? `social-icon-button ${className}` : `action social-action ${className}`}
            type="button"
            key={id}
            onClick={() => !disabled && signIn(id, { callbackUrl: callbackUrl || "/" })}
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

export function LogoutButton({ className = "action secondary", children = "Log out" } = {}) {
  return (
    <button className={className} type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      {children}
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
    return null;
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

function formatPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10 && !digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidMobilePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return /^010\d{8}$/.test(digits) || /^01[16789]\d{7,8}$/.test(digits);
}

function isValidSignupBirthDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3])
    && date <= new Date();
}

function isStrongSignupPassword(value) {
  const password = String(value || "");
  return password.length >= 8
    && password.length <= 64
    && /[A-Za-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

function isSignupProfileComplete(signup) {
  return Boolean(
    signup?.name?.trim()
    && ["남성", "여성"].includes(signup?.gender)
    && isValidSignupBirthDate(signup?.birthDate)
    && /^[A-Za-z0-9_]{4,20}$/.test(signup?.loginId || "")
    && isStrongSignupPassword(signup?.password)
    && signup?.privacyAgreed
    && signup?.serviceAgreed
  );
}

export function GoogleLogo() {
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

export function KakaoLogo() {
  return (
    <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#191919"
        d="M12 4C6.98 4 3 7.14 3 11.02c0 2.47 1.62 4.64 4.05 5.89l-.72 2.65c-.08.31.27.56.53.38l3.16-2.1c.64.13 1.3.2 1.98.2 5.02 0 9-3.14 9-7.02S17.02 4 12 4z"
      />
      <text x="12" y="12.7" fill="#fee500" fontSize="4.3" fontWeight="900" textAnchor="middle">
        TALK
      </text>
    </svg>
  );
}

export function NaverLogo() {
  return (
    <svg className="social-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#ffffff" d="M7 6h3.85l3.3 4.78V6H17v12h-3.85l-3.3-4.78V18H7V6z" />
    </svg>
  );
}
