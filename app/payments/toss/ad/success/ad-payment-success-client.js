"use client";

import { useEffect, useRef, useState } from "react";

export default function AdPaymentSuccessClient({
  isAdmin = false,
  publicationMessage = "",
}) {
  const [policeModalOpen, setPoliceModalOpen] = useState(false);
  const callStartedAtRef = useRef(0);

  useEffect(() => {
    const moveToAdDashboardAfterCall = () => {
      if (!callStartedAtRef.current || Date.now() - callStartedAtRef.current < 800) return;
      callStartedAtRef.current = 0;
      window.location.href = "/account/ads";
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") moveToAdDashboardAfterCall();
    };

    window.addEventListener("focus", moveToAdDashboardAfterCall);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", moveToAdDashboardAfterCall);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!policeModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPoliceModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [policeModalOpen]);

  function startPoliceCall() {
    callStartedAtRef.current = Date.now();
    setPoliceModalOpen(false);
  }

  return (
    <main className="payment-result-page ad-payment-success-page">
      <section className="payment-result-panel ad-payment-success-panel">
        <h1>광고 결제 완료</h1>
        <img className="ad-payment-success-icon" src="/assets/ad-payment/payment-complete.png" alt="" />
        <h2>광고 결제가 완료되었습니다.</h2>
        <p className="ad-payment-review-copy">
          광고는 META 광고 검토가<br />완료된 후 게재됩니다.
        </p>
        <p className="ad-payment-review-badge">광고 검토 중 · META 검토 대기</p>

        {isAdmin && publicationMessage && (
          <p className="ad-complete-publication-note">{publicationMessage}</p>
        )}

        <section className="police-report-prompt-section" aria-label="경찰 신고 연계 안내">
          <h2>경찰 신고도 함께 진행하시겠어요?</h2>
          <p className="police-report-prompt-sub">경찰 신고가 필요한 경우 112로 연결해 드립니다.</p>
          <div className="police-report-prompt-buttons">
            <button type="button" className="police-report-btn-yes" onClick={() => setPoliceModalOpen(true)}>예</button>
            <a href="/account/ads" className="police-report-btn-no">아니요</a>
          </div>
        </section>
      </section>

      {policeModalOpen && (
        <div className="police-call-modal-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && setPoliceModalOpen(false)}>
          <section className="police-call-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="police-call-modal-title">
            <img className="police-call-modal-icon" src="/assets/ad-payment/call-112.png" alt="" />
            <h2 id="police-call-modal-title">112로 전화할까요?</h2>
            <p>경찰 신고를 위해 112로 연결합니다.</p>
            <div className="police-call-modal-actions">
              <button type="button" className="police-call-modal-cancel" onClick={() => setPoliceModalOpen(false)}>취소</button>
              <a href="tel:112" className="police-call-modal-confirm" onClick={startPoliceCall}>전화하기</a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
