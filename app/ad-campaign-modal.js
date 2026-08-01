"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import FormSubmitButton from "./form-submit-button";
import ModalScrollLock from "./modal-scroll-lock";
import { formatDateOnly } from "../lib/date-format";
import {
  calculateMetaAdBudget,
  normalizeMetaAdBudgetSettings,
} from "../lib/meta-ad-budget";

const FALLBACK_DISTANCE_OPTIONS = [
  { id: "location-10", label: "위치 주변", radiusKm: 10, coverageType: "radius", description: "현재 위치 기준 10km 반경", price: 0 },
  { id: "nearby-20", label: "인근 지역", radiusKm: 20, coverageType: "radius", description: "현재 위치 기준 20km 반경", price: 10000 },
  { id: "city-40", label: "인접 도시", radiusKm: 40, coverageType: "radius", description: "현재 위치 기준 40km 반경", price: 30000 },
  { id: "metro-80", label: "광역권", radiusKm: 80, coverageType: "radius", description: "현재 위치 기준 80km 반경", price: 70000 },
  { id: "nationwide", label: "전국 확산", radiusKm: 80, coverageType: "country", description: "대한민국 전체 광고 노출", price: 100000 },
];

const FALLBACK_DURATION_OPTIONS = [
  { id: "duration-1", label: "1일", days: 1, description: "24시간", price: 10000 },
  { id: "duration-3", label: "3일", days: 3, description: "72시간", price: 30000 },
  { id: "duration-7", label: "7일", days: 7, description: "7일간", price: 70000 },
  { id: "duration-14", label: "14일", days: 14, description: "14일간", price: 140000 },
  { id: "duration-30", label: "30일", days: 30, description: "30일간", price: 300000 },
];

const statusLabels = {
  active: "광고중",
  paused: "일시정지",
  ready: "준비중",
  ended: "종료",
};

