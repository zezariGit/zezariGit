"use client";

import { useState } from "react";

export default function QrClaimSignupActions({ publicKey, signedIn = false }) {
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");

  const beginClaim = async () => {
    const response = await fetch("/api/qr-claim/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.message || "QR 연결을 시작하지 못했습니다.");
    }
  };

  const continueWithPage = async (mode) => {
    setPending(mode);
    setMessage("");
    try {
      await beginClaim();
      const destination = signedIn
        ? "/?tab=subjects&mode=new&qrClaim=1"
        : mode === "signup"
          ? "/?signup=1&qrClaim=1"
          : "/?qrClaim=1";
      window.location.assign(destination);
    } catch (error) {
      setMessage(error.message || "QR 연결을 시작하지 못했습니다.");
      setPending("");
    }
  };

  return (
    <div className="qr-claim-actions">
      <button className="primary-button qr-claim-primary" type="button" onClick={() => continueWithPage("signup")} disabled={Boolean(pending)}>
        {pending === "signup" ? "연결 준비 중" : signedIn ? "관리대상 등록하고 QR 연결" : "회원가입"}
      </button>

      {!signedIn && (
        <>
          <button className="admin-link qr-claim-login" type="button" onClick={() => continueWithPage("login")} disabled={Boolean(pending)}>
            이미 가입한 회원 휴대폰 인증 로그인
          </button>
        </>
      )}

      {message && <p className="qr-claim-error" role="alert">{message}</p>}
      <p className="qr-claim-note">이 QR은 스토어 판매용으로 선점되어 있습니다. 가입을 시작하면 2시간 동안 현재 가입자에게 임시 예약되며, 보호자 정보와 첫 관리대상을 등록할 때 정확히 연결됩니다.</p>
    </div>
  );
}
