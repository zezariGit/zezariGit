"use client";

import { useRouter } from "next/navigation";

export default function ShopServiceControls({ mode }) {
  const router = useRouter();
  if (mode === "back") {
    return (
      <button className="shop-service-back" type="button" onClick={() => router.back()} aria-label="이전 상품 구매 화면으로 돌아가기">‹</button>
    );
  }
  return (
    <button className="shop-service-top-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="페이지 맨 위로 이동">↑</button>
  );
}
