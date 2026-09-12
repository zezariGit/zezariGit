"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormSubmitButton from "./form-submit-button";
import ModalScrollLock from "./modal-scroll-lock";
import { formatDateOnly } from "../lib/date-format";
import { sanitizeAdGuardianMessage } from "../lib/ad-creative-text";

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
  forceNew = false,
}) {
  const today = useMemo(() => getKstDateInputValue(), []);
  const distanceOptions = useMemo(() => normalizeDistanceOptions(pricing?.distanceOptions), [pricing]);
  const durationOptions = useMemo(() => normalizeDurationOptions(pricing?.durationOptions), [pricing]);
  const [distanceOptionId, setDistanceOptionId] = useState("");
  const [durationOptionId, setDurationOptionId] = useState("");
  const [location, setLocation] = useState({ selected: false, lat: null, lng: null, label: "" });
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [distanceOpen, setDistanceOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [capturePending, setCapturePending] = useState(false);
  const creativeInputRef = useRef(null);
  const capturedSubmitRef = useRef(false);
  const locationSearchRef = useRef(null);
  const distanceSelectRef = useRef(null);
  const durationSelectRef = useRef(null);
  const selectedDistance = distanceOptions.find((option) => option.id === distanceOptionId) || null;
  const selectedDuration = durationOptions.find((option) => option.id === durationOptionId) || null;
  const startDate = today;
  const endDate = addDaysToDateInput(today, Math.max(0, Number(selectedDuration?.days || 1) - 1));
  const regionLabel = selectedDistance?.coverageType === "country"
    ? "대한민국"
    : cleanRegionLabel(location.label);
  const quote = calculateOptionQuote(selectedDistance, selectedDuration);
  const activeAd = !forceNew && ["active", "paused", "ready"].includes(subject?.ad_status || "");
  const backHref = String(subject?.id || "").startsWith("preview-")
    ? "/missing-report?preview=1"
    : `/missing-report${subject?.id ? `?subject=${encodeURIComponent(subject.id)}` : ""}`;
  const regionComplete = selectedDistance?.coverageType === "country" || (location.selected && regionLabel);
  const canSubmit = Boolean(
    selectedDistance
      && selectedDuration
      && quote.amount > 0
      && regionComplete,
  );

  useEffect(() => {
    setDistanceOptionId("");
    setDurationOptionId("");
    setLocation({ selected: false, lat: null, lng: null, label: "" });
    setLocationQuery("");
    setLocationResults([]);
    setLocationMessage("");
    setShowErrors(false);
  }, [subject?.id]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (!locationSearchRef.current?.contains(event.target)) setLocationOpen(false);
      if (!distanceSelectRef.current?.contains(event.target)) setDistanceOpen(false);
      if (!durationSelectRef.current?.contains(event.target)) setDurationOpen(false);
    };
    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, []);

  useEffect(() => {
    const query = locationQuery.trim();
    if (selectedDistance?.coverageType === "country" || location.selected || query.length < 2) {
      setLocationResults([]);
      setLocationLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationLoading(true);
      setLocationMessage("");
      try {
        const response = await fetch(`/api/maps/search?query=${encodeURIComponent(query)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "지역 검색 결과를 불러오지 못했습니다.");
        const results = Array.isArray(data.results) ? data.results : [];
        setLocationResults(results);
        setLocationOpen(true);
        if (results.length === 0) setLocationMessage("검색 결과가 없습니다. 읍·면·동 단위로 다시 검색해 주세요.");
      } catch (error) {
        if (error.name !== "AbortError") setLocationMessage(error.message || "지역 검색 중 오류가 발생했습니다.");
      } finally {
        if (!controller.signal.aborted) setLocationLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [location.selected, locationQuery, selectedDistance?.coverageType]);

  if (!subject) return null;

  async function prepareCreativeImage(event) {
    if (capturedSubmitRef.current) {
      capturedSubmitRef.current = false;
      return;
    }

    event.preventDefault();
    const form = event.currentTarget;
    const submitter = event.nativeEvent.submitter;
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    if (!creativeInputRef.current) return;

    setCapturePending(true);
    try {
      const dataUrl = await createMissingAdCreativeImage(subject);
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

  function chooseLocation(result) {
    setLocation({ selected: true, lat: result.lat, lng: result.lng, label: result.label });
    setLocationQuery(result.label);
    setLocationResults([]);
    setLocationOpen(false);
    setLocationMessage("");
  }

  function changeLocationQuery(value) {
    setLocationQuery(value);
    setLocation({ selected: false, lat: null, lng: null, label: "" });
    setLocationOpen(value.trim().length >= 2);
    setLocationMessage("");
  }

  function chooseDistance(option) {
    setDistanceOptionId(option.id);
    setDistanceOpen(false);
    setDurationOpen(false);
  }

  function chooseDuration(option) {
    setDurationOptionId(option.id);
    setDurationOpen(false);
    setDistanceOpen(false);
  }

  return (
    <section className="modal-backdrop ad-modal-backdrop ad-setup-backdrop" aria-label="온라인 실종광고 설정" role="dialog" aria-modal="true">
      <ModalScrollLock />
      <div className="modal-surface ad-setup-page" data-modal-surface>
        <header className="ad-setup-topbar">
          <a href={backHref} aria-label="대상자 선택으로 돌아가기">‹</a>
          <h2>광고 세팅</h2>
          <span aria-hidden="true" />
        </header>

        {activeAd ? (
          <ActiveAdvertisement subject={subject} pauseAction={pauseAction} resumeAction={resumeAction} endAction={endAction} />
        ) : (
          <form action={createAction} className="ad-setup-form" onSubmit={prepareCreativeImage}>
            <input type="hidden" name="subjectId" value={subject.id} />
            <input type="hidden" name="distanceOptionId" value={selectedDistance?.id || ""} />
            <input type="hidden" name="durationOptionId" value={selectedDuration?.id || ""} />
            <input type="hidden" name="region" value={regionLabel} />
            <input type="hidden" name="regionLatitude" value={regionComplete && location.selected ? location.lat : ""} />
            <input type="hidden" name="regionLongitude" value={regionComplete && location.selected ? location.lng : ""} />
            <input ref={creativeInputRef} type="hidden" name="creativeImageDataUrl" />

            <section className="ad-setup-section" aria-labelledby="ad-setup-region-title">
              <AdSetupHeading number="1" id="ad-setup-region-title" title="지역 선택" description="광고 거리의 기준이 될 지역을 선택해 주세요." />
              <div className="ad-setup-location" ref={locationSearchRef}>
                <div className={`ad-setup-location-input${location.selected ? " selected" : ""}${selectedDistance?.coverageType === "country" ? " country" : ""}${showErrors && !regionComplete ? " invalid" : ""}`}>
                  <img src="/assets/ad-setup/위치핀.png" alt="" />
                  <input
                    value={locationQuery}
                    onChange={(event) => changeLocationQuery(event.target.value)}
                    onFocus={() => locationQuery.trim().length >= 2 && setLocationOpen(true)}
                    placeholder="지역명 또는 주소를 입력해 주세요"
                    disabled={selectedDistance?.coverageType === "country"}
                    aria-label="광고 기준 지역"
                    autoComplete="off"
                  />
                  {locationLoading ? <span className="ad-setup-spinner" aria-label="지역 검색 중" /> : location.selected ? <b aria-hidden="true">✓</b> : null}
                </div>
                {locationOpen && locationResults.length > 0 && (
                  <div className="ad-setup-location-results" role="listbox" aria-label="지역 검색 결과">
                    {locationResults.map((result) => (
                      <button type="button" role="option" aria-selected="false" onClick={() => chooseLocation(result)} key={result.id}>
                        <img src="/assets/ad-setup/위치핀.png" alt="" />
                        <span><strong>{result.label}</strong><small>{result.address}</small></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="ad-setup-helper">지역명 또는 주소를 읍/면/동 기준으로 검색해 주세요</p>
              {locationMessage && <p className="ad-setup-message" role="status">{locationMessage}</p>}
              {showErrors && !regionComplete && <p className="ad-setup-error">광고 기준 지역을 선택해 주세요.</p>}
            </section>

            <section className="ad-setup-section" aria-labelledby="ad-setup-distance-title">
              <AdSetupHeading number="2" id="ad-setup-distance-title" title="거리 선택" description="광고를 노출할 범위를 선택해 주세요." />
              <div className="ad-setup-select-wrap" ref={distanceSelectRef}>
                <button
                  className={`ad-setup-select-trigger${selectedDistance ? " selected" : ""}${showErrors && !selectedDistance ? " invalid" : ""}`}
                  type="button"
                  aria-expanded={distanceOpen}
                  onClick={() => { setDistanceOpen((open) => !open); setDurationOpen(false); setLocationOpen(false); }}
                >
                  <span>{selectedDistance ? distanceTriggerLabel(selectedDistance) : "거리를 선택해 주세요"}</span>
                  <b aria-hidden="true">⌄</b>
                </button>
                {distanceOpen && (
                  <div className="ad-setup-option-menu" role="radiogroup" aria-label="광고 거리">
                    {distanceOptions.map((option) => (
                      <button type="button" role="radio" aria-checked={option.id === distanceOptionId} onClick={() => chooseDistance(option)} key={option.id}>
                        <img src={distanceIcon(option)} alt="" />
                        <span><strong>{distanceOptionTitle(option)}</strong><small>{distanceOptionDescription(option)}</small></span>
                        {option.id === distanceOptionId && <b aria-hidden="true">✓</b>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {showErrors && !selectedDistance && <p className="ad-setup-error">광고 거리를 선택해 주세요.</p>}
            </section>

            <section className="ad-setup-section" aria-labelledby="ad-setup-duration-title">
              <AdSetupHeading number="3" id="ad-setup-duration-title" title="기간 선택" description="광고를 진행할 기간을 선택해 주세요." />
              <div className="ad-setup-select-wrap" ref={durationSelectRef}>
                <button
                  className={`ad-setup-select-trigger${selectedDuration ? " selected" : ""}${showErrors && !selectedDuration ? " invalid" : ""}`}
                  type="button"
                  aria-expanded={durationOpen}
                  onClick={() => { setDurationOpen((open) => !open); setDistanceOpen(false); setLocationOpen(false); }}
                >
                  <span>{selectedDuration?.label || "기간을 선택해 주세요"}</span>
                  <b aria-hidden="true">⌄</b>
                </button>
                {durationOpen && (
                  <div className="ad-setup-option-menu duration" role="radiogroup" aria-label="광고 기간">
                    {durationOptions.map((option) => (
                      <button type="button" role="radio" aria-checked={option.id === durationOptionId} onClick={() => chooseDuration(option)} key={option.id}>
                        <span><strong>{option.label}</strong></span>
                        {option.id === durationOptionId && <b aria-hidden="true">✓</b>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {showErrors && !selectedDuration && <p className="ad-setup-error">광고 기간을 선택해 주세요.</p>}
            </section>

            {canSubmit && (
              <section className="ad-setup-section ad-setup-summary" aria-labelledby="ad-setup-summary-title">
                <AdSetupHeading number="4" id="ad-setup-summary-title" title="선택 내역" />
                <div className="ad-setup-summary-card">
                  <AdSetupSummaryRow icon="대상자.png" label="대상자" value={subject.name} />
                  <AdSetupSummaryRow icon="광고지역.png" label="광고 기준 지역" value={regionLabel} />
                  <AdSetupSummaryRow icon="광고거리.png" label="광고 거리" value={selectedDistance.coverageType === "country" ? "전국" : `${selectedDistance.radiusKm}km`} />
                  <AdSetupSummaryRow icon="광고기간.png" label="광고 기간" value={selectedDuration.label} />
                </div>
              </section>
            )}

            <button
              className={`ad-setup-next${canSubmit ? "" : " disabled"}`}
              type="submit"
              aria-label={canSubmit ? "다음" : "다음, 필수 항목 선택 필요"}
              disabled={capturePending}
            >
              {capturePending ? "준비 중" : "다음"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function AdSetupHeading({ number, id, title, description = "" }) {
  return (
    <header className="ad-setup-heading">
      <h3 id={id}><span>{number}</span>{title}</h3>
      {description && <p>{description}</p>}
    </header>
  );
}

function AdSetupSummaryRow({ icon, label, value }) {
  return (
    <div>
      <img src={`/assets/ad-setup/${icon}`} alt="" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

function MissingAdPreview({ subject, quote, startDate, endDate, regionLabel, distance }) {
  const photoSrc = subjectPhotoSrc(subject);
  const age = calculateAge(subject?.birth_date);
  const gender = formatGender(subject?.gender);
  const message = sanitizeAdGuardianMessage(subject?.guardian_message) || "보호자가 작성한 메시지가 이 영역에 표시됩니다.";
  const qrTargetUrl = subject?.qr_target_url || "";

  return (
    <section className="ad-preview-step full-field" aria-label="광고 미리보기">
      <div className="ad-preview-heading"><div><strong>광고 미리보기</strong><span>결제 후 이 화면을 이미지화해 Meta 광고 소재로 사용합니다.</span></div><em>{formatCurrency(quote.amount)}</em></div>
      <article className="missing-ad-poster" data-ad-creative="missing-person-template" data-subject-id={subject.id}>
        <div className="missing-ad-template-photo">
          {photoSrc ? <img src={photoSrc} alt={`${subject.name} 사진`} /> : <span>사진 없음</span>}
        </div>
        <strong className="missing-ad-template-value name">{subject.name || "-"}</strong>
        <strong className="missing-ad-template-value age">{age ? `${age}세` : "-"}</strong>
        <strong className="missing-ad-template-value gender">{gender}</strong>
        <p className="missing-ad-template-message">{message}</p>
        <div className="missing-ad-template-qr">
          {subject?.qr_image ? <img src={subject.qr_image} alt={`${subject.name} QR 코드`} /> : <span>QR</span>}
        </div>
      </article>
      <div className="ad-preview-meta">
        <span>기간: {formatDate(startDate)} ~ {formatDate(endDate)} / {quote.days}일</span>
        <span>범위: {distance?.coverageType === "country" ? "대한민국 전체" : `${regionLabel} / 반경 ${distance?.radiusKm}km`}</span>
        {qrTargetUrl ? <a href={qrTargetUrl} target="_blank" rel="noreferrer">관리대상정보 페이지 열기</a> : <span>관리대상정보 링크는 QR 매칭 후 표시됩니다.</span>}
      </div>
    </section>
  );
}

async function createMissingAdCreativeImage(subject) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready.catch(() => null);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("광고 이미지 캔버스를 생성하지 못했습니다.");

  const photoSrc = subjectPhotoSrc(subject);
  const [template, photo, qr] = await Promise.all([
    loadCreativeImage("/assets/missing-ad-template.png", "실종광고 양식을 불러오지 못했습니다."),
    photoSrc ? loadCreativeImage(photoSrc, "관리대상 사진을 불러오지 못했습니다.") : Promise.resolve(null),
    subject?.qr_image ? loadCreativeImage(subject.qr_image, "관리대상 QR 코드를 불러오지 못했습니다.") : Promise.resolve(null),
  ]);

  context.drawImage(template, 0, 0, canvas.width, canvas.height);
  if (photo) {
    drawCoverImage(context, photo, 36, 396, 462, 558);
  } else {
    context.fillStyle = "#f3f4f6";
    context.fillRect(36, 396, 462, 558);
    drawCenteredText(context, "사진 없음", 267, 675, 52, 360, "#6b7280");
  }

  const age = calculateAge(subject?.birth_date);
  drawFittedText(context, String(subject?.name || "-"), 765, 431, 270, 62);
  drawFittedText(context, age ? `${age}세` : "-", 765, 575, 270, 62);
  drawFittedText(context, formatGender(subject?.gender), 765, 719, 270, 62);

  const guardianMessage = sanitizeAdGuardianMessage(subject?.guardian_message)
    || "보호자가 작성한 메시지가 이 영역에 표시됩니다.";
  drawWrappedText(context, guardianMessage, {
    x: 660,
    y: 842,
    maxWidth: 350,
    maxHeight: 154,
    fontSize: 35,
    minFontSize: 24,
    lineHeightRatio: 1.24,
    maxLines: 4,
  });

  if (qr) {
    context.fillStyle = "#ffffff";
    context.fillRect(58, 1079, 236, 236);
    drawContainImage(context, qr, 66, 1087, 220, 220);
  } else {
    context.fillStyle = "#ffffff";
    context.fillRect(58, 1079, 236, 236);
    drawCenteredText(context, "QR", 176, 1197, 54, 180, "#111827");
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadCreativeImage(src, errorMessage) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(errorMessage));
    image.src = src;
  });
}

function drawCoverImage(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = Math.max(0, (image.naturalWidth - sourceWidth) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) / 2);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawContainImage(context, image, x, y, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawFittedText(context, text, x, centerY, maxWidth, preferredSize) {
  let fontSize = preferredSize;
  context.fillStyle = "#111111";
  context.textAlign = "left";
  context.textBaseline = "middle";
  while (fontSize > 34) {
    context.font = `900 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    fontSize -= 2;
  }
  context.fillText(text, x, centerY, maxWidth);
}

function drawCenteredText(context, text, centerX, centerY, fontSize, maxWidth, color) {
  context.fillStyle = color;
  context.font = `800 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, centerX, centerY, maxWidth);
}

function drawWrappedText(context, text, options) {
  const words = Array.from(String(text || "").replace(/\s+/g, " ").trim());
  let fontSize = options.fontSize;

  while (fontSize >= options.minFontSize) {
    context.font = `800 ${fontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
    const lines = wrapCanvasCharacters(context, words, options.maxWidth);
    const lineHeight = fontSize * options.lineHeightRatio;
    if (lines.length <= options.maxLines && lines.length * lineHeight <= options.maxHeight) {
      context.fillStyle = "#111111";
      context.textAlign = "left";
      context.textBaseline = "top";
      lines.forEach((line, index) => context.fillText(line, options.x, options.y + index * lineHeight, options.maxWidth));
      return;
    }
    fontSize -= 2;
  }

  context.font = `800 ${options.minFontSize}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  const lines = wrapCanvasCharacters(context, words, options.maxWidth).slice(0, options.maxLines);
  if (lines.length === options.maxLines) {
    while (lines[lines.length - 1] && context.measureText(`${lines[lines.length - 1]}…`).width > options.maxWidth) {
      lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
    }
    lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
  }
  const lineHeight = options.minFontSize * options.lineHeightRatio;
  context.fillStyle = "#111111";
  context.textAlign = "left";
  context.textBaseline = "top";
  lines.forEach((line, index) => context.fillText(line, options.x, options.y + index * lineHeight, options.maxWidth));
}

function wrapCanvasCharacters(context, characters, maxWidth) {
  const lines = [];
  let line = "";
  characters.forEach((character) => {
    const candidate = `${line}${character}`;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line.trimEnd());
      line = character.trimStart();
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line.trimEnd());
  return lines;
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

function distanceTriggerLabel(option) {
  if (!option) return "거리를 선택해 주세요";
  if (option.coverageType === "country") return "전국 · 전국 단위";
  return `${option.radiusKm}km · ${distanceOptionDescription(option)}`;
}

function distanceOptionTitle(option) {
  return option.coverageType === "country" ? "전국" : `${option.radiusKm}km`;
}

function distanceOptionDescription(option) {
  if (option.coverageType === "country") return "전국 단위";
  if (option.radiusKm <= 10) return "위치 주변";
  if (option.radiusKm <= 20) return "인근 지역";
  if (option.radiusKm <= 40) return "인접 도시";
  return "광역권";
}

function distanceIcon(option) {
  if (option.coverageType === "country") return "/assets/ad-setup/준국.png";
  if (option.radiusKm <= 10) return "/assets/ad-setup/10km_위치주변.png";
  if (option.radiusKm <= 20) return "/assets/ad-setup/20km_인근지역.png";
  return "/assets/ad-setup/40km_인접도시.png";
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
