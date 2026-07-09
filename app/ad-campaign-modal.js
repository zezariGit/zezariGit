"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormSubmitButton from "./form-submit-button";
import ModalScrollLock from "./modal-scroll-lock";

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const DEFAULT_LOCATION = {
  lat: 37.5665,
  lng: 126.978,
  label: "서울 중구 일대",
};
const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const statusLabels = {
  active: "광고중",
  paused: "일시정지",
  ready: "준비중",
  ended: "종료",
};

export default function AdCampaignModal({
  subject,
  dailyRate,
  createAction,
  pauseAction,
  resumeAction,
  endAction,
}) {
  const today = useMemo(() => getDateInputValue(new Date()), []);
  const initialLocation = useMemo(() => getInitialLocation(subject), [subject]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [location, setLocation] = useState(initialLocation);
  const [radiusKm, setRadiusKm] = useState(Number(subject?.ad_region_radius_km || 3));
  const [mapReady, setMapReady] = useState(false);
  const [mapMessage, setMapMessage] = useState("지도를 불러오고 있습니다.");
  const [step, setStep] = useState("setup");
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const quote = calculateQuote(startDate, endDate, dailyRate);
  const activeAd = ["active", "paused", "ready"].includes(subject?.ad_status || "");
  const canPreview = Boolean(location.selected && quote.valid);

  useEffect(() => {
    setLocation(initialLocation);
    setRadiusKm(Number(subject?.ad_region_radius_km || 3));
    setStep("setup");
  }, [initialLocation, subject?.ad_region_radius_km]);

  useEffect(() => {
    if (!subject || activeAd || step !== "setup" || !mapContainerRef.current) return undefined;
    let disposed = false;

    loadLeaflet()
      .then((leaflet) => {
        if (disposed || !mapContainerRef.current || mapRef.current) return;
        const center = location.selected ? [location.lat, location.lng] : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];
        const map = leaflet.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView(center, 12);

        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "&copy; OpenStreetMap contributors",
          })
          .addTo(map);

        map.on("click", (event) => {
          updateLocationFromMap(event.latlng.lat, event.latlng.lng, "지도 선택 위치");
        });

        mapRef.current = map;
        setMapReady(true);
        setMapMessage("지도에서 광고 중심 위치를 눌러 주세요.");
        window.setTimeout(() => map.invalidateSize(), 120);
      })
      .catch(() => {
        if (!disposed) {
          setMapReady(false);
          setMapMessage("지도를 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.");
        }
      });

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      circleRef.current = null;
      setMapReady(false);
    };
  }, [activeAd, step, subject]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = typeof window !== "undefined" ? window.L : null;
    if (!map || !leaflet || !location.selected) return;

    const latLng = [location.lat, location.lng];
    if (!markerRef.current) {
      markerRef.current = leaflet.circleMarker(latLng, {
        radius: 8,
        color: "#2563eb",
        weight: 3,
        fillColor: "#38bdf8",
        fillOpacity: 0.9,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(latLng);
    }

    if (!circleRef.current) {
      circleRef.current = leaflet.circle(latLng, {
        radius: radiusKm * 1000,
        color: "#2563eb",
        weight: 1,
        fillColor: "#60a5fa",
        fillOpacity: 0.16,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(latLng);
      circleRef.current.setRadius(radiusKm * 1000);
    }

    map.setView(latLng, Math.max(map.getZoom(), 12), { animate: true });
  }, [location, radiusKm]);

  if (!subject) return null;

  function updateLocationFromMap(lat, lng, label) {
    const nextLat = Number(lat);
    const nextLng = Number(lng);
    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;

    setLocation({
      selected: true,
      lat: Number(nextLat.toFixed(6)),
      lng: Number(nextLng.toFixed(6)),
      label,
    });
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMapMessage("현재 브라우저에서는 위치 권한을 사용할 수 없습니다.");
      return;
    }

    setMapMessage("현재 위치를 확인하고 있습니다.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationFromMap(position.coords.latitude, position.coords.longitude, "현재 위치 기준");
        setMapMessage("현재 위치가 광고 중심으로 설정되었습니다.");
      },
      () => {
        setMapMessage("위치 권한을 허용하지 않았거나 현재 위치를 확인할 수 없습니다.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  const regionLabel = location.selected
    ? `${location.label} (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`
    : "";

  function showPreview() {
    if (!location.selected) {
      setMapMessage("지도에서 광고 중심 위치를 먼저 선택해 주세요.");
      return;
    }
    if (!quote.valid) return;
    setStep("preview");
  }

  return (
    <section className="modal-backdrop ad-modal-backdrop" aria-label="광고 신청" role="dialog" aria-modal="true">
      <ModalScrollLock />
      <div className="modal-surface ad-modal" data-modal-surface>
        <div className="ad-modal-header">
          <div>
            <p className="intro-kicker">광고</p>
            <h2>{subject.name} 광고 관리</h2>
            <p>지도에서 광고 중심 위치와 반경을 선택하면 Meta 위치 타겟팅용 좌표로 저장됩니다.</p>
          </div>
        </div>

        {activeAd ? (
          <div className="ad-current-panel">
            <div className="ad-current-summary">
              <span className={`ad-status-pill ${subject.ad_status}`}>{statusLabels[subject.ad_status] || "진행중"}</span>
              <strong>{formatCurrency(subject.ad_amount || 0)}</strong>
              <span>
                {formatDate(subject.ad_start_date)} ~ {formatDate(subject.ad_end_date)}
              </span>
              <span>{formatAdLocation(subject)}</span>
              <span>Meta API: {formatMetaStatus(subject.ad_meta_status)}</span>
            </div>
            <div className="ad-state-actions">
              {subject.ad_status === "active" && (
                <form action={pauseAction}>
                  <input type="hidden" name="adId" value={subject.ad_id} />
                  <FormSubmitButton className="activate-button" pendingText="정지중">
                    일시정지
                  </FormSubmitButton>
                </form>
              )}
              {subject.ad_status === "paused" && (
                <form action={resumeAction}>
                  <input type="hidden" name="adId" value={subject.ad_id} />
                  <FormSubmitButton className="activate-button" pendingText="재개중">
                    광고 재개
                  </FormSubmitButton>
                </form>
              )}
              <form action={endAction}>
                <input type="hidden" name="adId" value={subject.ad_id} />
                <FormSubmitButton className="danger-button compact" pendingText="종료중">
                  광고끝내기
                </FormSubmitButton>
              </form>
            </div>
          </div>
        ) : (
          <>
            {step === "setup" ? (
              <div className="ad-request-form">
                <section className="ad-map-field full-field" aria-label="광고지역 지도 선택">
                  <div className="ad-map-toolbar">
                    <div>
                      <strong>광고지역</strong>
                      <span>{mapMessage}</span>
                    </div>
                    <button type="button" className="plain-button compact" onClick={useCurrentLocation}>
                      현재 위치
                    </button>
                  </div>
                  <div className="ad-location-map-wrap">
                    <div className="ad-location-map" ref={mapContainerRef} />
                    {!mapReady && <span className="ad-location-map-placeholder">{mapMessage}</span>}
                  </div>
                  <div className="ad-location-summary">
                    <span>{location.selected ? regionLabel : "선택된 위치가 없습니다."}</span>
                    <label>
                      반경
                      <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))}>
                        {RADIUS_OPTIONS.map((option) => (
                          <option value={option} key={option}>{option}km</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>
                <label>
                  시작일
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                  />
                </label>
                <label>
                  종료일
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                  />
                </label>
                <div className="ad-quote full-field">
                  <span>일 단가 {formatCurrency(dailyRate)}</span>
                  <strong>{quote.valid ? formatCurrency(quote.amount) : "기간을 확인해 주세요"}</strong>
                  <span>{quote.valid ? `${quote.days}일 기준` : "종료일은 시작일 이후여야 합니다."}</span>
                </div>
                <button type="button" className="action full-field" disabled={!canPreview} onClick={showPreview}>
                  확인
                </button>
              </div>
            ) : (
              <form action={createAction} className="ad-request-form ad-preview-form">
                <input type="hidden" name="subjectId" value={subject.id} />
                <input type="hidden" name="region" value={regionLabel} />
                <input type="hidden" name="regionLatitude" value={location.selected ? location.lat : ""} />
                <input type="hidden" name="regionLongitude" value={location.selected ? location.lng : ""} />
                <input type="hidden" name="regionRadiusKm" value={radiusKm} />
                <input type="hidden" name="startDate" value={startDate} />
                <input type="hidden" name="endDate" value={endDate} />
                <MissingAdPreview
                  subject={subject}
                  quote={quote}
                  startDate={startDate}
                  endDate={endDate}
                  regionLabel={regionLabel}
                  radiusKm={radiusKm}
                />
                <div className="ad-preview-actions full-field">
                  <button type="button" className="plain-button" onClick={() => setStep("setup")}>
                    다시 선택
                  </button>
                  <FormSubmitButton className="action" pendingText="결제 준비중" disabled={!canPreview}>
                    결제하기
                  </FormSubmitButton>
                </div>
              </form>
            )}
          </>
        )}
        <div className="modal-footer">
          <a className="plain-button modal-close-button" href="/?tab=dashboard">
            닫기
          </a>
        </div>
      </div>
    </section>
  );
}

function MissingAdPreview({ subject, quote, startDate, endDate, regionLabel, radiusKm }) {
  const photoSrc = subjectPhotoSrc(subject);
  const age = calculateAge(subject?.birth_date);
  const gender = formatGender(subject?.gender);
  const message = String(subject?.guardian_message || "").trim()
    || "보호자가 작성한 메시지가 이 영역에 표시됩니다.";
  const qrTargetUrl = subject?.qr_target_url || "";

  return (
    <section className="ad-preview-step full-field" aria-label="광고 미리보기">
      <div className="ad-preview-heading">
        <div>
          <strong>광고 미리보기</strong>
          <span>결제 후 이 화면 구성을 이미지화해서 Meta 광고 소재로 등록할 수 있도록 준비합니다.</span>
        </div>
        <em>{formatCurrency(quote.amount)}</em>
      </div>

      <article
        className="missing-ad-poster"
        data-ad-creative="missing-person-preview"
        data-subject-id={subject.id}
      >
        <header className="missing-ad-poster-header">
          <strong>실종자를 찾습니다</strong>
          <span>여러분의 작은 제보가 가족을 만날 수 있게 합니다.</span>
        </header>
        <div className="missing-ad-poster-body">
          <div className="missing-ad-photos">
            <div className="missing-ad-main-photo">
              {photoSrc ? <img src={photoSrc} alt={`${subject.name} 사진`} /> : <span aria-hidden="true" />}
            </div>
            <div className="missing-ad-thumb-row" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span key={index}>
                  {photoSrc ? <img src={photoSrc} alt="" /> : null}
                </span>
              ))}
            </div>
          </div>
          <div className="missing-ad-info">
            <dl>
              <div>
                <dt>이름</dt>
                <dd>{subject.name || "-"}</dd>
              </div>
              <div>
                <dt>나이</dt>
                <dd>{age ? `${age}세` : "-"}</dd>
              </div>
              <div>
                <dt>성별</dt>
                <dd>{gender}</dd>
              </div>
            </dl>
            <div className="missing-ad-message">
              <strong>보호자 메시지</strong>
              <p>{message}</p>
            </div>
          </div>
        </div>
        <footer className="missing-ad-poster-footer">
          <div className="missing-ad-contact">
            <strong>QR 안심 서비스</strong>
            <span>QR코드로 관리대상 정보를 확인해 주세요.</span>
          </div>
          <div className="missing-ad-qr">
            {subject?.qr_image ? <img src={subject.qr_image} alt={`${subject.name} QR 코드`} /> : <span>QR</span>}
          </div>
        </footer>
      </article>

      <div className="ad-preview-meta">
        <span>기간: {formatDate(startDate)} ~ {formatDate(endDate)} / {quote.days}일</span>
        <span>지역: {regionLabel} / 반경 {radiusKm}km</span>
        {qrTargetUrl ? (
          <a href={qrTargetUrl} target="_blank" rel="noreferrer">
            관리대상정보 페이지 열기
          </a>
        ) : (
          <span>관리대상정보 링크는 QR 매칭 후 표시됩니다.</span>
        )}
      </div>
    </section>
  );
}

