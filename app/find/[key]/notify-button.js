"use client";

import { useState } from "react";

export default function GuardianNotifyButton({ qrKey }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const notifyGuardian = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/find/${encodeURIComponent(qrKey)}/notify`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "보호자 알림 전송에 실패했습니다.");
      }
      setMessage(data.message || "보호자에게 알림을 보냈습니다.");
    } catch (error) {
      setMessage(error.message || "보호자에게 알림을 보내지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-notify-wrap">
      <button className="primary-button" type="button" onClick={notifyGuardian} disabled={loading}>
        {loading ? "알림 전송중" : "보호자에게 알리기"}
      </button>
      {message && <p className="find-notify-message">{message}</p>}
    </div>
  );
}