export default function AdCampaignModal({
  subject,
  pricing,
  createAction,
  pauseAction,
  resumeAction,
  endAction,
}) {
  const today = useMemo(() => getKstDateInputValue(), []);
  const distanceOptions = useMemo(() => normalizeDistanceOptions(pricing?.distanceOptions), [pricing]);
  const durationOptions = useMemo(() => normalizeDurationOptions(pricing?.durationOptions), [pricing]);
  const metaBudgetSettings = useMemo(() => normalizeMetaAdBudgetSettings(pricing), [pricing]);
  const [step, setStep] = useState("distance");
  const [distanceOptionId, setDistanceOptionId] = useState(distanceOptions[0]?.id || "");
  const [durationOptionId, setDurationOptionId] = useState(durationOptions[0]?.id || "");
  const [location, setLocation] = useState({ selected: false, lat: null, lng: null, label: "" });
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [capturePending, setCapturePending] = useState(false);
  const creativeRef = useRef(null);
  const creativeInputRef = useRef(null);
  const capturedSubmitRef = useRef(false);
  const selectedDistance = distanceOptions.find((option) => option.id === distanceOptionId) || distanceOptions[0];
  const selectedDuration = durationOptions.find((option) => option.id === durationOptionId) || durationOptions[0];
  const startDate = today;
  const endDate = addDaysToDateInput(today, Math.max(0, Number(selectedDuration?.days || 1) - 1));
  const regionLabel = selectedDistance?.coverageType === "country"
    ? "대한민국"
    : cleanRegionLabel(location.label);
  const quote = calculateOptionQuote(selectedDistance, selectedDuration);
  const metaBudget = calculateMetaAdBudget({
    days: quote.days,
    radiusKm: quote.radiusKm,
    region: regionLabel,
    defaultRadiusKm: Number(pricing?.defaultRadiusKm || 10),
    extraRadiusUnitKm: Number(pricing?.extraRadiusUnitKm || 10),
    settings: metaBudgetSettings,
  });
  const activeAd = ["active", "paused", "ready"].includes(subject?.ad_status || "");
  const canSubmit = Boolean(
    selectedDistance
      && selectedDuration
      && quote.amount > 0
      && (selectedDistance.coverageType === "country" || (location.selected && regionLabel)),
  );

  useEffect(() => {
    setStep("distance");
    setDistanceOptionId(distanceOptions[0]?.id || "");
    setDurationOptionId(durationOptions[0]?.id || "");
    setLocation({ selected: false, lat: null, lng: null, label: "" });
    setLocationMessage("");
  }, [subject?.id, distanceOptions, durationOptions]);

  if (!subject) return null;

  async function prepareCreativeImage(event) {
    if (capturedSubmitRef.current) {
      capturedSubmitRef.current = false;
      return;
    }

    event.preventDefault();
    const form = event.currentTarget;
    const submitter = event.nativeEvent.submitter;
    if (!creativeRef.current || !creativeInputRef.current || !canSubmit) return;

    setCapturePending(true);
    try {
      const node = creativeRef.current;
      const ratio = node.offsetWidth > 0 ? node.offsetHeight / node.offsetWidth : 1.25;
      const dataUrl = await toJpeg(node, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        quality: 0.9,
        canvasWidth: 1080,
        canvasHeight: Math.max(1080, Math.round(1080 * ratio)),
      });
      if (dataUrl.length > 1.8 * 1024 * 1024) throw new Error("광고 이미지 용량이 너무 큽니다.");
      creativeInputRef.current.value = dataUrl;
      capturedSubmitRef.current = true;
      form.requestSubmit(submitter || undefined);
    } catch (error) {
      window.alert(error?.message || "광고 미리보기 이미지를 생성하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setCapturePending(false);
    }
  }

  async function continueFromDistance() {
    if (!selectedDistance) return;
    if (selectedDistance.coverageType === "country") {
      setLocationMessage("대한민국 전체가 광고 노출 지역으로 설정됩니다.");
      setStep("duration");
      return;
    }
    if (location.selected) {
      setStep("duration");
      return;
    }
    if (!navigator.geolocation) {
      setLocationMessage("현재 브라우저에서는 위치 권한을 사용할 수 없습니다.");
      return;
    }

    setLocating(true);
    setLocationMessage("광고 중심이 될 현재 위치를 확인하고 있습니다.");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        let label = "현재 위치 기준";
        try {
          const response = await fetch(`/api/maps/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`, {
            cache: "no-store",
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok) label = cleanRegionLabel(data?.result?.label || data?.result?.address) || label;
        } catch {
          // Coordinates remain usable even when reverse geocoding is temporarily unavailable.
        }
        setLocation({ selected: true, lat, lng, label });
        setLocationMessage(`${label}을 중심으로 광고 노출 거리를 적용합니다.`);
        setLocating(false);
        setStep("duration");
      },
      () => {
        setLocating(false);
        setLocationMessage("위치 권한을 허용해야 선택한 거리 범위로 광고를 설정할 수 있습니다.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }

  return (
    <section className="modal-backdrop ad-modal-backdrop" aria-label="광고 신청" role="dialog" aria-modal="true">
      <ModalScrollLock />
      <div className="modal-surface ad-modal ad-option-modal" data-modal-surface>
        <header className="ad-option-modal-header">
          <div>
            <p className="intro-kicker">온라인 실종 광고 설정</p>
            <h2>{subject.name}</h2>
          </div>
          {!activeAd && <AdStepIndicator step={step} />}
        </header>

        {activeAd ? (
          <ActiveAdvertisement subject={subject} pauseAction={pauseAction} resumeAction={resumeAction} endAction={endAction} />
        ) : step === "distance" ? (
          <section className="ad-option-step" aria-labelledby="ad-distance-title">
            <div className="ad-option-step-title">
              <span className="ad-step-symbol" aria-hidden="true">km</span>
              <div><h3 id="ad-distance-title">광고 노출 거리 선택</h3><p>광고를 노출할 범위를 선택해 주세요.</p></div>
            </div>
            <div className="ad-choice-list" role="radiogroup" aria-label="광고 노출 거리">
              {distanceOptions.map((option) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={option.id === distanceOptionId}
                  className={`ad-choice-card${option.id === distanceOptionId ? " selected" : ""}`}
                  onClick={() => setDistanceOptionId(option.id)}
                  key={option.id}
                >
                  <span className="ad-choice-icon" aria-hidden="true">{option.coverageType === "country" ? "전국" : `${option.radiusKm}`}</span>
                  <span className="ad-choice-copy"><strong>{optionDisplayLabel(option)}</strong><small>{option.description}</small></span>
                  <span className="ad-choice-price">{option.price > 0 ? `+${formatCurrency(option.price)}` : "기본"}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
            {locationMessage && <p className="ad-location-permission-message" role="status">{locationMessage}</p>}
            <button type="button" className="action" onClick={continueFromDistance} disabled={!selectedDistance || locating}>
              {locating ? "현재 위치 확인중" : "다음"}
            </button>
          </section>
        ) : step === "duration" ? (
          <section className="ad-option-step" aria-labelledby="ad-duration-title">
            <div className="ad-option-step-title">
              <span className="ad-step-symbol" aria-hidden="true">일</span>
              <div><h3 id="ad-duration-title">광고 기간 선택</h3><p>오늘부터 광고를 진행할 기간을 선택해 주세요.</p></div>
            </div>
            <div className="ad-choice-list" role="radiogroup" aria-label="광고 기간">
              {durationOptions.map((option) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={option.id === durationOptionId}
                  className={`ad-choice-card${option.id === durationOptionId ? " selected" : ""}`}
                  onClick={() => setDurationOptionId(option.id)}
                  key={option.id}
                >
                  <span className="ad-choice-icon calendar" aria-hidden="true">{option.days}</span>
                  <span className="ad-choice-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
                  <span className="ad-choice-price">{formatCurrency(option.price)}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="ad-step-actions">
              <button type="button" className="plain-button" onClick={() => setStep("distance")}>이전</button>
              <button type="button" className="action" onClick={() => setStep("summary")} disabled={!selectedDuration}>다음</button>
            </div>
          </section>
        ) : (
          <form action={createAction} className="ad-request-form ad-preview-form" onSubmit={prepareCreativeImage}>
            <input type="hidden" name="subjectId" value={subject.id} />
            <input type="hidden" name="distanceOptionId" value={selectedDistance?.id || ""} />
            <input type="hidden" name="durationOptionId" value={selectedDuration?.id || ""} />
            <input type="hidden" name="region" value={regionLabel} />
            <input type="hidden" name="regionLatitude" value={location.selected ? location.lat : ""} />
            <input type="hidden" name="regionLongitude" value={location.selected ? location.lng : ""} />
            <input ref={creativeInputRef} type="hidden" name="creativeImageDataUrl" />

            <SelectionSummary
              subject={subject}
              distance={selectedDistance}
              duration={selectedDuration}
              locationLabel={regionLabel}
              quote={quote}
              startDate={startDate}
              endDate={endDate}
            />
            <MissingAdPreview
              creativeRef={creativeRef}
              subject={subject}
              quote={quote}
              startDate={startDate}
              endDate={endDate}
              regionLabel={regionLabel}
              distance={selectedDistance}
              metaBudget={metaBudget}
            />
            <div className="ad-preview-actions full-field">
              <button type="button" className="plain-button" onClick={() => setStep("duration")}>다시 선택</button>
              <FormSubmitButton className="action" pendingText="결제 준비중" disabled={!canSubmit || capturePending}>
                {capturePending ? "이미지 생성중" : `${formatCurrency(quote.amount)} 결제하기`}
              </FormSubmitButton>
            </div>
          </form>
        )}

        <div className="modal-footer">
          <a className="plain-button modal-close-button" href="/?tab=dashboard">닫기</a>
        </div>
      </div>
    </section>
  );
}

function AdStepIndicator({ step }) {
  const current = step === "distance" ? 1 : step === "duration" ? 2 : 3;
  return (
    <ol className="ad-step-indicator" aria-label={`광고 설정 ${current}단계`}>
      {["거리 선택", "기간 선택", "선택 확인"].map((label, index) => (
        <li className={current === index + 1 ? "active" : current > index + 1 ? "complete" : ""} key={label}>
          <span>{index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );
}

function ActiveAdvertisement({ subject, pauseAction, resumeAction, endAction }) {
  return (
    <div className="ad-current-panel">
      <div className="ad-current-summary">
        <span className={`ad-status-pill ${subject.ad_status}`}>{statusLabels[subject.ad_status] || "진행중"}</span>
        <strong>{formatCurrency(subject.ad_amount || 0)}</strong>
        <span>{formatDate(subject.ad_start_date)} ~ {formatDate(subject.ad_end_date)}</span>
        <span>{formatAdLocation(subject)}</span>
        <span>Meta API: {formatMetaStatus(subject.ad_meta_status)}</span>
      </div>
      <div className="ad-state-actions">
        {subject.ad_meta_preview_url ? <a className="primary-button compact ad-feed-link" href={subject.ad_meta_preview_url} target="_blank" rel="noreferrer">광고 피드 보기</a> : null}
        {subject.ad_status === "active" && <form action={pauseAction}><input type="hidden" name="adId" value={subject.ad_id} /><FormSubmitButton className="activate-button" pendingText="정지중">일시정지</FormSubmitButton></form>}
        {subject.ad_status === "paused" && <form action={resumeAction}><input type="hidden" name="adId" value={subject.ad_id} /><FormSubmitButton className="activate-button" pendingText="재개중">광고 재개</FormSubmitButton></form>}
        <form action={endAction}><input type="hidden" name="adId" value={subject.ad_id} /><FormSubmitButton className="danger-button compact" pendingText="종료중">광고끝내기</FormSubmitButton></form>
      </div>
    </div>
  );
}

function SelectionSummary({ subject, distance, duration, locationLabel, quote, startDate, endDate }) {
  return (
    <section className="ad-selection-summary full-field" aria-label="선택 내역 요약">
      <h3>선택 내역 요약</h3>
      <div className="ad-selection-summary-main">
        <SummarySubject subject={subject} />
        <div><span>광고 거리</span><strong>{optionDisplayLabel(distance)}</strong><small>{locationLabel || "현재 위치"}</small></div>
        <div><span>광고 기간</span><strong>{duration?.label}</strong><small>{formatDate(startDate)} ~ {formatDate(endDate)}</small></div>
      </div>
      <div className="ad-selection-notes">
        <div><strong>예상 광고 노출 범위</strong><span>{distance?.coverageType === "country" ? "대한민국 전체에 광고가 노출됩니다." : `${locationLabel || "현재 위치"} 기준 ${distance?.radiusKm}km 반경 내 사용자에게 광고가 노출됩니다.`}</span></div>
        <div><strong>예상 광고 기간</strong><span>오늘부터 {duration?.description || `${quote.days}일간`} 광고가 진행됩니다.</span></div>
      </div>
      <dl className="ad-selection-price">
        <div><dt>기간 금액</dt><dd>{formatCurrency(quote.periodAmount)}</dd></div>
        <div><dt>거리 추가금액</dt><dd>{formatCurrency(quote.rangeAmount)}</dd></div>
        <div><dt>결제 예정금액</dt><dd>{formatCurrency(quote.amount)}</dd></div>
      </dl>
    </section>
  );
}

function SummarySubject({ subject }) {
  const photoSrc = subjectPhotoSrc(subject);
  return (
    <div className="ad-summary-subject">
      {photoSrc ? <img src={photoSrc} alt={`${subject.name} 사진`} /> : <span aria-hidden="true" />}
      <p><small>대상자</small><strong>{subject.name}</strong><em>{formatDate(subject.birth_date)}</em></p>
    </div>
  );
}

function MissingAdPreview({ creativeRef, subject, quote, startDate, endDate, regionLabel, distance, metaBudget }) {
  const photoSrc = subjectPhotoSrc(subject);
  const age = calculateAge(subject?.birth_date);
  const gender = formatGender(subject?.gender);
  const message = String(subject?.guardian_message || "").trim() || "보호자가 작성한 메시지가 이 영역에 표시됩니다.";
  const qrTargetUrl = subject?.qr_target_url || "";

  return (
    <section className="ad-preview-step full-field" aria-label="광고 미리보기">
      <div className="ad-preview-heading"><div><strong>광고 미리보기</strong><span>결제 후 이 화면을 이미지화해 Meta 광고 소재로 사용합니다.</span></div><em>{formatCurrency(quote.amount)}</em></div>
      <article ref={creativeRef} className="missing-ad-poster" data-ad-creative="missing-person-preview" data-subject-id={subject.id}>
        <header className="missing-ad-poster-header"><strong>실종자를 찾습니다</strong><span>여러분의 작은 제보가 가족을 만날 수 있게 합니다.</span></header>
        <div className="missing-ad-poster-body">
          <div className="missing-ad-photos">
            <div className="missing-ad-main-photo">{photoSrc ? <img src={photoSrc} alt={`${subject.name} 사진`} /> : <span aria-hidden="true" />}</div>
            <div className="missing-ad-thumb-row" aria-hidden="true">{[0, 1, 2].map((index) => <span key={index}>{photoSrc ? <img src={photoSrc} alt="" /> : null}</span>)}</div>
          </div>
          <div className="missing-ad-info">
            <dl><div><dt>이름</dt><dd>{subject.name || "-"}</dd></div><div><dt>나이</dt><dd>{age ? `${age}세` : "-"}</dd></div><div><dt>성별</dt><dd>{gender}</dd></div></dl>
            <div className="missing-ad-message"><strong>보호자 메시지</strong><p>{message}</p></div>
          </div>
        </div>
        <footer className="missing-ad-poster-footer">
          <div className="missing-ad-contact"><strong>발견즉시 연락부탁드립니다</strong><span>qr을 스캔하시면 보호자에게 연락할 수 있습니다</span></div>
          <div className="missing-ad-qr">{subject?.qr_image ? <img src={subject.qr_image} alt={`${subject.name} QR 코드`} /> : <span>QR</span>}</div>
          {qrTargetUrl ? <span className="missing-ad-direct-url">관리대상 페이지: {qrTargetUrl}</span> : null}
        </footer>
      </article>
      <div className="ad-preview-meta">
        <span>기간: {formatDate(startDate)} ~ {formatDate(endDate)} / {quote.days}일</span>
        <span>범위: {distance?.coverageType === "country" ? "대한민국 전체" : `${regionLabel} / 반경 ${distance?.radiusKm}km`}</span>
        <span>Meta 예상 집행예산: {formatCurrency(metaBudget.amount)} / 보호자 결제금액과 별도</span>
        {qrTargetUrl ? <a href={qrTargetUrl} target="_blank" rel="noreferrer">관리대상정보 페이지 열기</a> : <span>관리대상정보 링크는 QR 매칭 후 표시됩니다.</span>}
      </div>
    </section>
  );
}

function normalizeDistanceOptions(rows) {
  const values = Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK_DISTANCE_OPTIONS;
  return values
    .filter((row) => Number(row.is_active ?? 1) === 1)
    .map((row) => ({
      id: String(row.id || ""),
      label: String(row.label || ""),
      radiusKm: Number(row.radiusKm ?? row.radius_km ?? 10),
      coverageType: row.coverageType === "country" || row.coverage_type === "country" ? "country" : "radius",
      description: String(row.description || ""),
      price: Number(row.price || 0),
    }));
}

function normalizeDurationOptions(rows) {
  const values = Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK_DURATION_OPTIONS;
  return values
    .filter((row) => Number(row.is_active ?? 1) === 1)
    .map((row) => ({
      id: String(row.id || ""),
      label: String(row.label || ""),
      days: Number(row.days || 1),
      description: String(row.description || ""),
      price: Number(row.price || 0),
    }));
}

function calculateOptionQuote(distance, duration) {
  const periodAmount = Math.max(0, Number(duration?.price || 0));
  const rangeAmount = Math.max(0, Number(distance?.price || 0));
  return {
    days: Math.max(1, Number(duration?.days || 1)),
    radiusKm: Math.max(1, Number(distance?.radiusKm || 10)),
    periodAmount,
    rangeAmount,
    amount: periodAmount + rangeAmount,
  };
}

function optionDisplayLabel(option) {
  if (!option) return "-";
  return option.coverageType === "country" ? option.label : `${option.label} (${option.radiusKm}km)`;
}

function cleanRegionLabel(value) {
  return String(value || "").replace(/\s*\(-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?\)\s*$/, "").trim();
}

function getKstDateInputValue() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function addDaysToDateInput(value, days) {
  const date = parseDate(value);
  if (!date) return value;
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function parseDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function formatDate(value) {
  return formatDateOnly(value);
}

function formatAdLocation(subject) {
  if (subject?.ad_coverage_type === "country") return subject?.ad_distance_label || "대한민국 전체";
  const radius = Number(subject?.ad_region_radius_km || 0);
  if (subject?.ad_region && radius > 0) return `${subject.ad_region} / ${subject.ad_distance_label || `반경 ${radius}km`}`;
  return subject?.ad_region || "지역 미입력";
}

function formatMetaStatus(status) {
  if (status === "campaign_active") return "캠페인 활성";
  if (status === "campaign_paused") return "캠페인 일시정지";
  if (status === "ad_active") return "광고 활성";
  if (status === "ad_paused") return "광고 일시정지";
  if (status === "meta_publish_queued") return "자동 발행 대기";
  if (status === "meta_publish_preparing") return "자동 발행 중";
  if (status === "meta_publish_failed") return "발행 재시도 필요";
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
  if (now.getMonth() < birth.getUTCMonth() || (now.getMonth() === birth.getUTCMonth() && now.getDate() < birth.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

function formatGender(value) {
  if (value === "남" || value === "남성") return "남";
  if (value === "여" || value === "여성") return "여";
  return value || "-";
}
