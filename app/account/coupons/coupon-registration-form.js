"use client";

import { useState } from "react";
import { registerCouponAction } from "../../actions";
import FormSubmitButton from "../../form-submit-button";

export default function CouponRegistrationForm({ errorMessage = "", preview = false }) {
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState(Boolean(errorMessage));
  return (
    <form className={`coupon-register-form${showError ? " has-error" : ""}`} action={registerCouponAction} onSubmit={preview ? (event) => event.preventDefault() : undefined}>
      <label htmlFor="coupon-code">쿠폰 코드를 입력해 주세요</label>
      <div>
        <input id="coupon-code" name="code" type="text" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setShowError(false); }} placeholder="쿠폰코드 입력" maxLength={40} />
        <FormSubmitButton pendingText="등록 중" disabled={!code.trim()}>등록</FormSubmitButton>
      </div>
      {showError && <p className="coupon-register-error" role="alert">{errorMessage}</p>}
    </form>
  );
}
