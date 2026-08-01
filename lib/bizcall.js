import { createHash } from "crypto";

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_API_BASE_URL = "https://api.050bizcall.co.kr";
const BIZCALL_RESULT_MESSAGES = new Map([
  [1, "요청값을 확인해 주세요."],
  [2, "등록된 비즈콜 대리점 정보를 찾을 수 없습니다."],
  [4, "비즈콜 API 인증값이 올바르지 않습니다."],
  [6, "사용 가능한 050 번호가 없습니다."],
  [14, "비즈콜에 등록되지 않은 회원사입니다."],
  [15, "등록된 050 번호를 찾을 수 없습니다."],
  [16, "비즈콜 회원 정보를 확인해 주세요."],
  [17, "비즈콜 회원 인증에 실패했습니다."],
  [19, "비즈콜 API 인증에 실패했습니다."],
  [23, "비즈콜 요청 날짜가 만료되었습니다."],
  [24, "해당 전화번호는 안심번호에 등록할 수 없습니다."],
  [100, "비즈콜 데이터베이스 처리에 실패했습니다."],
  [101, "비즈콜 시스템 처리에 실패했습니다."],
]);

export class BizcallApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "BizcallApiError";
    this.code = details.code ?? null;
    this.status = details.status ?? null;
  }
}

