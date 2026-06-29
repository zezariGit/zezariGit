"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { isAdminSession } from "../../lib/admin";
import { authOptions } from "../../lib/auth";
import {
  generateQrCodes,
  createAdminPaymentRefund,
  getAdminMessageById,
  getAdminMessageRecipients,
  isDbAdminSession,
  markAdminMessageSent,
  saveAdminCoupon,
  saveAdminMessage,
  saveAdminMessageTemplate,
  setAdminSubjectAdMemo,
  setAdminSubjectAdStatus,
  setAdDailyRate,
  setGuardianActive,
  setGuardianAdminMemo,
  setGuardianAdmin,
  setProductCatalogItem,
  setProductOrderFulfillment,
  setQrAdminMemo,
  setQrActive,
  setQrLifecycle,
  setQrSubject,
  setSubscriptionAdminMemo,
  setSubscriptionPlanPrice,
} from "../../lib/db";
import { notifyGuardiansFromAdmin } from "../../lib/push";

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

export async function setGuardianAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setGuardianAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=guardians"), error.message || "관리 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=guardians"), "관리 메모가 저장되었습니다."));
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

export async function setQrLifecycleAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const lifecycle = String(formData.get("lifecycleStatus") || "");
  try {
    await setQrLifecycle(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 처리에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), lifecycle === "discarded" ? "QR이 폐기 처리되었습니다." : "QR 상태가 복구되었습니다."));
}

export async function setQrAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setQrAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), error.message || "QR 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=qr"), "QR 메모가 저장되었습니다."));
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
  redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), "이용권 가격이 저장되었습니다."));
}

export async function createAdminPaymentRefundAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await createAdminPaymentRefund(formData);
    revalidatePath("/admin");
    revalidatePath("/account/billing");
    revalidatePath("/account/ads");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), error.message || "취소/환불 처리에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=payments"), "취소/환불이 접수되었습니다."));
}

export async function saveAdminCouponAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await saveAdminCoupon(formData);
    revalidatePath("/admin");
    revalidatePath("/account/coupons");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=coupons"), error.message || "쿠폰 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=coupons"), "쿠폰 정보가 저장되었습니다."));
}

export async function saveAdminMessageAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const command = String(formData.get("command") || "save");
  let messageId = "";

  try {
    messageId = await saveAdminMessage(formData);
    if (command === "send") {
      const message = await getAdminMessageById(messageId);
      if (!message) throw new Error("저장된 알림 메시지를 찾을 수 없습니다.");
      const recipients = await getAdminMessageRecipients(message);
      const result = await notifyGuardiansFromAdmin({
        recipients,
        channel: message.channel,
        title: message.title,
        body: message.body || "",
        url: message.url || "/",
      });
      await markAdminMessageSent(messageId, result);
    }
    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=notifications"), error.message || "알림 메시지 저장에 실패했습니다.", "error"));
  }

  const message = command === "send" ? "알림 메시지를 발송했습니다." : "알림 메시지가 저장되었습니다.";
  redirect(withNotice(`/admin?section=notifications&message=${encodeURIComponent(messageId)}`, message));
}

export async function saveAdminMessageTemplateAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  let templateId = "";
  try {
    templateId = await saveAdminMessageTemplate(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=message-templates"), error.message || "메시지 템플릿 저장에 실패했습니다.", "error"));
  }

  redirect(withNotice(`/admin?section=message-templates&template=${encodeURIComponent(templateId)}`, "메시지 템플릿이 저장되었습니다."));
}

export async function setSubscriptionAdminMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setSubscriptionAdminMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), error.message || "구독 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=subscriptions"), "구독 메모가 저장되었습니다."));
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

export async function setAdminSubjectAdStatusAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  const command = String(formData.get("command") || "");
  const messages = {
    approve: "광고가 승인되었습니다.",
    pause: "광고가 정지되었습니다.",
    resume: "광고가 재개되었습니다.",
  };

  try {
    await setAdminSubjectAdStatus(formData);
    revalidatePath("/admin");
    revalidatePath("/account/ads");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), error.message || "광고 상태 변경에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), messages[command] || "광고 상태가 수정되었습니다."));
}

export async function setAdminSubjectAdMemoAction(formData) {
  const session = await getServerSession(authOptions);
  if (!(isAdminSession(session) || (await isDbAdminSession(session)))) throw new Error("관리자 권한이 필요합니다.");

  try {
    await setAdminSubjectAdMemo(formData);
    revalidatePath("/admin");
  } catch (error) {
    redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), error.message || "광고 메모 저장에 실패했습니다.", "error"));
  }
  redirect(withNotice(getReturnTo(formData, "/admin?section=ads"), "광고 메모가 저장되었습니다."));
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
