export const DEFAULT_SHOP_SHIPPING_SETTINGS = {
  shippingFee: 3500,
  freeShippingThreshold: 30000,
};

export function normalizeShopShippingSettings(value = {}) {
  return {
    shippingFee: normalizeAmount(value.shipping_fee ?? value.shippingFee, DEFAULT_SHOP_SHIPPING_SETTINGS.shippingFee),
    freeShippingThreshold: normalizeAmount(
      value.free_shipping_threshold ?? value.freeShippingThreshold,
      DEFAULT_SHOP_SHIPPING_SETTINGS.freeShippingThreshold
    ),
    updatedAt: value.updated_at || value.updatedAt || "",
  };
}

export function calculateShopShippingFee(subtotalAmount, settings = DEFAULT_SHOP_SHIPPING_SETTINGS) {
  const subtotal = Math.max(0, Math.floor(Number(subtotalAmount || 0)));
  const normalized = normalizeShopShippingSettings(settings);
  if (normalized.freeShippingThreshold > 0 && subtotal >= normalized.freeShippingThreshold) return 0;
  return normalized.shippingFee;
}

function normalizeAmount(value, fallback) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  return Math.max(0, Math.min(10000000, Math.floor(amount)));
}
