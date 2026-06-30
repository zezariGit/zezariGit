"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SocialSignupCompletion({ guardian, session }) {
  const [step, setStep] = useState("phone");
  const [form, setForm] = useState({
    phone: guardian?.phone || "",
    name: guardian?.name || session?.user?.name || "",
    birthDate: guardian?.birth_date || "",
    email: guardian?.email || guardian?.google_email || session?.user?.email || "",
    loginId: guardian?.login_id || "",
    password: "",
    privacyAgreed: false,
    serviceAgreed: false,
  });
  const [codeInput, setCodeInput] = useState(["", "", "", "", "", ""]);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "phone") {
      setVerifiedPhone("");
      setPhoneVerificationToken("");
      setCodeInput(["", "", "", "", "", ""]);
    }
  };

  const requestCode = async () => {
    const digits = form.phone.replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
      setMessage("휴대폰 번호를 정확히 입력해 주세요.");
      return;
    }

    setPhoneVerificationLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호 발송에 실패했습니다.");
        setPhoneVerificationLoading(false);
        return;
      }

      setCodeInput(["", "", "", "", "", ""]);
      setVerifiedPhone("");
      setPhoneVerificationToken("");
      setSeconds(data.expiresInSeconds || 180);
      setMessage("인증번호를 발송했습니다. 문자로 받은 6자리 번호를 입력해 주세요.");
    } catch {
      setMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const updateCode = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCodeInput((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit) {
      document.getElementById(`social-signup-code-${index + 1}`)?.focus();
    }
  };

  const verifyCode = async () => {
    const code = codeInput.join("");
    if (!code || seconds <= 0) {
      setMessage("인증코드를 다시 받아 주세요.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setMessage("6자리 인증번호를 입력해 주세요.");
      return;
    }

    setPhoneVerificationLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호가 일치하지 않습니다.");
        setPhoneVerificationLoading(false);
        return;
      }

      setVerifiedPhone(data.phone || form.phone);
      setPhoneVerificationToken(data.phoneVerificationToken || "");
      setStep("profile");
      setMessage("휴대폰 인증이 완료되었습니다.");
    } catch {
      setMessage("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!verifiedPhone || !phoneVerificationToken) {
      setStep("phone");
      setMessage("휴대폰 인증을 먼저 완료해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: verifiedPhone,
          phoneVerificationToken,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "회원가입 정보를 확인해 주세요.");
        setLoading(false);
        return;
      }

      setStep("done");
      setLoading(false);
    } catch {
      setMessage("회원가입 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-signup-panel" aria-label="SNS 회원가입 정보 입력">
      <div className="signup-card">
        {step !== "done" && (
          <button
            className="signup-back-button"
            type="button"
            onClick={() => (step === "phone" ? signOut({ callbackUrl: "/" }) : setStep("phone"))}
          >
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">이전</span>
          </button>
        )}

        {step === "phone" && (
          <div className="signup-step">
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>휴대폰 번호를 입력해주세요</strong>
              <p>SNS 계정 확인이 완료되었습니다. 보호자 알림을 위해 휴대폰 인증을 진행해 주세요.</p>
            </div>
            <label className="signup-field">
              <span>휴대폰 번호</span>
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="010 - 1234 - 5678"
                inputMode="tel"
              />
            </label>
            <button className="login-submit" type="button" onClick={requestCode} disabled={phoneVerificationLoading}>
              {phoneVerificationLoading ? "발송 중" : "인증코드 받기"}
            </button>
            <div className="signup-separator" />
            <div className="code-heading">
              <strong>인증번호 입력</strong>
              <span>{formatTimer(seconds)}</span>
            </div>
            <div className="verification-code-row">
              {codeInput.map((value, index) => (
                <input
                  id={`social-signup-code-${index}`}
                  key={index}
                  value={value}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !value && index > 0) {
                      document.getElementById(`social-signup-code-${index - 1}`)?.focus();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`${index + 1}번째 인증번호`}
                />
              ))}
            </div>
            <button className="login-submit" type="button" onClick={verifyCode} disabled={phoneVerificationLoading}>
              {phoneVerificationLoading ? "확인 중" : "확인"}
            </button>
            <button className="signup-link centered-link" type="button" onClick={requestCode} disabled={phoneVerificationLoading}>
              인증번호가 오지 않았나요? 재전송
            </button>
          </div>
        )}

        {step === "profile" && (
          <form className="signup-step compact-signup-form" onSubmit={submit}>
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>기본 정보를 입력해주세요</strong>
              <p>SNS에서 확인된 정보는 미리 입력했습니다. 필요한 항목을 확인해 주세요.</p>
            </div>
            <label className="signup-field">
              <span>이름</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
            </label>
            <label className="signup-field">
              <span>생년월일</span>
              <input value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} type="date" required />
            </label>
            <label className="signup-field phone-with-badge">
              <span>휴대폰 번호</span>
              <input value={verifiedPhone} readOnly />
              <em>인증완료</em>
            </label>
            <label className="signup-field">
              <span>이메일</span>
              <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" />
            </label>
            <label className="signup-field">
              <span>아이디</span>
              <input
                value={form.loginId}
                onChange={(event) => update("loginId", event.target.value)}
                placeholder="zezari_mom"
                autoComplete="username"
                required
              />
            </label>
            <label className="signup-field">
              <span>비밀번호</span>
              <input
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
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
                  checked={form.privacyAgreed}
                  onChange={(event) => update("privacyAgreed", event.target.checked)}
                />
                <span>개인정보 수집 및 이용 동의 (필수)</span>
                <button type="button">자세히</button>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.serviceAgreed}
                  onChange={(event) => update("serviceAgreed", event.target.checked)}
                />
                <span>서비스 이용 약관 동의 (필수)</span>
                <button type="button">자세히</button>
              </label>
            </div>
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "처리중" : "다음"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="signup-step signup-complete">
            <div className="complete-mark" aria-hidden="true">✓</div>
            <h1>회원가입이 완료되었습니다!</h1>
            <p>zezari 서비스에 오신 것을 환영합니다. 소중한 가족의 안전을 함께 지켜요.</p>
            <button className="login-submit" type="button" onClick={() => window.location.assign("/?tab=info#subjects-info")}>
              대상자 등록하기
            </button>
            <button className="outline-login-button" type="button" onClick={() => window.location.assign("/?tab=dashboard")}>
              대시보드 바로가기
            </button>
          </div>
        )}

        {message && <p className="login-message" role="status">{message}</p>}
      </div>
    </section>
  );
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const rest = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}
