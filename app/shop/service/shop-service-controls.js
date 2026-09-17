"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../../back-button";

export default function ShopServiceControls({ mode, backHref = "" }) {
  if (mode === "back") {
    return <ShopServiceBackButton backHref={backHref} />;
  }

  return <ShopServiceTopButton />;
}

function ShopServiceBackButton({ backHref }) {
  const router = useRouter();

  return (
    <BackButton
      className="shop-service-back"
      onClick={() => backHref ? router.replace(backHref) : router.back()}
      label={backHref ? "설정으로 돌아가기" : "이전 상품 구매 화면으로 돌아가기"}
    />
  );
}

function ShopServiceTopButton() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("shop-service-top");
    if (!scrollContainer) return undefined;
    const updateVisibility = () => setVisible(scrollContainer.scrollTop >= scrollContainer.clientHeight);
    updateVisibility();
    scrollContainer.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      scrollContainer.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible || !buttonRef.current) return;
    document.querySelectorAll(".shop-service-top-button").forEach((button) => {
      if (button !== buttonRef.current) button.hidden = true;
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <button
      ref={buttonRef}
      className="shop-service-top-button"
      data-shop-service-top-button="primary"
      type="button"
      onClick={() => document.getElementById("shop-service-top")?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="페이지 맨 위로 이동"
    >
      ↑
    </button>
  );
}
