import { timingSafeEqual } from "crypto";
import { syncReviewingMetaAds } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const configuredSecret = String(process.env.CRON_SECRET || "").trim();
  if (!configuredSecret) {
    return Response.json({ ok: false, message: "스케줄러 인증키가 설정되지 않았습니다." }, { status: 503 });
  }

  const authorization = String(request.headers.get("authorization") || "");
  const providedSecret = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!secretsMatch(providedSecret, configuredSecret)) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const summary = await syncReviewingMetaAds();
  return Response.json({ ok: true, ...summary });
}

function secretsMatch(provided, configured) {
  const providedBuffer = Buffer.from(String(provided || ""));
  const configuredBuffer = Buffer.from(String(configured || ""));
  return providedBuffer.length === configuredBuffer.length
    && providedBuffer.length > 0
    && timingSafeEqual(providedBuffer, configuredBuffer);
}
