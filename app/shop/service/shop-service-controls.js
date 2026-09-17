"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY >= window.innerHeight);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      className="shop-service-top-button"
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="페이지 맨 위로 이동"
    >
      ↑
    </button>
  );
}
