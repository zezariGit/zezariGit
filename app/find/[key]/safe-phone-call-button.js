"use client";

import { useState } from "react";

export default function SafePhoneCallButton({ qrKey }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [safePhone, setSafePhone] = useState("");
  const [telUrl, setTelUrl] = useState("");

  const requestCall = async () => {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/find/${encodeURIComponent(qrKey)}/safe-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "안심번호 연결에 실패했습니다.");

      setSafePhone(data.safePhone || "");
      setTelUrl(data.telUrl || "");
      setMessage("임시 안심번호가 연결되었습니다. 전화 앱을 여는 중입니다.");
      if (data.telUrl) window.location.assign(data.telUrl);
    } catch (error) {
      setMessage(error?.message || "안심번호 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-safe-phone-card finder-primary-call-wrap">
      <button className="finder-primary-call" type="button" onClick={requestCall} disabled={loading}>
        <img src="/assets/finder/guardian-call.png" alt="" />
        <span>
          <strong>{loading ? "안심번호 연결 중" : "보호자에게 전화하기"}</strong>
          <small>안심번호로 연결됩니다</small>
        </span>
      </button>
      {safePhone && telUrl && (
        <a className="find-safe-phone-link" href={telUrl}>
          전화 앱이 열리지 않으면 {safePhone} 다시 누르기
        </a>
      )}
      {message && <p className="find-notify-message" role="status">{message}</p>}
    </div>
  );
}
