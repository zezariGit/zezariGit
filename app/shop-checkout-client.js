"use client";

import { useEffect, useMemo, useState } from "react";
import KakaoPostcodeAddress from "./kakao-postcode-address";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function ShopCheckoutClient({ product, subjects = [], plans = [], subscription = null, guardian = null }) {
  const [step, setStep] = useState("configure");
  const [quantity, setQuantity] = useState(1);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [planMonths, setPlanMonths] = useState(String(plans[0]?.months || 1));
  const [mode, setMode] = useState("subscription");
  const [designIndex, setDesignIndex] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(guardian?.address || "");
  const [shippingAddressDetail, setShippingAddressDetail] = useState(guardian?.address_detail || "");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const subscribed = subscription?.status === "active";
  const selectedSubject = subjects.find((subject) => subject.id === subjectId) || null;
  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan.months) === String(planMonths)) || plans[0] || null,
    [plans, planMonths]
  );
  const productAmount = Number(product.unit_price || 0) * quantity;
  const paymentAmount = mode === "subscription" ? Number(selectedPlan?.amount || 0) : productAmount;

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
    setQuantity(Math.max(1, Math.min(99, Number(next) || 1)));
  };

  const chooseMode = (nextMode) => {
    if (nextMode === "standalone" && !subscribed) {
      setMessage("상품 단독 구매는 구독중인 고객만 선택할 수 있습니다.");
      return;
    }
    setMode(nextMode);
    setMessage("");
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
    if (step === "order" && !shippingAddress.trim()) {
      setMessage("배송지를 입력해 주세요.");
      return false;
    }
    return true;
  };

  const goPreview = () => {
    if (!validateSelection()) return;
    setMessage("");
    setStep("preview");
  };

  const goOrder = () => {
    setMessage("");
    setStep("order");
  };

  const startSubscription = async () => {
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
        designIndex,
        shippingAddress,
        shippingAddressDetail,
        paymentMethod,
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
  };

  const startStandalonePayment = async () => {
    const response = await fetch("/api/payments/toss/product/prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        subjectId,
        quantity,
        designIndex,
        shippingAddress,
        shippingAddressDetail,
        paymentMethod,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "상품 결제 준비에 실패했습니다.");
    }
    if (!data.configured) {
      throw new Error("Toss Payments 키 설정이 필요합니다.");
    }
    if (!window.TossPayments) {
      throw new Error("결제 SDK가 아직 준비되지 않았습니다.");
    }

    const tossPayments = window.TossPayments(data.clientKey);
    const payment = tossPayments.payment({ customerKey: `guardian_${guardian?.id || "guest"}` });
    await payment.requestPayment({
      method: paymentMethod,
      amount: {
        currency: "KRW",
        value: Number(data.amount || 0),
      },
      orderId: data.orderId,
      orderName: data.orderName,
      successUrl: data.successUrl,
      failUrl: data.failUrl,
      customerEmail: guardian?.email || guardian?.google_email || "",
      customerName: guardian?.name || "",
    });
  };

  const pay = async () => {
    if (!validateSelection()) return;
    if (!sdkReady) {
      setMessage("결제 SDK를 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "standalone") {
        await startStandalonePayment();
        return;
      }
      await startSubscription();
    } catch (error) {
      setMessage(error.message || "결제를 시작하지 못했습니다.");
      setLoading(false);
    }
  };

  return (
    <section className="shop-phone-panel">
      <header className="shop-topbar">
        <a className="shop-back-link" href={step === "configure" ? "/shop" : "#back"} onClick={(event) => {
          if (step === "preview") {
            event.preventDefault();
            setStep("configure");
          }
          if (step === "order") {
            event.preventDefault();
            setStep("preview");
          }
        }} aria-label="이전으로 돌아가기">‹</a>
        <h1>{step === "order" ? "결제" : product.name}</h1>
        <span className="shop-help-mark" aria-hidden="true">?</span>
      </header>

      {step === "configure" && (
        <>
          <ProductConfiguration
            product={product}
            subjects={subjects}
            selectedSubject={selectedSubject}
            subjectId={subjectId}
            setSubjectId={setSubjectId}
            quantity={quantity}
            changeQuantity={changeQuantity}
            designIndex={designIndex}
            setDesignIndex={setDesignIndex}
            mode={mode}
            chooseMode={chooseMode}
            subscribed={subscribed}
            plans={plans}
            planMonths={planMonths}
            setPlanMonths={setPlanMonths}
            productAmount={productAmount}
          />
          <button className="shop-next-button" type="button" onClick={goPreview} disabled={subjects.length === 0}>
            다음
          </button>
        </>
      )}

      {step === "preview" && (
        <>
          <ProductPreview product={product} subject={selectedSubject} quantity={quantity} />
          <button className="shop-next-button" type="button" onClick={goOrder}>
            주문정보입력
          </button>
        </>
      )}

      {step === "order" && (
        <>
          <OrderInformation
            product={product}
            quantity={quantity}
            subject={selectedSubject}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            shippingAddressDetail={shippingAddressDetail}
            setShippingAddressDetail={setShippingAddressDetail}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            amount={paymentAmount}
          />
          <button className="shop-next-button" type="button" onClick={pay} disabled={loading}>
            {loading ? "결제 준비중" : "결제하기"}
          </button>
        </>
      )}

      {message && <p className="shop-message" role="status">{message}</p>}
    </section>
  );
}

