import { createHmac } from "crypto";

const DEFAULT_META_API_VERSION = "v23.0";
const DEFAULT_CAMPAIGN_OBJECTIVE = "OUTCOME_AWARENESS";

function getMetaMarketingConfig() {
  const accessToken = String(process.env.META_ACCESS_TOKEN || "").trim();
  const adAccountId = normalizeAdAccountId(process.env.META_AD_ACCOUNT_ID);
  const appSecret = String(process.env.META_APP_SECRET || "").trim();
  const apiVersion = normalizeApiVersion(process.env.META_API_VERSION || DEFAULT_META_API_VERSION);
  const campaignObjective = String(process.env.META_CAMPAIGN_OBJECTIVE || DEFAULT_CAMPAIGN_OBJECTIVE).trim();

  return {
    accessToken,
    adAccountId,
    appSecret,
    apiVersion,
    campaignObjective: campaignObjective || DEFAULT_CAMPAIGN_OBJECTIVE,
  };
}

function normalizeApiVersion(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return DEFAULT_META_API_VERSION;
  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

function normalizeAdAccountId(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
}

function assertConfigured(config) {
  if (!config.accessToken || !config.adAccountId) {
    throw new Error("Meta Marketing API 환경변수가 필요합니다. META_ACCESS_TOKEN, META_AD_ACCOUNT_ID를 확인해 주세요.");
  }
}

function appendAuthParams(params, config) {
  params.set("access_token", config.accessToken);
  if (config.appSecret) {
    params.set("appsecret_proof", createHmac("sha256", config.appSecret).update(config.accessToken).digest("hex"));
  }
}

function buildCampaignName(ad) {
  const adNumber = ad?.ad_number || ad?.id || "AD";
  const subjectName = ad?.subject_name || "관리대상";
  const region = ad?.region || "지역미입력";
  return `ZEZARI ${adNumber} ${subjectName} ${region}`.slice(0, 220);
}

async function metaPost(path, bodyParams) {
  const config = getMetaMarketingConfig();
  assertConfigured(config);

  const url = `https://graph.facebook.com/${config.apiVersion}/${path.replace(/^\/+/, "")}`;
  const params = new URLSearchParams(bodyParams);
  appendAuthParams(params, config);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    const metaError = data?.error || {};
    const detailMessage = metaError.error_user_msg || metaError.message || `Meta Marketing API 요청에 실패했습니다. (${response.status})`;
    const title = metaError.error_user_title ? `${metaError.error_user_title}: ` : "";
    const message = `${title}${detailMessage}`;
    const code = metaError.code ? ` code=${metaError.code}` : "";
    const type = metaError.type ? ` type=${metaError.type}` : "";
    throw new Error(`${message}${code}${type}`);
  }

  return data;
}

export async function createMetaCampaignForSubjectAd(ad, { status = "ACTIVE" } = {}) {
  const config = getMetaMarketingConfig();
  assertConfigured(config);

  const requestedStatus = String(status || "ACTIVE").toUpperCase() === "PAUSED" ? "PAUSED" : "ACTIVE";
  const data = await metaPost(`${config.adAccountId}/campaigns`, {
    name: buildCampaignName(ad),
    buying_type: "AUCTION",
    objective: config.campaignObjective,
    status: requestedStatus,
    special_ad_categories: "[]",
    is_adset_budget_sharing_enabled: "false",
  });

  return {
    campaignId: data.id || "",
    metaStatus: requestedStatus === "ACTIVE" ? "campaign_active" : "campaign_paused",
  };
}

export async function updateMetaCampaignStatus(campaignId, status) {
  const trimmedCampaignId = String(campaignId || "").trim();
  if (!trimmedCampaignId) {
    throw new Error("Meta 캠페인 ID가 없어 상태를 변경할 수 없습니다.");
  }

  const requestedStatus = String(status || "").toUpperCase() === "PAUSED" ? "PAUSED" : "ACTIVE";
  await metaPost(trimmedCampaignId, { status: requestedStatus });

  return {
    campaignId: trimmedCampaignId,
    metaStatus: requestedStatus === "ACTIVE" ? "campaign_active" : "campaign_paused",
  };
}
