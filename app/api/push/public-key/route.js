import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "../../../../lib/push";

export async function GET() {
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
