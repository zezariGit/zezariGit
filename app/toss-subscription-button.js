"use client";

import { useEffect, useState } from "react";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function TossSubscriptionButton({ subscription = null, plans = [] }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [message, setMessage] = useState("");
  const [planMonths, setPlanMonths] = useState(String(plans[0]?.months || subscription?.plan_months || 1));
  const status = subscription?.status || "none";
  const subscribed = status === "active";
  const paused = status === "paused";
  const availablePlans = plans.length > 0 ? plans : [{ months: 1, name: "1개월 구독", amount: 9900 }];

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planMonths: Number(planMonths) }),
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

  const updateSubscriptionStatus = async (action) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscription/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "구독 상태 변경에 실패했습니다.");
      }
      window.location.reload();
    } catch (error) {
      setMessage(error.message || "구독 상태를 변경하지 못했습니다.");
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="subscription-action-wrap">
        <span className="subscription-badge active">구독중</span>
        <button
          className="subscription-button secondary"
          type="button"
          disabled={loading}
          onClick={() => updateSubscriptionStatus("pause")}
        >
          일시정지
        </button>
        {message && <p className="subscription-message">{message}</p>}
      </div>
    );
  }

  if (paused) {
    return (
      <div className="subscription-action-wrap">
        <span className="subscription-badge paused">일시정지중</span>
        <button
          className="subscription-button"
          type="button"
          disabled={loading}
          onClick={() => updateSubscriptionStatus("resume")}
        >
          재개
        </button>
        {message && <p className="subscription-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className="subscription-action-wrap">
      <select
        className="subscription-plan-select"
        value={planMonths}
        onChange={(event) => setPlanMonths(event.target.value)}
        aria-label="구독 기간 선택"
      >
        {availablePlans.map((plan) => (
          <option value={plan.months} key={plan.months}>
            {plan.months}개월 {formatCurrency(plan.amount)}
          </option>
        ))}
      </select>
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

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
