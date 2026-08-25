"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KakaoPostcodeAddress from "./kakao-postcode-address";
import { formatDateOnly } from "../lib/date-format";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";
const ZODIAC_DESIGN_ORDER = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const PRODUCT_PICKER_IMAGES = {
  sticker: "/assets/shop-icons/product-sticker.png",
  bracelet: "/assets/shop-icons/product-bracelet.png",
  necklace: "/assets/shop-icons/product-necklace.png",
  keyring: "/assets/shop-icons/product-keyring.png",
  "bracelet-necklace": "/assets/shop-icons/product-bracelet-necklace.png",
  "necklace-keyring": "/assets/shop-icons/product-necklace-keyring.png",
  "bracelet-necklace-keyring": "/assets/shop-icons/product-bracelet-necklace-keyring.png",
};
const ZODIAC_PICKER_IMAGES = {
  쥐: "/assets/shop-icons/zodiac-rat.png",
  소: "/assets/shop-icons/zodiac-ox.png",
  호랑이: "/assets/shop-icons/zodiac-tiger.png",
  토끼: "/assets/shop-icons/zodiac-rabbit.png",
  용: "/assets/shop-icons/zodiac-dragon.png",
  뱀: "/assets/shop-icons/zodiac-snake.png",
  말: "/assets/shop-icons/zodiac-horse.png",
  양: "/assets/shop-icons/zodiac-sheep.png",
  원숭이: "/assets/shop-icons/zodiac-monkey.png",
  닭: "/assets/shop-icons/zodiac-rooster.png",
  개: "/assets/shop-icons/zodiac-dog.png",
  돼지: "/assets/shop-icons/zodiac-pig.png",
};

