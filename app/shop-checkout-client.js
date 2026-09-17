"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KakaoPostcodeAddress from "./kakao-postcode-address";
import BackButton from "./back-button";
import { formatDateOnly } from "../lib/date-format";
import {
  DEFAULT_SHOP_SHIPPING_SETTINGS,
  calculateShopShippingFee,
  normalizeShopShippingSettings,
} from "../lib/shop-shipping";

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";
const SHOP_CONFIGURATION_DRAFT_KEY = "zezari:shop-configuration-before-service";
const SHOP_CONFIGURATION_DRAFT_TTL_MS = 6 * 60 * 60 * 1000;
const ZODIAC_DESIGN_ORDER = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const BRACELET_LENGTH_OPTIONS = [
  { value: "유아용 13 + 3cm", label: "유아용", measurement: "13 + 3cm" },
  { value: "성인용 16 + 3cm", label: "성인용", measurement: "16 + 3cm" },
];
const NECKLACE_LENGTH_OPTIONS = [
  { value: "유아 · 5세 미만 35 + 3cm", label: "유아 · 5세 미만", measurement: "35 + 3cm" },
  { value: "아동 · 5세 이상 38 + 3cm", label: "아동 · 5세 이상", measurement: "38 + 3cm" },
  { value: "성인 여성 45 + 5cm", label: "성인 여성", measurement: "45 + 5cm" },
  { value: "성인 남성 50 + 5cm", label: "성인 남성", measurement: "50 + 5cm" },
];
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
  initialOrderPreview = false,
  initialBraceletLength = "",
  initialNecklaceLength = "",
  shippingSettings = DEFAULT_SHOP_SHIPPING_SETTINGS,
}) {
  const initialProduct = products.find((item) => item.id === initialProductId) || null;
  const initialDesign = getShopDesigns(initialProduct)[0] || null;
  const [step, setStep] = useState(initialOrderPreview ? "order" : "configure");
  const [productId, setProductId] = useState(initialProduct?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [subjectId, setSubjectId] = useState(
    subjects.some((subject) => subject.id === initialSubjectId)
      ? initialSubjectId
      : subjects[0]?.id || ""
  );
  const [designIndex, setDesignIndex] = useState(0);
  const [designId, setDesignId] = useState(initialDesign?.id || "");
  const [selectedDesignName, setSelectedDesignName] = useState(initialDesign?.name || "");
  const [braceletLength, setBraceletLength] = useState(initialBraceletLength);
  const [necklaceLength, setNecklaceLength] = useState(initialNecklaceLength);
  const [couponId, setCouponId] = useState("");
  const [couponInventory, setCouponInventory] = useState(coupons);
  const [couponPickerOpen, setCouponPickerOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState(guardian?.address || "");
  const [shippingAddressDetail, setShippingAddressDetail] = useState(guardian?.address_detail || "");
  const [sdkReady, setSdkReady] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectionView, setSelectionView] = useState("");
  const [draftSelectionId, setDraftSelectionId] = useState("");
  const widgetRef = useRef(null);
  const latestPaymentAmountRef = useRef(0);
  const widgetAmountRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.history.replaceState(
      {
        ...(window.history.state || {}),
        zezariShopCheckout: true,
        shopStep: initialOrderPreview ? "order" : "configure",
        couponPickerOpen: false,
      },
      "",
      window.location.href
    );

    const handlePopState = (event) => {
      if (!event.state?.zezariShopCheckout) return;
      const nextStep = ["configure", "order"].includes(event.state.shopStep)
        ? event.state.shopStep
        : "configure";
      setStep(nextStep);
      setCouponPickerOpen(nextStep === "order" && Boolean(event.state.couponPickerOpen));
      setMessage("");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialOrderPreview]);

  const product = useMemo(
    () => products.find((item) => item.id === productId) || null,
    [productId, products]
  );
  const designs = useMemo(() => getShopDesigns(product), [product]);
  const universalDesigns = useMemo(() => getUniversalShopDesigns(products), [products]);
  const designChoices = product ? designs : universalDesigns;
  const selectedSubject = subjects.find((subject) => subject.id === subjectId) || null;
  const selectedDesign = useMemo(() => {
    return designs.find((design) => design.id === designId) || null;
  }, [designId, designIndex, designs]);
  const displayDesign = selectedDesign || universalDesigns.find((design) => design.name === selectedDesignName) || null;
  const lengthRequirements = getProductLengthRequirements(product);
  const lengthSelectionReady = (!lengthRequirements.bracelet || Boolean(braceletLength))
    && (!lengthRequirements.necklace || Boolean(necklaceLength));
  const configurationReady = Boolean(subjectId && product && selectedDesign && lengthSelectionReady);
  const productUnitPrice = getDesignUnitPrice(product, selectedDesign);
  const productAmount = productUnitPrice * quantity;
  const subtotalAmount = productAmount;
  const applicableCoupons = useMemo(
    () => couponInventory.filter((coupon) => isCouponApplicableToOrder(coupon, "product", product?.slug, subtotalAmount)),
    [couponInventory, product?.slug, subtotalAmount]
  );
  const selectedCoupon = applicableCoupons.find((coupon) => coupon.id === couponId) || null;
  const discountAmount = selectedCoupon ? calculateCouponDiscount(selectedCoupon, subtotalAmount) : 0;
  const normalizedShippingSettings = normalizeShopShippingSettings(shippingSettings);
  const shippingFee = calculateShopShippingFee(subtotalAmount, normalizedShippingSettings);
  const paymentAmount = Math.max(0, subtotalAmount - discountAmount) + shippingFee;
  const freePayment = paymentAmount <= 0;

  useEffect(() => {
    latestPaymentAmountRef.current = paymentAmount;
  }, [paymentAmount]);

  useEffect(() => {
    const nextDesigns = getShopDesigns(product);
    const matchingDesign = nextDesigns.find((design) => design.name === selectedDesignName) || null;
    setDesignIndex(Math.max(0, nextDesigns.findIndex((design) => design.id === matchingDesign?.id)));
    setDesignId(matchingDesign?.id || "");
    setQuantity(1);
  }, [product, selectedDesignName]);

  useEffect(() => {
    const requirements = getProductLengthRequirements(product);
    if (!requirements.bracelet) setBraceletLength("");
    if (!requirements.necklace) setNecklaceLength("");
  }, [product]);

  useEffect(() => {
    if (typeof window === "undefined" || initialOrderPreview) return;

    const storedDraft = window.sessionStorage.getItem(SHOP_CONFIGURATION_DRAFT_KEY);
    if (!storedDraft) return;
    window.sessionStorage.removeItem(SHOP_CONFIGURATION_DRAFT_KEY);

    try {
      const draft = JSON.parse(storedDraft);
      if (Date.now() - Number(draft.savedAt || 0) > SHOP_CONFIGURATION_DRAFT_TTL_MS) return;
      const restoredProduct = products.find((item) => item.id === draft.productId);
      if (!restoredProduct) return;

      setProductId(restoredProduct.id);
      if (subjects.some((subject) => subject.id === draft.subjectId)) setSubjectId(draft.subjectId);
      setQuantity(Math.max(1, Math.min(99, Number(draft.quantity || 1))));
      setSelectedDesignName(String(draft.selectedDesignName || ""));
      if (BRACELET_LENGTH_OPTIONS.some((option) => option.value === draft.braceletLength)) {
        setBraceletLength(draft.braceletLength);
      }
      if (NECKLACE_LENGTH_OPTIONS.some((option) => option.value === draft.necklaceLength)) {
        setNecklaceLength(draft.necklaceLength);
      }
    } catch {
      // Ignore malformed browser state and keep the server-provided defaults.
    }
  }, [initialOrderPreview, products, subjects]);

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
    if (initialOrderPreview) {
      widgetRef.current = null;
      widgetAmountRef.current = null;
      setWidgetStatus("preview");
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
  }, [freePayment, initialOrderPreview, sdkReady, step]);

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
    if (!product) {
      setMessage("상품을 선택해 주세요.");
      return false;
    }
    if (designs.length > 0 && !selectedDesign) {
      setMessage("상품 디자인을 선택해 주세요.");
      return false;
    }
    if (lengthRequirements.bracelet && !braceletLength) {
      setMessage("팔찌 길이를 선택해 주세요.");
      return false;
    }
    if (lengthRequirements.necklace && !necklaceLength) {
      setMessage("목걸이 길이를 선택해 주세요.");
      return false;
    }
    if (step === "order" && !recipientName.trim()) {
      setMessage("수령인 이름을 입력해 주세요.");
      return false;
    }
    if (step === "order" && !/^01\d{8,9}$/.test(recipientPhone.replace(/\D/g, ""))) {
      setMessage("수령인의 휴대전화 번호를 정확히 입력해 주세요.");
      return false;
    }
    if (step === "order" && !shippingAddress.trim()) {
      setMessage("배송지를 입력해 주세요.");
      return false;
    }
    return true;
  };

  const goOrder = () => {
    if (!validateSelection()) return;
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

  const registerCouponForCheckout = async (rawCode) => {
    const code = String(rawCode || "").trim().toUpperCase();
    if (!code) throw new Error("유효한 쿠폰코드가 아닙니다");
    if (couponInventory.some((coupon) => String(coupon.code || "").toUpperCase() === code)) {
      throw new Error("이미 등록된 쿠폰입니다.");
    }

    let coupon;
    if (initialOrderPreview) {
      if (code !== "ZEZARI-5000") throw new Error("유효한 쿠폰코드가 아닙니다");
      coupon = {
        id: `preview-coupon-${Date.now()}`,
        code,
        name: "상품 1,000원 할인 쿠폰",
        status: "available",
        coupon_status: "active",
        discount_type: "fixed",
        discount_value: 1000,
        master_discount_label: "1,000원",
        service_scope: "all",
      };
    } else {
      const response = await fetch("/api/coupons/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "유효한 쿠폰코드가 아닙니다");
      coupon = data.coupon;
    }

    if (!coupon?.id) throw new Error("유효한 쿠폰코드가 아닙니다");
    setCouponInventory((current) => [...current, coupon]);
    if (isCouponApplicableToOrder(coupon, "product", product?.slug, subtotalAmount)) {
      setCouponId(coupon.id);
      return coupon;
    }
    throw new Error("등록된 쿠폰은 현재 상품에 사용할 수 없습니다.");
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
        braceletLength,
        necklaceLength,
        couponId,
        recipientName,
        recipientPhone,
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

  const openSelectionView = (view) => {
    const currentDesignChoice = designChoices.find((design) => design.name === selectedDesignName);
    setDraftSelectionId(view === "product" ? productId : currentDesignChoice?.id || "");
    setSelectionView(view);
  };

  const confirmSelection = () => {
    if (!draftSelectionId) return;
    if (selectionView === "product") {
      if (draftSelectionId !== productId) {
        setBraceletLength("");
        setNecklaceLength("");
      }
      setProductId(draftSelectionId);
    } else if (selectionView === "design") {
      const nextDesign = designChoices.find((design) => design.id === draftSelectionId);
      if (!nextDesign) return;
      setSelectedDesignName(nextDesign.name);
      const nextIndex = designs.findIndex((design) => design.name === nextDesign.name);
      setDesignIndex(Math.max(0, nextIndex));
      setDesignId(nextIndex >= 0 ? designs[nextIndex].id : "");
    }
    setSelectionView("");
  };

  const selectionTitle = selectionView === "product" ? "상품 선택" : "디자인 선택";

  const preserveConfigurationForService = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SHOP_CONFIGURATION_DRAFT_KEY, JSON.stringify({
      savedAt: Date.now(),
      productId,
      selectedDesignName,
      subjectId,
      quantity,
      braceletLength,
      necklaceLength,
    }));
  };

  return (
    <section className="shop-phone-panel">
      <header className="shop-topbar">
        {selectionView ? (
          <BackButton className="shop-back-link plain" onClick={() => setSelectionView("")} label="상품 구매로 돌아가기" />
        ) : (
          <BackButton className="shop-back-link" href={step === "configure" ? "/?tab=dashboard" : "#back"} onClick={(event) => {
            if (step === "configure") return;
            event.preventDefault();
            window.history.back();
          }} label="이전으로 돌아가기" />
        )}
        <h1>{selectionView ? selectionTitle : step === "configure" ? "상품 구매" : "결제"}</h1>
        {step === "configure" || selectionView ? (
          <a className="shop-help-mark" href="/shop/service" onClick={preserveConfigurationForService} aria-label="상품구매 서비스 소개">
            <img src="/assets/shop-icons/help-question.png" alt="" />
          </a>
        ) : (
          <span aria-hidden="true" />
        )}
      </header>

      {selectionView === "product" && (
        <CatalogSelectionView
          type="product"
          options={products}
          selectedId={draftSelectionId}
          onSelect={setDraftSelectionId}
          onConfirm={confirmSelection}
        />
      )}

      {selectionView === "design" && (
        <CatalogSelectionView
          type="design"
          options={designChoices}
          selectedId={draftSelectionId}
          onSelect={setDraftSelectionId}
          onConfirm={confirmSelection}
        />
      )}

      {!selectionView && step === "configure" && (
        <>
          <ProductConfiguration
            product={product}
            designs={designs}
            subjects={subjects}
            subjectId={subjectId}
            setSubjectId={setSubjectId}
            quantity={quantity}
            changeQuantity={changeQuantity}
            displayDesign={displayDesign}
            designReady={Boolean(selectedDesign)}
            braceletLength={braceletLength}
            setBraceletLength={setBraceletLength}
            necklaceLength={necklaceLength}
            setNecklaceLength={setNecklaceLength}
            productUnitPrice={productUnitPrice}
            productAmount={productAmount}
            openProductSelection={() => openSelectionView("product")}
            openDesignSelection={() => openSelectionView("design")}
          />
          <button className="shop-next-button" type="button" onClick={goOrder} disabled={!configurationReady}>
            다음
          </button>
        </>
      )}

      {!selectionView && step === "order" && (
        <>
          <OrderInformation
            product={product}
            design={selectedDesign}
            braceletLength={braceletLength}
            necklaceLength={necklaceLength}
            quantity={quantity}
            subject={selectedSubject}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            recipientPhone={recipientPhone}
            setRecipientPhone={setRecipientPhone}
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
            registerCoupon={registerCouponForCheckout}
            widgetStatus={widgetStatus}
            paymentPreview={initialOrderPreview}
            subtotalAmount={subtotalAmount}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            shippingSettings={normalizedShippingSettings}
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
  designs,
  subjects,
  subjectId,
  setSubjectId,
  quantity,
  changeQuantity,
  displayDesign,
  designReady,
  braceletLength,
  setBraceletLength,
  necklaceLength,
  setNecklaceLength,
  productUnitPrice,
  productAmount,
  openProductSelection,
  openDesignSelection,
}) {
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const pickerAreaRef = useRef(null);
  const lengthRequirements = getProductLengthRequirements(product);
  const lengthSelectionReady = (!lengthRequirements.bracelet || Boolean(braceletLength))
    && (!lengthRequirements.necklace || Boolean(necklaceLength));
  const selectionReady = Boolean(product && designReady && lengthSelectionReady);

  useEffect(() => {
    const closePickers = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && pickerAreaRef.current?.contains(event.target)) return;
      setSubjectPickerOpen(false);
    };

    document.addEventListener("pointerdown", closePickers);
    document.addEventListener("keydown", closePickers);
    return () => {
      document.removeEventListener("pointerdown", closePickers);
      document.removeEventListener("keydown", closePickers);
    };
  }, []);

  return (
    <>
      <div className="shop-selection-fields" ref={pickerAreaRef}>
        <div className={`shop-field shop-subject-picker ${subjectPickerOpen ? "open" : ""}`}>
          <label id="shop-subject-picker-label">대상자 선택</label>
          {subjects.length > 0 ? (
            <>
              <button
                className="shop-subject-trigger"
                type="button"
                aria-labelledby="shop-subject-picker-label shop-subject-picker-value"
                aria-haspopup="listbox"
                aria-expanded={subjectPickerOpen}
                onClick={() => setSubjectPickerOpen((current) => !current)}
              >
                <span id="shop-subject-picker-value">
                  <strong>{subjects.find((subject) => subject.id === subjectId)?.name || "대상자를 선택해 주세요"}</strong>
                  <small>{formatDate(subjects.find((subject) => subject.id === subjectId)?.birth_date)}</small>
                </span>
                <b aria-hidden="true">⌃<i>⌄</i></b>
              </button>
              {subjectPickerOpen && (
                <>
                  <div className="shop-subject-backdrop" onMouseDown={() => setSubjectPickerOpen(false)} aria-hidden="true" />
                  <section className="shop-subject-menu modal" role="dialog" aria-modal="true" aria-labelledby="shop-subject-picker-label">
                    <div role="listbox" aria-labelledby="shop-subject-picker-label">
                      {subjects.map((subject) => (
                        <button
                          className={subject.id === subjectId ? "selected" : ""}
                          type="button"
                          role="option"
                          aria-selected={subject.id === subjectId}
                          onClick={() => {
                            setSubjectId(subject.id);
                            setSubjectPickerOpen(false);
                          }}
                          key={subject.id}
                        >
                          <span className="shop-subject-check" aria-hidden="true">✓</span>
                          <span>
                            <strong>{subject.name}</strong>
                            <small>{formatDate(subject.birth_date)}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          ) : (
            <a className="empty-shop-link" href="/?tab=subjects&mode=new#subjects-info">
              대상자를 먼저 등록해 주세요
            </a>
          )}
        </div>

        <ShopSelectionTrigger
          label="상품"
          prompt="상품을 선택해 주세요"
          selectedOption={product}
          image={product ? productPickerImage(product) : "/assets/dashboard-action-shop.png"}
          onClick={openProductSelection}
          type="product"
        />

        {(lengthRequirements.bracelet || lengthRequirements.necklace) && (
          <section className="shop-length-section" aria-labelledby="shop-length-title">
            <h2 id="shop-length-title">길이 선택</h2>
            {lengthRequirements.bracelet && (
              <LengthOptionGroup
                label="팔찌 길이"
                options={BRACELET_LENGTH_OPTIONS}
                value={braceletLength}
                onChange={setBraceletLength}
              />
            )}
            {lengthRequirements.necklace && (
              <LengthOptionGroup
                label="목걸이 길이"
                options={NECKLACE_LENGTH_OPTIONS}
                value={necklaceLength}
                onChange={setNecklaceLength}
              />
            )}
            <p>착용하실 분에게 맞는 길이를 선택해 주세요.</p>
          </section>
        )}

        <ShopSelectionTrigger
          label="디자인"
          prompt={product && designs.length === 0 ? "선택 가능한 디자인이 없습니다" : "디자인을 선택해 주세요"}
          selectedOption={displayDesign}
          image={displayDesign ? designPickerImage(displayDesign) : "/assets/shop-icons/design-placeholder-animals.png"}
          onClick={openDesignSelection}
          type="design"
          disabled={Boolean(product && designs.length === 0)}
        />
      </div>

      <div className="shop-field">
        <label htmlFor="shop-quantity">수량</label>
        <div className="quantity-control">
          <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="수량 감소" disabled={!selectionReady || quantity <= 1}>−</button>
          <input id="shop-quantity" value={quantity} readOnly aria-readonly="true" />
          <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="수량 증가" disabled={!selectionReady}>+</button>
        </div>
      </div>

      <div className="standalone-info-panel">
        <div className="shop-summary-list">
          <span>상품 금액</span>
          <strong>{selectionReady ? formatCurrency(productUnitPrice) : "−"}</strong>
          <span>상품 수량</span>
          <strong>{quantity}개</strong>
          <span>결제예정금액</span>
          <strong>{selectionReady ? formatCurrency(productAmount) : "−"}</strong>
        </div>
      </div>
    </>
  );
}

function LengthOptionGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="shop-length-group">
      <legend>{label}</legend>
      <div className="shop-length-options">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              className={selected ? "selected" : ""}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              key={option.value}
            >
              <span>{option.label}</span>
              <strong>{option.measurement}</strong>
              {selected && <b aria-hidden="true">✓</b>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ShopSelectionTrigger({ label, prompt, selectedOption, image, onClick, type, disabled = false }) {
  return (
    <div className="shop-field">
      <label>{label}</label>
      <button
        className={`shop-image-picker-trigger ${type} ${selectedOption ? "selected" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="shop-image-picker-thumb" aria-hidden="true">
          <img src={image} alt="" />
        </span>
        <strong>{selectedOption?.name || prompt}</strong>
        <b className="shop-image-picker-chevron" aria-hidden="true">›</b>
      </button>
    </div>
  );
}

function CatalogSelectionView({ type, options, selectedId, onSelect, onConfirm }) {
  const isProduct = type === "product";
  return (
    <section className={`shop-catalog-selection-view ${type}`} aria-label={isProduct ? "상품 선택 목록" : "디자인 선택 목록"}>
      <div className="shop-choice-grid" role="listbox">
        {options.map((option) => {
          const selected = option.id === selectedId;
          const image = isProduct ? productPickerImage(option) : designPickerImage(option);
          return (
            <button
              className={selected ? "selected" : ""}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={`${option.name} 선택`}
              onClick={() => onSelect(option.id)}
              key={option.id}
            >
              <span className="shop-choice-image">
                {image ? <img src={image} alt="" /> : <b>{productFallbackIcon(option.slug)}</b>}
              </span>
              <strong>{option.name}</strong>
              {isProduct && <em>{formatCurrency(option.unit_price)}</em>}
              {selected && <span className="shop-choice-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
      <button className="shop-choice-confirm" type="button" onClick={onConfirm} disabled={!selectedId}>선택 완료</button>
    </section>
  );
}

function OrderInformation({
  product,
  design,
  braceletLength,
  necklaceLength,
  quantity,
  subject,
  recipientName,
  setRecipientName,
  recipientPhone,
  setRecipientPhone,
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
  registerCoupon,
  widgetStatus,
  paymentPreview,
  subtotalAmount,
  discountAmount,
  shippingFee,
  shippingSettings,
  amount,
}) {
  return (
    <div className="order-info-stack">
      <section className="order-section">
        <h2>1. 구매 상품</h2>
        <div className="order-purchase-card">
          <div className="order-purchase-subject">
            <span>대상자</span>
            <strong>{subject?.name || "대상자 미선택"}</strong>
          </div>
          <div className="order-purchase-details">
            <strong>{formatProductDesignName(product, design)}</strong>
            <span>{quantity}개</span>
            <em>{formatCurrency(subtotalAmount)}</em>
            {(braceletLength || necklaceLength) && (
              <small>{[braceletLength, necklaceLength].filter(Boolean).join(" / ")}</small>
            )}
          </div>
        </div>
      </section>

      <section className="order-section">
        <h2>2. 배송지 선택</h2>
        <div className="shipping-address-box">
          <label className="checkout-shipping-field">
            <span>수령인</span>
            <input
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="받으실 분의 이름을 입력해 주세요"
              autoComplete="name"
              maxLength={40}
            />
          </label>
          <label className="checkout-shipping-field">
            <span>연락처</span>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(event) => setRecipientPhone(formatMobilePhoneInput(event.target.value))}
              placeholder="000-0000-0000"
              autoComplete="tel"
              inputMode="tel"
              maxLength={13}
            />
          </label>
          <KakaoPostcodeAddress
            defaultValue={shippingAddress}
            defaultDetailValue={shippingAddressDetail}
            addressName="shippingAddress"
            detailName="shippingAddressDetail"
            addressLabel="배송지"
            detailLabel="상세 주소"
            detailPlaceholder="상세 주소를 입력해 주세요"
            addressReadOnly
            onAddressChange={setShippingAddress}
            onDetailChange={setShippingAddressDetail}
          />
        </div>
      </section>

      <section className="order-section">
        <h2>3. 쿠폰 선택</h2>
        <div className="coupon-select-box">
          <CheckoutCouponRegistration onRegister={registerCoupon} />
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
              <BackButton onClick={closeCouponPicker} label="결제 화면으로 돌아가기" />
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
          <strong>{shippingFee > 0 ? formatCurrency(shippingFee) : "무료"}</strong>
          <span>총 결제 금액</span>
          <strong>{formatCurrency(amount)}</strong>
        </div>
        {shippingSettings.freeShippingThreshold > 0 && (
          <p className="shop-free-shipping-note">
            {formatCompactCurrency(shippingSettings.freeShippingThreshold)} 이상 구매 시 무료배송
          </p>
        )}
      </section>

      <section className="order-section payment-method-section">
        <h2>5. 결제 방법</h2>
        {amount <= 0 ? (
          <div className="free-payment-box">
            <strong>쿠폰 전액 할인</strong>
            <span>결제수단 입력 없이 주문을 완료합니다.</span>
          </div>
        ) : paymentPreview ? (
          <div className="payment-method-preview" aria-label="결제수단 미리보기">
            <strong>결제 방법</strong>
            <div className="payment-method-preview-options" role="radiogroup" aria-label="결제 방법">
              <button className="selected" type="button" role="radio" aria-checked="true">
                신용·<br />체크카드
              </button>
              <button type="button" role="radio" aria-checked="false">
                <span>적립 혜택</span>
                <b><i>N</i> pay</b>
              </button>
            </div>
            <div className="payment-card-preview">
              <label htmlFor="preview-card-company">카드사</label>
              <select id="preview-card-company" defaultValue="">
                <option value="" disabled>카드사 선택</option>
              </select>
            </div>
            <p><strong>삼성 앱카드</strong> · 6만원 이상 결제 시 1,000원 즉시할인</p>
            <a href="#payment-benefits">신용카드 무이자 할부 안내 <span aria-hidden="true">›</span></a>
            <small>* 혜택은 조기 종료될 수 있어요. 결제 전 금액을 꼭 확인해주세요.</small>
            <label className="payment-agreement-preview">
              <input type="checkbox" />
              <span>[필수] 결제 서비스 이용 약관, 개인정보 처리 동의</span>
              <b aria-hidden="true">›</b>
            </label>
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

function CheckoutCouponRegistration({ onRegister }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      await onRegister(code);
      setCode("");
      setMessage("쿠폰이 등록되어 이번 주문에 적용되었습니다.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "유효한 쿠폰코드가 아닙니다");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`checkout-coupon-register ${messageType}`} onSubmit={submit}>
      <div>
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setMessage("");
            setMessageType("");
          }}
          placeholder="쿠폰 코드를 입력해 주세요"
          aria-label="쿠폰 코드"
          maxLength={40}
        />
        <button type="submit" disabled={loading || !code.trim()}>{loading ? "등록 중" : "등록"}</button>
      </div>
      <small>등록한 쿠폰은 이번 주문에 바로 사용할 수 있어요</small>
      {message && <p role={messageType === "error" ? "alert" : "status"}>{message}</p>}
    </form>
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

function getDesignUnitPrice(product, design = null) {
  if (design && design.unit_price !== null && design.unit_price !== undefined && design.unit_price !== "") {
    return Number(design.unit_price || 0);
  }
  return Number(product?.unit_price || 0);
}

function formatProductDesignName(product, design = null) {
  return design?.name ? `${product.name} - ${design.name}` : product.name;
}

function productImageUrl(product) {
  const version = encodeURIComponent(String(product?.updated_at || ""));
  return `/api/products/${encodeURIComponent(product.id)}/image?v=${version}`;
}

function productDesignImageUrl(design) {
  const version = encodeURIComponent(String(design?.updated_at || ""));
  return `/api/products/designs/${encodeURIComponent(design.id)}/image?v=${version}`;
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
  if (Number(product?.has_image || 0) === 1) return productImageUrl(product);
  return PRODUCT_PICKER_IMAGES[String(product?.slug || "").trim()] || "";
}

function designPickerImage(design) {
  if (Number(design?.has_option_image || 0) === 1) return productDesignImageUrl(design);
  const catalogIndex = Number(String(design?.id || "").match(/^design-catalog-zodiac-(\d+)$/)?.[1] || 0) - 1;
  const catalogName = ZODIAC_DESIGN_ORDER[catalogIndex];
  return ZODIAC_PICKER_IMAGES[catalogName] || ZODIAC_PICKER_IMAGES[String(design?.name || "").trim()] || "";
}

function clearTossWidgetContainers() {
  if (typeof document === "undefined") return;
  document.getElementById("toss-payment-methods")?.replaceChildren();
  document.getElementById("toss-payment-agreement")?.replaceChildren();
}

function getShopDesigns(product) {
  return [...(product?.designs || [])]
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getUniversalShopDesigns(products) {
  const designsById = new Map();
  for (const product of products) {
    for (const design of getShopDesigns(product)) {
      if (!designsById.has(design.id)) designsById.set(design.id, design);
    }
  }
  return [...designsById.values()].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getProductLengthRequirements(product) {
  const productName = String(product?.name || "").trim();
  const hasKoreanProductType = ["팔찌", "목걸이", "키링"].some((type) => productName.includes(type));
  const descriptor = (hasKoreanProductType ? productName : String(product?.slug || "")).toLowerCase();
  return {
    bracelet: descriptor.includes("bracelet") || descriptor.includes("팔찌"),
    necklace: descriptor.includes("necklace") || descriptor.includes("목걸이"),
  };
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

function formatCompactCurrency(value) {
  const amount = Math.max(0, Number(value || 0));
  if (amount > 0 && amount % 10000 === 0) return `${amount / 10000}만원`;
  return formatCurrency(amount);
}

function formatMobilePhoneInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatDate(value) {
  return formatDateOnly(value, "생년월일 미입력");
}
