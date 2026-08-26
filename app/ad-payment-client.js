"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateTime as formatStandardDateTime } from "../lib/date-format";
import { calculateAdPrice } from "../lib/ad-pricing";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function AdPaymentClient({ ad, guardian, adminPaymentPassEnabled = false }) {
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

  async function passPayment() {
    if (!adminPaymentPassEnabled || paid) return;
    if (!window.confirm("실제 결제 없이 관리자 테스트 광고를 결제완료 처리할까요?")) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/ad/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId: ad.id, adminPass: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "광고 결제패스 처리에 실패했습니다.");
      if (!data.adminPass || !data.redirectUrl) throw new Error("결제패스 완료 주소를 확인할 수 없습니다.");
      window.location.href = data.redirectUrl;
    } catch (error) {
      setMessage(error.message || "광고 결제패스 처리에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <>
      <section className="ad-payment-card">
        <h2>비용 안내</h2>
        <p>선택한 기간과 범위에 따라 보호자 결제금액이 부과됩니다.</p>
        <dl className="ad-payment-cost-list">
          <div>
            <dt>기간 ({ad.duration_label || `${Number(ad.days || 0)}일`})</dt>
            <dd>{formatCurrency(estimate.periodAmount)}</dd>
          </div>
          <div>
            <dt>거리 ({formatDistanceLabel(ad)})</dt>
            <dd>{formatCurrency(estimate.rangeAmount)}</dd>
          </div>
          <div className="total">
            <dt>보호자 결제금액</dt>
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
          <li>결제가 완료되면 관리자 승인 대기 없이 Meta 광고 발행을 자동으로 시작합니다.</li>
          <li>Meta 권한 또는 심사 오류로 자동 발행이 실패하면 관리자 화면에서 발행을 재시도합니다.</li>
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

      <div className="payment-action-stack">
        <button
          className="ad-payment-button"
          type="button"
          onClick={pay}
          disabled={paid || loading || widgetStatus !== "ready"}
        >
          {paid ? "결제완료" : loading ? "결제 준비중" : widgetStatus !== "ready" ? "결제수단 준비중" : `${formatCurrency(amount)} 결제하기`}
        </button>
        {adminPaymentPassEnabled && !paid && (
          <button
            className="admin-payment-pass-button"
            type="button"
            onClick={passPayment}
            disabled={loading}
          >
            {loading ? "처리중" : "결제패스"}
          </button>
        )}
      </div>

      {adminPaymentPassEnabled && !paid && (
        <p className="admin-payment-pass-note">관리자 테스트 전용 · 실제 Toss 결제는 발생하지 않습니다.</p>
      )}

      {message && <p className="shop-message" role="status">{message}</p>}
    </>
  );
}

function buildAdEstimate(ad) {
  const amount = Math.max(0, Number(ad?.amount || 0));
  const days = Math.max(1, Number(ad?.days || 1));
  const radius = Math.max(1, Number(ad?.region_radius_km || 1));
  const calculated = calculateAdPrice({
    days,
    radiusKm: radius,
    settings: {
      billing_unit_days: ad?.billing_unit_days,
      daily_rate: ad?.daily_rate,
      default_radius_km: ad?.default_radius_km,
      extra_radius_unit_km: ad?.extra_radius_unit_km,
      extra_radius_price: ad?.extra_radius_price,
    },
  });
  const storedPeriodAmount = Math.max(0, Number(ad?.period_amount || 0));
  const storedRangeAmount = Math.max(0, Number(ad?.range_amount || 0));
  const hasStoredBreakdown = storedPeriodAmount + storedRangeAmount === amount;
  const periodAmount = hasStoredBreakdown ? storedPeriodAmount : calculated.periodAmount;
  const rangeAmount = hasStoredBreakdown ? storedRangeAmount : Math.max(0, amount - periodAmount);
  const reach = Math.max(1000, Math.round(days * radius * 1600 / 100) * 100);
  return {
    periodAmount,
    rangeAmount,
    reach,
    billingUnitDays: calculated.billingUnitDays,
    defaultRadiusKm: calculated.defaultRadiusKm,
  };
}

function clearAdTossWidgetContainers() {
  if (typeof document === "undefined") return;
  document.getElementById("ad-toss-payment-methods")?.replaceChildren();
  document.getElementById("ad-toss-payment-agreement")?.replaceChildren();
}

function formatDistanceLabel(ad) {
  if (ad?.coverage_type === "country") return ad?.distance_label || "전국 확산";
  if (ad?.distance_label) return `${ad.distance_label} / ${Number(ad.region_radius_km || 0)}km`;
  return `반경 ${Number(ad?.region_radius_km || 0)}km`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDateTime(value) {
  return formatStandardDateTime(value);
}
