"use client";

import { useEffect, useState } from "react";
import { registerCouponAction } from "../../actions";
import FormSubmitButton from "../../form-submit-button";

export default function CouponRegistrationForm({ errorMessage = "", preview = false }) {
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState(Boolean(errorMessage));
  const [previewError, setPreviewError] = useState("");
  const displayedError = previewError || (showError ? errorMessage : "");

  useEffect(() => {
    setShowError(Boolean(errorMessage));
    setPreviewError("");
  }, [errorMessage]);

  const submitPreview = (event) => {
    if (!preview) return;
    event.preventDefault();
    setShowError(false);
    setPreviewError(
      ["ZEZARI-5000", "SAFE-10"].includes(code.trim().toUpperCase())
        ? "이미 등록된 쿠폰입니다."
        : "유효하지 않은 쿠폰 코드입니다."
    );
  };

  return (
    <form className={`coupon-register-form${displayedError ? " has-error" : ""}`} action={registerCouponAction} onSubmit={submitPreview}>
      <label htmlFor="coupon-code">쿠폰 코드를 입력해 주세요</label>
      <div>
        <input id="coupon-code" name="code" type="text" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setShowError(false); setPreviewError(""); }} placeholder="쿠폰코드 입력" maxLength={40} />
        <FormSubmitButton pendingText="등록 중" disabled={!code.trim()}>등록</FormSubmitButton>
      </div>
      {displayedError && <p className="coupon-register-error" role="alert">{displayedError}</p>}
    </form>
  );
}
