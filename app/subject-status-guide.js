"use client";

import { useEffect, useState } from "react";

const STATUS_ITEMS = [
  {
    className: "purchase-needed",
    label: "상품 구매 필요",
    description: "대상자 등록 후 아직 제자리 QR 상품을 구매하지 않은 상태",
  },
  {
    className: "safe",
    label: "안전",
    description: "상품 구매 후 실종 신고를 하지 않은 상태",
  },
  {
    className: "searching",
    label: "찾는 중",
    description: "온라인 실종 신고가 진행 중인 상태",
  },
];

export default function SubjectStatusGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        className="subject-status-guide-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="대상자 상태 안내"
        aria-expanded={open}
      >
        <img src="/assets/dashboard/status-help.png" alt="" />
      </button>

      {open && (
        <div className="subject-status-guide-overlay" role="presentation" onPointerDown={() => setOpen(false)}>
          <section
            className="subject-status-guide-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-status-guide-title"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span className="subject-status-guide-handle" aria-hidden="true" />
            <h2 id="subject-status-guide-title">대상자 현재 상태 안내</h2>
            <div className="subject-status-guide-list">
              {STATUS_ITEMS.map((item) => (
                <div className="subject-status-guide-row" key={item.label}>
                  <span className={`status-badge ${item.className}`}>{item.label}</span>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <button className="subject-status-guide-confirm" type="button" onClick={() => setOpen(false)}>
              확인
            </button>
          </section>
        </div>
      )}
    </>
  );
}