function ProductConfiguration({
  product,
  subjects,
  subjectId,
  setSubjectId,
  quantity,
  changeQuantity,
  designIndex,
  setDesignIndex,
  mode,
  chooseMode,
  subscribed,
  plans,
  planMonths,
  setPlanMonths,
  productAmount,
}) {
  return (
    <>
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
          <input value={quantity} onChange={(event) => changeQuantity(event.target.value)} inputMode="numeric" />
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
        <button className={mode === "subscription" ? "active" : ""} type="button" onClick={() => chooseMode("subscription")}>
          구독기간
        </button>
        <button
          className={mode === "standalone" ? "active" : ""}
          type="button"
          onClick={() => chooseMode("standalone")}
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
        <div className="standalone-info-panel">
          <div className="shop-summary-list">
            <span>상품 금액</span>
            <strong>{formatCurrency(product.unit_price)} / 개</strong>
            <span>상품 수량</span>
            <strong>{quantity}개</strong>
            <span>결제예정금액</span>
            <strong>{formatCurrency(productAmount)}</strong>
          </div>
          <p className="shop-warning">상품 단독 구매는 구독중 고객에게만 표시됩니다.</p>
        </div>
      )}
    </>
  );
}

function ProductPreview({ product, subject, quantity }) {
  return (
    <div className="product-preview-stack">
      <p className="intro-kicker">주문할 상품 미리보기</p>
      <div className="product-preview-card">
        <ProductVisual product={product} />
        <div>
          <strong>{subject?.name || "대상자 미선택"}</strong>
          <span>{product.name} / {quantity}개</span>
        </div>
      </div>
      <div className="bracelet-preview-card">
        <ProductVisual product={product} />
        <span>{product.name} 디자인 미리보기</span>
      </div>
      <div className="preview-note-card">
        <strong>QR 안심 서비스 연결</strong>
        <span>상품 수령 후 QR을 스캔하고 활성화하면 대상자 정보가 공개됩니다.</span>
      </div>
    </div>
  );
}

function OrderInformation({
  product,
  quantity,
  subject,
  shippingAddress,
  setShippingAddress,
  shippingAddressDetail,
  setShippingAddressDetail,
  paymentMethod,
  setPaymentMethod,
  amount,
}) {
  return (
    <div className="order-info-stack">
      <section className="order-section">
        <h2>1. 구매 상품</h2>
        <div className="order-product-row">
          <div className="order-product-image">
            <ProductVisual product={product} />
          </div>
          <div>
            <strong>{product.name}</strong>
            <span>{subject?.name || "대상자 미선택"} 대상 / {quantity}개</span>
            <em>{formatCurrency(amount)}</em>
          </div>
        </div>
      </section>

      <section className="order-section">
        <h2>2. 배송지 선택</h2>
        <div className="shipping-address-box">
          <span>배송지</span>
          <KakaoPostcodeAddress
            defaultValue={shippingAddress}
            defaultDetailValue={shippingAddressDetail}
            addressName="shippingAddress"
            detailName="shippingAddressDetail"
            onAddressChange={setShippingAddress}
            onDetailChange={setShippingAddressDetail}
          />
        </div>
      </section>

      <section className="order-section">
        <h2>3. 주문 요약</h2>
        <div className="shop-summary-list">
          <span>상품 금액</span>
          <strong>{formatCurrency(amount)}</strong>
          <span>배송비</span>
          <strong>0원</strong>
          <span>총 결제 금액</span>
          <strong>{formatCurrency(amount)}</strong>
        </div>
      </section>

      <section className="order-section">
        <h2>4. 결제 방법</h2>
        <div className="payment-method-list">
          <label>
            <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === "CARD"} onChange={(event) => setPaymentMethod(event.target.value)} />
            <span>신용/체크카드</span>
          </label>
        </div>
      </section>
    </div>
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
