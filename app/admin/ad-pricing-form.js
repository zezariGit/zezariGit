"use client";

import { useMemo, useState } from "react";
import FormSubmitButton from "../form-submit-button";

const DEFAULT_DISTANCES = [
  { id: "location-10", label: "위치 주변", radiusKm: 10, coverageType: "radius", description: "현재 위치 기준 10km 반경", price: 0, isActive: true },
  { id: "nearby-20", label: "인근 지역", radiusKm: 20, coverageType: "radius", description: "현재 위치 기준 20km 반경", price: 10000, isActive: true },
  { id: "city-40", label: "인접 도시", radiusKm: 40, coverageType: "radius", description: "현재 위치 기준 40km 반경", price: 30000, isActive: true },
  { id: "metro-80", label: "광역권", radiusKm: 80, coverageType: "radius", description: "현재 위치 기준 80km 반경", price: 70000, isActive: true },
  { id: "nationwide", label: "전국 확산", radiusKm: 80, coverageType: "country", description: "대한민국 전체 광고 노출", price: 100000, isActive: true },
];

const DEFAULT_DURATIONS = [
  { id: "duration-1", label: "1일", days: 1, description: "24시간", price: 10000, isActive: true },
  { id: "duration-3", label: "3일", days: 3, description: "72시간", price: 30000, isActive: true },
  { id: "duration-7", label: "7일", days: 7, description: "7일간", price: 70000, isActive: true },
  { id: "duration-14", label: "14일", days: 14, description: "14일간", price: 140000, isActive: true },
  { id: "duration-30", label: "30일", days: 30, description: "30일간", price: 300000, isActive: true },
];

