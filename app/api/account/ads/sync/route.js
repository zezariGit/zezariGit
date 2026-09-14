import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { syncGuardianSubjectAdLifecycle } from "../../../../../lib/db";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401, headers: NO_STORE_HEADERS });
  }

  try {
    const summary = await syncGuardianSubjectAdLifecycle(session);
    return Response.json({ ok: true, ...summary }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Advertisement lifecycle API sync failed", error);
    return Response.json(
      { ok: false, message: "광고 상태를 확인하지 못했습니다." },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
