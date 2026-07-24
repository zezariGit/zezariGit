import { createHmac } from "crypto";

const DEFAULT_META_API_VERSION = "v23.0";
const DEFAULT_CAMPAIGN_OBJECTIVE = "OUTCOME_AWARENESS";
const DEFAULT_OPTIMIZATION_GOAL = "REACH";
const DEFAULT_DESTINATION_URL = "https://zezari.vercel.app";

function getMetaMarketingConfig() {
  const accessToken = String(process.env.META_ACCESS_TOKEN || "").trim();
  const adAccountId = normalizeAdAccountId(process.env.META_AD_ACCOUNT_ID);
  const appSecret = String(process.env.META_APP_SECRET || "").trim();
  const pageId = String(process.env.META_PAGE_ID || "").trim();
  const apiVersion = normalizeApiVersion(process.env.META_API_VERSION || DEFAULT_META_API_VERSION);
  const campaignObjective = String(process.env.META_CAMPAIGN_OBJECTIVE || DEFAULT_CAMPAIGN_OBJECTIVE).trim();
  const optimizationGoal = String(process.env.META_OPTIMIZATION_GOAL || DEFAULT_OPTIMIZATION_GOAL).trim();

  return {
    accessToken,
    adAccountId,
    appSecret,
    pageId,
    apiVersion,
    campaignObjective: campaignObjective || DEFAULT_CAMPAIGN_OBJECTIVE,
    optimizationGoal: optimizationGoal || DEFAULT_OPTIMIZATION_GOAL,
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

function assertConfigured(config, { requirePage = false } = {}) {
  if (!config.accessToken || !config.adAccountId) {
    throw new Error("Meta Marketing API 환경변수가 필요합니다. META_ACCESS_TOKEN, META_AD_ACCOUNT_ID를 확인해 주세요.");
  }
  if (requirePage && !config.pageId) {
    throw new Error("Meta 광고 소재를 게시할 Facebook 페이지가 없습니다. 광고계정에 페이지를 연결하고 META_PAGE_ID를 설정해 주세요.");
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

function buildAdSetName(ad) {
  return `${buildCampaignName(ad)} ${Number(ad?.region_radius_km || 0)}km`.slice(0, 220);
}

function buildCreativeName(ad) {
  return `${buildCampaignName(ad)} 소재`.slice(0, 220);
}

function buildDestinationUrl(ad) {
  return String(ad?.qr_target_url || ad?.destination_url || DEFAULT_DESTINATION_URL).trim() || DEFAULT_DESTINATION_URL;
}

function buildPrimaryText(ad) {
  const name = String(ad?.subject_name || "관리대상").trim();
  const message = String(ad?.subject_guardian_message || "").trim();
  const region = String(ad?.region || "").trim();
  const parts = [
    `${name}님을 찾고 있습니다.`,
    region ? `${region} 인근에서 발견하시면 QR을 스캔해 보호자에게 알려주세요.` : "발견하시면 QR을 스캔해 보호자에게 알려주세요.",
    message,
  ].filter(Boolean);
  return parts.join("\n").slice(0, 1200);
}

async function metaPost(path, bodyParams) {
  const config = getMetaMarketingConfig();
  assertConfigured(config);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(bodyParams || {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  appendAuthParams(params, config);

  return metaFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  }, config);
}

async function metaPostImage(path, image) {
  const config = getMetaMarketingConfig();
  assertConfigured(config);

  const formData = new FormData();
  formData.set("filename", new Blob([image.buffer], { type: image.mimeType }), image.fileName);
  appendAuthParams(formData, config);

  return metaFetch(path, {
    method: "POST",
    body: formData,
  }, config);
}

async function metaFetch(path, options, config) {
  const url = `https://graph.facebook.com/${config.apiVersion}/${path.replace(/^\/+/, "")}`;
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    throw createMetaError(response.status, data?.error);
  }
  return data;
}

function createMetaError(status, metaError = {}) {
  const detailMessage = metaError.error_user_msg
    || metaError.message
    || `Meta Marketing API 요청에 실패했습니다. (${status})`;
  const title = metaError.error_user_title ? `${metaError.error_user_title}: ` : "";
  const code = metaError.code ? ` code=${metaError.code}` : "";
  const type = metaError.type ? ` type=${metaError.type}` : "";
  const error = new Error(`${title}${detailMessage}${code}${type}`);
  error.metaCode = Number(metaError.code || 0);
  error.metaType = metaError.type || "";
  error.metaSubcode = Number(metaError.error_subcode || 0);
  return error;
}

function parseCreativeImage(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!match) {
    throw new Error("Meta 광고용 미리보기 이미지가 없습니다. 광고 신청 화면에서 미리보기를 다시 생성해 주세요.");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) {
    throw new Error("Meta 광고용 이미지는 8MB 이하의 JPEG 또는 PNG 파일이어야 합니다.");
  }
  const mimeType = match[1].toLowerCase();
  return {
    buffer,
    mimeType,
    fileName: mimeType === "image/png" ? "zezari-missing-ad.png" : "zezari-missing-ad.jpg",
  };
}

function buildSchedule(ad) {
  const startDate = String(ad?.start_date || "").trim();
  const endDate = String(ad?.end_date || "").trim();
  const selectedStart = new Date(`${startDate}T00:00:00+09:00`);
  const selectedEnd = new Date(`${endDate}T23:59:59+09:00`);
  const earliestStart = new Date(Date.now() + 15 * 60 * 1000);
  const start = Number.isFinite(selectedStart.getTime()) && selectedStart > earliestStart ? selectedStart : earliestStart;
  if (!Number.isFinite(selectedEnd.getTime()) || selectedEnd <= start) {
    throw new Error("Meta 광고 종료일이 지났거나 광고 시작 시각보다 빠릅니다. 광고기간을 다시 신청해 주세요.");
  }
  return {
    startTime: start.toISOString(),
    endTime: selectedEnd.toISOString(),
  };
}

async function uploadMetaAdImage(ad) {
  const config = getMetaMarketingConfig();
  const image = parseCreativeImage(ad?.creative_image_data_url);
  const result = await metaPostImage(`${config.adAccountId}/adimages`, image);
  const uploaded = Object.values(result?.images || {})[0];
  const hash = String(uploaded?.hash || "").trim();
  if (!hash) throw new Error("Meta 광고 이미지 업로드 결과에서 이미지 해시를 확인할 수 없습니다.");
  return hash;
}

export function isMetaApiAccessBlocked(error) {
  return Number(error?.metaCode || 0) === 200 && /API access blocked/i.test(String(error?.message || ""));
}

export async function createMetaAdvertisementForSubjectAd(ad, { status = "ACTIVE" } = {}) {
  const config = getMetaMarketingConfig();
  assertConfigured(config, { requirePage: true });

  const requestedStatus = String(status || "ACTIVE").toUpperCase() === "PAUSED" ? "PAUSED" : "ACTIVE";
  const targeting = buildMetaCustomLocationTargeting(ad);
  if (!targeting) {
    throw new Error("Meta 광고 지역의 위도, 경도, 반경을 확인해 주세요.");
  }
  const destinationUrl = buildDestinationUrl(ad);
  const schedule = buildSchedule(ad);
  const lifetimeBudget = Math.floor(Number(ad?.meta_budget_amount || 0));
  if (!Number.isFinite(lifetimeBudget) || lifetimeBudget < 1) {
    throw new Error("Meta 집행예산을 확인해 주세요. 보호자 결제금액과 별도로 책정된 예산이 필요합니다.");
  }

  const result = {
    campaignId: "",
    adSetId: "",
    creativeId: "",
    adId: "",
    imageHash: "",
    metaStatus: "meta_publish_preparing",
  };

  try {
    result.imageHash = await uploadMetaAdImage(ad);

    const campaign = await metaPost(`${config.adAccountId}/campaigns`, {
      name: buildCampaignName(ad),
      buying_type: "AUCTION",
      objective: config.campaignObjective,
      status: "PAUSED",
      special_ad_categories: [],
      is_adset_budget_sharing_enabled: false,
    });
    result.campaignId = String(campaign.id || "");

    const adSet = await metaPost(`${config.adAccountId}/adsets`, {
      name: buildAdSetName(ad),
      campaign_id: result.campaignId,
      billing_event: "IMPRESSIONS",
      optimization_goal: config.optimizationGoal,
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      lifetime_budget: lifetimeBudget,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      targeting,
      destination_type: "WEBSITE",
      status: "PAUSED",
    });
    result.adSetId = String(adSet.id || "");

    const creative = await metaPost(`${config.adAccountId}/adcreatives`, {
      name: buildCreativeName(ad),
      object_story_spec: {
        page_id: config.pageId,
        link_data: {
          image_hash: result.imageHash,
          link: destinationUrl,
          message: buildPrimaryText(ad),
          name: "실종자를 찾습니다",
          description: "QR을 스캔하면 보호자에게 발견 위치를 알릴 수 있습니다.",
          call_to_action: {
            type: "LEARN_MORE",
            value: { link: destinationUrl },
          },
        },
      },
    });
    result.creativeId = String(creative.id || "");

    const createdAd = await metaPost(`${config.adAccountId}/ads`, {
      name: buildCampaignName(ad),
      adset_id: result.adSetId,
      creative: { creative_id: result.creativeId },
      status: "PAUSED",
    });
    result.adId = String(createdAd.id || "");

    if (requestedStatus === "ACTIVE") {
      await updateMetaAdvertisementStatus(result, "ACTIVE");
      result.metaStatus = "ad_active";
    } else {
      result.metaStatus = "ad_paused";
    }
    return result;
  } catch (error) {
    error.metaPublication = result;
    throw error;
  }
}

export async function updateMetaAdvertisementStatus(ids, status) {
  const requestedStatus = String(status || "").toUpperCase() === "PAUSED" ? "PAUSED" : "ACTIVE";
  const campaignId = String(ids?.campaignId || ids?.meta_campaign_id || "").trim();
  const adSetId = String(ids?.adSetId || ids?.meta_adset_id || "").trim();
  const adId = String(ids?.adId || ids?.meta_ad_id || "").trim();
  if (!campaignId) {
    throw new Error("Meta 캠페인 ID가 없어 상태를 변경할 수 없습니다.");
  }

  await metaPost(campaignId, { status: requestedStatus });
  if (adSetId) await metaPost(adSetId, { status: requestedStatus });
  if (adId) await metaPost(adId, { status: requestedStatus });

  return {
    campaignId,
    adSetId,
    adId,
    creativeId: String(ids?.creativeId || ids?.meta_creative_id || "").trim(),
    imageHash: String(ids?.imageHash || ids?.meta_image_hash || "").trim(),
    metaStatus: adId
      ? (requestedStatus === "ACTIVE" ? "ad_active" : "ad_paused")
      : (requestedStatus === "ACTIVE" ? "campaign_active" : "campaign_paused"),
  };
}

export function buildMetaCustomLocationTargeting(ad) {
  const latitude = Number(ad?.region_latitude);
  const longitude = Number(ad?.region_longitude);
  const radius = Number(ad?.region_radius_km || 0);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radius) || radius < 1) {
    return null;
  }

  return {
    age_min: 18,
    geo_locations: {
      custom_locations: [
        {
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          radius: Math.min(80, Math.max(1, Math.floor(radius))),
          distance_unit: "kilometer",
        },
      ],
      location_types: ["home", "recent"],
    },
  };
}