export default function AdPricingForm({ setting, action }) {
  const [marginPercent, setMarginPercent] = useState(() => normalizeMarginPercent(setting));
  const [distanceOptions, setDistanceOptions] = useState(() => normalizeDistances(setting?.distanceOptions));
  const [durationOptions, setDurationOptions] = useState(() => normalizeDurations(setting?.durationOptions));
  const serializedDistances = useMemo(() => JSON.stringify(distanceOptions), [distanceOptions]);
  const serializedDurations = useMemo(() => JSON.stringify(durationOptions), [durationOptions]);
  const marginExample = useMemo(() => {
    const paymentAmount = 70000;
    const metaBudgetAmount = Math.floor(paymentAmount * (100 - marginPercent) / 100);
    return {
      paymentAmount,
      marginAmount: paymentAmount - metaBudgetAmount,
      metaBudgetAmount,
    };
  }, [marginPercent]);

  function updateDistance(index, key, value) {
    setDistanceOptions((current) => current.map((option, optionIndex) => (
      optionIndex === index ? { ...option, [key]: value } : option
    )));
  }

  function updateDuration(index, key, value) {
    setDurationOptions((current) => current.map((option, optionIndex) => (
      optionIndex === index ? { ...option, [key]: value } : option
    )));
  }

  function addDistance() {
    setDistanceOptions((current) => [
      ...current,
      {
        id: createOptionId("distance"),
        label: "새 거리 옵션",
        radiusKm: 10,
        coverageType: "radius",
        description: "현재 위치 기준 10km 반경",
        price: 0,
        isActive: true,
      },
    ]);
  }

  function addDuration() {
    setDurationOptions((current) => [
      ...current,
      {
        id: createOptionId("duration"),
        label: "새 기간 옵션",
        days: 1,
        description: "24시간",
        price: 10000,
        isActive: true,
      },
    ]);
  }

  return (
    <form className="ad-option-admin-form" action={action}>
      <input type="hidden" name="returnTo" value="/admin?section=ad-pricing" />
      <input type="hidden" name="metaMarginPercent" value={marginPercent} />
      <input type="hidden" name="distanceOptionsJson" value={serializedDistances} />
      <input type="hidden" name="durationOptionsJson" value={serializedDurations} />

      <section className="admin-panel ad-margin-settings">
        <header>
          <div>
            <h2>Meta 광고예산 마진율</h2>
            <p>보호자 결제금액에서 서비스 마진을 제외한 금액을 Meta 광고의 전체 기간 예산으로 편성합니다.</p>
          </div>
        </header>
        <div className="ad-margin-settings-body">
          <label>
            서비스 마진율
            <span className="ad-option-number-field percent">
              <input
                type="number"
                min="0"
                max="90"
                step="1"
                value={marginPercent}
                onChange={(event) => setMarginPercent(clampMarginPercent(event.target.value))}
                aria-label="서비스 마진율"
              />
              <span>%</span>
            </span>
          </label>
          <dl className="ad-margin-example">
            <div><dt>보호자 결제금액</dt><dd>{formatCurrency(marginExample.paymentAmount)}</dd></div>
            <div><dt>서비스 마진</dt><dd>{formatCurrency(marginExample.marginAmount)}</dd></div>
            <div className="total"><dt>Meta 집행예산</dt><dd>{formatCurrency(marginExample.metaBudgetAmount)}</dd></div>
          </dl>
        </div>
        <p className="ad-margin-policy-note">저장 후 새로 신청하는 광고부터 적용되며, 기존 결제·집행 광고의 예산은 변경되지 않습니다.</p>
      </section>

      <OptionGridSection
        title="광고 노출 거리"
        description="현재 위치 기준 반경 또는 대한민국 전체 노출 옵션을 관리합니다. 거리 금액은 기간 금액에 더해집니다."
        addLabel="거리 추가"
        onAdd={addDistance}
      >
        <div className="admin-table-wrap ad-option-grid-wrap">
          <table className="admin-data-table ad-option-grid">
            <thead>
              <tr>
                <th>순서</th>
                <th>옵션명</th>
                <th>범위 구분</th>
                <th>거리</th>
                <th>사용자 안내</th>
                <th>추가금액</th>
                <th>노출</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {distanceOptions.map((option, index) => (
                <tr key={option.id}>
                  <td>{index + 1}</td>
                  <td><input value={option.label} onChange={(event) => updateDistance(index, "label", event.target.value)} aria-label={`${index + 1}번 거리 옵션명`} /></td>
                  <td>
                    <select value={option.coverageType} onChange={(event) => updateDistance(index, "coverageType", event.target.value)} aria-label={`${option.label} 범위 구분`}>
                      <option value="radius">반경</option>
                      <option value="country">전국</option>
                    </select>
                  </td>
                  <td>
                    <span className="ad-option-number-field">
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={option.radiusKm}
                        disabled={option.coverageType === "country"}
                        onChange={(event) => updateDistance(index, "radiusKm", Number(event.target.value))}
                        aria-label={`${option.label} 거리`}
                      />
                      <span>km</span>
                    </span>
                  </td>
                  <td><input value={option.description} onChange={(event) => updateDistance(index, "description", event.target.value)} aria-label={`${option.label} 안내문`} /></td>
                  <td><PriceInput value={option.price} onChange={(value) => updateDistance(index, "price", value)} label={`${option.label} 추가금액`} /></td>
                  <td><CompactCheckbox checked={option.isActive} onChange={(checked) => updateDistance(index, "isActive", checked)} label={`${option.label} 사용자 노출`} /></td>
                  <td><button type="button" className="danger-button compact" onClick={() => setDistanceOptions((current) => current.filter((_, rowIndex) => rowIndex !== index))}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OptionGridSection>

      <OptionGridSection
        title="광고 기간"
        description="오늘을 시작일로 계산할 광고 일수와 기간 금액을 관리합니다. 사용자 화면에는 활성 옵션만 표시됩니다."
        addLabel="기간 추가"
        onAdd={addDuration}
      >
        <div className="admin-table-wrap ad-option-grid-wrap">
          <table className="admin-data-table ad-option-grid duration-grid">
            <thead>
              <tr>
                <th>순서</th>
                <th>옵션명</th>
                <th>광고 일수</th>
                <th>사용자 안내</th>
                <th>기간 금액</th>
                <th>노출</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {durationOptions.map((option, index) => (
                <tr key={option.id}>
                  <td>{index + 1}</td>
                  <td><input value={option.label} onChange={(event) => updateDuration(index, "label", event.target.value)} aria-label={`${index + 1}번 기간 옵션명`} /></td>
                  <td>
                    <span className="ad-option-number-field">
                      <input type="number" min="1" max="365" value={option.days} onChange={(event) => updateDuration(index, "days", Number(event.target.value))} aria-label={`${option.label} 광고 일수`} />
                      <span>일</span>
                    </span>
                  </td>
                  <td><input value={option.description} onChange={(event) => updateDuration(index, "description", event.target.value)} aria-label={`${option.label} 안내문`} /></td>
                  <td><PriceInput value={option.price} onChange={(value) => updateDuration(index, "price", value)} label={`${option.label} 기간 금액`} /></td>
                  <td><CompactCheckbox checked={option.isActive} onChange={(checked) => updateDuration(index, "isActive", checked)} label={`${option.label} 사용자 노출`} /></td>
                  <td><button type="button" className="danger-button compact" onClick={() => setDurationOptions((current) => current.filter((_, rowIndex) => rowIndex !== index))}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OptionGridSection>

      <div className="ad-option-save-bar">
        <p>마진율과 옵션 변경은 저장 버튼을 누른 뒤 반영되며, 저장 즉시 새 광고 신청 화면에 적용됩니다.</p>
        <FormSubmitButton className="action" pendingText="저장중">마진율·거리·기간 저장</FormSubmitButton>
      </div>
    </form>
  );
}

function OptionGridSection({ title, description, addLabel, onAdd, children }) {
  return (
    <section className="admin-panel ad-option-grid-section">
      <header>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button type="button" className="plain-button compact" onClick={onAdd}>+ {addLabel}</button>
      </header>
      {children}
    </section>
  );
}

function PriceInput({ value, onChange, label }) {
  return (
    <span className="ad-option-number-field price">
      <input type="number" min="0" step="100" value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label={label} />
      <span>원</span>
    </span>
  );
}

function CompactCheckbox({ checked, onChange, label }) {
  return (
    <label className="ad-option-checkbox">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{checked ? "노출" : "숨김"}</span>
      <i className="sr-only">{label}</i>
    </label>
  );
}

function normalizeDistances(rows) {
  const values = Array.isArray(rows) && rows.length > 0 ? rows : DEFAULT_DISTANCES;
  return values.map((row, index) => ({
    id: String(row.id || createOptionId(`distance-${index + 1}`)),
    label: String(row.label || ""),
    radiusKm: Number(row.radiusKm ?? row.radius_km ?? 10),
    coverageType: row.coverageType === "country" || row.coverage_type === "country" ? "country" : "radius",
    description: String(row.description || ""),
    price: Number(row.price || 0),
    isActive: row.isActive !== false && Number(row.is_active ?? 1) === 1,
  }));
}

function normalizeDurations(rows) {
  const values = Array.isArray(rows) && rows.length > 0 ? rows : DEFAULT_DURATIONS;
  return values.map((row, index) => ({
    id: String(row.id || createOptionId(`duration-${index + 1}`)),
    label: String(row.label || ""),
    days: Number(row.days || 1),
    description: String(row.description || ""),
    price: Number(row.price || 0),
    isActive: row.isActive !== false && Number(row.is_active ?? 1) === 1,
  }));
}

function createOptionId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMarginPercent(setting) {
  return clampMarginPercent(setting?.marginPercent ?? setting?.meta_margin_percent ?? 4);
}

function clampMarginPercent(value) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return 4;
  return Math.min(90, Math.max(0, number));
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
