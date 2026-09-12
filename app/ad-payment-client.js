"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateTime as formatStandardDateTime } from "../lib/date-format";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";
const CANCEL_CODES = new Set(["USER_CANCEL", "PAY_PROCESS_CANCELED", "PAY_PROCESS_ABORTED"]);

export default function AdPaymentClient({
  ad,
  guardian,
  adminPaymentPassEnabled = false,
  preview = false,
  initialPaymentError = "",
}) {
  const [sdkReady, setSdkReady] = useState(preview);
  const [widgetStatus, setWidgetStatus] = useState(preview ? "ready" : "idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [paymentError, setPaymentError] = useState(initialPaymentError);
  const [previewPaymentMethod, setPreviewPaymentMethod] = useState("CARD");
  const [previewTossAgreed, setPreviewTossAgreed] = useState(false);
  const widgetRef = useRef(null);
  const amount = Number(ad?.amount || 0);
  const paid = Boolean(ad?.paid_at || ad?.payment_key);
  const estimate = useMemo(() => buildAdEstimate(ad), [ad]);
  const posterSrc = ad?.creative_image_url
    || (ad?.id && ad.id !== "preview-ad" ? `/api/ads/${encodeURIComponent(ad.id)}/creative` : "")
    || "/assets/missing-ad-template.png";
  const consentStorageKey = `ad-payment-consent:${ad?.id || "unknown"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAgreed(window.sessionStorage.getItem(consentStorageKey) === "1");
    if (initialPaymentError) {
      const url = new URL(window.location.href);
      url.searchParams.delete("paymentError");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [consentStorageKey, initialPaymentError]);

  useEffect(() => {
    if (preview || typeof window === "undefined") return;
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
    script.onerror = () => setPaymentError("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    document.head.appendChild(script);
  }, [preview]);

  useEffect(() => {
    if (preview) return undefined;
    if (paid) {
      setWidgetStatus("ready");
      return undefined;
    }
    if (!sdkReady || amount <= 0) {
      widgetRef.current = null;
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
        if (!response.ok) throw new Error(data?.message || "결제수단을 불러오지 못했습니다.");
        if (!data.configured) throw new Error("Toss Payments 결제 설정이 필요합니다.");
        if (!window.TossPayments) throw new Error("결제 모듈이 아직 준비되지 않았습니다.");

        clearAdTossWidgetContainers();
        const tossPayments = window.TossPayments(data.clientKey);
        const widgets = tossPayments.widgets({ customerKey: data.customerKey });
        await widgets.setAmount({ currency: "KRW", value: amount });
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
          setPaymentError(error.message || "결제수단을 준비하지 못했습니다.");
        }
      }
    };

    initializeWidget();
    return () => {
      cancelled = true;
      widgetRef.current = null;
    };
  }, [amount, paid, preview, sdkReady]);

  useEffect(() => {
    if (!posterOpen && !paymentError) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setPosterOpen(false);
      setPaymentError("");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paymentError, posterOpen]);

  function toggleAgreement(event) {
    const next = event.target.checked;
    setAgreed(next);
    setMessage("");
    window.sessionStorage.setItem(consentStorageKey, next ? "1" : "0");
  }

  async function pay() {
    if (!agreed) {
      setMessage("결제 동의 항목을 확인해 주세요.");
      return;
    }
    if (preview && !previewTossAgreed) {
      setMessage("Toss 결제 서비스 이용 약관에 동의해 주세요.");
      return;
    }
    if (preview) {
      window.location.href = "/payments/toss/ad/success?preview=user";
      return;
    }
    if (paid) {
      setMessage("이미 결제된 광고입니다.");
      return;
    }
    if (!sdkReady || widgetStatus !== "ready" || !widgetRef.current) {
      setPaymentError("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/ad/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!isTossCancellation(error)) {
        setPaymentError(error.message || "결제를 시작하지 못했습니다.");
      }
      setLoading(false);
    }
  }

  async function passPayment() {
    if (!adminPaymentPassEnabled || paid) return;
    if (preview) {
      window.location.href = "/payments/toss/ad/success?preview=admin";
      return;
    }
    if (!window.confirm("실제 결제 없이 관리자 테스트 광고를 결제완료 처리할까요?")) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/ad/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id, adminPass: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "광고 결제패스 처리에 실패했습니다.");
      if (!data.adminPass || !data.redirectUrl) throw new Error("결제패스 완료 주소를 확인할 수 없습니다.");
      window.location.href = data.redirectUrl;
    } catch (error) {
      setPaymentError(error.message || "광고 결제패스 처리에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <>
      <section className="ad-payment-card ad-payment-summary-card">
        <h2>광고 설정 및 금액</h2>
        <dl className="ad-payment-cost-list">
          <div><dt>대상자</dt><dd>{ad.subject_name || "-"}</dd></div>
          <div><dt>광고 기준 지역</dt><dd>{ad.region || "전국"}</dd></div>
          <div><dt>광고 거리</dt><dd>{formatDistanceLabel(ad)}</dd></div>
          <div><dt>광고 기간</dt><dd>{ad.duration_label || `${Number(ad.days || 0)}일`}</dd></div>
          <div className="total">
            <dt>최종 결제금액</dt>
            <dd><strong>{formatCurrency(amount)}</strong><small>부가세 포함</small></dd>
          </div>
        </dl>
      </section>

      <section className="ad-payment-reach">
        <span>예상 도달 수</span>
        <strong>약 {estimate.reachLow.toLocaleString("ko-KR")}-{estimate.reachHigh.toLocaleString("ko-KR")}명</strong>
        <small>예상 도달 수는 참고값이며 실제 도달 수는 META 광고 운영 상황에 따라 달라질 수 있습니다.</small>
      </section>

      <section className="ad-payment-poster-section">
        <h2>광고 미리보기</h2>
        <div className="ad-payment-poster-row">
          <img src={posterSrc} alt={`${ad.subject_name || "대상자"} 실종광고 포스터`} />
          <button type="button" onClick={() => setPosterOpen(true)} aria-label="광고 포스터 크게 보기" title="광고 포스터 크게 보기">
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <section className="ad-payment-notice">
        <h2>안내사항</h2>
        <ul>
          <li>예상 도달 수는 광고 지역과 META 광고 환경에 따라 달라질 수 있습니다.</li>
          <li>결제 후 META의 광고 검토가 완료되어야 광고 게재가 시작됩니다.</li>
          <li>META 검토 절차에 따라 광고 게재가 제한되거나 지연될 수 있습니다.</li>
          <li>광고가 시작된 이후 이미 진행된 광고 비용은 환불되지 않습니다.</li>
          <li>광고 노출 정도에 따라 광고가 조기 마감될 수 있습니다.</li>
        </ul>
      </section>

      <section className="ad-payment-method">
        <h2>결제수단</h2>
        {paid ? (
          <div className="ad-payment-paid-box">
            <strong>결제 완료</strong>
            <span>{ad.payment_method || "Toss Payments"} / {formatDateTime(ad.paid_at)}</span>
          </div>
        ) : preview ? (
          <div className="payment-method-preview ad-toss-payment-preview" aria-label="Toss 결제수단 미리보기">
            <strong>결제 방법</strong>
            <div className="payment-method-preview-options" role="radiogroup" aria-label="결제 방법">
              <button className={previewPaymentMethod === "CARD" ? "selected" : ""} type="button" role="radio" aria-checked={previewPaymentMethod === "CARD"} onClick={() => setPreviewPaymentMethod("CARD")}>
                신용·<br />체크카드
              </button>
              <button className={previewPaymentMethod === "NAVERPAY" ? "selected" : ""} type="button" role="radio" aria-checked={previewPaymentMethod === "NAVERPAY"} onClick={() => setPreviewPaymentMethod("NAVERPAY")}>
                <span>적립 혜택</span>
                <b><i>N</i> pay</b>
              </button>
            </div>
            {previewPaymentMethod === "CARD" && (
              <div className="payment-card-preview">
                <label htmlFor="ad-preview-card-company">카드사</label>
                <select id="ad-preview-card-company" defaultValue="">
                  <option value="" disabled>카드사 선택</option>
                  <option value="samsung">삼성카드</option>
                  <option value="shinhan">신한카드</option>
                  <option value="hyundai">현대카드</option>
                </select>
              </div>
            )}
            <p><strong>삼성 앱카드</strong> · 6만원 이상 결제 시 1,000원 즉시할인</p>
            <a href="#ad-payment-benefits">신용카드 무이자 할부 안내 <span aria-hidden="true">›</span></a>
            <small id="ad-payment-benefits">* 혜택은 조기 종료될 수 있어요. 결제 전 금액을 꼭 확인해주세요.</small>
            <label className="payment-agreement-preview">
              <input type="checkbox" checked={previewTossAgreed} onChange={(event) => { setPreviewTossAgreed(event.target.checked); setMessage(""); }} />
              <span>[필수] 결제 서비스 이용 약관, 개인정보 처리 동의</span>
              <b aria-hidden="true">›</b>
            </label>
          </div>
        ) : (
          <div className="ad-toss-widget-shell" aria-busy={widgetStatus === "loading"}>
            <div id="ad-toss-payment-methods" className="ad-toss-widget-container" />
            <div id="ad-toss-payment-agreement" className="ad-toss-widget-container" />
            {widgetStatus === "loading" && <p className="toss-widget-status">안전한 결제수단을 불러오고 있습니다.</p>}
            {widgetStatus === "idle" && <p className="toss-widget-status">결제 모듈을 준비 중입니다.</p>}
          </div>
        )}
      </section>

      {!paid && (
        <label className={`ad-payment-consent${message ? " invalid" : ""}`}>
          <input type="checkbox" checked={agreed} onChange={toggleAgreement} />
          <span aria-hidden="true">✓</span>
          <strong>광고 설정, 결제금액 및 안내사항을 모두 확인했으며 결제에 동의합니다.</strong>
        </label>
      )}
      {message && <p className="ad-payment-validation" role="status">{message}</p>}

      <div className="payment-action-stack">
        <button className="ad-payment-button" type="button" onClick={pay} disabled={paid || loading || !agreed || (preview && !previewTossAgreed) || widgetStatus !== "ready"}>
          {paid ? "결제완료" : loading ? "결제 진행 중" : `${formatCurrency(amount)} 결제하기`}
        </button>
        {adminPaymentPassEnabled && !paid && (
          <button className="admin-payment-pass-button" type="button" onClick={passPayment} disabled={loading}>
            {loading ? "처리 중" : "관리자 결제패스"}
          </button>
        )}
      </div>

      {adminPaymentPassEnabled && !paid && (
        <p className="admin-payment-pass-note">관리자 테스트 전용 · 실제 Toss 결제는 발생하지 않습니다.</p>
      )}

      {posterOpen && (
        <div className="ad-payment-dialog-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && setPosterOpen(false)}>
          <section className="ad-payment-poster-dialog" role="dialog" aria-modal="true" aria-labelledby="ad-payment-poster-title">
            <header><h2 id="ad-payment-poster-title">광고 미리보기</h2><button type="button" onClick={() => setPosterOpen(false)} aria-label="닫기">×</button></header>
            <img src={posterSrc} alt={`${ad.subject_name || "대상자"} 실종광고 전체 포스터`} />
          </section>
        </div>
      )}

      {paymentError && (
        <div className="ad-payment-dialog-backdrop" role="presentation">
          <section className="ad-payment-error-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ad-payment-error-title">
            <div aria-hidden="true">!</div>
            <h2 id="ad-payment-error-title">결제를 완료하지 못했습니다</h2>
            <p>{paymentError}</p>
            <button type="button" onClick={() => setPaymentError("")}>확인</button>
          </section>
        </div>
      )}
    </>
  );
}

function buildAdEstimate(ad) {
  const days = Math.max(1, Number(ad?.days || 1));
  const radius = ad?.coverage_type === "country" ? 80 : Math.max(1, Number(ad?.region_radius_km || 1));
  const reachLow = Math.max(1000, Math.round((days * radius * 43) / 100) * 100);
  return { reachLow, reachHigh: reachLow * 2 };
}

function isTossCancellation(error) {
  return CANCEL_CODES.has(String(error?.code || "").toUpperCase());
}

function clearAdTossWidgetContainers() {
  if (typeof document === "undefined") return;
  document.getElementById("ad-toss-payment-methods")?.replaceChildren();
  document.getElementById("ad-toss-payment-agreement")?.replaceChildren();
}

function formatDistanceLabel(ad) {
  if (ad?.coverage_type === "country") return "전국";
  if (ad?.distance_label) return ad.distance_label;
  return `${Number(ad?.region_radius_km || 0)}km · 인근 지역`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDateTime(value) {
  return formatStandardDateTime(value);
}
