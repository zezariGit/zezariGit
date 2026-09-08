"use client";

import { useState } from "react";
import Link from "next/link";
import FormSubmitButton from "../../form-submit-button";

export default function AdHistoryActions({ ad, action, preview = false }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="ad-history-actions">
        <Link href={`/?tab=dashboard&adSubject=${encodeURIComponent(ad.subject_id)}&newAd=1`}>추가</Link>
        <button type="button" onClick={() => setConfirming(true)}>종료</button>
      </div>
      {confirming && (
        <div className="ad-end-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) setConfirming(false); }}>
          <section className="ad-end-dialog" role="dialog" aria-modal="true" aria-labelledby={`ad-end-title-${ad.id}`}>
            <span className="ad-end-alert" aria-hidden="true">!</span>
            <h2 id={`ad-end-title-${ad.id}`}>광고를 종료할까요?</h2>
            <p>종료하면 광고 게재가 즉시 중단됩니다.</p>
            <strong>이미 집행된 광고 비용은 환불되지 않습니다.</strong>
            <div>
              <button type="button" onClick={() => setConfirming(false)}>취소</button>
              <form action={action} onSubmit={preview ? (event) => event.preventDefault() : undefined}>
                <input type="hidden" name="adId" value={ad.id} />
                <input type="hidden" name="returnTo" value="/account/ads" />
                <FormSubmitButton className="ad-end-confirm" pendingText="종료 중">광고 종료</FormSubmitButton>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
