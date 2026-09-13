"use client";

import { useEffect, useState } from "react";

export default function EmergencyCallButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button className="finder-emergency-action" type="button" onClick={() => setOpen(true)}>
        <img src="/assets/finder/emergency-call.png" alt="" />
        <span><strong>112 신고</strong><small>관할기관에<br />신고합니다</small></span>
      </button>
      {open && (
        <div className="location-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="location-dialog finder-emergency-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finder-emergency-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <img src="/assets/finder/emergency-call.png" alt="" />
            <h2 id="finder-emergency-title">112에 전화할까요?</h2>
            <p>전화하기를 누르면 기기의 전화 기능으로<br />112에 연결됩니다.</p>
            <div>
              <button type="button" onClick={() => setOpen(false)}>취소</button>
              <a href="tel:112">전화하기</a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
