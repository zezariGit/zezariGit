"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import BackButton from "./back-button";
import ServiceRegulationModal from "./service-regulation-modal";
import { DEFAULT_SERVICE_REGULATIONS } from "../lib/service-regulations";

const EMPTY_CODE = ["", "", "", "", "", ""];
const PREVIEW_PHONE = "010-1234-5678";

export function LoginAuthPanel({
  initialMode = "login",
  initialSignupStep,
  initialLoginStep,
  qrClaim = false,
  serviceRegulations = DEFAULT_SERVICE_REGULATIONS,
}) {
  const signupPreview = initialSignupStep === "profile" || initialSignupStep === "existing";
  const loginPreview = initialLoginStep === "code" || initialLoginStep === "unregistered";
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "login");
  const [phone, setPhone] = useState(signupPreview || loginPreview ? PREVIEW_PHONE : "");
  const [code, setCode] = useState(signupPreview ? ["1", "2", "3", "4", "5", "6"] : loginPreview ? ["1", "2", "", "", "", ""] : EMPTY_CODE);
  const [codeRequested, setCodeRequested] = useState(signupPreview || loginPreview);
  const [seconds, setSeconds] = useState(signupPreview || loginPreview ? 180 : 0);
  const [verifiedPhone, setVerifiedPhone] = useState(signupPreview ? PREVIEW_PHONE : "");
  const [phoneVerificationToken, setPhoneVerificationToken] = useState(signupPreview ? "preview-token" : "");
  const [dialog, setDialog] = useState(initialSignupStep === "existing" ? "existing-signup" : initialLoginStep === "unregistered" ? "unregistered-login" : "");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [message, setMessage] = useState("");
  const [profileTouched, setProfileTouched] = useState({});
  const [openRegulationType, setOpenRegulationType] = useState("");
  const [profile, setProfile] = useState({
    name: signupPreview ? "김제자리" : "",
    gender: signupPreview ? "여성" : "",
    birthYear: signupPreview ? "1990" : "",
    birthMonth: signupPreview ? "01" : "",
    birthDay: signupPreview ? "01" : "",
    privacyAgreed: false,
    serviceAgreed: false,
    notificationAgreed: false,
  });

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [mode]);

  const phoneValid = isValidMobilePhone(phone);
  const codeReady = codeRequested && seconds > 0 && /^\d{6}$/.test(code.join(""));
  const birthDate = profile.birthYear && profile.birthMonth && profile.birthDay
    ? `${profile.birthYear}-${profile.birthMonth}-${profile.birthDay}`
    : "";
  const profileReady = Boolean(
    verifiedPhone
      && phoneVerificationToken
      && profile.name.trim()
      && ["남성", "여성"].includes(profile.gender)
      && isValidSignupBirthDate(birthDate)
      && profile.privacyAgreed
      && profile.serviceAgreed,
  );

  const resetVerification = (nextPhone = "") => {
    setPhone(nextPhone);
    setCode(EMPTY_CODE);
    setCodeRequested(false);
    setSeconds(0);
    setVerifiedPhone("");
    setPhoneVerificationToken("");
    setPhoneError("");
    setCodeError("");
    setMessage("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setDialog("");
    resetVerification("");
  };

  const requestCode = async () => {
    if (!phoneValid) {
      setPhoneError("휴대폰 번호를 정확하게 입력해 주세요.");
      return;
    }
    setLoading(true);
    setPhoneError("");
    setCodeError("");
    setMessage("");
    try {
      const endpoint = mode === "login" ? "/api/auth/phone/send" : "/api/signup/phone/send";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: mode === "login" ? "phone_login" : "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "인증번호 발송에 실패했습니다.");
      setCode(EMPTY_CODE);
      setCodeRequested(true);
      setSeconds(data.expiresInSeconds || 180);
      window.setTimeout(() => document.getElementById(`${mode}-code-0`)?.focus(), 0);
    } catch (error) {
      setPhoneError(error.message || "인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!codeReady) {
      setCodeError(seconds <= 0 ? "인증시간이 만료되었습니다. 인증번호를 다시 받아 주세요." : "6자리 인증번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setCodeError("");
    setMessage("");
    try {
      const endpoint = mode === "login" ? "/api/auth/phone/verify" : "/api/signup/phone/verify";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: code.join(""), purpose: mode === "login" ? "phone_login" : "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "인증번호를 확인해 주세요.");

      if (mode === "login") {
        if (!data.registered) {
          setDialog("unregistered-login");
          return;
        }
        const result = await signIn("phone", {
          phone: data.phone || phone,
          phoneVerificationToken: data.phoneVerificationToken,
          redirect: false,
          callbackUrl: qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : "/",
        });
        if (!result?.ok) throw new Error("로그인에 실패했습니다. 다시 인증해 주세요.");
        window.location.assign(result.url || (qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : "/"));
        return;
      }

      if (data.registered) {
        setVerifiedPhone(data.phone || phone);
        setPhoneVerificationToken(data.phoneVerificationToken || "");
        setDialog("existing-signup");
        return;
      }
      setVerifiedPhone(data.phone || phone);
      setPhoneVerificationToken(data.phoneVerificationToken || "");
    } catch (error) {
      setCodeError(error.message || "인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (event) => {
    event.preventDefault();
    if (!profileReady) {
      setProfileTouched({ name: true, gender: true, birthDate: true, terms: true });
      setMessage("필수 회원 정보를 확인해 주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/signup/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name.trim(),
          gender: profile.gender,
          birthDate,
          phone: verifiedPhone,
          phoneVerificationToken,
          privacyAgreed: profile.privacyAgreed,
          serviceAgreed: profile.serviceAgreed,
          notificationAgreed: profile.notificationAgreed,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "회원가입 정보를 확인해 주세요.");
      const result = await signIn("phone", {
        phone: data.guardian.phone,
        phoneVerificationToken: data.guardian.phoneLoginToken,
        redirect: false,
        callbackUrl: qrClaim ? "/?tab=subjects&mode=new&qrClaim=1" : "/?tab=subjects&mode=new",
      });
      if (!result?.ok) throw new Error("가입은 완료되었지만 자동 로그인에 실패했습니다. 로그인 화면에서 다시 인증해 주세요.");
      window.location.assign(result.url || "/?tab=subjects&mode=new");
    } catch (error) {
      setMessage(error.message || "회원가입 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <section className={`phone-auth-shell ${mode === "signup" ? "is-signup" : "is-login"}`} aria-label={mode === "signup" ? "회원가입" : "로그인"}>
      <header className="phone-auth-header">
        <BackButton onClick={() => mode === "signup" ? switchMode("login") : window.history.back()} label="이전" />
        <h1>{mode === "signup" ? "회원가입" : "로그인"}</h1>
        <span aria-hidden="true" />
      </header>

      {mode === "login" ? (
        <LoginPhoneContent
          phone={phone}
          setPhone={(value) => resetVerification(formatPhoneNumber(value))}
          phoneValid={phoneValid}
          phoneError={phoneError}
          code={code}
          setCode={setCode}
          codeRequested={codeRequested}
          codeReady={codeReady}
          seconds={seconds}
          codeError={codeError}
          loading={loading}
          requestCode={requestCode}
          verifyCode={verifyCode}
        />
      ) : (
        <SignupContent
          phone={phone}
          setPhone={(value) => { if (!verifiedPhone) resetVerification(formatPhoneNumber(value)); }}
          phoneValid={phoneValid}
          phoneError={phoneError}
          code={code}
          setCode={setCode}
          codeRequested={codeRequested}
          codeReady={codeReady}
          seconds={seconds}
          codeError={codeError}
          loading={loading}
          requestCode={requestCode}
          verifyCode={verifyCode}
          verifiedPhone={verifiedPhone}
          profile={profile}
          setProfile={setProfile}
          profileTouched={profileTouched}
          setProfileTouched={setProfileTouched}
          profileReady={profileReady}
          submitSignup={submitSignup}
          message={message}
          setOpenRegulationType={setOpenRegulationType}
        />
      )}

      {mode === "login" && message && <p className="phone-auth-message" role="status">{message}</p>}
      {mode === "login" && <button className="phone-auth-switch" type="button" onClick={() => switchMode("signup")}>처음이신가요? <strong>회원가입</strong></button>}
      {dialog && <PhoneAuthDialog type={dialog} onAction={() => switchMode(dialog === "existing-signup" ? "login" : "signup")} />}
      {openRegulationType && <ServiceRegulationModal type={openRegulationType} initialDocument={serviceRegulations[openRegulationType]} onClose={() => setOpenRegulationType("")} />}
    </section>
  );
}

function LoginPhoneContent(props) {
  return (
    <div className="phone-login-content">
      <div className="phone-auth-copy"><h2>휴대폰 번호로 로그인해 주세요</h2><p>가입한 휴대폰번호 인증 후 바로 로그인됩니다.</p></div>
      <PhoneVerificationFields {...props} mode="login" />
      <div className="phone-login-notice"><ShieldCheckIcon /><span>인증에 성공하면 별도의 로그인 단계 없이<br />대시보드로 바로 이동합니다.</span></div>
    </div>
  );
}

function SignupContent({ verifiedPhone, profile, setProfile, profileTouched, setProfileTouched, profileReady, submitSignup, message, setOpenRegulationType, ...verificationProps }) {
  const disabled = !verifiedPhone;
  const requiredTermsAgreed = profile.privacyAgreed && profile.serviceAgreed;
  const allTermsAgreed = requiredTermsAgreed && profile.notificationAgreed;
  const years = useMemo(() => { const currentYear = new Date().getFullYear(); return Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index)); }, []);
  const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  const dayCount = profile.birthYear && profile.birthMonth ? new Date(Number(profile.birthYear), Number(profile.birthMonth), 0).getDate() : 31;
  const days = Array.from({ length: dayCount }, (_, index) => String(index + 1).padStart(2, "0"));
  const updateProfile = (key, value) => setProfile((current) => {
    const next = { ...current, [key]: value };
    if ((key === "birthYear" || key === "birthMonth") && Number(next.birthDay) > new Date(Number(next.birthYear), Number(next.birthMonth), 0).getDate()) next.birthDay = "";
    return next;
  });

  return (
    <form className="phone-signup-content" onSubmit={submitSignup} noValidate>
      <section className="phone-signup-section">
        <div className="phone-signup-heading"><h2>휴대전화번호 인증</h2><p>가입된 회원인지 먼저 확인합니다.</p></div>
        <PhoneVerificationFields {...verificationProps} verifiedPhone={verifiedPhone} mode="signup" />
        {verifiedPhone && <p className="phone-verification-success"><ShieldCheckIcon /> 휴대폰 인증이 완료되었습니다.</p>}
      </section>
      <div className="phone-signup-divider" />
      <section className={`phone-signup-section profile-section${disabled ? " is-disabled" : ""}`} aria-disabled={disabled}>
        <div className="phone-signup-heading"><h2>회원 정보</h2></div>
        <label className="phone-profile-field"><span>이름</span><input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} onBlur={() => setProfileTouched((value) => ({ ...value, name: true }))} disabled={disabled} placeholder="이름을 입력해 주세요" /></label>
        {profileTouched.name && !profile.name.trim() && <small className="phone-field-error">이름을 입력해 주세요.</small>}
        <fieldset className="phone-profile-gender" disabled={disabled}><legend>성별</legend><label><input type="radio" name="signupGender" checked={profile.gender === "남성"} onChange={() => updateProfile("gender", "남성")} /><span>남성</span></label><label><input type="radio" name="signupGender" checked={profile.gender === "여성"} onChange={() => updateProfile("gender", "여성")} /><span>여성</span></label></fieldset>
        <fieldset className="phone-profile-birth" disabled={disabled}><legend>생년월일</legend><div><select value={profile.birthYear} onChange={(event) => updateProfile("birthYear", event.target.value)}><option value="">년</option>{years.map((year) => <option key={year}>{year}</option>)}</select><select value={profile.birthMonth} onChange={(event) => updateProfile("birthMonth", event.target.value)}><option value="">월</option>{months.map((month) => <option key={month}>{month}</option>)}</select><select value={profile.birthDay} onChange={(event) => updateProfile("birthDay", event.target.value)}><option value="">일</option>{days.map((day) => <option key={day}>{day}</option>)}</select></div></fieldset>
      </section>
      <section className={`phone-terms-section${disabled ? " is-disabled" : ""}`}>
        <h2>약관 동의</h2>
        <label className="phone-terms-all"><input type="checkbox" disabled={disabled} checked={allTermsAgreed} onChange={(event) => { const checked = event.target.checked; setProfile((value) => ({ ...value, privacyAgreed: checked, serviceAgreed: checked, notificationAgreed: checked })); }} /><span>전체 동의</span></label>
        <label><input type="checkbox" disabled={disabled} checked={profile.privacyAgreed} onChange={(event) => updateProfile("privacyAgreed", event.target.checked)} /><span>(필수) 개인정보 수집 및 이용 동의</span><button type="button" disabled={disabled} onClick={() => setOpenRegulationType("privacy")}>자세히</button></label>
        <label><input type="checkbox" disabled={disabled} checked={profile.serviceAgreed} onChange={(event) => updateProfile("serviceAgreed", event.target.checked)} /><span>(필수) 서비스 이용약관 동의</span><button type="button" disabled={disabled} onClick={() => setOpenRegulationType("service")}>자세히</button></label>
        <label><input type="checkbox" disabled={disabled} checked={profile.notificationAgreed} onChange={(event) => updateProfile("notificationAgreed", event.target.checked)} /><span>(선택) 알림 수신 동의</span><button type="button" disabled={disabled} onClick={() => setOpenRegulationType("notification")}>자세히</button></label>
      </section>
      {message && <p className="phone-auth-message" role="status">{message}</p>}
      <button className="phone-auth-primary phone-signup-submit" type="submit" disabled={disabled || !profileReady}>가입하기</button>
    </form>
  );
}

function PhoneVerificationFields({ mode, phone, setPhone, phoneValid, phoneError, code, setCode, codeRequested, codeReady, seconds, codeError, loading, requestCode, verifyCode, verifiedPhone = "" }) {
  const updateCode = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit) document.getElementById(`${mode}-code-${index + 1}`)?.focus();
  };
  return (
    <div className={`phone-verification-fields${verifiedPhone ? " is-verified" : ""}`}>
      <label className="phone-auth-field"><span>휴대전화번호</span><input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={Boolean(verifiedPhone)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" maxLength={13} /></label>
      {phoneError && <small className="phone-field-error" role="alert">{phoneError}</small>}
      <button className="phone-auth-primary phone-code-request" type="button" onClick={requestCode} disabled={loading || !phoneValid || Boolean(verifiedPhone)}>{verifiedPhone ? "인증 완료" : codeRequested ? "인증번호 다시 받기" : "인증번호 받기"}</button>
      <div className="phone-auth-separator" />
      <div className="phone-code-heading">
        <strong>인증번호</strong>
        {codeRequested && <span aria-live="polite">{verifiedPhone ? "인증 완료" : formatTimer(seconds)}</span>}
      </div>
      <div className={`phone-code-row${codeError ? " is-invalid" : ""}`}>{code.map((value, index) => <input id={`${mode}-code-${index}`} key={index} value={value} onChange={(event) => updateCode(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !value && index > 0) document.getElementById(`${mode}-code-${index - 1}`)?.focus(); }} disabled={!codeRequested || seconds <= 0 || Boolean(verifiedPhone)} inputMode="numeric" maxLength={1} aria-label={`${index + 1}번째 인증번호`} />)}</div>
      {codeError && <small className="phone-field-error" role="alert">{codeError}</small>}
      <button className="phone-auth-primary phone-code-confirm" type="button" onClick={verifyCode} disabled={loading || !codeReady || Boolean(verifiedPhone)}>{verifiedPhone ? "완료" : "확인"}</button>
      {codeRequested && !verifiedPhone && <button className="phone-code-resend" type="button" onClick={requestCode} disabled={loading || !phoneValid}>인증번호가 오지 않았나요? <strong>재전송</strong></button>}
    </div>
  );
}

function PhoneAuthDialog({ type, onAction }) {
  const existing = type === "existing-signup";
  return <div className="phone-auth-dialog-backdrop" role="presentation"><section className="phone-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="phone-auth-dialog-title"><h2 id="phone-auth-dialog-title">{existing ? "이미 가입된 휴대폰번호입니다." : "가입되지 않은 휴대폰번호입니다."}</h2><p>{existing ? "기존 계정으로 로그인해 주세요." : "회원가입 후 이용해 주세요."}</p><button className="phone-auth-primary" type="button" onClick={onAction}>{existing ? "로그인하기" : "회원가입하기"}</button></section></div>;
}

function ShieldCheckIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4 40 10v12c0 10.4-6.4 17.1-16 22-9.6-4.9-16-11.6-16-22V10l16-6Z" /><path d="m17 23 5 5 10-11" /></svg>;
}

export function SocialLoginButtons({ callbackUrl }) {
  return <a className="action phone-login-link" href={`/?login=1${callbackUrl?.includes("qrClaim=1") ? "&qrClaim=1" : ""}`}>휴대폰 번호로 계속하기</a>;
}

export function GoogleLoginButton(props) {
  return <SocialLoginButtons {...props} />;
}

export function LogoutButton({ className = "action secondary", children = "Log out", callbackUrl = "/" } = {}) {
  return <button className={className} type="button" onClick={() => signOut({ callbackUrl })}>{children}</button>;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
    setIsiOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    const beforeInstall = (event) => { event.preventDefault(); setInstallEvent(event); };
    const installedHandler = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installedHandler);
    return () => { window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", installedHandler); };
  }, []);
  if (installed) return null;
  if (installEvent) return <button className="install-action" type="button" onClick={async () => { installEvent.prompt(); await installEvent.userChoice; setInstallEvent(null); }}>앱 설치</button>;
  if (isiOS) return <p className="install-note">iPhone에서는 Safari 공유 메뉴에서 홈 화면에 추가를 선택하세요.</p>;
  return <p className="install-note">브라우저 메뉴에서 앱 설치를 사용할 수 있습니다.</p>;
}

function formatTimer(seconds) {
  const value = Math.max(0, Number(seconds || 0));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function formatPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10 && !digits.startsWith("010")) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) && date <= new Date();
}
