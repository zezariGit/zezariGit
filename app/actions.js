"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import {
  activateQrForGuardian,
  createSubjectAd,
  deleteSubject,
  endSubjectAd,
  pauseSubjectAd,
  registerGuardianCoupon,
  resumeSubjectAd,
  saveGuardianPaymentMethod,
  saveGuardianProfile,
  saveSubject,
  getActiveQrSignupClaim,
} from "../lib/db";
import {
  QR_SIGNUP_CLAIM_COOKIE,
  decodeQrSignupClaim,
  hashQrSignupClaimToken,
} from "../lib/qr-signup-claim";

export async function saveGuardianAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await saveGuardianProfile(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=guardian", error.message || "필수값을 확인해주세요.", "error"));
  }
  redirect(withNotice("/?tab=guardian", "보호자 정보가 저장되었습니다. 안심번호는 QR 접근 시 24시간 자동 배정됩니다."));
}

export async function saveSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  const cookieStore = await cookies();
  const rawQrClaim = cookieStore.get(QR_SIGNUP_CLAIM_COOKIE)?.value || "";
  const subjectId = String(formData.get("subjectId") || "").trim();
  const subjectRoute = subjectId
    ? `/?tab=subjects&editSubject=${encodeURIComponent(subjectId)}`
    : "/?tab=subjects&mode=new";
  let result;
  try {
    let qrSignupClaim = null;
    if (rawQrClaim) {
      const parsed = decodeQrSignupClaim(rawQrClaim);
      if (!parsed) {
        cookieStore.delete(QR_SIGNUP_CLAIM_COOKIE);
        throw new Error("QR 연결 정보가 올바르지 않습니다. 미배정 QR을 다시 스캔해 주세요.");
      }
      const tokenHash = hashQrSignupClaimToken(parsed.token);
      const activeClaim = await getActiveQrSignupClaim(parsed.publicKey, tokenHash);
      if (!activeClaim) {
        cookieStore.delete(QR_SIGNUP_CLAIM_COOKIE);
        throw new Error("QR 연결 시간이 만료되었습니다. 미배정 QR을 다시 스캔해 주세요.");
      }
      qrSignupClaim = { publicKey: parsed.publicKey, tokenHash };
    }

    result = await saveSubject(session, formData, { qrSignupClaim });
    if (result?.qrClaimConsumed) cookieStore.delete(QR_SIGNUP_CLAIM_COOKIE);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(subjectRoute, error.message || "필수값을 확인해주세요.", "error"));
  }
  if (result?.isNew) {
    const claimQuery = result.qrClaimConsumed ? "&qrClaimed=1" : "";
    const message = result.qrClaimConsumed
      ? "관리대상 등록과 스캔한 QR 연결이 완료되었습니다."
      : "관리대상 등록이 완료되었습니다.";
    redirect(withNotice(`/?tab=subjects&registered=${encodeURIComponent(result.subjectId)}${claimQuery}`, message));
  }
  redirect(withNotice(`/?tab=subjects&editSubject=${encodeURIComponent(result.subjectId)}`, "관리대상 정보가 수정되었습니다."));
}

export async function deleteSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await deleteSubject(session, formData);
    revalidatePath("/");
  } catch (error) {
    const subjectId = String(formData.get("subjectId") || "").trim();
    const returnTo = subjectId
      ? `/?tab=subjects&editSubject=${encodeURIComponent(subjectId)}`
      : "/?tab=dashboard&panel=my";
    redirect(withNotice(returnTo, error.message || "삭제하지 못했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard&panel=my", "관리대상 정보가 삭제되었습니다."));
}

export async function createSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  let result;
  try {
    result = await createSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 신청 정보를 확인해 주세요.", "error"));
  }
  redirect(withNotice(`/ads/checkout/${encodeURIComponent(result.id)}`, "광고 신청 정보가 저장되었습니다. 결제를 진행해 주세요."));
}

export async function pauseSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await pauseSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 일시정지에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 일시정지되었습니다."));
}

export async function resumeSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await resumeSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 재개에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 재개되었습니다."));
}

export async function endSubjectAdAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await endSubjectAd(session, formData);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice("/?tab=dashboard", error.message || "광고 종료에 실패했습니다.", "error"));
  }
  redirect(withNotice("/?tab=dashboard", "광고가 종료되었습니다."));
}

export async function activateQrAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  const publicKey = String(formData.get("publicKey") || "").trim();
  try {
    await activateQrForGuardian(session, publicKey);
    revalidatePath(`/find/${publicKey}`);
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(`/find/${publicKey}`, error.message || "QR 활성화에 실패했습니다.", "error"));
  }
  redirect(withNotice(`/find/${publicKey}`, "QR 코드가 활성화되었습니다. 이제 QR 안심 서비스를 이용할 수 있습니다."));
}

export async function registerCouponAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await registerGuardianCoupon(session, formData);
    revalidatePath("/account/coupons");
  } catch (error) {
    redirect(withNotice("/account/coupons", error.message || "쿠폰을 등록하지 못했습니다.", "error"));
  }
  redirect(withNotice("/account/coupons", "쿠폰이 등록되었습니다."));
}

export async function savePaymentMethodAction(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("로그인이 필요합니다.");
  try {
    await saveGuardianPaymentMethod(session, formData);
    revalidatePath("/account/payment-methods");
  } catch (error) {
    redirect(withNotice("/account/payment-methods", error.message || "결제수단을 저장하지 못했습니다.", "error"));
  }
  redirect(withNotice("/account/payment-methods", "결제수단 표시 정보가 저장되었습니다."));
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
