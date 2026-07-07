"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KakaoPostcodeAddress from "./kakao-postcode-address";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

export default function ShopCheckoutClient({ product, subjects = [], plans = [], subscription = null, guardian = null }) {
  const [step, setStep] = useState("configure");
  const [quantity, setQuantity] = useState(1);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [planMonths, setPlanMonths] = useState(String(plans[0]?.months || 1));
  const [mode, setMode] = useState("subscription");
  const [designIndex, setDesignIndex] = useState(0);
  const [designId, setDesignId] = useState(product.designs?.[0]?.id || "");
  const [shippingAddress, setShippingAddress] = useState(guardian?.address || "");
  const [shippingAddressDetail, setShippingAddressDetail] = useState(guardian?.address_detail || "");
  const [sdkReady, setSdkReady] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const widgetRef = useRef(null);

  const subscribed = subscription?.status === "active";
  const selectedSubject = subjects.find((subject) => subject.id === subjectId) || null;
  const selectedDesign = useMemo(() => {
    const designs = product.designs || [];
    return designs.find((design) => design.id === designId) || designs[designIndex] || designs[0] || null;
  }, [designId, designIndex, product.designs]);
  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan.months) === String(planMonths)) || plans[0] || null,
    [plans, planMonths]
  );
  const productUnitPrice = getDesignUnitPrice(product, selectedDesign);
  const productAmount = productUnitPrice * quantity;
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

  useEffect(() => {
    if (step !== "order" || !sdkReady) {
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
        if (!response.ok) throw new Error(data?.message || "결제위젯 설정을 불러오지 못했습니다.");
        if (!data.configured) throw new Error("Toss Payments 결제위젯 키 설정이 필요합니다.");
        if (!window.TossPayments) throw new Error("결제 SDK가 아직 준비되지 않았습니다.");

        const tossPayments = window.TossPayments(data.clientKey);
        const widgets = tossPayments.widgets({ customerKey: data.customerKey });
        await widgets.setAmount({ currency: "KRW", value: paymentAmount });
        if (cancelled) return;

        widgetRef.current = widgets;
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#toss-payment-methods", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#toss-payment-agreement", variantKey: "AGREEMENT" }),
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
  }, [paymentAmount, sdkReady, step]);

  const changeQuantity = (next) => {
    setQuantity(Math.max(1, Math.min(99, Number(next) || 1)));
  };

  const chooseMode = (nextMode) => {
    if (nextMode === "standalone" && !subscribed) {
      setMessage("상품 단독 구매는 이용권 사용중인 고객만 선택할 수 있습니다.");
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
    if ((product.designs || []).length > 0 && !selectedDesign) {
      setMessage("상품 디자인을 선택해 주세요.");
      return false;
    }
    if (mode === "standalone" && !subscribed) {
      setMessage("상품 단독 구매는 이용권 사용중인 고객만 선택할 수 있습니다.");
      return false;
    }
    if (mode === "subscription" && subscription?.status === "ready") {
      setMessage("QR 활성화를 기다리는 이용권이 있습니다. QR 활성화 후 추가 구매해 주세요.");
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
    if (!widgetRef.current || widgetStatus !== "ready") {
      throw new Error("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
    }

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
        designId: selectedDesign?.id || "",
        shippingAddress,
        shippingAddressDetail,
        paymentMethod: "WIDGET",
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "이용권 결제 준비에 실패했습니다.");
    }
    if (!data.configured) {
      throw new Error("Toss Payments 키 설정이 필요합니다.");
    }
    await widgetRef.current.requestPayment({
      orderId: data.orderId,
      orderName: data.orderName,
      successUrl: data.successUrl,
      failUrl: data.failUrl,
      customerEmail: data.customerEmail || guardian?.email || guardian?.google_email || "",
      customerName: data.customerName || guardian?.name || "",
    });
  };

  const startStandalonePayment = async () => {
    if (!widgetRef.current || widgetStatus !== "ready") {
      throw new Error("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
    }

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
        designId: selectedDesign?.id || "",
        shippingAddress,
        shippingAddressDetail,
        paymentMethod: "WIDGET",
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "상품 결제 준비에 실패했습니다.");
    }
    if (!data.configured) {
      throw new Error("Toss Payments 키 설정이 필요합니다.");
    }
    const request = {
      orderId: data.orderId,
      orderName: data.orderName,
      successUrl: data.successUrl,
      failUrl: data.failUrl,
      customerEmail: guardian?.email || guardian?.google_email || "",
      customerName: guardian?.name || "",
    };
    await widgetRef.current.requestPayment(request);
  };

  const pay = async () => {
    if (!validateSelection()) return;
    if (!sdkReady) {
      setMessage("결제 SDK를 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (widgetStatus !== "ready") {
      setMessage("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
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
            designId={designId}
            setDesignId={setDesignId}
            selectedDesign={selectedDesign}
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
          <ProductPreview product={product} design={selectedDesign} subject={selectedSubject} quantity={quantity} />
          <button className="shop-next-button" type="button" onClick={goOrder}>
            주문정보입력
          </button>
        </>
      )}

      {step === "order" && (
        <>
          <OrderInformation
            product={product}
            design={selectedDesign}
            quantity={quantity}
            subject={selectedSubject}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            shippingAddressDetail={shippingAddressDetail}
            setShippingAddressDetail={setShippingAddressDetail}
            widgetStatus={widgetStatus}
            amount={paymentAmount}
          />
          <button
            className="shop-next-button"
            type="button"
            onClick={pay}
            disabled={loading || widgetStatus !== "ready"}
          >
            {loading ? "결제 준비중" : widgetStatus !== "ready" ? "결제수단 준비중" : "결제하기"}
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
  designId,
  setDesignId,
  selectedDesign,
  mode,
  chooseMode,
  subscribed,
  plans,
  planMonths,
  setPlanMonths,
  productAmount,
}) {
  const designs = product.designs || [];
  return (
    <>
      {designs.length > 0 ? (
        <div className="shop-field">
          <strong>디자인 선택</strong>
          <div className="design-grid" role="listbox" aria-label="디자인 선택">
            {designs.map((design, index) => (
              <button
                className={(selectedDesign?.id || designId) === design.id ? "design-option active" : "design-option"}
                type="button"
                key={design.id}
                onClick={() => {
                  setDesignIndex(index);
                  setDesignId(design.id);
                }}
                aria-label={design.name || `디자인 ${index + 1}`}
                title={design.name || `디자인 ${index + 1}`}
              >
                <ProductVisual product={product} design={design} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="shop-note">등록된 디자인이 없어 상품 대표 이미지로 주문이 진행됩니다.</p>
      )}

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
          이용기간
        </button>
        <button
          className={mode === "standalone" ? "active" : ""}
          type="button"
          onClick={() => chooseMode("standalone")}
          disabled={!subscribed}
          title={subscribed ? "상품 단독 구매" : "이용권 사용중인 고객만 선택 가능합니다"}
        >
          상품 단독 구매
        </button>
      </div>

      {mode === "subscription" ? (
        <>
          <div className="plan-choice-list">
            {plans.map((plan) => (
              <button
                className={String(plan.months) === String(planMonths) ? "active" : ""}
                type="button"
                key={plan.months}
                onClick={() => setPlanMonths(String(plan.months))}
              >
                <span>{planLabel(plan.months)}</span>
                <strong>{formatCurrency(plan.amount)}</strong>
              </button>
            ))}
          </div>
          <p className="shop-note">선택한 기간을 한 번 결제하며 자동 갱신되지 않습니다.</p>
        </>
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
          <p className="shop-warning">상품 단독 구매는 이용권 사용중인 고객에게만 표시됩니다.</p>
        </div>
      )}
    </>
  );
}

function ProductPreview({ product, design, subject, quantity }) {
  return (
    <div className="product-preview-stack">
      <p className="intro-kicker">주문할 상품 미리보기</p>
      <div className="product-preview-card">
        <ProductVisual product={product} design={design} />
        <div>
          <strong>{subject?.name || "대상자 미선택"}</strong>
          <span>{formatProductDesignName(product, design)} / {quantity}개</span>
        </div>
      </div>
      <div className="bracelet-preview-card">
        <ProductDetailVisual product={product} design={design} />
        <span>{formatProductDesignName(product, design)} 상세 미리보기</span>
        {design?.description && <small>{design.description}</small>}
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
  design,
  quantity,
  subject,
  shippingAddress,
  setShippingAddress,
  shippingAddressDetail,
  setShippingAddressDetail,
  widgetStatus,
  amount,
}) {
  return (
    <div className="order-info-stack">
      <section className="order-section">
        <h2>1. 구매 상품</h2>
        <div className="order-product-row">
          <div className="order-product-image">
            <ProductVisual product={product} design={design} />
          </div>
          <div>
            <strong>{formatProductDesignName(product, design)}</strong>
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
        <div className="toss-widget-shell" aria-busy={widgetStatus === "loading"}>
          <div id="toss-payment-methods" className="toss-widget-container" />
          <div id="toss-payment-agreement" className="toss-widget-container" />
          {widgetStatus === "loading" && <p className="toss-widget-status">안전한 결제수단을 불러오고 있습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function ProductVisual({ product, design = null }) {
  const image = design?.option_image_data_url || product.image_data_url;
  if (image) {
    return <img src={image} alt="" />;
  }
  return <span>{productFallbackIcon(product.slug)}</span>;
}

function ProductDetailVisual({ product, design = null }) {
  const image = design?.detail_image_data_url || design?.option_image_data_url || product.image_data_url;
  if (image) {
    return <img src={image} alt="" />;
  }
  return <span>{productFallbackIcon(product.slug)}</span>;
}

function getDesignUnitPrice(product, design = null) {
  if (design && design.unit_price !== null && design.unit_price !== undefined && design.unit_price !== "") {
    return Number(design.unit_price || 0);
  }
  return Number(product.unit_price || 0);
}

function formatProductDesignName(product, design = null) {
  return design?.name ? `${product.name} - ${design.name}` : product.name;
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  return "상품";
}

function planLabel(months) {
  return `${months}개월`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  if (!value) return "생년월일 미입력";
  return String(value).replaceAll("-", ".");
}
