"use client";

import { useMemo, useState } from "react";
import {
  AD_BILLING_DAY_OPTIONS,
  AD_RADIUS_UNIT_OPTIONS,
  calculateAdPrice,
  normalizeAdPricingSettings,
} from "../../lib/ad-pricing";
import FormSubmitButton from "../form-submit-button";

export default function AdPricingForm({ setting, action }) {
  const initial = normalizeAdPricingSettings(setting);
  const [billingUnitDays, setBillingUnitDays] = useState(initial.billingUnitDays);
  const [basePrice, setBasePrice] = useState(initial.basePrice);
  const [defaultRadiusKm, setDefaultRadiusKm] = useState(initial.defaultRadiusKm);
  const [extraRadiusUnitKm, setExtraRadiusUnitKm] = useState(initial.extraRadiusUnitKm);
  const [extraRadiusPrice, setExtraRadiusPrice] = useState(initial.extraRadiusPrice);
  const pricing = useMemo(
    () => normalizeAdPricingSettings({
      billingUnitDays,
      basePrice,
      defaultRadiusKm,
      extraRadiusUnitKm,
      extraRadiusPrice,
    }),
    [basePrice, billingUnitDays, defaultRadiusKm, extraRadiusPrice, extraRadiusUnitKm],
  );
  const exampleDays = 2;
  const exampleRadiusKm = pricing.defaultRadiusKm + pricing.extraRadiusUnitKm;
  const example = calculateAdPrice({
    days: exampleDays,
    radiusKm: exampleRadiusKm,
    settings: pricing,
  });

  return (
    <form className="ad-pricing-form" action={action}>
      <input type="hidden" name="returnTo" value="/admin?section=ad-pricing" />

      <section className="ad-pricing-group" aria-labelledby="ad-period-price-title">
        <div>
          <h2 id="ad-period-price-title">광고 기간 가격</h2>
          <p>선택한 일수 단위마다 기본 금액을 한 번씩 과금합니다.</p>
        </div>
        <div className="ad-pricing-inline-fields">
          <label>
            과금 일수
            <select
              name="billingUnitDays"
              value={billingUnitDays}
              onChange={(event) => setBillingUnitDays(Number(event.target.value))}
            >
              {AD_BILLING_DAY_OPTIONS.map((days) => (
                <option value={days} key={days}>{days}일</option>
              ))}
            </select>
          </label>
          <label>
            기본 금액
            <span className="input-with-unit">
              <input
                name="basePrice"
                type="number"
                min="100"
                step="100"
                value={basePrice}
                onChange={(event) => setBasePrice(Number(event.target.value))}
                required
              />
              <span>원</span>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-pricing-group" aria-labelledby="ad-radius-price-title">
        <div>
          <h2 id="ad-radius-price-title">광고 범위 가격</h2>
          <p>기본 반경까지는 기본 금액에 포함하고, 초과 범위는 설정한 단위마다 추가합니다.</p>
        </div>
        <div className="ad-pricing-inline-fields three-columns">
          <label>
            기본 광고 범위
            <span className="input-with-unit">
              <input
                name="defaultRadiusKm"
                type="number"
                min="1"
                max="80"
                step="1"
                value={defaultRadiusKm}
                onChange={(event) => setDefaultRadiusKm(Number(event.target.value))}
                required
              />
              <span>km</span>
            </span>
          </label>
          <label>
            초과 범위 단위
            <select
              name="extraRadiusUnitKm"
              value={extraRadiusUnitKm}
              onChange={(event) => setExtraRadiusUnitKm(Number(event.target.value))}
            >
              {AD_RADIUS_UNIT_OPTIONS.map((radius) => (
                <option value={radius} key={radius}>{radius}km</option>
              ))}
            </select>
          </label>
          <label>
            단위별 추가 금액
            <span className="input-with-unit">
              <input
                name="extraRadiusPrice"
                type="number"
                min="0"
                step="100"
                value={extraRadiusPrice}
                onChange={(event) => setExtraRadiusPrice(Number(event.target.value))}
                required
              />
              <span>원</span>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-pricing-example" aria-live="polite">
        <div>
          <span>계산식</span>
          <strong>과금 묶음 수 × (기본 금액 + 초과 범위 단위 수 × 추가 금액)</strong>
        </div>
        <dl>
          <div><dt>예시 조건</dt><dd>{exampleDays}일 / 반경 {exampleRadiusKm}km</dd></div>
          <div><dt>기간 기본금액</dt><dd>{formatCurrency(example.periodAmount)}</dd></div>
          <div><dt>범위 추가금액</dt><dd>{formatCurrency(example.rangeAmount)}</dd></div>
          <div className="total"><dt>예상 결제금액</dt><dd>{formatCurrency(example.amount)}</dd></div>
        </dl>
      </section>

      <FormSubmitButton className="action ad-pricing-save" pendingText="저장중">
        광고 결제 설정 저장
      </FormSubmitButton>
    </form>
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
