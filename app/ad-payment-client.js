"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateTime as formatStandardDateTime } from "../lib/date-format";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function AdPaymentClient({ ad, guardian }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const widgetRef = useRef(null);
  const widgetAmountRef = useRef(null);
  const amount = Number(ad?.amount || 0);
  const paid = Boolean(ad?.paid_at || ad?.payment_key);
  const estimate = useMemo(() => buildAdEstimate(ad), [ad]);

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

  useEffect(() => {
    if (paid) {
      setWidgetStatus("ready");
      return undefined;
    }
    if (!sdkReady || amount <= 0) {
      widgetRef.current = null;
      widgetAmountRef.current = null;
      setWidgetStatus("idle");
      return undefined;
    }

    let cancelled = false;
    const initializeWidget = async () => {
      setWidgetStatus("loading");
      setMessage("");

      try {
        const response = await fetch("/api/payments/toss/widget/config", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "결제위젯 설정을 불러오지 못했습니다.");
        if (!data.configured) throw new Error("Toss Payments 결제위젯 키 설정이 필요합니다.");
        if (!window.TossPayments) throw new Error("결제 SDK가 아직 준비되지 않았습니다.");

        clearAdTossWidgetContainers();
        const tossPayments = window.TossPayments(data.clientKey);
        const widgets = tossPayments.widgets({ customerKey: data.customerKey });
        await widgets.setAmount({ currency: "KRW", value: amount });
        widgetAmountRef.current = amount;
        if (cancelled) return;

        widgetRef.current = widgets;
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#ad-toss-payment-methods", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#ad-toss-payment-agreement", variantKey: "AGREEMENT" }),
        ]);
        if (!cancelled) setWidgetStatus("ready");
      } catch (error) {
        if (!cancelled) {
          widgetRef.current = null;
          setWidgetStatus("error");
          setMessage(error.message || "결제위젯을 준비하지 못했습니다.");
        }
      }
    };

    initializeWidget();
    return () => {
      cancelled = true;
      widgetRef.current = null;
    };
  }, [amount, paid, sdkReady]);

  async function pay() {
    if (paid) {
      setMessage("이미 결제된 광고입니다.");
      return;
    }
    if (!sdkReady || widgetStatus !== "ready" || !widgetRef.current) {
      setMessage("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/ad/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId: ad.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "광고 결제 준비에 실패했습니다.");
      if (data.alreadyPaid) {
        window.location.href = "/account/ads";
        return;
      }
      if (!data.configured) throw new Error("Toss Payments 키 설정이 필요합니다.");
      if (Number(data.amount || 0) !== amount) {
        await widgetRef.current.setAmount({ currency: "KRW", value: Number(data.amount || 0) });
        widgetAmountRef.current = Number(data.amount || 0);
      }
      await widgetRef.current.requestPayment({
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl: data.successUrl,
        failUrl: data.failUrl,
        customerEmail: data.customerEmail || guardian?.email || guardian?.google_email || "",
        customerName: data.customerName || guardian?.name || "",
      });
    } catch (error) {
      setMessage(error.message || "결제를 시작하지 못했습니다.");
      setLoading(false);
    }
  }

  return (
    <>
      <section className="ad-payment-card">
        <h2>비용 안내</h2>
        <p>선택한 기간과 범위에 따라 비용이 부과됩니다.</p>
        <dl className="ad-payment-cost-list">
          <div>
            <dt>기간 ({Number(ad.days || 0)}일)</dt>
            <dd>{formatCurrency(estimate.periodAmount)}</dd>
          </div>
          <div>
            <dt>범위 (반경 {Number(ad.region_radius_km || 0)}km)</dt>
            <dd>{formatCurrency(estimate.rangeAmount)}</dd>
          </div>
          <div className="total">
            <dt>총 광고금액</dt>
            <dd>{formatCurrency(amount)}</dd>
          </div>
        </dl>
      </section>

      <section className="ad-payment-reach">
        <span>예상노출수</span>
        <strong>{estimate.reach.toLocaleString("ko-KR")}명</strong>
        <small>조회수 노출수는 광고지역/기간/Meta 심사 상황에 따라 달라질 수 있습니다.</small>
      </section>

      <section className="ad-payment-notice">
        <h2>안내사항</h2>
        <ul>
          <li>선택한 광고 기간과 지역 내 노출을 목표로 진행되며, 광고 노출은 Meta 심사 및 운영 상황에 따라 달라질 수 있습니다.</li>
          <li>광고 결제 후에는 관리자 승인과 Meta 광고 등록 준비를 거쳐 노출됩니다.</li>
          <li>모든 광고는 보호자 및 관리대상 정보 확인 후 승인됩니다.</li>
        </ul>
      </section>

      <section className="ad-payment-method">
        <h2>결제수단</h2>
        {paid ? (
          <div className="ad-payment-paid-box">
            <strong>결제 완료</strong>
            <span>{ad.payment_method || "결제위젯"} / {formatDateTime(ad.paid_at)}</span>
          </div>
        ) : (
          <div className="ad-toss-widget-shell" aria-busy={widgetStatus === "loading"}>
            <div id="ad-toss-payment-methods" className="ad-toss-widget-container" />
            <div id="ad-toss-payment-agreement" className="ad-toss-widget-container" />
            {widgetStatus === "loading" && <p className="toss-widget-status">안전한 결제수단을 불러오고 있습니다.</p>}
            {widgetStatus === "idle" && <p className="toss-widget-status">결제 SDK를 준비 중입니다.</p>}
          </div>
        )}
      </section>

      <button
        className="ad-payment-button"
        type="button"
        onClick={pay}
        disabled={paid || loading || widgetStatus !== "ready"}
      >
        {paid ? "결제완료" : loading ? "결제 준비중" : widgetStatus !== "ready" ? "결제수단 준비중" : `${formatCurrency(amount)} 결제하기`}
      </button>

      {message && <p className="shop-message" role="status">{message}</p>}
    </>
  );
}

function buildAdEstimate(ad) {
  const amount = Math.max(0, Number(ad?.amount || 0));
  const days = Math.max(1, Number(ad?.days || 1));
  const radius = Math.max(1, Number(ad?.region_radius_km || 1));
  const periodAmount = Math.min(amount, Math.round((amount * 0.54) / 100) * 100);
  const rangeAmount = Math.max(0, amount - periodAmount);
  const reach = Math.max(1000, Math.round(days * radius * 1600 / 100) * 100);
  return { periodAmount, rangeAmount, reach };
}

function clearAdTossWidgetContainers() {
  if (typeof document === "undefined") return;
  document.getElementById("ad-toss-payment-methods")?.replaceChildren();
  document.getElementById("ad-toss-payment-agreement")?.replaceChildren();
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDateTime(value) {
  return formatStandardDateTime(value);
}
