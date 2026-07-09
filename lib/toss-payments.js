import { getPublicBaseUrl } from "./db";
import { createHash } from "crypto";

const TOSS_API_BASE = "https://api.tosspayments.com";

export function getTossWidgetClientKey() {
  return String(process.env.TOSS_WIDGET_CLIENT_KEY || "").trim();
}

export function getTossWidgetSecretKey() {
  return String(process.env.TOSS_WIDGET_SECRET_KEY || "").trim();
}

export function isTossWidgetConfigured() {
  return Boolean(getTossWidgetClientKey() && getTossWidgetSecretKey());
}

export function createTossCustomerKey(value) {
  const digest = createHash("sha256").update(String(value || "guest")).digest("hex").slice(0, 32);
  return `guardian_${digest}`;
}

export function getTossCallbackUrls(productOrderId = "") {
  const baseUrl = getPublicBaseUrl();
  const query = productOrderId ? `?productOrderId=${encodeURIComponent(productOrderId)}` : "";
  return {
    successUrl: `${baseUrl}/payments/toss/subscription/success${query}`,
    failUrl: `${baseUrl}/payments/toss/subscription/fail${query}`,
  };
}

export function getTossProductCallbackUrls(productOrderId = "") {
  const baseUrl = getPublicBaseUrl();
  const query = productOrderId ? `?productOrderId=${encodeURIComponent(productOrderId)}` : "";
  return {
    successUrl: `${baseUrl}/payments/toss/product/success${query}`,
    failUrl: `${baseUrl}/payments/toss/product/fail${query}`,
  };
}

export function getTossAdCallbackUrls(adId = "") {
  const baseUrl = getPublicBaseUrl();
  const query = adId ? `?adId=${encodeURIComponent(adId)}` : "";
  return {
    successUrl: `${baseUrl}/payments/toss/ad/success${query}`,
    failUrl: `${baseUrl}/payments/toss/ad/fail${query}`,
  };
}

export async function confirmWidgetPayment({ paymentKey, orderId, amount }) {
  return tossPost("/v1/payments/confirm", {
    paymentKey,
    orderId,
    amount,
  }, getTossWidgetSecretKey());
}

async function tossPost(path, body, requestedSecretKey = "") {
  const secretKey = requestedSecretKey;
  if (!secretKey) throw new Error("Toss Payments secret key is missing.");

  const response = await fetch(`${TOSS_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || "Toss Payments API request failed.";
    const error = new Error(message);
    error.code = data?.code || `HTTP_${response.status}`;
    error.response = data;
    throw error;
  }

  return data;
}
