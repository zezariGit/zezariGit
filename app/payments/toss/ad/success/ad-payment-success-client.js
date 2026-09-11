"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdPaymentSuccessClient({
  isAdmin = false,
  publicationMessage = "",
}) {
  const [policeModalOpen, setPoliceModalOpen] = useState(false);

  useEffect(() => {
    if (!policeModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPoliceModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [policeModalOpen]);

  return (
    <main className="payment-result-page ad-payment-success-page">
      <section className="payment-result-panel ad-payment-success-panel">
        <div className="ad-complete-hero">
          <img
            src="/assets/ads/ad-payment-complete.png"
            alt="광고 결제 완료. 광고 결제가 완료되었습니다. 광고는 Meta에서 광고 검토가 완료된 후 게재됩니다."
            className="ad-complete-hero-img"
          />
        </div>

        {isAdmin && publicationMessage && (
          <p className="ad-complete-publication-note">{publicationMessage}</p>
        )}

        <section className="police-report-prompt-section" aria-label="경찰 신고 연계 안내">
          <button
            type="button"
            className="police-report-prompt-link"
            onClick={() => setPoliceModalOpen(true)}
          >
            경찰 신고도 함께 진행하시겠어요?
          </button>
          <p className="police-report-prompt-sub">
            경찰 신고가 필요한 경우 112로 연결해 드립니다.
          </p>
          <div className="police-report-prompt-buttons">
            <button
              type="button"
              className="police-report-btn-yes"
              onClick={() => setPoliceModalOpen(true)}
            >
              예
            </button>
            <Link
              href="/account/ads"
              className="police-report-btn-no"
            >
              아니오
            </Link>
          </div>
        </section>
      </section>

      {policeModalOpen && (
        <div
          className="police-call-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPoliceModalOpen(false);
          }}
        >
          <section
            className="police-call-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="police-call-modal-title"
          >
            <div className="police-call-modal-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="police-call-modal-phone-icon">
                <path d="M7.2 3.5 10 7.7 8.2 9.5c1.2 2.5 3.3 4.6 5.8 5.8l1.8-1.8 4.2 2.8-.8 3.4c-.2.8-.9 1.3-1.7 1.3C9.5 20.4 3.6 14.5 3 6.5c-.1-.8.5-1.5 1.3-1.7l2.9-.7Z" />
              </svg>
            </div>
            <h2 id="police-call-modal-title">112로 전화할까요?</h2>
            <p>경찰 신고를 위해 112로 연결합니다.</p>
            <div className="police-call-modal-actions">
              <button
                type="button"
                className="police-call-modal-cancel"
                onClick={() => setPoliceModalOpen(false)}
              >
                취소
              </button>
              <a
                href="tel:112"
                className="police-call-modal-confirm"
                onClick={() => setPoliceModalOpen(false)}
              >
                전화하기
              </a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
