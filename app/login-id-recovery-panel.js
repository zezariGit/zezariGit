"use client";

import { useEffect, useRef, useState } from "react";

const EMPTY_CODE = ["", "", "", "", "", ""];

export function LoginIdRecoveryPanel({ onBack, onLogin, onPasswordReset, initialLoginId = "" }) {
  const [step, setStep] = useState(initialLoginId ? "found" : "verification");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [codeInput, setCodeInput] = useState(EMPTY_CODE);
  const [codeSeconds, setCodeSeconds] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [loginId, setLoginId] = useState(initialLoginId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const codeInputRef = useRef(null);

  const phoneDigits = phone.replace(/\D/g, "");
  const validName = name.trim().length > 0 && name.trim().length <= 50;
  const validPhone = isValidMobilePhone(phoneDigits);
  const completeCode = codeInput.join("");

  useEffect(() => {
    if (codeSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeSeconds((current) => {
        if (current <= 1) {
          setMessage("인증시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSeconds]);

  const resetVerification = () => {
    setCodeInput(EMPTY_CODE);
    setCodeSeconds(0);
    setCodeSent(false);
    setMessage("");
  };

  const requestCode = async () => {
    setTouched({ name: true, phone: true });
    if (!validName || !validPhone || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login-id/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phoneDigits }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호 발송에 실패했습니다.");
        return;
      }

      setCodeInput(EMPTY_CODE);
      setCodeSent(true);
      setCodeSeconds(data.expiresInSeconds || 180);
      window.setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch {
      setMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (completeCode.length !== 6 || codeSeconds <= 0 || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login-id/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phoneDigits, code: completeCode }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const verificationMessage = data.message || "인증번호가 일치하지 않습니다.";
        setMessage(
          verificationMessage.includes("일치하지")
            ? "인증번호가 일치하지 않습니다. 다시 입력해 주세요."
            : verificationMessage.includes("다시 받아")
              ? "인증시간이 만료되었습니다. 인증번호를 다시 받아주세요."
              : verificationMessage,
        );
        return;
      }

      setLoginId(data.loginId || "");
      setCodeSeconds(0);
      setStep("found");
    } catch {
      setMessage("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "found") {
    return (
      <section className="auth-panel login-id-recovery-card" aria-label="아이디 찾기 결과">
        <RecoveryHeader onBack={onBack} />
        <div className="login-id-found-step">
          <h2>아이디를 찾았습니다.</h2>
          <p>가입하신 아이디를 확인해 주세요.</p>
          <div className="login-id-result" role="status">
            <span>아이디</span>
            <strong>{loginId}</strong>
          </div>
          <button className="login-submit" type="button" onClick={() => onLogin(loginId)}>로그인</button>
          <button className="login-id-password-link" type="button" onClick={onPasswordReset}>비밀번호 찾기</button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-panel login-id-recovery-card" aria-label="아이디 찾기">
      <RecoveryHeader onBack={onBack} />
      <div className="login-id-verification-step">
        <p className="login-id-recovery-intro">가입 시 등록한 이름과 휴대전화번호로<br />본인 인증을 진행해 주세요.</p>

        <label className={`login-id-recovery-input ${touched.name && !validName ? "invalid" : ""}`}>
          <span className="visually-hidden">이름</span>
          <input
            value={name}
            onChange={(event) => { setName(event.target.value); resetVerification(); }}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            placeholder="이름"
            autoComplete="name"
            maxLength={50}
            aria-invalid={touched.name && !validName}
          />
        </label>
        <label className={`login-id-recovery-input ${touched.phone && !validPhone ? "invalid" : ""}`}>
          <span className="visually-hidden">휴대전화번호</span>
          <input
            value={phone}
            onChange={(event) => { setPhone(formatPhoneInput(event.target.value)); resetVerification(); }}
            onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
            placeholder="휴대전화번호"
            inputMode="tel"
            autoComplete="tel"
            maxLength={13}
            aria-invalid={touched.phone && !validPhone}
          />
        </label>
        <button className="login-submit" type="button" onClick={requestCode} disabled={!validName || !validPhone || loading}>
          {loading ? "발송 중" : codeSent ? "인증번호 다시 받기" : "인증번호 받기"}
        </button>

        <label className={`login-id-recovery-code ${message ? "invalid" : ""}`}>
          <span className="visually-hidden">인증번호 6자리</span>
          <input
            ref={codeInputRef}
            value={completeCode}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
              setCodeInput(EMPTY_CODE.map((_, index) => digits[index] || ""));
              setMessage("");
            }}
            placeholder="인증번호 6자리"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={!codeSent || codeSeconds <= 0}
            aria-invalid={Boolean(message)}
          />
          {codeSent && <time className={codeSeconds === 0 ? "expired" : ""}>{formatTimer(codeSeconds)}</time>}
        </label>
        {message && <p className="login-id-recovery-error" role="alert">{message}</p>}
        <p className="login-id-recovery-help">인증번호는 6자리이며 유효시간은 3분입니다.</p>
        <button className="login-submit login-id-confirm" type="button" onClick={verifyCode} disabled={completeCode.length !== 6 || codeSeconds <= 0 || loading}>
          {loading ? "확인 중" : "확인"}
        </button>
      </div>
    </section>
  );
}

function RecoveryHeader({ onBack }) {
  return (
    <header className="login-id-recovery-header">
      <button type="button" onClick={onBack} aria-label="로그인으로 돌아가기">‹</button>
      <h1>아이디 찾기</h1>
    </header>
  );
}

function formatPhoneInput(value) {
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

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
