"use client";

import { useMemo, useState } from "react";
import {
  AD_BILLING_DAY_OPTIONS,
  AD_RADIUS_UNIT_OPTIONS,
  calculateAdPrice,
  normalizeAdPricingSettings,
} from "../../lib/ad-pricing";
import {
  calculateMetaAdBudget,
  metaRegionTierLabel,
  normalizeMetaAdBudgetSettings,
} from "../../lib/meta-ad-budget";
import FormSubmitButton from "../form-submit-button";

export default function AdPricingForm({ setting, action }) {
  const initial = normalizeAdPricingSettings(setting);
  const [billingUnitDays, setBillingUnitDays] = useState(initial.billingUnitDays);
  const [basePrice, setBasePrice] = useState(initial.basePrice);
  const [defaultRadiusKm, setDefaultRadiusKm] = useState(initial.defaultRadiusKm);
  const [extraRadiusUnitKm, setExtraRadiusUnitKm] = useState(initial.extraRadiusUnitKm);
  const [extraRadiusPrice, setExtraRadiusPrice] = useState(initial.extraRadiusPrice);
  const initialMetaBudget = normalizeMetaAdBudgetSettings(setting);
  const [metaBaseDailyBudget, setMetaBaseDailyBudget] = useState(initialMetaBudget.baseDailyBudget);
  const [metaExtraRadiusDailyBudget, setMetaExtraRadiusDailyBudget] = useState(initialMetaBudget.extraRadiusDailyBudget);
  const [metaCapitalMultiplierPercent, setMetaCapitalMultiplierPercent] = useState(initialMetaBudget.capitalMultiplierPercent);
  const [metaMetroMultiplierPercent, setMetaMetroMultiplierPercent] = useState(initialMetaBudget.metroMultiplierPercent);
  const [metaLocalMultiplierPercent, setMetaLocalMultiplierPercent] = useState(initialMetaBudget.localMultiplierPercent);
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
  const metaExample = calculateMetaAdBudget({
    days: exampleDays,
    radiusKm: exampleRadiusKm,
    region: "서울특별시 중구",
    defaultRadiusKm: pricing.defaultRadiusKm,
    extraRadiusUnitKm: pricing.extraRadiusUnitKm,
    settings: {
      baseDailyBudget: metaBaseDailyBudget,
      extraRadiusDailyBudget: metaExtraRadiusDailyBudget,
      capitalMultiplierPercent: metaCapitalMultiplierPercent,
      metroMultiplierPercent: metaMetroMultiplierPercent,
      localMultiplierPercent: metaLocalMultiplierPercent,
    },
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

      <section className="ad-pricing-group" aria-labelledby="meta-budget-title">
        <div>
          <h2 id="meta-budget-title">Meta 광고 집행예산</h2>
          <p>
            보호자가 결제하는 금액과 별개로 Meta에 실제 집행할 예산을 계산합니다.
            기간, 선택 반경과 지역 가중치를 적용합니다.
          </p>
        </div>
        <div className="ad-pricing-inline-fields">
          <label>
            일 기본예산
            <span className="input-with-unit">
              <input
                name="metaBaseDailyBudget"
                type="number"
                min="100"
                step="100"
                value={metaBaseDailyBudget}
                onChange={(event) => setMetaBaseDailyBudget(Number(event.target.value))}
                required
              />
              <span>원</span>
            </span>
          </label>
          <label>
            초과 반경 단위별 일 추가예산
            <span className="input-with-unit">
              <input
                name="metaExtraRadiusDailyBudget"
                type="number"
                min="0"
                step="100"
                value={metaExtraRadiusDailyBudget}
                onChange={(event) => setMetaExtraRadiusDailyBudget(Number(event.target.value))}
                required
              />
              <span>원</span>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-pricing-group" aria-labelledby="meta-region-budget-title">
        <div>
          <h2 id="meta-region-budget-title">Meta 지역 가중치</h2>
          <p>도시명이 속한 권역에 따라 일 예산을 조정합니다. 100%는 추가 조정이 없는 기준입니다.</p>
        </div>
        <div className="ad-pricing-inline-fields three-columns">
          <label>
            수도권
            <span className="input-with-unit">
              <input
                name="metaCapitalMultiplierPercent"
                type="number"
                min="10"
                max="500"
                step="1"
                value={metaCapitalMultiplierPercent}
                onChange={(event) => setMetaCapitalMultiplierPercent(Number(event.target.value))}
                required
              />
              <span>%</span>
            </span>
          </label>
          <label>
            광역시·세종
            <span className="input-with-unit">
              <input
                name="metaMetroMultiplierPercent"
                type="number"
                min="10"
                max="500"
                step="1"
                value={metaMetroMultiplierPercent}
                onChange={(event) => setMetaMetroMultiplierPercent(Number(event.target.value))}
                required
              />
              <span>%</span>
            </span>
          </label>
          <label>
            일반지역
            <span className="input-with-unit">
              <input
                name="metaLocalMultiplierPercent"
                type="number"
                min="10"
                max="500"
                step="1"
                value={metaLocalMultiplierPercent}
                onChange={(event) => setMetaLocalMultiplierPercent(Number(event.target.value))}
                required
              />
              <span>%</span>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-pricing-example meta-budget-example" aria-live="polite">
        <div>
          <span>Meta 예산 계산식</span>
          <strong>(일 기본예산 + 초과 반경 단위 수 × 일 추가예산) × 기간 × 지역 가중치</strong>
        </div>
        <dl>
          <div><dt>예시 조건</dt><dd>서울특별시 / {exampleDays}일 / 반경 {exampleRadiusKm}km</dd></div>
          <div><dt>지역 구분</dt><dd>{metaRegionTierLabel(metaExample.regionTier)} {metaExample.regionMultiplierPercent}%</dd></div>
          <div><dt>Meta 일 예산</dt><dd>{formatCurrency(metaExample.dailyBudget)}</dd></div>
          <div className="total"><dt>Meta 총 집행예산</dt><dd>{formatCurrency(metaExample.amount)}</dd></div>
        </dl>
      </section>

      <FormSubmitButton className="action ad-pricing-save" pendingText="저장중">
        광고 결제·집행예산 설정 저장
      </FormSubmitButton>
    </form>
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
