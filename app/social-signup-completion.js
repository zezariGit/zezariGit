"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SocialSignupCompletion({ guardian, session }) {
  const providerLabel = socialProviderLabel(session?.user?.provider);
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    phone: guardian?.phone || "",
    name: guardian?.name || session?.user?.name || "",
    birthDate: guardian?.birth_date || "",
    email: guardian?.email || guardian?.google_email || session?.user?.email || "",
    privacyAgreed: false,
    serviceAgreed: false,
  });
  const [codeInput, setCodeInput] = useState(["", "", "", "", "", ""]);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "email") {
      setVerifiedEmail("");
      setEmailVerificationToken("");
      setCodeInput(["", "", "", "", "", ""]);
    }
  };

  const requestCode = async () => {
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("이메일 주소를 정확히 입력해 주세요.");
      return;
    }

    setEmailVerificationLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호 발송에 실패했습니다.");
        setEmailVerificationLoading(false);
        return;
      }

      setCodeInput(["", "", "", "", "", ""]);
      setVerifiedEmail("");
      setEmailVerificationToken("");
      setSeconds(data.expiresInSeconds || 180);
      setMessage("인증번호를 발송했습니다. 이메일로 받은 6자리 번호를 입력해 주세요.");
    } catch {
      setMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setEmailVerificationLoading(false);
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

    setEmailVerificationLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/signup/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code, purpose: "signup" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호가 일치하지 않습니다.");
        setEmailVerificationLoading(false);
        return;
      }

      setVerifiedEmail(data.email || form.email);
      setEmailVerificationToken(data.emailVerificationToken || "");
      setStep("profile");
      setMessage("이메일 인증이 완료되었습니다.");
    } catch {
      setMessage("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!verifiedEmail || !emailVerificationToken) {
      setStep("email");
      setMessage("이메일 인증을 먼저 완료해 주세요.");
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
          email: verifiedEmail,
          emailVerificationToken,
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
            onClick={() => (step === "email" ? signOut({ callbackUrl: "/" }) : setStep("email"))}
          >
            <span aria-hidden="true">‹</span>
            <span className="visually-hidden">이전</span>
          </button>
        )}

        {step === "email" && (
          <div className="signup-step">
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>이메일 주소를 확인해주세요</strong>
              <p>{providerLabel}에서 확인된 이메일로 회원가입 인증을 진행해 주세요.</p>
            </div>
            <label className="signup-field">
              <span>이메일</span>
              <input
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
              />
            </label>
            <button className="login-submit" type="button" onClick={requestCode} disabled={emailVerificationLoading}>
              {emailVerificationLoading ? "발송 중" : "인증코드 받기"}
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
            <button className="login-submit" type="button" onClick={verifyCode} disabled={emailVerificationLoading}>
              {emailVerificationLoading ? "확인 중" : "확인"}
            </button>
            <button className="signup-link centered-link" type="button" onClick={requestCode} disabled={emailVerificationLoading}>
              인증번호가 오지 않았나요? 재전송
            </button>
          </div>
        )}

        {step === "profile" && (
          <form className="signup-step compact-signup-form" onSubmit={submit}>
            <h1 className="login-title">회원가입</h1>
            <div className="signup-copy">
              <strong>기본 정보를 입력해주세요</strong>
              <p>{providerLabel}에서 확인된 정보는 미리 입력했습니다. 필요한 항목을 확인해 주세요.</p>
            </div>
            <div className="social-signup-account-note">
              <strong>{providerLabel} 계정으로 가입</strong>
              <span>별도 아이디와 비밀번호를 만들지 않고 {providerLabel} 계정으로 로그인합니다.</span>
            </div>
            <label className="signup-field">
              <span>이름</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} required />
            </label>
            <label className="signup-field">
              <span>생년월일</span>
              <input value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} type="date" required />
            </label>
            <label className="signup-field verification-complete-field">
              <span>이메일</span>
              <input value={verifiedEmail} readOnly />
              <em>인증완료</em>
            </label>
            <label className="signup-field">
              <span>휴대폰 번호</span>
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="010 - 1234 - 5678"
                inputMode="tel"
                autoComplete="tel"
                required
              />
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

function socialProviderLabel(provider) {
  if (provider === "naver") return "네이버";
  if (provider === "kakao") return "카카오";
  if (provider === "google") return "Google";
  if (provider === "facebook") return "Facebook";
  return "SNS";
}
