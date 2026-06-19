"use client";

import { useEffect, useMemo, useState } from "react";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function ShopCheckoutClient({ product, subjects = [], plans = [], subscription = null }) {
  const [quantity, setQuantity] = useState(1);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [planMonths, setPlanMonths] = useState(String(plans[0]?.months || 1));
  const [mode, setMode] = useState("subscription");
  const [designIndex, setDesignIndex] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const subscribed = subscription?.status === "active";
  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan.months) === String(planMonths)) || plans[0] || null,
    [plans, planMonths]
  );
  const productAmount = Number(product.unit_price || 0) * quantity;

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

  const changeQuantity = (next) => {
    setQuantity(Math.max(1, Math.min(99, next)));
  };

  const validateSelection = () => {
    if (!subjectId) {
      setMessage("상품을 연결할 대상자를 선택해 주세요.");
      return false;
    }
    if (mode === "standalone" && !subscribed) {
      setMessage("상품 단독 구매는 구독중인 고객만 선택할 수 있습니다.");
      return false;
    }
    return true;
  };

  const startSubscription = async () => {
    if (!validateSelection()) return;
    if (!sdkReady) {
      setMessage("결제 SDK를 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/toss/subscription/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planMonths: Number(planMonths),
          productId: product.id,
          subjectId,
          quantity,
        }),
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

  const requestStandaloneOrder = async () => {
    if (!validateSelection()) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/products/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          subjectId,
          quantity,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.message || "상품 단독 구매 요청을 저장하지 못했습니다.");
      }
      setMessage(`상품 단독 구매 요청이 저장되었습니다. 예상 금액은 ${formatCurrency(data.amount)}입니다.`);
    } catch (error) {
      setMessage(error.message || "상품 단독 구매 요청을 저장하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (mode === "standalone") {
      requestStandaloneOrder();
      return;
    }
    startSubscription();
  };

  return (
    <section className="shop-detail-layout">
      <div className="shop-phone-panel">
        <header className="shop-topbar">
          <a className="shop-back-link" href="/shop" aria-label="상품 선택으로 돌아가기">‹</a>
          <h1>{product.name}</h1>
          <span className="shop-help-mark" aria-hidden="true">?</span>
        </header>

        <div className="shop-field">
          <strong>디자인 선택</strong>
          <div className="design-grid" role="listbox" aria-label="디자인 선택">
            {[0, 1, 2, 3].map((index) => (
              <button
                className={designIndex === index ? "design-option active" : "design-option"}
                type="button"
                key={index}
                onClick={() => setDesignIndex(index)}
                aria-label={`디자인 ${index + 1}`}
              >
                <ProductVisual product={product} />
              </button>
            ))}
          </div>
        </div>

        <div className="shop-field">
          <strong>수량</strong>
          <div className="quantity-control">
            <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="수량 감소">−</button>
            <input value={quantity} onChange={(event) => changeQuantity(Number(event.target.value || 1))} inputMode="numeric" />
            <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="수량 증가">+</button>
          </div>
        </div>

        <div className="shop-field">
          <strong>대상자</strong>
          {subjects.length > 0 ? (
            <select className="subject-pick-select" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {subjects.map((subject) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name} / {formatDate(subject.birth_date)}
                </option>
              ))}
            </select>
          ) : (
            <a className="empty-shop-link" href="/?tab=subjects#subjects-info">
              대상자를 먼저 등록해 주세요
            </a>
          )}
        </div>

        <div className="purchase-mode-tabs" role="tablist" aria-label="구매 방식">
          <button className={mode === "subscription" ? "active" : ""} type="button" onClick={() => setMode("subscription")}>
            구독기간
          </button>
          <button
            className={mode === "standalone" ? "active" : ""}
            type="button"
            onClick={() => subscribed && setMode("standalone")}
            disabled={!subscribed}
            title={subscribed ? "상품 단독 구매" : "구독중인 고객만 선택 가능합니다"}
          >
            상품 단독 구매
          </button>
        </div>

        {mode === "subscription" ? (
          <div className="plan-choice-list">
            {plans.map((plan) => (
              <button
                className={String(plan.months) === String(planMonths) ? "active" : ""}
                type="button"
                key={plan.months}
                onClick={() => setPlanMonths(String(plan.months))}
              >
                <span>{planLabel(plan.months)}</span>
                <strong>{formatCurrency(plan.amount)}{plan.months === 1 ? "/월" : ""}</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="shop-summary-list">
            <span>상품 금액</span>
            <strong>{formatCurrency(product.unit_price)} / 개</strong>
            <span>상품 수량</span>
            <strong>{quantity}개</strong>
            <span>결제예정금액</span>
            <strong>{formatCurrency(productAmount)}</strong>
          </div>
        )}

        <button className="shop-next-button" type="button" onClick={submit} disabled={loading || subjects.length === 0}>
          {loading ? "처리중" : "다음"}
        </button>
        {message && <p className="shop-message" role="status">{message}</p>}
      </div>

      <aside className="shop-summary-panel" aria-label="선택 요약">
        <div className="purchase-mode-tabs compact">
          <span className={mode === "subscription" ? "active" : ""}>구독기간</span>
          <span className={mode === "standalone" ? "active" : ""}>상품 단독 구매</span>
        </div>
        <div className="shop-summary-list">
          <span>상품 금액</span>
          <strong>{formatCurrency(product.unit_price)} / 개</strong>
          <span>상품 수량</span>
          <strong>{quantity}개</strong>
          <span>선택 대상자</span>
          <strong>{subjects.find((subject) => subject.id === subjectId)?.name || "-"}</strong>
          <span>결제예정금액</span>
          <strong>{mode === "subscription" ? formatCurrency(selectedPlan?.amount || 0) : formatCurrency(productAmount)}</strong>
        </div>
        {mode === "subscription" && selectedPlan && (
          <p className="shop-note">선택한 상품은 구독 결제 요청과 함께 기록됩니다.</p>
        )}
        {!subscribed && <p className="shop-warning">상품 단독 구매는 구독중 고객에게만 표시됩니다.</p>}
      </aside>
    </section>
  );
}

function ProductVisual({ product }) {
  if (product.image_data_url) {
    return <img src={product.image_data_url} alt="" />;
  }
  return <span>{productFallbackIcon(product.slug)}</span>;
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  return "상품";
}

function planLabel(months) {
  if (Number(months) === 1) return "월간";
  if (Number(months) === 12) return "연간";
  if (Number(months) === 0) return "평생권";
  return `${months}개월`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  if (!value) return "생년월일 미입력";
  return String(value).replaceAll("-", ".");
}
