export const DEFAULT_META_AD_BUDGET = Object.freeze({
  baseDailyBudget: 5000,
  extraRadiusDailyBudget: 1000,
  capitalMultiplierPercent: 120,
  metroMultiplierPercent: 110,
  localMultiplierPercent: 100,
});

export function normalizeMetaAdBudgetSettings(value = {}) {
  return {
    baseDailyBudget: positiveInteger(
      value.baseDailyBudget ?? value.meta_base_daily_budget,
      DEFAULT_META_AD_BUDGET.baseDailyBudget,
    ),
    extraRadiusDailyBudget: nonNegativeInteger(
      value.extraRadiusDailyBudget ?? value.meta_extra_radius_daily_budget,
      DEFAULT_META_AD_BUDGET.extraRadiusDailyBudget,
    ),
    capitalMultiplierPercent: percentage(
      value.capitalMultiplierPercent ?? value.meta_capital_multiplier_percent,
      DEFAULT_META_AD_BUDGET.capitalMultiplierPercent,
    ),
    metroMultiplierPercent: percentage(
      value.metroMultiplierPercent ?? value.meta_metro_multiplier_percent,
      DEFAULT_META_AD_BUDGET.metroMultiplierPercent,
    ),
    localMultiplierPercent: percentage(
      value.localMultiplierPercent ?? value.meta_local_multiplier_percent,
      DEFAULT_META_AD_BUDGET.localMultiplierPercent,
    ),
  };
}

export function calculateMetaAdBudget({
  days,
  radiusKm,
  region,
  defaultRadiusKm = 5,
  extraRadiusUnitKm = 2,
  settings = {},
}) {
  const budget = normalizeMetaAdBudgetSettings(settings);
  const normalizedDays = boundedPositiveInteger(days, 1, 365);
  const normalizedRadius = boundedPositiveInteger(radiusKm, defaultRadiusKm, 80);
  const normalizedDefaultRadius = boundedPositiveInteger(defaultRadiusKm, 5, 80);
  const normalizedRadiusUnit = boundedPositiveInteger(extraRadiusUnitKm, 2, 20);
  const extraRadiusKm = Math.max(0, normalizedRadius - normalizedDefaultRadius);
  const extraRadiusUnits = Math.ceil(extraRadiusKm / normalizedRadiusUnit);
  const regionTier = classifyMetaRegion(region);
  const regionMultiplierPercent = multiplierForTier(regionTier, budget);
  const dailyBeforeRegion = budget.baseDailyBudget
    + (extraRadiusUnits * budget.extraRadiusDailyBudget);
  const dailyBudget = roundUpToHundred(
    dailyBeforeRegion * regionMultiplierPercent / 100,
  );
  const amount = roundUpToHundred(dailyBudget * normalizedDays);

  return {
    ...budget,
    days: normalizedDays,
    radiusKm: normalizedRadius,
    defaultRadiusKm: normalizedDefaultRadius,
    extraRadiusUnitKm: normalizedRadiusUnit,
    extraRadiusKm,
    extraRadiusUnits,
    regionTier,
    regionMultiplierPercent,
    dailyBeforeRegion,
    dailyBudget,
    amount,
  };
}

export function classifyMetaRegion(region) {
  const label = String(region || "").replace(/\s+/g, " ").trim();
  if (/서울|경기|인천/.test(label)) return "capital";
  if (/부산|대구|광주|대전|울산|세종/.test(label)) return "metro";
  return "local";
}

export function metaRegionTierLabel(tier) {
  if (tier === "capital") return "수도권";
  if (tier === "metro") return "광역시·세종";
  return "일반지역";
}

function multiplierForTier(tier, settings) {
  if (tier === "capital") return settings.capitalMultiplierPercent;
  if (tier === "metro") return settings.metroMultiplierPercent;
  return settings.localMultiplierPercent;
}

function roundUpToHundred(value) {
  const number = Math.max(0, Number(value) || 0);
  return Math.ceil(number / 100) * 100;
}

function boundedPositiveInteger(value, fallback, max) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(max, number);
}

function positiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1) return fallback;
  return number;
}

function nonNegativeInteger(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}

function percentage(value, fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 10 || number > 500) return fallback;
  return number;
}