export function getBizcallConfigStatus() {
  const enabledValue = String(process.env.BIZCALL_ENABLED || "true").trim().toLowerCase();
  const enabled = !["0", "false", "off", "no"].includes(enabledValue);
  const configuredApiBaseUrl = String(process.env.BIZCALL_API_BASE_URL || "").trim();
  const apiBaseUrl = (configuredApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const interfaceId = String(process.env.BIZCALL_INTERFACE_ID || "").trim();
  const missing = [];

  if (!interfaceId) missing.push("BIZCALL_INTERFACE_ID");

  return {
    enabled,
    configured: enabled && missing.length === 0,
    apiBaseUrl,
    apiBaseUrlSource: configuredApiBaseUrl ? "environment" : "default",
    interfaceId,
    missing,
  };
}

export function isBizcallConfigured() {
  return getBizcallConfigStatus().configured;
}

export function createBizcallAuth(interfaceId, value) {
  return createHash("md5")
    .update(`${String(interfaceId || "")}${String(value || "")}`, "utf8")
    .digest("base64");
}

export function formatBizcallSafePhone(value) {
  const digits = digitsOnly(value);
  if (/^050\d{9}$/.test(digits)) {
    return digits.replace(/^(\d{4})(\d{4})(\d{4})$/, "$1-$2-$3");
  }
  if (/^050\d{8}$/.test(digits)) {
    return digits.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
  }
  return String(value || "").trim();
}

export async function assignBizcallSafePhone({ phone, guardianId }) {
  const config = requireBizcallConfig();
  const realNumber = normalizeRealNumber(phone);
  const result = await requestBizcall("/link/auto_mapp.do", {
    iid: config.interfaceId,
    rn: realNumber,
    memo: String(guardianId || "").slice(0, 100),
    memo2: "REAL_QR_FIND",
    auth: createBizcallAuth(config.interfaceId, realNumber),
  }, config);
  const virtualNumber = normalizeVirtualNumber(result.vn);

  return {
    safePhone: formatBizcallSafePhone(virtualNumber),
    rawSafePhone: virtualNumber,
  };
}

export async function remapBizcallSafePhone({ safePhone, phone, guardianId }) {
  const config = requireBizcallConfig();
  const virtualNumber = normalizeVirtualNumber(safePhone);
  const realNumber = normalizeRealNumber(phone);
  await requestBizcall("/link/set_vn.do", {
    iid: config.interfaceId,
    vn: virtualNumber,
    rn: realNumber,
    memo: String(guardianId || "").slice(0, 100),
    memo2: "REAL_QR_FIND",
    switch_yn: "Y",
    auth: createBizcallAuth(config.interfaceId, virtualNumber),
  }, config);

  return {
    safePhone: formatBizcallSafePhone(virtualNumber),
    rawSafePhone: virtualNumber,
  };
}

export async function leaseBizcallSafePhone({
  safePhone,
  phone,
  guardianId,
  subjectId,
  leaseHours = 24,
}) {
  const config = requireBizcallConfig();
  const virtualNumber = normalizeVirtualNumber(safePhone);
  const realNumber = normalizeRealNumber(phone);
  const normalizedLeaseHours = Math.min(168, Math.max(1, Math.floor(Number(leaseHours) || 24)));
  const assignmentMemo = [guardianId, subjectId].filter(Boolean).join(":").slice(0, 100);

  await requestBizcall("/link/auto_expire_update.do", {
    iid: config.interfaceId,
    vn: virtualNumber,
    rn: realNumber,
    expire_hour: normalizedLeaseHours,
    memo: assignmentMemo,
    memo2: "REAL_QR_FIND_POOL",
    auth: createBizcallAuth(config.interfaceId, virtualNumber),
  }, config);

  return {
    safePhone: formatBizcallSafePhone(virtualNumber),
    rawSafePhone: virtualNumber,
    leaseHours: normalizedLeaseHours,
  };
}

export async function releaseBizcallSafePhone({ safePhone, guardianId }) {
  const config = requireBizcallConfig();
  const virtualNumber = normalizeVirtualNumber(safePhone);
  await requestBizcall("/link/set_vn.do", {
    iid: config.interfaceId,
    vn: virtualNumber,
    rn: " ",
    memo: String(guardianId || "").slice(0, 100),
    memo2: "REAL_QR_FIND_RELEASED",
    switch_yn: "N",
    auth: createBizcallAuth(config.interfaceId, virtualNumber),
  }, config);

  return {
    safePhone: formatBizcallSafePhone(virtualNumber),
  };
}

function requireBizcallConfig() {
  const config = getBizcallConfigStatus();
  if (!config.enabled) {
    throw new BizcallApiError("비즈콜 안심번호 연동이 비활성화되어 있습니다.");
  }
  if (!config.configured) {
    throw new BizcallApiError(`비즈콜 환경변수 설정이 필요합니다: ${config.missing.join(", ")}`);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(config.apiBaseUrl);
  } catch {
    throw new BizcallApiError("BIZCALL_API_BASE_URL 형식을 확인해 주세요.");
  }
  if (parsedUrl.protocol !== "https:") {
    throw new BizcallApiError("비즈콜 API는 HTTPS 주소만 사용할 수 있습니다.");
  }
  if (config.interfaceId.length > 20) {
    throw new BizcallApiError("BIZCALL_INTERFACE_ID는 20자 이하여야 합니다.");
  }
  return config;
}

async function requestBizcall(pathname, parameters, config) {
  const timeoutValue = Number(process.env.BIZCALL_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(timeoutValue)
    ? Math.min(Math.max(timeoutValue, 1000), 30000)
    : DEFAULT_TIMEOUT_MS;
  const endpoint = new URL(pathname, `${config.apiBaseUrl}/`);
  const body = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  });

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const message = error?.name === "TimeoutError"
      ? "비즈콜 API 응답 시간이 초과되었습니다."
      : "비즈콜 API에 연결하지 못했습니다.";
    throw new BizcallApiError(message);
  }

  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new BizcallApiError("비즈콜 API가 올바른 JSON 응답을 반환하지 않았습니다.", {
      status: response.status,
    });
  }

  const code = Number(result?.rt);
  if (!response.ok || code !== 0) {
    const providerReason = String(result?.rs || "").trim();
    const message = BIZCALL_RESULT_MESSAGES.get(code)
      || providerReason
      || `비즈콜 API 요청에 실패했습니다. (${Number.isFinite(code) ? code : response.status})`;
    throw new BizcallApiError(message, {
      code: Number.isFinite(code) ? code : null,
      status: response.status,
    });
  }

  return result;
}

function normalizeRealNumber(value) {
  const digits = digitsOnly(value);
  if (!/^\d{8,15}$/.test(digits)) {
    throw new BizcallApiError("안심번호에 연결할 전화번호 형식을 확인해 주세요.");
  }
  return digits;
}

function normalizeVirtualNumber(value) {
  const digits = digitsOnly(value);
  if (!/^050\d{8,9}$/.test(digits)) {
    throw new BizcallApiError("비즈콜에서 반환한 050 번호 형식을 확인해 주세요.");
  }
  return digits;
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}
