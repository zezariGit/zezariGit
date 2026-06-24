import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/auth";
import {
  createTossCustomerKey,
  getTossWidgetClientKey,
  isTossWidgetConfigured,
} from "../../../../../../lib/toss-payments";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const configured = isTossWidgetConfigured();
  return NextResponse.json({
    configured,
    clientKey: configured ? getTossWidgetClientKey() : "",
    customerKey: createTossCustomerKey(session.user?.id || session.user?.email),
  });
}
