export const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
};

export function getRequestSecurityMeta(request) {
  const forwardedFor = String(request?.headers?.get("x-forwarded-for") || "");
  const ipAddress = (forwardedFor.split(",")[0] || request?.headers?.get("x-real-ip") || "unknown")
    .trim()
    .slice(0, 80);
  const userAgent = String(request?.headers?.get("user-agent") || "unknown").trim().slice(0, 300);
  return {
    ipAddress,
    userAgent,
    identity: `${ipAddress}|${userAgent}`,
  };
}