export default function ShopCheckoutClient({
  products = [],
  initialProductId = "",
  initialSubjectId = "",
  subjects = [],
  guardian = null,
  coupons = [],
  adminPaymentPassEnabled = false,
}) {
  const initialProduct = products.find((item) => item.id === initialProductId) || products[0];
  const initialDesigns = getShopDesigns(initialProduct);
  const [step, setStep] = useState("configure");
  const [productId, setProductId] = useState(initialProduct?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [subjectId, setSubjectId] = useState(
    subjects.some((subject) => subject.id === initialSubjectId)
      ? initialSubjectId
      : subjects[0]?.id || ""
  );
  const [designIndex, setDesignIndex] = useState(0);
  const [designId, setDesignId] = useState(initialDesigns[0]?.id || "");
  const [couponId, setCouponId] = useState("");
  const [couponPickerOpen, setCouponPickerOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(guardian?.address || "");
  const [shippingAddressDetail, setShippingAddressDetail] = useState(guardian?.address_detail || "");
  const [sdkReady, setSdkReady] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const widgetRef = useRef(null);
  const latestPaymentAmountRef = useRef(0);
  const widgetAmountRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.history.replaceState(
      {
        ...(window.history.state || {}),
        zezariShopCheckout: true,
        shopStep: "configure",
        couponPickerOpen: false,
      },
      "",
      window.location.href
    );

    const handlePopState = (event) => {
      if (!event.state?.zezariShopCheckout) return;
      const nextStep = ["configure", "preview", "order"].includes(event.state.shopStep)
        ? event.state.shopStep
        : "configure";
      setStep(nextStep);
      setCouponPickerOpen(nextStep === "order" && Boolean(event.state.couponPickerOpen));
      setMessage("");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const product = useMemo(
    () => products.find((item) => item.id === productId) || products[0] || null,
    [productId, products]
  );
  const designs = useMemo(() => getShopDesigns(product), [product]);
  const selectedSubject = subjects.find((subject) => subject.id === subjectId) || null;
  const selectedDesign = useMemo(() => {
    return designs.find((design) => design.id === designId) || designs[designIndex] || designs[0] || null;
  }, [designId, designIndex, designs]);
  const productUnitPrice = getDesignUnitPrice(product, selectedDesign);
  const productAmount = productUnitPrice * quantity;
  const subtotalAmount = productAmount;
  const applicableCoupons = useMemo(
    () => coupons.filter((coupon) => isCouponApplicableToOrder(coupon, "product", product?.slug, subtotalAmount)),
    [coupons, product?.slug, subtotalAmount]
  );
  const selectedCoupon = applicableCoupons.find((coupon) => coupon.id === couponId) || null;
  const discountAmount = selectedCoupon ? calculateCouponDiscount(selectedCoupon, subtotalAmount) : 0;
  const paymentAmount = Math.max(0, subtotalAmount - discountAmount);
  const freePayment = paymentAmount <= 0;

  useEffect(() => {
    latestPaymentAmountRef.current = paymentAmount;
  }, [paymentAmount]);

  useEffect(() => {
    const nextDesigns = getShopDesigns(product);
    setDesignIndex(0);
    setDesignId(nextDesigns[0]?.id || "");
  }, [product]);

  useEffect(() => {
    if (couponId && !applicableCoupons.some((coupon) => coupon.id === couponId)) {
      setCouponId("");
    }
  }, [applicableCoupons, couponId]);

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
    if (step !== "order") {
      widgetRef.current = null;
      widgetAmountRef.current = null;
      setWidgetStatus("idle");
      return undefined;
    }
    if (freePayment) {
      widgetRef.current = null;
      widgetAmountRef.current = null;
      setWidgetStatus("ready");
      return undefined;
    }
    if (!sdkReady) {
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

        clearTossWidgetContainers();
        const tossPayments = window.TossPayments(data.clientKey);
        const widgets = tossPayments.widgets({ customerKey: data.customerKey });
        const initialAmount = latestPaymentAmountRef.current;
        await widgets.setAmount({ currency: "KRW", value: initialAmount });
        widgetAmountRef.current = initialAmount;
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
  }, [freePayment, sdkReady, step]);

  useEffect(() => {
    if (step !== "order" || freePayment || widgetStatus !== "ready" || !widgetRef.current) return;
    if (widgetAmountRef.current === paymentAmount) return;

    let cancelled = false;
    const updateWidgetAmount = async () => {
      try {
        await widgetRef.current.setAmount({ currency: "KRW", value: paymentAmount });
        if (!cancelled) {
          widgetAmountRef.current = paymentAmount;
        }
      } catch (error) {
        if (!cancelled) {
          setWidgetStatus("error");
          setMessage(error.message || "결제금액을 갱신하지 못했습니다.");
        }
      }
    };

    updateWidgetAmount();
    return () => {
      cancelled = true;
    };
  }, [freePayment, paymentAmount, step, widgetStatus]);

  const changeQuantity = (next) => {
    setQuantity(Math.max(1, Math.min(99, Number(next) || 1)));
  };

  const validateSelection = () => {
    if (!subjectId) {
      setMessage("상품을 연결할 대상자를 선택해 주세요.");
      return false;
    }
    if (designs.length > 0 && !selectedDesign) {
      setMessage("상품 디자인을 선택해 주세요.");
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
    pushCheckoutHistory("preview");
  };

  const goOrder = () => {
    setMessage("");
    setStep("order");
    pushCheckoutHistory("order");
  };

  const pushCheckoutHistory = (nextStep, nextCouponPickerOpen = false) => {
    if (typeof window === "undefined") return;
    window.history.pushState(
      {
        ...(window.history.state || {}),
        zezariShopCheckout: true,
        shopStep: nextStep,
        couponPickerOpen: nextCouponPickerOpen,
      },
      "",
      window.location.href
    );
  };

  const openCouponPicker = () => {
    setCouponPickerOpen(true);
    pushCheckoutHistory("order", true);
  };

  const closeCouponPicker = () => {
    if (window.history.state?.zezariShopCheckout && window.history.state?.couponPickerOpen) {
      window.history.back();
      return;
    }
    setCouponPickerOpen(false);
  };

  const chooseCoupon = (nextCouponId) => {
    setCouponId(nextCouponId);
    closeCouponPicker();
  };

  const startProductServicePurchase = async (adminPass = false) => {
    const response = await fetch("/api/payments/toss/subscription/prepare", {
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
        couponId,
        shippingAddress,
        shippingAddressDetail,
        paymentMethod: "WIDGET",
        adminPass,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "상품 결제 준비에 실패했습니다.");
    }
    if (data.adminPass) {
      window.location.href = data.redirectUrl;
      return;
    }
    if (data.freeOrder) {
      window.location.href = data.redirectUrl || "/?tab=dashboard";
      return;
    }
    if (!data.configured) {
      throw new Error("Toss Payments 키 설정이 필요합니다.");
    }
    if (!widgetRef.current || widgetStatus !== "ready") {
      throw new Error("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
    }
    if (Number(data.amount || 0) !== paymentAmount) {
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
  };

  const pay = async () => {
    if (!validateSelection()) return;
    if (!freePayment && !sdkReady) {
      setMessage("결제 SDK를 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!freePayment && widgetStatus !== "ready") {
      setMessage("결제수단을 준비 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await startProductServicePurchase();
    } catch (error) {
      setMessage(error.message || "결제를 시작하지 못했습니다.");
      setLoading(false);
    }
  };

  const passPayment = async () => {
    if (!adminPaymentPassEnabled || !validateSelection()) return;
    if (!window.confirm("실제 결제 없이 관리자 테스트 거래를 결제완료 처리할까요?")) return;

    setLoading(true);
    setMessage("");

    try {
      await startProductServicePurchase(true);
    } catch (error) {
      setMessage(error.message || "결제패스 처리에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <section className="shop-phone-panel">
      <header className="shop-topbar">
        <a className="shop-back-link" href={step === "configure" ? "/?tab=dashboard" : "#back"} onClick={(event) => {
          if (step === "configure") return;
          event.preventDefault();
          window.history.back();
        }} aria-label="이전으로 돌아가기">‹</a>
        <h1>{step === "configure" ? "상품 구매" : step === "order" ? "결제" : product.name}</h1>
        <span className="shop-help-mark" aria-hidden="true">?</span>
      </header>

      {step === "configure" && (
        <>
          <ProductConfiguration
            product={product}
            products={products}
            productId={productId}
            setProductId={setProductId}
            designs={designs}
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
            productUnitPrice={productUnitPrice}
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
            coupons={applicableCoupons}
            couponId={couponId}
            selectedCoupon={selectedCoupon}
            couponPickerOpen={couponPickerOpen}
            openCouponPicker={openCouponPicker}
            closeCouponPicker={closeCouponPicker}
            chooseCoupon={chooseCoupon}
            widgetStatus={widgetStatus}
            subtotalAmount={subtotalAmount}
            discountAmount={discountAmount}
            amount={paymentAmount}
          />
          <div className="payment-action-stack">
            <button
              className="shop-next-button"
              type="button"
              onClick={pay}
              disabled={loading || widgetStatus !== "ready"}
            >
              {loading ? "결제 준비중" : freePayment ? "쿠폰으로 주문완료" : widgetStatus !== "ready" ? "결제수단 준비중" : "결제하기"}
            </button>
            {adminPaymentPassEnabled && (
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
          {adminPaymentPassEnabled && (
            <p className="admin-payment-pass-note">관리자 테스트 전용 · 실제 Toss 결제는 발생하지 않습니다.</p>
          )}
        </>
      )}

      {message && <p className="shop-message" role="status">{message}</p>}
    </section>
  );
}

function ProductConfiguration({
  product,
  products,
  productId,
  setProductId,
  designs,
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
  productUnitPrice,
  productAmount,
}) {
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const pickerAreaRef = useRef(null);

  useEffect(() => {
    const closePickers = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && pickerAreaRef.current?.contains(event.target)) return;
      setProductPickerOpen(false);
      setDesignPickerOpen(false);
    };

    document.addEventListener("pointerdown", closePickers);
    document.addEventListener("keydown", closePickers);
    return () => {
      document.removeEventListener("pointerdown", closePickers);
      document.removeEventListener("keydown", closePickers);
    };
  }, []);

  const selectProduct = (nextProduct) => {
    setProductId(nextProduct.id);
    setProductPickerOpen(false);
    setDesignPickerOpen(false);
  };

  const selectDesign = (nextDesign) => {
    const index = designs.findIndex((design) => design.id === nextDesign.id);
    setDesignIndex(Math.max(0, index));
    setDesignId(nextDesign.id);
    setDesignPickerOpen(false);
  };

  return (
    <>
      <div className="shop-selection-fields" ref={pickerAreaRef}>
        <div className="shop-field">
          <label htmlFor="shop-subject-select">나의 관리대상</label>
          {subjects.length > 0 ? (
            <select id="shop-subject-select" className="subject-pick-select" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {subjects.map((subject) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name} / {formatDate(subject.birth_date)}
                </option>
              ))}
            </select>
          ) : (
            <a className="empty-shop-link" href="/?tab=subjects&mode=new#subjects-info">
              대상자를 먼저 등록해 주세요
            </a>
          )}
        </div>

        <ShopImagePicker
          id="shop-product-picker"
          label="상품"
          prompt="상품을 선택해주세요"
          options={products}
          selectedId={productId}
          imageForOption={productPickerImage}
          open={productPickerOpen}
          onToggle={() => {
            setProductPickerOpen((current) => !current);
            setDesignPickerOpen(false);
          }}
          onClose={() => setProductPickerOpen(false)}
          onSelect={selectProduct}
          variant="product"
        />

        <div className="shop-field shop-design-picker-field">
          {designs.length > 0 ? (
            <ShopImagePicker
              id="shop-design-picker"
              label="디자인"
              prompt="디자인을 선택해주세요"
              options={designs}
              selectedId={selectedDesign?.id || designId}
              imageForOption={designPickerImage}
              open={designPickerOpen}
              onToggle={() => {
                setDesignPickerOpen((current) => !current);
                setProductPickerOpen(false);
              }}
              onClose={() => setDesignPickerOpen(false)}
              onSelect={selectDesign}
              variant="design"
            />
          ) : (
            <>
              <label>디자인</label>
              <p className="shop-note">등록된 12간지 디자인이 없습니다.</p>
            </>
          )}
        </div>
      </div>

      <div className="shop-selection-summary">
        <ProductVisual product={product} design={selectedDesign} />
        <div>
          <strong>{formatProductDesignName(product, selectedDesign)}</strong>
          <span>{formatCurrency(productUnitPrice)} / 개</span>
          {product?.description && <small>{product.description}</small>}
        </div>
      </div>

      <div className="shop-field">
        <label htmlFor="shop-quantity">수량</label>
        <div className="quantity-control">
          <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="수량 감소">−</button>
          <input id="shop-quantity" value={quantity} onChange={(event) => changeQuantity(event.target.value)} inputMode="numeric" />
          <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="수량 증가">+</button>
        </div>
      </div>

      <div className="standalone-info-panel">
        <div className="shop-summary-list">
          <span>상품 금액</span>
          <strong>{formatCurrency(productUnitPrice)} / 개</strong>
          <span>상품 수량</span>
          <strong>{quantity}개</strong>
          <span>결제예정금액</span>
          <strong>{formatCurrency(productAmount)}</strong>
        </div>
        <p className="shop-note">상품을 구매하고 QR을 활성화하면 관리대상 QR 안심 서비스를 계속 이용할 수 있습니다.</p>
      </div>
    </>
  );
}

function ShopImagePicker({
  id,
  label,
  prompt,
  options,
  selectedId,
  imageForOption,
  open,
  onToggle,
  onClose,
  onSelect,
  variant,
}) {
  const selectedOption = options.find((option) => option.id === selectedId) || options[0] || null;
  const selectedImage = selectedOption ? imageForOption(selectedOption) : "";

  return (
    <div className={`shop-field shop-image-picker-field ${open ? "open" : ""}`}>
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
      <button
        id={`${id}-trigger`}
        className="shop-image-picker-trigger"
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={onToggle}
      >
        <span className="shop-image-picker-thumb" aria-hidden="true">
          {selectedImage ? <img src={selectedImage} alt="" /> : <b>{label.slice(0, 1)}</b>}
        </span>
        <strong id={`${id}-value`}>{selectedOption?.name || prompt}</strong>
        <b className="shop-image-picker-chevron" aria-hidden="true">⌄</b>
      </button>

      {open && (
        <section className="shop-image-picker-menu" aria-label={`${label} 선택`}>
          <header>
            <strong>{prompt}</strong>
            <button type="button" onClick={onClose} aria-label={`${label} 선택 닫기`}>×</button>
          </header>
          <div
            id={`${id}-options`}
            className={`shop-image-picker-grid ${variant}`}
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {options.map((option) => {
              const image = imageForOption(option);
              const selected = option.id === selectedId;
              return (
                <button
                  type="button"
                  className={selected ? "selected" : ""}
                  role="option"
                  aria-selected={selected}
                  aria-label={`${option.name} 선택`}
                  onClick={() => onSelect(option)}
                  key={option.id}
                >
                  {image ? <img src={image} alt={option.name} /> : <span>{option.name}</span>}
                  {selected && <b className="shop-image-picker-check" aria-hidden="true">✓</b>}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductPreview({ product, design, subject, quantity }) {
  const hasProductDetail = Number(product?.has_detail_image || 0) === 1;
  const hasDesignDetail = Boolean(design?.detail_image_data_url);

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
        {hasProductDetail ? (
          <ProductDetailVisual product={product} />
        ) : hasDesignDetail ? (
          <DesignDetailVisual design={design} product={product} />
        ) : (
          <ProductDetailVisual product={product} />
        )}
        <span>{hasProductDetail ? `${product.name} 상세페이지` : hasDesignDetail ? `${design.name} 디자인 상세` : `${product.name} 상품 안내`}</span>
        {(hasProductDetail ? product?.description : design?.description || product?.description) && (
          <small>{hasProductDetail ? product.description : design?.description || product.description}</small>
        )}
      </div>
      {hasProductDetail && hasDesignDetail && (
        <div className="bracelet-preview-card design-detail-preview-card">
          <DesignDetailVisual design={design} product={product} />
          <span>{design.name} 디자인 상세</span>
          {design?.description && <small>{design.description}</small>}
        </div>
      )}
      <div className="preview-note-card">
        <strong>QR 안심 서비스 연결</strong>
        <span>상품 수령 후 QR을 활성화하면 대상자 정보가 공개되며 추가 기간 결제 없이 계속 이용할 수 있습니다.</span>
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
  coupons,
  couponId,
  selectedCoupon,
  couponPickerOpen,
  openCouponPicker,
  closeCouponPicker,
  chooseCoupon,
  widgetStatus,
  subtotalAmount,
  discountAmount,
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
            addressReadOnly
            onAddressChange={setShippingAddress}
            onDetailChange={setShippingAddressDetail}
          />
        </div>
      </section>

      <section className="order-section">
        <h2>3. 쿠폰 선택</h2>
        <div className="coupon-select-box">
          <div className="coupon-select-summary">
            <strong>할인쿠폰</strong>
            <span>{coupons.length}개 보유</span>
          </div>
          <button className="coupon-select-trigger" type="button" onClick={openCouponPicker}>
            <span>
              {selectedCoupon
                ? couponOptionLabel(selectedCoupon)
                : coupons.length > 0
                  ? "쿠폰을 선택해 주세요"
                  : "사용 가능한 쿠폰이 없어요"}
            </span>
            <b aria-hidden="true">›</b>
          </button>
          {selectedCoupon && (
            <p>
              {selectedCoupon.name} 적용: {formatCurrency(discountAmount)} 할인
            </p>
          )}
        </div>
      </section>

      {couponPickerOpen && (
        <div
          className="coupon-picker-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="쿠폰 선택"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCouponPicker();
          }}
        >
          <section className="coupon-picker-panel">
            <header>
              <button type="button" onClick={closeCouponPicker} aria-label="결제 화면으로 돌아가기">‹</button>
              <h3>쿠폰 선택</h3>
              <span aria-hidden="true" />
            </header>
            <div className="coupon-picker-list">
              <button
                type="button"
                className={!couponId ? "selected" : ""}
                onClick={() => chooseCoupon("")}
              >
                <span>
                  <strong>쿠폰 사용 안함</strong>
                  <small>할인 없이 결제를 진행합니다.</small>
                </span>
                <b aria-hidden="true">{!couponId ? "✓" : ""}</b>
              </button>
              {coupons.map((coupon) => (
                <button
                  type="button"
                  className={coupon.id === couponId ? "selected" : ""}
                  onClick={() => chooseCoupon(coupon.id)}
                  key={coupon.id}
                >
                  <span>
                    <strong>{coupon.name || coupon.code}</strong>
                    <small>{couponOptionLabel(coupon)}</small>
                  </span>
                  <b aria-hidden="true">{coupon.id === couponId ? "✓" : ""}</b>
                </button>
              ))}
              {coupons.length === 0 && (
                <p className="coupon-picker-empty">현재 이 상품에 사용할 수 있는 쿠폰이 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      )}

      <section className="order-section">
        <h2>4. 주문 요약</h2>
        <div className="shop-summary-list">
          <span>상품 금액</span>
          <strong>{formatCurrency(subtotalAmount)}</strong>
          <span>쿠폰 할인</span>
          <strong>{discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : "0원"}</strong>
          <span>배송비</span>
          <strong>0원</strong>
          <span>총 결제 금액</span>
          <strong>{formatCurrency(amount)}</strong>
        </div>
      </section>

      <section className="order-section">
        <h2>5. 결제 방법</h2>
        {amount <= 0 ? (
          <div className="free-payment-box">
            <strong>쿠폰 전액 할인</strong>
            <span>결제수단 입력 없이 주문을 완료합니다.</span>
          </div>
        ) : (
          <div className="toss-widget-shell" aria-busy={widgetStatus === "loading"}>
            <div id="toss-payment-methods" className="toss-widget-container" />
            <div id="toss-payment-agreement" className="toss-widget-container" />
            {widgetStatus === "loading" && <p className="toss-widget-status">안전한 결제수단을 불러오고 있습니다.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductVisual({ product, design = null }) {
  const image = Number(design?.has_option_image || 0) === 1
    ? productDesignImageUrl(design)
    : Number(product?.has_image || 0) === 1
      ? productImageUrl(product)
      : "";
  if (image) {
    return <img src={image} alt="" />;
  }
  return <span>{productFallbackIcon(product.slug)}</span>;
}

function ProductDetailVisual({ product }) {
  const image = Number(product?.has_detail_image || 0) === 1
    ? productDetailImageUrl(product)
    : Number(product?.has_image || 0) === 1
      ? productImageUrl(product)
      : "";
  if (image) {
    return <img src={image} alt="" />;
  }
  return <span>{productFallbackIcon(product.slug)}</span>;
}

function DesignDetailVisual({ product, design }) {
  const image = Number(design?.has_detail_image || 0) === 1
    ? productDesignDetailImageUrl(design)
    : Number(design?.has_option_image || 0) === 1
      ? productDesignImageUrl(design)
      : Number(product?.has_image || 0) === 1
        ? productImageUrl(product)
        : "";
  if (image) {
    return <img src={image} alt="" />;
  }
  return <span>{productFallbackIcon(product?.slug)}</span>;
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

function productDetailImageUrl(product) {
  const version = encodeURIComponent(String(product?.updated_at || ""));
  return `/api/products/${encodeURIComponent(product.id)}/detail?v=${version}`;
}

function productImageUrl(product) {
  const version = encodeURIComponent(String(product?.updated_at || ""));
  return `/api/products/${encodeURIComponent(product.id)}/image?v=${version}`;
}

function productDesignImageUrl(design) {
  const version = encodeURIComponent(String(design?.updated_at || ""));
  return `/api/products/designs/${encodeURIComponent(design.id)}/image?v=${version}`;
}

function productDesignDetailImageUrl(design) {
  const version = encodeURIComponent(String(design?.updated_at || ""));
  return `/api/products/designs/${encodeURIComponent(design.id)}/detail?v=${version}`;
}

function isCouponApplicableToOrder(coupon, mode, productSlug, subtotalAmount) {
  if (!coupon || coupon.status !== "available" || coupon.coupon_status !== "active") return false;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  if (coupon.start_date && coupon.start_date > today) return false;
  if (coupon.end_date && coupon.end_date < today) return false;
  const minOrderAmount = Math.max(0, Number(coupon.min_order_amount || 0));
  if (minOrderAmount > 0 && Number(subtotalAmount || 0) < minOrderAmount) return false;

  const scope = String(coupon.service_scope || "all");
  if (scope === "all") return true;
  if (scope === "subscription") return mode === "subscription";
  if (scope === "ad") return false;
  return scope === productSlug;
}

function calculateCouponDiscount(coupon, subtotalAmount) {
  const subtotal = Math.max(0, Math.floor(Number(subtotalAmount || 0)));
  const discountValue = Math.max(0, Math.floor(Number(coupon?.discount_value || 0)));
  if (subtotal <= 0 || discountValue <= 0) return 0;
  let discount = coupon?.discount_type === "fixed"
    ? discountValue
    : Math.floor(subtotal * Math.min(discountValue, 100) / 100);
  const maxDiscountAmount = Math.max(0, Math.floor(Number(coupon?.max_discount_amount || 0)));
  if (maxDiscountAmount > 0) {
    discount = Math.min(discount, maxDiscountAmount);
  }
  return Math.min(subtotal, Math.max(0, discount));
}

function couponOptionLabel(coupon) {
  const label = coupon.master_discount_label || coupon.discount_label || "할인";
  const minOrderAmount = Math.max(0, Number(coupon.min_order_amount || 0));
  const minText = minOrderAmount > 0 ? ` · ${formatCurrency(minOrderAmount)} 이상` : "";
  return `${coupon.name || coupon.code} (${label}${minText})`;
}

function productPickerImage(product) {
  return PRODUCT_PICKER_IMAGES[String(product?.slug || "").trim()] || "";
}

function designPickerImage(design) {
  return ZODIAC_PICKER_IMAGES[String(design?.name || "").trim()] || "";
}

function clearTossWidgetContainers() {
  if (typeof document === "undefined") return;
  document.getElementById("toss-payment-methods")?.replaceChildren();
  document.getElementById("toss-payment-agreement")?.replaceChildren();
}

function getShopDesigns(product) {
  const order = new Map(ZODIAC_DESIGN_ORDER.map((name, index) => [name, index]));
  return [...(product?.designs || [])]
    .filter((design) => order.has(String(design?.name || "").trim()))
    .sort((a, b) => order.get(a.name) - order.get(b.name));
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  if (["bracelet-necklace", "necklace-keyring", "bracelet-necklace-keyring"].includes(slug)) return "세트";
  return "상품";
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  return formatDateOnly(value, "생년월일 미입력");
}
