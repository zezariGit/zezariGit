"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const EMPTY_CODE = ["", "", "", "", "", ""];

export function PasswordResetPanel({ onBack, onComplete }) {
  const [step, setStep] = useState("verification");
  const [phone, setPhone] = useState("");
  const [codeInput, setCodeInput] = useState(EMPTY_CODE);
  const [codeSeconds, setCodeSeconds] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("error");
  const codeInputRefs = useRef([]);

  const phoneDigits = phone.replace(/\D/g, "");
  const validPhone = /^01[016789]\d{7,8}$/.test(phoneDigits);
  const completeCode = codeInput.join("");
  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8,
    letter: /[A-Za-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    matched: Boolean(newPassword) && newPassword === confirmPassword,
  }), [confirmPassword, newPassword]);
  const validPassword = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    if (codeSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCodeSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSeconds]);

  const showMessage = (text, tone = "error") => {
    setMessage(text);
    setMessageTone(tone);
  };

  const updatePhone = (value) => {
    setPhone(formatPhoneInput(value));
    setCodeInput(EMPTY_CODE);
    setCodeSeconds(0);
    setCodeSent(false);
    setVerifiedPhone("");
    setPasswordResetToken("");
    setMessage("");
  };

  const requestCode = async () => {
    if (!validPhone || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/password-reset/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDigits }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        showMessage(data.message || "인증번호 발송에 실패했습니다.");
        return;
      }

      setCodeInput(EMPTY_CODE);
      setCodeSent(true);
      setCodeSeconds(data.expiresInSeconds || 180);
      showMessage("인증번호를 발송했습니다.", "success");
      window.setTimeout(() => codeInputRefs.current[0]?.focus(), 0);
    } catch {
      showMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateCode = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setCodeInput((current) => current.map((item, itemIndex) => (itemIndex === index ? "" : item)));
      return;
    }

    setCodeInput((current) => {
      const next = [...current];
      digits.slice(0, 6 - index).split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });
    const nextIndex = Math.min(index + digits.length, 5);
    window.setTimeout(() => codeInputRefs.current[nextIndex]?.focus(), 0);
  };

  const pasteCode = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    setCodeInput(EMPTY_CODE.map((_, index) => digits[index] || ""));
    window.setTimeout(() => codeInputRefs.current[Math.min(digits.length, 6) - 1]?.focus(), 0);
  };

  const verifyCode = async () => {
    if (completeCode.length !== 6 || codeSeconds <= 0 || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/password-reset/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDigits, code: completeCode }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        showMessage(data.message || "인증번호가 일치하지 않습니다.");
        return;
      }

      setVerifiedPhone(data.phone || phone);
      setPasswordResetToken(data.passwordResetToken || "");
      setCodeSeconds(0);
      setStep("password");
      showMessage("휴대폰 인증이 완료되었습니다.", "success");
    } catch {
      showMessage("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!validPassword || loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: verifiedPhone,
          passwordResetToken,
          newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        showMessage(data.message || "비밀번호 변경에 실패했습니다.");
        return;
      }

      onComplete({ loginId: data.loginId || "" });
    } catch {
      showMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel signup-card password-reset-card" aria-label="비밀번호 찾기">
      <button className="signup-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        <span className="visually-hidden">로그인으로 돌아가기</span>
      </button>

      {step === "verification" ? (
        <div className="signup-step password-reset-step">
          <h1 className="login-title">비밀번호 찾기</h1>
          <div className="signup-copy">
            <strong>휴대폰 번호를 인증해주세요</strong>
            <p>가입할 때 등록한 휴대폰 번호로 인증번호를 보내드립니다.</p>
          </div>

          <label className="signup-field">
            <span>휴대폰 번호</span>
            <input
              value={phone}
              onChange={(event) => updatePhone(event.target.value)}
              placeholder="010-1234-5678"
              inputMode="tel"
              autoComplete="tel"
              maxLength={13}
            />
          </label>
          <button className="login-submit" type="button" onClick={requestCode} disabled={!validPhone || loading}>
            {loading ? "발송 중" : "인증코드 받기"}
          </button>

          {codeSent && (
            <>
              <div className="signup-separator" />
              <div className="code-heading">
                <strong>인증번호 입력</strong>
                <span className={codeSeconds === 0 ? "expired" : ""}>{formatTimer(codeSeconds)}</span>
              </div>
              <div className="verification-code-row" onPaste={pasteCode}>
                {codeInput.map((value, index) => (
                  <input
                    ref={(element) => { codeInputRefs.current[index] = element; }}
                    key={index}
                    value={value}
                    onChange={(event) => updateCode(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !value && index > 0) {
                        codeInputRefs.current[index - 1]?.focus();
                      }
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    aria-label={`${index + 1}번째 인증번호`}
                  />
                ))}
              </div>
              <button
                className="login-submit"
                type="button"
                onClick={verifyCode}
                disabled={completeCode.length !== 6 || codeSeconds <= 0 || loading}
              >
                {loading ? "확인 중" : "확인"}
              </button>
              <button className="signup-link centered-link" type="button" onClick={requestCode} disabled={!validPhone || loading}>
                인증번호 재전송
              </button>
            </>
          )}

          {message && <p className={`login-message ${messageTone}`} role="status">{message}</p>}
        </div>
      ) : (
        <form className="signup-step password-reset-step" onSubmit={submitPassword}>
          <h1 className="login-title">비밀번호 찾기</h1>
          <div className="signup-copy">
            <strong>새 비밀번호를 입력해주세요</strong>
            <p>영문, 숫자, 특수문자를 조합해 8자 이상 입력해 주세요.</p>
          </div>

          <label className="signup-field">
            <span>새 비밀번호</span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              maxLength={64}
              placeholder="새 비밀번호"
            />
          </label>
          <ul className="password-check-list" aria-label="비밀번호 조건">
            <PasswordCheck valid={passwordChecks.length}>8자 이상</PasswordCheck>
            <PasswordCheck valid={passwordChecks.letter}>영문 포함</PasswordCheck>
            <PasswordCheck valid={passwordChecks.number}>숫자 포함</PasswordCheck>
            <PasswordCheck valid={passwordChecks.special}>특수문자 포함</PasswordCheck>
          </ul>
          <label className="signup-field">
            <span>새 비밀번호 확인</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              maxLength={64}
              placeholder="새 비밀번호를 다시 입력해 주세요"
            />
          </label>
          {confirmPassword && (
            <p className={`password-match-message ${passwordChecks.matched ? "valid" : "invalid"}`}>
              {passwordChecks.matched ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
            </p>
          )}
          <button className="login-submit" type="submit" disabled={!validPassword || loading}>
            {loading ? "변경 중" : "비밀번호 변경"}
          </button>
          {message && <p className={`login-message ${messageTone}`} role="status">{message}</p>}
        </form>
      )}
    </section>
  );
}

function PasswordCheck({ valid, children }) {
  return (
    <li className={valid ? "valid" : "pending"}>
      <span aria-hidden="true">{valid ? "✓" : "○"}</span>
      {children}
    </li>
  );
}

function formatPhoneInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, -4)}-${digits.slice(-4)}`;
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
