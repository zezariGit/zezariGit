"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import {
  generateQrCodes,
  isDbAdminSession,
  setAdDailyRate,
  setGuardianActive,
  setGuardianAdmin,
  setProductCatalogItem,
  setProductOrderFulfillment,
  setQrActive,
  setQrSubject,
  setSubscriptionPlanPrice,
} from "../../lib/db";

export async function setGuardianActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianActive(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin"), error.message || "상태 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin"), "보호자 상태가 수정되었습니다."));
}

export async function generateQrCodesAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await generateQrCodes(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 생성에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), "QR 코드가 생성되었습니다."));
}

export async function setQrActiveAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setQrActive(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 상태 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), "QR 상태가 수정되었습니다."));
}

export async function setQrSubjectAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const hasSubject = Boolean(String(formData.get("subjectId") || "").trim());
  try {
    await setQrSubject(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 매칭 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), hasSubject ? "QR 매칭이 저장되었습니다." : "QR 매칭이 해제되었습니다."));
}

export async function setGuardianAdminAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianAdmin(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=admins"), error.message || "관리자 권한 수정에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=admins"), "관리자 권한이 수정되었습니다."));
}

export async function setSubscriptionPlanPriceAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setSubscriptionPlanPrice(formData);
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), error.message || "가격 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), "구독 가격이 저장되었습니다."));
}

export async function setProductCatalogItemAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setProductCatalogItem(formData);
    revalidatePath("/admin");
    revalidatePath("/shop");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=products"), error.message || "상품 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=products"), "상품 정보가 저장되었습니다."));
}

export async function setProductOrderFulfillmentAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setProductOrderFulfillment(formData);
    revalidatePath("/admin");
    revalidatePath("/account/billing");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=orders"), error.message || "배송 정보 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=orders"), "배송 정보가 저장되었습니다."));
}

export async function setAdDailyRateAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setAdDailyRate(formData);
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), error.message || "광고 단가 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), "광고 일 단가가 저장되었습니다."));
}

function getReturnTo(formData, fallback) {
  const value = String(formData.get("returnTo") || "").trim();
  return value && value.startsWith("/") ? value : fallback;
}

function withNotice(path, message, type = "success") {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.delete("assignQr");
  params.delete("guardianQuery");
  params.delete("subjectQuery");
  params.set("notice", message);
  params.set("noticeType", type);
  return `${base}?${params.toString()}`;
}
