"use client";

import { useRouter } from "next/navigation";
import BackButton from "../../back-button";

export default function ShopServiceControls({ mode }) {
  const router = useRouter();
  if (mode === "back") {
    return (
      <BackButton className="shop-service-back" onClick={() => router.back()} label="이전 상품 구매 화면으로 돌아가기" />
    );
  }
  return (
    <button className="shop-service-top-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="페이지 맨 위로 이동">↑</button>
  );
}
