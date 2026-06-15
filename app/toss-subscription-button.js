"use client";

import { useEffect, useState } from "react";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function TossSubscriptionButton({ subscribed = false }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.TossPayments) {
      setSdkReady(true);
      return;
    }

    const existing = document.querySelector(`script[src="${TOSS_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => setSdkReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = TOSS_SDK_URL;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setMessage("결제 SDK를 불러오지 못했습니다.");
    document.head.appendChild(script);
  }, []);

  const startSubscription = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/subscription/prepare", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "구독 결제 준비에 실패했습니다.");
      }
      if (!data.configured) {
        throw new Error("Toss Payments 키 설정이 필요합니다.");
      }
      if (!window.TossPayments) {
        throw new Error("결제 SDK가 아직 준비되지 않았습니다.");
      }

      const tossPayments = window.TossPayments(data.clientKey);
      const payment = tossPayments.payment({ customerKey: data.customerKey });
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: data.successUrl,
        failUrl: data.failUrl,
      });
    } catch (error) {
      setMessage(error.message || "구독 결제를 시작하지 못했습니다.");
      setLoading(false);
    }
  };

  if (subscribed) {
    return <span className="subscription-badge active">구독중</span>;
  }

  return (
    <div className="subscription-action-wrap">
      <button
        className="subscription-button"
        type="button"
        onClick={startSubscription}
        disabled={loading || !sdkReady}
      >
        {loading ? "결제 준비중" : "구독결제하기"}
      </button>
      {message && <p className="subscription-message">{message}</p>}
    </div>
  );
}
