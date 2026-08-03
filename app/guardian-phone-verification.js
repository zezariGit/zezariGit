"use client";

import { useEffect, useState } from "react";

const EMPTY_CODE = ["", "", "", "", "", ""];

export default function GuardianPhoneVerification({ currentPhone = "" }) {
  const [phone, setPhone] = useState(currentPhone);
  const [codeInput, setCodeInput] = useState(EMPTY_CODE);
  const [token, setToken] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const phoneChanged = phoneDigits(phone) !== phoneDigits(currentPhone);
  const verified = phoneChanged && phoneDigits(verifiedPhone) === phoneDigits(phone) && Boolean(token);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const updatePhone = (value) => {
    setPhone(value);
    setToken("");
    setVerifiedPhone("");
    setCodeRequested(false);
    setCodeInput(EMPTY_CODE);
    setSeconds(0);
    setMessage("");
  };

  const requestCode = async () => {
    const normalized = phoneDigits(phone);
    if (!/^01[016789]\d{7,8}$/.test(normalized)) {
      setMessage("휴대폰 번호를 정확히 입력해 주세요.");
      return;
    }
    if (!phoneChanged) {
      setMessage("현재 인증된 번호와 같습니다.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/signup/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "guardian_phone_change" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호 발송에 실패했습니다.");
        return;
      }

      setCodeRequested(true);
      setCodeInput(EMPTY_CODE);
      setToken("");
      setVerifiedPhone("");
      setSeconds(data.expiresInSeconds || 180);
      setMessage("문자로 받은 6자리 인증번호를 입력해 주세요.");
    } catch {
      setMessage("인증번호 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateCode = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCodeInput((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit) document.getElementById(`guardian-phone-code-${index + 1}`)?.focus();
  };

  const verifyCode = async () => {
    const code = codeInput.join("");
    if (seconds <= 0) {
      setMessage("인증번호를 다시 받아 주세요.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setMessage("6자리 인증번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/signup/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, purpose: "guardian_phone_change" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setMessage(data.message || "인증번호가 일치하지 않습니다.");
        return;
      }

      setVerifiedPhone(data.phone || phone);
      setToken(data.phoneVerificationToken || "");
      setMessage("휴대폰 인증이 완료되었습니다. 보호자 정보를 저장해 주세요.");
    } catch {
      setMessage("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guardian-phone-verification full-field">
      <input type="hidden" name="phoneVerificationToken" value={token} />
      <label>
        연락받을 전화번호
        <span className="guardian-phone-input-row">
          <input
            name="phone"
            value={phone}
            onChange={(event) => updatePhone(event.target.value)}
            placeholder="010 - 1234 - 5678"
            inputMode="tel"
            autoComplete="tel"
            required
          />
          <button type="button" className="outline-action" onClick={requestCode} disabled={loading || !phoneChanged || verified}>
            {verified ? "인증완료" : loading ? "처리중" : "인증번호 받기"}
          </button>
        </span>
      </label>

      {codeRequested && !verified && (
        <div className="guardian-phone-code-panel">
          <div className="code-heading">
            <strong>인증번호 입력</strong>
            <span>{formatTimer(seconds)}</span>
          </div>
          <div className="verification-code-row">
            {codeInput.map((value, index) => (
              <input
                id={`guardian-phone-code-${index}`}
                key={index}
                value={value}
                onChange={(event) => updateCode(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !value && index > 0) {
                    document.getElementById(`guardian-phone-code-${index - 1}`)?.focus();
                  }
                }}
                inputMode="numeric"
                maxLength={1}
                aria-label={`${index + 1}번째 인증번호`}
              />
            ))}
          </div>
          <button type="button" className="action" onClick={verifyCode} disabled={loading}>
            {loading ? "확인 중" : "인증 확인"}
          </button>
        </div>
      )}

      {!phoneChanged && currentPhone && <small className="field-helper">현재 인증된 보호자 연락처입니다.</small>}
      {message && <p className={verified ? "phone-verification-message success" : "phone-verification-message"} role="status">{message}</p>}
    </div>
  );
}

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
