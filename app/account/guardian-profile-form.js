"use client";

import { useEffect, useMemo, useState } from "react";
import {
  saveGuardianProfileSettingsAction,
  verifyGuardianCurrentPasswordAction,
} from "../actions";
import FormSubmitButton from "../form-submit-button";
import PasswordVisibilityIcon from "../password-visibility-icon";

const LOGIN_ID_PATTERN = /^[A-Za-z0-9_]{4,20}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

export default function GuardianProfileForm({ guardian, provider = "credentials", preview = false, admin = false }) {
  const original = useMemo(() => ({
    name: String(guardian.name || ""),
    gender: String(guardian.gender || "남성"),
    birthDate: dateOnly(guardian.birth_date),
    phone: formatPhone(guardian.phone),
    loginId: String(guardian.login_id || ""),
  }), [guardian]);
  const originalDate = splitDate(original.birthDate);
  const [name, setName] = useState(original.name);
  const [gender, setGender] = useState(original.gender);
  const [year, setYear] = useState(originalDate.year);
  const [month, setMonth] = useState(originalDate.month);
  const [day, setDay] = useState(originalDate.day);
  const [phone, setPhone] = useState(original.phone);
  const [phoneToken, setPhoneToken] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [loginId, setLoginId] = useState(original.loginId);
  const [checkedLoginId, setCheckedLoginId] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [currentPasswordLoading, setCurrentPasswordLoading] = useState(false);
  const [currentPasswordMessage, setCurrentPasswordMessage] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState([false, false, false]);

  const socialAccount = isSocialProvider(provider);
  const birthDate = `${year}-${month}-${day}`;
  const phoneChanged = digits(phone) !== digits(original.phone);
  const phoneValid = /^01[016789]\d{7,8}$/.test(digits(phone));
  const phoneVerified = phoneChanged && (admin
    ? phoneValid
    : digits(verifiedPhone) === digits(phone) && Boolean(phoneToken));
  const loginChanged = !socialAccount && loginId.trim().toLowerCase() !== original.loginId.toLowerCase();
  const loginFormatValid = LOGIN_ID_PATTERN.test(loginId.trim());
  const loginVerified = loginChanged && checkedLoginId.toLowerCase() === loginId.trim().toLowerCase();
  const passwordStarted = Boolean(password || passwordConfirmation);
  const passwordRuleValid = PASSWORD_PATTERN.test(password);
  const passwordMatches = Boolean(passwordConfirmation) && password === passwordConfirmation;
  const passwordValid = currentPasswordVerified && passwordRuleValid && passwordMatches;
  const basicChanged = name.trim() !== original.name || gender !== original.gender || birthDate !== original.birthDate;
  const basicValid = Boolean(name.trim()) && ["남성", "여성"].includes(gender) && validDate(birthDate);
  const hasChange = basicChanged || phoneChanged || loginChanged || passwordStarted;
  const canSubmit = hasChange
    && basicValid
    && (!phoneChanged || phoneVerified)
    && (!loginChanged || loginVerified)
    && (!passwordStarted || passwordValid);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
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

  const sendCode = async () => {
    if (!phoneValid || !phoneChanged) {
      setPhoneError(true);
      setPhoneMessage(phoneChanged ? "휴대전화번호를 정확하게 입력해 주세요." : "새로운 휴대전화번호를 입력해 주세요.");
      return;
    }
    setPhoneLoading(true);
    setPhoneError(false);
    try {
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
      setPhoneMessage("인증번호를 발송했습니다.");
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
      const response = await fetch("/api/signup/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, purpose: "guardian_phone_change" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "인증번호가 일치하지 않습니다. 다시 입력해 주세요.");
      setVerifiedPhone(data.phone || phone);
      setPhoneToken(data.phoneVerificationToken || "");
      setCodeRequested(false);
      setPhoneMessage("휴대전화번호 인증이 완료되었습니다.");
    } catch (error) {
      setPhoneError(true);
      setPhoneMessage(error.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const checkLoginId = async () => {
    if (!loginFormatValid || !loginChanged) {
      setLoginError(true);
      setLoginMessage("영문, 숫자를 조합하여 4자 이상 입력해 주세요.");
      return;
    }
    setLoginLoading(true);
    setLoginError(false);
    try {
      const response = await fetch("/api/account/login-id/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.available) throw new Error(data.message || "이미 사용 중인 아이디입니다.");
      setCheckedLoginId(loginId.trim());
      setLoginMessage("사용 가능한 아이디 형식입니다.");
    } catch (error) {
      setCheckedLoginId("");
      setLoginError(true);
      setLoginMessage(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const changeLoginId = (value) => {
    setLoginId(value.replace(/[^A-Za-z0-9_]/g, "").slice(0, 20));
    setCheckedLoginId("");
    setLoginMessage("");
    setLoginError(false);
  };

  const resetPasswordVerification = ({ keepMessage = false } = {}) => {
    setCurrentPasswordVerified(false);
    setPassword("");
    setPasswordConfirmation("");
    setShowPasswords([false, false, false]);
    if (!keepMessage) {
      setCurrentPasswordMessage("");
      setCurrentPasswordError(false);
    }
  };

  const changeCurrentPassword = (value) => {
    setCurrentPassword(value);
    if (currentPasswordVerified) resetPasswordVerification();
    else {
      setCurrentPasswordMessage("");
      setCurrentPasswordError(false);
    }
  };

  const verifyCurrentPassword = async () => {
    if (!currentPassword || currentPasswordLoading) return;
    setCurrentPasswordLoading(true);
    setCurrentPasswordMessage("");
    setCurrentPasswordError(false);

    try {
      const result = preview
        ? { ok: true }
        : await verifyGuardianCurrentPasswordAction(currentPassword);
      if (!result?.ok) throw new Error(result?.message || "현재 비밀번호가 일치하지 않습니다.");
      setCurrentPasswordVerified(true);
      setCurrentPasswordMessage("현재 비밀번호가 확인되었습니다.");
    } catch (error) {
      setCurrentPassword("");
      resetPasswordVerification({ keepMessage: true });
      setCurrentPasswordError(true);
      setCurrentPasswordMessage(error.message || "현재 비밀번호가 일치하지 않습니다.");
    } finally {
      setCurrentPasswordLoading(false);
    }
  };

  return (
    <form
      className="guardian-profile-form"
      action={saveGuardianProfileSettingsAction}
      onSubmit={preview ? (event) => event.preventDefault() : undefined}
    >
      <input type="hidden" name="birthDate" value={birthDate} />
      <input type="hidden" name="profileSettings" value="1" />
      <input type="hidden" name="phoneVerificationToken" value={phoneToken} />
      <input type="hidden" name="address" value={guardian.address || ""} />
      <input type="hidden" name="addressDetail" value={guardian.address_detail || ""} />
      <input type="hidden" name="email" value={guardian.email || ""} />

      <label className="profile-field">
        <strong>이름</strong>
        <input name="guardianName" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
      </label>

      <fieldset className="profile-gender-field">
        <legend>성별</legend>
        {["남성", "여성"].map((value) => (
          <label key={value}><input type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} />{value}</label>
        ))}
      </fieldset>

      <fieldset className="profile-birth-field">
        <legend>생년월일</legend>
        <div>
          <DateSelect value={year} onChange={setYear} values={years()} suffix="년" />
          <DateSelect value={month} onChange={setMonth} values={range(1, 12)} suffix="월" />
          <DateSelect value={day} onChange={setDay} values={range(1, 31)} suffix="일" />
        </div>
      </fieldset>

      <div className={`profile-field${phoneError ? " has-error" : ""}`}>
        <strong>휴대전화번호</strong>
        <div className="profile-inline-input">
          <input name="phone" value={phone} onChange={(event) => changePhone(event.target.value)} inputMode="tel" maxLength={13} />
          {admin
            ? <span className="profile-verified-label">관리자 변경</span>
            : phoneVerified
              ? <span className="profile-verified-label">인증 완료</span>
              : <button className="profile-phone-action" type="button" onClick={sendCode} disabled={!phoneChanged || phoneLoading}>{codeRequested ? "인증번호 재전송" : "인증번호 받기"}</button>}
        </div>
        {!admin && codeRequested && !phoneVerified && (
          <div className="profile-code-row">
            <div><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="인증번호 6자리" /><span>{timer(seconds)}</span></div>
            <button type="button" onClick={verifyCode} disabled={code.length !== 6 || phoneLoading}>확인</button>
          </div>
        )}
        {admin && phoneChanged && phoneValid && <small className="success">관리자 계정은 인증번호 없이 변경할 수 있습니다.</small>}
        {phoneMessage && <small className={phoneError ? "error" : "success"}>{phoneMessage}</small>}
      </div>

      <div className={`profile-field${loginError ? " has-error" : ""}`}>
        <strong>아이디</strong>
        {socialAccount ? (
          <>
            <input name="loginId" className="profile-social-login" value={original.loginId} readOnly />
            <small className="profile-social-provider">{socialProviderLabel(provider)}</small>
          </>
        ) : (
          <>
            <div className="profile-inline-input">
              <input name="loginId" value={loginId} onChange={(event) => changeLoginId(event.target.value)} />
              <button className="profile-login-action" type="button" onClick={checkLoginId} disabled={!loginChanged || loginLoading}>{loginLoading ? "확인 중" : "중복확인"}</button>
            </div>
            {loginMessage && <small className={loginError ? "error" : "success"}>{loginMessage}</small>}
          </>
        )}
      </div>

      {guardian.password_hash && (
        <section className="profile-password-section">
          <h2>비밀번호 변경</h2>
          <div className="profile-password-fields">
            <label>
              <span>현재 비밀번호</span>
              <span className="profile-password-check-row">
                <PasswordInput
                  label="현재 비밀번호"
                  name="currentPassword"
                  value={currentPassword}
                  setValue={changeCurrentPassword}
                  shown={showPasswords[0]}
                  toggle={() => togglePassword(0, setShowPasswords)}
                  placeholder="현재 비밀번호를 입력해 주세요"
                  verified={currentPasswordVerified}
                />
                <button
                  className={currentPasswordVerified ? "is-verified" : ""}
                  type="button"
                  onClick={verifyCurrentPassword}
                  disabled={!currentPassword || currentPasswordLoading || currentPasswordVerified}
                >
                  {currentPasswordVerified ? "확인 완료" : currentPasswordLoading ? "확인 중" : "확인"}
                </button>
              </span>
            </label>
            {currentPasswordMessage && (
              <small className={`profile-password-status ${currentPasswordError ? "error" : "success"}`}>
                {currentPasswordMessage}
              </small>
            )}
            <PasswordField
              label="새 비밀번호"
              name="password"
              value={password}
              setValue={setPassword}
              shown={showPasswords[1]}
              toggle={() => togglePassword(1, setShowPasswords)}
              placeholder={currentPasswordVerified ? "새 비밀번호를 입력해 주세요" : "현재 비밀번호 확인 후 입력할 수 있습니다"}
              disabled={!currentPasswordVerified}
              verified={passwordRuleValid}
            />
            <small className={password && passwordRuleValid ? "success" : ""}>
              {password && passwordRuleValid ? "✓ " : ""}영문, 숫자, 특수문자를 모두 포함한 8자 이상
              {password && !passwordRuleValid ? " 조건을 확인해 주세요." : ""}
            </small>
            <PasswordField
              label="새 비밀번호 확인"
              name="passwordConfirmation"
              value={passwordConfirmation}
              setValue={setPasswordConfirmation}
              shown={showPasswords[2]}
              toggle={() => togglePassword(2, setShowPasswords)}
              placeholder={currentPasswordVerified ? "새 비밀번호를 다시 입력해 주세요" : "현재 비밀번호 확인 후 입력할 수 있습니다"}
              disabled={!currentPasswordVerified}
              verified={passwordMatches}
              trailing={passwordMatches ? "비밀번호 일치" : ""}
            />
            {passwordConfirmation && !passwordMatches && <small className="error">새 비밀번호가 일치하지 않습니다.</small>}
          </div>
        </section>
      )}

      <FormSubmitButton className="profile-submit-button" pendingText="수정 중" disabled={!canSubmit}>수정 완료</FormSubmitButton>
    </form>
  );
}

function DateSelect({ value, onChange, values, suffix }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => { const text = String(item).padStart(2, "0"); return <option key={item} value={text}>{item}{suffix}</option>; })}</select>;
}

function PasswordField(props) {
  return <label><span>{props.label}</span><PasswordInput {...props} /></label>;
}

function PasswordInput({ label, name, value, setValue, shown, toggle, placeholder = "", disabled = false, verified = false, trailing = "" }) {
  return (
    <span className={`profile-password-input${verified ? " is-verified" : ""}`}>
      <input
        type={shown ? "text" : "password"}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
      />
      {trailing && <span className="profile-password-match">{trailing}</span>}
      <button type="button" onClick={toggle} disabled={disabled} aria-label={`${label} ${shown ? "숨기기" : "보기"}`}>
        <PasswordVisibilityIcon visible={shown} />
      </button>
    </span>
  );
}

function togglePassword(index, setter) { setter((values) => values.map((value, current) => current === index ? !value : value)); }
function digits(value) { return String(value || "").replace(/\D/g, ""); }
function formatPhone(value) { const raw = digits(value).slice(0, 11); if (raw.length <= 3) return raw; if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`; return `${raw.slice(0, 3)}-${raw.slice(3, raw.length - 4)}-${raw.slice(-4)}`; }
function dateOnly(value) { return String(value || "").slice(0, 10) || "1990-01-01"; }
function splitDate(value) { const [year = "1990", month = "01", day = "01"] = value.split("-"); return { year, month, day }; }
function validDate(value) { const [year, month, day] = value.split("-").map(Number); return Boolean(year && month && day && day <= new Date(year, month, 0).getDate() && new Date(year, month - 1, day) <= new Date()); }
function range(start, end) { return Array.from({ length: end - start + 1 }, (_, index) => start + index); }
function years() { return range(1920, new Date().getFullYear()).reverse(); }
function timer(value) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function isSocialProvider(value) { return ["google", "naver", "kakao", "facebook"].includes(String(value || "").trim().toLowerCase()); }
function socialProviderLabel(value) {
  const labels = { google: "구글 로그인 계정", naver: "네이버 로그인 계정", kakao: "카카오 로그인 계정", facebook: "페이스북 로그인 계정" };
  return labels[String(value || "").trim().toLowerCase()] || "SNS 로그인 계정";
}
