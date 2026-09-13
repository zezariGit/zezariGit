"use client";

import { useMemo, useState } from "react";

const PREVIEW_LOCATION = { latitude: 37.5665, longitude: 126.978, accuracy: 18, addressLabel: "서울특별시 중구 세종대로 110", checkedAt: "2026-09-13T14:30:00+09:00" };

export default function LocationShareButton({ qrKey, subjectName = "김제자리", subjectPhoto = "", initialStep = "idle", preview = false }) {
  const [step, setStep] = useState(initialStep);
  const [location, setLocation] = useState(preview ? PREVIEW_LOCATION : null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const closeFlow = () => { setError(""); setStep("idle"); };
  const requestPermission = async () => {
    setError("");
    if (preview) { setLocation(PREVIEW_LOCATION); setStep("confirm"); return; }
    if (!navigator.geolocation) { setStep("location-error"); return; }
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        checkedAt: new Date().toISOString(),
        addressLabel: await reverseGeocode(position.coords.latitude, position.coords.longitude),
      });
      setStep("confirm");
    } catch (requestError) {
      setError(locationErrorMessage(requestError));
      setStep(requestError?.code === 1 ? "permission-denied" : "location-error");
    } finally { setBusy(false); }
  };

  const sendLocation = async () => {
    if (!location) return;
    if (preview) { setStep("complete"); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/find/${encodeURIComponent(qrKey)}/location`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...location, consent: true, consentVersion: "2026-08-09" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "위치를 보호자에게 전달하지 못했습니다.");
      setStep("complete");
    } catch (sendError) { setError(sendError.message || "위치를 보호자에게 전달하지 못했습니다."); }
    finally { setBusy(false); }
  };

  if (step === "idle") return (
    <button className="find-location-action" type="button" onClick={() => setStep("intro")}>
      <img src="/assets/location-share/map-location.png" alt="" />
      <span><strong>위치 공유</strong><small>보호자에게 현재 위치를 공유해요</small></span>
    </button>
  );

  return (
    <section className="location-flow" aria-label="위치 공유">
      <LocationHeader title={stepTitle(step)} onBack={step === "complete" ? null : step === "intro" ? closeFlow : () => setStep(step === "confirm" ? "permission" : "intro")} />
      {step === "intro" && <IntroScreen onAgree={() => setStep("permission")} onCancel={closeFlow} />}
      {step === "permission" && <PermissionScreen busy={busy} onAllow={requestPermission} />}
      {step === "confirm" && location && <ConfirmScreen subjectName={subjectName} subjectPhoto={subjectPhoto} location={location} busy={busy} error={error} onShare={sendLocation} />}
      {step === "complete" && <CompleteScreen onReturn={closeFlow} />}
      {step === "permission-denied" && <PermissionDeniedScreen message={error} onRetry={() => setStep("permission")} onReturn={closeFlow} />}
      {step === "location-error" && <LocationErrorScreen message={error} onRetry={() => setStep("permission")} onReturn={closeFlow} />}
    </section>
  );
}

function LocationHeader({ title, onBack }) {
  return <header className="location-flow-header">{onBack ? <button type="button" onClick={onBack} aria-label="뒤로가기">‹</button> : <span />}<h1>{title}</h1><span /></header>;
}

function IntroScreen({ onAgree, onCancel }) {
  return <div className="location-flow-body location-intro">
    <img className="location-hero-icon" src="/assets/location-share/location-pin.png" alt="" />
    <FlowTitle title="현재 위치를 보호자에게 공유할까요?" text="위치 공유 전 아래 내용을 확인해 주세요." />
    <img className="location-reference-panel intro-reference-panel" src="/assets/location-share/intro-information-reference.png" alt="발견자의 현재 위치와 지도 링크, 공유 시간이 보호자에게 전달됩니다. 위치는 한 번만 전송되며 지속적으로 추적되지 않습니다. 발견자의 이름과 전화번호는 수집하지 않습니다. 위치정보는 보호자 확인을 위한 목적으로만 사용됩니다." />
    <div className="location-flow-actions"><button className="location-primary-button" type="button" onClick={onAgree}>위치 공유 동의하기</button><button className="location-text-button" type="button" onClick={onCancel}>취소</button></div>
  </div>;
}

function PermissionScreen({ busy, onAllow }) {
  return <div className="location-flow-body location-permission">
    <img className="location-reference-panel permission-reference-panel" src="/assets/location-share/permission-guide-reference.png" alt="위치 권한이 허용되지 않았습니다. 기기 설정에서 제자리를 선택하고 위치 권한을 한 번만 허용으로 설정해 주세요. 위치는 한 번만 확인되며 지속적으로 추적되지 않습니다." />
    <button className="location-primary-button" type="button" onClick={onAllow} disabled={busy}>{busy ? "현재 위치 확인 중" : "다시 시도하기"}</button>
  </div>;
}

function ConfirmScreen({ subjectName, subjectPhoto, location, busy, error, onShare }) {
  return <div className="location-flow-body location-confirm">
    <SubjectStrip name={subjectName} photo={subjectPhoto} subtitle="보호자에게 공유할 위치" />
    <LocationMap location={location} />
    <section className="location-detail-card location-current-card">
      <div className="location-current-address"><span><strong>현재 위치</strong><small>{location.addressLabel}</small></span></div>
      <dl><div><dt>확인 시간</dt><dd>{formatKoreanDateTime(location.checkedAt)}</dd></div></dl>
      <p className="location-delivery-copy">보호자에게 현재 위치와 지도 링크가 전달됩니다.</p>
    </section>
    <p className="location-static-note">현재 위치가 정확한지 확인해 주세요.</p>
    {error && <p className="location-error-message" role="alert">{error} 다시 시도해 주세요.</p>}
    <button className="location-primary-button location-share-submit" type="button" onClick={onShare} disabled={busy}>{!busy && <img src="/assets/location-share/open-map.png" alt="" />}{busy ? "보호자에게 전달 중" : "이 위치 공유하기"}</button>
  </div>;
}

function CompleteScreen({ onReturn }) {
  return <div className="location-flow-body location-complete"><img className="location-reference-panel complete-reference-panel" src="/assets/location-share/share-complete-reference.png" alt="위치가 보호자에게 전달되었습니다. 제자리 앱 알림으로 현재 위치를 전달했습니다. 현재 위치는 한 번만 전송되었으며 지속적으로 추적되지 않습니다." /><button className="location-primary-button" type="button" onClick={onReturn}>대상자 정보로 돌아가기</button></div>;
}

function PermissionDeniedScreen({ message, onRetry, onReturn }) {
  return <div className="location-flow-body location-failure"><img className="location-reference-panel failure-reference-panel" src="/assets/location-share/permission-denied-reference.png" alt={message || "위치 권한이 허용되지 않았습니다. 기기 설정에서 제자리의 위치 권한을 한 번만 허용으로 설정해 주세요."} /><FailureActions onRetry={onRetry} onReturn={onReturn} /></div>;
}

function LocationErrorScreen({ message, onRetry, onReturn }) {
  return <div className="location-flow-body location-failure"><img className="location-reference-panel failure-reference-panel" src="/assets/location-share/location-error-reference.png" alt={message || "현재 위치를 확인할 수 없습니다. GPS와 네트워크 상태를 확인한 후 다시 시도해 주세요."} /><FailureActions onRetry={onRetry} onReturn={onReturn} /></div>;
}

function FailureActions({ onRetry, onReturn }) { return <div className="location-flow-actions"><button className="location-primary-button" type="button" onClick={onRetry}>다시 시도</button><button className="location-secondary-button" type="button" onClick={onReturn}>대상자 정보로 돌아가기</button></div>; }
function FlowTitle({ title, text }) { return <div className="location-flow-title"><h2>{title}</h2><p>{text}</p></div>; }
function InfoRow({ icon, title, text }) { return <div className="location-info-row"><img src={`/assets/location-share/${icon}`} alt="" /><span><strong>{title}</strong><small>{text}</small></span></div>; }
function SecurityNote({ children }) { return <p className="location-security-note"><img src="/assets/location-share/security.png" alt="" /><span>{children}</span></p>; }
function SubjectStrip({ name, photo, subtitle }) { return <div className="location-subject-strip"><span className="location-subject-photo">{photo ? <img src={photo} alt={`${name} 사진`} /> : <i />}</span><span><strong>{name}</strong>{subtitle && <small className="location-subject-subtitle">{subtitle}</small>}</span></div>; }

export function LocationMap({ location }) {
  const src = useMemo(() => buildMapEmbedUrl(location.latitude, location.longitude), [location.latitude, location.longitude]);
  return <div className="location-map-frame"><iframe title="공유 위치 지도" src={src} loading="lazy" referrerPolicy="no-referrer" /><span className="location-map-marker"><img src="/assets/location-share/location-pin.png" alt="현재 위치" /></span></div>;
}

function buildMapEmbedUrl(latitude, longitude) { const lat = Number(latitude); const lng = Number(longitude); const delta = 0.006; const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(","); return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`; }
async function reverseGeocode(latitude, longitude) { try { const response = await fetch(`/api/maps/search?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`, { cache: "no-store" }); const data = await response.json().catch(() => ({})); if (response.ok && data?.result?.address) return data.result.address; if (response.ok && data?.result?.label) return data.result.label; } catch {} return `위도 ${Number(latitude).toFixed(5)}, 경도 ${Number(longitude).toFixed(5)}`; }
function getCurrentPosition() { return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })); }
function locationErrorMessage(error) { if (error?.code === 1) return "현재 사이트의 위치 권한이 거부되었습니다."; if (error?.code === 2) return "GPS 또는 네트워크에서 현재 위치를 확인하지 못했습니다."; if (error?.code === 3) return "위치 확인 시간이 초과되었습니다."; return error?.message || "현재 위치를 확인하지 못했습니다."; }
function stepTitle(step) { if (step === "intro") return "위치 공유 안내"; if (step === "permission") return "위치 권한 안내"; if (step === "confirm") return "위치 확인"; if (step === "complete") return "위치 공유 완료"; if (step === "permission-denied") return "위치 권한 안내"; return "위치 확인 오류"; }
function formatKoreanDateTime(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return "-"; return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date); }
