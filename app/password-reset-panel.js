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
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const codeInputRef = useRef(null);

  const phoneDigits = phone.replace(/\D/g, "");
  const validPhone = isValidMobilePhone(phoneDigits);
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
      setCodeSeconds((current) => {
        if (current <= 1) {
          setMessage("인증시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
          setMessageTone("error");
          return 0;
        }
        return current - 1;
      });
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
    setPhoneTouched(true);
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
      setMessage("");
      window.setTimeout(() => codeInputRef.current?.focus(), 0);
    } catch {
      showMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateCode = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
    setCodeInput(EMPTY_CODE.map((_, index) => digits[index] || ""));
    if (messageTone === "error") setMessage("");
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
        const verificationMessage = data.message || "인증번호가 일치하지 않습니다.";
        showMessage(
          verificationMessage.includes("일치하지")
            ? "인증번호가 일치하지 않습니다. 다시 입력해 주세요."
            : verificationMessage.includes("다시 받아")
              ? "인증시간이 만료되었습니다. 인증번호를 다시 받아주세요."
              : verificationMessage
        );
        return;
      }

      setVerifiedPhone(data.phone || phone);
      setPasswordResetToken(data.passwordResetToken || "");
      setCodeSeconds(0);
      setStep("password");
      setMessage("");
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
          <p className="password-reset-intro">가입 시 등록한 휴대전화번호로<br />본인 인증을 진행해 주세요.</p>

          {!codeSent ? (
            <>
              <label className={`password-reset-input ${phoneTouched && !validPhone ? "invalid" : ""}`}>
                <span className="visually-hidden">휴대전화번호</span>
                <input
                  value={phone}
                  onChange={(event) => updatePhone(event.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="휴대전화번호"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={13}
                  aria-invalid={phoneTouched && !validPhone}
                />
              </label>
              {phoneTouched && phone && !validPhone && (
                <p className="password-reset-error" role="alert">휴대전화번호를 정확하게 입력해 주세요.</p>
              )}
              <button className="login-submit" type="button" onClick={requestCode} disabled={!validPhone || loading}>
                {loading ? "발송 중" : "인증번호 받기"}
              </button>
            </>
          ) : (
            <>
              <div className="password-reset-phone-row">
                <span>{maskPhoneNumber(phone)}</span>
                <button type="button" onClick={requestCode} disabled={loading}>인증번호 재전송</button>
              </div>
              <label className={`password-reset-code-field ${messageTone === "error" && message ? "invalid" : ""}`}>
                <span className="visually-hidden">인증번호 6자리</span>
                <input
                  ref={codeInputRef}
                  value={completeCode}
                  onChange={(event) => updateCode(event.target.value)}
                  placeholder="인증번호 6자리"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  aria-invalid={messageTone === "error" && Boolean(message)}
                />
                <time className={codeSeconds === 0 ? "expired" : ""}>{formatTimer(codeSeconds)}</time>
                {messageTone === "error" && message && <ErrorCircleIcon />}
              </label>
              {messageTone === "error" && message && (
                <p className="password-reset-error" role="alert">{message}</p>
              )}
              <button
                className="login-submit"
                type="button"
                onClick={verifyCode}
                disabled={completeCode.length !== 6 || codeSeconds <= 0 || loading}
              >
                {loading ? "확인 중" : "인증번호 확인"}
              </button>
            </>
          )}

          <p className="password-reset-help">인증번호는 6자리이며 유효시간은 3분입니다.</p>
          {!codeSent && message && <p className={`password-reset-error ${messageTone}`} role="status">{message}</p>}
        </div>
      ) : (
        <form className="signup-step password-reset-step" onSubmit={submitPassword}>
          <h1 className="login-title">비밀번호 찾기</h1>
          <div className="password-reset-phone-row verified">
            <span>{maskPhoneNumber(verifiedPhone)}</span>
            <strong>인증 완료</strong>
          </div>

          <label className="password-reset-password-field">
            <span>새 비밀번호</span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={64}
            />
            <button type="button" onClick={() => setShowNewPassword((current) => !current)} aria-label={showNewPassword ? "새 비밀번호 숨기기" : "새 비밀번호 표시"}>
              <PasswordEyeIcon visible={showNewPassword} />
            </button>
          </label>
          <p className="password-reset-password-help">
            영문, 숫자, 특수문자를 조합하여 8자 이상 입력해 주세요.
          </p>
          <label className="password-reset-password-field">
            <span>새 비밀번호 확인</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              maxLength={64}
            />
            <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "새 비밀번호 확인 숨기기" : "새 비밀번호 확인 표시"}>
              <PasswordEyeIcon visible={showConfirmPassword} />
            </button>
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

function maskPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 7) return value;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function PasswordEyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!visible && <path d="M3 3 21 21" />}
    </svg>
  );
}

function ErrorCircleIcon() {
  return (
    <svg className="password-reset-error-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}
