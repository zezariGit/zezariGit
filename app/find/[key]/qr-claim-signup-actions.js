"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FacebookLogo, GoogleLogo, KakaoLogo, NaverLogo } from "../../auth-actions";

const providers = [
  { id: "google", label: "Google", className: "google-action", Logo: GoogleLogo },
  { id: "kakao", label: "카카오", className: "kakao-action", Logo: KakaoLogo },
  { id: "naver", label: "네이버", className: "naver-action", Logo: NaverLogo },
  { id: "facebook", label: "Facebook", className: "facebook-action", Logo: FacebookLogo },
];

export default function QrClaimSignupActions({ publicKey, enabledProviders = [], signedIn = false }) {
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const enabled = new Set(enabledProviders);

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

  const continueWithSocial = async (providerId) => {
    setPending(providerId);
    setMessage("");
    try {
      await beginClaim();
      await signIn(providerId, { callbackUrl: "/?tab=subjects&mode=new&qrClaim=1" });
    } catch (error) {
      setMessage(error.message || "SNS 가입을 시작하지 못했습니다.");
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
          <div className="login-divider qr-claim-divider"><span>또는 SNS로 가입</span></div>
          <div className="social-login-stack qr-claim-social-list">
            {providers.map(({ id, label, className, Logo }) => {
              const configured = enabled.has(id);
              return (
                <button
                  className={`action social-action ${className}`}
                  type="button"
                  key={id}
                  onClick={() => continueWithSocial(id)}
                  disabled={!configured || Boolean(pending)}
                >
                  <Logo />
                  <span>{pending === id ? "연결 중" : configured ? `${label}로 가입` : `${label} 설정 필요`}</span>
                </button>
              );
            })}
          </div>
          <button className="admin-link qr-claim-login" type="button" onClick={() => continueWithPage("login")} disabled={Boolean(pending)}>
            이미 가입한 회원 로그인
          </button>
        </>
      )}

      {message && <p className="qr-claim-error" role="alert">{message}</p>}
      <p className="qr-claim-note">2시간 안에 보호자 정보와 첫 관리대상을 등록하면 지금 스캔한 QR이 자동으로 연결됩니다.</p>
    </div>
  );
}
