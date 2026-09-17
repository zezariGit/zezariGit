import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { registerGuardianCoupon } from "../../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const formData = new FormData();
  formData.set("code", String(body.code || ""));

  try {
    const coupon = await registerGuardianCoupon(session, formData);
    return NextResponse.json({ coupon });
  } catch (error) {
    return NextResponse.json(
      { message: checkoutCouponErrorMessage(error) },
      { status: 400 }
    );
  }
}

function checkoutCouponErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("이미 등록")) return "이미 등록된 쿠폰입니다.";
  if (message.includes("로그인")) return message;
  return "유효한 쿠폰코드가 아닙니다";
}
