"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { saveGuardianProfileSettingsAction } from "../actions";
import BackButton from "../back-button";
import FormSubmitButton from "../form-submit-button";
import { AccountTopbar } from "./account-ui";

export default function GuardianProfileForm({ guardian, preview = false, previewState = "" }) {
  const original = useMemo(() => ({
    name: String(guardian.name || ""),
    gender: normalizeGender(guardian.gender),
    birthDate: dateOnly(guardian.birth_date),
    phone: formatPhone(guardian.phone),
    loginId: String(guardian.login_id || ""),
  }), [guardian]);
  const completedPreview = preview && previewState === "completed";
  const initialDate = completedPreview ? splitDate("1991-05-12") : splitDate(original.birthDate);
  const initialPhone = completedPreview || previewState === "phone-change" ? "010-9999-1234" : original.phone;
  const codeInputs = useRef([]);
  const [name, setName] = useState(completedPreview ? "홍길순" : original.name);
  const [gender, setGender] = useState(completedPreview ? "여성" : original.gender);
  const [year, setYear] = useState(initialDate.year);
  const [month, setMonth] = useState(initialDate.month);
  const [day, setDay] = useState(initialDate.day);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneChangeMode, setPhoneChangeMode] = useState(previewState === "phone-change");
  const [phoneToken, setPhoneToken] = useState(completedPreview ? "preview-phone-token" : "");
  const [verifiedPhone, setVerifiedPhone] = useState(completedPreview ? initialPhone : "");
  const [codeRequested, setCodeRequested] = useState(previewState === "phone-change");
  const [code, setCode] = useState(previewState === "phone-change" ? "184" : "");
  const [seconds, setSeconds] = useState(previewState === "phone-change" ? 180 : 0);
  const [phoneMessage, setPhoneMessage] = useState(completedPreview ? "새 휴대전화번호 인증이 완료되었습니다." : "");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const birthDate = `${year}-${month}-${day}`;
  const phoneChanged = digits(phone) !== digits(original.phone);
  const phoneValid = /^01[016789]\d{7,8}$/.test(digits(phone));
  const phoneVerified = phoneChanged
    && digits(verifiedPhone) === digits(phone)
    && Boolean(phoneToken);
  const basicChanged = name.trim() !== original.name || gender !== original.gender || birthDate !== original.birthDate;
  const basicValid = Boolean(name.trim()) && ["남성", "여성"].includes(gender) && validDate(birthDate);
  const hasChange = basicChanged || phoneChanged;
  const canSubmit = hasChange && basicValid && (!phoneChanged || phoneVerified);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timerId = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [seconds]);

  const changePhone = (value) => {
    setPhone(formatPhone(value));
    setPhoneToken("");
    setVerifiedPhone("");
    setCodeRequested(false);
    setCode("");
    setSeconds(0);
    setPhoneMessage("");
    setPhoneError(false);
  };

  const beginPhoneChange = () => {
    setPhoneChangeMode(true);
    setPhoneError(false);
    setPhoneMessage("");
  };

  const cancelPhoneChange = () => {
    setPhone(original.phone);
    setPhoneToken("");
    setVerifiedPhone("");
    setCodeRequested(false);
    setCode("");
    setSeconds(0);
    setPhoneMessage("");
    setPhoneError(false);
    setPhoneChangeMode(false);
  };

  const sendCode = async () => {
    if (!phoneValid || !phoneChanged) {
      setPhoneError(true);
      setPhoneMessage(phoneChanged ? "휴대전화번호를 정확하게 입력해 주세요." : "새로운 휴대전화번호를 입력해 주세요.");
      return;
    }
    setPhoneLoading(true);
    setPhoneError(false);
    try {
      if (preview) {
        setCodeRequested(true);
        setCode("");
        setSeconds(180);
        setPhoneMessage("");
        window.setTimeout(() => codeInputs.current[0]?.focus(), 0);
        return;
      }
      const response = await fetch("/api/signup/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "guardian_phone_change" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "인증번호 발송에 실패했습니다.");
      setCodeRequested(true);
      setCode("");
      setSeconds(data.expiresInSeconds || 180);
      setPhoneMessage("");
      window.setTimeout(() => codeInputs.current[0]?.focus(), 0);
    } catch (error) {
      setPhoneError(true);
      setPhoneMessage(error.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyCode = async () => {
    if (seconds <= 0) {
      setPhoneError(true);
      setPhoneMessage("인증시간이 만료되었습니다. 인증번호를 다시 받아주세요.");
      return;
    }
    if (!/^\d{6}$/.test(code)) return;
    setPhoneLoading(true);
    setPhoneError(false);
    try {
      const data = preview
        ? { phone, phoneVerificationToken: "preview-phone-token" }
        : await verifyPhoneCode(phone, code);
      setVerifiedPhone(data.phone || phone);
      setPhoneToken(data.phoneVerificationToken || "");
      setCodeRequested(false);
      setPhoneMessage("새 휴대전화번호 인증이 완료되었습니다.");
      setPhoneChangeMode(false);
    } catch (error) {
      setPhoneError(true);
      setPhoneMessage(error.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const updateCode = (index, value) => {
    const entered = String(value || "").replace(/\D/g, "");
    if (entered.length > 1) {
      const nextCode = entered.slice(0, 6);
      setCode(nextCode);
      codeInputs.current[Math.min(nextCode.length, 6) - 1]?.focus();
      return;
    }
    const values = Array.from({ length: 6 }, (_, current) => current === index ? entered : (code[current] || ""));
    setCode(values.join(""));
    if (entered && index < 5) codeInputs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) codeInputs.current[index - 1]?.focus();
  };

  if (phoneChangeMode) {
    return (
      <section className="guardian-phone-change">
        <header className="profile-phone-change-header">
          <BackButton onClick={cancelPhoneChange} label="휴대전화번호 변경 취소" />
          <span aria-hidden="true" />
          <button type="button" onClick={cancelPhoneChange}>변경 취소</button>
        </header>

        <div className={`profile-phone-change-content${phoneError ? " has-error" : ""}`}>
          <label>
            <strong>새 휴대전화번호</strong>
            <span className="profile-phone-change-row">
              <input value={phone} onChange={(event) => changePhone(event.target.value)} inputMode="tel" maxLength={13} autoFocus={!codeRequested} />
              <button type="button" onClick={sendCode} disabled={!phoneChanged || !phoneValid || phoneLoading}>
                {phoneLoading ? "발송 중" : "인증번호 받기"}
              </button>
            </span>
          </label>

          {codeRequested && (
            <div className="profile-verification-code">
              <div className="profile-verification-label">
                <strong>인증번호</strong>
                <span>{timer(seconds)}</span>
              </div>
              <div className="profile-verification-row">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => { codeInputs.current[index] = element; }}
                    value={code[index] || ""}
                    onChange={(event) => updateCode(index, event.target.value)}
                    onKeyDown={(event) => handleCodeKeyDown(index, event)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`인증번호 ${index + 1}번째 자리`}
                  />
                ))}
                <button type="button" onClick={verifyCode} disabled={code.length !== 6 || phoneLoading}>확인</button>
              </div>
              <button className="profile-code-resend" type="button" onClick={sendCode} disabled={phoneLoading}>
                인증번호가 오지 않았나요? 재전송
              </button>
            </div>
          )}
          {phoneMessage && <small className={phoneError ? "error" : "success"}>{phoneMessage}</small>}
        </div>
      </section>
    );
  }

  return (
    <>
      <AccountTopbar title="보호자 정보" />
      <form
        className={`guardian-profile-form${completedPreview ? " is-complete-preview" : ""}`}
        action={saveGuardianProfileSettingsAction}
        onSubmit={preview ? (event) => event.preventDefault() : undefined}
      >
        <input type="hidden" name="birthDate" value={birthDate} />
        <input type="hidden" name="profileSettings" value="1" />
        <input type="hidden" name="phoneVerificationToken" value={phoneToken} />
        <input type="hidden" name="loginId" value={original.loginId} />
        <input type="hidden" name="address" value={guardian.address || ""} />
        <input type="hidden" name="addressDetail" value={guardian.address_detail || ""} />
        <input type="hidden" name="email" value={guardian.email || ""} />

        <label className="profile-field">
          <strong>이름</strong>
          <input name="guardianName" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
        </label>

        <fieldset className="profile-gender-field">
          <legend>성별</legend>
          <div>
            {["남성", "여성"].map((value) => (
              <label key={value}>
                <input type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="profile-birth-field">
          <legend>생년월일</legend>
          <div>
            <DateSelect value={year} onChange={setYear} values={years()} suffix="년" />
            <DateSelect value={month} onChange={setMonth} values={range(1, 12)} suffix="월" />
            <DateSelect value={day} onChange={setDay} values={range(1, 31)} suffix="일" />
          </div>
        </fieldset>

        <div className={`profile-field profile-phone-field${phoneError ? " has-error" : ""}`}>
          <strong>휴대전화번호</strong>
          <div className="profile-phone-row">
            <input name="phone" value={phone} readOnly aria-label="인증된 휴대전화번호" />
            <button type="button" onClick={beginPhoneChange}>번호 변경</button>
          </div>
          <small className={phoneError ? "error" : "success"}>
            {!phoneError && <span className="profile-status-dot" aria-hidden="true" />}
            {phoneMessage || "현재 인증된 휴대전화번호입니다."}
          </small>
        </div>

        <FormSubmitButton className="profile-submit-button" pendingText="수정 중" disabled={!canSubmit}>수정 완료</FormSubmitButton>
      </form>
    </>
  );
}

async function verifyPhoneCode(phone, code) {
  const response = await fetch("/api/signup/phone/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, purpose: "guardian_phone_change" }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.message || "인증번호가 일치하지 않습니다. 다시 입력해 주세요.");
  return data;
}

function DateSelect({ value, onChange, values, suffix }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => { const text = String(item).padStart(2, "0"); return <option key={item} value={text}>{item}{suffix}</option>; })}</select>;
}

function digits(value) { return String(value || "").replace(/\D/g, ""); }
function formatPhone(value) { const raw = digits(value).slice(0, 11); if (raw.length <= 3) return raw; if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`; return `${raw.slice(0, 3)}-${raw.slice(3, raw.length - 4)}-${raw.slice(-4)}`; }
function normalizeGender(value) { return String(value || "").trim() === "여" ? "여성" : String(value || "").trim() === "남" ? "남성" : String(value || "남성"); }
function dateOnly(value) { return String(value || "").slice(0, 10) || "1990-01-01"; }
function splitDate(value) { const [year = "1990", month = "01", day = "01"] = value.split("-"); return { year, month, day }; }
function validDate(value) { const [year, month, day] = value.split("-").map(Number); return Boolean(year && month && day && day <= new Date(year, month, 0).getDate() && new Date(year, month - 1, day) <= new Date()); }
function range(start, end) { return Array.from({ length: end - start + 1 }, (_, index) => start + index); }
function years() { return range(1920, new Date().getFullYear()).reverse(); }
function timer(value) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
