"use client";

import { useState } from "react";

export default function SubscriptionControls({ status = "none", accessType = "periodic" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateStatus = async (action) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscription/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "서비스 상태를 변경하지 못했습니다.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message || "서비스 상태를 변경하지 못했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="subscription-action-wrap">
      {status === "active" && accessType !== "product_lifetime" && (
        <button className="subscription-button secondary" type="button" disabled={loading} onClick={() => updateStatus("pause")}>
          {loading ? "처리중" : "일시정지"}
        </button>
      )}
      {status === "paused" && (
        <button className="subscription-button" type="button" disabled={loading} onClick={() => updateStatus("resume")}>
          {loading ? "처리중" : "서비스 재개"}
        </button>
      )}
      {["none", "expired", "failed"].includes(status) && (
        <a className="subscription-button" href="/shop">상품 구매</a>
      )}
      {status === "active" && accessType === "product_lifetime" && <span className="subscription-badge">계속 이용</span>}
      {status === "ready" && <span className="subscription-badge paused">QR 활성화 대기</span>}
      {message && <p className="subscription-message" role="status">{message}</p>}
    </div>
  );
}