function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject(new Error("Leaflet requires browser."));
  if (window.L) return Promise.resolve(window.L);
  if (window.__zezariLeafletPromise) return window.__zezariLeafletPromise;

  window.__zezariLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.__zezariLeafletPromise;
}

function getInitialLocation(subject) {
  const lat = Number(subject?.ad_region_latitude);
  const lng = Number(subject?.ad_region_longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      selected: true,
      lat,
      lng,
      label: subject?.ad_region || "저장된 광고 위치",
    };
  }

  return {
    selected: false,
    ...DEFAULT_LOCATION,
  };
}

function calculateQuote(startDate, endDate, dailyRate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const rate = Number(dailyRate || 0);
  if (!start || !end || end < start) {
    return { valid: false, days: 0, amount: 0 };
  }

  const days = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return {
    valid: true,
    days,
    amount: days * Math.max(0, Math.floor(rate)),
  };
}

function parseDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}

function formatAdLocation(subject) {
  const radius = Number(subject?.ad_region_radius_km || 0);
  if (subject?.ad_region && radius > 0) return `${subject.ad_region} / 반경 ${radius}km`;
  return subject?.ad_region || "지역 미입력";
}

function formatMetaStatus(status) {
  if (status === "campaign_active") return "캠페인 활성";
  if (status === "campaign_paused") return "캠페인 일시정지";
  if (status === "meta_api_access_blocked") return "Meta 권한 승인 필요";
  if (status === "meta_api_pending") return "연동 대기";
  return status || "연동 대기";
}

function subjectPhotoSrc(subject) {
  return subject?.photo_url || subject?.photo_data_url || "";
}

function calculateAge(birthDate) {
  const birth = parseDate(birthDate);
  if (!birth) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getUTCFullYear();
  const currentMonth = now.getMonth();
  const birthMonth = birth.getUTCMonth();
  if (currentMonth < birthMonth || (currentMonth === birthMonth && now.getDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

function formatGender(value) {
  if (value === "남" || value === "남성") return "남";
  if (value === "여" || value === "여성") return "여";
  return value || "-";
}
