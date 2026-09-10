"use client";

import { useEffect, useState } from "react";

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
            <img
              className="subject-status-guide-reference"
              src="/assets/dashboard/subject-status-guide.png"
              alt="상품 구매 필요: 대상자 등록 후 아직 제자리 QR 상품을 구매하지 않은 상태. 안전: 상품 구매 후 실종 신고를 하지 않은 상태. 찾는 중: 온라인 실종 신고가 진행 중인 상태."
            />
            <button className="subject-status-guide-confirm" type="button" onClick={() => setOpen(false)}>
              확인
            </button>
          </section>
        </div>
      )}
    </>
  );
}
