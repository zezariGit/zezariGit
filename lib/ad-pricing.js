export const DEFAULT_AD_PRICING = Object.freeze({
  billingUnitDays: 1,
  basePrice: 10000,
  defaultRadiusKm: 5,
  extraRadiusUnitKm: 2,
  extraRadiusPrice: 10000,
});

export const AD_BILLING_DAY_OPTIONS = Object.freeze(
  Array.from({ length: 30 }, (_, index) => index + 1),
);

export const AD_RADIUS_UNIT_OPTIONS = Object.freeze(
  Array.from({ length: 20 }, (_, index) => index + 1),
);

export function normalizeAdPricingSettings(value = {}) {
  return {
    billingUnitDays: positiveInteger(
      value.billingUnitDays ?? value.billing_unit_days,
      DEFAULT_AD_PRICING.billingUnitDays,
      30,
    ),
    basePrice: nonNegativeInteger(
      value.basePrice ?? value.daily_rate,
      DEFAULT_AD_PRICING.basePrice,
    ),
    defaultRadiusKm: positiveInteger(
      value.defaultRadiusKm ?? value.default_radius_km,
      DEFAULT_AD_PRICING.defaultRadiusKm,
      80,
    ),
    extraRadiusUnitKm: positiveInteger(
      value.extraRadiusUnitKm ?? value.extra_radius_unit_km,
      DEFAULT_AD_PRICING.extraRadiusUnitKm,
      20,
    ),
    extraRadiusPrice: nonNegativeInteger(
      value.extraRadiusPrice ?? value.extra_radius_price,
      DEFAULT_AD_PRICING.extraRadiusPrice,
    ),
  };
}

export function calculateAdPrice({ days, radiusKm, settings = {} }) {
  const pricing = normalizeAdPricingSettings(settings);
  const normalizedDays = positiveInteger(days, 1, 365);
  const normalizedRadius = positiveInteger(radiusKm, pricing.defaultRadiusKm, 80);
  const billingBlocks = Math.ceil(normalizedDays / pricing.billingUnitDays);
  const extraRadiusKm = Math.max(0, normalizedRadius - pricing.defaultRadiusKm);
  const extraRadiusUnits = Math.ceil(extraRadiusKm / pricing.extraRadiusUnitKm);
  const periodAmount = billingBlocks * pricing.basePrice;
  const rangeAmount = billingBlocks * extraRadiusUnits * pricing.extraRadiusPrice;

  return {
    ...pricing,
    days: normalizedDays,
    radiusKm: normalizedRadius,
    billingBlocks,
    extraRadiusKm,
    extraRadiusUnits,
    periodAmount,
    rangeAmount,
    amount: periodAmount + rangeAmount,
  };
}

export function buildAdRadiusOptions(settings = {}, maxRadiusKm = 80) {
  const pricing = normalizeAdPricingSettings(settings);
  const maxRadius = Math.max(pricing.defaultRadiusKm, Math.min(80, Number(maxRadiusKm) || 80));
  const values = [];

  for (
    let radius = pricing.defaultRadiusKm;
    radius <= maxRadius;
    radius += pricing.extraRadiusUnitKm
  ) {
    values.push(radius);
  }

  return values;
}

function positiveInteger(value, fallback, max) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(max, number);
}

function nonNegativeInteger(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}
