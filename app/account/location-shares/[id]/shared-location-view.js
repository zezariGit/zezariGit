"use client";

import { useState } from "react";
import { LocationMap } from "../../../find/[key]/location-share-button";

export default function SharedLocationView({ share }) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const available = !share.destroyed_at && Number.isFinite(Number(share.latitude)) && Number.isFinite(Number(share.longitude));

  return (
    <main className="guardian-location-page">
      <section className="guardian-location-shell">
        <header className="location-flow-header">
          <button type="button" onClick={() => window.history.back()} aria-label="뒤로가기">‹</button>
          <h1>공유된 위치 확인</h1><span />
        </header>
        <div className="guardian-location-body">
          <div className="location-subject-strip guardian-location-subject">
            <span className="location-subject-photo">{share.subject_photo_url ? <img src={share.subject_photo_url} alt={`${share.subject_name} 사진`} /> : <i />}</span>
            <span><strong>{share.subject_name}</strong><small className="location-subject-subtitle">발견자가 위치를 공유했습니다.</small></span>
            <img src="/assets/location-share/confirmed.png" alt="위치 수신 완료" />
          </div>
          {available ? <LocationMap location={share} /> : <div className="guardian-location-unavailable">보존기간이 지나 위치정보가 파기되었습니다.</div>}
          <section className="location-detail-card location-current-card guardian-location-detail">
            <div className="location-current-address"><span><strong>공유된 위치</strong><small>{share.address_label}</small></span></div>
            <dl><div><dt>공유 시간</dt><dd>{formatKoreanDateTime(share.created_at)}</dd></div></dl>
            <p className="location-delivery-copy">발견자가 공유한 시점의 위치입니다.<br />실시간 위치가 아니며 지속적으로 갱신되지 않습니다.</p>
          </section>
          <p className="guardian-location-note">실제 위치와 약간의 오차가 있을 수 있습니다.</p>
          <div className="guardian-location-actions">
            <a className={`location-primary-button${available ? "" : " disabled"}`} href={available ? share.kakao_map_url : undefined} target="_blank" rel="noreferrer" aria-disabled={!available}><img src="/assets/location-share/open-map.png" alt="" />지도 앱에서 보기</a>
            <button className="guardian-emergency-button" type="button" onClick={() => setEmergencyOpen(true)}><img src="/assets/location-share/emergency.png" alt="" />112 신고</button>
          </div>
        </div>
      </section>
      {emergencyOpen && <EmergencyDialog onClose={() => setEmergencyOpen(false)} />}
    </main>
  );
}

function EmergencyDialog({ onClose }) {
  return <div className="location-dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="location-dialog" role="dialog" aria-modal="true" aria-labelledby="location-emergency-title" onMouseDown={(event) => event.stopPropagation()}><img src="/assets/location-share/emergency.png" alt="" /><h2 id="location-emergency-title">112에 전화할까요?</h2><p>전화하기를 누르면 기기의 전화 기능으로<br />112에 연결됩니다.</p><div><button type="button" onClick={onClose}>취소</button><a href="tel:112">전화하기</a></div></section></div>;
}

function formatKoreanDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}
